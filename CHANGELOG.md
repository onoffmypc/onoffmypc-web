# Changelog

## [Unreleased]

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
