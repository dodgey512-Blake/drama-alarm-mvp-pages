(() => {
  'use strict';
  const objects = [...document.querySelectorAll('object.animation')];
  const roots = [];
  const toggle = document.getElementById('play-toggle');
  const slider = document.getElementById('timeline');
  const output = document.getElementById('time-output');
  const status = document.getElementById('play-state');
  const readings = document.getElementById('motion-readings');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let intent = !reduce.matches;
  let ready = false;
  let lastRead = 0;
  let loadError = false;
  function updatePlayback() {
    if (!ready) return;
    const playing = intent && !document.hidden;
    for (const {svg} of roots) playing ? svg.unpauseAnimations() : svg.pauseAnimations();
    toggle.textContent = intent ? '暂停全部' : '播放全部';
    toggle.setAttribute('aria-pressed', String(!intent));
    status.textContent = document.hidden ? '页面暂不可见 · 已暂停，不影响其他产品页面' : playing ? '三组持续播放中 · 4 秒接回开头 · 无点击触发或等待段' : reduce.matches ? '当前已暂停 · 系统开启了减少动态；可主动点击“播放全部”预览' : '当前已暂停 · 可拖动进度条逐帧观察，或点击“播放全部”继续';
    document.body.dataset.playing = String(playing);
  }
  function loaded(object) {
    if (roots.some(item => item.object === object)) return;
    const svg = object.contentDocument?.documentElement;
    if (!svg || typeof svg.pauseAnimations !== 'function') {
      loadError = true;
      status.textContent = '这张 SVG 未成功载入，请用卡片下方 Open SVG 单独打开。';
      return;
    }
    svg.pauseAnimations();
    svg.setCurrentTime(0);
    roots.push({object, svg, character:object.closest('[data-case]').dataset.case});
    if (roots.length === objects.length) {
      ready = true;
      for (const {svg} of roots) svg.setCurrentTime(0);
      toggle.disabled = false;
      updatePlayback();
    }
  }
  for (const object of objects) {
    object.addEventListener('load', () => loaded(object));
    object.addEventListener('error', () => {loadError = true; status.textContent = 'SVG 载入失败，可用 Open SVG 单独查看。';});
    if (object.contentDocument?.documentElement?.nodeName.toLowerCase() === 'svg') loaded(object);
  }
  toggle.addEventListener('click', () => {intent = !intent; updatePlayback();});
  slider.addEventListener('input', () => {
    if (!ready) return;
    intent = false;
    updatePlayback();
    for (const {svg} of roots) svg.setCurrentTime(Number(slider.value));
    output.textContent = `${Number(slider.value).toFixed(2)} / 4.00s`;
  });
  document.getElementById('view-size').addEventListener('change', event => {document.body.dataset.viewSize = event.target.value;});
  document.addEventListener('visibilitychange', updatePlayback);
  reduce.addEventListener('change', () => {if (reduce.matches) intent = false; updatePlayback();});
  function tick(now) {
    if (ready && !document.hidden) {
      const t = roots[0].svg.getCurrentTime() % 4;
      if (intent) slider.value = t.toFixed(2);
      output.textContent = `${(intent ? t : Number(slider.value)).toFixed(2)} / 4.00s`;
      if (now - lastRead >= 200) {
        const report = roots.map(({svg, character}) => ({
          character,
          currentTime:Number(svg.getCurrentTime().toFixed(3)),
          paused:svg.animationsPaused(),
          parts:[...svg.querySelectorAll('[data-motion-part]')].filter(node => node.querySelector('animateTransform,animate')).map(node => {
            const matrix = node.getCTM();
            return {part:node.dataset.motionPart, matrix:matrix ? ['a','b','c','d','e','f'].map(key => Number(matrix[key].toFixed(4))) : null};
          })
        }));
        readings.textContent = JSON.stringify({duration:4,loadError,playing:intent,instances:report},null,2);
        lastRead = now;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
