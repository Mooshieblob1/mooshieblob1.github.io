# Accessibility

How this site supports keyboard users, screen readers, and WCAG-oriented practices.

## Implemented features

### Layouts (`src/layouts/BaseLayout.astro`, `NoRainLayout.astro`)

- Skip-to-main link (visible on focus)
- Global focus-visible styles (yellow outline)
- Semantic landmarks: `<main>`, `<nav>`, `<footer>`
- `.sr-only` utility for screen-reader-only text

### Social links (`src/components/SocialLinks.vue`)

- `aria-label` on each outbound link
- Decorative SVGs marked `aria-hidden="true"`
- Navigation region with `aria-label="Social media links"`

### Submit form (`src/pages/submit.astro`)

- Honeypot field with `aria-hidden="true"` and `tabindex="-1"`
- Associated `<label>` for the message field

### Image gallery (`src/components/ImageGallery.vue`)

- Loading state: `role="status"`, `aria-live="polite"`
- Grid items: keyboard activation (Enter/Space), descriptive `aria-label`
- Modal: `role="dialog"`, `aria-modal="true"`, Escape to close
- Arrow keys navigate between images in the modal
- Focus restored to the triggering element on close
- Close button with `aria-label`

### Global UX

- Text selection enabled on readable content; disabled on buttons where appropriate
- Touch devices: cursor follower hidden (no misleading pointer UI)

## Manual testing

1. **Keyboard** — Tab through nav, gallery, modal, and form; confirm focus rings and skip link.
2. **Screen reader** — NVDA, JAWS, or VoiceOver; verify link names and loading announcements.
3. **Automated** — axe DevTools, WAVE, or Lighthouse accessibility audit.

## Future improvements

- `prefers-reduced-motion` for rain, splash, and gallery animations
- Verify color contrast meets WCAG AA (4.5:1 for body text)
- Ensure touch targets are at least 44×44 px
- Accessible error messaging if client-side validation is added

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
