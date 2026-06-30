# Web Roadmap (Marketing · App)

Status as of 2026-06-30. Covers two public deployments from this repo:
- **Marketing** — `onoffmypc.com` (root `.`)
- **App** — `app.onoffmypc.com` (`app/`)

Bugs are marked **[BUG]**, security issues **[SEC]**, missing features **[FEAT]**, and improvements **[IMPROVE]**.

---

## Bugs — Fixed

- **[BUG]** Marketing "Get Started" links pointed to `https://app.onoffmypc.com/register` (no extension) which 404s — Cloudflare Pages SPA fallback served `index.html` which redirected to login instead of the register page. **Fixed** in `index.html`, `about.html`, and `setup.html` → `/register.html`.
- **[BUG]** Security headers (`_headers` at repo root) had `/app/*` rules that never applied — those paths do not exist on the marketing site and `app/` is deployed as a separate Pages project without its own `_headers` file. **Fixed**: root `_headers` simplified to baseline headers only; new `app/_headers` created with full CSP for the app deployment.
- **[BUG]** Dashboard cards were missing the Force Off button — only available on the device detail page. **Fixed** (added Force Off button with confirm dialog to each device card in `dashboard.js`).
- **[BUG]** Five app pages had inline `<script>` blocks blocked by `script-src 'self'` CSP. **Fixed** — all inline scripts extracted to external `.js` files (`init.js`, `verify-email.js`, `forgot-password.js`, `reset-password.js`).
- **[BUG]** Cloudflare analytics beacon (`static.cloudflareinsights.com`) blocked by CSP. **Fixed** — domain added to `script-src` in `app/_headers`.
- **[BUG]** `/cdn-cgi/rum` (same-origin RUM endpoint) blocked by CSP because `connect-src` was missing `'self'`. **Fixed** — added `'self'` to `connect-src`.
- **[BUG]** Inline `style="..."` attributes on multiple pages blocked by `style-src-attr` CSP. **Fixed** — replaced all inline styles with utility CSS classes.
- **[BUG]** `onclick="..."` HTML attributes and JS-generated `innerHTML` with inline event handlers blocked by `script-src-attr` CSP. **Fixed** — replaced with `data-action` attributes and event delegation on parent containers.
- **[BUG]** Password show/hide toggle wired via `onclick="..."` HTML attribute on login, register, and reset-password pages — blocked by CSP. **Fixed** — `ui.js` now auto-wires all `.pass-eye` buttons via `querySelectorAll` + `addEventListener` on load.

---

## Remaining Bugs

### App
- **[BUG]** No success feedback after register form submits — `auth.js` immediately calls `api.login()` and redirects; if the auto-login fails, the user is dropped on `/login.html` with no explanation. Should show an error toast if the auto-login fails.
- **[BUG]** `app/login.html` has a `<div id="success" class="success-msg">` element that is never shown — intended for post-reset redirect message but no code reads a query param to show it. Either wire it up or remove it.
- **[BUG]** `setup.html` links to `https://app.onoffmypc.com` (root) in step 2, which redirects to dashboard or login. The link should go directly to `https://app.onoffmypc.com/dashboard.html` for clarity.

---

## Security

- **[SEC]** CSP now enforced on `app.onoffmypc.com` via `app/_headers` — verify headers are live after each deploy with `curl -I`.
- **[SEC]** JWT stored in `localStorage` — persists across tabs, accessible to JS. If XSS is ever introduced, tokens are at risk. Long-term: `HttpOnly` cookies via a proper session endpoint.

---

## Missing Features

### Marketing
- **[FEAT]** Favicon — no `favicon.ico` or `<link rel="icon">` on any page. Browser shows default icon.
- **[FEAT]** OG / social meta tags — no `og:title`, `og:description`, `og:image`. Links shared on social media show no preview card.
- **[FEAT]** Contact / support page — no way for users to get help.
- **[FEAT]** Changelog / blog page — no way to communicate updates to users.
- **[FEAT]** Email signup for early-access waitlist — currently invite-code only with no self-service waitlist.

### App
- **[FEAT]** Change password on account page — users can only change password via forgot-password email flow. Add a "Change Password" form on `/account.html`.
- **[FEAT]** Telemetry charts — device detail shows raw data tables only. Line charts for PC state, temperature, and humidity over time would greatly improve usability.
- **[FEAT]** Real-time status updates — status currently polls every 30 s. Server-sent events or a WebSocket from the browser would push status changes instantly.
- **[FEAT]** Mobile-friendly navigation — no hamburger menu; buttons overflow on small screens on the device detail page.
- **[FEAT]** "Last seen" time on dashboard card — currently shows only "PC On / PC Off / Offline" badge. Showing "Last seen 2m ago" gives more context.
- **[FEAT]** Copy button feedback reset — after clicking "Copy" in the token reveal modal, the button text changes but never resets back to "Copy". Should revert after ~2 s.
- **[FEAT]** Confirm password field on register — no confirm-password input; typos in password go unnoticed until reset.
- **[FEAT]** Remember-me / persistent session — JWT is stored in `localStorage` which persists across tabs but is cleared on browser data wipe. A "Remember me" checkbox could extend TTL.
- **[FEAT]** Breadcrumb / nav indicator for which page is active — nav links have no active state styling.
- **[FEAT]** Device page auto-refresh indicator — 30 s timer fires silently; show a small "Updated X seconds ago" counter.
- **[FEAT]** Offline detection banner — if API calls fail, show a banner instead of silent toast errors.
- **[FEAT]** Device detail: show firmware version — `firmware_version` is returned by the API but not rendered anywhere in the app UI.

---

## Improvements

### Marketing
- **[IMPROVE]** The `setup.html` notice says "A one-click flashing tool is coming soon" — should link to ESP Web Tools directly or embed it.
- **[IMPROVE]** No `<link rel="canonical">` on marketing pages — may cause duplicate content issues.
- **[IMPROVE]** Footer copyright year is hardcoded as `2026` — will need updating.

### App
- **[IMPROVE]** Loading state is plain "Loading…" text — replace with a proper spinner or skeleton cards.
- **[IMPROVE]** Empty state on dashboard is a plain text box — add an illustration and clearer call to action.
- **[IMPROVE]** Cache-busting via `?v=N` query strings — manual process, prone to being forgotten. Consider using a build tool (Vite or esbuild) to hash file names automatically.
- **[IMPROVE]** `app/index.html` redirects based on `localStorage.getItem('token')` — expired tokens still present in localStorage cause a double redirect (dashboard → login). Should validate token expiry before redirecting.

---

## Infrastructure

- **[IMPROVE]** No CI/CD — deploys are manual commands. A GitHub Actions workflow would deploy automatically on push to `main`.
- **[IMPROVE]** No staging environment — all changes go straight to production.
- **[IMPROVE]** Cache headers for JS/CSS are `max-age=14400` (4 h) via platform defaults — consider longer TTLs with file-name hashing for better performance.
