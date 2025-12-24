const CACHE_NAME = "furniture-ar-cache-v2"; // Incremented version to ensure update
const ASSETS = [
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",

  // Icons
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  
  // Ad Banners
  "assets/ads/ad-banner-1.png",
  "assets/ads/ad-banner-2.png",
  "assets/ads/ad-banner-3.png",

  // Product images
  "assets/images/Arm_Chair.png",
  "assets/images/Brown_L-Sofa.png",
  "assets/images/bed.png",
  "assets/images/table_lamp.png",
  "assets/images/tv_stand.png",
  "assets/images/antique_desk.png",
  "assets/images/bookshelf.png",
  "assets/images/cupboard.png",
  "assets/images/coffee_table.png",
  "assets/images/wood_table.png",

  // 3D models
  "assets/models/Arm_Chair.glb",
  "assets/models/Brown_L-Sofa.glb",
  "assets/models/bed.glb",
  "assets/models/table_lamp.glb",
  "assets/models/tv_stand.glb",
  "assets/models/antique_desk.glb",
  "assets/models/bookshelf.glb",
  "assets/models/cupboard.glb",
  "assets/models/coffee_table.glb",
  "assets/models/wood_table.glb"
];

// Install event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching new assets for offline use");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event (clean old caches)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});