(function () {
  "use strict";

  const Screens = window.DramaAlarmScreens;
  const { riddles, soundPresets, screenCatalog } = window.DramaAlarmData;
  const Runtime = window.DramaAlarmRuntime;
  const Challenges = window.DramaAlarmChallenges;
  const QuestionBank = window.DramaAlarmQuestionBank;
  // Themes change presentation only. Alarm and safety capabilities remain identical.
  const themes = Object.freeze((window.DramaAlarmData.themes || [
    Object.freeze({ id: "velvet", name: "Velvet Stage", subtitle: "A little theatre, a warmer morning", description: "Cream, rose and lilac with a curtain-call entrance.", free: true, available: true }),
    Object.freeze({ id: "daybreak", name: "Daybreak", subtitle: "A calmer kind of grand entrance", description: "Fresh mint, soft light and a little room to breathe.", free: true, available: true }),
  ]).map(theme=>Object.freeze({...theme,free:theme.free ?? !theme.premium,available:theme.available!==false})));
  const challengeScreens = new Set(["03", "04", "05", "06", "15", "16", "20", "21", "22"]);
  window.DramaAlarmThemes = themes;

  class DramaAlarmApp {
    constructor() {
      const query = new URLSearchParams(location.search);
      this.fast = query.get("test") === "1";
      this.qa = this.fast || query.get("qa") === "1";
      this.soundEngine = new window.DramaAlarmAudio(soundPresets);
      this.state = this.initialState();
      QuestionBank?.setAccessResolver?.(id=>this.hasProduct(`pack:${id}`));
      window.DramaAlarmI18n?.setLocale(this.state.language);
      this.transitionTimer = null;
      this.countdownTimer = null;
      this.clockTimer = null;
      this.clockRenderFlushTimer = null;
      this.clockRenderDeferred = false;
      this.ringRampTimer = null;
      this.ringHapticTimer = null;
      this.wakeTimer = null;
      this.scheduledWakeTimer = null;
      this.holdTimer = null;
      this.holdStarted = 0;
      this.holdElement = null;
      this.toastTimer = null;
      this.previewRenderTimer = null;
      this.wakeLock = null;
      this.lastScheduledTrigger = "";
      this.renderedScreen = null;
      this.renderedRehearsalMode = null;
      this.routeStack = [this.state.screen];
      this.routeScroll = {};
      this.routeExpansion = {};
      this.wheelTimers = new WeakMap();
      this.wheelFrames = new WeakMap();
      this.sliderPreviewTimer = null;
      this.sessionGeneration = 0;
      this.previewGeneration = 0;
      this.restoring = false;
      this.composingInput = null;
      this.onboardingReplay = null;
      this.routeTransition = null;
      this.routeTransitionSequence = 0;
      document.body.classList.toggle("qa-mode", this.qa);
      document.body.dataset.edition="compliance";
      document.documentElement.dataset.pageHidden=String(document.hidden);
      this.bind();
      this.render();
      this.startClock();
      this.save(); // Version 11 owns its record; earlier versions are read-only sources.
      history.replaceState({ dramaAlarm: true, screen: this.state.screen }, "", location.href);
      if (this.state.activeSession) {
        this.state.audioResumeRequired = this.state.screen !== "22";
        if (this.state.screen === "22") this.startWakeCountdown();
        this.render();
      }
      const launchDelay = this.fast || this.state.activeSession || this.state.reduceMotion || matchMedia("(prefers-reduced-motion: reduce)").matches ? 20 : 3000;
      setTimeout(() => document.body.classList.add("is-launched"), launchDelay);
    }

    defaultAlarm(overrides) {
      const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `alarm-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      return Object.assign({
        id,
        label: window.DramaAlarmI18n?.getLocale?.()==="en"?"Morning Show":"晨间演出",
        time: "06:30",
        days: [1, 2, 3, 4, 5],
        difficulty: "Gentle",
        taskPlanVersion: 8,
        questionTopic: "everyday",
        riddle: true,
        rising: true,
        quieter: true,
        check: true,
        checkDelay: 5,
        enabled: true,
        soundId: "first-light",
        maxVolume: 72,
        repeatMode: "weekly",
        onceDate: "",
      }, overrides || {});
    }

    clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    localDateKey(date = new Date()) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    monthKey(date = new Date()) {
      return this.localDateKey(date).slice(0, 7);
    }

    initialState() {
      let saved = {};
      let storageReadError="";
      let sourceVersion=11;
      for (const key of ["drama-alarm-v11-compliance", "drama-alarm-v11", "drama-alarm-v10", "drama-alarm-v9", "drama-alarm-v8", "drama-alarm-v7", "drama-alarm-v6", "drama-alarm-v5", "drama-alarm-v4", "drama-alarm-v3", "drama-alarm-v2", "drama-alarm-demo"]) {
        try {
          const candidate = JSON.parse(localStorage.getItem(key) || "null");
          if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) { saved = candidate; sourceVersion=["drama-alarm-v11-compliance","drama-alarm-v11"].includes(key)?11:key==="drama-alarm-v10"?10:key==="drama-alarm-v9"?9:key==="drama-alarm-v8"?8:7;break; }
        } catch (_) {if(key==="drama-alarm-v11-compliance"){storageReadError="Stored 11.0 data cannot be read. Your existing record has not been overwritten. Use local reset to start again.";break;}}
      }
      let alarms = Array.isArray(saved.alarms) ? saved.alarms : [];
      if (!alarms.length && saved.alarm && saved.onboarded) alarms = [this.defaultAlarm(saved.alarm)];
      alarms = alarms.filter(alarm=>alarm && typeof alarm==="object").map((alarm) => {
        const normalized=this.defaultAlarm(alarm);
        normalized.taskPlanVersion=sourceVersion>=8 && Number(alarm.taskPlanVersion)===8?8:7;
        normalized.questionTopic=Challenges.topicOf(alarm.questionTopic);
        normalized.days=Array.isArray(normalized.days)?[...new Set(normalized.days.filter(day=>Number.isInteger(day)&&day>=0&&day<=6))]:[1,2,3,4,5];
        if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(normalized.time))normalized.time="06:30";
        return normalized;
      });
      const activeAlarm = saved.activeSession?.alarm ? this.clone(saved.activeSession.alarm) : saved.editorDraft?.alarm ? this.clone(saved.editorDraft.alarm) : alarms[0] ? this.clone(alarms[0]) : this.defaultAlarm();
      if(sourceVersion<8 && (saved.activeSession || saved.editorDraft))activeAlarm.taskPlanVersion=7;
      activeAlarm.questionTopic=Challenges.topicOf(activeAlarm.questionTopic);
      const savedSoundId = activeAlarm.soundId || saved.soundId || saved.sound || "first-light";
      // An already ringing session keeps its validated sound snapshot on upgrade.
      activeAlarm.soundId = soundPresets.some((preset) => preset.id === savedSoundId && (!preset.premium || saved.activeSession)) ? savedSoundId : "first-light";
      const notificationPermission = "Notification" in window ? Notification.permission : "unsupported";
      const themeId = themes.some((theme) => theme.id === saved.themeId && theme.free) ? saved.themeId : saved.onboarded ? "velvet" : "daybreak";
      const readLegacy=key=>{try{return localStorage.getItem(key);}catch{return null;}};
      const emergencyMonth = saved.emergencyMonth || readLegacy("drama-alarm-emergency-month") || this.monthKey();
      const emergencyUses = emergencyMonth === this.monthKey() ? Math.max(0, Number(saved.emergencyUses ?? readLegacy("drama-alarm-emergency-uses") ?? 0) || 0) : 0;
      const state = {
        adFreeOnboardingSeen: Boolean(saved.adFreeOnboardingSeen || saved.onboarded),
        productAccess: [],
        purchaseProduct: null,
        productReturnScreen: "14",
        language: saved.language === "en" ? "en" : "zh-CN",
        screen: saved.activeSession?.phase === "16" ? "03" : saved.activeSession?.phase || (saved.editorDraft ? "02" : saved.screen === "07" && saved.lastResult ? "07" : saved.onboarded ? "01" : "08"),
        previousScreen: "03",
        permission: Boolean(saved.permission),
        permissionStatus: saved.permissionStatus || notificationPermission,
        permissionReturnScreen: "18",
        onboarded: Boolean(saved.onboarded),
        themeId,
        themePreviewId: null,
        pendingThemeId: themeId,
        themeReturn: "onboarding",
        themePreviewReturnScreen: "38",
        themeStudioReturnScreen: "14",
        futureThemeReturnScreen: "38",
        themeOnboardingComplete: Boolean(saved.themeOnboardingComplete || saved.onboarded),
        alarms,
        alarm: activeAlarm,
        editorMode: saved.editorDraft?.editorMode || (alarms.length ? "edit" : "new"),
        editorOpen: Boolean(saved.editorDraft),
        editorError: "",
        soundId: activeAlarm.soundId,
        soundReturnScreen: "14",
        settingsReturnScreen: "14",
        previewingSound: null,
        audioUnlocked: false,
        plan: "subscription-preview",
        haptics: saved.haptics !== false,
        hapticCues: Object.assign({ ring: true, answer: true, bravo: true }, saved.hapticCues || {}),
        masterVolume: Number(saved.masterVolume || activeAlarm.maxVolume || 72),
        volume: 40,
        math: this.generateMath(activeAlarm.difficulty),
        riddleIndex: 0,
        riddleWrong: 0,
        lastRiddleWrong: null,
        recentRiddles: Array.isArray(saved.recentRiddles) ? saved.recentRiddles.slice(-20) : [],
        rehearsalMode: "sound",
        rehearsalInput: "",
        rehearsalError: "",
        rehearsalWrong: null,
        safetyKind: "math",
        safetyTargetLevel: "Gentle",
        emergencyMonth: this.monthKey(),
        emergencyUses,
        emergencyCode: "",
        testCountdown: 0,
        wakeCheckSeconds: this.fast ? 3 : 60,
        checkMode: false,
        wakeCheckDueAt: 0,
        wakeCheckAlarm: null,
        wakeCheckReturnScreen: "01",
        sessionKind: "alarm",
        challengeStartedAt: 0,
        challengeMistakes: 0,
        lastResult: saved.lastResult || null,
        selectedAchievement: { name: "Morning Debut", copy: "Completed your first local wake-up show", count: "01", earned: true },
        history: Array.isArray(saved.history) ? saved.history.slice(-90) : [],
        nextAlarm: null,
        now: new Date(),
        fast: this.fast,
        defaults: this.defaultAlarm(Object.assign({id:"defaults",difficulty:"Gentle"},saved.defaults || {},{taskPlanVersion:8,questionTopic:Challenges.topicOf(saved.defaults?.questionTopic)})),
        settingScope: "defaults",
        activeSession: saved.activeSession || null,
        occurrences: Array.isArray(saved.occurrences) ? saved.occurrences.slice(-300) : [],
        pendingQueue: Array.isArray(saved.pendingQueue) ? saved.pendingQueue : [],
        wakeChecks: Array.isArray(saved.wakeChecks) ? saved.wakeChecks : [],
        lastScheduleCheckAt: Number(saved.lastScheduleCheckAt) || 0,
        eventLog: Array.isArray(saved.eventLog) ? saved.eventLog.slice(-300) : [],
        persistenceError: storageReadError,
        storageReadError,
        audioStatus: this.soundEngine.getStatus ? this.soundEngine.getStatus() : {supported:Boolean(window.AudioContext||window.webkitAudioContext),state:"idle",engineReady:false,routeVerified:false,lastError:null},
        soundCheckConfirmed: Boolean(saved.soundCheckConfirmed),
        soundCheckSoundId: saved.soundCheckSoundId || (saved.soundCheckConfirmed ? savedSoundId : null),
        lastPreviewSoundId: null,
        tutorialComplete: Boolean(saved.tutorialComplete),
        intensityOnboardingComplete:Boolean(saved.intensityOnboardingComplete || saved.onboarded),
        reduceMotion:Boolean(saved.reduceMotion),
        challengePlan:null,
        challengeProgress:null,
        activePackId:"geography",
        libraryReturnScreen:"14",
        packSample:null,
        packSampleAnswer:null,
        packSampleFeedback:null,
        packSampleIndex:0,
        packPreparing:false,
        migratedFromVersion:sourceVersion<11?sourceVersion:saved.migratedFromVersion || null,
        onboardingReplay:false,
        emergencyAlternative: false,
        soundReturnScreen: saved.editorDraft ? "02" : "14",
        editorSnapshot: saved.editorDraft?.snapshot || null,
        editorErrorField: "",
        completedReturnContext:saved.completedReturnContext || null,
      };
      if (state.activeSession) {
        state.activeSession.scheduledAt = Number.isFinite(state.activeSession.scheduledAt) ? state.activeSession.scheduledAt : state.occurrences.find(item=>item.id===state.activeSession.occurrenceId)?.scheduledAt ?? null;
        Object.assign(state, this.clone(state.activeSession.progress || {}));
        state.sessionKind = state.activeSession.kind;
        state.challengeStartedAt = state.activeSession.startedAt;
      }
      state.riddleInstance = state.riddleInstance || Runtime.shuffleRiddle(riddles[state.riddleIndex % riddles.length]);
      if(state.activeSession && state.challengePlan?.version===8)this.syncChallengeQuestion(state);
      return state;
    }

    bind() {
      document.addEventListener("compositionstart", event => { this.composingInput = event.target; });
      document.addEventListener("compositionend", event => { if (this.composingInput === event.target) this.composingInput = null; });
      document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-action]");
        if (!trigger && event.target.closest("summary")) this.vibrate(12,"interaction");
        if (!trigger || trigger.disabled) return;
        event.preventDefault();
        if(!["noop","hold-emergency","hold-stand"].includes(trigger.dataset.action))this.vibrate(12,"interaction");
        Promise.resolve(this.handle(trigger.dataset.action, trigger)).catch(() => this.toast("That action could not finish. Please try again."));
      });
      document.addEventListener("scroll",event=>{
        const wheel=event.target;
        if(wheel?.matches?.("[data-time-wheel]")){
          if(!this.wheelFrames)this.wheelFrames=new WeakMap();
          if(!this.wheelFrames.get(wheel))this.wheelFrames.set(wheel,requestAnimationFrame(()=>{this.wheelFrames.delete(wheel);this.commitWheel(wheel);}));
          clearTimeout(this.wheelTimers.get(wheel));
          this.wheelTimers.set(wheel,setTimeout(()=>this.commitWheel(wheel),100));
        }
        if(wheel?.classList?.contains("screen-body"))wheel.closest(".screen")?.classList.toggle("is-scrolled",wheel.scrollTop>3);
      },true);
      document.addEventListener("toggle",event=>{if(event.target?.tagName==="DETAILS")this.rememberExpansion();},true);
      document.addEventListener("input", (event) => {
        const target = event.target;
        if (target.id === "alarm-time") {
          this.state.alarm.time = target.value;
          if(this.state.alarm.repeatMode==="once")this.setNextOnceDate();
          this.state.editorError = "";
          this.state.editorErrorField = "";
        } else if (target.id === "alarm-label") {
          this.state.alarm.label = target.value.slice(0, 32);
          this.state.editorError = "";
          this.state.editorErrorField = "";
        } else if (target.id === "alarm-date") {
          this.state.alarm.onceDate = target.value;
          this.state.editorError = "";
          this.state.editorErrorField = "";
        } else if (["max-volume", "rehearsal-volume", "strategy-volume"].includes(target.id)) {
          this.state.masterVolume = Number(target.value);
          this.state.alarm.maxVolume = this.state.masterVolume;
          this.soundEngine.setPreviewLevel(this.state.masterVolume);
          document.querySelectorAll(`[data-volume-output="${target.id}"]`).forEach(output=>{output.textContent = `${this.state.masterVolume}%`;});
          this.vibrate(8,"interaction");
          clearTimeout(this.sliderPreviewTimer);
          const play=()=>this.previewSound(this.state.soundId || this.state.alarm.soundId,false,{force:true,slider:true});
          if(!this.state.previewingSound)play();else this.sliderPreviewTimer=setTimeout(play,90);
        } else if (target.id === "emergency-stop-code") {
          this.state.emergencyCode = target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
          target.value = this.state.emergencyCode;
        }
        if (this.state.editorOpen || this.state.activeSession) this.save();
      });
      document.addEventListener("change", (event) => {
        if (["max-volume", "rehearsal-volume", "strategy-volume"].includes(event.target.id)) {
          if (event.target.id === "strategy-volume" && this.state.settingsReturnScreen !== "02") this.syncCurrentAlarm();
          else this.save();
        }
      });
      document.addEventListener("pointerdown", (event) => {
        const hold = event.target.closest("[data-hold]");
        if (hold) { event.preventDefault(); this.startHold(hold); }
      });
      ["pointerup", "pointercancel"].forEach((name) => document.addEventListener(name, () => this.cancelHold()));
      document.addEventListener("pointerleave", (event) => {
        if (this.holdElement && event.target === this.holdElement) this.cancelHold();
      }, true);
      document.addEventListener("keydown", (event) => this.handleKeyboard(event));
      document.addEventListener("keyup", event => {
        if ([" ","Enter"].includes(event.key) && this.holdElement) {event.preventDefault();this.cancelHold();}
      });
      window.addEventListener("popstate", event => {
        if (!event.state?.dramaAlarm) return;
        if(event.state.onboardingReplay && !this.onboardingReplay) {
          const destination=event.state.guideOrigin || "01";
          this.go(destination,{history:false,restoreScroll:true});
          history.replaceState({dramaAlarm:true,screen:destination},"",location.href);
          return;
        }
        if(this.onboardingReplay && !["08","37","38","39","40","45","52","53"].includes(event.state.screen)) {
          this.finishOnboardingReplay({history:false});
          return;
        }
        if (this.state.activeSession && challengeScreens.has(this.state.screen)) {
          history.pushState({dramaAlarm:true,screen:this.state.screen},"",location.href);
          this.toast("Your wake-up is still in progress. Use Emergency to stop safely.");
          return;
        }
        if(this.state.editorOpen && this.state.screen==="02" && event.state.screen!=="02") {
          history.pushState({dramaAlarm:true,screen:"02"},"",location.href);
          const layer=document.getElementById("modal-layer");layer.hidden=false;
          layer.innerHTML='<section class="modal" role="dialog" aria-modal="true" aria-labelledby="leave-editor-title"><h2 id="leave-editor-title">Keep this alarm draft?</h2><p>Your changes have not been saved.</p><div class="modal-actions"><button class="secondary" type="button" data-action="close-modal">Keep editing</button><button class="primary" type="button" data-action="discard-editor">Discard changes</button></div></section>';
          this.localizeModal();
          layer.querySelector("button")?.focus();return;
        }
        const target=event.state.screen || "01";
        if (this.state.themePreviewId && !["39","53"].includes(target)) {
          this.state.themePreviewId = null;
          this.state.pendingThemeId = this.state.themeId;
        }
        // A dismissed challenge remains in browser history, not in product state.
        // Going back must never resurrect an orphan check or a dead countdown.
        const destination=!this.state.activeSession && (challengeScreens.has(target) || target==="33")?(this.state.editorOpen?"02":"01"):target;
        this.go(destination, {history:false,restoreScroll:true});
        if(destination!==target)history.replaceState({dramaAlarm:true,screen:destination},"",location.href);
      });
      document.addEventListener("visibilitychange", () => {
        document.documentElement.dataset.pageHidden=String(document.hidden);
        if(document.hidden)this.cancelRouteTransition();
        window.DramaAlarmMascotMotion?.refresh?.();
        if (document.hidden && this.state.previewingSound) this.stopPreview();
        if (!document.hidden) {
          this.checkWakeCheckDue();
          this.checkScheduledAlarm(new Date());
        }
      });
      matchMedia("(prefers-reduced-motion: reduce)").addEventListener?.("change",()=>{
        this.cancelRouteTransition();
        window.DramaAlarmMascotMotion?.refresh?.();
      });
      window.addEventListener("beforeunload", () => {if(this.isFormalSession())this.recordEvent("interrupted",{sessionId:this.state.activeSession.id,occurrenceId:this.state.activeSession.occurrenceId});this.save();this.soundEngine.destroy();});
      window.addEventListener("drama-audio-state",()=>{this.state.audioStatus=this.soundEngine.getStatus();if(this.state.activeSession && this.state.screen!=="22"){this.state.audioResumeRequired=!this.state.audioStatus.engineReady;this.render();}});
    }

    startClock() {
      clearInterval(this.clockTimer);
      this.clockTimer = setInterval(() => {
        this.state.now = new Date();
        this.ensureEmergencyMonth();
        this.checkWakeCheckDue();
        this.checkScheduledAlarm(this.state.now);
        if (["01", "19"].includes(this.state.screen)) this.render({reason:"clock"});
      }, this.fast ? 1000 : 15000);
      this.checkScheduledAlarm(this.state.now);
    }

    checkScheduledAlarm(now) {
      if (!this.state.onboarded) return;
      const stamp = +now;
      const from = this.state.lastScheduleCheckAt && this.state.lastScheduleCheckAt <= stamp ? this.state.lastScheduleCheckAt : stamp - 60000;
      const known = new Set(this.state.occurrences.map(item=>item.id));
      let changed = false;
      for (const item of Runtime.between(this.state.alarms,from,now)) {
        if (known.has(item.id)) continue;
        known.add(item.id);
        const {alarm,...record} = item;
        record.status = stamp-item.scheduledAt <= 10*60000 ? "queued" : "missed";
        this.state.occurrences.push(record);
        this.recordEvent(record.status === "missed" ? "missed" : "scheduled", {occurrenceId:record.id,scheduledAt:record.scheduledAt});
        if (record.status === "queued") this.state.pendingQueue.push({occurrenceId:record.id,alarm:this.clone(alarm),scheduledAt:record.scheduledAt});
        else if (alarm.repeatMode === "once") alarm.enabled=false;
        changed = true;
      }
      this.state.lastScheduleCheckAt = stamp;
      if (changed) this.save();
      else if (!this.state.activeSession) this.save();
      this.startNextQueued();
    }

    recordEvent(type, details = {}) {
      this.state.eventLog.push(Object.assign({type,at:Date.now()},details));
      this.state.eventLog=this.state.eventLog.slice(-300);
    }

    isFormalSession(session = this.state.activeSession) {
      return Boolean(session && ["alarm", "check"].includes(session.kind));
    }

    captureRouteContext() {
      if(this.state.activeSession?.kind==="check-preview" && this.state.wakeCheckSuspendedState)return this.clone(this.state.wakeCheckSuspendedState);
      if(this.state.activeSession?.kind==="test" && this.state.activeSession.returnContext)return this.clone(this.state.activeSession.returnContext);
      const fields=["screen","alarm","soundId","masterVolume","editorMode","editorOpen","editorSnapshot","editorError","editorErrorField","settingScope","settingsReturnScreen","soundReturnScreen","permissionReturnScreen","activePackId","libraryReturnScreen","packSample","packSampleAnswer","packSampleFeedback","packSampleIndex","themePreviewId","pendingThemeId","themeReturn","themePreviewReturnScreen","themeStudioReturnScreen","futureThemeReturnScreen","purchaseProduct","productReturnScreen","detailReturnScreen","passReturnScreen","tutorialReturn","rehearsalMode","rehearsalInput","rehearsalError","rehearsalWrong","selectedAchievement","completedReturnContext","lastResult"];
      const context={};
      for(const key of fields)if(this.state[key]!==undefined)context[key]=this.clone(this.state[key]);
      // Formal delivery cancels a pending rehearsal, never resumes a dead timer.
      if(context.screen==="33")context.screen=this.state.testReturnScreen || "19";
      if(this.state.activeSession && !this.isFormalSession())context.screen=this.state.testReturnScreen || "19";
      context.routeStack=this.clone(this.routeStack || [context.screen]);
      context.routeScroll=this.clone(this.routeScroll || {});
      return context;
    }

    applyRouteContext(context) {
      if(!context)return "01";
      const {screen,routeStack,routeScroll,...values}=this.clone(context);
      Object.assign(this.state,values);
      if(routeStack)this.routeStack=routeStack;
      if(routeScroll)this.routeScroll=routeScroll;
      return screen || "01";
    }

    startNextQueued() {
      if (!this.state.pendingQueue.length || this.isFormalSession()) return false;
      if(this.onboardingReplay)this.finishOnboardingReplay({navigate:false});
      const interruptedTest=Boolean(this.state.testCountdown || this.state.activeSession);
      const returnContext=this.state.completedReturnContext || this.captureRouteContext();
      clearInterval(this.countdownTimer);this.countdownTimer=null;this.state.testCountdown=0;
      this.sessionGeneration += 1;
      if (this.state.activeSession) this.stopRinging();
      const next=this.state.pendingQueue.shift();
      this.state.completedReturnContext=null;
      this.state.editorOpen=false;
      this.closeModal();
      this.state.alarm=this.clone(next.alarm);this.state.soundId=next.alarm.soundId;this.state.masterVolume=next.alarm.maxVolume;
      this.resetChallenge("alarm", next.occurrenceId);
      this.state.activeSession.returnContext=returnContext;
      const record=this.state.occurrences.find(item=>item.id===next.occurrenceId);
      if(record) record.status="triggered";
      this.lastScheduledTrigger=next.occurrenceId;
      this.recordEvent("triggered",{occurrenceId:next.occurrenceId});
      this.go("16",{ring:true});this.notifyAlarm();
      if(interruptedTest)this.toast("The rehearsal was cancelled for your scheduled alarm.");
      return true;
    }

    updateDerivedState() {
      if(this.state.soundCheckConfirmed && this.state.soundCheckSoundId!==this.state.soundId)this.state.soundCheckConfirmed=false;
      this.state.nextAlarm = this.findNextAlarm();
      const preset = soundPresets.find((item) => item.id === this.state.soundId) || soundPresets[0];
      this.state.soundName = preset.name;
      this.state.soundPresets = soundPresets;
      this.state.riddle = this.state.riddleInstance;
      this.state.audioStatus = this.soundEngine.getStatus ? this.soundEngine.getStatus() : this.state.audioStatus;
      const pendingChecks=this.state.wakeChecks.filter(item=>item.status==="pending").sort((a,b)=>a.dueAt-b.dueAt);
      this.state.wakeCheckDueAt=pendingChecks[0]?.dueAt || 0;
      this.state.wakeCheckAlarm=pendingChecks[0]?.alarm || null;
      this.state.todaySummary=this.todaySummary();
      this.state.recentEvents=this.state.eventLog.slice(-20).reverse().map(({type,at})=>({type,at}));
      this.state.diagnostics=this.diagnostics();
      this.state.runSummary = this.calculateRunSummary();
      this.state.alarmTaskSummary=Challenges.describe(this.state.alarm);
      this.state.nextTaskSummary=this.state.nextAlarm?Challenges.describe(this.state.nextAlarm.alarm):null;
      this.state.challengeProgress=this.state.checkMode?{completed:0,total:1,questionNumber:1,currentKind:"math",remaining:1,complete:false,legacy:false}:this.state.challengePlan?.version===8?{...Challenges.progress(this.state.challengePlan),legacy:false}:{completed:["06","20"].includes(this.state.screen)?1:0,total:this.state.alarm.riddle===false?1:2,questionNumber:["06","20"].includes(this.state.screen)?2:1,currentKind:["06","20"].includes(this.state.screen)?"choice":"math",legacy:true};
      this.state.packCatalog=QuestionBank?.listPacks?.() || [];
      this.state.activePack=QuestionBank?.getPack?.(this.state.activePackId) || null;
      this.state.packStatus=QuestionBank?.getStatus?.(this.state.activePackId) || {state:"bundled",ready:true};
      this.state.packPreparing=Boolean(this.pendingPackUpdate?.packId===this.state.activePackId);
      this.state.products = window.DramaAlarmData.commerce?.products || [];
      this.state.purchasedProductIds = window.DRAMA_INTERNAL_BUILD===true && this.qa ? [...this.state.productAccess] : [];
      this.ensureEmergencyMonth();
      this.state.themes = themes;
      this.state.displayThemeId = this.state.themePreviewId || this.state.themeId;
      // Both names are exposed for the v5 screen templates; themePreviewId is canonical.
      this.state.previewThemeId = this.state.themePreviewId;
      this.state.activeTheme = themes.find((theme) => theme.id === this.state.themeId) || themes[1];
      this.state.selectedTheme = themes.find((theme) => theme.id === this.state.pendingThemeId) || this.state.activeTheme;
      this.state.previewTheme = themes.find((theme) => theme.id === this.state.themePreviewId) || this.state.selectedTheme;
      this.state.historyDays = Array.from(new Set(this.state.history.map((item) => item.localDate || this.localDateKey(new Date(item.at)))));
    }

    // Rendering updates the existing native controls instead of tearing down
    // their focus, scroll position and the navigation's live WebGL surface.
    domKey(node) {
      if (node.nodeType !== Node.ELEMENT_NODE) return `node:${node.nodeType}`;
      if (node.id) return `${node.tagName}#${node.id}`;
      if (node.dataset.slot) return `${node.tagName}:slot:${node.dataset.slot}`;
      if (node.dataset.expandKey) return `${node.tagName}:expand:${node.dataset.expandKey}`;
      if (node.dataset.action) return `${node.tagName}:action:${node.dataset.action}:${["id","value","index","sound","theme"].map(key => node.dataset[key] ?? "").join("|")}`;
      if (node.matches(".alarm-card")) return `alarm:${node.querySelector("[data-id]")?.dataset.id || ""}`;
      if (node.dataset.themeCard) return `theme:${node.dataset.themeCard}`;
      return `${node.tagName}:${[...node.classList].find(name => !/^(?:is-|active$|glass-)/.test(name)) || ""}`;
    }

    syncAttributes(current, next) {
      const owned = name => current.tagName === "DETAILS" && name === "open" || current.dataset.timeWheel && name === "data-positioned" || current === this.composingInput && name === "value" || current === this.holdElement && this.holdStarted && ["style","aria-busy"].includes(name);
      for (const attribute of [...current.attributes]) if (!next.hasAttribute(attribute.name) && !owned(attribute.name)) current.removeAttribute(attribute.name);
      for (const attribute of next.attributes) if (!owned(attribute.name) && current.getAttribute(attribute.name) !== attribute.value) current.setAttribute(attribute.name, attribute.value);
    }

    patchNavigation(current, next) {
      // This is an enhancer-owned boundary: never remove its canvas, indicator,
      // capture owner, runtime data attributes or per-frame CSS properties.
      for (const name of ["data-active-index", "aria-label"]) if (current.getAttribute(name) !== next.getAttribute(name)) current.setAttribute(name, next.getAttribute(name));
      const buttons = [...current.querySelectorAll(":scope > button")];
      for (const wanted of next.querySelectorAll(":scope > button")) {
        const button = buttons.find(candidate => candidate.dataset.action === wanted.dataset.action);
        if (!button) continue;
        const preview = button.classList.contains("glass-preview");
        this.syncAttributes(button, wanted);
        if (preview) button.classList.add("glass-preview");
        this.patchChildren(button, wanted);
      }
    }

    patchNode(current, next) {
      if (current.nodeType !== Node.ELEMENT_NODE) {
        if (current.nodeValue !== next.nodeValue) current.nodeValue = next.nodeValue;
        return;
      }
      if (current.matches("nav[data-liquid-nav]") && next.matches("nav[data-liquid-nav]")) { this.patchNavigation(current, next); return; }
      // A rig owns its animation nodes and clocks. Ordinary data renders must
      // not sync away its temporary response layer or restart its base loop.
      if(current.dataset.mascotSignature && current.dataset.mascotSignature===next.dataset.mascotSignature) {
        for(const name of ["role","aria-label","aria-hidden"]) {
          if(next.hasAttribute(name))current.setAttribute(name,next.getAttribute(name));
          else current.removeAttribute(name);
        }
        return;
      }
      this.syncAttributes(current, next);
      if (current instanceof HTMLInputElement || current instanceof HTMLTextAreaElement || current instanceof HTMLSelectElement) {
        // A state render must not close the keyboard, reset the caret or break
        // an in-progress IME composition. Inputs still reflect actual state.
        if (current !== this.composingInput && current.value !== next.value) current.value = next.value;
        if (current instanceof HTMLInputElement) current.checked = next.checked;
      }
      this.patchChildren(current, next);
    }

    patchChildren(current, next) {
      const available = [...current.childNodes], retained = new Set();
      let cursor = current.firstChild;
      for (const wanted of [...next.childNodes]) {
        const key = this.domKey(wanted);
        const existing = available.find(node => !retained.has(node) && this.domKey(node) === key && node.nodeType === wanted.nodeType && node.nodeName === wanted.nodeName);
        const node = existing || wanted;
        if (existing) this.patchNode(existing, wanted);
        retained.add(node);
        if (node !== cursor) current.insertBefore(node, cursor);
        cursor = node.nextSibling;
      }
      for (const node of available) if (!retained.has(node)) node.remove();
    }

    patchPage(current, next, sameContent) {
      if (!current || current.tagName !== next.tagName) { document.getElementById("app").replaceChildren(next); return; }
      // The complete next frame is assembled off-DOM before this synchronous
      // transaction. Keep matching shell, controls and navigation nodes alive;
      // never expose an empty intermediate body or animate the whole page.
      this.patchNode(current, next);
    }

    cancelRouteTransition() {
      const transition=this.routeTransition;
      if(!transition)return;
      this.routeTransition=null;
      clearTimeout(transition.timer);
      for(const animation of transition.animations || [])animation.cancel();
      transition.overlay?.remove();
    }

    captureRouteTransition(previousScreen) {
      this.cancelRouteTransition();
      if(!previousScreen || this.state.activeSession || document.hidden || this.state.reduceMotion || matchMedia("(prefers-reduced-motion: reduce)").matches)return null;
      const body=previousScreen.querySelector(":scope > .screen-body");
      const app=document.getElementById("app");
      if(!body || typeof body.animate!=="function")return null;
      const rect=body.getBoundingClientRect(),parent=app.getBoundingClientRect();
      if(rect.width<=0 || rect.height<=0)return null;
      const clone=body.cloneNode(true),prefix=`route-${++this.routeTransitionSequence}-`,ids=new Map();
      for(const node of clone.querySelectorAll("[id]")){ids.set(node.id,prefix+node.id);node.id=prefix+node.id;}
      // The outgoing layer is a visual snapshot, never a second interactive
      // route. Namespace SVG references and strip action/form identities.
      for(const node of [clone,...clone.querySelectorAll("*")]) {
        node.removeAttribute("data-action");node.removeAttribute("data-hold");node.removeAttribute("name");
        for(const attribute of [...node.attributes]) {
          let value=attribute.value.replace(/url\(#([^)]+)\)/g,(all,id)=>`url(#${ids.get(id)||id})`);
          if(["href","xlink:href"].includes(attribute.name) && value.startsWith("#"))value=`#${ids.get(value.slice(1))||value.slice(1)}`;
          if(["for","aria-labelledby","aria-describedby","aria-controls"].includes(attribute.name))value=value.split(/\s+/).map(id=>ids.get(id)||id).join(" ");
          if(value!==attribute.value)node.setAttribute(attribute.name,value);
        }
      }
      const overlay=document.createElement("div");
      overlay.className=`v11-route-snapshot ${[...previousScreen.classList].filter(name=>name!=="screen" && !name.startsWith("page-frame")).join(" ")}`;
      overlay.dataset.v11Snapshot="true";overlay.setAttribute("aria-hidden","true");overlay.setAttribute("inert","");
      overlay.style.cssText=`left:${rect.left-parent.left}px;top:${rect.top-parent.top}px;width:${rect.width}px;height:${rect.height}px;`;
      clone.style.cssText="width:100%;height:100%;min-height:0;margin:0;overflow:hidden;opacity:1;";
      overlay.append(clone);
      return {overlay,clone,scrollTop:body.scrollTop,scrollLeft:body.scrollLeft,svgTimes:[...body.querySelectorAll("svg")].map(svg=>typeof svg.getCurrentTime==="function"?svg.getCurrentTime():0)};
    }

    playRouteTransition(snapshot) {
      const app=document.getElementById("app"),body=app.querySelector(".screen > .screen-body");
      if(!body || typeof body.animate!=="function")return;
      app.append(snapshot.overlay);
      snapshot.clone.scrollTop=snapshot.scrollTop;snapshot.clone.scrollLeft=snapshot.scrollLeft;
      [...snapshot.clone.querySelectorAll("svg")].forEach((svg,index)=>{if(typeof svg.pauseAnimations==="function"){svg.pauseAnimations();svg.setCurrentTime(snapshot.svgTimes[index] || 0);}});
      const timing={duration:170,easing:"cubic-bezier(.2,0,.2,1)",fill:"both"};
      const transition={overlay:snapshot.overlay,animations:[snapshot.overlay.animate([{opacity:1},{opacity:0}],timing),body.animate([{opacity:0},{opacity:1}],timing)]};
      this.routeTransition=transition;
      const cleanup=()=>{if(this.routeTransition===transition)this.cancelRouteTransition();};
      transition.animations[1].finished.then(cleanup,cleanup);
      transition.timer=setTimeout(cleanup,240);
    }

    render(options = {}) {
      const gestureState=window.DramaLiquidGlass?.diagnostics?.().gestureState;
      const navGestureActive=["pressed","holding","dragging"].includes(gestureState);
      if(options.reason==="clock" && this.renderedScreen===this.state.screen && navGestureActive) {
        this.deferClockRender();
        return;
      }
      if(this.renderedScreen!==this.state.screen){clearTimeout(this.clockRenderFlushTimer);this.clockRenderFlushTimer=null;this.clockRenderDeferred=false;}
      this.updateDerivedState();
      this.applyThemeToDocument();
      const app = document.getElementById("app");
      const previousScreen = app.querySelector(".screen");
      const sameScreen = this.renderedScreen === this.state.screen;
      const routeSnapshot=!sameScreen?this.captureRouteTransition(previousScreen):null;
      const sameContent = sameScreen && (this.state.screen !== "18" || this.renderedRehearsalMode === this.state.rehearsalMode);
      const focused=document.activeElement;
      const focusData=focused && app.contains(focused) ? {id:focused.id,action:focused.dataset.action,itemId:focused.dataset.id,theme:focused.dataset.theme,value:focused.dataset.value,index:focused.dataset.index,sound:focused.dataset.sound,selection:typeof focused.selectionStart==="number"?[focused.selectionStart,focused.selectionEnd]:null} : null;
      const scrollPositions = sameContent ? [...app.querySelectorAll("*")].filter(node => node.classList.contains("screen-body") || node.scrollTop || node.scrollLeft).map(node => ({node, top:node.scrollTop, left:node.scrollLeft})) : [];
      const template=document.createElement("template");
      const localize=window.DramaAlarmI18n?.localizeHTML || (html=>html);
      template.innerHTML=localize(Screens.render(this.state.screen,this.state));
      const nextScreen = template.content.querySelector(".screen");
      this.assemblePageFrame(nextScreen);
      this.patchPage(previousScreen, nextScreen, sameContent);
      for (const position of scrollPositions) if (position.node.isConnected) { position.node.scrollTop=position.top; position.node.scrollLeft=position.left; }
      if (!sameContent) { const body=app.querySelector(".screen-body"); if(body) { body.scrollTop=0; body.scrollLeft=0; } }
      this.renderedScreen = this.state.screen;
      this.renderedRehearsalMode = this.state.rehearsalMode;
      this.syncTimeWheels(!sameScreen);
      app.querySelector(".screen")?.classList.toggle("is-scrolled",(app.querySelector(".screen-body")?.scrollTop || 0)>3);
      if (!sameScreen || options.reason==="language") document.getElementById("scene-list").innerHTML = localize(Screens.renderSceneList(this.state.screen));
      document.querySelectorAll('[data-action="toggle-scenes"]').forEach((button) => button.setAttribute("aria-expanded", document.getElementById("scene-panel").classList.contains("is-open")));
      const screenName = screenCatalog.flatMap((group) => group.items).find(([id]) => id === this.state.screen)?.[1] || "Drama Alarm";
      const announcer = document.getElementById("screen-announcer");
      const translatedName=window.DramaAlarmI18n?.text?.(screenName) || screenName;
      if (announcer && announcer.textContent !== translatedName) announcer.textContent = translatedName;
      if (sameContent && focusData && !focused.isConnected) {
        const match=focusData.id ? document.getElementById(focusData.id) : [...app.querySelectorAll("[data-action]")].find(node=>node.dataset.action===focusData.action && node.dataset.id===focusData.itemId && node.dataset.theme===focusData.theme && node.dataset.value===focusData.value && node.dataset.index===focusData.index && node.dataset.sound===focusData.sound);
        if(match) {match.focus({preventScroll:true});if(focusData.selection && match.setSelectionRange) try{match.setSelectionRange(...focusData.selection);}catch{}}
      } else if (!sameScreen && !(previousScreen?.classList.contains("page-frame--tabs") && ["01","12","14"].includes(this.state.screen) && focused?.closest?.("nav[data-liquid-nav]"))) {
        const heading=app.querySelector("h1, h2");if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
      }
      if(this.state.persistenceError) this.showPersistenceError();
      if(routeSnapshot)this.playRouteTransition(routeSnapshot);
      else if(this.state.reduceMotion)this.cancelRouteTransition();
      window.DramaAlarmMascotMotion?.scan?.();
      document.dispatchEvent(new CustomEvent("drama-screen-rendered",{detail:{screen:this.state.screen}}));
    }

    deferClockRender() {
      this.clockRenderDeferred=true;
      if(this.clockRenderFlushTimer)return;
      const screen=this.state.screen;
      const flush=()=>{
        this.clockRenderFlushTimer=null;
        if(this.state.screen!==screen){this.clockRenderDeferred=false;return;}
        const gesture=window.DramaLiquidGlass?.diagnostics?.().gestureState;
        if(["pressed","holding","dragging"].includes(gesture)){this.clockRenderFlushTimer=setTimeout(flush,60);return;}
        this.clockRenderDeferred=false;
        this.render({reason:"clock"});
      };
      this.clockRenderFlushTimer=setTimeout(flush,60);
    }

    assemblePageFrame(screen) {
      if(!screen)return;
      const id=this.state.screen;
      const spec=window.DramaAlarmShellRegistry?.[id];
      screen.classList.add("page-frame");
      screen.dataset.pageKind=spec?.kind || "detail";
      screen.dataset.teachingMode=id==="18"?this.state.rehearsalMode:"";
      let body=screen.querySelector(":scope > .screen-body");
      if(!body){
        body=document.createElement("div");body.className="screen-body curtain-stage-body";
        const curtain=screen.querySelector(".curtain-content");if(curtain)body.append(curtain);
        screen.append(body);
      }
      body.dataset.slot="content";
      let status=screen.querySelector(":scope > .status-bar");
      if(!status){const statusTemplate=document.createElement("template");const html=Screens.renderStatus(this.state,screen.classList.contains("screen--dark"));statusTemplate.innerHTML=window.DramaAlarmI18n?.localizeHTML?.(html) || html;status=statusTemplate.content.firstElementChild;screen.prepend(status);}
      status.dataset.slot="status";
      const chromeTemplate=document.createElement("template"),chrome=Screens.renderPageToolbar(id,this.state);chromeTemplate.innerHTML=window.DramaAlarmI18n?.localizeHTML?.(chrome) || chrome;
      const generated=chromeTemplate.content.firstElementChild;
      let toolbar=body.querySelector(":scope > [data-slot=toolbar], :scope > .detail-head, :scope > .screen-head, :scope > .v5-topline, :scope > .page-heading");
      if(id==="18") {toolbar?.remove();toolbar=generated;}
      else if(!toolbar)toolbar=generated;
      toolbar.classList.add("page-toolbar");toolbar.dataset.slot="toolbar";
      // Some legacy pages already own a Back header. Keep its layout, but do
      // not drop contextual controls from the generated chrome.
      const guideExit=generated.querySelector('[data-action="onboarding-replay-exit"]');
      if(guideExit && !toolbar.querySelector('[data-action="onboarding-replay-exit"]')){
        const spacer=toolbar.querySelector(':scope > .toolbar-spacer:last-child');
        if(spacer)spacer.replaceWith(guideExit);else toolbar.append(guideExit);
      }
      if(guideExit)toolbar.classList.add('v11-guide-toolbar');
      if(id==="02")toolbar.classList.add("editor-toolbar");
      if(["01","12","14"].includes(id))toolbar.classList.add("root-toolbar");
      if(spec?.requiredActions.includes("open-emergency")){
        const existing=toolbar.querySelector('[data-action="open-emergency"]');
        if(!existing){const emergency=generated.querySelector('[data-action="open-emergency"]');if(emergency)toolbar.append(emergency);}
        body.querySelectorAll('[data-action="open-emergency"]').forEach(node=>{if(!toolbar.contains(node))node.remove();});
      }
      toolbar.querySelectorAll("button").forEach(button=>button.classList.add("toolbar-button"));
      screen.insertBefore(toolbar,body);
      if(["25","26","27","28"].includes(id) && this.state.settingScope==="defaults" && !body.querySelector(".scope-caption")){
        const scope=document.createElement("p");scope.className="scope-caption";scope.textContent=window.DramaAlarmI18n?.text?.("New alarm defaults · existing alarms stay unchanged") || "New alarm defaults · existing alarms stay unchanged";body.prepend(scope);
      }
      // Page titles now belong to fixed chrome. Story headings stay in the scroll region.
      for(const heading of body.querySelectorAll("h1")){
        const replacement=document.createElement("h2");for(const attribute of heading.attributes)replacement.setAttribute(attribute.name,attribute.value);
        replacement.append(...heading.childNodes);heading.replaceWith(replacement);
      }
      const nav=screen.querySelector(":scope > .bottom-nav");
      if(nav){nav.dataset.slot="tabs";screen.classList.add("page-frame--tabs");screen.append(nav);return;}
      const dock=document.createElement("div");dock.className="page-dock";dock.dataset.slot="dock";
      const keypad=body.querySelector(":scope > .keypad");
      if(keypad){dock.classList.add("page-dock--keypad");dock.append(keypad);screen.classList.add("page-frame--keypad");}
      else if(id==="10"){
        const selected=body.querySelector(".selected-sound-bar");if(selected)dock.append(selected);
      } else if(id==="15") {
        const alternative=body.querySelector('[data-action="emergency-confirm-stop"], :scope > [data-action="emergency-alternative"]');
        if(alternative)dock.append(alternative);
        body.querySelectorAll('[data-action="cancel-emergency"]').forEach(node=>node.remove());
      } else if(["52","53"].includes(id)) {
        const stack=[...body.querySelectorAll(":scope > .button-stack")].at(-1);
        if(stack)dock.append(stack);
      } else if(id!=="02") {
        const stack=[...body.querySelectorAll(":scope > .button-stack")].at(-1);
        const primary=stack?.querySelector(":scope > .primary");if(primary)dock.append(primary);
        if(id==="13"){const hold=stack?.querySelector("[data-hold=stand]");if(hold){dock.classList.add("page-dock--hold");dock.append(hold);}}
      } else {
        body.querySelectorAll('.editor-actions [data-action="save-alarm"]').forEach(node=>node.remove());
      }
      body.querySelectorAll(".button-stack,.editor-actions").forEach(node=>{if(!node.childElementCount)node.remove();});
      if(dock.childElementCount){screen.classList.add("page-frame--docked");screen.append(dock);}
    }

    go(screen, options) {
      const opts = options || {};
      if(this.onboardingReplay && !["08","37","38","39","40","45","52","53"].includes(screen)) {
        this.finishOnboardingReplay({history:opts.history});
        return;
      }
      const origin=this.state.screen;
      this.rememberExpansion();
      if (origin !== screen) this.cancelHold();
      this.routeScroll[origin]=document.querySelector(".screen-body")?.scrollTop || 0;
      clearTimeout(this.transitionTimer);
      if (this.state.screen === "22") clearInterval(this.wakeTimer);
      if (!opts.keepPreview) this.stopPreview(false);
      if (["37", "38", "39"].includes(this.state.screen) && !["37", "38", "39", "40"].includes(screen)) this.state.themePreviewId = null;
      this.state.screen = screen;
      this.render();
      this.restoreExpansion();
      if (screen === "16") {
        this.soundEngine.cue("curtain");
        if (opts.ring !== false) this.startRinging();
        this.transitionTimer = setTimeout(() => this.go("03", { keepPreview: true }), this.fast ? 180 : 1500);
      }
      // Wrong answers remain visible until the user explicitly continues.
      if (screen === "22") {
        clearTimeout(this.scheduledWakeTimer);
        this.state.wakeCheckDueAt = 0;
        this.startWakeCountdown();
      }
      document.getElementById("scene-panel").classList.remove("is-open");
      if(opts.history !== false && origin!==screen) {
        this.routeStack.push(screen);
        history.pushState({dramaAlarm:true,screen,onboardingReplay:Boolean(this.onboardingReplay),guideOrigin:this.onboardingReplay?.context.screen || null},"",location.href);
      }
      const body=document.querySelector(".screen-body");if(body){body.scrollTop=opts.fresh?0:this.routeScroll[screen] || 0;body.closest(".screen")?.classList.toggle("is-scrolled",body.scrollTop>3);}
      this.save();
    }

    async handle(action, element) {
      const handlers = {
        "open-product": () => this.openProduct(element.dataset.product),
        "purchase-product": () => this.purchaseProduct(),
        "purchase-back": () => {if(this.state.productReturnScreen==="39")this.state.themePreviewId=this.state.pendingThemeId;this.go(this.state.productReturnScreen || "14",{restoreScroll:true});},
        "continue-free": () => {if(this.onboardingReplay){this.finishOnboardingReplay();return;}this.state.adFreeOnboardingSeen=true;this.save();this.beginNewAlarm();},
        "onboarding-replay": () => this.beginOnboardingReplay(),
        "onboarding-replay-exit": () => this.finishOnboardingReplay(),
        "qa-grant-product": () => this.grantTestProduct(element.dataset.product || this.state.purchaseProduct?.id),
        "set-time-part": () => this.setTimePart(element.dataset.part,Number(element.dataset.value)),
        "step-time": () => {const part=element.dataset.part,index=part==="hour"?0:1,current=Number(this.state.alarm.time.split(":")[index]);this.setTimePart(part,current+Number(element.dataset.step || 1));},
        "set-day-preset": () => {const choices={weekdays:[1,2,3,4,5],weekends:[0,6],everyday:[0,1,2,3,4,5,6]};const days=choices[element.dataset.value];if(!days)return;this.state.alarm.repeatMode="weekly";this.state.alarm.days=days;this.state.editorError="";this.save();this.render();},
        "mascot-tap": () => {const context=element.dataset.context || (this.state.screen==="12"?"run":"home");window.DramaAlarmMascot?.respond?.(element,context);},
        "take-stage": async () => { this.beginThemeSelection("onboarding"); },
        "quick-create-alarm": () => {if(!this.state.intensityOnboardingComplete){this.state.alarm=this.clone(this.state.defaults);this.beginThemeSelection("onboarding");}else this.beginNewAlarm();},
        "skip-tutorial": () => {this.stopPreview(false);this.go(this.state.tutorialReturn || (this.state.alarms.length?"01":"02"));},
        "start-tutorial": () => {this.state.tutorialReturn=this.state.screen;this.state.rehearsalMode="sound";this.go("18");},
        "confirm-sound-check": () => {this.state.audioStatus=this.soundEngine.getStatus();this.state.soundCheckConfirmed=this.state.audioStatus.engineReady===true && this.state.lastPreviewSoundId===this.state.soundId;this.state.soundCheckSoundId=this.state.soundCheckConfirmed?this.state.soundId:null;this.save();this.toast(this.state.soundCheckConfirmed?"Listening check confirmed on this device":"Play a sound first, then confirm you heard it");this.render();},
        "resume-ringing": async () => {await this.startRinging();this.state.audioResumeRequired=!this.state.audioStatus?.engineReady;this.render();},
        "set-repeat-mode": () => {this.state.alarm.repeatMode=element.dataset.value;if(this.state.alarm.repeatMode==="once")this.setNextOnceDate();this.state.editorError="";this.state.editorErrorField="";this.render();this.save();},
        "set-once-date": () => {this.state.alarm.onceDate=element.value || element.dataset.value;this.save();},
        "select-theme": () => this.selectTheme(element.dataset.theme || element.dataset.value),
        "confirm-theme": () => this.confirmTheme(),
        "apply-theme": () => this.confirmTheme(),
        "open-themes": () => this.beginThemeSelection("settings"),
        "open-theme-studio": () => this.beginThemeSelection("settings"),
        "preview-theme": () => this.previewTheme(element.dataset.theme || element.dataset.value),
        "theme-preview-back": () => this.cancelThemePreview(),
        "cancel-theme-preview": () => this.cancelThemePreview(),
        "theme-studio-back": () => this.leaveThemeStudio(),
        "theme-back": () => {
          if (this.state.screen === "52") this.go("45",{restoreScroll:true});
          else if (this.state.screen === "45") this.go("37",{restoreScroll:true});
          else this.leaveThemeStudio();
        },
        "open-future-themes": () => { this.state.futureThemeReturnScreen = this.state.screen; this.go("40"); },
        "close-future-themes": () => this.go(this.state.futureThemeReturnScreen || "38"),
        "future-theme-back": () => this.go(this.state.futureThemeReturnScreen || "38"),
        "preview-future-theme": () => {
          const names = { midnight: "Midnight Matinée", sunrise: "Golden Encore" };
          this.state.futureThemeName = element.dataset.name || names[element.dataset.theme] || "Future collections";
          this.toast(`${this.state.futureThemeName} is a concept for a future release. No purchase is available yet.`);
        },
        "allow-access": () => this.allowAccess(),
        "permission-not-now": () => { this.state.permission = false; this.state.permissionStatus = "skipped"; this.save(); this.go(this.state.permissionReturnScreen === "18" ? "18" : "01"); },
        "preview-onboarding-sound": () => this.previewSound(element.dataset.sound || this.state.soundId, true),
        "select-onboarding-sound": () => this.previewSound(element.dataset.sound, true),
        "rehearsal-sound-continue": () => { this.stopPreview(false); this.state.rehearsalMode = "math"; this.render(); },
        "rehearsal-digit": () => this.appendRehearsal(element.dataset.value),
        "rehearsal-backspace": () => { this.state.rehearsalInput = this.state.rehearsalInput.slice(0, -1); this.state.rehearsalError = ""; this.updateAnswerInput(true); },
        "rehearsal-submit": () => this.submitRehearsal(),
        "rehearsal-riddle": () => this.answerRehearsalRiddle(Number(element.dataset.index)),
        "set-first-alarm": () => {this.state.tutorialComplete=true;this.save();if(this.state.alarms.length)this.go("01");else this.beginNewAlarm();},
        "new-alarm": () => this.beginNewAlarm(),
        "discard-editor": () => {this.closeModal();this.cancelEditor();},
        "edit-alarm": () => this.beginEditAlarm(element.dataset.id),
        "save-alarm": () => this.saveAlarm(),
        "delete-alarm": () => this.go("32"),
        "confirm-delete-alarm": () => this.confirmDeleteAlarm(),
        "cancel-delete": () => this.go("02"),
        "test-alarm": () => this.scheduleTest(),
        "cancel-test": () => this.cancelTest(),
        "done-ready": () => { this.state.onboarded = true; this.save(); this.go("01"); },
        "toggle-alarm": () => this.toggleAlarm(element.dataset.id),
        "toggle-day": () => this.toggleDay(Number(element.dataset.index)),
        "set-difficulty": () => this.setChallengeDifficulty(element.dataset.value),
        "cycle-difficulty": () => this.cycleDifficulty(),
        "toggle-riddle": () => this.toggleAlarmSetting("riddle"),
        "toggle-rising": () => this.toggleAlarmSetting("rising"),
        "toggle-quieter": () => this.toggleAlarmSetting("quieter"),
        "toggle-check": () => this.toggleAlarmSetting("check"),
        "toggle-haptics": () => { this.state.haptics = !this.state.haptics; this.save(); this.render(); },
        "open-editor-sounds": () => { this.state.soundReturnScreen = "02"; this.go("10"); },
        "start-act": () => {if(this.state.alarm.quieter)this.setRingIntensity(Math.min(this.state.masterVolume,58));if(this.state.challengePlan?.version===8)this.routeCurrentChallenge();else{this.state.math.input="";this.go("04",{keepPreview:true});}},
        "math-digit": () => this.appendMath(element.dataset.value),
        "math-backspace": () => { this.state.math.input = this.state.math.input.slice(0, -1); this.updateAnswerInput(false); },
        "math-submit": () => this.submitMath(),
        "retry-math": () => { this.state.math.input = ""; this.go("04", { keepPreview: true }); },
        "open-safety-math": () => this.openSafety("math"),
        "riddle-answer": () => this.answerRiddle(Number(element.dataset.index)),
        "next-riddle": () => this.state.riddleWrong>=3?this.openSafety("riddle"):this.nextRiddle(),
        "open-safety-riddle": () => this.openSafety("riddle"),
        "safety-continue": () => this.continueSafety(),
        "noop": () => {},
        // Pointer-hold handlers own progress and completion; a click alone does nothing.
        "hold-emergency": () => {},
        "hold-stand": () => {},
        "open-emergency": () => { this.state.previousScreen = this.state.screen;this.state.emergencyAlternative=false; this.go("15", { keepPreview: true }); },
        "emergency-alternative": () => {this.cancelHold();this.state.emergencyAlternative=true;this.state.emergencyCode="";this.render();document.getElementById("emergency-stop-code")?.focus();},
        "emergency-confirm-stop": () => this.finishEmergency(),
        "cancel-emergency": () => this.go(this.state.previousScreen || "03", { keepPreview: true }),
        "take-bow": () => { this.state.onboarded = true; this.save();if(!this.startNextQueued())this.restoreCompletedContext(); },
        "preview-check": () => this.startWakeCheckPreview(),
        "wake-confirm": () => this.confirmWakeCheck(),
        "wake-timeout": () => this.wakeTimeout(),
        "review-access": () => { this.state.permissionReturnScreen = "19"; this.go("17"); },
        "ios-stop": () => { this.stopRinging(); this.toast("System alert stopped · open the app to continue your show"); this.go("01"); },
        "ios-start": () => { this.resetChallenge("alarm"); this.go("16", { ring: true }); },
        "go-home": () => {if(this.onboardingReplay){this.finishOnboardingReplay();return;}this.stopPreview(false);if(this.state.editorOpen)this.cancelEditor();else this.go("01"); },
        "open-settings": () => {
          const alarm = this.state.defaults;
          this.state.alarm = this.clone(alarm);
          this.state.soundId = alarm.soundId;
          this.state.masterVolume = alarm.maxVolume;
          this.state.settingsReturnScreen = "14";
          this.state.settingScope="defaults";
          this.go("14");
        },
        "open-run": () => this.go("12"),
        "open-language": () => {this.state.languageReturnScreen=this.state.screen;this.go("51");},
        "set-language": () => {const language=element.dataset.locale;if(!["zh-CN","en"].includes(language))return;this.state.language=language;window.DramaAlarmI18n?.setLocale(language);document.documentElement.lang=language;if(this.save())this.go(this.state.languageReturnScreen || "14",{restoreScroll:true});},
        "open-sounds": () => { this.state.soundReturnScreen = "14"; this.go("10"); },
        "open-pass": () => this.openProduct("ad-free"),
        "close-pass": () => this.go(this.state.passReturnScreen || "10",{restoreScroll:true}),
        "pass-back": () => this.go(this.state.passReturnScreen || "10",{restoreScroll:true}),
        "preview-sound": () => this.previewSound(element.dataset.sound, false),
        "preview-premium-sound": () => this.previewSound(element.dataset.sound, false),
        "select-sound": () => this.previewSound(element.dataset.sound, true),
        "stop-preview": () => this.stopPreview(true),
        "confirm-sound": () => this.confirmSound(),
        "select-plan": () => { this.state.plan = element.dataset.value; this.render(); },
        "start-trial": () => this.purchaseProduct(),
        "purchase-preview-done": () => this.purchaseProduct(),
        "restore-purchase": () => this.go("35"),
        "manage-subscription": () => this.toast(this.copy("当前没有可管理的商店订阅。正式订阅将通过对应商店管理。","There is no connected store subscription to manage. Future subscriptions will be managed through the purchasing store.")),
        "restore-retry": () => this.toast(this.copy("购买服务尚未开通，未查询或改变任何购买权益。","Purchasing is not available yet. No purchase rights were checked or changed.")),
        "show-achievement": () => {
          this.state.selectedAchievement = {
            name: element.dataset.name,
            copy: element.dataset.copy || "Keep showing up to unlock this curtain call",
            count: element.dataset.count ?? element.querySelector("b")?.textContent?.trim() ?? "01",
            earned: element.dataset.earned === undefined ? element.classList.contains("is-earned") : element.dataset.earned === "true",
          };
          this.go("31");
        },
        "open-difficulty": () => this.openSettingDetail("25"),
        "open-riddle-settings": () => this.openSettingDetail("26"),
        "open-volume-settings": () => this.openSettingDetail("27"),
        "open-check-settings": () => this.openSettingDetail("28"),
        "open-emergency-rules": () => this.openSettingDetail("29"),
        "open-haptic-settings": () => this.openSettingDetail("30"),
        "open-access-settings": () => this.openSettingDetail("36"),
        "settings-back": () => this.returnFromSettingDetail(),
        "detail-back": () => this.go(this.state.detailReturnScreen || "14",{restoreScroll:true}),
        "open-help": () => this.openDetail("41"),
        "open-privacy": () => this.openDetail("42"),
        "open-diagnostics": () => this.openDetail("43"),
        "open-results": () => this.openDetail("44"),
        "download-diagnostics": () => this.downloadDiagnostics(),
        "contact-support": () => {this.toast("Review the public issue form before sharing. No alarm data is attached.");window.open("https://github.com/dodgey512-Blake/drama-alarm-mvp-pages/issues/new","_blank","noopener,noreferrer");},
        "select-difficulty-detail": () => this.setChallengeDifficulty(element.dataset.value),
        "finish-intensity-onboarding": () => {this.state.intensityOnboardingComplete=true;this.state.defaults={...this.clone(this.state.alarm),id:"defaults",taskPlanVersion:8};this.save();if(this.onboardingReplay || !this.state.adFreeOnboardingSeen)this.go("52");else this.beginNewAlarm();},
        "apply-v8-plan": () => {this.state.alarm.taskPlanVersion=8;this.state.alarm.questionTopic=Challenges.topicOf(this.state.alarm.questionTopic);this.persistDetailChange();this.render();this.toast("New question plan applied to this draft. Save to keep it.");},
        "open-question-library": () => this.openQuestionLibrary(),
        "question-library-back": () => this.go(this.state.libraryReturnScreen || "14",{restoreScroll:true}),
        "open-question-pack": () => {const id=element.dataset.pack || element.dataset.value;if(QuestionBank?.getPack?.(id)){this.state.activePackId=id;this.go("47");}},
        "question-pack-back": () => this.go(["48","49"].includes(this.state.screen)?"47":"46",{restoreScroll:true}),
        "select-question-topic": () => this.selectQuestionTopic(element.dataset.value || element.dataset.pack),
        "confirm-question-topic": () => {this.closeModal();this.selectQuestionTopic(element.dataset.value,true);},
        "try-pack-sample": () => this.openPackSample(),
        "answer-pack-sample": () => this.answerPackSample(Number(element.dataset.index)),
        "next-pack-sample": () => this.openPackSample(true),
        "prepare-question-pack": () => this.prepareQuestionPack(),
        "retry-question-pack": () => this.prepareQuestionPack(),
        "open-offline-questions": () => this.go("49"),
        "refresh-question-catalog": async () => {try{await QuestionBank?.refreshCatalog?.();this.toast("Content catalog checked. Installed questions remain available.");}catch{this.toast("Catalog unavailable. Local questions are still ready.");}this.render();},
        "open-character-settings": () => {this.state.characterReturnScreen=this.state.screen;this.go("50");},
        "character-back": () => this.go(this.state.characterReturnScreen || "14"),
        "toggle-reduced-motion": () => {this.state.reduceMotion=!this.state.reduceMotion;this.save();this.render();},
        "switch-basic-question": () => {if(this.state.challengePlan?.version===8 && Challenges.current(this.state.challengePlan)?.kind==="choice"){this.state.safetyReturnScreen=this.state.screen;this.state.safetyKind="v8-switch";this.state.safetyTargetLevel="Gentle";this.go("21",{keepPreview:true});}},
        "cancel-switch-basic": () => {if(this.state.safetyKind!=="v8-switch")return;this.go(["06","20"].includes(this.state.safetyReturnScreen)?this.state.safetyReturnScreen:"06",{keepPreview:true});},
        "confirm-switch-basic": () => this.continueSafety(),
        "select-check-delay": () => { this.state.alarm.checkDelay = Number(element.dataset.value); this.state.alarm.check = true; if(this.persistDetailChange()!==false)this.returnFromSettingDetail();else this.render(); },
        "preview-strategy-volume": () => this.previewSound(element.dataset.sound || this.state.alarm.soundId, false),
        "toggle-haptic-cue": () => { const key = element.dataset.value; this.state.hapticCues[key] = !this.state.hapticCues[key]; this.state.haptics = Object.values(this.state.hapticCues).some(Boolean); this.save(); this.render(); },
        "test-haptics": () => { this.vibrate([35, 45, 65], "preview"); this.soundEngine.cue("success"); this.toast("Haptic cue previewed where supported"); },
        "refresh-access": () => { this.state.permissionReturnScreen = "36"; return this.allowAccess(); },
        "jump-screen": () => { this.stopRinging(); this.go(element.dataset.screen, { ring: false }); },
        "toggle-scenes": () => this.toggleScenes(),
        "open-info": () => this.openInfo(),
        "reset-demo": () => this.openResetDemo(),
        "confirm-reset-demo": () => this.confirmResetDemo(),
        "close-modal": () => this.closeModal(),
      };
      if (handlers[action]) return handlers[action]();
      return undefined;
    }

    copy(zh,en) { return this.state.language==="en"?en:zh; }

    hasProduct(id) {
      // Test rights are memory-only and require a separately flagged internal
      // build. They are never receipts and never imported from legacy storage.
      return Boolean(window.DRAMA_INTERNAL_BUILD===true && this.qa && this.state.productAccess?.includes(id));
    }

    getProduct(id) {
      if(!id || typeof id!=="string")return null;
      const products=window.DramaAlarmData.commerce?.products || window.DramaAlarmCommerce?.products || [];
      const item=Array.isArray(products)?products.find(p=>p.id===id || p.sku===id):products[id];
      if(item)return {...item,id};
      if(id==="ad-free")return {id,type:"ad-free",name:this.copy("无广告舞台","An ad-free stage"),description:this.copy("一次购买，永久免广告。额外铃声、题库与主题单独购买。","One purchase, no ads. Extra sounds, question packs and themes are sold separately."),price:2.99,currency:"USD"};
      const [type,itemId]=id.split(":");
      const source=type==="sound"?soundPresets.find(p=>p.id===itemId):type==="theme"?themes.find(p=>p.id===itemId):type==="pack"?QuestionBank?.getPack?.(itemId):null;
      if(!source || (type==="sound"?!source.premium:source.free===true))return null;
      return {id,type,itemId,name:source.name || source.title,description:source.description || source.subtitle || "",price:1.99,currency:"USD"};
    }

    openProduct(id) {
      const product=this.getProduct(id);if(!product)return;
      this.state.purchaseProduct=product;
      if(this.state.screen!=="53")this.state.productReturnScreen=this.state.screen;
      this.go("53");
    }

    purchaseProduct() {
      this.stopPreview(false);
      this.toast(this.copy("商店订阅尚未接入，当前无法购买，也不会扣费。","Store subscriptions are not connected. Purchasing is unavailable and no payment is taken."));
    }

    grantTestProduct(id) {
      if(window.DRAMA_INTERNAL_BUILD!==true || !this.qa || !this.getProduct(id))return false;
      this.state.productAccess=[...new Set([...(this.state.productAccess || []),id])];
      this.render();return true;
    }

    rememberExpansion() {
      if(!this.routeExpansion)this.routeExpansion={};
      this.routeExpansion[this.state.screen]=[...document.querySelectorAll("#app details")].map((node,i)=>({key:node.dataset.expandKey || node.id || String(i),open:node.open}));
    }

    restoreExpansion() {
      const saved=this.routeExpansion?.[this.state.screen];if(!saved)return;
      [...document.querySelectorAll("#app details")].forEach((node,i)=>{const key=node.dataset.expandKey || node.id || String(i),record=saved.find(item=>item.key===key);if(record)node.open=record.open;});
    }

    setNextOnceDate(now=new Date()) {
      const [hour,minute]=String(this.state.alarm.time).split(":").map(Number);
      if(!Number.isInteger(hour)||!Number.isInteger(minute)||hour<0||hour>23||minute<0||minute>59)return;
      const candidate=new Date(now);candidate.setHours(hour,minute,0,0);
      if(candidate<=now)candidate.setDate(candidate.getDate()+1);
      this.state.alarm.onceDate=this.localDateKey(candidate);
    }

    setTimePart(part,value,fromWheel=false) {
      if(!["hour","minute"].includes(part)||!Number.isFinite(value))return;
      const values=String(this.state.alarm.time || "06:30").split(":").map(Number),index=part==="hour"?0:1,max=index===0?24:60;
      values[index]=((Math.round(value)%max)+max)%max;
      const time=values.map(v=>String(v).padStart(2,"0")).join(":");
      if(time===this.state.alarm.time)return;
      this.state.alarm.time=time;this.state.editorError="";this.state.editorErrorField="";
      if(this.state.alarm.repeatMode==="once")this.setNextOnceDate();
      const input=document.getElementById("alarm-time");if(input)input.value=time;
      document.querySelectorAll("[data-time-display]").forEach(n=>n.textContent=time);
      this.vibrate(8,"interaction");this.save();
      this.syncTimeWheels(!fromWheel);
    }

    commitWheel(wheel) {
      if(!wheel.isConnected || this.state.screen!=="02")return;
      const viewport=wheel.getBoundingClientRect(),center=viewport.top+viewport.height/2;
      const items=[...wheel.querySelectorAll("[data-time-value]")];
      const nearest=items.reduce((best,item)=>{const r=item.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-center);return !best||d<best.d?{item,d}:best;},null);
      if(nearest)this.setTimePart(wheel.dataset.timeWheel,Number(nearest.item.dataset.timeValue),true);
    }

    syncTimeWheels(position=false) {
      const values=String(this.state.alarm.time || "06:30").split(":").map(Number);
      document.querySelectorAll("[data-time-wheel]").forEach(wheel=>{
        const value=values[wheel.dataset.timeWheel==="hour"?0:1];
        for(const item of wheel.querySelectorAll("[data-time-value]")){
          const selected=Number(item.dataset.timeValue)===value;item.classList.toggle("is-selected",selected);item.setAttribute("aria-selected",String(selected));
          if(selected && (position || !wheel.dataset.positioned)){
            const itemRect=item.getBoundingClientRect(),wheelRect=wheel.getBoundingClientRect();
            wheel.scrollTop+=itemRect.top-wheelRect.top-(wheel.clientHeight-itemRect.height)/2;
          }
        }
        wheel.dataset.positioned="true";
      });
    }

    applyThemeToDocument() {
      const id = this.state.themePreviewId || this.state.themeId;
      if (document.documentElement.dataset.theme !== id) document.documentElement.dataset.theme = id;
      if (document.body.dataset.theme !== id) document.body.dataset.theme = id;
      document.documentElement.dataset.reduceMotion=String(this.state.reduceMotion);
      const phone = document.getElementById("phone");
      if (phone && phone.dataset.theme !== id) phone.dataset.theme = id;
      const meta = document.querySelector('meta[name="theme-color"]');
      const color = {velvet:"#fbf3ec",daybreak:"#f5f8f6",lunar:"#f2f0f9",amber:"#fbf3e6"}[id] || "#f5f8f6";
      if (meta && meta.content !== color) meta.content = color;
    }

    beginThemeSelection(origin) {
      this.state.themeReturn = origin;
      this.state.themeStudioReturnScreen = origin === "onboarding" ? "08" : this.state.screen;
      this.state.themePreviewId = null;
      this.state.pendingThemeId = this.state.themeId;
      this.go(origin === "onboarding" ? "37" : "38");
    }

    beginOnboardingReplay() {
      if(this.onboardingReplay)return;
      if(this.state.activeSession || this.state.testCountdown){this.toast(this.copy("请先完成当前唤醒，再查看使用指引。","Finish this wake-up before viewing the guide."));return;}
      this.rememberExpansion();
      this.closeModal();
      this.routeScroll[this.state.screen]=document.querySelector(".screen-body")?.scrollTop || 0;
      const preferences={};
      for(const key of ["themeId","themePreviewId","pendingThemeId","themeOnboardingComplete","intensityOnboardingComplete","adFreeOnboardingSeen","defaults","onboarded","tutorialComplete","language","permission","permissionStatus","soundCheckConfirmed","soundCheckSoundId","haptics","hapticCues","reduceMotion"])
        preferences[key]=this.clone(this.state[key]);
      this.onboardingReplay={preferences,context:this.captureRouteContext(),expansion:this.clone(this.routeExpansion || {}),saving:false};
      this.stopPreview(false);
      this.state.onboardingReplay=true;
      this.state.themeOnboardingComplete=false;
      this.state.intensityOnboardingComplete=false;
      this.state.adFreeOnboardingSeen=false;
      this.state.editorOpen=false;
      this.state.alarm=this.clone(this.state.defaults);
      this.state.soundId=this.state.alarm.soundId;
      this.state.masterVolume=this.state.alarm.maxVolume;
      this.state.themePreviewId=null;
      this.state.themeReturn="onboarding";
      this.go("08",{fresh:true});
    }

    finishOnboardingReplay(options={}) {
      const replay=this.onboardingReplay;
      if(!replay)return;
      this.stopPreview(false);
      this.onboardingReplay=null;
      Object.assign(this.state,this.clone(replay.preferences));
      const destination=this.applyRouteContext(replay.context);
      this.routeExpansion=this.clone(replay.expansion);
      this.state.onboardingReplay=false;
      window.DramaAlarmI18n?.setLocale(this.state.language);
      if(options.navigate===false){this.state.screen=destination;this.applyThemeToDocument();return;}
      this.go(destination,{history:false,restoreScroll:true});
      history.replaceState({dramaAlarm:true,screen:destination},"",location.href);
      this.toast(this.copy("使用指引已结束","Guide finished"));
    }

    selectTheme(id) {
      if (!themes.some((theme) => theme.id === id && theme.available)) return;
      this.state.pendingThemeId = id;
      this.state.themePreviewId = id;
      this.render();
    }

    previewTheme(id) {
      const selected = id || this.state.pendingThemeId;
      if (!themes.some((theme) => theme.id === selected && theme.available)) return;
      this.state.themePreviewReturnScreen = this.state.screen === "37" ? "37" : "38";
      this.state.pendingThemeId = selected;
      this.state.themePreviewId = selected;
      this.go("39");
    }

    confirmTheme() {
      const selected = this.state.pendingThemeId;
      const theme = themes.find((item) => item.id === selected && item.available);
      if (!theme) return;
      if(!theme.free && !this.hasProduct(`theme:${theme.id}`)){this.openProduct(`theme:${theme.id}`);return;}
      const previous=this.state.themeId;
      this.state.themeId = theme.id;
      this.state.themePreviewId = null;
      if (this.state.themeReturn === "onboarding") this.state.themeOnboardingComplete = true;
      if(!this.save()){this.state.themeId=previous;this.state.themePreviewId=selected;this.render();return;}
      if(this.state.themeReturn === "onboarding"){this.state.onboarded=true;this.state.alarm=this.clone(this.state.defaults);if(!this.state.intensityOnboardingComplete)this.go("45");else this.beginNewAlarm();}
      else this.go(this.state.themeStudioReturnScreen || "14",{restoreScroll:true});
      this.toast(`${theme.name} is your stage`);
    }

    cancelThemePreview() {
      this.state.themePreviewId = null;
      this.state.pendingThemeId = this.state.themeId;
      this.go(this.state.themePreviewReturnScreen || (this.state.themeReturn === "onboarding" ? "37" : "38"));
    }

    leaveThemeStudio() {
      this.state.themePreviewId = null;
      this.state.pendingThemeId = this.state.themeId;
      this.go(this.state.themeReturn === "onboarding" ? "08" : this.state.themeStudioReturnScreen || "14",{restoreScroll:true});
    }

    async allowAccess() {
      let status = "in-tab";
      if (this.fast) status = "granted";
      else if ("Notification" in window) {
        try { status = await Notification.requestPermission(); } catch (_) { status = "in-tab"; }
      }
      this.state.permissionStatus = status;
      this.state.permission = status !== "denied";
      this.save();
      this.toast(status === "granted" ? "Browser notifications allowed · keep this tab open" : status === "denied" ? "Notifications are off · in-tab alarms still work" : this.copy("当前为网页提醒，请保持页面打开。","Browser reminders only. Keep this page open."));
      const destination = this.state.permissionReturnScreen || "18";
      this.state.permissionReturnScreen = "18";
      this.go(destination);
    }

    handleKeyboard(event) {
      const hold=event.target.closest?.("[data-hold]");
      if(hold && [" ","Enter"].includes(event.key)) {event.preventDefault();if(!event.repeat)this.startHold(hold);return;}
      if(event.target.matches?.("input,textarea,select")) return;
      if(event.key==="Enter" && event.target.closest?.("button,[role=button]"))return;
      if (!event.target.closest("#app") || !["04", "18"].includes(this.state.screen)) return;
      const isRehearsalMath = this.state.screen === "18" && this.state.rehearsalMode === "math";
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        if (this.state.screen === "04") this.appendMath(event.key);
        else if (isRehearsalMath) this.appendRehearsal(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        if (this.state.screen === "04") this.state.math.input = this.state.math.input.slice(0, -1);
        else if (isRehearsalMath) this.state.rehearsalInput = this.state.rehearsalInput.slice(0, -1);
        this.updateAnswerInput(isRehearsalMath);
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (this.state.screen === "04") this.submitMath();
        else if (isRehearsalMath) this.submitRehearsal();
      }
    }

    appendRehearsal(value) {
      if (!/^\d$/.test(String(value))) return;
      if (this.state.rehearsalInput.length >= 4) return;
      this.state.rehearsalInput += value;
      this.state.rehearsalError = "";
      this.updateAnswerInput(true);
    }

    updateAnswerInput(rehearsal) {
      const input = rehearsal ? this.state.rehearsalInput : this.state.math.input;
      const answer = document.querySelector(".screen .math-input");
      if (!answer) { this.render(); return; }
      answer.textContent = input;
      const action = rehearsal ? "rehearsal-submit" : "math-submit";
      const button = document.querySelector(`[data-action="${action}"]`);
      if (button) button.disabled = !input;
      if(!rehearsal)this.save();
      if (rehearsal) {
        const hint = document.querySelector(".screen .math-hint");
        if (hint && !this.state.rehearsalError) {
          hint.classList.remove("math-hint--wrong");
          hint.textContent = window.DramaAlarmI18n?.text?.("Finish the answer, then meet The Finale.") || "Finish the answer, then meet The Finale.";
        }
      }
    }

    submitRehearsal() {
      if (!this.state.rehearsalInput) return;
      if (Number(this.state.rehearsalInput) === 25) {
        this.soundEngine.cue("success");
        this.state.rehearsalMode = "riddle";
        this.state.rehearsalError = "";
      } else {
        this.soundEngine.cue("error");
        this.vibrate([35, 35, 35]);
        this.state.rehearsalError = "Not quite — the same sum stays with you.";
        this.state.rehearsalInput = "";
      }
      this.render();
    }

    answerRehearsalRiddle(index) {
      const riddle = riddles[0];
      if (index === riddle.answer) {
        this.soundEngine.cue("success");
        this.state.rehearsalWrong = null;
        this.go("09");
      } else {
        this.soundEngine.cue("error");
        this.state.rehearsalWrong = index;
        this.vibrate([35, 35, 35]);
        this.render();
        setTimeout(() => { if (this.state.screen === "18") { this.state.rehearsalWrong = null; this.render(); } }, this.fast ? 100 : 800);
      }
    }

    beginNewAlarm() {
      if(this.onboardingReplay){this.finishOnboardingReplay();return;}
      if(this.state.intensityOnboardingComplete && !this.state.adFreeOnboardingSeen && !this.state.alarms.length){this.go("52");return;}
      this.state.editorMode = "new";
      this.state.editorError = "";
      this.state.editorErrorField = "";
      this.state.editorSnapshot={alarm:this.clone(this.state.alarm),soundId:this.state.soundId,masterVolume:this.state.masterVolume};
      this.state.editorOpen=true;
      this.state.alarm = this.defaultAlarm(Object.assign({},this.state.defaults,{id:this.defaultAlarm().id,label:this.state.language==="en"?"Morning Show":"晨间演出",enabled:true,taskPlanVersion:8}));
      this.state.soundId=this.state.alarm.soundId;this.state.masterVolume=this.state.alarm.maxVolume;
      this.go("02");
    }

    beginEditAlarm(id) {
      const alarm = this.state.alarms.find((item) => item.id === id) || this.state.alarms[0] || this.state.alarm;
      this.state.editorMode = "edit";
      this.state.editorError = "";
      this.state.editorErrorField = "";
      this.state.editorSnapshot={alarm:this.clone(this.state.alarm),soundId:this.state.soundId,masterVolume:this.state.masterVolume};
      this.state.editorOpen=true;
      this.state.alarm = this.clone(alarm);
      this.state.soundId = this.state.alarm.soundId;
      this.state.masterVolume = this.state.alarm.maxVolume;
      this.go("02");
    }

    toggleDay(index) {
      const days = new Set(this.state.alarm.days);
      if (days.has(index)) days.delete(index); else days.add(index);
      this.state.alarm.days = Array.from(days).sort();
      this.state.editorError = "";
      this.state.editorErrorField = "";
      this.render();
    }

    toggleAlarmSetting(key) {
      this.state.alarm[key] = !this.state.alarm[key];
      if (!this.state.editorOpen) this.syncCurrentAlarm();
      else this.save();
      this.render();
    }

    cycleDifficulty() {
      const levels = ["Gentle", "Classic", "Diva"];
      const next = (levels.indexOf(this.state.alarm.difficulty) + 1) % levels.length;
      this.state.alarm.difficulty = levels[next];
      this.state.alarm.taskPlanVersion=8;
      this.syncCurrentAlarm();
      this.save();
      this.render();
    }

    openSettingDetail(screen) {
      this.state.settingsReturnScreen = this.state.screen === "02" ? "02" : "14";
      this.go(screen);
    }

    persistDetailChange() {
      if (this.state.editorOpen) return this.save();
      return this.syncCurrentAlarm();
    }

    returnFromSettingDetail() {
      this.stopPreview(false);
      if (!this.state.editorOpen) this.syncCurrentAlarm();
      this.go(this.state.settingsReturnScreen || "14");
    }

    syncCurrentAlarm() {
      if(!this.state.editorOpen) this.state.defaults=Object.assign(this.clone(this.state.alarm),{id:"defaults"});
      return this.save();
    }

    saveAlarm() {
      const label = this.state.alarm.label.trim();
      if (!label) return this.editorFailure("Give this alarm a short name.","alarm-label");
      if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(this.state.alarm.time))return this.editorFailure("Choose a valid alarm time.","alarm-time");
      if (this.state.alarm.repeatMode === "once") {
        this.setNextOnceDate();
        const parts=String(this.state.alarm.onceDate).split("-").map(Number);
        const chosen=parts.length===3?new Date(parts[0],parts[1]-1,parts[2],12):null;
        if(!/^\d{4}-\d{2}-\d{2}$/.test(this.state.alarm.onceDate) || !chosen || chosen.getFullYear()!==parts[0] || chosen.getMonth()!==parts[1]-1 || chosen.getDate()!==parts[2]) return this.editorFailure("Choose the date for this one-time alarm.","alarm-date");
        const at=Runtime.resolve(this.state.alarm,new Date(parts[0],parts[1]-1,parts[2],12));
        if(+at<=Date.now()) return this.editorFailure("Choose a date and time that is still ahead.","alarm-date");
      } else if (!this.state.alarm.days.length) return this.editorFailure("Choose repeat days, or select Once.","repeat-days");
      this.state.alarm.label = label;
      this.state.alarm.soundId = this.state.soundId;
      this.state.alarm.maxVolume = this.state.masterVolume;
      if(this.state.editorMode === "new") this.state.alarm.enabled=true;
      const previous=this.clone(this.state.alarms);
      const index = this.state.alarms.findIndex((item) => item.id === this.state.alarm.id);
      if (index >= 0) this.state.alarms[index] = this.clone(this.state.alarm);
      else this.state.alarms.push(this.clone(this.state.alarm));
      this.state.alarms.sort((a, b) => a.time.localeCompare(b.time));
      this.state.editorMode = "edit";
      this.state.onboarded=true;
      this.state.editorOpen=false;
      if(!this.save()){this.state.alarms=previous;this.state.editorOpen=true;this.editorFailure("Your alarm was not saved. Free browser storage and try again.","alarm-label");return;}
      this.state.editorSnapshot=null;
      this.go("19");
    }

    editorFailure(message,field) {
      this.state.editorError=message;
      this.state.editorErrorField=({"alarm-label":"label","alarm-date":"date","repeat-days":"days","alarm-time":"time"})[field] || field;
      this.render();
      const node=document.getElementById(field) || document.querySelector(".days");
      if(node){
        node.tabIndex=node.tabIndex<0?0:node.tabIndex;
        node.focus({preventScroll:true});
        const body=document.querySelector(".screen-body");
        if(body && typeof body.getBoundingClientRect==="function" && typeof node.getBoundingClientRect==="function"){
          const viewport=body.getBoundingClientRect(),target=node.getBoundingClientRect();
          const height=body.clientHeight || viewport.height;
          body.scrollTop=Math.max(0,body.scrollTop+target.top-viewport.top-Math.max(16,(height-target.height)/2));
        }
      }
      return false;
    }

    cancelEditor() {
      if(this.state.editorSnapshot) Object.assign(this.state,this.clone(this.state.editorSnapshot));
      this.state.editorOpen=false;this.state.editorSnapshot=null;this.state.editorError="";
      this.save();this.go("01");
    }

    toggleAlarm(id) {
      const alarm = this.state.alarms.find((item) => item.id === id);
      if (!alarm) return;
      if(!alarm.enabled && alarm.repeatMode==="once" && !Runtime.next([Object.assign({},alarm,{enabled:true})],new Date(),this.state.occurrences)) {
        this.toast("This one-time alarm has no future occurrence. Edit its date and time before turning it on.");
        return;
      }
      alarm.enabled = !alarm.enabled;
      if(!this.save()){alarm.enabled=!alarm.enabled;this.render();return;}
      this.render();
      this.toast(alarm.enabled ? `${alarm.label} is on` : `${alarm.label} is paused`);
    }

    openDeleteAlarm() {
      const layer = document.getElementById("modal-layer");
      layer.hidden = false;
      layer.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><span class="eyebrow">REMOVE ALARM</span><h2 id="delete-title">Delete <span data-i18n-ignore>${this.escapeHtml(this.state.alarm.label)}</span>?</h2><p>${this.formatAlarmTime(this.state.alarm.time)} · ${this.formatSchedule(this.state.alarm)}. Future in-tab tests for this alarm will be cancelled.</p><div class="modal-actions"><button class="secondary" type="button" data-action="close-modal">Keep alarm</button><button class="primary primary--danger" type="button" data-action="confirm-delete-alarm">Delete alarm</button></div></section>`;
      this.localizeModal();
    }

    confirmDeleteAlarm() {
      const fields=["alarms","pendingQueue","occurrences","wakeChecks","editorOpen","editorSnapshot","activeSession","alarm"];
      const previous={};for(const field of fields)previous[field]=this.clone(this.state[field]);
      const alarmId=this.state.alarm.id;
      this.state.alarms = this.state.alarms.filter((item) => item.id !== alarmId);
      this.state.pendingQueue=this.state.pendingQueue.filter(item=>item.alarm.id!==alarmId);
      this.state.occurrences.forEach(item=>{if(item.alarmId===alarmId && item.status==="queued"){item.status="cancelled";item.reason="configuration_deleted";}});
      this.state.wakeChecks.forEach(item=>{if(item.alarm.id===alarmId && item.status==="pending"){item.status="cancelled";item.reason="configuration_deleted";}});
      if(this.state.activeSession?.alarm.id===alarmId){this.state.activeSession.alarm.check=false;this.state.alarm.check=false;}
      this.state.editorOpen=false;this.state.editorSnapshot=null;
      if(!this.save()){Object.assign(this.state,previous);this.render();return;}
      this.closeModal();
      if(this.state.activeSession)this.render();else this.go("01");
      this.toast("Alarm deleted");
    }

    cancelTest() {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
      this.state.testCountdown = 0;
      const destination=this.state.testReturnContext?this.applyRouteContext(this.state.testReturnContext):this.state.testReturnScreen || "19";
      this.state.testReturnContext=null;
      this.go(destination);
      this.toast("Test cancelled");
    }

    scheduleTest() {
      if(this.state.activeSession && this.state.activeSession.kind!=="test") {this.toast("Finish the current wake-up before starting a rehearsal");return;}
      if (this.state.testCountdown) return;
      this.state.testReturnContext=this.captureRouteContext();
      this.state.testReturnScreen = this.state.screen === "01" ? "01" : "19";
      if (this.state.screen === "01") {
        const alarm = this.state.nextAlarm?.alarm || this.state.alarms[0] || this.state.alarm;
        this.state.alarm = this.clone(alarm);
        this.state.soundId = alarm.soundId;
        this.state.masterVolume = alarm.maxVolume;
      }
      this.state.sessionKind = "test";
      this.state.testCountdown = this.fast ? 1 : 10;
      this.soundEngine.unlock();
      this.go("33");
      clearInterval(this.countdownTimer);
      const generation=++this.sessionGeneration;
      this.countdownTimer = setInterval(() => {
        if(generation!==this.sessionGeneration || (this.state.activeSession && this.state.activeSession.kind!=="test")){clearInterval(this.countdownTimer);return;}
        this.state.testCountdown -= 1;
        if (this.state.testCountdown <= 0) {
          clearInterval(this.countdownTimer);
          this.state.testCountdown = 0;
          this.resetChallenge("test");
          this.go("16", { ring: true });
          this.notifyAlarm();
        } else if (this.state.screen === "33") this.render();
      }, this.fast ? 180 : 1000);
    }

    notifyAlarm() {
      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        try { new Notification(this.state.alarm.label, { body: window.DramaAlarmI18n?.text?.("It’s showtime. Open Drama Alarm to begin Act 1.") || "It’s showtime. Open Drama Alarm to begin Act 1.", tag: "drama-alarm-test" }); } catch (_) {}
      }
    }

    setChallengeDifficulty(level) {
      if(!Challenges.levels.includes(level))return;
      this.state.alarm.difficulty=level;
      this.state.alarm.taskPlanVersion=8;
      this.state.math=Challenges.math(level,{random:this.fast?()=>.2:Math.random});
      const stored=this.persistDetailChange();
      if(this.state.screen==="25" && stored!==false)this.go(this.state.settingsReturnScreen || "14",{restoreScroll:true});
      else this.render();
    }

    openQuestionLibrary() {
      this.state.libraryReturnScreen=this.state.screen;
      this.state.activePackId=Challenges.topicOf(this.state.alarm.questionTopic)==="everyday"?"geography":this.state.alarm.questionTopic;
      this.go("46");
    }

    selectQuestionTopic(topic,confirmed=false) {
      const pack=QuestionBank?.getPack?.(topic);
      if(!pack || pack.available===false)return;
      if(pack.premium && !this.hasProduct(`pack:${topic}`)){this.openProduct(`pack:${topic}`);return;}
      if(topic!=="everyday" && !QuestionBank?.getQuestion?.(topic)) {this.toast("This topic is not ready. Free arithmetic remains available.");return;}
      if(Number(this.state.alarm.taskPlanVersion)!==8 && !confirmed){this.confirmTopicMigration(topic);return;}
      const returnAfterApply=this.state.screen==="47";
      this.state.alarm.questionTopic=topic;this.state.alarm.taskPlanVersion=8;
      this.persistDetailChange();
      if(returnAfterApply)this.go(this.state.libraryReturnScreen || "14",{restoreScroll:true});else this.render();
      this.toast(this.copy("题库已选好，只替换最后一道题，不增加题目数量。","Collection selected. Only the final question changes; the number of questions stays the same."));
    }

    confirmTopicMigration(topic) {
      const current=Challenges.describe(this.state.alarm),next=Challenges.describe({...this.state.alarm,questionTopic:topic,taskPlanVersion:8});
      const layer=document.getElementById("modal-layer");
      if(!layer){this.toast("Apply the new question format before changing the topic.");return;}
      layer.hidden=false;
      layer.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="topic-migration-title"><h2 id="topic-migration-title">Apply the new question format?</h2><p>Your earlier plan has ${current.total} ${current.total===1?"question":"questions"}. This choice uses ${next.total} ${next.total===1?"question":"questions"}: ${this.escapeHtml(next.composition)}.</p><p>Only this draft changes. Save the alarm to keep the new plan.</p><div class="modal-actions"><button class="secondary" type="button" data-action="close-modal">Keep earlier plan</button><button class="primary" type="button" data-action="confirm-question-topic" data-value="${topic}">Apply new plan</button></div></section>`;
      this.localizeModal();
      layer.querySelector("button")?.focus();
    }

    openPackSample(next=false) {
      if(window.DRAMA_INTERNAL_BUILD!==true || !this.qa)return;
      if(next)this.state.packSampleIndex=(this.state.packSampleIndex || 0)+1;
      const raw=QuestionBank?.sample?.(this.state.activePackId,this.state.packSampleIndex || 0);
      this.state.packSample=Challenges.choice(raw,{random:this.fast?()=>.2:Math.random});
      this.state.packSampleAnswer=null;this.state.packSampleFeedback=null;
      if(!this.state.packSample){this.toast("This collection has no playable samples yet.");return;}
      this.go("48");
    }

    answerPackSample(index) {
      const q=this.state.packSample;
      if(this.state.screen!=="48" || !q || !Number.isInteger(index) || index<0 || index>=q.options.length)return;
      this.state.packSampleAnswer=index;
      this.state.packSampleFeedback=q.optionIds[index]===q.correctOptionId?"correct":"wrong";
      this.soundEngine.cue(this.state.packSampleFeedback==="correct"?"success":"error");
      this.render();
    }

    async prepareQuestionPack() {
      if(this.pendingPackUpdate){this.toast("Another content update is still running. Local questions remain usable.");return;}
      const id=this.state.activePackId;
      const request={packId:id,sequence:(this.contentRequestSequence || 0)+1};
      this.contentRequestSequence=request.sequence;this.pendingPackUpdate=request;
      const label=QuestionBank?.getPack?.(id)?.title || QuestionBank?.getPack?.(id)?.name || id;
      this.state.packPreparing=true;this.go("49");
      try{const preparation=QuestionBank?.prepare?.(id);if(this.state.screen==="49")this.render();const result=await preparation;if(this.pendingPackUpdate!==request)return;this.toast(result?.ok?this.copy("本地题库已检查，唤醒时无需联网。","Local collection checked. Wake-up questions work offline."):`${label}: update unavailable. Installed and free questions remain usable.`);}
      catch{if(this.pendingPackUpdate===request)this.toast(`${label}: update unavailable. Installed and free questions remain usable.`);}
      finally{if(this.pendingPackUpdate===request){this.pendingPackUpdate=null;this.state.packPreparing=false;if(this.state.screen==="49")this.render();}}
    }

    pickV8Question(topic,level,excludeId) {
      const seen=this.state.challengeSeenIds || [],recent=this.state.recentRiddles || [];
      const options={level:level==="Gentle"?"Gentle":"Classic",recentIds:[...new Set([...seen,...recent])],excludeId,random:this.fast?()=>.2:Math.random};
      const available=QuestionBank?.questions?.(topic,options);
      if(available?.length && !available.some(q=>q.id!==excludeId && !seen.includes(q.id)))return null;
      let selected=QuestionBank?.getQuestion?.(topic,options) || null;
      if(selected && seen.includes(selected.id) && available?.length){
        const fresh=available.filter(q=>q.id!==excludeId && !seen.includes(q.id));
        selected=fresh[Math.min(fresh.length-1,Math.floor((this.fast ? 0.2 : Math.random())*fresh.length))] || null;
      }
      return selected;
    }

    syncChallengeQuestion(state=this.state) {
      const q=Challenges.current(state.challengePlan);
      if(!q)return;
      if(q.kind==="math")state.math=q;
      else {state.riddleInstance=q;state.riddle=q;state.riddleWrong=state.challengePlan.consecutiveWrong;
        state.challengeSeenIds=[...new Set([...(state.challengeSeenIds || []),q.id])];
        if(this.isFormalSession(state.activeSession))state.recentRiddles=[...(state.recentRiddles || []).filter(id=>id!==q.id),q.id].slice(-60);
      }
      state.challengeProgress={...Challenges.progress(state.challengePlan),legacy:false};
    }

    routeCurrentChallenge() {
      if(!this.state.activeSession || !this.state.challengePlan)return;
      this.syncChallengeQuestion();
      const q=Challenges.current(this.state.challengePlan);
      if(!q){this.completeChallenge();return;}
      this.state.lastRiddleWrong=null;
      this.go(q.kind==="math"?"04":"06",{keepPreview:true});
    }

    generateMath(level) {
      if(this.state?.alarm?.taskPlanVersion===8)return Challenges.math(level,{random:this.fast?()=>.2:Math.random});
      if (this.fast) {
        if (level === "Gentle") return { a: 18, b: 7, op: "+", answer: 25, input: "", lastWrong: "", wrong: 0, level };
        if (level === "Diva") return { expression: "238 − 74 + 36", answer: 200, input: "", lastWrong: "", wrong: 0, level };
        return { a: 147, b: 89, op: "+", answer: 236, input: "", lastWrong: "", wrong: 0, level };
      }
      const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      if (level === "Gentle") {
        const a = random(18, 69), b = random(6, Math.min(28, a - 1)), add = Math.random() > 0.35;
        return { a, b, op: add ? "+" : "−", answer: add ? a + b : a - b, input: "", lastWrong: "", wrong: 0, level };
      }
      if (level === "Diva") {
        const a = random(180, 420), b = random(35, 140), c = random(18, 96);
        const subtractFirst = Math.random() > 0.45;
        const expression = subtractFirst ? `${a} − ${b} + ${c}` : `${a} + ${b} − ${c}`;
        const answer = subtractFirst ? a - b + c : a + b - c;
        return { expression, answer, input: "", lastWrong: "", wrong: 0, level };
      }
      const a = random(90, 320), b = random(24, Math.min(180, a - 1)), add = Math.random() > 0.4;
      return { a, b, op: add ? "+" : "−", answer: add ? a + b : a - b, input: "", lastWrong: "", wrong: 0, level };
    }

    resetChallenge(kind = "alarm", occurrenceId = null) {
      this.state.sessionKind = kind;
      this.state.volume = Math.min(40, this.state.masterVolume);
      this.state.math = this.generateMath(this.state.alarm.difficulty);
      this.state.riddleIndex = this.pickRiddleIndex(this.state.alarm.difficulty);
      this.state.riddleInstance=Runtime.shuffleRiddle(riddles[this.state.riddleIndex]);
      this.state.riddleWrong = 0;
      this.state.lastRiddleWrong = null;
      this.state.checkMode = false;
      this.state.challengeStartedAt = Date.now();
      this.state.challengeMistakes = 0;
      this.state.challengeSeenIds = [];
      this.state.lastResult = null;
      this.state.activeSession={id:typeof crypto.randomUUID==="function"?crypto.randomUUID():`session-${Date.now()}`,occurrenceId,scheduledAt:this.state.occurrences.find(item=>item.id===occurrenceId)?.scheduledAt ?? null,kind,alarm:this.clone(this.state.alarm),phase:"03",startedAt:Date.now(),progress:{}};
      if(kind==="test")this.state.activeSession.returnContext=this.state.testReturnContext || {screen:this.state.testReturnScreen || "19"};
      this.state.challengePlan=Number(this.state.alarm.taskPlanVersion)===8?Challenges.create(this.state.alarm,{id:this.state.activeSession.id,random:this.fast?()=>.2:Math.random,pick:(topic,level)=>this.pickV8Question(topic,level)}):null;
      if(this.state.challengePlan)this.syncChallengeQuestion();
      if(this.isFormalSession())this.recordEvent("challenge_started",{sessionId:this.state.activeSession.id,occurrenceId,kind});
      this.save();
    }

    pickRiddleIndex(level, excludeId, excludeType) {
      const desired = level === "Gentle" ? "Gentle" : "Classic";
      const pool = riddles.map((riddle, index) => ({ riddle, index })).filter(({ riddle }) => riddle.level === desired && riddle.id !== excludeId && riddle.id !== riddles[0].id);
      const differentTypes = excludeType ? pool.filter(({ riddle }) => riddle.type !== excludeType) : pool;
      const eligible = differentTypes.length ? differentTypes : pool;
      let candidates = eligible.filter(({ riddle }) => !this.state.recentRiddles.includes(riddle.id));
      if (!candidates.length) candidates = eligible;
      if (this.fast) return candidates[0]?.index || 0;
      return candidates[Math.floor(Math.random() * candidates.length)]?.index || 0;
    }

    appendMath(value) {
      if (!/^\d$/.test(String(value))) return;
      if (this.state.math.input.length >= 5) return;
      this.state.math.input += value;
      this.updateAnswerInput(false);
    }

    submitMath() {
      if(this.state.screen!=="04")return;
      if(this.state.challengePlan?.version===8 && !this.state.checkMode){this.submitV8Math();return;}
      const math = this.state.math;
      if (!math.input) return;
      if (Number(math.input) === math.answer) {
        this.soundEngine.cue("success");
        this.vibrate([30], "answer");
        if (this.state.alarm.quieter) this.setRingIntensity(Math.min(this.state.masterVolume, 55));
        math.input = "";
        math.wrong = 0;
        if (this.state.checkMode) {
          this.stopRinging();
          this.state.checkMode = false;
          this.confirmWakeCheck("Wake-up check completed");
        } else if (this.state.alarm.riddle) this.go("06", { keepPreview: true });
        else this.completeChallenge();
      } else {
        math.lastWrong = math.input;
        math.input = "";
        math.wrong += 1;
        this.state.challengeMistakes += 1;
        this.setRingIntensity(Math.min(this.state.masterVolume,70));
        this.soundEngine.cue("error");
        this.vibrate([50, 40, 50], "answer");
        this.go("05", { keepPreview: true });
      }
    }

    submitV8Math() {
      const q=Challenges.current(this.state.challengePlan);
      if(!q || q.kind!=="math" || !q.input)return;
      const result=Challenges.grade(this.state.challengePlan,q.input,q.id,{random:this.fast?()=>.2:Math.random});
      if(!result.accepted)return;
      this.state.challengeMistakes=this.state.challengePlan.mistakes;
      if(result.correct){
        this.soundEngine.cue("success");this.vibrate([30],"answer");
        if(this.state.alarm.quieter)this.setRingIntensity(Math.min(this.state.masterVolume,55));
        if(result.complete)this.completeChallenge();else this.routeCurrentChallenge();
      }else{
        this.soundEngine.cue("error");this.vibrate([50,40,50],"answer");this.setRingIntensity(Math.min(this.state.masterVolume,70));
        if(result.downgraded){this.syncChallengeQuestion();this.state.safetyKind="v8-auto";this.state.safetyTargetLevel=this.state.challengePlan.currentLevel;this.go("21",{keepPreview:true});}
        else this.go("05",{keepPreview:true});
      }
    }

    answerV8Choice(index) {
      const q=Challenges.current(this.state.challengePlan);
      if(!q || q.kind!=="choice" || !Number.isInteger(index) || index<0 || index>=q.options.length)return;
      const result=Challenges.grade(this.state.challengePlan,index,q.id,{random:this.fast?()=>.2:Math.random});
      if(!result.accepted)return;
      this.state.challengeMistakes=this.state.challengePlan.mistakes;
      if(result.correct){
        this.soundEngine.cue("success");this.vibrate([30],"answer");
        if(this.isFormalSession())this.state.recentRiddles=[...this.state.recentRiddles.filter(id=>id!==q.id),q.id].slice(-60);
        if(result.complete)this.completeChallenge(q);else this.routeCurrentChallenge();
      }else{
        this.soundEngine.cue("error");this.vibrate([40,35,40],"answer");
        this.state.lastRiddleWrong=index;this.state.riddleWrong=this.state.challengePlan.consecutiveWrong;
        this.setRingIntensity(Math.min(this.state.masterVolume,70));
        if(result.downgraded){this.syncChallengeQuestion();this.state.safetyKind="v8-auto";this.state.safetyTargetLevel="Gentle";this.go("21",{keepPreview:true});}
        else this.go("20",{keepPreview:true});
      }
    }

    answerRiddle(index) {
      if(this.state.screen!=="06")return;
      if(this.state.challengePlan?.version===8){this.answerV8Choice(index);return;}
      const riddle = this.state.riddleInstance || Runtime.shuffleRiddle(riddles[this.state.riddleIndex % riddles.length]);
      if (index === riddle.answer) {
        this.soundEngine.cue("success");
        this.vibrate([30], "answer");
        if(this.isFormalSession())this.state.recentRiddles = [...this.state.recentRiddles.filter((id) => id !== riddle.id), riddle.id].slice(-60);
        this.state.riddleWrong = 0;
        this.completeChallenge(riddle);
      } else {
        this.state.lastRiddleWrong = index;
        this.state.riddleWrong += 1;
        this.state.challengeMistakes += 1;
        this.setRingIntensity(Math.min(this.state.masterVolume, 70));
        this.soundEngine.cue("error");
        this.vibrate([40, 35, 40], "answer");
        this.go("20", { keepPreview: true });
      }
    }

    nextRiddle() {
      if(this.state.challengePlan?.version===8){
        const current=Challenges.current(this.state.challengePlan);
        if(current?.kind!=="choice"){this.routeCurrentChallenge();return;}
        Challenges.replaceChoice(this.state.challengePlan,this.pickV8Question(this.state.challengePlan.topic,this.state.challengePlan.currentLevel,current.id),{random:this.fast?()=>.2:Math.random});
        this.routeCurrentChallenge();return;
      }
      clearTimeout(this.transitionTimer);
      const current = riddles[this.state.riddleIndex];
      this.state.riddleIndex = this.pickRiddleIndex(this.state.riddleWrong >= 3 ? "Gentle" : this.state.alarm.difficulty, current?.id, current?.type);
      this.state.riddleInstance=Runtime.shuffleRiddle(riddles[this.state.riddleIndex]);
      this.state.lastRiddleWrong = null;
      this.go("06", { keepPreview: true });
    }

    completeChallenge(riddle) {
      const session=this.state.activeSession;
      if(!session || session.completed) return;
      if(this.state.challengePlan?.version===8 && !Challenges.progress(this.state.challengePlan).complete)return;
      this.stopRinging();
      this.vibrate([35, 45, 70], "bravo");
      const seconds = Math.max(1, Math.round((Date.now() - (this.state.challengeStartedAt || Date.now())) / 1000));
      const result = {
        at: new Date().toISOString(),
        localDate: this.localDateKey(),
        seconds,
        mistakes: this.state.challengeMistakes,
        difficulty: this.state.alarm.difficulty,
        alarmId: this.state.alarm.id,
        riddleId: riddle?.id || null,
        kind: this.state.sessionKind,
        sessionId:session?.id || null,
        occurrenceId:session?.occurrenceId || null,
        taskPlanVersion:this.state.challengePlan?.version || 7,
        questionTopic:this.state.challengePlan?.topic || "everyday",
        totalQuestions:this.state.challengePlan?.total || (this.state.alarm.riddle===false?1:2),
        correctQuestions:this.state.challengePlan?.completed || (this.state.alarm.riddle===false?1:2),
      };
      this.state.lastResult = result;
      if (this.isFormalSession(session)) {
        if(!this.state.history.some(item=>item.sessionId && item.sessionId===result.sessionId))this.state.history.push(result);
        this.state.history = this.state.history.slice(-90);
      }
      if(session?.occurrenceId){const record=this.state.occurrences.find(item=>item.id===session.occurrenceId);if(record)record.status="challenge_completed";}
      if(this.isFormalSession(session))this.recordEvent("challenge_completed",{sessionId:session?.id,occurrenceId:session?.occurrenceId});
      this.scheduleWakeCheck(session);
      this.completeOnceAlarm();
      this.state.completedReturnContext=session?.returnContext || null;
      this.state.activeSession=null;
      this.save();
      this.go("07");
    }

    restoreCompletedContext() {
      const context=this.state.completedReturnContext;this.state.completedReturnContext=null;
      if(context){const screen=this.applyRouteContext(context);this.go(challengeScreens.has(screen)||screen==="07"?"01":screen || "01",{restoreScroll:true});}
      else this.go("01");
    }

    openSafety(kind) {
      if(this.state.challengePlan?.version===8){this.state.safetyReturnScreen=this.state.screen;this.state.safetyKind="v8-switch";this.state.safetyTargetLevel="Gentle";this.go("21",{keepPreview:true});return;}
      clearTimeout(this.transitionTimer);
      this.state.safetyKind = kind;
      const currentLevel = kind === "math" ? this.state.math.level : "Classic";
      this.state.safetyTargetLevel = currentLevel === "Diva" ? "Classic" : "Gentle";
      this.go("21", { keepPreview: true });
    }

    continueSafety() {
      if(this.state.challengePlan?.version===8){
        if(this.state.safetyKind!=="v8-auto")Challenges.replaceWithMath(this.state.challengePlan,{random:this.fast?()=>.2:Math.random});
        this.routeCurrentChallenge();return;
      }
      if (this.state.safetyKind === "math") {
        this.state.math = this.generateMath(this.state.safetyTargetLevel || (this.state.math.level === "Diva" ? "Classic" : "Gentle"));
        this.go("04", { keepPreview: true });
      } else {
        const current = riddles[this.state.riddleIndex];
        this.state.riddleIndex = this.pickRiddleIndex("Gentle", current?.id, current?.type);
        this.state.riddleInstance=Runtime.shuffleRiddle(riddles[this.state.riddleIndex]);
        this.state.riddleWrong = 0;
        this.state.lastRiddleWrong = null;
        this.go("06", { keepPreview: true });
      }
    }

    startWakeCountdown() {
      clearInterval(this.wakeTimer);
      const check=this.state.wakeChecks.find(item=>item.id===this.state.activeCheckId);
      if(check && !check.expiresAt)check.expiresAt=Date.now()+(this.fast?750:60000);
      const deadline=check?.expiresAt || Date.now()+(this.fast?750:60000);
      this.state.wakeCheckSeconds = Math.max(0,Math.ceil((deadline-Date.now())/1000));
      this.wakeTimer = setInterval(() => {
        this.state.wakeCheckSeconds = Math.max(0,Math.ceil((deadline-Date.now())/1000));
        const label = document.getElementById("wake-countdown");
        if (label) label.textContent = this.state.wakeCheckSeconds;
        if (this.state.wakeCheckSeconds <= 0) this.wakeTimeout();
      }, this.fast ? 250 : 1000);
    }

    scheduleWakeCheck(session = this.state.activeSession) {
      if (!this.state.alarm.check || !this.isFormalSession(session) || session.kind==="check") return;
      if(!session || this.state.wakeChecks.some(item=>item.sessionId===session.id))return;
      const delay = this.fast ? 15000 : (this.state.alarm.checkDelay || 5) * 60 * 1000;
      this.state.wakeChecks.push({id:`check-${session.id}`,sessionId:session.id,occurrenceId:session.occurrenceId,alarm:this.clone(this.state.alarm),dueAt:Date.now()+delay,status:"pending"});
      this.state.wakeCheckDueAt=Date.now()+delay;
      this.scheduledWakeTimer = setTimeout(() => this.checkWakeCheckDue(), delay);
    }

    checkWakeCheckDue() {
      if(this.isFormalSession() || this.state.pendingQueue.length) return;
      const check=this.state.wakeChecks.filter(item=>item.status==="pending" && item.dueAt<=Date.now()).sort((a,b)=>a.dueAt-b.dueAt)[0];
      if(!check)return;
      if(this.onboardingReplay)this.finishOnboardingReplay({navigate:false});
      const interruptedTest=Boolean(this.state.testCountdown || this.state.activeSession);
      const context=this.captureRouteContext();
      clearInterval(this.countdownTimer);this.countdownTimer=null;this.state.testCountdown=0;
      this.sessionGeneration=(this.sessionGeneration || 0)+1;
      this.stopPreview(false);this.stopRinging();
      this.state.activeCheckId=check.id;check.status="presented";
      this.state.wakeCheckReturnScreen = context.screen;
      this.state.wakeCheckSuspendedState = context;
      if (check.alarm) {
        this.state.alarm = this.clone(check.alarm);
        this.state.soundId = this.state.alarm.soundId;
        this.state.masterVolume = this.state.alarm.maxVolume;
      }
      this.state.activeSession={id:`session-${check.id}`,occurrenceId:check.occurrenceId,kind:"check",alarm:this.clone(check.alarm),phase:"22",startedAt:Date.now(),progress:{}};
      this.state.challengePlan=null;
      this.state.sessionKind="check";
      this.state.editorOpen=false;
      this.closeModal();
      this.go("22");
      if(interruptedTest)this.toast("The rehearsal was cancelled for your Wake-up Check.");
    }

    startWakeCheckPreview() {
      if(this.isFormalSession()){this.toast("Finish the current wake-up before starting a rehearsal");return;}
      const context=this.captureRouteContext();
      clearInterval(this.countdownTimer);this.countdownTimer=null;this.state.testCountdown=0;
      this.stopPreview(false);this.stopRinging();
      this.sessionGeneration=(this.sessionGeneration || 0)+1;
      this.state.wakeCheckSuspendedState=context;
      this.state.wakeCheckReturnScreen=context.screen;
      this.state.activeCheckId=null;
      this.state.activeSession={id:`check-preview-${Date.now()}`,kind:"check-preview",alarm:this.clone(this.state.alarm),phase:"22",startedAt:Date.now(),progress:{}};
      this.state.challengePlan=null;
      this.state.sessionKind="check-preview";
      this.state.editorOpen=false;
      this.closeModal();
      this.go("22");
    }

    confirmWakeCheck(message = "Wake-up confirmed") {
      clearTimeout(this.scheduledWakeTimer);
      clearInterval(this.wakeTimer);
      const formal=this.isFormalSession();
      const check=formal?this.state.wakeChecks.find(item=>item.id===this.state.activeCheckId):null;
      if(check){check.status="confirmed";check.confirmedAt=Date.now();this.recordEvent("wake_check_confirmed",{sessionId:check.sessionId,occurrenceId:check.occurrenceId});}
      this.state.activeCheckId=null;
      this.state.activeSession=null;
      this.state.wakeCheckDueAt = 0;
      this.state.wakeCheckAlarm = null;
      this.state.checkMode = false;
      this.stopRinging();
      const suspended = this.state.wakeCheckSuspendedState;
      let destination = this.state.wakeCheckReturnScreen || "01";
      if (suspended) {
        destination=this.applyRouteContext(suspended);
        this.state.wakeCheckSuspendedState = null;
      }
      this.state.wakeCheckReturnScreen = "01";
      this.state.sessionKind="alarm";
      this.state.challengePlan=null;
      this.state.testCountdown=0;
      this.toast(formal?message:"Practice complete. Your formal records are unchanged.");
      this.save();
      if(!this.startNextQueued())this.go(challengeScreens.has(destination) ? "01" : destination);
    }

    wakeTimeout() {
      if(!this.state.activeSession && this.qa)this.startWakeCheckPreview();
      if(!this.state.activeSession || !["check","check-preview"].includes(this.state.activeSession.kind))return;
      clearInterval(this.wakeTimer);
      this.state.checkMode = true;
      this.state.volume = Math.min(48, this.state.masterVolume);
      this.state.math = Challenges.math("Gentle",{random:this.fast?()=>.2:Math.random});
      const check=this.isFormalSession()?this.state.wakeChecks.find(item=>item.id===this.state.activeCheckId):null;
      if(check){check.status="checking";this.recordEvent("wake_check_expired",{sessionId:check.sessionId,occurrenceId:check.occurrenceId});}
      this.startRinging();
      this.go("04", { keepPreview: true });
    }

    startHold(element) {
      if (element.dataset.hold === "emergency") { this.finishEmergency(); return; }
      if (this.holdElement) return;
      this.ensureEmergencyMonth();
      this.holdElement = element;
      this.holdStarted = performance.now();
      const requested = Number(element.dataset.duration || 10000);
      const duration = this.fast ? Math.min(requested, 420) : requested;
      const kind = element.dataset.hold;
      const route = this.state.screen, generation = this.sessionGeneration, sessionId = this.state.activeSession?.id;
      element.setAttribute("aria-busy", "true");
      this.holdTimer = setInterval(() => {
        if (!element.isConnected || this.state.screen !== route || this.sessionGeneration !== generation || this.state.activeSession?.id !== sessionId) { this.cancelHold(); return; }
        const elapsed = performance.now() - this.holdStarted;
        const ratio = Math.min(1, elapsed / duration);
        if (kind === "stand") element.style.background = `linear-gradient(90deg,var(--gold) ${ratio * 100}%,var(--cream) ${ratio * 100}%)`;
        else element.style.setProperty("--hold-progress", `${ratio * 360}deg`);
        if (ratio >= 1) {
          clearInterval(this.holdTimer);
          this.holdTimer = null;
          this.holdElement = null;
          if (kind === "emergency") this.finishEmergency(); else this.finishStanding();
        }
      }, 32);
    }

    cancelHold() {
      if (!this.holdElement) return;
      clearInterval(this.holdTimer);
      this.holdTimer = null;
      const element = this.holdElement;
      this.holdElement = null;
      element.removeAttribute("aria-busy");
      element.style.removeProperty("--hold-progress");
      element.style.removeProperty("background");
    }

    finishEmergency() {
      this.cancelHold();
      this.ensureEmergencyMonth();
      const session=this.state.activeSession,formal=this.isFormalSession(session);
      const checkSession=["check","check-preview"].includes(session?.kind);
      if(formal)this.state.emergencyUses += 1;
      this.state.emergencyCode = "";
      clearInterval(this.wakeTimer);
      clearInterval(this.countdownTimer);this.countdownTimer=null;this.state.testCountdown=0;
      clearTimeout(this.scheduledWakeTimer);
      if(formal)this.recordEvent("emergency_stopped",{sessionId:session.id,occurrenceId:session.occurrenceId});
      if(formal && session?.occurrenceId){const record=this.state.occurrences.find(item=>item.id===session.occurrenceId);if(record)record.status="emergency_stopped";}
      if(formal)this.state.wakeChecks.forEach(check=>{if(check.sessionId===session.id || check.id===this.state.activeCheckId)check.status="cancelled";});
      this.state.activeCheckId=null;
      this.completeOnceAlarm();
      this.state.activeSession=null;
      this.state.emergencyAlternative=false;
      this.state.challengePlan=null;
      this.state.checkMode=false;
      this.state.completedReturnContext=session?.returnContext || null;
      const suspended=this.state.wakeCheckSuspendedState;
      this.state.wakeCheckSuspendedState = null;
      this.stopRinging();
      this.state.sessionKind="alarm";
      this.sessionGeneration=(this.sessionGeneration || 0)+1;
      if(checkSession && suspended){
        const screen=this.applyRouteContext(suspended);
        this.save();
        if(!this.startNextQueued())this.go(challengeScreens.has(screen)?"01":screen,{restoreScroll:true});
      } else {this.save();if(!this.startNextQueued())this.restoreCompletedContext();}
      this.toast(formal?"Alarm stopped · Wake-up Check skipped":"Practice stopped. Your formal records are unchanged.");
    }

    completeOnceAlarm() {
      if(!this.isFormalSession() || this.state.alarm.repeatMode!=="once")return;
      const stored=this.state.alarms.find(item=>item.id===this.state.alarm.id);if(stored)stored.enabled=false;
    }

    finishStanding() {
      if(this.state.activeSession && this.state.challengePlan?.version===8){this.toast("Standing is a rehearsal concept. Finish the required questions, or use Emergency.");this.routeCurrentChallenge();return;}
      if(this.state.activeSession && this.state.sessionKind!=="test"){this.completeChallenge();this.toast("Standing confirmed · challenge completed");return;}
      this.stopRinging();
      this.toast("Standing confirmed · alarm dismissed");
      this.vibrate([35, 45, 70], "bravo");
      this.state.lastResult = { at: new Date().toISOString(), localDate: this.localDateKey(), seconds: 5, mistakes: 0, difficulty: "Standing Ovation", alarmId: this.state.alarm.id, riddleId: null, kind: this.state.sessionKind };
      // This standalone sensor concept is a rehearsal, not a real wake-up result.
      this.state.lastResult.kind="test";
      this.state.activeSession=null;
      this.save();
      this.go("07");
    }

    ensureEmergencyMonth() {
      const current = this.monthKey();
      if (this.state.emergencyMonth === current) return;
      this.state.emergencyMonth = current;
      this.state.emergencyUses = 0;
      this.state.emergencyCode = "";
      this.save();
    }

    async startRinging() {
      // A scheduled/native alarm takes precedence over the cold-launch artwork.
      document.body?.classList.add("is-launched");
      const sessionId=this.state.activeSession?.id;
      this.stopPreview(false);
      const startVolume = this.state.alarm.rising ? Math.min(40, this.state.masterVolume) : this.state.masterVolume;
      this.state.volume = startVolume;
      const ready=await this.soundEngine.startRinging(this.state.alarm.soundId || this.state.soundId, startVolume);
      if(sessionId && sessionId!==this.state.activeSession?.id)return false;
      this.state.audioStatus=this.soundEngine.getStatus?this.soundEngine.getStatus():{engineReady:Boolean(ready),state:ready?"running":"blocked"};
      this.state.audioResumeRequired=!ready;
      if(!ready){this.toast("Your wake-up is unfinished. Tap Resume sound and check your speaker.");this.render();return false;}
      clearInterval(this.ringHapticTimer);
      this.vibrate([45, 70, 45], "ring");
      this.ringHapticTimer = setInterval(() => this.vibrate([45, 70, 45], "ring"), 4500);
      this.requestWakeLock();
      clearInterval(this.ringRampTimer);
      if (this.state.alarm.rising && this.state.masterVolume > startVolume) {
        const started = Date.now();
        const duration = this.fast ? 2200 : 30000;
        this.ringRampTimer = setInterval(() => {
          const ratio = Math.min(1, (Date.now() - started) / duration);
          this.state.volume = Math.round(startVolume + (this.state.masterVolume - startVolume) * ratio);
          this.soundEngine.setRingLevel(this.state.volume, 0.4);
          const label = document.querySelector("[data-live-volume]");
          if (label) label.textContent = `${this.state.volume}%`;
          if (ratio >= 1) clearInterval(this.ringRampTimer);
        }, this.fast ? 100 : 500);
      }
    }

    setRingIntensity(percent) {
      clearInterval(this.ringRampTimer);
      this.state.volume = Math.max(1, Math.min(this.state.masterVolume, Math.round(percent)));
      this.soundEngine.setRingLevel(this.state.volume, 0.18);
    }

    stopRinging() {
      clearInterval(this.ringRampTimer);
      clearInterval(this.ringHapticTimer);
      this.ringRampTimer = null;
      this.ringHapticTimer = null;
      this.soundEngine.stopRinging();
      if (navigator.vibrate) navigator.vibrate(0);
      if (this.wakeLock) this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }

    async requestWakeLock() {
      if (!("wakeLock" in navigator)) return;
      try { this.wakeLock = await navigator.wakeLock.request("screen"); } catch (_) {}
    }

    async previewSound(id, select, options = {}) {
      const preset = soundPresets.find((item) => item.id === id) || soundPresets[0];
      const locked=preset.premium && !this.hasProduct(`sound:${preset.id}`);
      if (this.state.previewingSound === preset.id && !select && !options.force) { this.stopPreview(true); return; }
      if (select && locked) { this.stopPreview(false);this.openProduct(`sound:${preset.id}`);return; }
      if (select) {
        if(this.state.soundId!==preset.id){this.state.soundCheckConfirmed=false;this.state.soundCheckSoundId=null;this.state.lastPreviewSoundId=null;}
        this.state.soundId = preset.id;
        this.state.alarm.soundId = preset.id;
        this.save();
      }
      this.stopPreview(false);
      this.state.lastPreviewSoundId=null;
      const request=++this.previewGeneration,route=this.state.screen,sessionId=this.state.activeSession?.id;
      const valid=()=>request===this.previewGeneration && this.state.screen===route && sessionId===this.state.activeSession?.id && ["02","10","18","27","53"].includes(route);
      const refresh=()=>{if(!options.slider)this.render();else document.querySelectorAll(".v10-volume-caption .sound-wave").forEach(node=>node.classList.toggle("is-playing",Boolean(this.state.previewingSound&&!this.state.previewLoading)));};
      const seconds=Math.min(Number(preset.duration)||30,options.slider || locked ? 6 : 30);
      this.state.previewingSound = preset.id;
      this.state.previewLoading = true;
      refresh();
      let ready=false;try{ready=await this.soundEngine.unlock();}catch{ready=false;}
      if(!valid())return;
      this.state.audioUnlocked = ready;
      this.state.audioStatus=this.soundEngine.getStatus?this.soundEngine.getStatus():{engineReady:this.state.audioUnlocked,state:this.state.audioUnlocked?"running":"blocked"};
      if(!this.state.audioUnlocked){this.state.previewLoading=false;this.state.previewingSound=null;this.state.lastPreviewSoundId=null;this.toast("Sound could not start. Tap Play again, then check your device volume.");refresh();return;}
      const started=await this.soundEngine.preview(preset.id, this.state.masterVolume, () => {
        if(!valid())return;
        this.state.previewingSound = null;
        this.state.previewLoading = false;
        if(locked && !options.slider)this.openProduct(`sound:${preset.id}`);
        else refresh();
      },seconds);
      if(!valid())return;
      this.state.previewLoading=false;
      this.state.audioStatus=this.soundEngine.getStatus?this.soundEngine.getStatus():this.state.audioStatus;
      if(started===false){
        this.state.audioUnlocked=false;this.state.previewingSound=null;this.state.lastPreviewSoundId=null;
        this.toast("Sound could not start. Tap Play again, then check your device volume.");
      }else this.state.lastPreviewSoundId=preset.id;
      refresh();
    }

    stopPreview(render) {
      clearTimeout(this.sliderPreviewTimer);this.sliderPreviewTimer=null;
      this.previewGeneration=(this.previewGeneration || 0)+1;
      this.soundEngine.stopPreview(false);
      this.state.previewingSound = null;
      this.state.previewLoading = false;
      document.querySelectorAll(".v10-volume-caption .sound-wave").forEach(node=>node.classList.remove("is-playing"));
      if (render) this.render();
    }

    confirmSound() {
      const preset=soundPresets.find(item=>item.id===this.state.soundId);
      if(preset?.premium && !this.hasProduct(`sound:${preset.id}`)){this.openProduct(`sound:${preset.id}`);return;}
      this.stopPreview(false);
      this.state.alarm.soundId = this.state.soundId;
      if(!this.state.editorOpen)this.state.defaults=Object.assign(this.clone(this.state.alarm),{id:"defaults"});
      this.save();
      const destination = this.state.soundReturnScreen || "14";
      this.go(destination);
      this.toast(`${this.soundName(this.state.soundId)} is ready`);
    }

    soundName(id) {
      return soundPresets.find((preset) => preset.id === id)?.name || soundPresets[0].name;
    }

    vibrate(pattern, cue = "answer") {
      if (!this.state.haptics || (cue !== "preview" && this.state.hapticCues[cue] === false)) return;
      try{if(window.DramaAndroidHost?.haptic?.(pattern,cue)===true)return;}catch{}
      if (navigator.vibrate) navigator.vibrate(pattern);
    }

    findNextAlarm() {
      const now = this.state.now || new Date();
      const best=Runtime.next(this.state.alarms,now,this.state.occurrences);
      if (!best) return null;
      best.countdown = this.formatCountdown(best.at - now);
      best.dayLabel = new Intl.DateTimeFormat(this.locale(), { weekday: "long" }).format(best.at);
      return best;
    }

    formatCountdown(milliseconds) {
      const minutes = Math.max(0, Math.ceil(milliseconds / 60000));
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      const mins = minutes % 60;
      if(this.locale()==="zh-CN")return days?`${days}天 ${hours}小时`:hours?`${hours}小时 ${mins}分钟`:`${mins}分钟`;
      if (days) return `${days}d ${hours}h`;
      if (hours) return `${hours} hr ${mins} min`;
      return `${mins} min`;
    }

    formatAlarmTime(time) {
      const [hour, minute] = time.split(":").map(Number);
      const date = new Date(2026, 0, 1, hour, minute);
      return new Intl.DateTimeFormat(this.locale(), { hour: "numeric", minute: "2-digit",hour12:this.locale()!=="zh-CN" }).format(date);
    }

    formatDays(days) {
      const zh=this.locale()==="zh-CN";
      if (days.length === 7) return zh?"每天":"Every day";
      if (days.join(",") === "1,2,3,4,5") return zh?"工作日":"Weekdays";
      if (days.join(",") === "0,6") return zh?"周末":"Weekends";
      const labels = zh?["周日","周一","周二","周三","周四","周五","周六"]:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days.map((day) => labels[day]).join(" · ");
    }

    locale() {return this.state.language==="en"?"en-US":"zh-CN";}

    formatSchedule(alarm) {
      if(alarm.repeatMode!=="once")return this.formatDays(alarm.days);
      const [year,month,day]=String(alarm.onceDate || "").split("-").map(Number);
      if(!year || !month || !day)return window.DramaAlarmI18n?.text?.("Just once") || "Just once";
      return new Intl.DateTimeFormat(this.locale(),{month:"short",day:"numeric",year:"numeric"}).format(new Date(year,month-1,day,12));
    }

    calculateRunSummary() {
      const history = (this.state.history || []).filter(item=>item.kind!=="test");
      if (!history.length) return { total: 0, averageSeconds: 0, firstTryRate: 0, streak: 0, week: [] };
      const averageSeconds = Math.round(history.reduce((sum, item) => sum + item.seconds, 0) / history.length);
      const firstTryRate = Math.round(history.filter((item) => item.mistakes === 0).length / history.length * 100);
      const days = new Set(history.map((item) => item.localDate || this.localDateKey(new Date(item.at))));
      let streak = 0;
      const cursor = new Date();
      if(!days.has(this.localDateKey(cursor)))cursor.setDate(cursor.getDate()-1);
      while (days.has(this.localDateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
      return { total: history.length, averageSeconds, firstTryRate, streak, week: Array.from(days).slice(-7) };
    }

    todaySummary() {
      const key=this.localDateKey();
      const occurrences=this.state.occurrences.filter(item=>item.localDate===key);
      const events=this.state.eventLog.filter(item=>this.localDateKey(new Date(item.at))===key);
      const now=new Date();const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());const end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
      const planned=new Set([...occurrences.map(item=>item.id),...Runtime.between(this.state.alarms,+start-1,new Date(+end-1)).map(item=>item.id)]);
      return {scheduled:planned.size,triggered:events.filter(item=>item.type==="triggered").length,completed:events.filter(item=>item.type==="challenge_completed").length,confirmed:events.filter(item=>item.type==="wake_check_confirmed").length,missed:occurrences.filter(item=>item.status==="missed").length,emergency:events.filter(item=>item.type==="emergency_stopped").length,interrupted:events.filter(item=>item.type==="interrupted").length};
    }

    openDetail(screen) {this.state.detailReturnScreen=this.state.screen;this.go(screen);}

    diagnostics() {return {version:"11.0-compliance",language:this.state.language,platform:navigator.platform,online:navigator.onLine,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,browserNotification:this.state.permissionStatus,audio:this.state.audioStatus,soundCheckConfirmed:this.state.soundCheckConfirmed,storageError:Boolean(this.state.persistenceError),alarmCount:this.state.alarms.length,pendingCount:this.state.pendingQueue.length,active:Boolean(this.state.activeSession),events:this.state.eventLog.map(({type,at})=>({type,at})),scope:"Device diagnostics. Alarm names and answers are not included."};}

    downloadDiagnostics() {const blob=new Blob([JSON.stringify(this.diagnostics(),null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="drama-alarm-local-diagnostics.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

    toggleScenes() {
      if (!this.qa) return;
      const panel = document.getElementById("scene-panel");
      panel.classList.toggle("is-open");
      document.querySelectorAll('[data-action="toggle-scenes"]').forEach((button) => button.setAttribute("aria-expanded", panel.classList.contains("is-open")));
    }

    openInfo() {
      const layer = document.getElementById("modal-layer");
      layer.hidden = false;
      layer.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="drama-info-title"><span class="eyebrow">DRAMA ALARM · 11.0</span><h2 id="drama-info-title">${this.copy("你的晨间剧组","Your morning crew")}</h2><p>${this.copy("用一道、两道或三道小挑战开启清晨，选择喜欢的铃声与舞台。","Start your morning with one, two or three little challenges, a sound you love and a stage of your own.")}</p><div class="modal-actions"><button class="secondary" type="button" data-action="onboarding-replay">${this.copy("使用操作指引","How to use Drama Alarm")}</button><button class="primary" type="button" data-action="close-modal">${this.copy("返回疯狂闹钟","Back to Drama Alarm")}</button></div></section>`;
      this.localizeModal();
    }

    openResetDemo() {
      const layer = document.getElementById("modal-layer");
      layer.hidden = false;
      layer.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="reset-title"><h2 id="reset-title">${this.copy("清除本机数据？","Clear local data?")}</h2><p>${this.copy("将移除此设备上的闹钟、偏好、记录和已下载题库。此操作无法撤销。","This removes this device’s alarms, preferences, results and downloaded questions. This cannot be undone.")}</p><div class="modal-actions"><button class="secondary" type="button" data-action="close-modal">${this.copy("取消","Cancel")}</button><button class="primary primary--danger" type="button" data-action="confirm-reset-demo">${this.copy("清除数据","Clear data")}</button></div></section>`;
      this.localizeModal();
    }

    confirmResetDemo() {
      // A v11 tombstone prevents reimport without touching historical versions.
      try{localStorage.setItem("drama-alarm-v11-compliance", JSON.stringify({ schemaVersion: 11, language:this.state.language,onboarded: false, themeId: "daybreak", themeOnboardingComplete: false, intensityOnboardingComplete:false,alarms: [], history: [], recentRiddles: [], emergencyMonth: this.monthKey(), emergencyUses: 0 }));QuestionBank?.resetCache?.();}catch{this.toast(this.copy("无法清除本机数据，请重试。","Could not clear local data. Please try again."));return;}
      window.DramaAndroidHost?.resetLocalData?.();
      this.pendingPackUpdate=null;this.contentRequestSequence=(this.contentRequestSequence || 0)+1;
      clearInterval(this.countdownTimer);
      clearInterval(this.wakeTimer);
      clearTimeout(this.scheduledWakeTimer);
      clearTimeout(this.transitionTimer);
      this.stopPreview(false);
      this.stopRinging();
      this.closeModal();
      this.onboardingReplay=null;
      this.cancelRouteTransition();
      this.state = this.initialState();
      window.DramaAlarmI18n?.setLocale(this.state.language);
      this.routeStack=[this.state.screen];this.routeScroll={};this.routeExpansion={};
      history.replaceState({dramaAlarm:true,screen:this.state.screen},"",location.href);
      this.render();
      this.toast(this.copy("本机数据已清除","Local data cleared"));
    }

    closeModal() {
      const layer = document.getElementById("modal-layer");
      layer.hidden = true;
      layer.innerHTML = "";
    }

    localizeModal() {
      const layer=document.getElementById("modal-layer");
      if(layer && window.DramaAlarmI18n?.localizeHTML)layer.innerHTML=window.DramaAlarmI18n.localizeHTML(layer.innerHTML);
    }

    toast(message) {
      const toast = document.getElementById("toast");
      clearTimeout(this.toastTimer);
      toast.textContent = window.DramaAlarmI18n?.text?.(message) || message;
      toast.classList.add("is-visible");
      this.toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
    }

    escapeHtml(value) {
      return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
    }

    save() {
      // The guide is a reversible walkthrough. Persist live schedules/results,
      // but never overwrite the user's preferences or draft with tour choices.
      if(this.onboardingReplay && !this.onboardingReplay.saving) {
        const replay=this.onboardingReplay,current=this.state;
        replay.saving=true;
        this.state={...current,...this.clone(replay.preferences),...this.clone(replay.context),onboardingReplay:false};
        try{return this.save();}finally{current.persistenceError=this.state.persistenceError;this.state=current;replay.saving=false;}
      }
      if(this.state.storageReadError){this.state.persistenceError=this.state.storageReadError;this.showPersistenceError();return false;}
      if(this.state.activeSession) {
        const fields=["math","riddleInstance","riddleIndex","riddleWrong","lastRiddleWrong","challengePlan","challengeSeenIds","checkMode","activeCheckId","wakeCheckSeconds","wakeCheckReturnScreen","wakeCheckSuspendedState","challengeMistakes","previousScreen","safetyKind","safetyTargetLevel","safetyReturnScreen","volume"];
        this.state.activeSession.phase=this.state.screen;
        this.state.activeSession.progress={};
        for(const key of fields)if(this.state[key]!==undefined)this.state.activeSession.progress[key]=this.clone(this.state[key]);
      }
      const saved = {
        schemaVersion: 11,
        language:this.state.language,
        screen:this.state.screen,
        themeId: this.state.themeId,
        themeOnboardingComplete: this.state.themeOnboardingComplete,
        alarms: this.state.alarms,
        permission: this.state.permission,
        permissionStatus: this.state.permissionStatus,
        onboarded: this.state.onboarded,
        soundId: this.state.soundId,
        masterVolume: this.state.masterVolume,
        haptics: this.state.haptics,
        hapticCues: this.state.hapticCues,
        history: this.state.history,
        recentRiddles: this.state.recentRiddles,
        emergencyMonth: this.state.emergencyMonth,
        emergencyUses: this.state.emergencyUses,
        defaults:this.state.defaults,
        activeSession:this.state.activeSession,
        occurrences:this.state.occurrences.slice(-300),
        pendingQueue:this.state.pendingQueue,
        wakeChecks:this.state.wakeChecks.slice(-100),
        lastScheduleCheckAt:this.state.lastScheduleCheckAt,
        eventLog:this.state.eventLog.slice(-300),
        lastResult:this.state.lastResult,
        soundCheckConfirmed:this.state.soundCheckConfirmed,
        soundCheckSoundId:this.state.soundCheckSoundId,
        tutorialComplete:this.state.tutorialComplete,
        intensityOnboardingComplete:this.state.intensityOnboardingComplete,
        adFreeOnboardingSeen:this.state.adFreeOnboardingSeen,
        reduceMotion:this.state.reduceMotion,
        migratedFromVersion:this.state.migratedFromVersion,
        completedReturnContext:this.state.completedReturnContext,
        editorDraft:this.state.editorOpen?{alarm:this.state.alarm,soundId:this.state.soundId,masterVolume:this.state.masterVolume,editorMode:this.state.editorMode,snapshot:this.state.editorSnapshot}:null,
      };
      try {
        localStorage.setItem("drama-alarm-v11-compliance", JSON.stringify(saved));
        this.state.persistenceError="";
        document.getElementById("persistence-alert")?.remove();
        return true;
      } catch (_) {
        this.state.persistenceError="Changes could not be saved in this browser. Keep this page open, check storage and try again.";
        this.showPersistenceError();
        return false;
      }
    }

    showPersistenceError() {
      const screen=document.querySelector("#app .screen");if(!screen)return;
      let alert=document.getElementById("persistence-alert");
      if(!alert){
        alert=document.createElement("div");alert.id="persistence-alert";alert.className="persistence-alert";alert.setAttribute("role","alert");
        alert.style.cssText="position:relative;flex-shrink:0;margin:12px 0;padding:12px;background:#fff0ed;color:#6b1c22;border:2px solid #b74444;border-radius:12px;font:600 14px/1.4 system-ui";
        const body=screen.querySelector(".screen-body") || screen;
        const head=body.querySelector(".screen-head");
        if(head)head.insertAdjacentElement("afterend",alert);else body.prepend(alert);
      }
      alert.textContent=window.DramaAlarmI18n?.text?.(this.state.persistenceError) || this.state.persistenceError;
    }
  }

  window.dramaAlarmApp = new DramaAlarmApp();
})();
