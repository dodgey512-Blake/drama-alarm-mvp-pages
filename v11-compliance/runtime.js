(function () {
  "use strict";
  // One wall-clock resolver is shared by the forecast and actual browser dispatch.
  // A nonexistent DST time moves forward by the gap; a repeated time uses the
  // first occurrence selected by Date. Travel follows the device's local zone.
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  function resolve(alarm, day) {
    const [hour, minute] = String(alarm.time || "06:30").split(":").map(Number);
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute, 0, 0);
  }
  function applicable(alarm, day) {
    return alarm.enabled && (alarm.repeatMode === "once" ? alarm.onceDate === dateKey(day) : (alarm.days || []).includes(day.getDay()));
  }
  function occurrence(alarm, day) {
    const at = resolve(alarm, day);
    return { id: `${alarm.id}@${at.getTime()}`, alarmId: alarm.id, scheduledAt: at.getTime(), localDate: dateKey(day), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
  }
  function between(alarms, from, until) {
    const start = new Date(Math.max(Number(from), Number(until) - 8 * 86400000));
    start.setHours(0,0,0,0);
    const values = [];
    for (let day = new Date(start); day <= until; day.setDate(day.getDate()+1)) {
      for (const alarm of alarms) if (applicable(alarm, day)) {
        const item = occurrence(alarm, day);
        if (item.scheduledAt > Number(from) && item.scheduledAt <= Number(until)) values.push({ ...item, alarm });
      }
    }
    return values.sort((a,b) => a.scheduledAt-b.scheduledAt || a.alarmId.localeCompare(b.alarmId));
  }
  function next(alarms, now, handled = []) {
    const known = new Set(handled.map(item => item.id));
    let best = null;
    for (const alarm of alarms) if(alarm.repeatMode === "once" && alarm.enabled) {
      const parts=String(alarm.onceDate || "").split("-").map(Number);
      if(parts.length!==3 || !parts.every(Number.isFinite))continue;
      const day=new Date(parts[0],parts[1]-1,parts[2],12);
      if(dateKey(day)!==alarm.onceDate)continue;
      const item=occurrence(alarm,day);
      if(item.scheduledAt<=+now || known.has(item.id))continue;
      if(!best || item.scheduledAt<best.scheduledAt)best={...item,alarm,at:new Date(item.scheduledAt)};
    }
    for (let offset=0; offset<=8; offset++) {
      const day = new Date(now.getFullYear(),now.getMonth(),now.getDate()+offset,12);
      for (const alarm of alarms) if (alarm.repeatMode !== "once" && applicable(alarm, day)) {
        const item = occurrence(alarm, day);
        if (item.scheduledAt <= +now || known.has(item.id)) continue;
        if (!best || item.scheduledAt < best.scheduledAt) best = { ...item, alarm, at: new Date(item.scheduledAt) };
      }
    }
    return best;
  }
  function shuffleRiddle(riddle) {
    const values = riddle.options.map((label,index) => ({id:`${riddle.id}:${index}`,label,index}));
    for(let i=values.length-1;i>0;i--) {const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}
    const correctOptionId = `${riddle.id}:${riddle.answer}`;
    return { ...riddle, options: values.map(item=>item.label), optionIds:values.map(item=>item.id), correctOptionId, answer:values.findIndex(item=>item.id===correctOptionId) };
  }
  window.DramaAlarmRuntime = Object.freeze({dateKey,resolve,occurrence,between,next,shuffleRiddle});
})();
