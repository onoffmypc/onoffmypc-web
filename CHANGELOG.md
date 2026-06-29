# Changelog

## [Unreleased]

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
