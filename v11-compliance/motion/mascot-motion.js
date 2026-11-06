(function(){
  'use strict';
  const tracked=new Map();
  const reduced=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
  let pending=false;
  let explicitReduced=null;
  let manualPaused=false;
  const viewport=()=>({width:window.innerWidth||document.documentElement.clientWidth,height:window.innerHeight||document.documentElement.clientHeight});
  function isVisible(host){
    if(!host.isConnected||host.closest('[data-v11-snapshot],.v11-route-snapshot,[hidden]'))return false;
    const rect=host.getBoundingClientRect(),size=viewport();
    return rect.width>0&&rect.height>0&&rect.bottom>0&&rect.right>0&&rect.top<size.height&&rect.left<size.width;
  }
  function isReduced(host){
    return explicitReduced===true||reduced?.matches||document.documentElement.dataset.reduceMotion==='true'||!!host.closest('.v8-reduce-motion,.is-static');
  }
  function stopResponse(state){
    if(state.timer)clearTimeout(state.timer);
    state.timer=null;
    for(const animation of state.activeResponse||[]){try{animation.endElement();}catch{}}
    state.activeResponse=[];
    delete state.host.dataset.feedback;
  }
  function apply(state){
    const pause=manualPaused||document.hidden||document.documentElement.dataset.pageHidden==='true'||document.body?.classList.contains('is-background')||isReduced(state.host)||!isVisible(state.host);
    try{if(pause){if(!state.svg.animationsPaused())state.svg.pauseAnimations();if(isReduced(state.host)||document.hidden)stopResponse(state);}else if(state.svg.animationsPaused())state.svg.unpauseAnimations();}catch{}
    state.host.dataset.motionPaused=String(pause);
    return !pause;
  }
  const intersection=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{for(const entry of entries){const svg=entry.target.querySelector('svg[data-v11-rig]'),state=tracked.get(svg);if(state)apply(state);}},{threshold:0.01}):null;
  function scan(){
    pending=false;
    for(const [svg,state]of tracked)if(!svg.isConnected){stopResponse(state);intersection?.unobserve(state.host);tracked.delete(svg);}
    for(const host of document.querySelectorAll('[data-v11-mascot]')){
      const svg=host.querySelector('svg[data-v11-rig]');
      if(!svg||typeof svg.pauseAnimations!=='function')continue;
      let state=tracked.get(svg);
      if(!state){state={host,svg,activeResponse:[],timer:null};tracked.set(svg,state);intersection?.observe(host);}
      apply(state);
    }
    return tracked.size;
  }
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(scan);}
  function refresh(rootOrOptions,options){
    const configuration=options||(rootOrOptions&&!rootOrOptions.nodeType?rootOrOptions:null);
    if(configuration&&Object.hasOwn(configuration,'reduceMotion'))explicitReduced=!!configuration.reduceMotion;
    else explicitReduced=null;
    return scan();
  }
  function respond(element,context='home'){
    const host=element?.matches?.('[data-v11-mascot]')?element:element?.closest?.('[data-v11-mascot]')||element?.querySelector?.('[data-v11-mascot]');
    const svg=host?.querySelector('svg[data-v11-rig]');
    if(!svg)return false;
    if(!tracked.has(svg))scan();
    const state=tracked.get(svg);
    if(!state||!apply(state))return false;
    context=context==='run'?'run':'home';
    stopResponse(state);
    const animations=[...svg.querySelectorAll(`animateTransform[data-response="${context}"]`)];
    for(const animation of animations){try{animation.beginElement();}catch{}}
    state.activeResponse=animations;
    host.dataset.feedback=context;
    state.timer=setTimeout(()=>{state.timer=null;delete host.dataset.feedback;state.activeResponse=[];},context==='home'?840:1000);
    return animations.length>0;
  }
  function diagnostics(){return[...tracked.values()].map(state=>({key:state.host.dataset.mascotKey,character:state.host.dataset.character,mode:state.host.dataset.v11Mascot,paused:state.svg.animationsPaused(),time:state.svg.getCurrentTime(),feedback:state.host.dataset.feedback||null,parts:state.svg.querySelectorAll('[data-motion-part]').length}));}
  const observer=new MutationObserver(records=>{
    if(records.some(record=>record.type==='childList'
      ? [...record.addedNodes,...record.removedNodes].some(node=>node.nodeType===1&&(node.matches?.('[data-v11-mascot]')||node.querySelector?.('[data-v11-mascot]')))
      : record.target===document.documentElement||record.target===document.body||record.target.matches?.('[data-v11-mascot],.screen,.v10-screen,[hidden]')))schedule();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-reduce-motion','data-page-hidden','class','style','hidden']});
  document.addEventListener('visibilitychange',scan);
  window.addEventListener('resize',schedule,{passive:true});
  if(!intersection)document.addEventListener('scroll',schedule,{passive:true,capture:true});
  reduced?.addEventListener('change',()=>{explicitReduced=null;scan();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});else schedule();
  function setPaused(value){manualPaused=!!value;scan();return manualPaused;}
  function seek(value){const time=Math.max(0,Number(value)||0);for(const {svg}of tracked.values())svg.setCurrentTime(time);return time;}
  window.DramaAlarmMascotMotion=Object.freeze({scan,refresh,sync:refresh,respond,diagnostics,setPaused,seek,version:'11.0.0'});
})();
