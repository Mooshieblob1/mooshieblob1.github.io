# Accessibility Improvements

This document outlines the accessibility (a11y) improvements made to the site to ensure WCAG compliance and better user experience for people using assistive technologies.

## Overview

The site has been updated to address critical accessibility issues including keyboard navigation, screen reader support, focus management, and ARIA attributes.

## Changes Made

### 1. Global Improvements (app.vue)

- **Fixed user-select**: Changed from globally disabling text selection to only disabling on buttons and specific elements
- **Added focus styles**: Implemented visible focus indicators (yellow outline) for keyboard navigation
- **Screen reader utility**: Added `.sr-only` class for screen-reader-only content

### 2. Skip Navigation (SkipToMain.vue)

- **Created skip link component**: Allows keyboard users to skip directly to main content
- Visible when focused, hidden otherwise
- Added to both layout files

### 3. Layouts (default.vue, no-rain.vue)

- **Added semantic HTML**: Wrapped content in `<main id="main-content">` landmark
- **Integrated skip link**: Added SkipToMain component to all pages

### 4. Navigation (navbar.vue)

- **ARIA labels**: Added `aria-label="Main navigation"` to nav element

### 5. Social Links (SocialLinks.vue)

- **Icon accessibility**: Added `aria-label` to all social media links
- **Icon hiding**: Set `aria-hidden="true"` on decorative icon elements
- **Navigation landmark**: Wrapped icons in navigation region with `aria-label="Social media links"`

### 6. Chat Widget (GeminiChat.vue)

- **Button accessibility**: 
  - Added `aria-label="Open chat with Gemini assistant"`
  - Added `aria-expanded` state
  - Added `aria-controls` linking to popup
- **Dialog role**: Chat popup has `role="dialog"` and `aria-label`
- **Live region**: Chat messages use `role="log"` with `aria-live="polite"`
- **Form labels**: Added label for input field (visually hidden with `.sr-only`)
- **Keyboard support**:
  - Escape key closes chat
  - Auto-focus on input when opening
- **Button states**: Send button is disabled when input is empty

### 7. Submit Form (submit.vue)

- **Honeypot field**: Added `aria-hidden="true"` and `tabindex="-1"` to prevent screen reader interaction
- **Removed blur hack**: Removed code that forcefully blurred focused elements on page load

### 8. Image Gallery (images.vue)

#### Loading States
- **Loading spinners**: Added `role="status"` and `aria-live="polite"` with screen reader announcements
- **Alt text fallbacks**: Ensured all images have descriptive alt text

#### Keyboard Navigation
- **Grid items**: Made clickable with keyboard (Enter/Space keys)
- **Modal keyboard support**:
  - Escape key closes modal
  - Arrow keys navigate between images
  - Tab key navigates focusable elements

#### Modal Accessibility
- **Dialog role**: Modal has `role="dialog"`, `aria-modal="true"`, and descriptive `aria-label`
- **Focus management**:
  - Stores last focused element when opening
  - Restores focus when closing
  - Auto-focuses enlarged image
- **Close button**: Visible close button with `aria-label="Close enlarged image"`
- **Focusable image**: Enlarged image has `tabindex="0"` for keyboard access

#### ARIA Attributes
- **Interactive elements**: All interactive items have appropriate `aria-label` attributes
- **Decorative elements**: Spinners marked with `aria-hidden="true"`

## Testing Recommendations

To verify these improvements work correctly:

1. **Keyboard Navigation**:
   - Tab through all interactive elements
   - Verify visible focus indicators
   - Test skip link (Tab on page load)
   - Test modal keyboard controls (Escape, Arrow keys)

2. **Screen Reader Testing**:
   - Use NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)
   - Verify all links and buttons are announced
   - Check that loading states are announced
   - Confirm icon-only buttons have descriptive labels

3. **Browser Extensions**:
   - axe DevTools
   - WAVE
   - Lighthouse accessibility audit

4. **Focus Management**:
   - Open and close modals
   - Verify focus returns to trigger element
   - Check no focus is lost or trapped unexpectedly

## Remaining Considerations

While the major accessibility issues have been addressed, consider these for future improvements:

1. **Color Contrast**: Verify all text meets WCAG AA standards (4.5:1 for normal text)
2. **Responsive Text**: Ensure text can be resized to 200% without breaking layout
3. **Touch Targets**: Verify all interactive elements are at least 44x44 pixels
4. **Animation**: Consider `prefers-reduced-motion` media query for users sensitive to motion
5. **Error Handling**: Add proper error messaging for form validation

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
