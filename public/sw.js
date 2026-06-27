const CACHE_NAME = "autopilot-os-v1"

const APP_SHELL = [
  "/",
  "/dashboard",
  "/flashcards",
  "/learn",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]

// Install: cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  )
})

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin (except supabase)
  if (request.method !== "GET") return
  if (url.origin !== location.origin && !url.hostname.endsWith(".supabase.co")) return

  // API routes: NetworkFirst with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Supabase: NetworkFirst with cache fallback
  if (url.hostname.endsWith(".supabase.co")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Static assets: CacheFirst
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((res) => {
        if (res.ok && res.type !== "opaque") {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
        }
        return res
      })
    })
  )
})

// Push notification handler
self.addEventListener("push", (event) => {
  let data = { title: "Autopilot OS", body: "Time to study!", url: "/flashcards", icon: "/icons/icon-192.png" }
  try { if (event.data) data = { ...data, ...event.data.json() } } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: "/icons/icon-192.png",
      data: { url: data.url },
      tag: "streak-reminder",
      renotify: true,
    })
  )
})

// Notification click: open or focus app
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? "/flashcards"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const client = clients.find((c) => c.url.includes(url))
      if (client) return client.focus()
      return self.clients.openWindow(url)
    })
  )
})
