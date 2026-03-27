# mooshieblob.com

A personal portfolio and image gallery site built with **Astro 5**, **Vue 3**, and **Tailwind CSS**. Deployed to GitHub Pages at [mooshieblob.com](https://mooshieblob.com).

## Pages

- **Home** — Landing page with an animated splash screen (first visit only), the BlobLogo, social links, and a background illustration.
- **Images** — Dynamic image gallery powered by a Cloudflare Workers API. Features lazy loading, staggered entrance animations, hover scaling, and a smooth zoom-to-center modal with keyboard navigation.
- **About** — Personal bio page with accent-highlighted interests.
- **Submit** — Idea/image request form handled by FormSubmit.co with honeypot spam protection.

## Visual Effects

| Effect | Description |
|---|---|
| **Rain Animation** | 50 CSS-animated raindrops with randomised position, speed, and delay |
| **Cursor Follower** | Smooth yellow circle trails the mouse via `requestAnimationFrame` (hidden on touch devices) |
| **Splash Screen** | Logo scales and translates from centre to nav position on first visit, gated by `sessionStorage` |
| **Gallery Animations** | Staggered slide-in entrances, 1.1× hover scale, and Motion-powered modal zoom |
| **Page Transitions** | Astro View Transitions with blur, zoom, and translateY effects |
| **Smooth Scrolling** | Lenis library with custom easing (1.2 s duration) |
| **Nav Glow** | Text-shadow glow on nav link hover |

## Tech Stack

- **Astro 5** — Static site generation with file-based routing
- **Vue 3** — Interactive components with partial hydration (`client:load`)
- **Tailwind CSS 3** — Utility-first styling
- **Motion** — Smooth gallery modal animations
- **Lenis** — Smooth scroll behaviour
- **TypeScript** — Type-checked source
- **pnpm** — Package manager (v9, Node 20+)

## Accessibility

- Skip-to-main-content link
- Visible focus indicators (yellow outline) on all interactive elements
- Full keyboard navigation — Tab, Enter/Space, Arrow keys, Escape
- Semantic HTML landmarks (`<main>`, `<nav>`, `<footer>`)
- ARIA labels, roles, and live regions for screen readers
- `role="dialog"` with `aria-modal` on the gallery lightbox
- Focus trapping and restoration in modal views

## External Services

| Service | Purpose |
|---|---|
| **Cloudflare Workers** | Serves image data to the gallery at runtime |
| **FormSubmit.co** | Handles form submissions from the Submit page |
| **GitHub Pages** | Static hosting via GitHub Actions CI/CD |

## Design Tokens

| Token | Value |
|---|---|
| Background | `#02061a` |
| Accent | `#ffcc00` / `#fbc21b` |
| Text | `#ffffff` |
| Font | Roboto (+ custom Yuruka display font) |

## Development

```bash
pnpm install        # Install dependencies
pnpm dev            # Start dev server
pnpm build          # Build static site to dist/
pnpm preview        # Preview the build locally
```

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that builds the site with pnpm and deploys `dist/` to GitHub Pages.
