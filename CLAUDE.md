# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build` (static output to `dist/`)
- **Preview:** `pnpm preview`
- **Type check:** `npx tsc -p tsconfig.json --noEmit`
- **Format:** `pnpm prettier --write .`
- **Format check:** `pnpm prettier --check .`
- **Package manager:** pnpm (v9), Node 20+ (.nvmrc says 20, CI uses 22)

## Architecture

**Astro 5 static site** with **Vue 3** components for interactivity and **Tailwind CSS** for styling. Deployed to GitHub Pages at mooshieblob.com.

### Rendering Model

Astro pages and layouts are server-rendered at build time. Vue components use `client:load` for client-side hydration (partial hydration). This means Vue components only run in the browser — keep SSR-incompatible code (DOM APIs, sessionStorage) inside `onMounted` or guarded checks.

### Key Directories

- `src/pages/` — File-based routing (index, images, about, submit)
- `src/layouts/` — Two layouts: `BaseLayout.astro` (with rain effect) and `NoRainLayout.astro`
- `src/components/` — Vue 3 SFCs (BlobLogo, SplashScreen, ImageGallery, RainEffect, SocialLinks, CursorFollower)
- `src/stores/` — Vue reactive state (splash screen state)
- `src/styles/` — Global CSS

### External Services

- **Image data:** Fetched at runtime from a Cloudflare Workers endpoint in ImageGallery.vue
- **Form submissions:** FormSubmit.co service (submit.astro)

### Visual Effects System

The site uses several layered visual effects: rain animation (CSS keyframes), cursor follower (requestAnimationFrame), splash screen (sessionStorage-gated, fires custom `splash-done` event), smooth scrolling (Lenis library), and Astro View Transitions for page navigation.

### Design Tokens

- Background: `#02061a` (dark blue-black)
- Accent: `#ffcc00` / `#fbc21b` (yellow)
- Font: Roboto, with custom Yuruka font (FOT-YurukaStd-UB.otf in assets)

## CI/CD

GitHub Actions workflow (`.github/workflows/deploy.yml`) runs `pnpm build` on push to main and deploys `dist/` to GitHub Pages.
