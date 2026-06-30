const API = 'https://api.onoffmypc.com'

function key() {
  const k = sessionStorage.getItem('admin_key')
  if (!k) { location.replace('/'); return '' }
  return k
}

async function req(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key()}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).catch(() => null)

  if (!res) return { error: 'network error' }
  if (res.status === 401) { sessionStorage.removeItem('admin_key'); location.replace('/'); return { error: 'unauthorized' } }
  const data = await res.json()
  if (!res.ok) return { error: data.error || 'request failed' }
  return { data }
}

const adminApi = {
  stats:        ()                     => req('GET',    '/admin/stats'),
  users:        ()                     => req('GET',    '/admin/users'),
  devices:      ()                     => req('GET',    '/admin/devices'),
  activity:     ()                     => req('GET',    '/admin/activity'),
  createUser:   (email, password)      => req('POST',   '/admin/users', { email, password }),
  deleteUser:   (id)                   => req('DELETE', `/admin/users/${id}`),
  deleteDevice: (id)                   => req('DELETE', `/admin/devices/${id}`),
  signOut:      ()                     => { sessionStorage.removeItem('admin_key'); location.replace('/') },
}
