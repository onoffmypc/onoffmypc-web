# Changelog

## [Unreleased]

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
