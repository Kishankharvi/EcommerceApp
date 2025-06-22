// Service Worker for PWA functionality
const CACHE_NAME = "neoshop-v1"
const urlsToCache = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/css/animations.css",
  "/js/config.js",
  "/js/firebase-service.js",
  "/js/utils.js",
  "/js/auth-manager.js",
  "/js/product-manager.js",
  "/js/cart-manager.js",
  "/js/checkout-manager.js",
  "/js/profile-manager.js",
  "/js/app.js",
  "/manifest.json",
  "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600&display=swap",
]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
