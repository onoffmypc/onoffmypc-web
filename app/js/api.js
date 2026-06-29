const API_BASE = 'https://api.onoffmypc.com'

function getToken() { return localStorage.getItem('token') }
function setToken(t) { localStorage.setItem('token', t) }
function clearAuth() { localStorage.removeItem('token') }

function requireAuth() {
  if (!getToken()) { location.replace('/login.html'); return false }
  return true
}

async function apiReq(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const t = getToken()
  if (t) headers['Authorization'] = `Bearer ${t}`
  try {
    const res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (res.status === 401) { clearAuth(); location.replace('/login.html'); return { error: 'unauthorized' } }
    const data = await res.json()
    if (!res.ok) return { error: data.error || 'request failed' }
    return { data }
  } catch {
    return { error: 'network error' }
  }
}

const api = {
  token: { get: getToken, set: setToken, clear: clearAuth },
  requireAuth,
  login:        (email, password) => apiReq('POST', '/auth/login',      { email, password }),
  register:     (email, password) => apiReq('POST', '/auth/register',   { email, password }),
  devices:      ()                => apiReq('GET',  '/devices'),
  addDevice:    (name)            => apiReq('POST', '/devices',          { name }),
  renameDevice: (id, name)        => apiReq('PATCH',  `/devices/${id}`, { name }),
  deleteDevice: (id)              => apiReq('DELETE', `/devices/${id}`),
  sendCommand:  (deviceId, type)  => apiReq('POST', `/commands/${deviceId}`, { type }),
  commands:     (deviceId)        => apiReq('GET',  `/commands/${deviceId}`),
  telemetry:    (deviceId)        => apiReq('GET',  `/telemetry/${deviceId}`),
}
