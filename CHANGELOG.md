# Changelog

## [Unreleased]

## [1.13.0] - 2026-07-02

### Added
- **Contact form backend** — a Cloudflare Pages Function at `/api/contact` (`functions/api/contact.js`) receives the form and emails it via Resend (the project's existing email provider), with a honeypot field, input validation, and length caps. The form now posts to it over `fetch` and shows an inline result. Bumped `contact.js?v=2`, `style.css?v=5`.
  - Pages project env needed: `RESEND_API_KEY` (secret); optional `CONTACT_TO` (default `support@onoffmypc.com`) and `CONTACT_FROM`.
- **CI/CD** — a GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys the marketing and app Pages projects on every push to `main`. Requires `CLOUDFLARE_API_TOKEN` (Pages: Edit) and `CLOUDFLARE_ACCOUNT_ID` repo secrets.

## [1.12.0] - 2026-07-02

### Added
- **Contact & support page** (`contact.html`) — support email, a "report a bug" link to GitHub issues, and a message form. The form submits over `fetch` (`contact.js`) to a configurable endpoint (Formspree placeholder) and falls back to directing the visitor to email until a form ID is set.
- **Changelog page** (`changelog.html`) — a curated, plain-language "What's new" list for visitors.
- Both pages linked from the marketing footer across the site. Bumped `style.css?v=4`.

## [1.11.0] - 2026-07-02

### Added
- **Firmware version** shown on the device detail page (a small pill next to the online/offline badge), rendered from the `firmware_version` field when the API provides it (`device.js?v=8`, `app.css?v=9`).
- **Auto-refresh indicator** on the device page — a live "Refreshed X ago" counter next to the header so the silent 30s poll is visible.
- **Offline banner** on the dashboard and device pages — a sticky notice appears when the API is unreachable and clears on the next successful request, instead of failing silently (`api.js?v=9`).

## [1.10.0] - 2026-07-01

### Added
- **Confirm-password field** on the register page, with a client-side match check before the account is created (`register.html`, `auth.js?v=5`).
- **Sign-in confirmation banners** — the login page now shows a success message when arriving after registration (`?registered=1`), a password reset (`?reset=1`), or account deletion (`?deleted=1`), wiring up the previously-unused `#success` element. `reset-password.js?v=5` redirects with `?reset=1`; a failed auto-login after registration redirects with `?registered=1`.
- **"Last seen" line** on each dashboard device card (e.g. "Last seen 5m ago"), updated in place on the 30s refresh (`dashboard.js?v=7`).
- **Loading spinner** in place of plain "Loading…" text on the dashboard and device pages.
- **Canonical link tags** on all marketing pages; **active-state styling** for the current page's nav link (`style.css?v=3`).

### Changed
- Dashboard empty state now has an icon, heading, and clearer call to action.
- `setup.html` step 2 links directly to `/dashboard.html` instead of the app root (which redirects).

## [1.9.0] - 2026-07-01

### Added
- **Mobile hamburger nav** on the app pages (dashboard, device, account). Nav actions collapse into a dropdown toggle below 600px instead of sitting inline (`nav.js`, `app.css?v=7`).
- **Shared styled confirm dialog** (`confirm.js`) — replaces the native `window.confirm()` used for device delete and Force Off on the dashboard and device pages, matching the account page's modal styling. Bumped `dashboard.js?v=6`, `device.js?v=7`.
- **Favicon** (`favicon.svg`) and **Open Graph / Twitter Card meta tags** across all marketing pages, with a generated social preview image (`og-image.png`, 1200×630). Bumped `style.css?v=2`.

### Changed
- Dashboard device cards lay control buttons out in an even 2×2 grid instead of wrapping 3 + 1.
- Device page: scheduled-command rows are constrained to a readable width so the cancel action sits next to its entry rather than at the far page edge.
- Marketing hero: tightened the vertical spacing between the hero and the feature grid.

## [1.8.0] - 2026-07-01

### Added
- **Light & dark mode** across marketing, app, and admin. Follows the OS `prefers-color-scheme` by default and remembers a manual choice via a floating toggle (`theme.js`, injected in `<head>` so the theme is set before paint — no flash). A light palette was added to all three stylesheets via `[data-theme="light"]` overrides. Bumped `style.css?v=1`, `app.css?v=6`, `admin.css?v=5`.

## [1.7.0] - 2026-07-01

### Added
- Device page: schedule a power command for a future time (command picker + datetime), with a list of pending schedules and a cancel action. Uses the new `POST/GET/DELETE /commands/:id/schedule`. Bumped `api.js?v=8`, `device.js?v=6`, `app.css?v=5`.

## [1.6.0] - 2026-07-01

### Added
- Account page: change email and change password forms (`POST /auth/change-email`, `POST /auth/change-password`). `api.js?v=7`, `account.js?v=6`.

## [1.5.0] - 2026-07-01

### Changed
- Dashboard no longer makes a telemetry request per device (N+1 removed): device status now comes from the enhanced `GET /devices` response (latest `pc_on` + `last_seen_at`), and the 30s refresh is a single call that updates badges in place. Bumped `api.js?v=6`, `dashboard.js?v=5`.
- Device detail page shows online/offline from the accurate `GET /devices/:id/status` (Durable Object presence) instead of inferring from telemetry age.

### Added
- Device detail page: a dependency-free SVG line chart of hourly average temperature over the last 7 days, from `GET /telemetry/:id/history`. Bumped `device.js?v=5`, `app.css?v=4`.

## [1.4.2] - 2026-07-01

### Added
- Show/hide (eye) toggle on the admin Create User password field, matching the app's pattern. Bumped `admin.css` to `?v=4` and versioned `dashboard.js`.

## [1.4.1] - 2026-07-01

### Fixed
- Login redirect loop: the `apiReq` auth-page check only matched `.html` paths, but Cloudflare Pages serves clean URLs (`/login`), so a 401 on `/login` redirected to `/login.html` → 308 → `/login` → loop. The check now matches both clean and `.html` forms. Bumped `api.js` to `?v=5`.

## [1.4.0] - 2026-07-01

### Changed
- App now authenticates via the API's HttpOnly `session` cookie instead of a JWT in `localStorage` (XSS hardening). `api.js` sends `credentials:'include'` and no longer stores or reads a token; login/register rely on the cookie set by the API; logout and account-deletion call `POST /auth/logout` to clear it. Auth-state checks (already-signed-in redirects, page gating) now use `/auth/me` and the 401 handler. Bumped affected JS to `?v=4`.

## [1.3.0] - 2026-06-30

### Added
- One-click browser flashing on the setup page via ESP Web Tools (vendored at `/vendor/esp-web-tools/`). In Chrome or Edge on desktop, users can flash the ESP32 over USB directly from `onoffmypc.com/setup` — no software to install. Other browsers see a fallback message plus the manual esptool instructions. Adds `/firmware/manifest.json` and the merged v1.2.0 binary served same-origin.

### Changed
- Setup page: replaced the "one-click flashing tool is coming soon" notice with the live flasher in step 4.

## [1.2.1] - 2026-06-30

### Fixed
- Admin dashboard modals (Create User, Confirm) rendered on top of each other and blocked the page right after login. In `admin.css` the `.is-hidden` utility was declared before `.modal-backdrop { display: flex }`; with equal specificity the later rule won, so the backdrops showed on load. Moved `.is-hidden` after `.modal-backdrop` (matching `app.css`) so modals stay hidden until opened. Bumped `admin.css` to `?v=3`.

## [1.2.0] - 2026-06-30

### Fixed
- Device detail page (`device.js`) kept executing after redirecting away on a missing/invalid `?id=` param, firing an API call with a bad id before navigation completed — now halts the script after redirect. Bumped `device.js` to `?v=3`.

## [1.1.0] - 2026-06-30

### Fixed
- Inline `<script>` blocks on five app pages blocked by `script-src 'self'` CSP — extracted to external JS files (`init.js`, `verify-email.js`, `forgot-password.js`, `reset-password.js`)
- Cloudflare analytics beacon blocked by CSP — added the analytics domain to `script-src` in `app/_headers`
- Same-origin RUM endpoint blocked by CSP because `connect-src` was missing `'self'` — fixed
- Inline `style="..."` attributes across multiple pages blocked by `style-src-attr` CSP — replaced with utility CSS classes
- `onclick="..."` HTML attributes and inline event handlers in JS-generated HTML blocked by `script-src-attr` CSP — replaced with `data-action` attributes and event delegation
- Password show/hide toggle was wired via `onclick` HTML attribute on login, register, and reset-password pages — blocked by CSP; now auto-wired via `querySelectorAll` in `ui.js`
- Bumped `app.css` to `?v=3` and JS files to `?v=2` to force re-fetch of updated assets

## [1.0.0] - 2026-06-30

### Added
- Force Off button on each device card on the dashboard (was only on the device detail page); includes confirm dialog
- Security headers (`_headers`) added to the app deployment: CSP, HSTS, X-Frame-Options, X-Robots-Tag noindex
- `ROADMAP.md` added to the repo with a full audit of bugs, security gaps, and missing features

### Fixed
- "Get Started" and register links on marketing pages pointed to `/register` (no extension) which 404'd — now correctly link to `/register.html`
- Root `_headers` had stale path rules that applied to the wrong deployment — cleaned up

## [0.9.0] - 2026-06-30

### Added
- Password show/hide toggle (eye icon) on all password fields: login, register, reset-password

### Fixed
- Stale browser cache served old `api.js` (without `me`) and old `dashboard.js` — added `?v=2` query to all script and CSS tags to force fresh fetch
- `api.me is not a function` on account page — caused by cached old api.js; resolved by cache-bust
- `Cannot read properties of null (reading 'addEventListener')` on dashboard — caused by cached old dashboard.js crashing before logout listener was attached; resolved by cache-bust
- Logout button unresponsive — cascade of the dashboard.js crash above; now works correctly

## [0.8.0] - 2026-06-30

### Added
- `app/forgot-password.html` — request a password reset link (email form; always shows the same message regardless of whether the account exists)
- `app/reset-password.html` — enter new password using the link from the reset email; shows useful errors for expired/used links
- `app/verify-email.html` — auto-verifies email on click; redirects to dashboard if already logged in
- Account page: shows "Unverified" badge and "Resend email" button when email is not yet confirmed
- Login page: "Forgot password?" link
- `api.js`: `forgotPassword`, `resetPassword`, `verifyEmail`, `resendVerify` methods

## [0.7.0] - 2026-06-30

### Added
- Device detail page: **Force Off** button (sends `power_off_force` — holds power 6 s); shows confirm dialog before sending
- Command history: `expired` status shown with amber badge; `pending` shown with amber badge; `delivered` stays green
- `badge-pending` CSS class (amber) for in-progress command states
- `success-msg` CSS class for green informational banners (used after account deletion)
- Login page: shows success banner when redirected from account deletion (`?deleted=1`)

### Fixed
- Device ID in URL (`?id=`) now validated as UUID before any API call — invalid IDs redirect to dashboard instead of making a 404 API call

## [0.6.0] - 2026-06-30

### Added
- `app/account.html` — Account page: shows email, join date, and a Danger Zone with self-service account deletion (requires typing email to confirm)
- Account link added to nav in dashboard and device detail pages

### Fixed
- Device detail page was reading device name from URL `?name=` param — now fetched from the API so name stays accurate after a rename
- `openAddModal()` was not clearing Device ID / Token fields on re-open, showing stale credentials from a previous session

## [0.5.0] - 2026-06-30

### Added
- Register page now includes invite code field; subtitle updated to "Early access — invite code required"

### Changed
- Removed backend technology names from `about.html` and `privacy-policy.html` — replaced with neutral wording
- `about.html` meta description updated

## [0.4.0] - 2026-06-30

### Added
- `Strict-Transport-Security` (HSTS) header with 2-year max-age and preload
- `Permissions-Policy` header restricting camera, microphone, geolocation, and USB

## [0.3.0] - 2026-06-30

### Changed
- Setup guide (`setup.html`) rewritten for captive portal provisioning: added steps for finding PC MAC address, connecting to the OnOffMyPC-XXXXXX AP, and using the browser setup page at `http://192.168.4.1`; removed references to editing `config.h`
- Add Device modal now shows both Device ID and Token after creation, each with its own Copy button
- Setup guide inside the modal updated to match the captive portal flow (flash → connect to AP → fill setup page → wire up)

## [0.2.0] - 2026-06-29

### Added
- Device rename: click Rename on any device card to edit the name inline
- Setup guide modal: after adding a device, "Setup guide →" walks through wiring, config.h, and flashing steps
- Dashboard status auto-refresh every 30 seconds (device badges update without page reload)

## [0.1.0] - 2026-06-29

### Added
- Dashboard web app under `app/` (served at app.onoffmypc.com)
- Login and register pages with JWT auth
- Device list dashboard with live PC on/off status badges (polled from telemetry)
- Power On, Power Off, Reset commands per device
- Add device modal with device token reveal and copy button
- Delete device with confirmation
- Device detail page: stat cards (PC state, temperature, humidity, RSSI, last update), power controls, telemetry history table, command history table
- Auto-refresh on device detail page every 30 seconds
- Toast notifications for command results
