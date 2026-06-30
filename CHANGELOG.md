# Changelog

## [Unreleased]

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
- `badge-pending` CSS class (amber) for in-progress command states in both app and admin views
- `success-msg` CSS class for green informational banners (used after account deletion)
- Login page: shows success banner when redirected from account deletion (`?deleted=1`)

### Fixed
- Device ID in URL (`?id=`) now validated as UUID before any API call — invalid IDs redirect to dashboard instead of making a 404 API call
- Admin dashboard: load errors are now surfaced as toast notifications instead of silently leaving sections at "Loading…"
- Admin session key: stored with a 24-hour expiry in sessionStorage; dashboard checks expiry on load and redirects to login if expired
- Admin confirm dialog: renamed internal `confirm()` function to `confirmDialog()` so it no longer shadows `window.confirm`
- Activity log in admin: `power_off_force` now labelled "Force Off"

## [0.6.0] - 2026-06-30

### Added
- `app/account.html` — Account page: shows email, join date, and a Danger Zone with self-service account deletion (requires typing email to confirm)
- Account link added to nav in dashboard and device detail pages

### Fixed
- Device detail page was reading device name from URL `?name=` param — now fetched from `GET /devices/:id` API so name stays accurate after a rename
- `openAddModal()` was not clearing Device ID / Token fields on re-open, showing stale credentials from a previous session

## [0.5.0] - 2026-06-30

### Added
- Admin panel now includes "Create User" form — invite users without open registration
- Register page now includes invite code field; subtitle updated to "Early access — invite code required"

### Changed
- Removed backend technology names (Cloudflare, Workers, D1, SQLite, WebSocket) from `about.html` and `privacy-policy.html` — replaced with neutral wording
- `about.html` meta description no longer mentions Cloudflare

## [0.4.0] - 2026-06-30

### Added
- `admin/` — admin panel at `admin.onoffmypc.com`: login page, dashboard with system stats, users table, devices table, recent commands log; delete user and delete device actions with confirmation
- CSP (`Content-Security-Policy`) header for `/app/*` and `/admin/*` routes
- `Strict-Transport-Security` (HSTS) header with 2-year max-age and preload
- `Permissions-Policy` header restricting camera, microphone, geolocation, and USB

### Changed
- `X-Robots-Tag: noindex, nofollow` added for all `/admin/*` routes

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
