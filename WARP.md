# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Nuxt 3 + TypeScript app with Tailwind CSS and file-based routing.
- Server routes via Nitro in server/api (SSR/edge-friendly). Deployed locally with Nuxt; scripts exist for Cloudflare Workers via wrangler.
- Package manager: pnpm (pnpm-lock.yaml present). Node version: 20 (see .nvmrc).
- Notable modules: @nuxtjs/tailwindcss, @nuxt/icon, @vueuse/motion/nuxt, @nuxthq/studio, @nuxtjs/google-fonts.

Common commands
- Install deps
  - pnpm install
  - If pnpm isn’t available: corepack enable; then pnpm install
- Dev server (needs GEMINI_API_KEY for /api/gemini)
  - Bash/zsh: GEMINI_API_KEY="{{GEMINI_API_KEY}}" pnpm dev
  - fish: set -x GEMINI_API_KEY {{GEMINI_API_KEY}}; pnpm dev
  - Opens Nuxt dev on http://localhost:3000
- Build and preview (SSR build in .output)
  - pnpm build
  - pnpm preview
- Static generation (if exporting a static site)
  - pnpm generate
- Cloudflare Workers
  - Local worker dev: pnpm wrangler-dev
  - Publish: pnpm deploy
  - Note: wrangler publish expects a wrangler.toml. None is checked in; add one to configure name, account_id, and routes if you use Workers for deploys.
- Formatting and linting
  - Prettier (configured with prettier-plugin-tailwindcss)
    - Check: pnpm prettier --check .
    - Write: pnpm prettier --write .
  - ESLint
    - An ESLint config exists but ESLint is not listed in devDependencies. If installed, you can run:
      - npx eslint . --ext .ts,.vue
  - TypeScript type-check (noEmit):
    - npx tsc -p tsconfig.json --noEmit
- Tests
  - No test runner is configured in package.json.

Architecture and conventions (big picture)
- Entry and global app
  - app.vue orchestrates layout and page transitions (page/layout transitions via scoped CSS).
  - app.config.ts configures @nuxt/icon defaults (size, class, aliases).
  - nuxt.config.ts
    - head: sets title/meta; loads jQuery and Bootstrap bundle via CDN scripts globally.
    - modules: Tailwind, Google Fonts, Nuxt Studio, Motion, Icon.
    - css: includes ~/assets/css/style.css globally; PostCSS with tailwindcss/autoprefixer.
    - nitro.routeRules: enables CORS for /api/**.
    - runtimeConfig: geminiApiKey (reads GEMINI_API_KEY env var).
    - compatibilityDate set for Nitro/Vite compatibility.
- Layouts and UI composition
  - layouts/default.vue injects Navbar, RainEffect, and WebFooter around <slot />.
  - layouts/no-rain.vue omits the RainEffect; pages that don’t want the effect set layout: "no-rain".
  - Composables: composables/useRainEffect controls visibility of the rain effect; pages toggle it on/off as needed.
- Pages (file-based routing)
  - pages/index.vue: home; mounts <GeminiChat /> and <SocialLinks />.
  - pages/images.vue: grid of images pulled from an external Cloudflare Worker JSON endpoint; uses motion for animations, v-lazy-image for lazy loading, localStorage caching, and custom enlarge/close animations.
  - pages/about.vue and pages/submit.vue: informational and FormSubmit-based submission page respectively; both use layout "no-rain".
- Components (selected)
  - components/GeminiChat.vue: floating chat widget. Classifies messages and either:
    - posts feedback to formsubmit.co, or
    - sends chat content to the server /api/gemini endpoint and renders responses.
  - components/nav/navbar.vue, components/footer/webfooter.vue, components/effects/RainEffect.vue: global chrome and visual effects.
- Server API (Nitro, server/api)
  - server/api/gemini.ts: POST endpoint that proxies to Google Generative AI ("gemini-2.0-flash").
    - Requires runtimeConfig.geminiApiKey (GEMINI_API_KEY).
    - Maintains simple in-memory chatHistory for the process (resets on reload/redeploy).
  - server/api/posts.ts: sample in-memory posts with pagination and single-post lookup (no persistence).
- Styling
  - Tailwind configured via tailwind.config.js (targets components, layouts, pages, plugins, app.vue, error.vue).
  - Global styles in assets/css/style.css; some pages import assets/css/output.css.
  - Static assets in public/ (e.g., favicon.ico, images, logos).

Operational notes
- Environment
  - Set GEMINI_API_KEY in the environment for any command that exercises /api/gemini (dev, preview, or deployed runtime).
  - .gitignore excludes .env files; check in an .env.example if needed for teammates.
- Deployment
  - Package.json includes wrangler scripts. Without a wrangler.toml in the repo, set one up to deploy Nitro’s Workers target (or use another hosting strategy like static generation + static hosting).

Reference files
- package.json scripts: build, dev, generate, preview, postinstall (nuxt prepare), deploy (wrangler publish), wrangler-dev.
- nuxt.config.ts for modules, runtimeConfig, routeRules.
- server/api/* for backend endpoints used by the UI.
