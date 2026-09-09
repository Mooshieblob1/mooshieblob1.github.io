# Blob — mooshieblob.com

Blob’s profile, AI image gallery, about page, and image request form. Built with Astro 5, Vue 3, and Tailwind CSS, using the original ratgirl artwork and a navy/yellow palette.

## Pages

- `/` — Profile, social links, page directory, and MooshieUI.
- `/images` — AIbooru gallery with native lazy loading and a keyboard-accessible image viewer.
- `/about` — Blob’s bio and interests.
- `/submit` — Image ideas sent through the existing FormSubmit.co form.

The profile centres the original Blob logo and ratgirl in a layered rain scene. Drops splash against the artwork’s alpha silhouettes, with swept collision checks for thin edges and scene-relative coordinates that remain aligned while scrolling or resizing. Desktop pointers can deflect nearby rain. A pause control and reduced-motion support are included, and animation stops while the scene or tab is hidden.

The site uses normal page links and short cross-document transitions where supported. The interface is available immediately, without a splash screen or scroll lock.

## Gallery repair

The previous gallery depended on a separately deployed Worker that currently returns Cloudflare error 1042 (`workers_dev_script_not_found`). It also assumed media variants always existed at indices 1 and 3.

The gallery now requests `/api/images` on the site's own origin. `server/gallery-api.mjs` fetches the public AIbooru posts API with the `blob_(artist)` tag, found in the original gallery URLs, and a limit of 100. The fixed query cannot be overridden by visitors. Successful responses may be cached for five minutes; unavailable, invalid, and timed-out responses remain uncached and show a retry state.

`src/lib/gallery.mjs` validates the response, removes invalid/deleted/duplicate records, accepts legacy top-level image URLs, and selects optional media variants by size and type. Both thumbnails and full-size images fall back through available URLs. The native dialog supports focus management, arrow-key navigation, and Escape.

Live upstream API and CDN availability still depends on AIbooru. Tests use fixtures and controlled HTTP responses; they do not imply a successful live upstream check.

## Development

Use Node 22+ and pnpm. Existing dependency versions and the lockfile are retained.

```sh
pnpm install
pnpm dev       # Astro, including the local /api/images middleware
pnpm test      # Gallery normalization, failures, and Worker routing
pnpm build     # Astro pages plus the self-contained Worker
pnpm preview   # Serve the built Worker and API locally
```

## Hosting

`pnpm build` creates `dist/_worker.js` for Cloudflare Pages advanced mode, and the same Worker at `dist/server/index.js` for Sites. HTML and public assets are embedded in the Worker to keep asset serving consistent on both hosts; this currently fits comfortably within Worker size and memory limits. Revisit the packaging strategy if the local asset collection grows substantially.

Cloudflare Pages can continue building with `pnpm build` and output directory `dist`. The Worker and gallery endpoint ship together, so no separate `workers.dev` deployment is required. Plain GitHub Pages cannot run the API.

Security headers are applied by the Worker from `public/_headers`, with a CSP meta fallback. The gallery uses same-origin requests and referrer-free image loading. No API keys are needed for public posts. FormSubmit remains the request-form provider; it has not been replaced or submitted during development.
