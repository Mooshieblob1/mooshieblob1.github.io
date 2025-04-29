// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  app: {
    head: {
      title: "Mooshieblob",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        { charset: "UTF-8" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      script: [
        {
          src: "https://code.jquery.com/jquery-3.7.1.min.js",
          integrity: "sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=",
          crossorigin: "anonymous",
        },
        {
          src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
        },
      ],
    },
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
    layoutTransition: {
      name: "layout",
      mode: "out-in",
    },
  },

  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/google-fonts", "@nuxthq/studio"],

  css: ["~/assets/css/style.css"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        // Empty for now, ready if you want SCSS/LESS config later
      },
    },
  },

  nitro: {
    routeRules: {
      "/api/**": { cors: true },
    },
  },

  googleFonts: {
    families: {
      // (Optional) Define your fonts here
    },
  },

  compatibilityDate: "2024-10-06",
});
