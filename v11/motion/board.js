(function(){
  'use strict';
  const names={curtain:'幕布精灵',lamp:'灯光精灵',mouse:'幕后小鼠'};
  const modeTitles={home:'01 / 首页 · 活力招呼',run:'02 / 晨间记录 · 双手示意与轻鞠躬',companion:'03 / 通用陪伴 · 倾听与轻摆'};
  const descriptions={
    home:{curtain:'保留已确认的挥手、布料与领结节奏。',lamp:'保留已确认的左右巡光和摆臂。',mouse:'保留已确认的摆耳、摇尾与轻踏步。'},
    run:{curtain:'放下单侧高举的手，双臂应和，伴随轻鞠躬。',lamp:'双臂招呼、灯头点头，脚步交替换重心。',mouse:'双手打开招呼，头部点头、双耳呼应、脚步更轻快。'},
    companion:{curtain:'一只手靠近脸侧倾听，另一只手轻摆；下摆持续流动。',lamp:'缩小巡光角度，用轻点头、缓慢摆臂陪伴。',mouse:'双手靠近围巾，耳朵错拍摇动，尾巴画出柔和弧线。'}
  };
  let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const board=document.getElementById('board');
  const timeline=document.getElementById('timeline');
  function render(){
    board.innerHTML=['home','run','companion'].map(mode=>`<section class="group"><h2>${modeTitles[mode]}</h2><p>4 秒持续循环 · ${mode==='home'?'现有确认动作':mode==='run'?'与首页不同的记录页招呼':'用于其他页面的温和陪伴'}</p><div class="grid">${['curtain','lamp','mouse'].map(character=>{
      const theme=character==='curtain'?document.getElementById('palette').value:character==='lamp'?'lunar':'amber';
      const svg=window.DramaAlarmMascot.render('welcome',{theme,mode,key:`board-${character}-${mode}`,size:240,label:`${names[character]}，${modeTitles[mode]}`});
      return `<figure class="card ${character}" data-case="${character}-${mode}"><figcaption>${names[character]}<small>4s / LOOP</small></figcaption><div class="stage">${svg}</div><p class="description">${descriptions[mode][character]}</p>${mode!=='companion'?`<button class="tap" type="button" data-feedback="${mode}">触摸${mode==='home'?'首页':'记录页'}回应</button><p class="tap-status" aria-live="polite">${mode==='home'?'轻快回应':'温和回应'} · 结束后继续循环</p>`:''}<div class="links"><a href="assets/${character}-${mode}-loop.svg" target="_blank" rel="noopener">Open SVG ↗</a>${mode!=='companion'?`<a href="assets/${character}-${mode}-touch.svg" target="_blank" rel="noopener">触摸 SVG ↗</a>`:''}</div></figure>`;
    }).join('')}</div></section>`).join('');
    window.DramaAlarmMascotMotion.scan();window.DramaAlarmMascotMotion.setPaused(paused);sync();
  }
  function sync(){document.getElementById('pause').textContent=paused?'继续播放':'暂停全部';document.getElementById('pause').setAttribute('aria-pressed',String(paused));document.getElementById('status').textContent=paused?'已暂停 · 拖动进度条可检查任意一帧':'可见角色持续播放中 · 首尾无缝衔接，离屏角色暂停';}
  document.getElementById('pause').addEventListener('click',()=>{paused=!paused;window.DramaAlarmMascotMotion.setPaused(paused);sync();});
  document.getElementById('palette').addEventListener('change',render);
  document.getElementById('size').addEventListener('change',event=>{document.body.dataset.size=event.target.value;window.DramaAlarmMascotMotion.scan();});
  timeline.addEventListener('input',()=>{paused=true;window.DramaAlarmMascotMotion.setPaused(true);window.DramaAlarmMascotMotion.seek(Number(timeline.value));sync();document.getElementById('time').textContent=`${Number(timeline.value).toFixed(2)} / 4.00s`;});
  board.addEventListener('click',event=>{const button=event.target.closest('[data-feedback]');if(!button)return;const card=button.closest('[data-case]');const started=window.DramaAlarmMascot.respond(card,button.dataset.feedback);card.querySelector('.tap-status').textContent=started?'正在回应，常驻循环相位保持':'当前已暂停；点击继续播放后可触摸';});
  render();
  setInterval(()=>{const report=window.DramaAlarmMascotMotion.diagnostics();const first=report.find(item=>!item.paused)||report[0];if(first&&!paused){timeline.value=String(first.time%4);document.getElementById('time').textContent=`${(first.time%4).toFixed(2)} / 4.00s`;}document.getElementById('readings').textContent=JSON.stringify({characters:3,loopSets:3,loops:9,touchResponses:6,instances:report},null,2);},200);
})();
