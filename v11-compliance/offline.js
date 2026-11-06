(function(){
  'use strict';
  // Scope is this version's path only. No private alarm state is sent or cached.
  if(!('serviceWorker' in navigator) || !window.isSecureContext)return;
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(registration=>{
      window.DramaAlarmOffline={registered:true,scope:registration.scope};
    }).catch(()=>{window.DramaAlarmOffline={registered:false};});
  },{once:true});
}());
