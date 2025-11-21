import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  const lenis = new Lenis({
    autoRaf: true,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Default easing
  })

  // Inject lenis to make it available throughout the app
  nuxtApp.provide('lenis', lenis)

  // Hook into page navigation to handle scroll restoration
  nuxtApp.hook('page:start', () => {
    // Optional: Stop scrolling during transition
    // lenis.stop()
  })

  nuxtApp.hook('page:finish', () => {
    // Scroll to top immediately when the new page is ready
    lenis.scrollTo(0, { immediate: true })
    // lenis.start()
  })
})
