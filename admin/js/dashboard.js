// Verify session key is present and hasn't expired (24h)
;(function checkSession() {
  const key     = sessionStorage.getItem('admin_key')
  const expires = parseInt(sessionStorage.getItem('admin_key_expires') || '0', 10)
  if (!key || Date.now() > expires) {
    sessionStorage.removeItem('admin_key')
    sessionStorage.removeItem('admin_key_expires')
    location.replace('/')
  }
})()

// ── Utilities ──────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function isOnline(last_seen_at) {
  if (!last_seen_at) return false
  return (Date.now() - new Date(last_seen_at).getTime()) / 1000 < 90
}

function cmdLabel(type) {
  return { power_on: 'Power On', power_off: 'Power Off', power_off_force: 'Force Off', reset: 'Reset' }[type] ?? type
}

function toast(msg, type = 'success') {
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = msg
  document.getElementById('toast-wrap').appendChild(el)
  setTimeout(() => el.remove(), 4000)
}

// ── Confirm dialog ────────────────────────────────────────────────────────────

function confirmDialog(title, msg) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal')
    document.getElementById('confirm-title').textContent = title
    document.getElementById('confirm-msg').textContent   = msg
    modal.style.display = 'flex'

    function cleanup(result) {
      modal.style.display = 'none'
      document.getElementById('confirm-ok').onclick     = null
      document.getElementById('confirm-cancel').onclick = null
      resolve(result)
    }

    document.getElementById('confirm-ok').onclick     = () => cleanup(true)
    document.getElementById('confirm-cancel').onclick = () => cleanup(false)
  })
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderStats(s) {
  document.getElementById('s-users').textContent   = s.users
  document.getElementById('s-devices').textContent = s.devices
  document.getElementById('s-online').textContent  = s.online_devices
  document.getElementById('s-cmds').textContent    = s.commands_today
  document.getElementById('s-tel').textContent     = s.telemetry_today
}

function renderUsers(users) {
  document.getElementById('users-count').textContent = `${users.length} total`
  const body = document.getElementById('users-body')
  if (users.length === 0) {
    body.innerHTML = '<tr class="empty-row"><td colspan="4">No users yet.</td></tr>'
    return
  }
  body.innerHTML = users.map(u => `
    <tr>
      <td>${esc(u.email)}</td>
      <td class="mono">${fmtDate(u.created_at)}</td>
      <td>${u.device_count}</td>
      <td>
        <button class="btn btn-danger btn-sm" data-action="delete-user" data-id="${esc(u.id)}" data-email="${esc(u.email)}">Delete</button>
      </td>
    </tr>`).join('')
}

function renderDevices(devices) {
  document.getElementById('devices-count').textContent = `${devices.length} total`
  const body = document.getElementById('devices-body')
  if (devices.length === 0) {
    body.innerHTML = '<tr class="empty-row"><td colspan="6">No devices yet.</td></tr>'
    return
  }
  body.innerHTML = devices.map(d => {
    const online = isOnline(d.last_seen_at)
    return `
    <tr>
      <td>${esc(d.name)}</td>
      <td>${esc(d.user_email)}</td>
      <td><span class="badge ${online ? 'badge-online' : 'badge-offline'}">${online ? 'Online' : 'Offline'}</span></td>
      <td class="mono">${timeAgo(d.last_seen_at)}</td>
      <td class="mono">${esc(d.firmware_version) || '—'}</td>
      <td>
        <button class="btn btn-danger btn-sm" data-action="delete-device" data-id="${esc(d.id)}" data-name="${esc(d.name)}">Delete</button>
      </td>
    </tr>`
  }).join('')
}

function renderActivity(rows) {
  const body = document.getElementById('activity-body')
  if (rows.length === 0) {
    body.innerHTML = '<tr class="empty-row"><td colspan="5">No commands yet.</td></tr>'
    return
  }
  body.innerHTML = rows.map(r => {
    let badgeClass = 'badge-offline'
    if (r.status === 'delivered') badgeClass = 'badge-online'
    else if (r.status === 'pending') badgeClass = 'badge-pending'
    return `
    <tr>
      <td class="mono">${fmtDate(r.created_at)}</td>
      <td>${esc(r.user_email)}</td>
      <td>${esc(r.device_name)}</td>
      <td>${cmdLabel(r.type)}</td>
      <td><span class="badge ${badgeClass}">${esc(r.status)}</span></td>
    </tr>`
  }).join('')
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function deleteUser(id, email) {
  const ok = await confirmDialog('Delete User', `Delete ${email} and all their devices and data? This cannot be undone.`)
  if (!ok) return
  const { error } = await adminApi.deleteUser(id)
  if (error) { toast(error, 'error'); return }
  toast(`${email} deleted`)
  load()
}

async function deleteDevice(id, name) {
  const ok = await confirmDialog('Delete Device', `Delete "${name}" and all its telemetry and commands? This cannot be undone.`)
  if (!ok) return
  const { error } = await adminApi.deleteDevice(id)
  if (error) { toast(error, 'error'); return }
  toast(`${name} deleted`)
  load()
}

// ── Load ──────────────────────────────────────────────────────────────────────

async function load() {
  const [statsRes, usersRes, devicesRes, activityRes] = await Promise.all([
    adminApi.stats(),
    adminApi.users(),
    adminApi.devices(),
    adminApi.activity(),
  ])

  // Surface load errors rather than silently leaving sections at "Loading…"
  const errors = [statsRes, usersRes, devicesRes, activityRes]
    .map(r => r.error)
    .filter(Boolean)

  if (errors.length) {
    toast(errors[0], 'error')
  }

  if (statsRes.data)    renderStats(statsRes.data)
  if (usersRes.data)    renderUsers(usersRes.data)
  if (devicesRes.data)  renderDevices(devicesRes.data)
  if (activityRes.data) renderActivity(activityRes.data)
}

// ── Create user modal ─────────────────────────────────────────────────────────

document.getElementById('create-user-btn').addEventListener('click', () => {
  document.getElementById('cu-email').value    = ''
  document.getElementById('cu-password').value = ''
  document.getElementById('create-user-error').classList.remove('show')
  document.getElementById('create-user-modal').style.display = 'flex'
  setTimeout(() => document.getElementById('cu-email').focus(), 50)
})

document.getElementById('cu-cancel').addEventListener('click', () => {
  document.getElementById('create-user-modal').style.display = 'none'
})

document.getElementById('cu-submit').addEventListener('click', async () => {
  const email    = document.getElementById('cu-email').value.trim()
  const password = document.getElementById('cu-password').value
  const errEl    = document.getElementById('create-user-error')
  errEl.classList.remove('show')

  if (!email || !password) {
    errEl.textContent = 'Email and password are required.'
    errEl.classList.add('show')
    return
  }

  const btn = document.getElementById('cu-submit')
  btn.disabled = true
  btn.textContent = 'Creating…'

  const { error } = await adminApi.createUser(email, password)
  btn.disabled = false
  btn.textContent = 'Create'

  if (error) {
    errEl.textContent = error
    errEl.classList.add('show')
    return
  }

  document.getElementById('create-user-modal').style.display = 'none'
  toast(`User ${email} created`)
  load()
})

// ── Table event delegation (replaces inline onclick on generated rows) ────────

document.getElementById('users-body').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]')
  if (!btn) return
  if (btn.dataset.action === 'delete-user') deleteUser(btn.dataset.id, btn.dataset.email)
})

document.getElementById('devices-body').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]')
  if (!btn) return
  if (btn.dataset.action === 'delete-device') deleteDevice(btn.dataset.id, btn.dataset.name)
})

// ── Init ──────────────────────────────────────────────────────────────────────

document.getElementById('signout-btn').addEventListener('click', () => adminApi.signOut())

load()
setInterval(load, 30000)
