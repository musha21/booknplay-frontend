/* eslint-disable no-restricted-globals */
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

/**
 * SPA navigations: try the network first (Vercel rewrites → index.html).
 * On failure, use a cached navigation response, then the App Shell, then offline.html.
 * Do not add runtimeCaching for API/auth/payment hosts — those stay network-only.
 */
const navigationHandler = new NetworkFirst({
  cacheName: 'booknplay-navigations',
  networkTimeoutSeconds: 4,
  plugins: [
    {
      handlerDidError: async () => {
        const shell = await caches.match('/index.html', { ignoreSearch: true })
        if (shell) return shell
        const offline = await caches.match('/offline.html', { ignoreSearch: true })
        return offline || Response.error()
      },
    },
  ],
})

registerRoute(
  new NavigationRoute(navigationHandler, {
    denylist: [/^\/api(?:\/|$)/, /\/api\/v1/],
  }),
)

setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    const offline = await caches.match('/offline.html', { ignoreSearch: true })
    if (offline) return offline
    const shell = await caches.match('/index.html', { ignoreSearch: true })
    if (shell) return shell
  }
  return Response.error()
})
