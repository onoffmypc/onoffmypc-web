const API_BASE = 'https://api.onoffmypc.com'

// Auth is a HttpOnly `session` cookie set by the API on login — the token is
// never readable or stored by page JS. Requests opt into sending it with
// credentials:'include'. Pages that require auth are gated by the 401 handler
// below rather than a client-side token check.
// Match both clean URLs (/login) and .html (/login.html) — Cloudflare Pages serves
// the clean form, so location.pathname is usually extensionless.
const AUTH_PAGES = /\/(login|register|forgot-password|reset-password|verify-email)(\.html)?$/

async function apiReq(method, path, body) {
  try {
    const res = await fetch(API_BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    // No/expired session on a protected page → send them to sign in.
    if (res.status === 401 && !AUTH_PAGES.test(location.pathname)) {
      location.replace('/login.html')
      return { error: 'unauthorized' }
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { error: data.error || 'request failed' }
    return { data }
  } catch {
    return { error: 'network error' }
  }
}

const api = {
  // Real gating happens via the 401 handler in apiReq; kept for callers.
  requireAuth: () => true,
  login:          (email, password)              => apiReq('POST',   '/auth/login',          { email, password }),
  register:       (email, password, invite_code) => apiReq('POST',   '/auth/register',       { email, password, invite_code }),
  logout:         ()                             => apiReq('POST',   '/auth/logout'),
  me:             ()                             => apiReq('GET',    '/auth/me'),
  deleteAccount:  ()                             => apiReq('DELETE', '/auth/account'),
  forgotPassword: (email)                        => apiReq('POST',   '/auth/forgot-password', { email }),
  resetPassword:  (token, password)              => apiReq('POST',   '/auth/reset-password',  { token, password }),
  verifyEmail:    (token)                        => apiReq('GET',    `/auth/verify-email?token=${encodeURIComponent(token)}`),
  resendVerify:   ()                             => apiReq('POST',   '/auth/resend-verify'),
  changePassword: (current_password, new_password) => apiReq('POST', '/auth/change-password', { current_password, new_password }),
  changeEmail:    (new_email, password)          => apiReq('POST', '/auth/change-email', { new_email, password }),
  devices:        ()                             => apiReq('GET',    '/devices'),
  getDevice:      (id)                           => apiReq('GET',    `/devices/${id}`),
  deviceStatus:   (id)                           => apiReq('GET',    `/devices/${id}/status`),
  history:        (id, days = 7)                 => apiReq('GET',    `/telemetry/${id}/history?days=${days}`),
  addDevice:      (name)                         => apiReq('POST',   '/devices',             { name }),
  renameDevice:   (id, name)                     => apiReq('PATCH',  `/devices/${id}`,       { name }),
  deleteDevice:   (id)                           => apiReq('DELETE', `/devices/${id}`),
  sendCommand:    (deviceId, type)               => apiReq('POST',   `/commands/${deviceId}`, { type }),
  commands:       (deviceId)                     => apiReq('GET',    `/commands/${deviceId}`),
  schedule:       (deviceId, type, run_at)       => apiReq('POST',   `/commands/${deviceId}/schedule`, { type, run_at }),
  schedules:      (deviceId)                     => apiReq('GET',    `/commands/${deviceId}/schedule`),
  cancelSchedule: (deviceId, id)                 => apiReq('DELETE', `/commands/${deviceId}/schedule/${id}`),
  telemetry:      (deviceId)                     => apiReq('GET',    `/telemetry/${deviceId}`),
}
