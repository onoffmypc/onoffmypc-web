# Changelog

## [Unreleased]

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
