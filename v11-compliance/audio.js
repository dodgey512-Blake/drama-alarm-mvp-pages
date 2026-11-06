(function () {
  "use strict";

  class DramaAlarmAudio {
    constructor(presets) {
      this.presets = presets || [];
      this.context = null;
      this.master = null;
      this.compressor = null;
      this.ringBus = null;
      this.previewBus = null;
      this.fxBus = null;
      this.ringTimer = null;
      this.previewTimer = null;
      this.previewToken = 0;
      this.ringPreset = null;
      this.noiseBuffer = null;
      this.onPreviewEnd = null;
      this.ringGeneration = 0;
      this.lastError = null;
      this.assetBuffers = new Map();
      this.previewSources = new Set();
      this.ringSources = new Set();
      this.previewLoadController = null;
      this.ringLoadController = null;
      this.sampleLoadController = null;
    }

    async unlock() {
      try {
      this.lastError = null;
      if (!this.context && navigator.userActivation && !navigator.userActivation.hasBeenActive) {
        this.lastError = "user-gesture-required";
        return false;
      }
      if (this.context?.state === "closed") this.context = null;
      if (!this.context) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) { this.lastError = "web-audio-unavailable"; return false; }
        this.context = new Context({ latencyHint: "interactive" });
        this.context.addEventListener("statechange", () => {
          window.dispatchEvent(new CustomEvent("drama-audio-state", { detail: this.getStatus() }));
        });
        this.master = this.context.createGain();
        this.master.gain.value = 0.82;
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -20;
        this.compressor.knee.value = 18;
        this.compressor.ratio.value = 5;
        this.compressor.attack.value = 0.008;
        this.compressor.release.value = 0.22;
        this.ringBus = this.context.createGain();
        this.previewBus = this.context.createGain();
        this.fxBus = this.context.createGain();
        this.ringBus.gain.value = 0.0001;
        this.previewBus.gain.value = 0.0001;
        this.fxBus.gain.value = 0.62;
        this.ringBus.connect(this.compressor);
        this.previewBus.connect(this.compressor);
        this.fxBus.connect(this.compressor);
        this.compressor.connect(this.master).connect(this.context.destination);
      }
      if (this.context.state === "suspended" || this.context.state === "interrupted") {
        let timeout;
        try {
          await Promise.race([this.context.resume(), new Promise(resolve => { timeout = setTimeout(resolve, 1800); })]);
        } finally { clearTimeout(timeout); }
      }
      if (this.context.state !== "running") this.lastError = "playback-needs-attention";
      return this.context.state === "running";
      } catch (error) {
        this.lastError = String(error?.name || "audio-start-failed").slice(0, 80);
        return false;
      }
    }

    getStatus() {
      return {
        supported: Boolean(window.AudioContext || window.webkitAudioContext),
        state: this.context?.state || "not-started",
        engineReady: this.context?.state === "running" && !this.lastError,
        routeVerified: false,
        lastError: this.lastError,
      };
    }

    presetById(id) {
      return this.presets.find(preset => preset.id === id);
    }

    // Assets are local package resources, not remote streaming URLs. Keep a
    // small LRU of decoded buffers rather than retaining every stereo track.
    async loadAsset(id, lane, decoder = this.context) {
      const preset = this.presetById(id);
      if (!preset?.src) { this.lastError = "audio-file-unavailable"; return null; }
      const key = preset.src;
      const cached = this.assetBuffers.get(key);
      if (cached) {
        this.assetBuffers.delete(key);
        this.assetBuffers.set(key, cached);
        return cached;
      }
      const field = `${lane}LoadController`;
      this[field]?.abort();
      const controller = new AbortController();
      this[field] = controller;
      let timedOut = false;
      const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 10000);
      try {
        const response = await fetch(key, { credentials: "same-origin", signal: controller.signal });
        if (!response.ok) throw new Error(`audio-file-http-${response.status}`);
        const bytes = await response.arrayBuffer();
        if (controller.signal.aborted) return null;
        if (!bytes.byteLength) throw new Error("audio-file-empty");
        let buffer;
        try { buffer = await decoder.decodeAudioData(bytes); }
        catch (_) { throw new Error("audio-file-decode-failed"); }
        if (controller.signal.aborted) return null;
        if (!buffer || !Number.isFinite(buffer.duration) || buffer.duration <= 0) throw new Error("audio-file-invalid-duration");
        this.assetBuffers.set(key, buffer);
        while (this.assetBuffers.size > 3) this.assetBuffers.delete(this.assetBuffers.keys().next().value);
        return buffer;
      } catch (error) {
        if (this[field] === controller && (!controller.signal.aborted || timedOut)) {
          this.lastError = timedOut ? "audio-file-timeout" : /^audio-file-/.test(error?.message || "") ? error.message : "audio-file-load-failed";
        }
        return null;
      } finally {
        clearTimeout(timeout);
        if (this[field] === controller) this[field] = null;
      }
    }

    stopSources(sources) {
      for (const source of sources) {
        source.onended = null;
        try { source.stop(); } catch (_) {}
        try { source.disconnect(); } catch (_) {}
      }
      sources.clear();
    }

    // Signal QA renders only the bundled recording. This does not
    // certify physical loudness, Bluetooth routing, or awakening reliability.
    async renderSample(id, seconds = 12) {
      const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!Offline) throw new Error("Offline audio rendering is unavailable");
      const buffer = await this.loadAsset(id, "sample", new Offline(1, 1, 48000));
      if (!buffer) throw new Error(this.lastError || "audio-file-load-failed");
      const length = Math.min(buffer.duration, Math.max(1, Math.min(30, Number(seconds) || 12)));
      const offline = new Offline(Math.min(2, buffer.numberOfChannels || 1), Math.ceil(48000 * length), 48000);
      const source = offline.createBufferSource();
      source.buffer = buffer;
      source.connect(offline.destination);
      source.start(0, 0, length);
      return offline.startRendering();
    }

    volumeToGain(percent, ceiling) {
      const normalized = Math.max(0, Math.min(1, Number(percent || 0) / 100));
      return Math.max(0.0001, Math.pow(normalized, 1.55) * (ceiling || 0.72));
    }

    tone(bus, frequency, start, duration, options) {
      if (!this.context || !bus) return;
      const opts = options || {};
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const filter = this.context.createBiquadFilter();
      const attack = Math.max(0.004, opts.attack ?? 0.035);
      const release = Math.max(0.04, opts.release ?? Math.min(1.1, duration * 0.62));
      const peak = Math.max(0.0001, opts.gain ?? 0.08);
      oscillator.type = opts.type || "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      if (opts.detune) oscillator.detune.setValueAtTime(opts.detune, start);
      if (opts.glideTo) oscillator.frequency.exponentialRampToValueAtTime(opts.glideTo, start + duration);
      filter.type = opts.filterType || "lowpass";
      filter.frequency.setValueAtTime(opts.filter ?? 4200, start);
      filter.Q.value = opts.q || 0.7;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + attack);
      const releaseStart = Math.max(start + attack + 0.01, start + duration - release);
      gain.gain.setValueAtTime(peak, releaseStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(filter).connect(gain).connect(bus);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.04);
    }

    shimmer(bus, frequency, start, gain) {
      this.tone(bus, frequency, start, 1.9, { type: "sine", gain: gain || 0.065, attack: 0.008, release: 1.65, filter: 7200 });
      this.tone(bus, frequency * 2.003, start + 0.012, 1.25, { type: "triangle", gain: (gain || 0.065) * 0.32, attack: 0.006, release: 1.05, filter: 6500 });
    }

    noise(bus, start, duration, gain, frequency) {
      if (!this.context || !bus) return;
      if (!this.noiseBuffer) {
        const length = Math.ceil(this.context.sampleRate * 2);
        this.noiseBuffer = this.context.createBuffer(1, length, this.context.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length * 0.35);
      }
      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const envelope = this.context.createGain();
      source.buffer = this.noiseBuffer;
      filter.type = "bandpass";
      filter.frequency.value = frequency || 3200;
      filter.Q.value = 1.1;
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(gain || 0.015, start + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter).connect(envelope).connect(bus);
      source.start(start);
      source.stop(start + duration + 0.03);
    }

    async preview(id, percent, onEnd, seconds = 6) {
      this.stopPreview(false);
      const token = ++this.previewToken;
      if (!this.presetById(id)?.src) { this.lastError = "audio-file-unavailable"; return false; }
      const ready = await this.unlock();
      if (!ready || token !== this.previewToken) return false;
      const buffer = await this.loadAsset(id, "preview");
      if (!buffer || token !== this.previewToken) return false;
      if (this.context.state && this.context.state !== "running") { this.lastError = "playback-needs-attention"; return false; }
      this.onPreviewEnd = onEnd || null;
      const now = this.context.currentTime;
      const target = this.volumeToGain(percent, 0.54);
      this.previewBus.gain.cancelScheduledValues(now);
      this.previewBus.gain.setValueAtTime(0.0001, now);
      this.previewBus.gain.exponentialRampToValueAtTime(target, now + 0.12);
      const duration = Math.min(buffer.duration, Math.max(1, Math.min(30, Number(seconds) || 6)));
      const finish = () => {
        if (token !== this.previewToken) return;
        const callback = this.onPreviewEnd;
        this.stopPreview(false);
        if (callback) callback();
      };
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.loop = false;
      source.connect(this.previewBus);
      source.onended = finish;
      this.previewSources.add(source);
      source.start(now, 0, duration);
      this.previewBus.gain.setValueAtTime(target, now + duration - 0.12);
      this.previewBus.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      this.previewTimer = setTimeout(finish, duration * 1000);
      return true;
    }

    setPreviewLevel(percent) {
      if (!this.context || !this.previewBus) return;
      const now = this.context.currentTime;
      this.previewBus.gain.cancelScheduledValues(now);
      this.previewBus.gain.setTargetAtTime(this.volumeToGain(percent, 0.54), now, 0.06);
    }

    stopPreview(notify) {
      clearTimeout(this.previewTimer);
      this.previewTimer = null;
      this.previewToken += 1;
      this.previewLoadController?.abort();
      this.previewLoadController = null;
      this.stopSources(this.previewSources);
      if (this.context && this.previewBus) {
        const now = this.context.currentTime;
        this.previewBus.gain.cancelScheduledValues(now);
        this.previewBus.gain.setValueAtTime(0, now);
        // Disconnect the old bus before another recording starts.
        this.previewBus.disconnect();
        this.previewBus = this.context.createGain();
        this.previewBus.gain.value = 0.0001;
        this.previewBus.connect(this.compressor || this.master);
      }
      const callback = this.onPreviewEnd;
      this.onPreviewEnd = null;
      if (notify && callback) callback();
    }

    async startRinging(id, percent) {
      this.stopRinging();
      this.stopPreview(false);
      const generation = this.ringGeneration;
      if (!this.presetById(id)?.src) { this.lastError = "audio-file-unavailable"; return false; }
      const ready = await this.unlock();
      if (!ready || generation !== this.ringGeneration) return false;
      this.ringPreset = id;
      const buffer = await this.loadAsset(this.ringPreset, "ring");
      if (!buffer || generation !== this.ringGeneration) return false;
      if (this.context.state && this.context.state !== "running") { this.lastError = "playback-needs-attention"; return false; }
      const now = this.context.currentTime;
      this.ringBus.gain.cancelScheduledValues(now);
      this.ringBus.gain.setValueAtTime(0.0001, now);
      this.ringBus.gain.exponentialRampToValueAtTime(this.volumeToGain(percent, 0.8), now + 0.22);
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.loopStart = 0;
      source.loopEnd = buffer.duration;
      source.connect(this.ringBus);
      this.ringSources.add(source);
      source.start(now);
      return true;
    }

    setRingLevel(percent, rampSeconds) {
      if (!this.context || !this.ringBus) return;
      const now = this.context.currentTime;
      this.ringBus.gain.cancelScheduledValues(now);
      this.ringBus.gain.setTargetAtTime(this.volumeToGain(percent, 0.8), now, Math.max(0.03, (rampSeconds || 0.25) / 3));
    }

    stopRinging() {
      this.ringGeneration += 1;
      clearInterval(this.ringTimer);
      this.ringTimer = null;
      this.ringLoadController?.abort();
      this.ringLoadController = null;
      this.stopSources(this.ringSources);
      if (this.context && this.ringBus) {
        const now = this.context.currentTime;
        this.ringBus.gain.cancelScheduledValues(now);
        this.ringBus.gain.setValueAtTime(0, now);
        this.ringBus.disconnect();
        this.ringBus = this.context.createGain();
        this.ringBus.gain.value = 0.0001;
        this.ringBus.connect(this.compressor || this.master);
      }
    }

    async cue(kind) {
      const ready = await this.unlock();
      if (!ready) return;
      const now = this.context.currentTime + 0.02;
      if (kind === "error") {
        this.tone(this.fxBus, 196, now, 0.22, { type: "triangle", gain: 0.055, attack: 0.01, release: 0.18, filter: 1200 });
        this.tone(this.fxBus, 164.81, now + 0.16, 0.28, { type: "triangle", gain: 0.048, attack: 0.01, release: 0.23, filter: 1100 });
      } else if (kind === "curtain") {
        this.noise(this.fxBus, now, 0.48, 0.018, 900);
        this.tone(this.fxBus, 261.63, now + 0.12, 0.8, { type: "sine", gain: 0.035, attack: 0.08, release: 0.62, filter: 2600, glideTo: 392 });
      } else {
        this.shimmer(this.fxBus, 659.25, now, 0.052);
        this.shimmer(this.fxBus, 783.99, now + 0.12, 0.06);
        this.shimmer(this.fxBus, 987.77, now + 0.28, 0.052);
      }
    }

    destroy() {
      this.stopPreview(false);
      this.stopRinging();
      this.sampleLoadController?.abort();
      this.sampleLoadController = null;
      this.assetBuffers.clear();
      if (this.context && this.context.state !== "closed") this.context.close();
      this.context = null;
    }
  }

  window.DramaAlarmAudio = DramaAlarmAudio;
})();
