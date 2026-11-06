// Build replaces this cache label with a content hash. Only version-local public assets.
const CACHE='drama-alarm-v11-compliance-shell-4c17cb66296e425e-music-20261106';
const SHELL=['./','./index.html','./privacy.html','./terms.html',...['styles.css','v5.css','v6.css','v7.css','liquid-glass.css','v8.css','v9.css','v10.css','launch11.css','v11.css','v11-navigation.css','mascot-motion.css','compliance.css','data.js','i18n.js','audio.js','question-bank.js','challenges.js','mascot.js','mascot-motion.js','screens.js','runtime.js','liquid-glass.js','app.js','offline.js','appearance11.js'].map(file=>'./'+file),'./assets/audio/catalog.json',...['free','premium'].flatMap(tier=>Array.from({length:6},(_,i)=>`./assets/audio/${tier}-${String(i+1).padStart(2,'0')}.m4a`)),'./content/catalog.json',...['everyday','geography','history','quick-math','number-logic','europe','us-geography','world-landmarks','us-history','biography'].map(id=>`./content/${id}-10.0.0.json`)];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('drama-alarm-v11-compliance-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL('./',self.location).pathname))return;
 if(request.mode==='navigate'){
  const scopePath=new URL('./',self.location).pathname;
  const relativePath=url.pathname.slice(scopePath.length);
  const entry=relativePath===''||relativePath==='index.html';
  const key=entry?'./index.html':request;
  event.respondWith(caches.open(CACHE).then(cache=>fetch(request).then(response=>{
   if(response.ok)cache.put(key,response.clone());
   return response;
  }).catch(()=>cache.match(key,{ignoreSearch:true}).then(cached=>cached||Response.error()))));return;
 }
 // Versioned content refresh must still validate through the question-bank layer.
 if(url.pathname.includes('/content/')){
  event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;}).catch(()=>caches.match(request).then(cached=>cached||Response.error())));return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;})).catch(()=>request.mode==='navigate'?caches.match('./index.html'):Response.error()));
});
