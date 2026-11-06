(function(){
  'use strict';
  const palettes={daybreak:{top:'#e4f3eb',bottom:'#f5f8f6'},velvet:{top:'#f3e3ed',bottom:'#fbf3ec'},lunar:{top:'#e7e1f3',bottom:'#f2f0f9'},amber:{top:'#f1e2c9',bottom:'#fbf3e6'}};
  let previous='';
  function sync(){
    const id=document.documentElement.dataset.theme||document.body.dataset.theme||'daybreak';
    const palette=palettes[id]||palettes.daybreak;
    const dark=Boolean(document.querySelector('#app>.screen.screen--dark'));
    const launching=!document.body.classList.contains('is-launched')&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
    const color=launching?'#701b2e':dark?'#172b25':palette.top;
    if(previous!==color){document.querySelector('meta[name="theme-color"]')?.setAttribute('content',color);previous=color;}
  }
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class','data-theme']});
  new MutationObserver(sync).observe(document.getElementById('app'),{childList:true,attributes:true,subtree:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',sync);sync();
})();
