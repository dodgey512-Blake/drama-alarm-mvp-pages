(function () {
  "use strict";

  const { screenCatalog, riddles, soundPresets } = window.DramaAlarmData;
  const letters = ["A", "B", "C", "D"];

  const iconPaths = {
    home: '<path d="m3.5 10 8.5-7 8.5 7v10a1 1 0 0 1-1 1H15v-7H9v7H4.5a1 1 0 0 1-1-1Z"/>',
    run: '<path d="M4 20V5m0 15h16M7.5 15l4-5 3.5 3 5-7"/><path d="M16 6h4v4"/>',
    settings: '<path d="m9.3 3-.6 2.1-1.8 1L4.8 6l-2 3.5L4.4 11v2L2.8 14.5l2 3.5 2.1-.1 1.8 1 .6 2.1h5.4l.6-2.1 1.8-1 2.1.1 2-3.5-1.6-1.5v-2l1.6-1.5-2-3.5-2.1.1-1.8-1L14.7 3Z"/><circle cx="12" cy="12" r="3"/>',
    back: '<path d="m14.5 6-6 6 6 6"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    bell: '<path d="M5 16h14l-2-3V9a5 5 0 0 0-10 0v4Zm4 4h6M10 3V2h4v1"/>',
    play: '<path d="m9 5 10 7-10 7Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    shield: '<path d="m12 3 8 3v5c0 5-4 8-8 10-4-2-8-5-8-10V6Z"/><path d="m8.5 11.5 2.5 2.5 4.5-5"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 1.2-4.7 1.5 1.5 0 0 1 .8-2.8H18a3 3 0 0 0 3-3C21 6.4 17 3 12 3Z"/><circle cx="7.5" cy="10" r=".7"/><circle cx="10.5" cy="6.8" r=".7"/><circle cx="15" cy="7" r=".7"/>',
    star: '<path d="m12 2 2.8 6.2 6.7.8-5 4.6 1.4 6.6L12 16.8l-5.9 3.4 1.4-6.6L2.5 9l6.7-.8Z"/>',
    math: '<path d="M5 7h6M8 4v6m6 7h6M4 17h6m11-7-5 5m0-5 5 5"/>',
    riddle: '<path d="M5 4h14v13H9l-4 4Z"/><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 4m0 2v.1"/>',
    sound: '<path d="m4 9 4-4v14l-4-4H2V9Zm8-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    volume: '<path d="m4 9 5-4v14l-5-4H2V9Zm10-1v8m4-11v14m4-9v4"/>',
    access: '<rect x="5" y="3" width="14" height="18" rx="4"/><path d="m9 12 2 2 4-4M10 18h4"/>',
    clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M4 3 1 6m19-3 3 3"/>',
    haptics: '<rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4 8v8m16-8v8M1 10v4m22-4v4"/>',
    reset: '<path d="M5 7h14M9 7V4h6v3m-8 0 1 14h8l1-14M10 11v6m4-6v6"/>',
    pass: '<path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4Zm12 0v3m0 3v1m0 3v2"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    backspace: '<path d="m8 5-6 7 6 7h13V5Zm4 4 6 6m0-6-6 6"/>',
    moon: '<path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z"/>',
    leaf: '<path d="M20 4C9 2 3 8 6 16s17 1 14-12ZM5 20 16 9"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5h14M5 17.5h14"/>',
    book: '<path d="M12 5C8 2 4 3 2 4v15c3-1 6-1 10 1 4-2 7-2 10-1V4c-2-1-6-2-10 1Zm0 0v15M5 8h4m-4 4h4m6-4h4m-4 4h4"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
    cloud: '<path d="M7 18a5 5 0 1 1 0-10 6 6 0 0 1 11-2 6 6 0 0 1 0 12Z"/>',
    language: '<path d="M3 5h12M9 3v2m-4 4c1 4 4 7 9 9M13 5c-1 6-5 10-10 13m11 3 4-11 4 11m-7-3h6"/>',
  };

  function icon(name, className = "") {
    return `<svg class="v5-icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.star}</svg>`;
  }

  function settingIcon(name) {
    return `<i class="setting-icon setting-icon--${name}">${icon(name)}</i>`;
  }

  function morningArt(className = "") {
    return `<svg class="morning-art ${className}" viewBox="0 0 160 130" fill="none" aria-hidden="true"><circle class="morning-art__halo" cx="83" cy="55" r="42" fill="currentColor" opacity=".12"/><circle class="morning-art__sun" cx="83" cy="55" r="25" fill="currentColor"/><path d="M20 94c13-12 24-18 34-18s19 9 30 9 27-13 56-3v29H20Z" fill="currentColor" opacity=".18"/><path d="M25 107h110M83 15V8m36 25 7-5M47 31l-6-6m87 33h9M30 59h8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path class="morning-art__curtain" d="M15 14h28c0 33-4 57-28 76Zm130 0h-28c0 33 4 57 28 76Z" fill="currentColor" opacity=".22"/><path d="M72 58c2 3 5 5 11 5s9-2 11-5" stroke="var(--bg, #fff)" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  }

  function themeInfo(state, id) {
    return (state.themes || []).find((theme) => theme.id === id) || {
      id, name: id === "daybreak" ? "Daybreak" : "Velvet", subtitle: id === "daybreak" ? "Fresh air. A clear beginning." : "A little theatre. A softer dawn.",
      description: id === "daybreak" ? "Mint light, airy cards and quiet focus." : "Cream, rose and lilac. Your original morning stage.",
    };
  }

  function themeArtwork(id, compact = false) {
    const character = window.DramaAlarmMascot?.render("welcome", {theme:id,size:compact?76:152,key:`theme-${id}-${compact?"small":"full"}`}) || morningArt();
    return `<div class="theme-choice-art theme-choice-art--${id}${compact ? " theme-choice-art--compact" : ""}" aria-hidden="true"><div class="v9-theme-scene"><span class="v9-theme-stage">${icon(id==="daybreak"?"sun":"moon")}<b>DRAMA ALARM</b></span><strong>06:30</strong><span class="v9-theme-alarm">${icon("bell")}<i></i></span><span class="v9-theme-dock">${icon("home")}${icon("run")}${icon("settings")}</span></div>${character}</div>`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }

  function currentTime(state) {
    return new Intl.DateTimeFormat(state.language==="zh-CN"?"zh-CN":"en-US", { hour: "numeric", minute: "2-digit",hour12:false }).format(state.now || new Date());
  }

  function alarmTime(time) {
    const [hour, minute] = String(time || "06:30").split(":").map(Number);
    const date = new Date(2026, 0, 1, hour, minute);
    const parts = new Intl.DateTimeFormat(window.DramaAlarmI18n?.getLocale?.()==="zh-CN"?"zh-CN":"en-US", { hour: "numeric", minute: "2-digit", hour12: window.DramaAlarmI18n?.getLocale?.()!=="zh-CN" }).formatToParts(date);
    return {
      time: `${parts.find((part) => part.type === "hour")?.value}:${parts.find((part) => part.type === "minute")?.value}`,
      period: parts.find((part) => part.type === "dayPeriod")?.value || "",
    };
  }

  function occurrenceDisplay(occurrence, fallbackAlarm) {
    const alarm = occurrence?.alarm || fallbackAlarm;
    const configured = alarmTime(alarm?.time || "06:30");
    const at = new Date(occurrence?.at ?? occurrence?.scheduledAt ?? NaN);
    if (Number.isNaN(at.getTime())) return { ...configured, configured, actual: false, adjusted: false, dateLabel: "" };
    const localTime = `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`;
    return { ...alarmTime(localTime), configured, actual: true, adjusted: localTime !== alarm?.time,
      dateLabel: new Intl.DateTimeFormat(window.DramaAlarmI18n?.getLocale?.()==="zh-CN"?"zh-CN":"en-US", { weekday: "long", month: "short", day: "numeric" }).format(at) };
  }

  function sessionDisplay(state) {
    const session = state.activeSession;
    const occurrence = (state.occurrences || []).find(item => item.id === session?.occurrenceId);
    return occurrenceDisplay({ scheduledAt: occurrence?.scheduledAt ?? session?.scheduledAt }, state.alarm);
  }

  function daylightAdjustment(display) {
    return display.adjusted ? `<span class="inline-help" data-dst-adjustment>Daylight saving adjustment: configured ${display.configured.time} ${display.configured.period} → ${display.time} ${display.period}.</span>` : "";
  }

  function dayLabel(days) {
    const value = (days || []).join(",");
    if (value === "0,1,2,3,4,5,6") return "Every day";
    if (value === "1,2,3,4,5") return "Weekdays";
    if (value === "0,6") return "Weekends";
    return (days || []).map((day) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]).join(" · ") || "No days";
  }

  function scheduleLabel(alarm) {
    if (alarm.repeatMode === "once") {
      const date = alarm.onceDate ? new Date(`${alarm.onceDate}T12:00:00`) : null;
      return date && !Number.isNaN(date.getTime()) ? `Once · ${new Intl.DateTimeFormat(window.DramaAlarmI18n?.getLocale?.()==="zh-CN"?"zh-CN":"en-US", { weekday: "short", month: "short", day: "numeric" }).format(date)}` : "Once · choose a date";
    }
    return dayLabel(alarm.days);
  }

  function browserNotice() {
    return `<div class="browser-notice">${icon("access")}<span><strong>Browser reminders</strong><small>Keep this tab open. Not a system alarm.</small></span></div>`;
  }

  function resumeAudio(state) {
    return state.audioResumeRequired ? `<div class="audio-recovery" role="status"><strong>Your wake-up is still in progress.</strong><p>Sound needs a tap after reopening this page.</p>${secondary("Resume alarm sound", "resume-ringing")}</div>` : "";
  }

  function fieldError(state, field) {
    return state.editorError && state.editorErrorField === field ? `<p class="field-error" id="error-${field}" role="alert">${escapeHtml(state.editorError)}</p>` : "";
  }

  function soundById(id) {
    return soundPresets.find((preset) => preset.id === id) || soundPresets[0];
  }

  function mathExpression(math) {
    return math.expression || `${math.a} ${math.op} ${math.b}`;
  }

  function status(state, dark, override) {
    return `<div class="status-bar${dark ? " status-bar--dark" : ""}"><span>${override || currentTime(state)}</span><i class="battery" aria-label="Battery"></i></div>`;
  }

  function ambient(kind) {
    return `<i class="ambient ambient--${kind}" aria-hidden="true"></i>`;
  }

  function progress(active) {
    return `<div class="act-progress" aria-label="Setup progress"><i class="${active >= 1 ? "is-done" : "is-active"}"></i><span></span><i class="${active >= 2 ? "is-done" : active === 1 ? "is-active" : ""}"></i><span></span><i class="${active >= 3 ? "is-done" : active === 2 ? "is-active" : ""}"></i></div>`;
  }

  function primary(label, action, extra) {
    return `<button class="primary" type="button" data-action="${action}"${extra || ""}>${label}</button>`;
  }

  function secondary(label, action, extra) {
    return `<button class="secondary" type="button" data-action="${action}"${extra || ""}>${label}</button>`;
  }

  function textButton(label, action, extra) {
    return `<button class="text-button" type="button" data-action="${action}"${extra || ""}>${label}</button>`;
  }

  function toggle(action, on, label, extra) {
    return `<button class="toggle${on ? " is-on" : ""}" type="button" data-action="${action}" role="switch" aria-checked="${on}" aria-label="${escapeHtml(label)}"${extra || ""}></button>`;
  }

  function detailHead(title, action = "settings-back") {
    return `<div class="detail-head" data-slot="toolbar"><button class="icon-back toolbar-button" type="button" data-action="${action}" aria-label="Back">${icon("back")}</button><h1>${title}</h1><span class="toolbar-spacer" aria-hidden="true"></span></div>`;
  }

  function optionCard(label, copy, selected, action, value) {
    return `<button class="option-card${selected ? " is-selected" : ""}" type="button" data-action="${action}" data-value="${value}" aria-pressed="${selected}"><span><strong>${label}</strong><small>${copy}</small></span><i></i></button>`;
  }

  function bottomNav(active) {
    return `<nav class="bottom-nav" data-slot="tabs" data-liquid-nav data-active-index="${["home","run","settings"].indexOf(active)}" aria-label="Primary navigation">
      <button type="button" data-action="go-home" class="${active === "home" ? "active" : ""}" ${active === "home" ? 'aria-current="page"' : ""}>${icon("home")}<span>Home</span></button>
      <button type="button" data-action="open-run" class="${active === "run" ? "active" : ""}" ${active === "run" ? 'aria-current="page"' : ""}>${icon("run")}<span>Your Run</span></button>
      <button type="button" data-action="open-settings" class="${active === "settings" ? "active" : ""}" ${active === "settings" ? 'aria-current="page"' : ""}>${icon("settings")}<span>Settings</span></button>
    </nav>`;
  }

  function keypad(prefix, input) {
    const keyAction = prefix ? `${prefix}-digit` : "math-digit";
    const backAction = prefix ? `${prefix}-backspace` : "math-backspace";
    const submitAction = prefix ? `${prefix}-submit` : "math-submit";
    return `<div class="keypad" aria-label="Number keypad">
      ${[1,2,3,4,5,6,7,8,9].map((digit) => `<button class="key" type="button" data-action="${keyAction}" data-value="${digit}">${digit}</button>`).join("")}
      <button class="key key--plain" type="button" data-action="${backAction}" aria-label="Delete last digit">${icon("backspace")}</button>
      <button class="key" type="button" data-action="${keyAction}" data-value="0">0</button>
      <button class="key key--submit" type="button" data-action="${submitAction}" aria-label="Submit answer" ${input ? "" : "disabled"}>${icon("check")}</button>
    </div>`;
  }

  function riddleOptions(riddle, action, wrongIndex) {
    return `<div class="riddle-options">${riddle.options.map((option, index) => `
      <button class="riddle-option${wrongIndex === index ? " is-wrong" : ""}" type="button" data-action="${action}" data-index="${index}">
        <span>${letters[index]}</span>${escapeHtml(option)}
      </button>`).join("")}</div>`;
  }

  function wrongRiddleOption(riddle, wrongIndex) {
    const index = Number.isInteger(wrongIndex) ? wrongIndex : 0;
    return `<div class="riddle-options"><div class="riddle-option is-wrong" aria-label="Incorrect answer: ${escapeHtml(riddle.options[index])}"><span>${letters[index]}</span>${escapeHtml(riddle.options[index])}</div></div>`;
  }

  function wave(active) {
    return `<span class="sound-wave${active ? " is-playing" : ""}" aria-hidden="true">${Array.from({ length: 11 }, (_, index) => `<i style="--bar:${index}"></i>`).join("")}</span>`;
  }

  function soundChoice(preset, state, action) {
    const selected = state.soundId === preset.id;
    const playing = state.previewingSound === preset.id;
    return `<button class="sound-choice sound-choice--${preset.color}${selected ? " is-selected" : ""}" type="button" data-action="${action}" data-sound="${preset.id}" aria-pressed="${selected}"><i></i><span>${preset.name}</span>${playing ? "<b>PLAYING</b>" : ""}</button>`;
  }

  function screen08(state) {
    return `<section class="screen" data-screen-id="08">${ambient("rose")}${ambient("lilac")}${status(state)}
      <div class="screen-body screen-body--center welcome-body">
        <span class="eyebrow">DRAMA ALARM</span>
        <div class="brand-stage" aria-hidden="true">${morningArt("welcome-art")}</div>
        <h1 class="screen-title">Every morning<br>deserves an entrance.</h1>
        <p class="screen-copy">Pick your time. Find your sound.<br>Meet morning with two little acts.</p>
        <div class="arrival-card"><i class="arrival-card__pulse"></i><div><strong>Your first alarm, without the wait</strong><span>Set a time now. Try the guided sound check and teaching rehearsal when you’re ready.</span></div></div>
        <div class="button-stack">${primary("Set my first alarm", "quick-create-alarm")}${secondary("Choose my free theme first", "take-stage")}<p class="privacy-line">Two free themes · no account needed</p></div>${browserNotice()}
      </div>
    </section>`;
  }

  function screen17(state) {
    const statusCopy = state.permissionStatus === "denied" ? "Notifications are currently blocked" : "You stay in control of every alert";
    return `<section class="screen" data-screen-id="17">${ambient("gold")}${status(state)}
      <div class="screen-body screen-body--center">
        <span class="eyebrow">SETUP · 1 OF 3</span>
        <div class="permission-mark permission-mark--live" aria-hidden="true"><i></i></div>
        <h1 class="screen-title permission-title">Let the alarm in</h1>
        <p class="screen-copy">Browser notifications are optional. The alarm runs while this page is available.</p>
        <div class="permission-list"><p><i></i><span><strong>Only alarms you create</strong><small>No marketing notifications</small></span></p><p><i></i><span><strong>${statusCopy}</strong><small>Change it anytime in Settings</small></span></p><p><i></i><span><strong>No health access</strong><small>Your choices stay on this device</small></span></p></div>
        <div class="button-stack">${primary("Allow alarm notifications", "allow-access")}${textButton("Continue without notifications", "permission-not-now")}</div>
      </div>
    </section>`;
  }

  function screen18(state) {
    if (state.rehearsalMode === "sound") {
      const selected = soundById(state.soundId);
      const playing = state.previewingSound === selected.id;
      const includedSounds = soundPresets.filter((preset) => !preset.premium);
      return `<section class="screen" data-screen-id="18">${ambient(selected.color)}${status(state)}
        <div class="screen-body sound-rehearsal">
          <div class="screen-head"><div><span class="eyebrow">SETUP · 2 OF 3</span><h1>Sound check</h1></div><span class="sound-level">${state.masterVolume}% MAX</span></div>
          ${progress(0)}
          <div class="sound-hero sound-hero--${selected.color}"><i class="sound-hero__halo"></i><div class="sound-hero__disc">${wave(playing)}</div><span class="eyebrow">${selected.detail}</span><h2>${selected.name}</h2><p>${selected.mood}</p></div>
          <div class="sound-choice-grid">${includedSounds.map((preset) => soundChoice(preset, state, "select-onboarding-sound")).join("")}</div>
          <label class="volume-control" for="rehearsal-volume"><span>Application sound gain</span><output data-volume-output="rehearsal-volume">${state.masterVolume}%</output><input id="rehearsal-volume" type="range" min="25" max="100" step="1" value="${state.masterVolume}"></label>
          <p class="privacy-line">This controls the demo’s gain, not your device volume. Check your speaker or headphones, then listen.</p>
          <div class="button-stack sound-setup-actions">${secondary(playing ? "Stop preview" : `Preview ${selected.name}`, playing ? "stop-preview" : "preview-onboarding-sound", ` data-sound="${selected.id}"`)}${secondary(state.soundCheckConfirmed ? "Sound confirmed ✓" : "I heard it", "confirm-sound-check", state.audioStatus?.engineReady ? "" : " disabled")}${primary("Try the two-act rehearsal", "rehearsal-sound-continue")}${textButton("Finish later", "skip-tutorial")}</div>
        </div>
      </section>`;
    }
    if (state.rehearsalMode === "riddle") {
      const riddle = riddles[0];
      return `<section class="screen" data-screen-id="18">${ambient("lilac")}${status(state)}
        <div class="screen-body">
          <div class="screen-head"><div><span class="eyebrow">SETUP · 3 OF 3</span><h1>Rehearsal · Finale</h1></div><span class="sound-level">SOUND GENTLE</span></div>
          ${progress(2)}
          <span class="eyebrow finale-label">THE FINALE</span>
          <h2 class="riddle-question rehearsal-question">${escapeHtml(riddle.question)}</h2>
          <p class="screen-copy rehearsal-copy">Pick one answer. A wrong choice keeps the rehearsal going.</p>
          ${riddleOptions(riddle, "rehearsal-riddle", state.rehearsalWrong)}
        </div>
      </section>`;
    }
    return `<section class="screen" data-screen-id="18">${status(state)}
      <div class="screen-body screen-body--center">
        <div class="screen-head full-width"><div><span class="eyebrow">SETUP · 3 OF 3</span><h1>Rehearsal · Act 1</h1></div><span class="sound-level">SOUND GENTLE</span></div>
        ${progress(1)}
        <p class="screen-copy rehearsal-intro">Practice one addition question. This does not change your results.</p>
        <div class="math-equation">18 + 7</div>
        <div class="math-input" aria-label="Current rehearsal answer">${state.rehearsalInput || ""}</div>
        <p class="math-hint${state.rehearsalError ? " math-hint--wrong" : ""}">${state.rehearsalError || "Finish the answer, then meet The Finale."}</p>
        ${keypad("rehearsal", state.rehearsalInput)}
      </div>
    </section>`;
  }

  function screen09(state) {
    const selected = soundById(state.soundId);
    return `<section class="screen" data-screen-id="09">${ambient("gold")}${status(state)}
      <div class="screen-body screen-body--center"><span class="eyebrow">TEACHING COMPLETE</span>${crew(state,"bravo",128,"teaching-complete")}<h1 class="v9-result-title">You know the little acts.</h1><p class="screen-copy">${state.soundCheckConfirmed?"Teaching complete. You also confirmed hearing the sound.":"Teaching complete. Sound has not been confirmed yet."}</p>
        <div class="rehearsal-summary"><p><i></i><span>Sound check</span><strong>${state.soundCheckConfirmed?"Heard by you":"Not checked"}</strong></p><p><i></i><span>Alarm sound</span><strong>${selected.name}</strong></p><p><i></i><span>Application gain limit</span><strong>${state.masterVolume}%</strong></p></div>
        <div class="button-stack">${primary(state.alarms.length ? "Back to my alarms" : "Set my first alarm", state.alarms.length ? "skip-tutorial" : "set-first-alarm")}</div>
      </div>
    </section>`;
  }

  function alarmCard(alarm, state) {
    const display = alarmTime(alarm.time);
    const sound = soundById(alarm.soundId);
    return `<article class="alarm-card${alarm.enabled ? "" : " is-paused"}">
      <div class="alarm-card__top"><button class="alarm-card__edit" type="button" data-action="edit-alarm" data-id="${escapeHtml(alarm.id)}" aria-label="Edit ${escapeHtml(alarm.label)}"><span class="alarm-time">${display.time}<small>${display.period}</small></span><span class="alarm-label" data-i18n-ignore>${escapeHtml(alarm.label)}</span>${alarm.enabled ? "" : '<span class="alarm-paused-label">Paused</span>'}</button>${toggle("toggle-alarm", alarm.enabled, `${alarm.label} ${alarm.enabled ? "enabled" : "paused"}`, ` data-id="${escapeHtml(alarm.id)}"`)}</div>
      <button class="alarm-card__details" type="button" data-action="edit-alarm" data-id="${escapeHtml(alarm.id)}"><span class="alarm-meta">${scheduleLabel(alarm)} · ${sound.name} · ${alarm.maxVolume}% app gain</span><span class="tags"><span class="tag">${escapeHtml(taskSummary(alarm).label)}</span><span class="tag tag--lilac">${escapeHtml(taskSummary(alarm).composition)}</span>${alarm.check ? '<span class="tag tag--gold">Wake-up check</span>' : ""}</span></button>
    </article>`;
  }

  function screen01(state) {
    const next = state.nextAlarm;
    const now = new Date(state.now || Date.now());
    const hour = now.getHours();
    const greeting = hour < 5 ? "A quiet night." : hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";
    const week = Array.from({ length: 7 }, (_, index) => { const date = new Date(now); date.setDate(now.getDate() + index - 3); return date; });
    const nextTime = next ? occurrenceDisplay(next) : null;
    return `<section class="screen" data-screen-id="01">${ambient("rose")}${ambient("lilac")}${status(state)}
      <div class="screen-body screen-body--scroll home-body">
        <div class="v5-topline"><div><span class="v5-date">${new Intl.DateTimeFormat(window.DramaAlarmI18n?.getLocale?.()==="zh-CN"?"zh-CN":"en-US", { weekday: "long", month: "short", day: "numeric" }).format(now)}</span><h1 class="v5-greeting">${greeting}</h1></div><button class="quiet-action" type="button" data-action="new-alarm" aria-label="Add alarm">${icon("plus")}</button></div>
        ${browserNotice()}${state.persistenceError ? `<div class="field-error" role="alert">${escapeHtml(state.persistenceError)}</div>` : ""}
        <div class="calendar-week" aria-label="This week">${week.map((date, index) => `<div class="calendar-day${index === 3 ? " is-today" : ""}" ${index === 3 ? 'aria-current="date"' : ""}><span>${index === 3 ? "Today" : new Intl.DateTimeFormat(window.DramaAlarmI18n?.getLocale?.()==="zh-CN"?"zh-CN":"en-US", { weekday: "short" }).format(date)}</span><strong>${date.getDate()}</strong><i></i></div>`).join("")}</div>
        <button class="next-show-card" type="button" data-action="${next ? "edit-alarm" : "new-alarm"}"${next ? ` data-id="${escapeHtml(next.alarm.id)}"` : ""} aria-label="${next ? `Edit next alarm, ${nextTime.time} ${nextTime.period}` : "Set your next alarm"}">
          <div class="next-show-kicker">${icon("sun")}<span>${next ? "Your next entrance" : "Your morning, your stage"}</span>${icon("chevron")}</div>
          <div class="next-show-orbit"><i></i><span class="orbit-note">${next ? "CURTAIN UP IN" : "ALL QUIET"}</span><strong class="next-show-time">${next ? next.countdown : "A new day"}</strong><span class="next-show-caption">${next ? `${nextTime.dateLabel || next.dayLabel} · ${nextTime.time} ${nextTime.period}` : "Set an alarm and make it yours"}</span></div>
          <span class="next-show-label">${next ? escapeHtml(next.alarm.label) : "A gentle start is waiting."}</span>
          ${next ? daylightAdjustment(nextTime) : ""}
        </button>
        <div class="section-heading"><h2>My alarms</h2><button class="text-button" type="button" data-action="new-alarm">Add new ${icon("plus")}</button></div>
        <div class="alarm-list">${state.alarms.length ? state.alarms.map((alarm) => alarmCard(alarm, state)).join("") : `<div class="empty-alarm">${icon("bell")}<strong>Your first show is waiting</strong><p>Choose a time, a sound and a little resolve.</p>${secondary("Create my first alarm", "new-alarm")}</div>`}</div>
        <button class="rehearsal-card" type="button" data-action="start-tutorial"><span class="rehearsal-card__icon">${icon("play")}</span><span><strong>Sound check & teaching rehearsal</strong><small>${state.soundCheckConfirmed ? "Sound heard. Practice both acts anytime." : "Optional next step · listen and try both acts."}</small></span>${icon("chevron")}</button>
        <div class="morning-note">${icon("leaf")}<span><strong>A small cue for tomorrow</strong><small>Leave your phone a few steps from bed. Give your first act some room.</small></span></div>
      </div>
      ${bottomNav("home")}
    </section>`;
  }

  function screen02(state) {
    const alarm = state.alarm;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const selected = soundById(state.soundId);
    const once = alarm.repeatMode === "once";
    const errorField = state.editorErrorField || "";
    return `<section class="screen" data-screen-id="02">${ambient("gold")}${status(state)}
      <div class="screen-body screen-body--scroll editor-body">
        <div class="screen-head sticky-head" data-slot="toolbar"><button class="toolbar-button toolbar-button--quiet compact-button" type="button" data-action="go-home">${icon("close")}<span>Cancel</span></button><h1>${state.editorMode === "edit" ? "Edit Alarm" : "New Alarm"}</h1><button class="toolbar-button toolbar-button--accent compact-button save-link" type="button" data-action="save-alarm">${icon("check")}<span>Save</span></button></div>
        ${state.editorError ? `<div class="form-error error-summary" id="editor-error-summary" tabindex="-1" role="alert"><strong>Let’s finish this setting</strong><span>${escapeHtml(state.editorError)}</span></div>` : ""}
        <label class="alarm-label-field" for="alarm-label"><span class="eyebrow">ALARM NAME</span><input id="alarm-label" type="text" maxlength="32" value="${escapeHtml(alarm.label)}" placeholder="Morning Show" autocomplete="off" ${errorField === "label" ? 'aria-invalid="true" aria-describedby="error-label"' : ""}></label>${fieldError(state, "label")}
        <label class="time-field" for="alarm-time"><span class="field-label">Alarm time</span><input class="editor-time" id="alarm-time" type="time" value="${alarm.time}" aria-label="Alarm time" ${errorField === "time" ? 'aria-invalid="true" aria-describedby="error-time"' : ""}></label>${fieldError(state, "time")}
        <fieldset class="repeat-field"><legend>When should it ring?</legend><div class="segment repeat-segment" role="group" aria-label="Alarm frequency">${[ ["once", "Just once"], ["weekly", "Repeat weekly"] ].map(([value, label]) => `<button type="button" data-action="set-repeat-mode" data-value="${value}" aria-pressed="${(once ? "once" : "weekly") === value}" class="${(once ? "once" : "weekly") === value ? "is-on" : ""}">${label}</button>`).join("")}</div>
        ${once ? `<label class="date-field" for="alarm-date"><span>Ring on this date</span><input id="alarm-date" type="date" value="${escapeHtml(alarm.onceDate || "")}" ${errorField === "onceDate" || errorField === "date" ? 'aria-invalid="true" aria-describedby="error-date"' : ""}></label>${fieldError(state, errorField === "onceDate" ? "onceDate" : "date")}<p class="inline-help">This alarm turns off after its one scheduled occurrence.</p>` : `<div class="days" id="repeat-days" role="group" tabindex="-1" aria-label="Repeat days" ${errorField === "days" ? 'aria-invalid="true" aria-describedby="error-days"' : ""}>${days.map((day, index) => `<button class="day${alarm.days.includes(index) ? " is-on" : ""}" type="button" data-action="toggle-day" data-index="${index}" aria-label="${day}" aria-pressed="${alarm.days.includes(index)}">${day.slice(0, 3)}</button>`).join("")}</div>${fieldError(state, "days")}`}</fieldset>
        <p class="schedule-summary">${escapeHtml(scheduleLabel(alarm))} · ${alarmTime(alarm.time).time} ${alarmTime(alarm.time).period}</p>
        <span class="eyebrow section-label">WAKE-UP SHOW</span>
        <div class="form-card"><div class="form-row difficulty-form-row"><span id="difficulty-group-label">Math difficulty</span><div class="segment" role="group" aria-labelledby="difficulty-group-label">${["Gentle", "Classic", "Diva"].map((level) => `<button type="button" data-action="set-difficulty" data-value="${level}" aria-pressed="${alarm.difficulty === level}" class="${alarm.difficulty === level ? "is-on" : ""}">${level}</button>`).join("")}</div><small>Gentle is recommended for a first morning. All levels use addition and subtraction.</small></div><div class="form-row"><span>Riddle finale <small>One four-choice question after Math</small></span>${toggle("toggle-riddle", alarm.riddle, "Riddle finale")}</div><div class="form-row"><span>Wake-up Check <small>Confirm again after ${alarm.checkDelay || 5} minutes</small></span>${toggle("toggle-check", alarm.check, "Wake-up check")}</div></div>
        <span class="eyebrow section-label">SOUND</span>
        <div class="form-card"><button class="form-row form-row--button" type="button" data-action="open-editor-sounds"><span><strong>Alarm sound</strong><small>${selected.mood}</small></span><strong>${selected.name} ${icon("chevron")}</strong></button><label class="form-row volume-row" for="max-volume"><span><b>Application gain limit</b><small>Your device volume is separate</small></span><output data-volume-output="max-volume">${state.masterVolume}%</output><input id="max-volume" type="range" min="25" max="100" step="1" value="${state.masterVolume}"></label><div class="form-row"><span>Rising volume</span>${toggle("toggle-rising", alarm.rising, "Rising volume")}</div><div class="form-row"><span>Quieter after each act</span>${toggle("toggle-quieter", alarm.quieter, "Quieter after each act")}</div></div>
        ${browserNotice()}
        <div class="editor-actions">${primary("Save alarm", "save-alarm")}${state.editorMode === "edit" ? '<button class="text-button text-button--danger" type="button" data-action="delete-alarm">Delete alarm</button>' : ""}</div>
      </div>
    </section>`;
  }

  function screen19(state) {
    const ownNext = window.DramaAlarmRuntime.next([state.alarm], new Date(state.now || Date.now()), state.occurrences || []);
    const display = occurrenceDisplay(ownNext, state.alarm);
    const configured = alarmTime(state.alarm.time);
    const selected = soundById(state.alarm.soundId);
    return `<section class="screen" data-screen-id="19">${ambient("gold")}${status(state)}
      <div class="screen-body screen-body--center"><i class="spark ready-spark"></i><span class="eyebrow ready-eyebrow">SAVED ON THIS BROWSER</span><div class="ready-time">${display.time}<small>${display.period}</small></div><p class="ready-meta">${scheduleLabel(state.alarm)} · ${escapeHtml(state.alarm.label)}</p><p class="countdown-label" data-next-occurrence>${ownNext ? `Next for this alarm: ${display.dateLabel} · ${display.time} ${display.period}` : state.alarm.enabled ? "No upcoming occurrence for this alarm." : "Saved as paused · no upcoming occurrence."}</p>${daylightAdjustment(display)}<p class="privacy-line">Configured time: ${configured.time} ${configured.period}</p>
        <div class="check-card ready-check"><span class="eyebrow">WHAT IS READY</span><p><i></i><span>Browser notifications</span><strong>${state.permissionStatus === "granted" ? "Allowed" : "Optional"}</strong></p><p><i></i><span>${selected.name} · ${state.masterVolume}% app gain</span><strong>${state.soundCheckConfirmed ? "Heard by you" : "Not checked"}</strong></p><p><i></i><span>${state.alarm.difficulty} Math${state.alarm.riddle ? " + Riddle" : ""}</span><strong>${state.alarm.check ? "+ Check" : ""}</strong></p></div>
        ${browserNotice()}<div class="button-stack">${primary("Back to my alarms", "done-ready")}${secondary("Check sound & try the teaching", "start-tutorial")}${textButton(state.testCountdown ? "Test scheduled" : "Rehearse in 10 seconds", "test-alarm", state.testCountdown ? " disabled" : "")}</div>
      </div>
    </section>`;
  }

  function screen16(state) {
    const display = sessionDisplay(state);
    return `<section class="screen screen--dark curtain-screen" data-screen-id="16"><div class="curtain-left"></div><div class="curtain-right"></div><div class="curtain-content"><div><span class="eyebrow">THE CURTAIN IS RISING</span><strong>${display.time}</strong><p class="screen-copy">${escapeHtml(state.alarm.label)} · ${soundById(state.alarm.soundId).name}</p>${daylightAdjustment(display)}</div><p class="curtain-caption">Your first act is ready…</p></div></section>`;
  }

  function screen03(state) {
    const display = sessionDisplay(state);
    return `<section class="screen screen--dark" data-screen-id="03">${ambient("rose")}${status(state, true)}<div class="screen-body screen-body--center showtime-body"><span class="ringing-state ringing-state--hero"><i></i>${soundById(state.alarm.soundId).name} · <span data-live-volume>${state.volume}%</span></span>${resumeAudio(state)}<div class="showtime-rings"><h1 class="showtime-time">${display.time}</h1><span class="showtime-label">IT’S SHOWTIME</span><small>${escapeHtml(state.alarm.label)}</small>${daylightAdjustment(display)}</div><div class="button-stack">${primary("Start Act 1", "start-act")}<p class="screen-copy button-note">${state.alarm.riddle ? "One math question. One riddle. Then quiet." : "One math question. Then quiet."}</p>${textButton("Emergency · stop safely", "open-emergency")}</div></div></section>`;
  }

  function screen04(state) {
    const math = state.math;
    return `<section class="screen" data-screen-id="04">${status(state)}<div class="screen-body screen-body--center"><div class="screen-head full-width"><h1>${state.checkMode ? "Wake-up Check" : "Act 1 · Math"}</h1><span class="ringing-state"><i></i><span data-live-volume>${state.volume}%</span></span></div>${progress(1)}<button class="text-button emergency-link" type="button" data-action="open-emergency">Emergency</button><div class="math-equation${math.expression ? " math-equation--long" : ""}">${mathExpression(math)}</div><div class="math-input" aria-label="Current math answer">${math.input}</div><p class="math-hint">${state.checkMode ? "One gentle answer, then you’re done." : "Addition and subtraction only. The same question stays until it’s right."}</p>${keypad("", math.input)}</div></section>`;
  }

  function screen05(state) {
    const math = state.math;
    return `<section class="screen" data-screen-id="05">${status(state)}<div class="screen-body screen-body--center"><div class="screen-head full-width"><h1>Act 1 · Math</h1><span class="ringing-state"><i></i><span data-live-volume>${state.volume}%</span></span></div>${progress(1)}<button class="text-button emergency-link" type="button" data-action="open-emergency">Emergency</button><div class="math-equation${math.expression ? " math-equation--long" : ""}">${mathExpression(math)}</div><div class="math-input wrong-value">${math.lastWrong}</div><p class="math-hint math-hint--wrong">Not quite — take another look.</p><p class="screen-copy wrong-copy">${math.wrong >= 3 ? "A gentler take is ready." : "The alarm stays on and the question stays the same."}</p><div class="button-stack">${primary(math.wrong >= 3 ? "Make it gentler" : "Try again", math.wrong >= 3 ? "open-safety-math" : "retry-math")}${textButton("Emergency", "open-emergency")}</div></div></section>`;
  }

  function screen06(state) {
    const riddle = state.riddle || riddles[state.riddleIndex % riddles.length];
    return `<section class="screen" data-screen-id="06">${ambient("lilac")}${status(state)}<div class="screen-body"><div class="screen-head"><h1>Act 2 · Riddle</h1><span class="ringing-state ringing-state--lilac"><i></i><span data-live-volume>${state.volume}%</span></span></div>${progress(2)}<button class="text-button emergency-link" type="button" data-action="open-emergency">Emergency</button><span class="eyebrow finale-label">THE FINALE · ${riddle.id}</span><h2 class="riddle-question">${escapeHtml(riddle.question)}</h2><p class="screen-copy riddle-copy">A wrong answer brings in a different riddle.</p>${riddleOptions(riddle, "riddle-answer", null)}</div></section>`;
  }

  function screen20(state) {
    const riddle = state.riddle || riddles[state.riddleIndex % riddles.length];
    return `<section class="screen" data-screen-id="20">${status(state)}<div class="screen-body"><div class="screen-head"><h1>Act 2 · Riddle</h1><span class="ringing-state"><i></i><span data-live-volume>${state.volume}%</span></span></div>${progress(2)}${resumeAudio(state)}<span class="eyebrow finale-label">THE FINALE</span><h2 class="riddle-question riddle-question--wrong">${escapeHtml(riddle.question)}</h2>${wrongRiddleOption(riddle, state.lastRiddleWrong)}<div class="wrong-panel" role="status"><p class="math-hint math-hint--wrong">Not quite. The alarm stays on.</p><p class="screen-copy">Take your time to read this. ${state.riddleWrong >= 3 ? "Next, we’ll make it gentler." : "Continue when you’re ready for a different riddle."}</p></div><div class="button-stack">${primary(state.riddleWrong >= 3 ? "Continue with a gentler riddle" : "Continue to next riddle", "next-riddle")}${textButton("Emergency · stop safely", "open-emergency")}</div></div></section>`;
  }

  function screen21(state) {
    const from = state.safetyKind === "math" ? state.math.level : "Classic";
    const target = state.safetyTargetLevel || (from === "Diva" ? "Classic" : "Gentle");
    return `<section class="screen" data-screen-id="21">${ambient("lilac")}${status(state)}<div class="screen-body screen-body--center"><span class="eyebrow finale-label">A GENTLER TAKE</span><div class="gentle-mark gentle-mark--v2"></div><h1 class="screen-title safety-title">A little less effort.<br>The same clear start.</h1><p class="screen-copy">You still finish one correct answer.</p><div class="difficulty-shift"><span class="eyebrow shift-label">DIFFICULTY ADJUSTED</span><div><span>${from.toUpperCase()}</span><b>→</b><span>${target.toUpperCase()}</span></div><p class="screen-copy">Fresh question · same wake-up promise</p></div><div class="button-stack">${primary("Try the gentler question", "safety-continue")}${textButton("Emergency", "open-emergency")}</div></div></section>`;
  }

  function screen15(state) {
    const c=(zh,en)=>state.language==='en'?en:zh;
    return `<section class="screen screen--dark" data-screen-id="15">${ambient("gold")}${status(state,true)}<div class="screen-body screen-body--center emergency-body"><span class="eyebrow">${c('停止本次闹钟','STOP THIS ALARM')}</span><h1 class="detail-title">${c('需要安静，随时停止。','A safe exit, whenever you need it.')}</h1><p class="screen-copy">${c('确认后立即停止本次闹钟，并取消本次起床复查。','Confirm to stop this alarm immediately and cancel its Wake-up Check.')}</p><div class="v8-plan-card"><strong>${c('始终免费，使用次数不限','Always free, with unlimited use')}</strong><p>${c('无需答题、付费、看广告、输入文字或持续按住。','No answer, payment, advertisement, typing or sustained press is required.')}</p><small>${c('停止会记为主动退出，已答题进度不会被记成完成。','Stopping is recorded as an exit. It does not mark the challenge complete.')}</small></div>${primary(c('立即停止本次闹钟','Stop this alarm now'),'emergency-confirm-stop')}<div class="button-stack">${secondary(c('返回任务','Back to the challenge'),'cancel-emergency')}</div></div></section>`;
  }

  function screen07(state) {
    const result = state.lastResult;
    const summary = state.runSummary;
    const rehearsal = state.sessionKind === "test" || result?.kind === "test";
    return `<section class="screen" data-screen-id="07">${ambient("gold")}${status(state)}<div class="screen-body screen-body--center"><span class="eyebrow">${rehearsal ? "REHEARSAL COMPLETE" : "ALARM DISMISSED"}</span><div class="bravo-burst"><strong>Bravo!</strong></div><p class="screen-copy">${result ? `You finished ${result.mistakes ? `with ${result.mistakes} ${result.mistakes === 1 ? "retry" : "retries"}` : "in one clean take"}.` : "Your morning show is complete."}</p><div class="stats"><div class="stat"><strong>${result ? `${result.seconds}s` : "—"}</strong><small>Total time</small></div><div class="stat"><strong>${result ? (result.mistakes === 0 ? "Clean" : result.mistakes) : "—"}</strong><small>${result?.mistakes ? "Retries" : "First try"}</small></div><div class="stat"><strong>${rehearsal ? "Practice" : summary.streak || "—"}</strong><small>${rehearsal ? "No streak change" : "Day streak"}</small></div></div>${rehearsal ? '<div class="timeout-card"><span class="eyebrow">JUST A REHEARSAL</span><strong>Your real run stays as it was.</strong><small>No automatic Wake-up Check follows a test.</small></div>' : state.alarm.check ? `<div class="timeout-card"><span class="eyebrow">NEXT</span><strong>Wake-up Check in ${state.alarm.checkDelay || 5} minutes</strong><small>Preview it now or return home.</small></div>` : ""}<div class="button-stack">${primary("Take a bow", "take-bow")}${state.alarm.check ? secondary("Preview Wake-up Check", "preview-check") : ""}</div></div></section>`;
  }

  function screen22(state) {
    return `<section class="screen" data-screen-id="22">${ambient("gold")}${status(state)}<div class="screen-body screen-body--center"><span class="eyebrow">WAKE-UP CHECK</span><div class="wake-mark wake-mark--v2"><i class="spark"></i></div><h1 class="screen-title wake-title">Still on your feet?</h1><p class="screen-copy">One tap records your confirmation.</p><div class="timeout-card wake-timeout"><span class="eyebrow">IF YOU MISS THIS</span><strong>The alarm returns in <span id="wake-countdown">${state.wakeCheckSeconds}</span> seconds</strong><small>with one Gentle math question.</small></div><div class="button-stack">${primary("I’m up", "wake-confirm")}</div></div></section>`;
  }

  function screen23(state) {
    const display = alarmTime(state.alarm.time);
    return `<section class="screen" data-screen-id="23">${status(state)}<div class="screen-body screen-body--center"><div class="off-mark" aria-hidden="true"></div><div class="warning-strip"><i aria-hidden="true">!</i>Browser notifications are off</div><h1 class="screen-title permission-off-title">Let’s check<br>what is available.</h1><p class="screen-copy">${display.time} ${display.period} · ${escapeHtml(state.alarm.label)}</p><div class="timeout-card"><span class="eyebrow">BROWSER REMINDERS</span><strong>Notifications are optional. A browser alarm can only run while this page is available.</strong></div>${browserNotice()}<div class="button-stack">${primary("Review browser notifications", "review-access")}${secondary("Open diagnostics", "open-diagnostics")}${textButton("Back to my alarms", "go-home")}</div></div></section>`;
  }

  function screen24(state) {
    const display = alarmTime(state.alarm.time);
    return `<section class="screen screen--system" data-screen-id="24">${status(state)}<div class="screen-body screen-body--scroll concept-body">${detailHead("System entry concept", "go-home")}<div class="concept-label">DESIGN CONCEPT · NOT A SYSTEM ALERT</div><p class="detail-intro">An illustration of the handoff. Real iOS controls belong to AlarmKit and still need a native device build.</p><div class="system-time"><small>${new Intl.DateTimeFormat(window.DramaAlarmI18n?.getLocale?.()==="zh-CN"?"zh-CN":"en-US", { weekday: "long", month: "long", day: "numeric" }).format(state.now || new Date())}</small><strong>${display.time}</strong></div><div class="system-card"><div class="system-app"><i class="system-icon" aria-hidden="true"></i><div><small>DRAMA ALARM</small><strong>${escapeHtml(state.alarm.label)}</strong></div></div><p>System Stop and completing the in-app challenge are different outcomes.</p><div class="system-actions"><button type="button" data-action="ios-stop">Simulate system Stop</button><button type="button" data-action="ios-start">Open the challenge</button></div></div><p class="privacy-line">This screen does not register a native alarm or demonstrate lock-screen reliability.</p></div></section>`;
  }

  function screen14(state) {
    const alarm = state.defaults || state.alarm;
    const theme = themeInfo(state, state.themeId || "velvet");
    const row = (name, title, copy, action, value) => `<button class="settings-link" type="button" data-action="${action}">${settingIcon(name)}<span><strong>${title}</strong>${copy ? `<small>${copy}</small>` : ""}</span><b>${value || ""}${icon("chevron")}</b></button>`;
    return `<section class="screen" data-screen-id="14">${ambient("lilac")}${status(state)}<div class="screen-body screen-body--scroll settings-body">
      <div class="page-heading"><h1>Settings</h1><p>Make the morning yours.</p></div>
      <button class="theme-current-card" type="button" data-action="open-theme-studio"><span class="theme-mini-art">${themeArtwork(theme.id, true)}</span><span><small>YOUR MORNING MOOD</small><strong>${escapeHtml(theme.name)}</strong><em>Two official themes. Always free.</em></span>${icon("chevron")}</button>
      <div class="scope-notice"><strong>New alarm defaults</strong><p>These preferences apply to alarms you create next. To change an existing alarm, open it from Home.</p></div>
      <div class="settings-group"><span>NEW ALARM DEFAULTS</span><div class="settings-card settings-card--links">${row("math", "Math difficulty", "Gentle recommended for a first morning", "open-difficulty", alarm.difficulty)}${row("riddle", "Riddle finale", "One four-choice final act", "open-riddle-settings", alarm.riddle ? "On" : "Off")}${row("volume", "Application gain", "Device volume remains separate", "open-volume-settings", `${alarm.maxVolume || state.masterVolume}%`)}</div></div>
      <div class="settings-group"><span>WAKE-UP</span><div class="settings-card settings-card--links">${row("clock", "Wake-up Check", "A little nudge to stay up", "open-check-settings", alarm.check ? `${alarm.checkDelay || 5} min` : "Off")}${row("shield", "Emergency Stop", "A deliberate exit, always available", "open-emergency-rules", "")}${row("haptics", "Haptics", "Small cues you can feel", "open-haptic-settings", state.haptics ? "On" : "Off")}</div></div>
      <div class="settings-group"><span>SOUND & STYLE</span><div class="settings-card settings-card--links">${row("sound", "Sound Booth", "Four original sounds included", "open-sounds", soundById(alarm.soundId).name)}${row("palette", "Theme Studio", "Two official themes, always free", "open-theme-studio", theme.name)}${row("play", "Teaching rehearsal", "Listen, practise, and replay anytime", "start-tutorial", "")}</div></div>
      <div class="settings-group"><span>THIS BROWSER</span><div class="settings-card settings-card--links">${row("access", "Browser permissions", "Notifications are optional", "open-access-settings", state.permissionStatus === "granted" ? "Allowed" : "Review")}${row("shield", "Help & reliability", "Understand what this demo can do", "open-help", "")}${row("access", "Privacy & local data", "Storage, deletion, and feedback", "open-privacy", "")}${row("run", "Diagnostics", "Local events and capability checks", "open-diagnostics", "")}${row("reset", "Reset local demo", "Remove alarms and local results", "reset-demo", "")}</div></div>
      ${browserNotice()}<p class="settings-footnote">Drama Alarm · 7.2<br>Your alarms and results stay in this browser.</p></div>${bottomNav("settings")}</section>`;
  }

  function soundCard(preset, state) {
    const selected = state.soundId === preset.id;
    const playing = state.previewingSound === preset.id;
    return `<article class="sound-card sound-card--${preset.color}${selected ? " is-active" : ""}"><button class="sound-card__main" type="button" data-action="select-sound" data-sound="${preset.id}" aria-pressed="${selected}"><span class="sound-icon">${wave(playing)}</span><span><b>${preset.name}</b><small>${preset.mood}</small></span></button><button class="sound-action" type="button" data-action="${playing ? "stop-preview" : "preview-sound"}" data-sound="${preset.id}">${playing ? "Stop" : "Preview"}</button>${selected ? '<span class="selected-badge">SELECTED</span>' : ""}</article>`;
  }

  function premiumSoundCard(preset, state) {
    const playing = state.previewingSound === preset.id;
    return `<article class="premium-sound-card premium-sound-card--${preset.color}"><button class="premium-sound-card__preview" type="button" data-action="${playing ? "stop-preview" : "preview-premium-sound"}" data-sound="${preset.id}" aria-label="${playing ? "Stop" : "Preview"} ${preset.name}"><span class="premium-sound-card__disc">${wave(playing)}</span><span><small>${preset.detail}</small><b>${preset.name}</b><em>${preset.mood}</em></span></button><button class="premium-sound-card__unlock" type="button" data-action="open-pass">SOON</button></article>`;
  }

  function screen10(state) {
    const selected = soundById(state.soundId);
    const includedSounds = soundPresets.filter((preset) => !preset.premium);
    const premiumSounds = soundPresets.filter((preset) => preset.premium);
    return `<section class="screen" data-screen-id="10">${ambient("lilac")}${status(state)}<div class="screen-body screen-body--scroll sound-booth">${detailHead("Sound Booth", "confirm-sound")}<h1 class="screen-title">The room’s<br>first note.</h1><p class="screen-copy">Four original, voice-free sounds. Hear a little of each and find your first cue.</p><button class="sound-library-teaser" type="button" data-action="open-pass"><span><small>BEHIND THE CURTAIN</small><b>A preview of the next sound collections</b></span><strong>${icon("chevron")}</strong></button><div class="sound-section-head"><span>INCLUDED</span><small>Always free</small></div><div class="sound-list">${includedSounds.map((preset) => soundCard(preset, state)).join("")}</div><div class="backstage-library"><div class="sound-section-head"><span>NEXT SEASON</span><small>Playable previews</small></div><p>Two new sound directions to try. Alarm selection and pricing will arrive with their release.</p><div class="premium-sound-list">${premiumSounds.map((preset) => premiumSoundCard(preset, state)).join("")}</div>${secondary("Explore Backstage", "open-pass")}</div><div class="selected-sound-bar"><div><span>Selected</span><strong>${selected.name}</strong></div>${primary(`Use ${selected.name}`, "confirm-sound")}</div></div></section>`;
  }

  function screen11(state) {
    return `<section class="screen" data-screen-id="11">${ambient("gold")}${status(state)}<div class="screen-body screen-body--scroll pass-body">${detailHead("Backstage", "close-pass")}<i class="spark spark--large pass-spark"></i><span class="eyebrow">FUTURE COLLECTIONS</span><h1 class="screen-title">The next season.</h1><p class="screen-copy">Two sound directions to explore. Your core alarm, safety features, and two official themes stay free.</p><div class="pass-collections"><p><span>01</span><b>Cinematic Mornings</b><small>Studio Sunrise · playable sound preview</small></p><p><span>02</span><b>Quiet Nature</b><small>Garden After Rain · playable sound preview</small></p></div><div class="info-card">${settingIcon("shield")}<span><strong>Nothing is for sale here</strong><small>No subscription, checkout, or payment is started. Availability and prices will appear when a real collection is ready.</small></span></div><div class="button-stack pass-actions">${primary("Back to where I was", "close-pass")}${secondary("Hear sound previews", "open-sounds")}${textButton("See future themes", "open-future-themes")}</div></div></section>`;
  }

  function screen12(state) {
    const summary = state.runSummary || {};
    const today = state.todaySummary || {};
    const count = value => Number.isFinite(value) ? value : "—";
    const history = state.history || [];
    return `<section class="screen" data-screen-id="12">${ambient("gold")}${status(state)}<div class="screen-body screen-body--scroll run-body"><div class="page-heading"><h1>Your Run</h1><p>The real story of each morning.</p></div><div class="today-status-card"><span class="eyebrow">TODAY · LOCAL EVENTS</span><h2>Every step has a result.</h2><div class="event-grid"><div><strong>${count(today.triggered)}</strong><span>Triggered</span></div><div><strong>${count(today.completed)}</strong><span>Challenges completed</span></div><div><strong>${count(today.confirmed)}</strong><span>Wake-up Checks confirmed</span></div><div><strong>${count(today.missed)}</strong><span>Marked missed</span></div></div>${primary("See today’s results", "open-results")}</div><p class="inline-help">Completing a challenge does not prove you got out of bed. A Wake-up Check records your own confirmation.</p>${history.length ? `<div class="section-heading"><h2>Completed challenges</h2><span>On this browser</span></div><div class="stats run-stats"><div class="stat"><strong>${summary.total || 0}</strong><small>Completed</small></div><div class="stat"><strong>${summary.firstTryRate || 0}%</strong><small>No wrong answers</small></div><div class="stat"><strong>${summary.averageSeconds || 0}s</strong><small>Average challenge</small></div></div><div class="run-history-card">${history.slice(-5).reverse().map(item=>`<div class="run-history-row"><span class="history-dot">${icon("check")}</span><span><strong>${new Intl.DateTimeFormat(window.DramaAlarmI18n?.getLocale?.()==="zh-CN"?"zh-CN":"en-US",{month:"short",day:"numeric"}).format(new Date(item.at))}</strong><small>${escapeHtml(item.difficulty || "Gentle")} · ${item.mistakes ? `${item.mistakes} retries` : "No wrong answers"}</small></span><b>${item.seconds}s</b></div>`).join("")}</div><p class="inline-help">Calendar-day challenge streak: ${summary.streak || 0}. Rest days are not counted as completed challenges.</p>` : `<div class="run-empty-card">${morningArt()}<h2>Your first curtain call is waiting.</h2><p>Scheduled alarms create real local results. Teaching and test rehearsals stay separate.</p>${secondary("Set my next alarm", "new-alarm")}</div>`}<button class="rehearsal-card" type="button" data-action="open-diagnostics"><span class="rehearsal-card__icon">${icon("run")}</span><span><strong>Understand an interrupted morning</strong><small>Review local events and browser capabilities.</small></span>${icon("chevron")}</button><p class="privacy-line run-local-note">No sleep tracking or health conclusions.</p></div>${bottomNav("run")}</section>`;
  }

  function screen13(state) {
    return `<section class="screen screen--dark rare-screen" data-screen-id="13">${ambient("gold")}${status(state, true)}<div class="screen-body screen-body--center"><span class="eyebrow">A RARE ONE</span><div class="rare-star"><i class="spark spark--large"></i></div><h1 class="screen-title rare-title">Standing Ovation</h1><p class="rare-copy">“The answers are on me today.<br>Just rise and take your bow.”</p><div class="rise-arrow">↑</div><div class="button-stack"><button class="hold-ring stand-hold" id="stand-hold" type="button" data-hold="stand" data-duration="5000"><span>Hold to confirm you’re standing</span></button><p class="emergency-rule">Browser fallback · no motion data is stored</p></div></div></section>`;
  }

  function screen25(state) {
    const level = state.alarm.difficulty;
    return `<section class="screen" data-screen-id="25">${ambient("rose")}${status(state)}<div class="screen-body detail-body">${detailHead("Difficulty")}<p class="detail-intro">Start with Gentle for a first morning. Bigger numbers add effort; they do not measure how awake you are.</p><div class="option-list" role="group" aria-label="Math difficulty">${optionCard("Gentle", "Recommended · two-number addition or subtraction", level === "Gentle", "select-difficulty-detail", "Gentle")}${optionCard("Classic", "Larger numbers, including three digits", level === "Classic", "select-difficulty-detail", "Classic")}${optionCard("Diva", "Three terms and two steps · addition and subtraction", level === "Diva", "select-difficulty-detail", "Diva")}</div><div class="info-card">${settingIcon("shield")}<span><strong>Safety Valve</strong><small>Three misses lower difficulty one step. A correct answer is still required.</small></span><b>On</b></div><div class="button-stack detail-actions">${primary(`Use ${level}`, "settings-back")}</div></div></section>`;
  }

  function screen26(state) {
    const enabled = state.alarm.riddle;
    return `<section class="screen" data-screen-id="26">${ambient("lilac")}${status(state)}<div class="screen-body detail-body">${detailHead("Riddle Finale")}<span class="eyebrow detail-eyebrow">ACT 2</span><h2 class="detail-title">A lighter final check</h2><p class="detail-intro">One four-choice riddle after Math. Correct answers finish the act.</p><div class="settings-card setting-detail-card"><div class="settings-row"><span><strong>Riddle finale</strong><small>${state.settingScope === "defaults" ? "For new alarms only" : "For this alarm"}</small></span>${toggle("toggle-riddle", enabled, "Riddle finale")}</div><div class="settings-row"><span><strong>After a wrong answer</strong><small>Read the feedback, then continue to a different riddle when ready.</small></span><b>Manual</b></div></div><div class="info-card info-card--lilac">${settingIcon("riddle")}<span><strong>Fair by design</strong><small>Wrong answers never unlock. Three misses offer a gentler question. Riddles stay free.</small></span></div><div class="button-stack detail-actions">${primary("Done", "settings-back")}</div></div></section>`;
  }

  function screen27(state) {
    const alarm = state.alarm;
    return `<section class="screen" data-screen-id="27">${ambient("gold")}${status(state)}<div class="screen-body detail-body">${detailHead("Sound gain")}<span class="eyebrow detail-eyebrow">APPLICATION GAIN LIMIT</span><output class="volume-display" data-volume-output="strategy-volume">${state.masterVolume}%</output><input class="detail-range" id="strategy-volume" type="range" min="25" max="100" step="1" value="${state.masterVolume}" aria-label="Application gain limit"><p class="detail-intro">This is the demo’s gain, not your device volume or a measured loudness. Listen on your current speaker or headphones.</p><div class="settings-card setting-detail-card"><div class="settings-row"><span><strong>Rising volume</strong><small>Starts gently, then rises to your limit over 30 seconds.</small></span>${toggle("toggle-rising", alarm.rising, "Rising volume")}</div><div class="settings-row"><span><strong>Quieter after each act</strong><small>55% after Math · at most 70% after a miss</small></span>${toggle("toggle-quieter", alarm.quieter, "Quieter after each act")}</div><button class="settings-row settings-row--action" type="button" data-action="preview-strategy-volume" data-sound="${alarm.soundId}"><span><strong>Preview at this level</strong><small>${soundById(alarm.soundId).name}</small></span><b>${state.previewingSound ? "Stop" : "Play"}</b></button></div><div class="button-stack detail-actions">${primary("Done", "settings-back")}</div></div></section>`;
  }

  function screen28(state) {
    const delay = state.alarm.checkDelay || 5;
    return `<section class="screen" data-screen-id="28">${ambient("lilac")}${status(state)}<div class="screen-body detail-body">${detailHead("Wake-up Check")}<span class="eyebrow detail-eyebrow">YOUR OWN CONFIRMATION</span><h2 class="detail-title">If ignored for 60 seconds, the alarm returns.</h2><div class="check-delay-mark"><i></i><strong>${delay}</strong><span>MINUTES</span></div><span class="eyebrow section-label">CHECK AFTER</span><div class="option-list option-list--compact">${[3,5,10].map((minutes) => optionCard(`${minutes} minutes`, minutes === 3 ? "Quick confirmation" : minutes === 5 ? "Balanced default" : "More time to get moving", delay === minutes, "select-check-delay", minutes)).join("")}</div><div class="settings-card setting-detail-card"><div class="settings-row"><span><strong>Wake-up Check</strong><small>Return once if you miss confirmation</small></span>${toggle("toggle-check", state.alarm.check, "Wake-up Check")}</div></div><div class="button-stack detail-actions">${primary(`Use ${delay} minutes`, "settings-back")}</div></div></section>`;
  }

  function screen29(state) {
    const c=(zh,en)=>state.language==='en'?en:zh;
    return v10Page('29',state,c('停止闹钟','Stop an alarm'),`<div class="v9-inline-intro"><div><span class="eyebrow">${c('始终可用','ALWAYS AVAILABLE')}</span><h2>${c('由自己决定何时停止。','You decide when to stop.')}</h2></div>${crew(state,'calm',96,'stop-rules')}</div><div class="rule-list"><p><b>1</b><span><strong>${c('任务页点按 Emergency','Choose Emergency during a challenge')}</strong><small>${c('所有响铃任务与起床复查都可进入。','Available throughout ringing challenges and Wake-up Checks.')}</small></span></p><p><b>2</b><span><strong>${c('确认后立即停铃','Confirm to stop immediately')}</strong><small>${c('免费、次数不限，无长按、输入或等待。','Free, unlimited, without holding, typing or waiting.')}</small></span></p><p><b>3</b><span><strong>${c('取消本次复查','Cancel this session’s follow-up')}</strong><small>${c('记录主动停止，不算完成任务。','Record an exit rather than a completed challenge.')}</small></span></p></div><p class="v9-lead">${c('停止和完成是两种记录。系统按键和系统闹钟控制也可能停止声音。','Stopping and completing are separate results. Device buttons and system alarm controls may also stop the sound.')}</p>`,primary(c('返回','Back'),'settings-back'));
  }

  function screen30(state) {
    const cues = state.hapticCues;
    const cueRow = (key, title, copy) => `<div class="settings-row"><span><strong>${title}</strong><small>${copy}</small></span>${toggle("toggle-haptic-cue", cues[key], title, ` data-value="${key}"`)}</div>`;
    return `<section class="screen" data-screen-id="30">${ambient("lilac")}${status(state)}<div class="screen-body detail-body">${detailHead("Haptics")}<span class="eyebrow detail-eyebrow">TACTILE CUES</span><div class="haptic-hero"><i></i><i></i><i></i><i></i><i></i></div><h2 class="detail-title">Feel the cue, not a jolt</h2><p class="detail-intro">Short patterns reinforce sound and success.</p><div class="settings-card setting-detail-card">${cueRow("ring", "Ringing rhythm", "Repeating alarm pattern")}${cueRow("answer", "Answer feedback", "Short correct and incorrect cues")}${cueRow("bravo", "Bravo cue", "A final completion pattern")}</div><div class="button-stack detail-actions">${secondary("Test haptic cue", "test-haptics")}${primary("Done", "settings-back")}</div></div></section>`;
  }

  function screen31(state) {
    const detail = state.selectedAchievement || { name: "Morning Debut", copy: "Complete your first scheduled wake-up show", count: "01", earned: false };
    return `<section class="screen" data-screen-id="31">${ambient("gold")}${status(state)}<div class="screen-body screen-body--center detail-body">${detailHead("Curtain Call", "open-run")}<span class="eyebrow detail-eyebrow">${detail.earned ? "EARNED" : "NEXT CURTAIN CALL"}</span><div class="achievement-hero"><i class="spark spark--large"></i><strong>${escapeHtml(detail.count || "01")}</strong></div><h2 class="detail-title">${escapeHtml(detail.name)}</h2><p class="detail-intro">${escapeHtml(detail.copy)}</p><div class="info-card"><i class="setting-icon setting-icon--pass"></i><span><strong>${escapeHtml(detail.count || "01")} curtain call</strong><small>${detail.earned ? "Your morning performance is recorded locally." : "Keep showing up to earn this curtain call."}</small></span></div><div class="button-stack detail-actions">${primary("Done", "open-run")}</div></div></section>`;
  }

  function screen32(state) {
    const display = alarmTime(state.alarm.time);
    return `<section class="screen" data-screen-id="32">${ambient("rose")}${status(state)}<div class="screen-body screen-body--center detail-body">${detailHead("Delete Alarm", "cancel-delete")}<span class="eyebrow detail-eyebrow">CONFIRM REMOVAL</span><div class="delete-hero"><i class="setting-icon setting-icon--reset"></i></div><h2 class="detail-title">Delete ${escapeHtml(state.alarm.label)}?</h2><p class="detail-intro">This removes the future schedule from this device.</p><div class="delete-summary"><strong>${display.time} ${display.period}</strong><span>${dayLabel(state.alarm.days)} · ${soundById(state.alarm.soundId).name}</span></div><div class="button-stack detail-actions"><button class="primary primary--danger" type="button" data-action="confirm-delete-alarm">Delete alarm</button>${secondary("Keep alarm", "cancel-delete")}</div></div></section>`;
  }

  function screen33(state) {
    const selected = soundById(state.alarm.soundId);
    const seconds = String(Math.max(0, Number(state.testCountdown)||0)).padStart(2, "0");
    return `<section class="screen" data-screen-id="33">${ambient("gold")}${status(state)}<div class="screen-body screen-body--center detail-body">${detailHead("Test Alarm", "cancel-test")}<span class="eyebrow detail-eyebrow">YOUR TEST STARTS IN</span><div class="test-countdown"><i></i><strong>00:${seconds}</strong></div><span class="eyebrow test-sound">${selected.name.toUpperCase()} · ${state.masterVolume}% MAX</span><p class="detail-intro">Stay here while your practice begins.</p><div class="button-stack detail-actions">${secondary("Cancel test", "cancel-test")}<p class="privacy-line">This test does not count toward your streak.</p></div></div></section>`;
  }

  function screen34(state) {
    return `<section class="screen" data-screen-id="34">${ambient("gold")}${status(state)}<div class="screen-body detail-body">${detailHead("Backstage Preview", "open-pass")}<span class="eyebrow detail-eyebrow">${state.plan.toUpperCase()} MEMBERSHIP CONCEPT</span><div class="purchase-mark">${settingIcon("pass")}</div><h2 class="detail-title">A future season.<br>No ticket needed yet.</h2><p class="detail-intro">Membership details and individual theme pricing will appear when these collections are available.</p><div class="benefit-list"><p><span>Original sound collections</span><strong>Planned</strong></p><p><span>Extra theme packs</span><strong>Planned</strong></p><p><span>Two official themes</span><strong>Always free</strong></p></div><div class="info-card">${settingIcon("shield")}<span><strong>Your alarm stays yours</strong><small>No charges, trial or purchase is started here.</small></span></div><div class="button-stack detail-actions">${primary("Back to the preview", "purchase-preview-done")}${textButton("Restore purchase information", "restore-purchase")}</div></div></section>`;
  }

  function screen35(state) {
    return `<section class="screen" data-screen-id="35">${ambient("lilac")}${status(state)}<div class="screen-body screen-body--center detail-body">${detailHead("Restore Purchase", "open-pass")}<span class="eyebrow detail-eyebrow">COMING WITH THE STORE RELEASE</span><div class="restore-mark">${icon("pass")}</div><h2 class="detail-title">Your future purchases,<br>ready to return.</h2><p class="detail-intro">Restore will reconnect purchases to the store account that bought them. This preview is not connected to a store.</p><div class="info-card info-card--lilac">${settingIcon("access")}<span><strong>No account was checked</strong><small>Your two official themes and core alarm features remain available.</small></span></div><div class="button-stack detail-actions">${secondary("View restore information", "restore-retry")}${primary("Back to Backstage", "open-pass")}</div></div></section>`;
  }

  function screen36(state) {
    const allowed = state.permissionStatus === "granted";
    return `<section class="screen" data-screen-id="36">${ambient("gold")}${status(state)}<div class="screen-body detail-body">${detailHead("Browser permissions")}<span class="eyebrow detail-eyebrow">THIS BROWSER</span><div class="access-hero${allowed ? " is-ready" : ""}" aria-hidden="true"><i></i></div><h2 class="detail-title">${allowed ? "Notifications allowed." : "Your browser, your choice."}</h2><p class="detail-intro">The interactive alarm runs in this open tab. Notification permission is separate and does not register an iOS or Android system alarm.</p><div class="access-list"><p><span>Browser notifications</span><strong>${allowed ? "Allowed" : escapeHtml(state.permissionStatus || "Not requested")}</strong></p><p><span>Sound check</span><strong>${state.soundCheckConfirmed ? "Heard by you" : "Not confirmed"}</strong></p><p><span>Haptic preference</span><strong>${state.haptics ? "On, if supported" : "Off"}</strong></p><p><span>Native system alarm</span><strong>Not available</strong></p></div>${browserNotice()}<div class="button-stack detail-actions">${primary(allowed ? "Recheck permissions" : "Review browser notifications", "refresh-access")}${secondary("Open diagnostics", "open-diagnostics")}${textButton("Back", "settings-back")}</div></div></section>`;
  }

  function themeChoice(state, id) {
    const theme = themeInfo(state, id);
    const selected = (state.pendingThemeId || state.themeId || "velvet") === id;
    const applied = (state.themeId || "velvet") === id;
    return `<article class="theme-choice-card${selected ? " is-selected" : ""}" data-theme-card="${id}">
      <button class="theme-choice-select" type="button" data-action="select-theme" data-theme="${id}" aria-pressed="${selected}" aria-label="Try ${escapeHtml(theme.name)} theme">${themeArtwork(id)}<span class="theme-choice-meta"><span><strong>${escapeHtml(theme.name)}</strong><small>${escapeHtml(theme.subtitle || theme.description)}</small></span><i class="theme-choice-selector">${selected ? icon("check") : ""}</i></span></button>
      <div class="theme-choice-footer"><span class="theme-free-label">${icon("check")} Official · free${applied ? " · current" : ""}</span><button class="text-button" type="button" data-action="preview-theme" data-theme="${id}">Preview ${icon("chevron")}</button></div>
    </article>`;
  }

  function screen37(state) {
    const selected = themeInfo(state, state.pendingThemeId || state.themeId || "velvet");
    return `<section class="screen" data-screen-id="37">${ambient("lilac")}${status(state)}<div class="screen-body screen-body--scroll theme-body theme-onboarding">
      ${detailHead("Set the scene", "theme-back")}<div class="theme-intro"><span class="eyebrow">A LITTLE MORNING MAGIC</span><h1>What’s your<br>morning mood?</h1><p>Same little acts. Two different stages.<br>Tap one and feel the change.</p></div>
      <div class="theme-gallery">${themeChoice(state, "velvet")}${themeChoice(state, "daybreak")}</div>
      <p class="theme-feedback" aria-live="polite">${icon("star")} ${escapeHtml(selected.name)} is on stage.</p>
      <div class="button-stack theme-onboarding-actions">${primary("Keep this mood · set my time", "confirm-theme")}<p class="privacy-line">Both themes are free. More scenes will arrive in Theme Studio. Change yours anytime in Settings.</p></div>
    </div></section>`;
  }

  function screen38(state) {
    const applied = themeInfo(state, state.themeId || "velvet");
    const selected = themeInfo(state, state.pendingThemeId || state.themeId || "velvet");
    const changed = selected.id !== applied.id;
    return `<section class="screen" data-screen-id="38">${ambient("rose")}${status(state)}<div class="screen-body screen-body--scroll theme-body">
      ${detailHead("Theme Studio", "theme-back")}<div class="theme-intro"><span class="eyebrow">TWO OFFICIAL THEMES · ALWAYS FREE</span><h1>A fresh scene<br>for your mornings.</h1><p>Choose a mood. Your alarms and little acts stay with you.</p></div>
      <div class="theme-gallery">${themeChoice(state, "velvet")}${themeChoice(state, "daybreak")}</div>
      <button class="theme-future-card" type="button" data-action="open-future-themes"><span class="theme-future-icon">${icon("palette")}</span><span><strong>More scenes, coming soon</strong><small>Future optional collections. Preview the ideas.</small></span>${icon("chevron")}</button>
      <div class="button-stack theme-studio-actions">${primary(changed ? `Use ${escapeHtml(selected.name)}` : `Keep ${escapeHtml(applied.name)}`, "apply-theme")}${textButton("Back to Settings", "theme-back")}<p class="privacy-line">New collections may be paid. These two stay free.</p></div>
    </div></section>`;
  }

  function screen39(state) {
    const selected = themeInfo(state, state.pendingThemeId || state.themePreviewId || state.previewThemeId || state.themeId || "velvet");
    const next = state.nextAlarm;
    return `<section class="screen" data-screen-id="39">${ambient("gold")}${status(state)}<div class="screen-body screen-body--scroll theme-body theme-preview-body">
      ${detailHead("Theme Preview", "cancel-theme-preview")}<div class="theme-preview-heading"><span class="eyebrow">OFFICIAL · FREE</span><h1>${escapeHtml(selected.name)}</h1><p>${escapeHtml(selected.description || selected.subtitle)}</p></div>
      <div class="theme-preview-phone" data-preview-theme="${selected.id}"><div class="theme-preview-demo"><div class="preview-demo-top"><span>DRAMA ALARM</span>${icon("sun")}</div><h2>A good day<br>starts here.</h2><div class="preview-demo-orbit"><span>YOUR NEXT ENTRANCE</span><strong>${next ? next.countdown : "6:30"}</strong><small>${next ? "Curtain up soon" : "AM · Morning Show"}</small></div><div class="preview-demo-card">${icon("bell")}<span><strong>Your morning show</strong><small>Two little acts. One clear start.</small></span><i></i></div><div class="preview-demo-nav">${icon("home")}${icon("run")}${icon("settings")}</div></div></div>
      <p class="theme-note">A preview of your stage.<br>Alarm settings and results stay as they are.</p><div class="button-stack theme-preview-actions">${primary(`Use ${escapeHtml(selected.name)}`, "apply-theme")}${secondary("Back to themes", "cancel-theme-preview")}</div>
    </div></section>`;
  }

  function screen40(state) {
    return `<section class="screen" data-screen-id="40">${ambient("lilac")}${status(state)}<div class="screen-body screen-body--scroll theme-body future-body">
      ${detailHead("Coming Soon", "future-theme-back")}<div class="theme-intro"><span class="eyebrow">THE NEXT SEASON</span><h1>There’s more<br>behind the curtain.</h1><p>Fresh colours. A different atmosphere.<br>New ways to make an entrance.</p></div>
      <div class="future-grid"><article class="future-theme-card"><div class="future-theme-art future-theme-art--midnight">${morningArt()}${icon("moon")}</div><span class="theme-free-label">CONCEPT · COMING SOON</span><h2>Midnight Matinée</h2><p>Inky blues and a pool of moonlight.</p><button class="secondary" type="button" data-action="preview-future-theme" data-theme="midnight">About this concept</button></article><article class="future-theme-card"><div class="future-theme-art future-theme-art--sunrise">${morningArt()}</div><span class="theme-free-label">CONCEPT · COMING SOON</span><h2>Golden Encore</h2><p>A warm horizon. A bright beginning.</p><button class="secondary" type="button" data-action="preview-future-theme" data-theme="sunrise">About this concept</button></article></div>
      <div class="info-card">${settingIcon("palette")}<span><strong>Your two official themes stay free</strong><small>Future collections may be sold separately. Availability and pricing will appear here when ready.</small></span></div>
      <div class="button-stack">${primary("Back to my themes", "future-theme-back")}<p class="privacy-line">Concept previews only. Nothing is for sale yet.</p></div>
    </div></section>`;
  }

  function screen41(state) {
    return `<section class="screen" data-screen-id="41">${ambient("gold")}${status(state)}<div class="screen-body screen-body--scroll detail-body help-body">${detailHead("Help & reliability", "detail-back")}<h2 class="detail-title">Know your stage.</h2><p class="detail-intro">This browser demo lets you set alarms, hear sounds, and practise the complete challenge.</p>${browserNotice()}<div class="help-section"><h2>Before you rely on an alarm</h2><p>Keep this page open and your device awake. A browser can suspend or close this tab. This demo cannot promise lock-screen or background delivery.</p><p>For important mornings, set a backup in your device’s system Clock app.</p></div><div class="help-section"><h2>How the two acts work</h2><p>Answer one addition or subtraction question, then one optional four-choice riddle. A wrong answer keeps the alarm on. Three misses offer a gentler question.</p><p>After a wrong riddle, read the feedback and choose Continue. Teaching and tests do not add to your formal results.</p></div><div class="help-section"><h2>Sound is quiet or missing?</h2><p>Check device volume and your connected speaker or headphones. Reopen the sound check and confirm only after you hear it. If a reopened challenge needs a tap, use Resume alarm sound.</p></div><div class="help-section"><h2>Need to stop safely?</h2><p>Emergency is available throughout the challenge. You can use the touch hold or the keyboard and accessible confirmation. Emergency does not create a Wake-up Check.</p></div><div class="button-stack">${primary("Try the teaching rehearsal", "start-tutorial")}${secondary("Open diagnostics", "open-diagnostics")}<a class="secondary external-link" href="https://github.com/dodgey512-Blake/drama-alarm-mvp-pages/issues/new" target="_blank" rel="noopener noreferrer">Report a problem on GitHub ${icon("arrow")}</a><p class="privacy-line">GitHub may ask you to sign in. Nothing from your alarms or results is sent automatically.</p></div></div></section>`;
  }

  function screen42(state) {
    return `<section class="screen" data-screen-id="42">${ambient("lilac")}${status(state)}<div class="screen-body screen-body--scroll detail-body help-body">${detailHead("Privacy & local data", "detail-back")}<span class="eyebrow detail-eyebrow">BROWSER DEMO · 7.2</span><h2 class="detail-title">Your mornings stay local.</h2><div class="help-section"><h2>What is stored</h2><p>Alarm times, labels and repeat rules; selected sounds and themes; preferences; challenge progress; Wake-up Checks; and local result and diagnostic events are saved in this browser’s local storage.</p><p>There is no Drama Alarm account, cloud sync, advertising tracker, or payment checkout in this demo. It does not request health data.</p></div><div class="help-section"><h2>What leaves your device</h2><p>GitHub Pages serves the website and may process normal website request information under GitHub’s privacy policy. The demo does not automatically upload your alarm labels, answers, or local events.</p><p>Opening the GitHub feedback link is your choice. Review anything you type or attach there; do not include private information.</p></div><div class="help-section"><h2>Delete, move, or change browsers</h2><p>Reset local demo in Settings clears the demo’s local alarms, progress, preferences and results. Clearing browser storage can also remove them. There is no account backup or cross-device transfer.</p><p>Earlier version storage may be read for migration. After confirmation, Reset clears this app’s v2–v7 records and local Emergency counters, then leaves an empty v7 storage marker. Unrelated browser storage is kept.</p></div><div class="help-section"><h2>Permissions</h2><p>Browser notifications are optional and can be changed in browser settings. A notification permission does not register a native system alarm. Sound playback may need a user tap; haptics work only where supported.</p></div><div class="button-stack">${secondary("View local diagnostics", "open-diagnostics")}<a class="secondary external-link" href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub privacy statement ${icon("arrow")}</a>${primary("Back", "detail-back")}</div></div></section>`;
  }

  function screen43(state) {
    const audio = state.audioStatus || {};
    const audioState = typeof audio === "string" ? audio : audio.contextState || audio.state || (audio.engineReady ? "Ready to start" : "Not started");
    const events = state.eventLog ? state.eventLog.slice(-12).reverse() : (state.recentEvents || state.events || []).slice(0, 12);
    return `<section class="screen" data-screen-id="43">${ambient("lilac")}${status(state)}<div class="screen-body screen-body--scroll detail-body help-body">${detailHead("Diagnostics", "detail-back")}<span class="eyebrow detail-eyebrow">LOCAL ONLY</span><h2 class="detail-title">A clearer picture.</h2><p class="detail-intro">These checks describe this browser, not native alarm reliability or audible loudness.</p><div class="access-list"><p><span>Version</span><strong>7.2</strong></p><p><span>Local storage</span><strong>${state.persistenceError ? "Needs attention" : "Available"}</strong></p><p><span>Browser notifications</span><strong>${escapeHtml(state.permissionStatus || "Not requested")}</strong></p><p><span>Audio context</span><strong>${escapeHtml(audioState)}</strong></p><p><span>Sound heard by you</span><strong>${state.soundCheckConfirmed ? "Confirmed" : "Not confirmed"}</strong></p><p><span>Active challenge</span><strong>${state.activeSession ? "In progress" : "None"}</strong></p><p><span>Queued alarms</span><strong>${(state.pendingQueue || []).length}</strong></p><p><span>Pending Wake-up Checks</span><strong>${(state.wakeChecks || []).filter(check=>!check.status || check.status === "pending").length}</strong></p></div>${state.persistenceError ? `<p class="field-error" role="alert">${escapeHtml(state.persistenceError)}</p>` : ""}<div class="section-heading"><h2>Recent local events</h2></div>${events.length ? `<ol class="event-list">${events.map(event=>`<li><strong>${escapeHtml(String(event.type || event.event || "Event").replaceAll("_", " "))}</strong><span>${event.at && !Number.isNaN(new Date(event.at).getTime()) ? new Intl.DateTimeFormat(window.DramaAlarmI18n?.getLocale?.()==="zh-CN"?"zh-CN":"en-US", {hour:"numeric", minute:"2-digit", second:"2-digit"}).format(new Date(event.at)) : "Recorded locally"}</span></li>`).join("")}</ol>` : '<div class="empty-message">No diagnostic events yet. Scheduled alarms and test actions will explain their outcomes here.</div>'}<p class="privacy-line">Nothing in this list is uploaded automatically. A completed challenge is not proof of waking up.</p><div class="button-stack">${primary("Download local diagnostics", "download-diagnostics")}${secondary("Open sound check", "start-tutorial")}${textButton("Help & reliability", "open-help")}<p class="privacy-line">The downloaded JSON contains version, browser capability states, and event types and times. Alarm names and answers are excluded. Review it before sharing.</p></div></div></section>`;
  }

  function screen44(state) {
    const today = state.todaySummary || {};
    const count = value => Number.isFinite(value) ? value : "—";
    return `<section class="screen" data-screen-id="44">${ambient("gold")}${status(state)}<div class="screen-body screen-body--scroll detail-body help-body">${detailHead("Today’s results", "detail-back")}<span class="eyebrow detail-eyebrow">THIS BROWSER · LOCAL DATE</span><h2 class="detail-title">Each step, honestly recorded.</h2><div class="event-grid results-grid">${[["scheduled","Scheduled today"],["triggered","Triggered"],["completed","Challenges completed"],["confirmed","Wake-up Checks confirmed"],["missed","Marked missed"],["emergency","Emergency exits"],["interrupted","Interrupted"]].map(([key,label])=>`<div><strong>${count(today[key])}</strong><span>${label}</span></div>`).join("")}</div><div class="help-section"><h2>What these results mean</h2><p>A triggered event means the open browser started a scheduled session. Completed means the challenge was answered. Confirmed means you activated the Wake-up Check.</p><p>None of these measures proves you physically got out of bed. Teaching and rehearsals are excluded from formal results.</p><p>Missed and interrupted outcomes explain known local events. They cannot detect every alarm a suspended browser failed to run.</p></div><div class="button-stack">${primary("Review local event details", "open-diagnostics")}${secondary("Back", "detail-back")}</div></div></section>`;
  }

  // Version 8 changes task content, not the stable 7.2 page shell or glass dock.
  const v8Catalog = { group:"Your morning crew · 8.0", items:[["45","First wake-up intensity"],["46","Question Library"],["47","Question Pack"],["48","Sample Question"],["49","Offline Questions"],["50","Your Morning Crew"]] };
  const knownScreenIds=new Set(screenCatalog.flatMap(group=>group.items.map(([id])=>id)));
  const additionalV8Items=v8Catalog.items.filter(([id])=>!knownScreenIds.has(id));
  const uiCatalog=additionalV8Items.length?[...screenCatalog,{...v8Catalog,items:additionalV8Items}]:screenCatalog;

  function crew(state, pose="idle", size=112, key=pose) {
    const art=window.DramaAlarmMascot?.render(pose,{theme:state.themeId||"daybreak",size,key,motion:!(state.reduceMotion||state.reducedMotion)}) || "";
    const context=key.startsWith("home-")?"home":key.startsWith("run-")?"run":null;
    return context?`<button class="v10-mascot-button v10-mascot-button--${context}" type="button" data-action="mascot-tap" data-context="${context}" aria-label="${context==="home"?"Say hello to your morning crew":"Take a bow with your morning crew"}">${art}<span class="v10-mascot-spark" aria-hidden="true">${icon("star")}</span></button>`:art;
  }
  function taskSummary(alarm) {
    if(window.DramaAlarmChallenges?.describe) return window.DramaAlarmChallenges.describe(alarm || {});
    const difficulty=alarm?.difficulty||"Gentle",topic=alarm?.questionTopic||"everyday",legacy=Number(alarm?.taskPlanVersion)!==8;
    const total=legacy?(alarm?.riddle?2:1):({Gentle:1,Classic:2,Diva:3}[difficulty]||1);
    const choices=topic!=="everyday"||(!legacy&&difficulty==="Diva")||legacy&&alarm?.riddle?1:0;
    const topicName=({geography:"geography",history:"history",everyday:"everyday riddle"}[topic]||"everyday riddle");
    return {difficulty,topic,total,legacy,arithmetic:total-choices,choices,label:`${difficulty} · ${total} ${total===1?"question":"questions"}`,composition:[total-choices?`${total-choices} arithmetic`:"",choices?`1 ${topicName}`:""].filter(Boolean).join(" + ")};
  }
  function taskProgress(state) {
    const p=state.challengeProgress;
    const s=taskSummary(state.alarm);
    return {total:p?.total||s.total,completed:p?.completed||0,questionNumber:p?.questionNumber||1,legacy:p?.legacy??s.legacy,currentKind:p?.currentKind||"math"};
  }
  function v8Progress(state) {
    const p=taskProgress(state);
    return `<div class="v8-task-progress" aria-label="${p.completed} of ${p.total} questions completed"><div><strong>${state.checkMode?"WAKE-UP CHECK":`QUESTION ${Math.min(p.questionNumber,p.total)} OF ${p.total}`}</strong><span>${p.completed} complete</span></div><div class="v8-task-progress__bars" aria-hidden="true">${Array.from({length:p.total},(_,i)=>`<i class="${i<p.completed?"is-done":""}"></i>`).join("")}</div></div>`;
  }
  function planCard(alarm, title="Your exact plan") {
    const summary=taskSummary(alarm);
    return `<div class="v8-plan-card"><span class="eyebrow">${title}</span><strong>${escapeHtml(summary.label)}</strong><p>${escapeHtml(summary.composition)}</p>${summary.legacy?'<small>Earlier plan preserved. Applying the new format is your choice.</small>':""}</div>`;
  }
  function v8Legacy(state) {
    return taskSummary(state.alarm).legacy ? `<div class="v8-legacy-note"><strong>Your earlier plan is preserved.</strong><p>Switch to the 1 / 2 / 3 question format only when you choose. Your existing alarms are not changed automatically.</p>${secondary("Use the new format for this alarm","apply-v8-plan")}</div>` : "";
  }
  function v8Page(id,state,title,body,actions="",back="settings-back") {
    return `<section class="screen v8-screen${state.reduceMotion?" v8-reduce-motion":""}" data-screen-id="${id}">${ambient("rose")}${status(state)}<div class="screen-body detail-body v8-body">${detailHead(title,back)}${body}${actions?`<div class="button-stack detail-actions">${actions}</div>`:""}</div></section>`;
  }
  function intensityChoices(state,action) {
    const level=state.alarm.difficulty;
    const copy={Gentle:["1 question","A little addition or subtraction.","Example: 8 + 7"],Classic:["2 questions","Small-number arithmetic, including × and ÷.","Example: 24 ÷ 6"],Diva:["3 questions","Two arithmetic questions and one everyday riddle.","A short, four-choice finale"]};
    return `<div class="v8-intensities" role="group" aria-label="Wake-up intensity">${Object.entries(copy).map(([name,[count,description,example]],i)=>`<button class="v8-intensity${name===level?" is-selected":""}" type="button" data-action="${action}" data-value="${name}" aria-pressed="${name===level}"><span class="v8-intensity__number">${i+1}</span><span><strong>${name} · ${count}</strong><small>${description}</small><em>${example}</em></span>${name===level?icon("check"):""}</button>`).join("")}</div>`;
  }
  function v8Intensity(state,onboarding=false) {
    const body=`<div class="v8-heading"><div><span class="eyebrow">CHOOSE YOUR ENTRANCE</span><h2 class="detail-title">A little effort.<br>Your choice.</h2></div>${crew(state,"cue",96,"intensity")}</div><p class="detail-intro">See the task before you choose. Topic collections replace the final question; they never add another.</p>${v8Legacy(state)}${intensityChoices(state,onboarding?"set-difficulty":"select-difficulty-detail")}<div class="info-card">${settingIcon("shield")}<span><strong>Progress stays yours</strong><small>Wrong answers never unlock or erase completed questions. Three misses make the remaining task easier.</small></span></div>`;
    return v8Page(onboarding?"45":"25",state,onboarding?"Your first morning":"Wake-up intensity",body,primary(onboarding?`Continue with ${state.alarm.difficulty}`:`Use ${state.alarm.difficulty}`,onboarding?"finish-intensity-onboarding":"settings-back"),onboarding?"theme-back":"settings-back");
  }
  function localPacks(state) { return state.packCatalog || window.DramaAlarmQuestionBank?.listPacks() || []; }
  function selectedPack(state) { return state.activePack || localPacks(state).find(p=>p.id===state.activePackId) || localPacks(state).find(p=>p.id==="geography") || {id:"everyday",title:"Everyday questions",available:true,questionCount:80,plannedCount:80,free:true}; }
  function topicName(topic) {return ({everyday:"Everyday collection",geography:"World Geography",history:"World History",science:"Nature & Science"})[topic]||"Everyday collection";}
  function packIcon(id){return ({everyday:"riddle",geography:"globe",history:"book",science:"leaf",arithmetic:"math"})[id]||"riddle";}
  function packMeta(pack) {return pack.free ? `${pack.questionCount??pack.count??80} everyday questions + generated arithmetic · free` : pack.available ? `${pack.questionCount??pack.count??30} sample questions · Demo access` : "Future collection · not available";}
  function v8Topic(state) {
    const selected=state.alarm.questionTopic||"everyday";
    const body=`<span class="eyebrow detail-eyebrow">SAME QUESTION COUNT</span><h2 class="detail-title">Choose your finale.</h2><p class="detail-intro">A topic changes the last question, never the number of questions. You can switch a knowledge question to basic arithmetic and still answer correctly.</p>${v8Legacy(state)}<div class="v8-topic-options" role="group" aria-label="Final question topic">${["everyday","geography","history"].map(id=>{const p=localPacks(state).find(p=>p.id===id);return optionCard(topicName(id),id==="everyday"?"Default arithmetic or everyday riddle, based on your intensity.":`${p?.questionCount??30} local sample questions · Demo trial, not a purchase`,selected===id,"select-question-topic",id);}).join("")}</div>${planCard(state.alarm)}${secondary("Explore the Question Library","open-question-library")}`;
    return v8Page("26",state,"Final question",body,primary("Done","settings-back"));
  }
  function v8Library(state) {
    const body=`<div class="v8-heading"><div><span class="eyebrow">A NEW KIND OF ENCORE</span><h2 class="detail-title">Wake up curious.</h2></div>${crew(state,"welcome",96,"library")}</div><p class="detail-intro">Explore a topic for your final question. Basic arithmetic and everyday riddles stay free.</p><div class="v8-library">${localPacks(state).map(p=>`<article class="v8-pack-card${p.available?"":" is-future"}"><div class="v8-pack-art">${icon(packIcon(p.id))}</div><div><span class="v8-pack-badge">${p.free?"ALWAYS FREE":p.available?"DEMO PREVIEW":"COMING LATER"}</span><h3>${escapeHtml(p.title||p.name||topicName(p.id))}</h3><p>${escapeHtml(packMeta(p))}</p>${!p.free?`<small>Release plan: ${p.plannedCount||180} reviewed questions</small>`:""}<button class="text-button" type="button" data-action="open-question-pack" data-pack="${p.id}">${p.free?"Explore collection":p.available?"Preview pack":"About the future pack"} ${icon("chevron")}</button></div></article>`).join("")}</div><div class="v8-plain-note">No charges or store purchases in this Demo. The 440-question release plan is separate from the 140 fixed questions available here.</div>`;
    return v8Page("46",state,"Question Library",body,secondary("Offline content status","prepare-question-pack"),"question-library-back");
  }
  function v8Pack(state) {
    const pack=selectedPack(state),available=pack.available!==false;
    const body=`<div class="v8-pack-cover">${icon(packIcon(pack.id))}<span>${pack.free?"YOUR EVERYDAY COLLECTION":"A LITTLE CURIOSITY"}</span></div><span class="eyebrow">${pack.free?"INCLUDED · FREE":"COLLECTION PREVIEW"}</span><h2 class="detail-title">${escapeHtml(pack.title||pack.name||topicName(pack.id))}</h2><p class="detail-intro">${escapeHtml(pack.description||"A small discovery before breakfast.")}</p><div class="v8-pack-facts"><div><strong>${pack.questionCount??pack.count??0}</strong><span>${pack.free?"local everyday questions":"local sample questions"}</span></div><div><strong>${pack.plannedCount||180}</strong><span>planned release questions</span></div></div>${pack.free?'<p class="inline-help">Arithmetic is generated by rules and is not counted as fixed content.</p>':'<div class="v8-plain-note">One-time purchase is the proposed store model. This is Demo access, not a purchase. Pricing and store restoration are not live.</div>'}<div class="info-card">${settingIcon("download")}<span><strong>Local questions, even without a connection</strong><small>Content updates are prepared separately. No network request is needed to answer an alarm.</small></span></div>`;
    const actions=available?primary("Try a sample","try-pack-sample")+secondary(pack.free?"Use everyday questions":"Use Demo samples for my finale","select-question-topic",` data-value="${pack.id}"`)+textButton("Review offline content","prepare-question-pack"):primary("Back to collections","question-pack-back");
    return v8Page("47",state,pack.title||topicName(pack.id),body,actions,"question-pack-back");
  }
  function v8Sample(state) {
    const pack=selectedPack(state),q=state.packSample||window.DramaAlarmQuestionBank?.sample(pack.id,0);
    if(!q)return v8Page("48",state,"Sample question",`${crew(state,"calm",132,"sample-empty")}<h2 class="detail-title">This collection is still backstage.</h2><p class="detail-intro">No sample is available. Everyday questions are ready to use.</p>`,primary("Back to preview","question-pack-back"),"question-pack-back");
    const feedback=state.packSampleFeedback,correct=feedback==="correct";
    const options=`<div class="riddle-options v8-sample-options">${q.options.map((option,index)=>`<button class="riddle-option${state.packSampleAnswer===index?(correct?" v8-choice-correct":" is-wrong"):""}" type="button" data-action="answer-pack-sample" data-index="${index}" aria-pressed="${state.packSampleAnswer===index}"><span>${letters[index]}</span>${escapeHtml(option)}${state.packSampleAnswer===index?icon(correct?"check":"close"):""}</button>`).join("")}</div>`;
    return v8Page("48",state,"Try a sample",`<span class="v8-pack-badge">SAMPLE · NOT AN ALARM</span><h2 class="riddle-question">${escapeHtml(q.question||q.prompt)}</h2>${options}${feedback?`<div class="v8-sample-feedback" role="status"><strong>${correct?"Correct. A little discovery.":"Not quite. You can try again."}</strong>${correct?`<p>${escapeHtml(q.explanation||q.answerText||"")}</p>`:""}</div>`:""}<p class="privacy-line">Practice only. No alarm, no result, no Wake-up Check.</p>`,secondary("Another sample","next-pack-sample")+primary("Back to preview","question-pack-back"),"question-pack-back");
  }
  function v8Offline(state) {
    const p=selectedPack(state),s=state.packStatus||window.DramaAlarmQuestionBank?.getStatus(p.id)||{state:"bundled",ready:true};
    const busy=s.state==="preparing",error=s.state==="error";
    return v8Page("49",state,"Offline questions",`<div class="v8-heading"><div><span class="eyebrow">READY WITHOUT A CONNECTION</span><h2 class="detail-title">The show can go on.</h2></div>${crew(state,error?"calm":"idle",96,"offline")}</div><div class="v8-plan-card"><strong>${escapeHtml(p.title||topicName(p.id))}</strong><p>${busy?"Checking and preparing content…":error?"Update unavailable. Your local questions remain ready.":"Local content is ready."}</p><small>${s.questionCount??p.questionCount??0} local questions · ${escapeHtml(s.source||"bundled")} · ${escapeHtml(s.version||p.version||"8.0.0")}</small>${busy?'<div class="v8-indeterminate" role="progressbar" aria-label="Preparing content"></div>':""}</div>${error?`<div class="field-error" role="alert">${escapeHtml(s.error||"The update could not be verified.")} Existing local content was kept.</div>`:""}<div class="info-card">${settingIcon("shield")}<span><strong>Content is not a purchase receipt</strong><small>Download readiness and future store rights are separate. Demo samples do not create paid ownership.</small></span></div><p class="detail-intro">The bundled free collection is always available. Updates are saved only after the whole pack has been verified; an active question never changes mid-answer.</p>`,secondary(busy?"Preparing…":error?"Retry content update":"Check content update",error?"retry-question-pack":"prepare-question-pack",busy?" disabled":"")+primary("Back to my collection","question-pack-back"),"question-pack-back");
  }
  function v8Character(state) {
    const reduced=Boolean(state.reduceMotion||state.reducedMotion);
    return v8Page("50",state,"Your morning crew",`<div class="v8-character-hero">${crew(state,"welcome",190,"character")}<span class="eyebrow">YOUR CURTAIN SPRITE</span><h2 class="detail-title">A tiny stage manager.<br>On your side.</h2><p class="detail-intro">Soft curtain folds, a bow tie and a backstage headset. The same companion in both free scenes.</p></div><div class="v8-character-poses">${["think","correct","calm"].map((pose,i)=>`<div>${crew(state,pose,94,`pose-${pose}`)}<span>${["A little focus","A little bravo","A safe exit"][i]}</span></div>`).join("")}</div><div class="settings-card setting-detail-card"><div class="settings-row"><span><strong>Reduce motion</strong><small>Keep static expressions. Stop character and ambient loops.</small></span>${toggle("toggle-reduced-motion",reduced,"Reduce motion")}</div></div><p class="privacy-line">System Reduce Motion also applies. Character preferences never change alarm sound or safety controls.</p>`,primary("Back to Settings","open-settings"),"open-settings");
  }

  function v8Challenge(state,id) {
    const math=state.math||{},p=taskProgress(state),q=state.riddleInstance||state.riddle||riddles[0];
    if(id==="04")return `<section class="screen v8-screen" data-screen-id="04">${status(state)}<div class="screen-body screen-body--center"><div class="screen-head full-width"><h1>${state.checkMode?"Wake-up Check":"A little arithmetic"}</h1><span class="ringing-state"><i></i><span data-live-volume>${state.volume}%</span></span></div>${v8Progress(state)}<div class="v8-challenge-intro"><p>${state.checkMode?"One gentle answer.":"Your next small step."}</p>${crew(state,"think",88,"math")}</div><div class="math-equation${math.expression?" math-equation--long":""}">${escapeHtml(mathExpression(math))}</div><div class="math-input" aria-label="Current math answer">${escapeHtml(math.input||"")}</div><p class="math-hint">Answer correctly to continue. Your completed progress stays safe.</p>${keypad("",math.input)}</div></section>`;
    if(id==="05")return `<section class="screen v8-screen" data-screen-id="05">${status(state)}<div class="screen-body screen-body--center"><div class="screen-head full-width"><h1>A little arithmetic</h1><span class="ringing-state"><i></i><span data-live-volume>${state.volume}%</span></span></div>${v8Progress(state)}${crew(state,"wrong",124,"wrong-math")}<div class="math-equation${math.expression?" math-equation--long":""}">${escapeHtml(mathExpression(math))}</div><div class="math-input wrong-value">${escapeHtml(math.lastWrong)}</div><p class="math-hint math-hint--wrong" role="alert">Not quite. Your progress is safe.</p><p class="screen-copy">${p.completed} of ${p.total} already complete. No extra question is added.</p><div class="button-stack">${primary(p.legacy&&math.wrong>=3?"Make it gentler":"Try again",p.legacy&&math.wrong>=3?"open-safety-math":"retry-math")}${textButton("Emergency","open-emergency")}</div></div></section>`;
    if(id==="06")return `<section class="screen v8-screen" data-screen-id="06">${ambient("lilac")}${status(state)}<div class="screen-body"><div class="screen-head"><h1>The Finale</h1><span class="ringing-state"><i></i><span data-live-volume>${state.volume}%</span></span></div>${v8Progress(state)}<div class="v8-challenge-intro"><span class="eyebrow">${escapeHtml(topicName(q.packId||state.alarm.questionTopic||"everyday"))}</span>${crew(state,"think",80,"choice")}</div><h2 class="riddle-question">${escapeHtml(q.question)}</h2><p class="screen-copy riddle-copy">Choose one answer. A wrong answer never unlocks.</p>${riddleOptions(q,"riddle-answer",null)}${p.legacy?"":textButton("Switch to basic arithmetic","switch-basic-question")}</div></section>`;
    if(id==="20")return `<section class="screen v8-screen" data-screen-id="20">${status(state)}<div class="screen-body"><div class="screen-head"><h1>The Finale</h1><span class="ringing-state"><i></i><span data-live-volume>${state.volume}%</span></span></div>${v8Progress(state)}<div class="v8-challenge-intro"><strong>Not quite.</strong>${crew(state,"wrong",90,"wrong-choice")}</div><h2 class="riddle-question riddle-question--wrong">${escapeHtml(q.question)}</h2>${wrongRiddleOption(q,state.lastRiddleWrong)}<div class="wrong-panel" role="status"><p class="math-hint math-hint--wrong">Your ${p.completed} completed ${p.completed===1?"question is":"questions are"} safe.</p><p class="screen-copy">Read this at your own pace. Continue with another question, or switch to basic arithmetic.</p></div><div class="button-stack">${primary("Try another question","next-riddle")}${p.legacy?"":secondary("Switch to basic arithmetic","switch-basic-question")}${textButton("Emergency","open-emergency")}</div></div></section>`;
    if(id==="21"&&String(state.safetyKind||"").startsWith("v8")){
      const manual=state.safetyKind==="v8-switch";
      return `<section class="screen v8-screen" data-screen-id="21">${ambient("lilac")}${status(state)}<div class="screen-body screen-body--center">${crew(state,"calm",160,"safety")}<span class="eyebrow">${manual?"YOU CHOOSE THE ROUTE":"A GENTLER REMAINING QUESTION"}</span><h1 class="screen-title safety-title">A gentler next act.</h1><p class="screen-copy">${manual?"Switch this question to basic arithmetic?":"After three misses, the remaining task is easier."}</p><div class="v8-plan-card"><strong>${p.completed} of ${p.total} questions complete</strong><p>Same total. Your completed progress stays.</p><small>This changes only the current challenge. You still need to answer correctly.</small></div><div class="button-stack">${primary(manual?"Switch to basic arithmetic":"Continue with the easier question",manual?"confirm-switch-basic":"safety-continue")}${textButton("Emergency","open-emergency")}</div></div></section>`;
    }
    return null;
  }

  function v8Editor(state) {
    const alarm=state.alarm;
    let html=screen02(state);
    const begin=html.indexOf('<div class="form-card"><div class="form-row difficulty-form-row">');
    const end=html.indexOf('<span class="eyebrow section-label">SOUND</span>',begin);
    if(begin!==-1&&end!==-1)html=html.slice(0,begin)+`<div class="form-card"><div class="form-row difficulty-form-row"><span id="difficulty-group-label">Wake-up intensity</span><div class="segment" role="group" aria-labelledby="difficulty-group-label">${["Gentle","Classic","Diva"].map((level,i)=>`<button type="button" data-action="set-difficulty" data-value="${level}" aria-pressed="${alarm.difficulty===level}" class="${alarm.difficulty===level?"is-on":""}">${i+1} · ${level}</button>`).join("")}</div><small>Gentle 1 · Classic 2 · Diva 3. Small integers; division has whole-number answers.</small></div><button class="form-row form-row--button" type="button" data-action="open-question-library"><span><strong>Final question topic</strong><small>Replaces the last question. Never adds another.</small></span><strong>${escapeHtml(topicName(alarm.questionTopic||"everyday"))} ${icon("chevron")}</strong></button><div class="form-row"><span>Wake-up Check <small>Confirm again after ${alarm.checkDelay||5} minutes</small></span>${toggle("toggle-check",alarm.check,"Wake-up check")}</div></div>${v8Legacy(state)}${planCard(alarm,"SAVE WITH THIS PLAN")}`+html.slice(end);
    return html;
  }

  function v8Decorate(id,state,html) {
    html=html.replaceAll('Drama Alarm · 7.2','Drama Alarm · 8.0').replaceAll('BROWSER DEMO · 7.2','BROWSER DEMO · 8.0').replace('<span>Version</span><strong>7.2</strong>','<span>Version</span><strong>8.0</strong>');
    if(state.reduceMotion)html=html.replace('class="screen','class="screen v8-reduce-motion');
    if(id==="08")html=html.replace(morningArt("welcome-art"),crew(state,"welcome",190,"welcome")).replace('Every morning<br>deserves an entrance.','Meet your<br>morning crew.').replace('Pick your time. Find your sound.<br>Meet morning with two little acts.','Pick a scene. Set a time.<br>Choose one, two or three little questions.');
    if(id==="01")html=html.replace('<div class="next-show-kicker">',`<div class="v8-home-crew">${crew(state,"idle",82,"home")}</div><div class="next-show-kicker">`).replaceAll('Math · ${alarm.difficulty}','Wake-up intensity').replace('Choose a time, a sound and a little resolve.','Choose a time, a sound and a small challenge.').replace('Sound heard. Practice both acts anytime.','Sound heard. Replay the teaching anytime.').replace('Optional next step · listen and try both acts.','Optional · listen and try the teaching examples.');
    if(id==="03")html=html.replace('<div class="showtime-rings">',`${crew(state,"cue",132,"showtime")}<div class="showtime-rings">`).replace(state.alarm.riddle?'One math question. One riddle. Then quiet.':'One math question. Then quiet.',`${escapeHtml(taskSummary(state.alarm).label)} · ${escapeHtml(taskSummary(state.alarm).composition)}`);
    if(id==="07"){
      const result=state.lastResult,total=result?.totalQuestions||taskProgress(state).total,completed=result?.correctQuestions??total;
      html=html.replace('<div class="bravo-burst"><strong>Bravo!</strong></div>',`${crew(state,"bravo",172,"bravo")}<h1 class="v8-bravo-title">Bravo.</h1><h2 class="v8-complete-title">Challenge complete.</h2><p class="v8-completion-count">${completed} of ${total} questions complete</p>`).replace('Preview it now or return home.','Scheduled from completion. You can preview it or return home.');
    }
    if(id==="22")html=html.replace('<div class="wake-mark wake-mark--v2"><i class="spark"></i></div>',crew(state,"cue",156,"wake-check")).replace('One tap records your confirmation.','One tap records your own confirmation.');
    if(id==="12"){
      html=html.replace(morningArt(),crew(state,"welcome",150,"run-empty"));
      if(state.history?.length)html=html.replace('<div class="today-status-card">',`<div class="v8-challenge-intro"><p>Your local morning record.</p>${crew(state,"correct",88,"run-record")}</div><div class="today-status-card">`);
    }
    if(id==="26")html=html.replace('<span class="eyebrow detail-eyebrow">SAME QUESTION COUNT</span>',`<div class="v8-heading"><span class="eyebrow detail-eyebrow">SAME QUESTION COUNT</span>${crew(state,"cue",92,"finale-setting")}</div>`);
    if(id==="21"&&!String(state.safetyKind||"").startsWith("v8"))html=html.replace('<div class="gentle-mark gentle-mark--v2"></div>',crew(state,"calm",148,"legacy-safety"));
    if(id==="19")html=html.replace('<i class="spark ready-spark"></i>',crew(state,"correct",118,"alarm-saved")).replace(`${state.alarm.difficulty} Math${state.alarm.riddle?" + Riddle":""}`,escapeHtml(taskSummary(state.alarm).label));
    if(id==="14"){
      html=html.replace('Math difficulty','Wake-up intensity').replace('Gentle recommended for a first morning','1, 2 or 3 questions · new alarms only').replace('Riddle finale','Final question').replace('One four-choice final act','Topic replaces the last question').replace(`<b>${state.defaults?.riddle?"On":"Off"}${icon("chevron")}</b>`,`<b>${escapeHtml(topicName(state.defaults?.questionTopic||"everyday"))}${icon("chevron")}</b>`);
      const inserted=`<div class="settings-group"><span>YOUR BACKSTAGE</span><div class="settings-card settings-card--links"><button class="settings-link" type="button" data-action="open-question-library">${settingIcon("globe")}<span><strong>Question Library</strong><small>Free basics, geography and history samples</small></span><b>Explore ${icon("chevron")}</b></button><button class="settings-link" type="button" data-action="open-character-settings">${settingIcon("star")}<span><strong>Your morning crew</strong><small>Curtain Sprite & reduced motion</small></span><b>${icon("chevron")}</b></button></div></div>`;
      html=html.replace('<div class="settings-group"><span>SOUND & STYLE</span>',inserted+'<div class="settings-group"><span>SOUND & STYLE</span>');
    }
    if(id==="18")html=html.replace('Try the two-act rehearsal','Try the teaching examples').replace('Finish the answer, then meet The Finale.','Two teaching examples only; your alarm uses its saved plan.');
    if(id==="37")html=html.replace('Same little acts. Two different stages.','Same morning crew. Two free stages.').replace('Keep this mood · set my time','Keep this mood · choose my challenge');
    if(id==="39")html=html.replace('Two little acts. One clear start.','Your challenge. Your choice.');
    if(id==="41")html=html.replace('How the two acts work','Choose your wake-up effort').replace('Answer one addition or subtraction question, then one optional four-choice riddle. A wrong answer keeps the alarm on. Three misses offer a gentler question.','Gentle has one small arithmetic question, Classic has two, and Diva has three including a riddle. A chosen topic replaces the final question. A wrong answer keeps the alarm on and preserves completed progress. Three misses make the remaining task easier.');
    if(id==="42")html=html.replace('clears this app’s v2–v7 records and local Emergency counters, then leaves an empty v7 storage marker.','clears the current v8 Demo record and question-pack cache, then leaves an empty v8 marker. Earlier version data is preserved.').replace('There is no Drama Alarm account, cloud sync, advertising tracker, or payment checkout in this demo.','There is no Drama Alarm account, alarm cloud sync, advertising tracker, or payment checkout in this demo. Content updates download versioned question packs; alarm labels, answers and results are not uploaded.');
    return html;
  }

  // 9.0 task-led components. The stable 7.2 chrome and optical navigation are
  // deliberately left in their original modules; these are content templates.
  function v9Page(id,state,title,body,actions="",back="settings-back") {
    return `<section class="screen v8-screen v9-screen${state.reduceMotion?" v8-reduce-motion":""}" data-screen-id="${id}">${ambient("rose")}${status(state)}<div class="screen-body detail-body v9-body">${detailHead(title,back)}${body}${actions?`<div class="button-stack detail-actions">${actions}</div>`:""}</div></section>`;
  }
  function v9Note(title,copy,kind="shield") {
    return `<div class="v9-note">${icon(kind)}<span><strong>${title}</strong>${copy?`<small>${copy}</small>`:""}</span></div>`;
  }
  function v9Setting(title,copy,value,action,kind="settings",extra="") {
    return `<button class="settings-link v9-setting" type="button" data-action="${action}"${extra}>${settingIcon(kind)}<span><strong>${title}</strong>${copy?`<small>${copy}</small>`:""}</span><b>${value||""}${icon("chevron")}</b></button>`;
  }
  function v9Group(title,rows) {return `<section class="settings-group v9-setting-group"><h2>${title}</h2><div class="settings-card settings-card--links">${rows}</div></section>`;}
  function v9SoundArt(preset,playing=false) {
    const kind=({"first-light":"sun","velvet-dawn":"moon","rose-parade":"bell","golden-hour":"sun","studio-sunrise":"star","garden-after-rain":"leaf"})[preset.id]||"sound";
    return `<span class="v9-sound-art v9-sound-art--${preset.id}" aria-hidden="true">${icon(kind)}${wave(playing)}</span>`;
  }
  function v9Home(state) {
    const next=state.nextAlarm,now=new Date(state.now||Date.now()),display=next?occurrenceDisplay(next):null;
    const date=new Intl.DateTimeFormat(state.language==="zh-CN"?"zh-CN":"en-US",{month:"short",day:"numeric",weekday:"long"}).format(now);
    const head=`<div class="v5-topline"><div><span class="v5-date">${date}</span><h1 class="v5-greeting">Your morning, your stage.</h1></div><button class="quiet-action" type="button" data-action="new-alarm" aria-label="Add alarm">${icon("plus")}</button></div>`;
    const nextCard=next?`<button class="v9-next-card" type="button" data-action="edit-alarm" data-id="${escapeHtml(next.alarm.id)}"><div><span class="eyebrow">NEXT ALARM</span><strong class="v9-next-time">${display.time}<small>${display.period}</small></strong><span class="v9-next-date">${display.dateLabel||next.dayLabel}</span><span class="v9-next-countdown">${icon("clock")}<span>${next.countdown}</span></span></div>${crew(state,"idle",104,"home-next")}${daylightAdjustment(display)}</button>`:"";
    const body=`${head}${state.persistenceError?`<div class="field-error" role="alert">${escapeHtml(state.persistenceError)}</div>`:""}${nextCard}<div class="section-heading"><h2>My alarms</h2><span>${state.alarms.length}</span></div><div class="alarm-list">${state.alarms.length?state.alarms.map(a=>alarmCard(a,state)).join(""):`<div class="v9-empty">${crew(state,"welcome",142,"home-empty")}<h2>A morning to make your own.</h2><p>Choose a time, a sound and a small challenge.</p>${primary("Create my first alarm","new-alarm")}</div>`}</div>${state.alarms.length?`<button class="rehearsal-card" type="button" data-action="test-alarm"><span class="rehearsal-card__icon">${icon("play")}</span><span><strong>Practice my alarm</strong><small>Your saved plan · no results or safety counts</small></span>${icon("chevron")}</button>`:""}<details class="v9-disclosure"><summary>${icon("access")}<span>About this demo</span>${icon("chevron")}</summary>${browserNotice()}${secondary("Sound check & teaching","start-tutorial")}</details>`;
    return `<section class="screen v9-screen" data-screen-id="01">${ambient("rose")}${status(state)}<div class="screen-body home-body v9-home">${body}</div>${bottomNav("home")}</section>`;
  }
  function v9Editor(state) {
    const a=state.alarm,once=a.repeatMode==="once",level=a.difficulty,selected=soundById(state.soundId),error=state.editorErrorField||"";
    const dayNames=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],dayIds=[1,2,3,4,5,6,0];
    const header=`<div class="screen-head sticky-head" data-slot="toolbar"><button class="toolbar-button toolbar-button--quiet" type="button" data-action="go-home">${icon("close")}<span>Cancel</span></button><h1>${state.editorMode==="edit"?"Edit Alarm":"New Alarm"}</h1><button class="toolbar-button toolbar-button--accent save-link" type="button" data-action="save-alarm">${icon("check")}<span>Save</span></button></div>`;
    const body=`${header}${state.editorError?`<div class="form-error error-summary" id="editor-error-summary" tabindex="-1" role="alert"><strong>Check this setting</strong><span>${escapeHtml(state.editorError)}</span></div>`:""}<label class="time-field v9-time-field" for="alarm-time"><span class="field-label">Alarm time</span><input class="editor-time" id="alarm-time" type="time" value="${escapeHtml(a.time)}" aria-label="Alarm time" ${error==="time"?'aria-invalid="true" aria-describedby="error-time"':""}></label>${fieldError(state,"time")}<fieldset class="repeat-field v9-repeat"><legend>Repeat</legend><div class="segment repeat-segment" role="group" aria-label="Alarm frequency">${[["once","Just once"],["weekly","Repeat weekly"]].map(([value,title])=>`<button type="button" data-action="set-repeat-mode" data-value="${value}" aria-pressed="${(once?"once":"weekly")===value}" class="${(once?"once":"weekly")===value?"is-on":""}">${title}</button>`).join("")}</div>${once?`<label class="date-field" for="alarm-date"><span>Ring on this date</span><input id="alarm-date" type="date" value="${escapeHtml(a.onceDate||"")}" ${["onceDate","date"].includes(error)?'aria-invalid="true" aria-describedby="error-date"':""}></label>${fieldError(state,error==="onceDate"?"onceDate":"date")}`:`<div class="days v9-days" id="repeat-days" role="group" tabindex="-1" aria-label="Repeat days">${dayIds.map((day,i)=>`<button class="day${a.days.includes(day)?" is-on":""}" type="button" data-action="toggle-day" data-index="${day}" aria-label="${dayNames[i]}" aria-pressed="${a.days.includes(day)}">${state.language==="zh-CN"?["一","二","三","四","五","六","日"][i]:dayNames[i].slice(0,1)}</button>`).join("")}</div>${fieldError(state,"days")}`}</fieldset><div class="v9-editor-plan"><div class="section-heading"><h2>Your wake-up</h2><span>${escapeHtml(taskSummary(a).total)} questions</span></div><div class="segment v9-level-segment" role="group" aria-label="Wake-up intensity">${["Gentle","Classic","Diva"].map((value,i)=>`<button type="button" data-action="set-difficulty" data-value="${value}" aria-pressed="${level===value}" class="${level===value?"is-on":""}"><b>${i+1}</b><span>${value}</span></button>`).join("")}</div><div class="v9-plan-summary"><strong>${escapeHtml(taskSummary(a).label)}</strong><span>${escapeHtml(taskSummary(a).composition)}</span></div><div class="settings-card settings-card--links">${v9Setting("Final question topic","Replaces the last question. Never adds another.",escapeHtml(topicName(a.questionTopic||"everyday")),"open-question-library","globe")}${v9Setting("Alarm sound",selected.mood,selected.name,"open-editor-sounds","sound")}<div class="settings-row v9-setting"><span><strong>Wake-up Check</strong><small>Confirm again after ${a.checkDelay||5} minutes</small></span>${toggle("toggle-check",a.check,"Wake-up check")}</div></div></div>${v8Legacy(state)}<details class="v9-disclosure"${error==="label"?" open":""}><summary>${icon("bell")}<span>Alarm name</span><b data-i18n-ignore>${escapeHtml(a.label)}</b>${icon("chevron")}</summary><label class="alarm-label-field" for="alarm-label"><span class="field-label">Alarm name</span><input id="alarm-label" type="text" maxlength="32" value="${escapeHtml(a.label)}" placeholder="Morning Show" autocomplete="off" ${error==="label"?'aria-invalid="true" aria-describedby="error-label"':""}></label>${fieldError(state,"label")}</details><details class="v9-disclosure"><summary>${icon("volume")}<span>Sound options</span><b>${state.masterVolume}%</b>${icon("chevron")}</summary><label class="volume-control" for="max-volume"><span>Application gain limit</span><output data-volume-output="max-volume">${state.masterVolume}%</output><input id="max-volume" type="range" min="25" max="100" value="${state.masterVolume}"></label><p class="inline-help">Your device volume is separate.</p><div class="settings-row"><span>Rising volume</span>${toggle("toggle-rising",a.rising,"Rising volume")}</div><div class="settings-row"><span>Quieter after each act</span>${toggle("toggle-quieter",a.quieter,"Quieter after each act")}</div></details>${state.editorMode==="edit"?'<div class="editor-actions"><button class="text-button text-button--danger" type="button" data-action="delete-alarm">Delete alarm</button></div>':""}`;
    return `<section class="screen v9-screen" data-screen-id="02">${ambient("gold")}${status(state)}<div class="screen-body editor-body v9-editor">${body}</div></section>`;
  }
  function v9Sounds(state) {
    const selected=soundById(state.soundId);
    const cards=soundPresets.filter(p=>!p.premium).map(p=>{const chosen=state.soundId===p.id,playing=state.previewingSound===p.id;return `<article class="v9-sound-card${chosen?" is-selected":""}"><button type="button" class="v9-sound-select" data-action="select-sound" data-sound="${p.id}" aria-pressed="${chosen}">${v9SoundArt(p,playing)}<span><strong>${p.name}</strong><small>${p.mood}</small><em>${chosen?"Selected":"Always free"}</em></span></button><button class="v9-preview" type="button" data-action="${playing?"stop-preview":"preview-sound"}" data-sound="${p.id}" aria-label="${playing?"Stop":"Preview"} ${p.name}">${icon(playing?"close":"play")}<span>${playing?"Stop":"Preview"}</span></button></article>`;}).join("");
    return `<section class="screen v9-screen" data-screen-id="10">${ambient("lilac")}${status(state)}<div class="screen-body sound-booth v9-body">${detailHead("Sound Booth","confirm-sound")}<p class="v9-lead">Find a sound you want to wake up to.</p><div class="v9-sound-list">${cards}</div>${v9Note("Listen, choose, then apply.","Previewing a sound does not change your saved alarm.","sound")}<details class="v9-disclosure"><summary>${icon("star")}<span>Future sound collections</span>${icon("chevron")}</summary><div class="premium-sound-list">${soundPresets.filter(p=>p.premium).map(p=>premiumSoundCard(p,state)).join("")}</div>${textButton("Explore future collections","open-pass")}</details><div class="selected-sound-bar"><div><span>Selected</span><strong>${selected.name}</strong></div>${primary(`Use ${selected.name}`,"confirm-sound")}</div></div></section>`;
  }
  function v9Settings(state) {
    const d=state.defaults||state.alarm,theme=themeInfo(state,state.themeId||"daybreak");
    const body=`<div class="page-heading"><h1>Settings</h1></div>${v9Group("Appearance & language",v9Setting("Official free themes",theme.subtitle||"Two free stages",theme.name,"open-themes","palette")+v9Setting("Language","Applies to this app",state.language==="en"?"English":"简体中文","open-language","language")+v9Setting("Your morning crew","Curtain Sprite & reduced motion","","open-character-settings","star"))}${v9Group("New alarm defaults",v9Setting("Wake-up intensity","Existing alarms stay unchanged",d.difficulty,"open-difficulty","math")+v9Setting("Final question topic","Topic replaces the last question",topicName(d.questionTopic||"everyday"),"open-riddle-setting","globe")+v9Setting("Wake-up Check","Confirm after a completed challenge",d.check?`${d.checkDelay||5} minutes`:"Off","open-check-setting","clock"))}${v9Group("Sound & safety",v9Setting("Alarm sound","Choose and preview sounds",soundById(d.soundId||state.soundId).name,"open-sounds","sound")+v9Setting("Sound gain","Your device volume is separate",`${state.masterVolume}%`,"open-volume-setting","volume")+v9Setting("Haptics","Short, optional feedback",state.haptics?"On":"Off","open-haptics","haptics")+v9Setting("Emergency Stop","Always available","","open-emergency-rules","shield"))}${v9Group("Library & support",v9Setting("Question Library","Free basics and topic samples","","open-question-library","book")+v9Setting("Help & reliability","How your alarm works","","open-help","riddle")+v9Setting("Browser permissions","Check access and sound","","open-access-settings","access")+v9Setting("Privacy & local data","Your alarms stay on this device","","open-privacy","shield")+v9Setting("Diagnostics","Review local events","","open-diagnostics","run"))}<div class="v9-settings-footer"><span>Drama Alarm · 9.0</span>${textButton("Reset local demo","reset-demo")}</div>`;
    return `<section class="screen v9-screen" data-screen-id="14">${ambient("rose")}${status(state)}<div class="screen-body settings-body v9-settings">${body}</div>${bottomNav("settings")}</section>`;
  }
  function v9Language(state) {
    return v9Page("51",state,"Language",`<p class="v9-lead">Choose the language that feels like home.</p><div class="option-list v9-language-list" role="group" aria-label="App language">${[["zh-CN","简体中文","Simplified Chinese"],["en","English","English"]].map(([locale,name,detail])=>`<button class="option-card${(state.language||"zh-CN")===locale?" is-selected":""}" type="button" data-action="set-language" data-locale="${locale}" aria-pressed="${(state.language||"zh-CN")===locale}"><span><strong data-i18n-ignore>${name}</strong><small data-i18n-ignore>${detail}</small></span><i>${(state.language||"zh-CN")===locale?icon("check"):""}</i></button>`).join("")}</div>${v9Note("Change language, keep your morning.","Your alarms, sound, theme and progress stay unchanged.","language")}`,primary("Back to Settings","open-settings"),"open-settings");
  }
  function v9Intensity(state,onboarding=false) {
    const chosen=state.alarm.difficulty,action=onboarding?"set-difficulty":"select-difficulty-detail";
    const cards=["Gentle","Classic","Diva"].map((name,i)=>{const sample={...state.alarm,difficulty:name,taskPlanVersion:8},s=taskSummary(sample),knowledge=s.topic!=="everyday";const example=knowledge?(s.topic==="geography"?"Example: Which ocean is largest?":"Example: Where are the pyramids of Giza?"):name==="Diva"?"Example: What helps you dry, but gets wetter?":name==="Classic"?"Example: 8 + 7, then 24 ÷ 6":"Example: 8 + 7";return `<button class="v8-intensity${chosen===name?" is-selected":""}" type="button" data-action="${action}" data-value="${name}" aria-pressed="${chosen===name}"><span class="v8-intensity__number">${i+1}</span><span><strong>${name} · ${s.total} ${s.total===1?"question":"questions"}</strong><small>${escapeHtml(s.composition)}</small><em>${example}</em></span>${chosen===name?icon("check"):""}</button>`;}).join("");
    return v9Page(onboarding?"45":"25",state,onboarding?"Your first morning":"Wake-up intensity",`<div class="v9-inline-intro"><div><h2>Choose your little effort.</h2><p>You can change it for each alarm.</p></div>${crew(state,"cue",76,"intensity")}</div><div class="v8-intensities">${cards}</div>${v8Legacy(state)}${v9Note("Wrong answers never unlock.","Your completed progress stays. Three misses make the remaining task easier.")}`,primary(onboarding?`Continue with ${chosen}`:`Use ${chosen}`,onboarding?"finish-intensity-onboarding":"settings-back"),onboarding?"theme-back":"settings-back");
  }
  function v9Library(state) {
    const body=`<p class="v9-lead">A small discovery for your final question.</p><div class="v8-library">${localPacks(state).map(p=>`<article class="v8-pack-card v9-pack-card${p.available?"":" is-future"}"><div class="v8-pack-art v9-pack-art v9-pack-art--${p.id}">${icon(packIcon(p.id))}<i></i></div><div><span class="v8-pack-badge">${p.free?"ALWAYS FREE":p.available?"DEMO SAMPLE":"COMING LATER"}</span><h2>${escapeHtml(p.title||p.name||topicName(p.id))}</h2><p>${escapeHtml(packMeta(p))}</p><button class="text-button" type="button" data-action="open-question-pack" data-pack="${p.id}">${p.available?"Explore collection":"About this collection"}${icon("chevron")}</button></div></article>`).join("")}</div>${v9Note("140 fixed questions available.","Arithmetic is generated locally. Future content and store purchases are not live.","book")}`;
    return v9Page("46",state,"Question Library",body,primary("Back","question-library-back"),"question-library-back");
  }
  function v9Pack(state) {
    const p=selectedPack(state),available=p.available!==false,count=p.questionCount??p.count??0,edit=state.editorOpen||state.libraryReturnScreen==="02"||state.settingScope==="editor";
    const levels=available&&window.DramaAlarmQuestionBank?.questions?Object.fromEntries(["Gentle","Classic","Diva"].map(l=>[l,p.id==="everyday"&&l!=="Diva"?"Generated":window.DramaAlarmQuestionBank.questions(p.id,{level:l==="Gentle"?"Gentle":"Classic"}).length])):null;
    const body=`<div class="v9-pack-heading"><div class="v8-pack-art v9-pack-art v9-pack-art--${p.id}">${icon(packIcon(p.id))}<i></i></div><div><span class="v8-pack-badge">${p.free?"ALWAYS FREE":available?"DEMO SAMPLE":"COMING LATER"}</span><h2>${escapeHtml(p.title||topicName(p.id))}</h2></div></div><p class="v9-lead">${escapeHtml(p.description||"A small discovery before breakfast.")}</p><div class="v9-inventory"><strong>${count}</strong><span>local questions<br><small>${p.free?"Arithmetic is generated separately.":"Preview access, not paid ownership."}</small></span></div>${levels?`<div class="v9-pool-levels">${Object.entries(levels).map(([l,n])=>`<span>${l}<b>${n}</b></span>`).join("")}</div>`:""}${v9Note("Replaces the final question.","The number of questions stays the same. You can switch to basic arithmetic during a challenge.","riddle")}<div class="settings-card settings-card--links">${v9Setting("Try a sample","Practice without starting an alarm","","try-pack-sample","play")}${available?v9Setting("Offline questions",`${count} local questions`,"","prepare-question-pack","download"):""}</div><details class="v9-disclosure"><summary>${icon("cloud")}<span>About future content</span>${icon("chevron")}</summary><p>Planned release: ${p.plannedCount||180} reviewed questions. Current samples and future inventory are separate.</p><p>There is no checkout or verified purchase in this demo.</p></details>`;
    return v9Page("47",state,p.title||topicName(p.id),body,available?primary(edit?"Use for this alarm":"Use for new alarms","select-question-topic",` data-value="${p.id}"`):primary("Back to collections","question-pack-back"),"question-pack-back");
  }
  function v9Offline(state) {
    const p=selectedPack(state),s=state.packStatus||window.DramaAlarmQuestionBank?.getStatus(p.id)||{},count=Number(s.questionCount??p.questionCount??0),busy=state.packPreparing||s.state==="preparing",ready=Boolean(s.ready&&count>0),error=s.state==="error";
    const title=busy?"Checking content…":error&&ready?"Update unavailable. Local questions are ready.":error?"Content could not be prepared.":ready?"Ready without a connection.":"This collection is not available yet.";
    return v9Page("49",state,"Offline questions",`<div class="v9-status-illustration">${crew(state,ready?"correct":"calm",116,"offline")}</div><div class="v8-plan-card" role="status" aria-live="polite"><span class="eyebrow">${escapeHtml(p.title||topicName(p.id))}</span><strong>${title}</strong><p>${ready?`${count} local questions are available.`:"Use everyday questions while this collection is unavailable."}</p>${busy?'<div class="v8-indeterminate" role="progressbar" aria-label="Preparing content"></div>':""}<small>${escapeHtml(s.version||p.version||"9.0.0")}</small></div>${error?`<p class="field-error" role="alert">${escapeHtml(s.error||"The update could not be verified.")}</p>`:""}${v9Note("Updates never replace an active question.","Local readiness and future purchase rights are separate.","shield")}`,secondary(busy?"Preparing…":error?"Retry content update":"Check content update",error?"retry-question-pack":"prepare-question-pack",busy?" disabled":"")+primary("Back to my collection","question-pack-back"),"question-pack-back");
  }
  function v9Run(state) {
    const history=state.history||[],summary=state.runSummary||{},today=state.todaySummary||{};
    const body=`<div class="page-heading"><h1>Your Run</h1><p>One morning at a time.</p></div>${!history.length?`<div class="v9-empty">${crew(state,"welcome",150,"run-empty")}<h2>Your first curtain call is waiting.</h2><p>Completed scheduled challenges appear here. Practice stays separate.</p>${primary("Set my next alarm","new-alarm")}</div>`:`<div class="v9-run-hero"><span class="eyebrow">COMPLETED CHALLENGES</span><div><strong>${summary.total||history.length}</strong>${crew(state,"correct",100,"run-record")}</div><p>Your local record. Not a measure of waking up.</p></div><div class="v9-run-secondary"><div><strong>${summary.firstTryRate||0}%</strong><span>No wrong answers</span></div><div><strong>${summary.streak||0}</strong><span>Day streak</span></div></div><div class="section-heading"><h2>Recent mornings</h2></div><div class="run-history-card">${history.slice(-5).reverse().map(item=>`<div class="run-history-row"><span class="history-dot">${icon("check")}</span><span><strong>${new Intl.DateTimeFormat(state.language==="zh-CN"?"zh-CN":"en-US",{month:"short",day:"numeric"}).format(new Date(item.at))}</strong><small>${escapeHtml(item.difficulty||"Gentle")} · ${item.mistakes?`${item.mistakes} retries`:"No wrong answers"}</small></span><b>${item.seconds}s</b></div>`).join("")}</div>`}${v9Group("Today",v9Setting("Today’s results",`${today.completed||0} completed · ${today.confirmed||0} checks confirmed`,"","open-results","run"))}<details class="v9-disclosure"><summary>${icon("shield")}<span>What these results mean</span>${icon("chevron")}</summary><p>A completed challenge records correct answers. A Wake-up Check records your own confirmation. Neither proves you got out of bed.</p>${textButton("Review local events","open-diagnostics")}</details>`;
    return `<section class="screen v9-screen" data-screen-id="12">${ambient("gold")}${status(state)}<div class="screen-body run-body v9-run">${body}</div>${bottomNav("run")}</section>`;
  }
  function v9Results(state) {
    const today=state.todaySummary||{},events=(state.eventLog||[]).filter(e=>e.at&&new Date(e.at).toDateString()===new Date(state.now||Date.now()).toDateString()).slice(-12).reverse();
    return v9Page("44",state,"Today’s results",`<div class="v9-results-lead"><span>Challenges completed</span><strong>${today.completed||0}</strong><small>${today.confirmed||0} Wake-up Checks confirmed</small></div><div class="v9-result-metrics">${[["triggered","Triggered"],["missed","Marked missed"],["emergency","Emergency exits"],["interrupted","Interrupted"]].map(([k,t])=>`<span><b>${today[k]||0}</b>${t}</span>`).join("")}</div><h2 class="v9-section-title">Today’s timeline</h2>${events.length?`<ol class="event-list">${events.map(e=>`<li><strong>${escapeHtml(String(e.type||e.event||"Event").replaceAll("_"," "))}</strong><span>${new Intl.DateTimeFormat(state.language==="zh-CN"?"zh-CN":"en-US",{hour:"numeric",minute:"2-digit"}).format(new Date(e.at))}</span></li>`).join("")}</ol>`:'<div class="empty-message">No formal events yet today. Practice is not included.</div>'}${v9Note("Each result has a different meaning.","Completed means answers finished. Confirmed means you activated the Wake-up Check.","run")}`,primary("Back","detail-back"),"detail-back");
  }
  function v9Complete(state) {
    const r=state.lastResult,total=r?.totalQuestions||taskProgress(state).total,done=r?.correctQuestions??total,test=state.sessionKind==="test"||r?.kind==="test"||state.sessionKind==="check-preview";
    return `<section class="screen v9-screen" data-screen-id="07">${ambient("gold")}${status(state)}<div class="screen-body screen-body--center v9-complete"><span class="eyebrow">${test?"PRACTICE COMPLETE":"ALARM DISMISSED"}</span>${crew(state,"bravo",154,"bravo")}<h1 class="v9-result-title">Bravo.</h1><p class="v9-complete-copy">${done} of ${total} questions complete</p>${test?v9Note("Your real record stays unchanged.","Practice does not schedule a Wake-up Check."):state.alarm.check?v9Note(`Wake-up Check in ${state.alarm.checkDelay||5} minutes`,"Scheduled from completion. Your alarm is quiet now.","clock"):v9Note("Your alarm is quiet now.","Your challenge is complete.","check")}<div class="button-stack">${primary(test?"Finish practice":"Take a bow","take-bow")}${!test&&state.alarm.check?textButton("Preview Wake-up Check","preview-check"):""}</div></div></section>`;
  }
  function v9Future(state,id="11") {
    const title=id==="40"?"Future themes":id==="35"?"Purchase information":"Future collections",back=id==="40"?"future-theme-back":"close-pass";
    return v9Page(id,state,title,`<div class="v9-inline-intro"><div><span class="eyebrow">A FUTURE SEASON</span><h2>A little more to look forward to.</h2></div>${crew(state,"cue",90,"future")}</div><p class="v9-lead">Your core alarm, safety features and two official themes stay free.</p><div class="v9-future-list">${[["sound","Original sounds","Cinematic mornings and quiet nature."],["palette","More stage themes","New colours and atmospheres."],["globe","Knowledge collections","World geography, history and future topics."]].map(([kind,name,copy])=>`<div>${settingIcon(kind)}<span><strong>${name}</strong><small>${copy}</small></span><em>Planned</em></div>`).join("")}</div>${v9Note("Nothing is for sale here.","No checkout or store account is connected. Purchase and restore options will appear when available.")}`,primary(id==="40"?"Back to my themes":"Back to where I was",back),back);
  }
  function v9Theme(state,onboarding=false) {
    const id=onboarding?"37":"38",selected=themeInfo(state,state.pendingThemeId||state.themeId||"daybreak");
    return v9Page(id,state,onboarding?"Set the scene":"Theme Studio",`<div class="v9-inline-intro"><div><h2>Two free stages.<br>One little morning crew.</h2><p>Choose a mood. Your alarm stays yours.</p></div></div><div class="theme-gallery v9-theme-gallery">${themeChoice(state,"daybreak")}${themeChoice(state,"velvet")}</div>${!onboarding?textButton("Future theme collections","open-future-themes"):""}`,primary(onboarding?"Choose my challenge":`Use ${escapeHtml(selected.name)}`,onboarding?"confirm-theme":"apply-theme"),"theme-back");
  }
  function v9Topic(state) {
    const selected=state.alarm.questionTopic||"everyday";
    return v9Page("26",state,"Final question",`<p class="v9-lead">Choose a subject. Keep the same question count.</p><div class="v8-topic-options" role="group" aria-label="Final question topic">${["everyday","geography","history"].map(id=>optionCard(topicName(id),id==="everyday"?"Arithmetic or a life riddle, based on intensity.":"Local sample questions · Demo access",selected===id,"select-question-topic",id)).join("")}</div>${planCard(state.alarm)}${secondary("Explore the Question Library","open-question-library")}`,primary("Done","settings-back"));
  }

  // 10.0 keeps the approved optical dock and stable layout; only local state moves.
  function v10Page(id,state,title,body,actions="",back="settings-back") {
    return v9Page(id,state,title,body,actions,back).replace('class="screen ', 'class="screen v10-screen ');
  }
  function v10HasAccess(state,sku) { return Boolean(state.purchasedProductIds?.includes?.(sku)); }
  function v10TopicTitle(state,id) { return localPacks(state).find(p=>p.id===id)?.title||topicName(id); }
  function v10Label(title,subtitle="") {return `<div class="v10-section-label"><h2>${title}</h2>${subtitle?`<span>${subtitle}</span>`:""}</div>`;}
  function v10Home(state) {
    const next=state.nextAlarm,now=new Date(state.now||Date.now()),display=next?occurrenceDisplay(next):null;
    const date=new Intl.DateTimeFormat(state.language==="zh-CN"?"zh-CN":"en-US",{month:"short",day:"numeric",weekday:"long"}).format(now);
    const head=`<div class="v5-topline"><div><span class="v5-date">${date}</span><h1 class="v5-greeting">Your morning, your stage.</h1></div><button class="quiet-action" type="button" data-action="new-alarm" aria-label="Add alarm">${icon("plus")}</button></div>`;
    const nextCard=next?`<article class="v9-next-card v10-next-card"><button class="v10-next-content" type="button" data-action="edit-alarm" data-id="${escapeHtml(next.alarm.id)}"><span class="eyebrow">NEXT ALARM</span><strong class="v9-next-time">${display.time}<small>${display.period}</small></strong><span class="v9-next-date">${display.dateLabel||next.dayLabel}</span><span class="v9-next-countdown">${icon("clock")}<span>${next.countdown}</span></span></button>${crew(state,"welcome",112,"home-next")}${daylightAdjustment(display)}</article>`:"";
    return `<section class="screen v9-screen v10-screen" data-screen-id="01">${ambient("rose")}${status(state)}<div class="screen-body home-body v9-home v10-home">${head}${state.persistenceError?`<div class="field-error" role="alert">${escapeHtml(state.persistenceError)}</div>`:""}${nextCard}${v10Label("My alarms",String(state.alarms.length))}<div class="alarm-list">${state.alarms.length?state.alarms.map(a=>alarmCard(a,state)).join(""):`<div class="v9-empty">${crew(state,"welcome",164,"home-empty")}<span class="eyebrow">YOUR FIRST ENTRANCE</span><h2>A morning to make your own.</h2><p>Choose a time, a sound and a small challenge.</p>${primary("Create my first alarm","new-alarm")}</div>`}</div></div>${bottomNav("home")}</section>`;
  }
  function v10Wheel(part,value,count) {
    const title=part==="hour"?"Hours":"Minutes",index=Number(value)||0;
    return `<div class="v10-wheel-column"><span class="v10-wheel-label">${title}</span><button class="v10-wheel-step" type="button" data-action="step-time" data-part="${part}" data-step="-1" aria-label="${part==="hour"?"Previous hour":"Previous minute"}">${icon("back")}</button><div class="v10-wheel" data-time-wheel="${part}" role="listbox" aria-label="${title}" tabindex="0">${Array.from({length:count},(_,n)=>`<button type="button" class="v10-wheel-value${n===index?" is-selected":""}" data-time-value="${n}" data-action="set-time-part" data-part="${part}" data-value="${n}" role="option" aria-selected="${n===index}" tabindex="-1">${String(n).padStart(2,"0")}</button>`).join("")}</div><button class="v10-wheel-step v10-wheel-step--down" type="button" data-action="step-time" data-part="${part}" data-step="1" aria-label="${part==="hour"?"Next hour":"Next minute"}">${icon("back")}</button></div>`;
  }
  function v10Volume(state,id) {
    const sound=soundById(state.soundId||state.alarm?.soundId),playing=state.previewingSound===sound.id;
    return `<div class="v10-volume-block"><label class="volume-control" for="${id}"><span>Sound level</span><output data-volume-output="${id}">${state.masterVolume}%</output><input id="${id}" type="range" min="25" max="100" step="1" value="${state.masterVolume}"></label><div class="v10-volume-caption">${icon("sound")}<span>Drag to hear a 6-second preview.</span>${wave(playing)}</div><p class="inline-help">Your device volume is separate.</p></div>`;
  }

  function v10Editor(state) {
    const a=state.alarm,once=a.repeatMode==="once",selected=soundById(state.soundId),error=state.editorErrorField||"",parts=String(a.time||"06:30").split(":"),dayNames=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],dayIds=[1,2,3,4,5,6,0];
    const header=`<div class="screen-head sticky-head" data-slot="toolbar"><button class="toolbar-button toolbar-button--quiet" type="button" data-action="go-home">${icon("close")}<span>Cancel</span></button><h1>${state.editorMode==="edit"?"Edit Alarm":"New Alarm"}</h1><button class="toolbar-button toolbar-button--accent save-link" type="button" data-action="save-alarm">${icon("check")}<span>Save</span></button></div>`;
    const time=`<div class="v10-time-picker" role="group" aria-label="Alarm time"><input id="alarm-time" type="hidden" value="${escapeHtml(a.time)}"><div class="v10-time-heading"><span>Alarm time</span><span>24-hour clock</span></div><div class="v10-wheels"><i class="v10-wheel-focus" aria-hidden="true"></i>${v10Wheel("hour",parts[0],24)}<span class="v10-wheel-colon" aria-hidden="true">:</span>${v10Wheel("minute",parts[1],60)}</div></div>${fieldError(state,"time")}`;
    const repeat=`<fieldset class="repeat-field v9-repeat v10-repeat"><legend>Repeat</legend><div class="segment repeat-segment" role="group" aria-label="Alarm frequency">${[["once","Just once"],["weekly","Repeat weekly"]].map(([value,title])=>`<button type="button" data-action="set-repeat-mode" data-value="${value}" aria-pressed="${(once?"once":"weekly")===value}" class="${(once?"once":"weekly")===value?"is-on":""}">${title}</button>`).join("")}</div>${once?'<p class="v10-once-note">Rings at the next occurrence of this time, then turns off.</p>':`<div class="days v9-days" id="repeat-days" role="group" tabindex="-1" aria-label="Repeat days">${dayIds.map((day,i)=>`<button class="day${a.days.includes(day)?" is-on":""}" type="button" data-action="toggle-day" data-index="${day}" aria-label="${dayNames[i]}" aria-pressed="${a.days.includes(day)}">${state.language==="zh-CN"?["一","二","三","四","五","六","日"][i]:dayNames[i].slice(0,1)}</button>`).join("")}</div><div class="v10-day-presets">${[["weekdays","Weekdays"],["weekends","Weekends"],["everyday","Every day"]].map(([value,label])=>`<button type="button" data-action="set-day-preset" data-value="${value}">${label}</button>`).join("")}</div>${fieldError(state,"days")}`}</fieldset>`;
    const plan=`<div class="v9-editor-plan">${v10Label("Your wake-up")}<div class="segment v9-level-segment" role="group" aria-label="Wake-up intensity">${["Gentle","Classic","Diva"].map((value,i)=>`<button type="button" data-action="set-difficulty" data-value="${value}" aria-pressed="${a.difficulty===value}" class="${a.difficulty===value?"is-on":""}"><b>${i+1}</b><span>${value}</span></button>`).join("")}</div><div class="v9-plan-summary"><strong>${escapeHtml(taskSummary(a).label)}</strong><span>${escapeHtml(taskSummary(a).composition)}</span></div><div class="settings-card settings-card--links">${v9Setting("Final question topic","Same question count. A different curiosity.",escapeHtml(v10TopicTitle(state,a.questionTopic||"everyday")),"open-question-library","book")}${v9Setting("Alarm sound",selected.mood,selected.name,"open-editor-sounds","sound")}<div class="settings-row"><span><strong>Wake-up Check</strong><small>Confirm again after ${a.checkDelay||5} minutes</small></span>${toggle("toggle-check",a.check,"Wake-up check")}</div></div></div>`;
    const extras=`<details class="v9-disclosure" data-expand-key="alarm-name"${error==="label"?" open":""}><summary>${icon("bell")}<span>Alarm name</span><b data-i18n-ignore>${escapeHtml(a.label)}</b>${icon("chevron")}</summary><label class="alarm-label-field" for="alarm-label"><span class="field-label">Alarm name</span><input id="alarm-label" type="text" maxlength="32" value="${escapeHtml(a.label)}" placeholder="Morning Show" autocomplete="off"></label>${fieldError(state,"label")}</details><details class="v9-disclosure" data-expand-key="alarm-sound-options"><summary>${icon("volume")}<span>Sound options</span><b>${state.masterVolume}%</b>${icon("chevron")}</summary>${v10Volume(state,"max-volume")}<div class="settings-row"><span>Rising volume</span>${toggle("toggle-rising",a.rising,"Rising volume")}</div><div class="settings-row"><span>Quieter after each act</span>${toggle("toggle-quieter",a.quieter,"Quieter after each act")}</div></details>${state.editorMode==="edit"?'<div class="editor-actions"><button class="text-button text-button--danger" type="button" data-action="delete-alarm">Delete alarm</button></div>':""}`;
    return `<section class="screen v9-screen v10-screen" data-screen-id="02">${ambient("gold")}${status(state)}<div class="screen-body editor-body v9-editor v10-editor">${header}${state.editorError?`<div class="form-error error-summary" id="editor-error-summary" tabindex="-1" role="alert"><strong>Check this setting</strong><span>${escapeHtml(state.editorError)}</span></div>`:""}${time}${repeat}${plan}${v8Legacy(state)}${extras}</div></section>`;
  }
  function v10SoundRow(p,state,compact=false,onboarding=false) {
    const selected=state.soundId===p.id,playing=state.previewingSound===p.id,unlocked=!p.premium||v10HasAccess(state,`sound:${p.id}`),choose=onboarding?"select-onboarding-sound":"select-sound";
    return `<article class="v10-sound-row${compact?" is-compact":""}${selected?" is-selected":""}${playing?" is-playing":""}" data-sound-row="${p.id}"><button class="v10-sound-main" type="button" data-action="${unlocked?choose:"open-product"}" ${unlocked?`data-sound="${p.id}" aria-pressed="${selected}"`:`data-product="sound:${p.id}"`}>${v9SoundArt(p,playing)}<span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.mood)}</small><em>${selected?"Selected":p.premium?"Member collection":"Included · free"}</em></span>${selected?`<i class="v10-selected-mark">${icon("check")}</i>`:""}</button><button class="v10-sound-play" type="button" data-action="${playing?"stop-preview":"preview-sound"}" data-sound="${p.id}" aria-label="${playing?"Stop":"Preview"} ${escapeHtml(p.name)}">${playing?wave(true):icon("play")}<span>${playing?"Stop":unlocked?"Listen":"6 sec"}</span></button></article>`;
  }
  function v10SoundCollection(state,compact=false,onboarding=false) {
    const free=soundPresets.filter(p=>!p.premium),paid=soundPresets.filter(p=>p.premium),row=p=>v10SoundRow(p,state,compact,onboarding);
    return `${v10Label("Your included sounds","6 free sounds")}<div class="v10-sound-list">${free.map(row).join("")}</div>${v10Label("A little more atmosphere","Member collection")}<p class="v10-section-copy">A new soundtrack for your morning. Listen to 6 seconds before you decide.</p><div class="v10-sound-list">${paid.slice(0,2).map(row).join("")}</div><details class="v10-expand" data-expand-key="${compact?"compact":"theatre"}-paid-sounds"><summary><span>Explore all 6 premium sounds</span>${icon("chevron")}</summary><div class="v10-sound-list">${paid.slice(2).map(row).join("")}</div></details>`;
  }
  function v10Sounds(state) {
    const compact=state.soundReturnScreen==="02",selected=soundById(state.soundId);
    const intro=compact?'<p class="v9-lead">A small soundtrack for your first moment.</p>':`<div class="v10-theatre-heading"><span class="eyebrow">THE SOUND THEATRE</span><h2>Give the morning<br>its own atmosphere.</h2><div class="v10-theatre-score" aria-hidden="true">${wave(Boolean(state.previewingSound))}${icon("sound")}</div></div>`;
    return v10Page("10",state,compact?"Alarm sound":"Sound Theatre",`${intro}${v10SoundCollection(state,compact)}${v9Note("Listen first. Choose your favourite.","Only applying a sound changes your alarm.","sound")}<div class="selected-sound-bar"><div><span>Selected</span><strong>${escapeHtml(selected.name)}</strong></div>${primary("Use this sound","confirm-sound")}</div>`,"","confirm-sound");
  }
  function v10Teaching(state) {
    if(state.rehearsalMode!=="sound")return screen18(state);
    const body=`<div class="v10-teaching-intro"><span class="eyebrow">YOUR SOUND CHECK</span><h2>Find your morning note.</h2><p>Listen on the speaker or headphones you will use.</p></div>${v10Volume(state,"rehearsal-volume")}${v10SoundCollection(state,true,true)}`;
    return v10Page("18",state,"Sound check",body,secondary(state.soundCheckConfirmed?"Sound confirmed":"I heard it","confirm-sound-check",state.audioStatus?.engineReady?"":" disabled")+primary("Try the teaching examples","rehearsal-sound-continue")+textButton("Finish later","skip-tutorial"),"skip-tutorial");
  }

  function v10Settings(state) {
    const d=state.defaults||state.alarm,theme=themeInfo(state,state.themeId||"daybreak");
    const library=`<button type="button" class="v10-library-entry" data-action="open-question-library"><span class="v10-library-art" aria-hidden="true">${icon("book")}<i>${icon("star")}</i></span><span><strong>Alarm question library</strong><small>A little curiosity with every curtain call.</small></span>${icon("chevron")}</button>`;
    const body=`<div class="page-heading"><h1>Settings</h1></div>${library}${v9Group("Make it yours",v9Setting("Theme Studio","Two free stages. More characters to meet.",theme.name,"open-theme-studio","palette")+v9Setting("Language","Applies to this app",state.language==="en"?"English":"简体中文","open-language","language")+v9Setting("Your morning crew","Character and motion preferences","","open-character-settings","star"))}${v9Group("New alarm defaults",v9Setting("Wake-up intensity","Existing alarms stay unchanged",d.difficulty,"open-difficulty","math")+v9Setting("Wake-up Check","Confirm after a completed challenge",d.check?`${d.checkDelay||5} minutes`:"Off","open-check-settings","clock"))}${v9Group("Sound & touch",v9Setting("Sound Theatre","Six free sounds and new atmospheres",soundById(d.soundId||state.soundId).name,"open-sounds","sound")+v9Setting("Sound level","Listen as you adjust",`${state.masterVolume}%`,"open-volume-settings","volume")+v9Setting("Haptics","A little feedback at the right moment",state.haptics?"On":"Off","open-haptic-settings","haptics"))}${v9Group("A quieter stage",v9Setting("Explore Drama Plus","Membership preview · store not connected","","open-product","pass",' data-product="ad-free"'))}${v9Group("Care & support",v9Setting("Sound check & teaching","Get to know your morning routine","","start-tutorial","play")+v9Setting("Help & reliability","Sound, permissions and safe exits","","open-help","shield")+v9Setting("Privacy & local data","Your alarms stay on this device","","open-privacy","access"))}<div class="v9-settings-footer"><span>Drama Alarm · 10.0</span><small>A small act. A brighter morning.</small></div>`;
    return `<section class="screen v9-screen v10-screen" data-screen-id="14">${ambient("rose")}${status(state)}<div class="screen-body settings-body v9-settings v10-settings">${body}</div>${bottomNav("settings")}</section>`;
  }
  function v10PackCard(p,state) {
    const paid=p.premium||p.free===false,selected=(state.alarm?.questionTopic||"everyday")===p.id;
    return `<button type="button" class="v10-pack-row${selected?" is-selected":""}" data-action="open-question-pack" data-pack="${p.id}"><span class="v9-pack-art v10-pack-art v9-pack-art--${p.category||p.id}">${icon(packIcon(p.category||p.id))}<i></i></span><span><strong>${escapeHtml(p.title||p.name)}</strong><small>${p.questionCount??p.count??0} questions${p.id==="everyday"?" + arithmetic":""}</small><em>${selected?"Selected":paid?"Member collection":"Included · free"}</em></span>${icon("chevron")}</button>`;
  }
  function v10Library(state,id="46") {
    const packs=localPacks(state).filter(p=>p.available!==false),free=packs.filter(p=>p.free===true||["everyday","geography","history"].includes(p.id)),paid=packs.filter(p=>!free.includes(p));
    const groups=[{title:"Arithmetic & logic",ids:["quick-math","number-logic"]},{title:"World Geography",ids:["europe","us-geography","world-landmarks"]},{title:"World History",ids:["us-history","biography"]}];
    const body=`<div class="v9-inline-intro"><div><span class="eyebrow">WAKE UP CURIOUS</span><h2>A small question.<br>A wider world.</h2></div>${crew(state,"cue",94,"question-library")}</div><p class="v9-lead">Difficulty sets the effort. A topic changes only the final question.</p>${v10Label("Included in every morning","3 free collections")}<div class="v10-pack-list">${free.map(p=>v10PackCard(p,state)).join("")}</div>${v10Label("Follow your curiosity","Member collections")}<div class="v10-pack-groups">${groups.map((group,i)=>{const items=paid.filter(p=>group.ids.includes(p.id));return items.length?`<details class="v9-disclosure" data-expand-key="library-${i}" open><summary>${icon(i===0?"math":i===1?"globe":"book")}<span>${group.title}</span><b>${items.length}</b>${icon("chevron")}</summary><div class="v10-pack-list">${items.map(p=>v10PackCard(p,state)).join("")}</div></details>`:"";}).join("")}</div>${v9Note("Ready before your alarm rings.","Downloaded questions run locally. An active question never changes during an update.","download")}`;
    return v10Page(id,state,"Alarm question library",body,"",id==="26"?"settings-back":"question-library-back");
  }
  function v10Pack(state) {
    const p=selectedPack(state),paid=p.premium||p.free===false,sku=`pack:${p.id}`,unlocked=!paid||v10HasAccess(state,sku),count=p.questionCount??p.count??0,edit=state.editorOpen||state.libraryReturnScreen==="02"||state.settingScope==="editor";
    const scopes=Array.isArray(p.scope)?p.scope:Array.isArray(p.tags)?p.tags:[p.description||"A small discovery before breakfast."];
    const body=`<div class="v10-pack-cover"><div class="v9-pack-art v10-pack-art v9-pack-art--${p.category||p.id}">${icon(packIcon(p.category||p.id))}<i></i></div><span class="eyebrow">${paid?"A NEW CURIOSITY":"INCLUDED · FREE"}</span><h2>${escapeHtml(p.title||topicName(p.id))}</h2><p>${escapeHtml(p.description||"A small discovery before breakfast.")}</p></div><div class="v10-pack-inventory"><strong>${count}</strong><span>questions<small>${p.id==="everyday"?"Plus generated arithmetic":"Saved locally for your alarm"}</small></span></div>${v10Label("What is inside")}<ul class="v10-scope-list">${scopes.map(s=>`<li>${icon("check")}<span>${escapeHtml(s)}</span></li>`).join("")}</ul>${v9Note("A topic, not an extra task.","This replaces the final question. Your 1, 2 or 3 question plan stays the same.","riddle")}<div class="v10-product-terms"><span>${paid?"Member collection":"Always free"}</span><small>Question content is not shown in the store.</small></div>`;
    return v10Page("47",state,p.title||topicName(p.id),body,unlocked?primary(edit?"Use for this alarm":"Use for new alarms","select-question-topic",` data-value="${p.id}"`):primary("View collection purchase","open-product",` data-product="${sku}"`),"question-pack-back");
  }
  function v10ThemeCard(state,id) {
    const theme=themeInfo(state,id),paid=theme.premium||theme.free===false||["lunar","amber"].includes(id),selected=(state.pendingThemeId||state.themeId||"daybreak")===id,unlocked=!paid||v10HasAccess(state,`theme:${id}`);
    return `<article class="v10-theme-card${selected?" is-selected":""}"><button type="button" class="v10-theme-select" data-action="${unlocked?"select-theme":"open-product"}" ${unlocked?`data-theme="${id}" aria-pressed="${selected}"`:`data-product="theme:${id}"`}>${themeArtwork(id,true)}<span class="v10-theme-meta"><strong>${escapeHtml(theme.name)}</strong><small>${escapeHtml(theme.subtitle||theme.description||"")}</small><em>${selected?"Selected":paid?"Member collection":"Official · free"}</em></span>${selected?`<i class="v10-selected-mark">${icon("check")}</i>`:""}</button><button class="v10-theme-preview" type="button" data-action="preview-theme" data-theme="${id}">Explore this stage ${icon("arrow")}</button></article>`;
  }
  function v10ThemesPage(state,onboarding=false,id=onboarding?"37":"38") {
    const selected=themeInfo(state,state.pendingThemeId||state.themeId||"daybreak");
    const body=`<div class="v10-theme-intro"><span class="eyebrow">YOUR LITTLE WORLD</span><h2>Choose the mood.<br>Meet your morning crew.</h2><p>Same little acts. A stage that feels like you.</p></div>${v10Label("Your official free stages")}<div class="v10-theme-grid">${v10ThemeCard(state,"daybreak")}${v10ThemeCard(state,"velvet")}</div><details class="v10-expand v10-theme-expansion" data-expand-key="premium-themes"><summary><span>${icon("star")} Meet two more stages</span><b>Plus</b>${icon("chevron")}</summary><div class="v10-theme-grid">${v10ThemeCard(state,"lunar")}${v10ThemeCard(state,"amber")}</div><p class="inline-help">Each stage includes its own little companion.</p></details><p class="v10-theme-footnote">Two official themes stay free. New stages will join the cast over time.</p>`;
    return v10Page(id,state,onboarding?"Set the scene":"Theme Studio",body,primary(onboarding?"Choose my challenge":`Use ${escapeHtml(selected.name)}`,onboarding?"confirm-theme":"apply-theme"),id==="40"?"future-theme-back":"theme-back");
  }
  function v10ThemePreview(state) {
    const id=state.themePreviewId||state.pendingThemeId||state.themeId||"daybreak",theme=themeInfo(state,id),paid=["lunar","amber"].includes(id),unlocked=!paid||v10HasAccess(state,`theme:${id}`);
    return v10Page("39",state,"Theme Preview",`<div class="v10-theme-preview-hero"><span class="eyebrow">${paid?"A NEW STAGE":"OFFICIAL · FREE"}</span><h2>${escapeHtml(theme.name)}</h2><p>${escapeHtml(theme.description||theme.subtitle)}</p>${themeArtwork(id,false)}</div><div class="v10-theme-preview-swatches" data-preview-theme="${id}" aria-hidden="true"><i></i><i></i><i></i><i></i></div><p class="v9-lead">A preview of your stage. Alarm settings and results stay as they are.</p>`,unlocked?primary(`Use ${escapeHtml(theme.name)}`,"apply-theme"):primary("View theme purchase","open-product",` data-product="theme:${id}"`),"cancel-theme-preview");
  }

  function v10AdFree(state) {
    return v10Page("52",state,"A quieter stage",`<div class="v10-offer-hero"><span class="v10-offer-medallion">${icon("pass")}</span><span class="eyebrow">YOUR MORNING, UNINTERRUPTED</span><h2>Keep the spotlight<br>on your morning.</h2><p>An ad-free stage, for good.</p>${crew(state,"welcome",132,"adfree")}</div><ul class="v10-benefits"><li>${icon("check")}<span>Remove advertising permanently</span></li><li>${icon("check")}<span>One payment. No subscription.</span></li><li>${icon("check")}<span>Your core alarm always stays free</span></li></ul><div class="v10-price"><strong>US$2.99</strong><span>one-time purchase</span></div><p class="v10-commerce-note">Purchases are not connected in this build. You can continue free. Sounds, themes and question packs are separate.</p>`,primary("View ad-free purchase","open-product",' data-product="ad-free"')+secondary("Continue free","continue-free"),"theme-back");
  }
  function v10Product(state,id="53") {
    const p=state.purchaseProduct||{id:"ad-free",type:"ad-free",name:"Explore Drama Plus",description:"Remove advertising permanently. One payment, no subscription.",price:2.99},sku=p.id||"ad-free",type=p.type||sku.split(":")[0],itemId=p.itemId||sku.split(":")[1],kind=type==="sound"?"sound":type==="theme"?"palette":type==="pack"?"book":"pass",price=Number(p.priceUSD||p.price)||(type==="ad-free"?2.99:1.99);
    const illustration=type==="theme"?themeArtwork(itemId,false):type==="sound"?v9SoundArt(soundById(itemId),false):`<span class="v10-offer-medallion">${icon(kind)}</span>`;
    const terms=type==="sound"?"A complete 30-second sound. Preview access is limited to 6 seconds.":type==="theme"?"Includes the full stage and its own animated morning companion.":type==="pack"?"A collection for your final question. Question count and difficulty stay separate.":"Ad removal only. Sounds, themes and question packs are sold separately.";
    return v10Page(id,state,"Purchase details",`<div class="v10-product-hero">${illustration}<span class="eyebrow">ONE-TIME PURCHASE</span><h2>${escapeHtml(p.name||"A new morning detail")}</h2><p>${escapeHtml(p.description||terms)}</p></div><div class="v10-price"><strong>US$${price.toFixed(2)}</strong><span>No subscription</span></div>${v9Note("Purchases are not available in this build.","No payment will be taken. Store checkout and restore will be available in a connected release.","shield")}<p class="v9-lead">${terms}</p>`,primary("Check purchase availability","purchase-product")+secondary("Not now","purchase-back"),"purchase-back");
  }
  function v10VolumePage(state) {
    const a=state.alarm;
    return v10Page("27",state,"Sound level",`<div class="v10-volume-hero">${icon("volume")}<output class="volume-display" data-volume-output="strategy-volume">${state.masterVolume}%</output><span>Find a comfortable first note.</span></div>${v10Volume(state,"strategy-volume")}<div class="settings-card setting-detail-card"><div class="settings-row"><span><strong>Rising volume</strong><small>Starts gently, then rises to your limit over 30 seconds.</small></span>${toggle("toggle-rising",a.rising,"Rising volume")}</div><div class="settings-row"><span><strong>Quieter after each act</strong><small>Sound softens as you make progress.</small></span>${toggle("toggle-quieter",a.quieter,"Quieter after each act")}</div></div>${v9Note("Listen on your usual speaker.","App sound level is separate from your device volume. Check both before relying on an alarm.","sound")}`,primary("Done","settings-back"));
  }
  function v10Help(state) {
    const c=(zh,en)=>state.language==='en'?en:zh;
    const native=Boolean(window.DramaAndroidHost?.available);
    const sections=[
      [c('闹钟能力','Alarm delivery'),native?c('Android系统负责调度。请检查闹钟、通知及全屏权限，实际响铃受系统音量、设备电池策略和强行停止状态影响。','Android schedules alarms. Review precise alarm, notification and full-screen access. System volume, battery settings and force-stop affect delivery.'):c('当前为网页提醒，需保持页面打开。网页在后台、锁屏、关闭或设备关机时的调度和声音不能保证。允许通知不能使网页成为系统闹钟。','This browser reminder needs the page to remain available. Background, locked, closed-page or powered-off delivery and sound are not guaranteed. Notification access does not create a system alarm.')],
      [c('任务与记录','Challenges and records'),c('轻松1题、标准2题、挑战3题。兴趣只替换末题。完成只表示答题结束，复查只记录本人确认，均不判断健康状况或证明已经起床。','Gentle has 1 question, Classic 2 and Diva 3. A topic replaces the final question. Completion records answers and a Wake-up Check records your confirmation. Neither measures health nor proves you left bed.')],
      [c('随时停止','Stop whenever you need'),c('在任务或复查中点按Emergency，确认即可立即停铃并取消本次复查。无等待、次数限制、广告或收费。','Choose Emergency in a challenge or check, then confirm to stop immediately and cancel its follow-up. There is no waiting, use limit, advertisement or fee.')],
      [c('声音检查','Sound check'),c('应用音量与系统音量分别设置。连接耳机、蓝牙或重新打开网页后，请检查实际播放设备。需要时点按恢复声音。','App gain and system volume are separate. Check the actual output after connecting headphones, Bluetooth or reopening the page. Choose Resume alarm sound when required.')],
      [c('会员与购买','Membership and purchases'),c('当前提供会员方案预览，商店订阅、恢复和管理尚未接入，无法购买或扣费。基础闹钟、停止及两套官方主题免费。','Membership is currently a preview. Store subscriptions, restore and management are not connected, so no purchase or charge is possible. Basic alarms, stopping and both official themes are free.')]
    ];
    return v10Page('41',state,c('帮助与可靠性','Help & reliability'),sections.map(([title,copy],i)=>`<details class="v9-disclosure" data-expand-key="help-${i}"${i===0?' open':''}><summary><span>${title}</span>${icon('chevron')}</summary><p>${copy}</p></details>`).join('')+`<div class="settings-card settings-card--links">${v9Setting(c('声音检查与玩法教学','Sound check & teaching'),'','','start-tutorial','play')}${v9Setting(c('检查设备权限','Review device access'),'','','open-access-settings','access')}${v9Setting(c('停止闹钟','Stop an alarm'),'','','open-emergency-rules','shield')}</div>`,primary(c('返回','Back'),'detail-back'),'detail-back');
  }

  function v10Privacy(state) {
    const c=(zh,en)=>state.language==='en'?en:zh;
    const sections=[
      [c('本机数据','Local data'),c('无需注册账号。闹钟时间、名称、偏好、活动任务、结果和诊断事件保存在当前浏览器或Android应用沙盒。历史保留上限为90条结果、300条发生记录、300条事件和100条复查。','No registration is required. Alarm times, labels, preferences, active tasks, results and diagnostic events are stored in this browser or Android app sandbox. History is limited to 90 results, 300 occurrences, 300 events and 100 checks.')],
      [c('网络请求与公开托管','Network and hosting'),c('题包与声音从同一站点加载，运行中的任务使用本地内容。应用没有上传闹钟名称、答案或结果的接口。访问公开网页时，托管服务会处理IP地址和请求等访问数据。','Content and sounds load from the same site and active challenges use local content. The app has no endpoint to upload alarm labels, answers or results. Public hosting processes request data such as IP addresses when this website is visited.')],
      [c('广告与商店','Advertising and store services'),c('当前没有广告、分析或支付SDK，不请求广告，也不创建或恢复真实购买。接入正式广告或支付后，数据披露与同意设置须按实际服务更新。','There is currently no advertising, analytics or payment SDK. No ads are requested and no real purchase is created or restored. Data disclosures and consent controls must reflect services connected in a future release.')],
      [c('广告偏好','Advertising preferences'),c('当前无广告请求，无需作广告选择。基础闹钟与停止功能始终不依赖个性化广告同意。','No advertising request is made in this edition, so no advertising choice is needed. Basic alarms and stopping never depend on consent to personalized advertising.')],
      [c('诊断与外部链接','Diagnostics and external links'),c('诊断只在主动分享时由本人检查并导出，默认不含闹钟名称或答案。反馈链接会打开GitHub，由该网站处理提交内容，请勿填写私人信息。','Diagnostics are reviewed and exported only when you choose to share them, and omit alarm labels and answers by default. Feedback opens GitHub, which handles submitted content. Do not include private information.')]
    ];
    const links=`<div class="compliance-links"><a href="privacy.html">${c('阅读完整隐私说明','Read the privacy notice')}</a><a href="terms.html">${c('阅读使用条款','Read the terms of use')}</a><a href="https://github.com/dodgey512-Blake/drama-alarm-mvp-pages/issues" target="_blank" rel="noopener noreferrer">${c('联系演示维护者','Contact the demo maintainer')}</a></div>`;
    return v10Page('42',state,c('隐私与本机数据','Privacy & local data'),sections.map(([title,copy],i)=>`<details class="v9-disclosure" data-expand-key="privacy-${i}"${i===0?' open':''}><summary><span>${title}</span>${icon('chevron')}</summary><p>${copy}</p></details>`).join('')+links+`<details class="v9-disclosure" data-expand-key="privacy-reset"><summary><span>${c('清除此合规版本的数据','Clear this compliance edition’s data')}</span>${icon('chevron')}</summary><p>${c('确认后清除该版本的闹钟、偏好、活动记录和下载题库，并取消该版本的原生计划。此前版本的数据独立保存。','After confirmation, clear this edition’s alarms, preferences, activity and downloaded questions and cancel its native schedules. Earlier editions use separate storage.')}</p>${secondary(c('清除本机数据','Clear local data'),'reset-demo')}</details>`,primary(c('返回','Back'),'detail-back'),'detail-back');
  }

  function v11Home(state) {
    const guide=`<div class="v11-guide-slot" data-slot="guide"><button class="v11-guide-entry" type="button" data-action="onboarding-replay">${icon("book")}<span>How to use Drama Alarm</span>${icon("chevron")}</button></div>`;
    return v10Home(state).replace(bottomNav("home"),guide+bottomNav("home"));
  }
  function v11Settings(state) {
    return v10Settings(state).replace(v9Setting("Sound check & teaching","Get to know your morning routine","","start-tutorial","play"),v9Setting("How to use Drama Alarm","Walk through your morning setup","","onboarding-replay","book")+v9Setting("Sound check & teaching","Listen and try a practice challenge","","start-tutorial","play")).replaceAll("Drama Alarm · 10.0","Drama Alarm · 11.0 Compliance");
  }
  function v11Pack(state) {
    const p=selectedPack(state),paid=p.premium||p.free===false,sku=`pack:${p.id}`,unlocked=!paid||v10HasAccess(state,sku),count=p.questionCount??p.count??0,edit=state.editorOpen||state.libraryReturnScreen==="02"||state.settingScope==="editor";
    const body=`<div class="v10-pack-cover v11-pack-cover"><div class="v9-pack-art v10-pack-art v9-pack-art--${p.category||p.id}">${icon(packIcon(p.category||p.id))}<i></i></div><span class="eyebrow">${paid?"FOLLOW YOUR CURIOSITY":"FREE COLLECTION"}</span><h2>${escapeHtml(p.title||topicName(p.id))}</h2><p>${escapeHtml(p.description||"A small discovery before breakfast.")}</p></div><div class="v10-pack-inventory"><strong>${count}</strong><span>questions</span></div>${v10Label("Your final act")}<div class="v11-pack-detail"><p>${p.id==="everyday"?"Everyday riddles, with fresh arithmetic for each morning.":"A new subject for your final question."}</p><p>Keep your chosen intensity. A topic replaces the final question.</p></div><div class="v10-product-terms"><span>${paid?"Member collection":"Always free"}</span></div>`;
    return v10Page("47",state,p.title||topicName(p.id),body,unlocked?primary(edit?"Use for this alarm":"Use for new alarms","select-question-topic",` data-value="${p.id}"`):primary("View collection purchase","open-product",` data-product="${sku}"`),"question-pack-back");
  }
  function v11AdFree(state) {
    const c=(zh,en)=>state.language==='en'?en:zh;
    const body=`<div class="v11-adfree-hero"><span class="eyebrow">DRAMA PLUS</span>${crew(state,'welcome',128,'membership')}<h2>${c('为晨间舞台，多一点选择。','More choice for your morning stage.')}</h2><p>${c('会员方案预览','Membership preview')}</p></div><div class="v11-adfree-benefits"><div>${icon('check')}<span>${c('订阅有效期内访问6首高级铃声','Access 6 premium sounds while subscribed')}</span></div><div>${icon('check')}<span>${c('访问2套高级主题和7个兴趣题包','Access 2 premium themes and 7 topic packs')}</span></div><div>${icon('check')}<span>${c('移除普通浏览页面的广告','Remove ads from ordinary browsing pages')}</span></div></div><p class="v9-lead">${c('基础闹钟、立即停止、6首免费铃声与两套官方主题永久免费。响铃与关铃流程始终无广告。','Basic alarms, immediate stopping, 6 free sounds and both official themes stay free. Ringing and stopping are always ad-free.')}</p><div class="v8-plan-card"><strong>${c('当前无法购买','Purchasing is currently unavailable')}</strong><p>${c('订阅周期和价格须由商店商品确认。本版不会扣费。','The store must confirm the subscription period and price. This edition cannot charge you.')}</p></div>`;
    return v10Page('52',state,c('会员方案','Membership'),body,primary(c('了解会员权益','Explore membership'),'open-product',' data-product="ad-free"')+secondary(c('免费继续','Continue free'),'continue-free'),'theme-back');
  }

  function v11Product(state,id='53') {
    const c=(zh,en)=>state.language==='en'?en:zh;
    const p=state.purchaseProduct||{},itemId=p.itemId||String(p.id||'').split(':')[1],type=p.type||String(p.id||'').split(':')[0];
    const selected=type==='sound'?soundById(itemId)?.name:type==='theme'?themeInfo(state,itemId)?.name:type==='pack'?v10TopicTitle(state,itemId):null;
    const body=`<div class="v10-product-hero"><span class="v10-offer-medallion">${icon('pass')}</span><span class="eyebrow">DRAMA PLUS</span><h2>${c('会员权益预览','Membership benefits')}</h2>${selected?`<p>${escapeHtml(selected)}</p>`:''}</div><div class="v8-plan-card" role="status"><strong>${c('商店订阅尚未接入','Store subscriptions are not connected')}</strong><p>${c('当前无法购买、恢复或管理真实订阅，不会扣费或解锁付费权益。','Purchasing, restoring and managing a real subscription are unavailable. No charge or paid access is created.')}</p></div><h2 class="v9-section-title">${c('订阅有效期内','While subscribed')}</h2><ul class="v10-benefits"><li>${icon('check')}<span>${c('6首高级铃声，2套高级主题，7个兴趣题包','6 premium sounds, 2 premium themes and 7 topic packs')}</span></li><li>${icon('check')}<span>${c('普通浏览页面去广告','Ad removal on ordinary browsing pages')}</span></li></ul><p class="v9-lead">${c('周期、当地价格、自动续订和试用条件须在接入商店后明确展示。本版未设置试用或自动续订。','Period, local price, automatic renewal and any trial terms must be shown when the store is connected. This edition starts no trial or automatic renewal.')}</p><p class="inline-help">${c('正式购买归属付款商店账号，可在同一平台恢复有效权益。卸载不会取消订阅，iOS和Android不自动互通。','Future purchases belong to the paying store account and valid access can be restored on that platform. Uninstalling does not cancel a subscription. iOS and Android access is not automatically shared.')}</p><div class="compliance-links"><a href="privacy.html">${c('隐私说明','Privacy notice')}</a><a href="terms.html">${c('使用条款','Terms of use')}</a></div><div class="button-stack">${secondary(c('恢复购买暂不可用','Restore is unavailable'),'restore-retry')}${secondary(c('管理订阅暂不可用','Subscription management is unavailable'),'manage-subscription')}</div>`;
    return v10Page(id,state,c('会员方案','Membership'),body,primary(c('购买暂不可用','Purchasing unavailable'),'purchase-product',' disabled aria-disabled="true"')+secondary(c('返回','Back'),'purchase-back'),'purchase-back');
  }

  function v11Polish(html,state) {
    const replacements=[
      ["Included · free","Free"],["INCLUDED · FREE","FREE COLLECTION"],
      ["Purchases are not connected in this build. You can continue free. Sounds, themes and question packs are separate.","Sounds, themes and question collections are available separately."],
      
      
      
      ["Ready before your alarm rings.","Your next small discovery."],
      ["Downloaded questions run locally. An active question never changes during an update.","Choose a collection for your final question."],
      ["Local readiness and future purchase rights are separate.","Your questions are ready for your next alarm."],
      ["local questions are available.","questions are ready."],
      ["What these results mean","About your morning record"],
      ["Review local events","View activity"],["Local event details","Activity details"],
      ["For troubleshooting on this device","Review recent alarm activity"],
      ["Reset local demo","Reset app data"],["Reset demo","Reset app data"],
      ["About this demo","About Drama Alarm"],["About the demo","About Drama Alarm"],
      ["BROWSER DEMO · 9.0","Drama Alarm · 11.0 Compliance"],["Drama Alarm · 9.0","Drama Alarm · 11.0 Compliance"],
      
    ];
    for(const [from,to]of replacements)html=html.replaceAll(from,to);
    return html;
  }

  uiCatalog.push({group:"App language · 11.0",items:[["51","Language"],["52","Ad-free introduction"],["53","Purchase details"]]});
  const shellRegistry = Object.fromEntries(uiCatalog.flatMap(group=>group.items).map(([id,title])=>[id,{id,title,kind:"detail",requiredActions:[]}]));
  const shellOverrides = {
    "01":{title:"Home",kind:"tabs",requiredActions:["new-alarm"]},
    "02":{title:"Alarm editor",kind:"editor",requiredActions:["go-home","save-alarm"]},
    "03":{title:"Showtime",kind:"challenge",requiredActions:["open-emergency"]},
    "04":{title:"Arithmetic",kind:"math",requiredActions:["open-emergency"]},
    "05":{title:"Arithmetic",kind:"challenge",requiredActions:["open-emergency"]},
    "06":{title:"The Finale",kind:"challenge",requiredActions:["open-emergency"]},
    "07":{title:"Bravo",kind:"flow"},"08":{title:"Drama Alarm",kind:"flow"},
    "09":{title:"Rehearsal complete",kind:"flow",left:"skip-tutorial",leftLabel:"Close"},
    "10":{requiredActions:["confirm-sound"]},"11":{title:"Purchase details",requiredActions:["purchase-back"]},
    "12":{title:"Your Run",kind:"tabs"},"13":{title:"Standing Ovation",kind:"challenge",requiredActions:["open-emergency"]},
    "14":{title:"Settings",kind:"tabs"},
    "15":{title:"Emergency Stop",kind:"emergency",left:"cancel-emergency",leftLabel:"Back",requiredActions:["cancel-emergency"]},
    "16":{title:"Curtain rising",kind:"transition",requiredActions:["open-emergency"]},
    "17":{title:"Notifications",kind:"flow",left:"permission-not-now",leftLabel:"Later"},
    "18":{title:"Teaching rehearsal",kind:"teaching",left:"skip-tutorial",leftLabel:"Close",requiredActions:["skip-tutorial"]},
    "19":{title:"Alarm saved",kind:"flow",left:"done-ready",leftLabel:"Done"},
    "20":{title:"The Finale",kind:"challenge",requiredActions:["open-emergency"]},
    "21":{title:"A gentler take",kind:"challenge",requiredActions:["open-emergency"]},
    "22":{title:"Wake-up Check",kind:"flow",requiredActions:["open-emergency"]},
    "23":{title:"Browser permissions",kind:"flow",left:"go-home",leftLabel:"Back"},
    "24":{requiredActions:["go-home"]},
    "25":{requiredActions:["settings-back"]},"26":{requiredActions:["settings-back"]},
    "27":{requiredActions:["settings-back"]},"28":{requiredActions:["settings-back"]},
    "29":{requiredActions:["settings-back"]},"30":{requiredActions:["settings-back"]},
    "31":{requiredActions:["open-run"]},"32":{requiredActions:["cancel-delete"]},
    "33":{requiredActions:["cancel-test"]},"34":{title:"Purchase details",requiredActions:["purchase-back"]},
    "35":{title:"Purchase details",requiredActions:["purchase-back"]},"36":{requiredActions:["settings-back"]},
    "37":{requiredActions:["theme-back"]},"38":{requiredActions:["theme-back"]},
    "39":{requiredActions:["cancel-theme-preview"]},"40":{requiredActions:["future-theme-back"]},
    "41":{requiredActions:["detail-back"]},"42":{requiredActions:["detail-back"]},
    "43":{requiredActions:["detail-back"]},"44":{requiredActions:["detail-back"]},
    "45":{title:"Your first morning",kind:"flow",left:"theme-back",requiredActions:["finish-intensity-onboarding"]},
    "46":{title:"Question Library",kind:"detail",left:"question-library-back",requiredActions:["question-library-back"]},
    "47":{title:"Question Pack",kind:"detail",left:"question-pack-back",requiredActions:["question-pack-back"]},
    "48":{title:"Sample question",kind:"detail",left:"question-pack-back",requiredActions:["question-pack-back"]},
    "49":{title:"Offline questions",kind:"detail",left:"question-pack-back",requiredActions:["question-pack-back"]},
    "50":{title:"Your morning crew",kind:"detail",left:"open-settings",requiredActions:["open-settings"]},
    "51":{title:"Language",kind:"detail",left:"open-settings",requiredActions:["open-settings","set-language"]},
    "52":{title:"A quieter stage",kind:"flow",left:"theme-back",requiredActions:["continue-free"]},
    "53":{title:"Purchase details",kind:"detail",left:"purchase-back",requiredActions:["purchase-back","purchase-product"]},
  };
  for(const [id,value] of Object.entries(shellOverrides))Object.assign(shellRegistry[id],value);
  for(const value of Object.values(shellRegistry)){Object.freeze(value.requiredActions);Object.freeze(value);}
  window.DramaAlarmShellRegistry=Object.freeze(shellRegistry);

  function renderPageToolbar(id,state) {
    const spec=shellRegistry[id] || shellRegistry["08"];
    const title=id==="18" ? state.rehearsalMode==="sound"?"Sound check":state.rehearsalMode==="riddle"?"Rehearsal · Finale":"Rehearsal · Act 1" : spec.title;
    const left=spec.left?`<button class="toolbar-button toolbar-button--quiet" type="button" data-action="${spec.left}" aria-label="${escapeHtml(spec.leftLabel || "Back")}">${icon(spec.leftLabel==="Close"?"close":"back")}<span>${escapeHtml(spec.leftLabel || "Back")}</span></button>`:'<span class="toolbar-spacer" aria-hidden="true"></span>';
    const emergency=spec.requiredActions.includes("open-emergency");
    const replay=state.onboardingReplay&&["08","37","38","39","40","45","52","53"].includes(id);
    const right=replay?`<button class="toolbar-button toolbar-button--quiet" type="button" data-action="onboarding-replay-exit"><span>End walkthrough</span></button>`:emergency?`<button class="toolbar-button toolbar-button--safety" type="button" data-action="open-emergency">${icon("shield")}<span>Emergency</span></button>`:'<span class="toolbar-spacer" aria-hidden="true"></span>';
    return `<div class="page-toolbar" data-slot="toolbar">${left}<h1>${escapeHtml(title)}</h1>${right}</div>`;
  }

  function render(screenId, state) {
    const map = { "01": screen01, "02": screen02, "03": screen03, "04": screen04, "05": screen05, "06": screen06, "07": screen07, "08": screen08, "09": screen09, "10": screen10, "11": screen11, "12": screen12, "13": screen13, "14": screen14, "15": screen15, "16": screen16, "17": screen17, "18": screen18, "19": screen19, "20": screen20, "21": screen21, "22": screen22, "23": screen23, "24": screen24, "25": screen25, "26": screen26, "27": screen27, "28": screen28, "29": screen29, "30": screen30, "31": screen31, "32": screen32, "33": screen33, "34": screen34, "35": screen35, "36": screen36, "37": screen37, "38": screen38, "39": screen39, "40": screen40, "41": screen41, "42": screen42, "43": screen43, "44": screen44 };
    const special={"02":v8Editor,"25":s=>v8Intensity(s,false),"26":v8Topic,"45":s=>v8Intensity(s,true),"46":v8Library,"47":v8Pack,"48":v8Sample,"49":v8Offline,"50":v8Character};
    const current={"01":v10Home,"02":v10Editor,"07":v9Complete,"10":v10Sounds,"11":s=>v10Product(s,"11"),"12":v9Run,"14":v10Settings,"18":v10Teaching,"25":s=>v9Intensity(s,false),"26":s=>v10Library(s,"26"),"27":v10VolumePage,"34":s=>v10Product(s,"34"),"35":s=>v10Product(s,"35"),"37":s=>v10ThemesPage(s,true),"38":s=>v10ThemesPage(s,false),"39":v10ThemePreview,"40":s=>v10ThemesPage(s,false,"40"),"41":v10Help,"42":v10Privacy,"44":v9Results,"45":s=>v9Intensity(s,true),"46":v10Library,"47":v10Pack,"48":v10Pack,"49":v9Offline,"51":v9Language,"52":v10AdFree,"53":v10Product};
    const v11Current={"01":v11Home,"14":v11Settings,"47":v11Pack,"48":v11Pack,"52":v11AdFree,"11":s=>v11Product(s,"11"),"34":s=>v11Product(s,"34"),"35":s=>v11Product(s,"35"),"53":v11Product};
    let html = v11Current[screenId] ? v11Current[screenId](state) : current[screenId] ? current[screenId](state) : special[screenId] ? special[screenId](state) : v8Challenge(state,screenId) || (map[screenId] || screen08)(state);
    if(!current[screenId])html = v8Decorate(screenId,state,html);
    html=html.replaceAll('Drama Alarm · 8.0','Drama Alarm · 9.0').replaceAll('BROWSER DEMO · 8.0','BROWSER DEMO · 9.0').replace('<span>Version</span><strong>8.0</strong>','<span>Version</span><strong>9.0</strong>');
    if(state.reduceMotion&&!html.includes('v8-reduce-motion'))html=html.replace('class="screen','class="screen v8-reduce-motion');
    if(screenId==="32")html=html.replace(`${dayLabel(state.alarm.days)} ·`,`${escapeHtml(scheduleLabel(state.alarm))} ·`);
    if(screenId==="21"&&(state.safetyKind==="v8-switch"||state.safetyManual))html=html.replace(primary("Switch to basic arithmetic","confirm-switch-basic"),primary("Switch to basic arithmetic","confirm-switch-basic")+secondary("Keep my current question","cancel-switch-basic"));
    if(false&&screenId==="29")html=html.replace('<div class="button-stack detail-actions">',v9Note("No sustained press is required.","An accessible STOP confirmation is also always available.")+ '<div class="button-stack detail-actions">');
    if(screenId==="50"){const marker='<div class="v8-character-poses">',start=html.indexOf(marker),settings=html.indexOf('<div class="settings-card setting-detail-card">',start),end=html.indexOf('<p class="privacy-line">',settings);if(start>=0&&settings>=0&&end>=0)html=html.slice(0,start)+html.slice(settings,end)+html.slice(start,settings)+html.slice(end);}
    if(screenId==="31")html=html.replace('<div class="achievement-hero"><i class="spark spark--large"></i>',`<div class="achievement-hero v9-achievement">${crew(state,state.selectedAchievement?.earned?"bravo":"cue",116,"achievement")}`);
    if(screenId==="13")html=html.replace('<div class="rare-star"><i class="spark spark--large"></i></div>',crew(state,"cue",144,"standing-ovation"));
    if(["41","42"].includes(screenId))html=html.replace(/<div class="help-section"><h2>([\s\S]*?)<\/h2>([\s\S]*?)<\/div>/g,(_,title,body)=>`<details class="v9-disclosure"><summary><span>${title}</span>${icon("chevron")}</summary>${body}</details>`);
    if(screenId==="42")html=html.replaceAll('current v8 Demo record','current v9 Demo record').replaceAll('empty v8 marker','empty v9 marker');
    html=html.replaceAll('open-themes','open-theme-studio').replaceAll('open-riddle-setting"','open-riddle-settings"').replaceAll('open-volume-setting"','open-volume-settings"').replaceAll('open-check-setting"','open-check-settings"').replaceAll('open-haptics"','open-haptic-settings"');
    let headingCount = 0;
    html = html.replace(/<h1(\b[^>]*)>([\s\S]*?)<\/h1>/g, (match, attributes, content) => ++headingCount === 1 ? match : `<h2${attributes}>${content}</h2>`);
    if (["25", "26", "27", "28"].includes(screenId) && state.settingScope === "defaults") html = html.replace(/(<h1>[\s\S]*?<\/h1><span><\/span><\/div>)/, '$1<p class="scope-caption">New alarm defaults · existing alarms stay unchanged</p>');
    if (["04", "05", "06", "13"].includes(screenId) && state.audioResumeRequired) html = html.replace(/(<div class="screen-body[^"]*">)/, "$1" + resumeAudio(state));
    if(!html.includes('v10-screen'))html=html.replace('class="screen','class="screen v10-screen');
    return v11Polish(html,state)
      .replace(/<i class="setting-icon setting-icon--([a-z-]+)"><\/i>/g, (_, name) => settingIcon(name))
      .replace(/(type="button")( data-hold="(emergency|stand)")/g, '$1 data-action="hold-$3"$2');
  }

  function renderSceneList(active) {
    return uiCatalog.map((group) => `<section class="scene-group"><h3>${group.group}</h3><div class="scene-grid">${group.items.map(([id, name]) => `<button class="scene-jump${active === id ? " is-active" : ""}" type="button" data-action="jump-screen" data-screen="${id}"><b>${id}</b><span>${name}</span></button>`).join("")}</div></section>`).join("");
  }

  window.DramaAlarmScreens = Object.freeze({ render, renderSceneList, renderPageToolbar, renderStatus:status });
})();
