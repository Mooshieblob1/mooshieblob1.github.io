// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
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
    pageTransition: false,
    layoutTransition: false,
  },

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxtjs/google-fonts",
    "@nuxt/icon",
    "@nuxt/content",
    "@nuxthq/studio",
  ],

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
        // Add any CSS preprocessor options here if needed
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
      // Add your font families here
    },
  },

  colorMode: {
    classSuffix: "",
  },

  compatibilityDate: "2024-10-06",
});
