// Build replaces this cache label with a content hash. Only version-local public assets.
const CACHE='drama-alarm-v10-shell-345d3258e6c03184';
const SHELL=['./','./index.html','./content/catalog.json',...['everyday','geography','history','quick-math','number-logic','europe','us-geography','world-landmarks','us-history','biography'].map(id=>`./content/${id}-10.0.0.json`)];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('drama-alarm-v10-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL('./',self.location).pathname))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));}return response;}).catch(()=>caches.match('./index.html').then(cached=>cached||Response.error())));return;
 }
 // Versioned content refresh must still validate through the question-bank layer.
 if(url.pathname.includes('/content/')){
  event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;}).catch(()=>caches.match(request).then(cached=>cached||Response.error())));return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;})).catch(()=>request.mode==='navigate'?caches.match('./index.html'):Response.error()));
});
