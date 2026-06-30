if (!api.requireAuth()) throw new Error('unauthenticated')

const params   = new URLSearchParams(location.search)
const deviceId = params.get('id')

// Reject missing or malformed device IDs before making any API call
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
if (!deviceId || !UUID_RE.test(deviceId)) location.replace('/dashboard.html')

// Load device name from API (not URL — URL param becomes stale after a rename)
api.getDevice(deviceId).then(({ data, error }) => {
  if (error || !data) { location.replace('/dashboard.html'); return }
  document.title = `${data.name} — OnOffMyPC`
  document.getElementById('device-title').textContent = data.name
})

function toast(msg, type = 'success') {
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = msg
  document.getElementById('toast-wrap').appendChild(el)
  setTimeout(() => el.remove(), 4000)
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function fmtTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

function cmdLabel(type) {
  return {
    power_on: 'Power On',
    power_off: 'Power Off',
    power_off_force: 'Force Off',
    reset: 'Reset',
  }[type] || type
}

function statusBadgeClass(status) {
  if (status === 'delivered') return 'badge-online'
  if (status === 'expired')   return 'badge-offline'
  return 'badge-pending'
}

async function load() {
  const [telRes, cmdRes] = await Promise.all([api.telemetry(deviceId), api.commands(deviceId)])

  document.getElementById('loading').style.display = 'none'
  document.getElementById('content').style.display = 'block'

  renderStats((telRes.data || [])[0] || null)
  renderTelemetryTable(telRes.data || [])
  renderCommandsTable(cmdRes.data || [])
}

function renderStats(latest) {
  const statusEl = document.getElementById('device-status')
  if (!latest) {
    statusEl.className = 'badge badge-offline'
    statusEl.textContent = 'No data'
    return
  }
  const age    = (Date.now() - new Date(latest.recorded_at).getTime()) / 1000
  const online = age < 90
  statusEl.className = `badge ${online ? 'badge-online' : 'badge-offline'}`
  statusEl.textContent = online ? 'Online' : 'Offline'

  const on = latest.pc_on === 1
  const pcEl = document.getElementById('stat-pc')
  pcEl.textContent = on ? 'On' : 'Off'
  pcEl.style.color = on ? 'var(--green)' : 'var(--red)'

  document.getElementById('stat-temp').textContent     = latest.room_temp     != null ? `${latest.room_temp.toFixed(1)}°C` : '—'
  document.getElementById('stat-humidity').textContent = latest.room_humidity != null ? `${latest.room_humidity.toFixed(0)}%` : '—'
  document.getElementById('stat-rssi').textContent     = latest.rssi          != null ? `${latest.rssi} dBm` : '—'
  document.getElementById('stat-updated').textContent  = timeAgo(latest.recorded_at)
}

function renderTelemetryTable(rows) {
  const el = document.getElementById('telemetry-body')
  if (rows.length === 0) {
    el.innerHTML = '<tr><td colspan="5" style="color:var(--muted)">No telemetry yet.</td></tr>'
    return
  }
  el.innerHTML = rows.map(r => `
    <tr>
      <td>${fmtTime(r.recorded_at)}</td>
      <td>${r.pc_on === 1 ? '<span style="color:var(--green)">On</span>' : '<span style="color:var(--red)">Off</span>'}</td>
      <td>${r.room_temp     != null ? r.room_temp.toFixed(1) + '°C' : '—'}</td>
      <td>${r.room_humidity != null ? r.room_humidity.toFixed(0) + '%' : '—'}</td>
      <td>${r.rssi          != null ? r.rssi + ' dBm' : '—'}</td>
    </tr>`).join('')
}

function renderCommandsTable(rows) {
  const el = document.getElementById('commands-body')
  if (rows.length === 0) {
    el.innerHTML = '<tr><td colspan="3" style="color:var(--muted)">No commands yet.</td></tr>'
    return
  }
  el.innerHTML = rows.map(r => `
    <tr>
      <td>${fmtTime(r.created_at)}</td>
      <td>${cmdLabel(r.type)}</td>
      <td><span class="badge ${statusBadgeClass(r.status)}">${r.status}</span></td>
    </tr>`).join('')
}

async function sendCmd(type) {
  const label = cmdLabel(type)
  if (type === 'power_off_force') {
    const ok = window.confirm(`Force Off holds the power button for 6 seconds and cuts power immediately. Use only if normal Power Off has no effect. Continue?`)
    if (!ok) return
  }
  const { data, error } = await api.sendCommand(deviceId, type)
  if (error) { toast(error, 'error'); return }
  if (!data.delivered) {
    toast(`${label}: device offline`, 'error')
  } else {
    toast(`${label} command sent`)
    setTimeout(load, 1500)
  }
}

document.getElementById('cmd-power-on').addEventListener('click',        () => sendCmd('power_on'))
document.getElementById('cmd-power-off').addEventListener('click',       () => sendCmd('power_off'))
document.getElementById('cmd-power-off-force').addEventListener('click', () => sendCmd('power_off_force'))
document.getElementById('cmd-reset').addEventListener('click',           () => sendCmd('reset'))

document.getElementById('logout-btn').addEventListener('click', () => {
  api.token.clear()
  location.replace('/login.html')
})

setInterval(load, 30000)
load()
