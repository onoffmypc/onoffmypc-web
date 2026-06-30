# Web Roadmap (Marketing · App · Admin)

Status as of 2026-06-30. Covers three deployments from this repo:
- **Marketing** — `onoffmypc.com` (root `.`)
- **App** — `app.onoffmypc.com` (`app/`)
- **Admin** — `admin.onoffmypc.com` (`admin/`)

Bugs are marked **[BUG]**, security issues **[SEC]**, missing features **[FEAT]**, and improvements **[IMPROVE]**.

---

## Bugs — Fixed This Session

- **[BUG]** Marketing "Get Started" links pointed to `https://app.onoffmypc.com/register` (no extension) which 404s — Cloudflare Pages SPA fallback served `index.html` which redirected to login instead of the register page. **Fixed** in `index.html`, `about.html`, and `setup.html` → `/register.html`.
- **[BUG]** Admin dashboard had an unpopulated `nav-env` span (`id="nav-env"`) that was never written by JS — dead element. **Fixed** (removed the element).
- **[BUG]** Security headers (`_headers` at repo root) had `/app/*` and `/admin/*` rules that never applied — those paths do not exist on the marketing site and the `app/` and `admin/` subdirectories are deployed as separate Pages projects without their own `_headers` files. **Fixed**: root `_headers` simplified to baseline headers only; new `app/_headers` and `admin/_headers` files created with full CSP + `X-Robots-Tag: noindex` for each deployment.
- **[BUG]** Dashboard cards were missing the Force Off button — only available on the device detail page. **Fixed** (added Force Off button with confirm dialog to each device card in `dashboard.js`).

---

## Remaining Bugs

### App
- **[BUG]** No success feedback after register form submits — `auth.js` immediately calls `api.login()` and redirects; if the auto-login fails, the user is dropped on `/login.html` with no explanation. Should show an error toast if the auto-login fails.
- **[BUG]** `app/login.html` has a `<div id="success" class="success-msg">` element that is never shown — intended for post-reset redirect message but no code reads a query param to show it. Either wire it up or remove it.
- **[BUG]** `setup.html` links to `https://app.onoffmypc.com` (root) in step 2, which redirects to dashboard or login. The link should go directly to `https://app.onoffmypc.com/dashboard.html` for clarity.

### Admin
- **[BUG]** Admin `POST /admin/users` previously did not send a verification email — now fixed in the backend. The admin dashboard has no feedback to show that a verification email was sent after creating a user. Add a note to the success toast.

---

## Security

- **[SEC]** No Content-Security-Policy on `app.onoffmypc.com` or `admin.onoffmypc.com` before this session — now added via `_headers` files in each subdirectory. Verify headers are live after deploying each project.
- **[SEC]** Admin key stored in `sessionStorage` — accessible to any JS on `admin.onoffmypc.com`. Since admin is behind Zero Trust OTP, XSS risk is low but not zero. Long-term: use `HttpOnly` cookies via a proper session endpoint.
- **[SEC]** Create-user password field in admin has no show/hide toggle — minor UX but means admins may set wrong passwords.

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
- **[FEAT]** Real-time status updates — status currently polls every 30 s. A WebSocket connection from the browser to the API (or server-sent events) would push status changes instantly.
- **[FEAT]** Mobile-friendly navigation — no hamburger menu; buttons overflow on small screens on the device detail page.
- **[FEAT]** "Last seen" time on dashboard card — currently shows only "PC On / PC Off / Offline" badge. Showing "Last seen 2m ago" gives more context.
- **[FEAT]** Copy button feedback reset — after clicking "Copy" in the token reveal modal, the button text changes but never resets back to "Copy". Should revert after ~2 s.
- **[FEAT]** Confirm password field on register — no confirm-password input; typos in password go unnoticed until reset.
- **[FEAT]** Remember-me / persistent session — JWT is stored in `localStorage` which persists across tabs but is cleared on browser data wipe. A "Remember me" checkbox could extend TTL.
- **[FEAT]** Breadcrumb / nav indicator for which page is active — nav links have no active state styling.
- **[FEAT]** Device page auto-refresh indicator — 30 s timer fires silently; show a small "Updated X seconds ago" counter.
- **[FEAT]** Offline detection banner — if API calls fail, show a banner instead of silent toast errors.
- **[FEAT]** Device detail: show firmware version — `firmware_version` is returned by `GET /devices/:id` but not rendered anywhere in the app UI.

### Admin
- **[FEAT]** User email verification status column — admin users table doesn't show whether each user has verified their email.
- **[FEAT]** Search / filter on users and devices tables — with many rows, finding a specific user or device requires scrolling.
- **[FEAT]** Pagination — all tables load full result sets. Add limit/offset or cursor-based pagination.
- **[FEAT]** Telemetry viewer per device in admin — no way to inspect device telemetry history from the admin panel.
- **[FEAT]** Admin can manually verify a user's email — should be a button in the user row.
- **[FEAT]** Admin can reset a user's password — useful for support without the forgot-password email flow.
- **[FEAT]** Invite code management — create, list, and revoke invite codes instead of a single static env var.
- **[FEAT]** Bulk delete users / devices.
- **[FEAT]** Audit log of admin actions (who deleted what, when).
- **[FEAT]** Password show/hide toggle on admin create-user modal.
- **[FEAT]** Auto-refresh toggle — dashboard refreshes every 30 s automatically; add a toggle to pause it.

---

## Improvements

### Marketing
- **[IMPROVE]** The `setup.html` notice says "A one-click flashing tool is coming soon" — should link to ESP Web Tools directly or embed it.
- **[IMPROVE]** No `<link rel="canonical">` on marketing pages — may cause duplicate content issues.
- **[IMPROVE]** Footer copyright year is hardcoded as `2026` — will need updating.

### App
- **[IMPROVE]** Loading state is plain "Loading…" text — replace with a proper spinner or skeleton cards.
- **[IMPROVE]** Empty state on dashboard is a plain text box — add an illustration and clearer call to action.
- **[IMPROVE]** Cache-busting via `?v=2` query strings — manual process, prone to being forgotten. Consider using a build tool (Vite or esbuild) to hash file names automatically.
- **[IMPROVE]** `app/index.html` redirects based on `localStorage.getItem('token')` — expired tokens still present in localStorage would cause a redirect to dashboard which then immediately redirects to login (double redirect). Should validate token expiry before redirecting.

### Admin
- **[IMPROVE]** `admin/index.html` verifies the admin key by calling the real API on every login — adds API latency to the login UX. Minor.
- **[IMPROVE]** `_headers` for admin was missing before this session, meaning no CSP or security headers were sent. Now fixed.

---

## Infrastructure

- **[IMPROVE]** No CI/CD — deploys are manual `wrangler pages deploy` commands. A GitHub Actions workflow would deploy automatically on push to `main` for each project.
- **[IMPROVE]** No staging environment — all changes go straight to production.
- **[IMPROVE]** Cache headers for JS/CSS are `max-age=14400` (4 h) via Cloudflare Pages defaults — consider longer TTLs with file-name hashing for better performance.
