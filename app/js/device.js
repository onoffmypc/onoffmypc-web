if (!api.requireAuth()) throw new Error('unauthenticated')

const params   = new URLSearchParams(location.search)
const deviceId = params.get('id')

// Reject missing or malformed device IDs before making any API call.
// Stop script execution after redirecting so no API call fires with a bad id.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
if (!deviceId || !UUID_RE.test(deviceId)) {
  location.replace('/dashboard.html')
  throw new Error('invalid device id')
}

// Load device name from API (not URL — URL param becomes stale after a rename)
api.getDevice(deviceId).then(({ data, error }) => {
  if (error || !data) { location.replace('/dashboard.html'); return }
  document.title = `${data.name} — OnOffMyPC`
  document.getElementById('device-title').textContent = data.name
  if (data.firmware_version) {
    const fw = document.getElementById('device-firmware')
    fw.textContent = `Firmware ${data.firmware_version}`
    fw.classList.remove('is-hidden')
  }
})

// Live "refreshed X ago" indicator for the 30s auto-refresh.
let lastRefresh = 0
function tickRefresh() {
  const el = document.getElementById('refresh-indicator')
  if (!el || !lastRefresh) return
  const s = Math.floor((Date.now() - lastRefresh) / 1000)
  el.textContent = s < 2 ? 'Refreshed just now' : `Refreshed ${s}s ago`
}
setInterval(tickRefresh, 1000)

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
  const [telRes, cmdRes, statusRes, histRes] = await Promise.all([
    api.telemetry(deviceId),
    api.commands(deviceId),
    api.deviceStatus(deviceId),
    api.history(deviceId, 7),
  ])

  document.getElementById('loading').style.display = 'none'
  document.getElementById('content').style.display = 'block'

  lastRefresh = Date.now()
  tickRefresh()

  renderStats((telRes.data || [])[0] || null, statusRes.data || null)
  renderTelemetryTable(telRes.data || [])
  renderCommandsTable(cmdRes.data || [])
  renderChart(histRes.data || [])
  loadSchedules()
}

async function loadSchedules() {
  const { data } = await api.schedules(deviceId)
  const el = document.getElementById('schedules-list')
  const rows = data || []
  if (rows.length === 0) { el.innerHTML = '<p class="text-muted">No scheduled commands.</p>'; return }
  el.innerHTML = rows.map(s => `
    <div class="schedule-row">
      <span>${cmdLabel(s.type)} — ${fmtTime(s.run_at)}</span>
      <button class="ghost-btn" data-action="cancel-sched" data-id="${s.id}">Cancel</button>
    </div>`).join('')
}

function renderStats(latest, status) {
  const statusEl = document.getElementById('device-status')
  // Presence comes from the Durable Object (accurate), not telemetry age.
  const online = status ? status.online : false
  statusEl.className = `badge ${online ? 'badge-online' : 'badge-offline'}`
  statusEl.textContent = online ? 'Online' : 'Offline'

  if (!latest) {
    document.getElementById('stat-pc').textContent       = '—'
    document.getElementById('stat-temp').textContent     = '—'
    document.getElementById('stat-humidity').textContent = '—'
    document.getElementById('stat-rssi').textContent     = '—'
    document.getElementById('stat-updated').textContent  = '—'
    return
  }

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
    el.innerHTML = '<tr><td colspan="5" class="text-muted">No telemetry yet.</td></tr>'
    return
  }
  el.innerHTML = rows.map(r => `
    <tr>
      <td>${fmtTime(r.recorded_at)}</td>
      <td>${r.pc_on === 1 ? '<span class="text-on">On</span>' : '<span class="text-off">Off</span>'}</td>
      <td>${r.room_temp     != null ? r.room_temp.toFixed(1) + '°C' : '—'}</td>
      <td>${r.room_humidity != null ? r.room_humidity.toFixed(0) + '%' : '—'}</td>
      <td>${r.rssi          != null ? r.rssi + ' dBm' : '—'}</td>
    </tr>`).join('')
}

function renderCommandsTable(rows) {
  const el = document.getElementById('commands-body')
  if (rows.length === 0) {
    el.innerHTML = '<tr><td colspan="3" class="text-muted">No commands yet.</td></tr>'
    return
  }
  el.innerHTML = rows.map(r => `
    <tr>
      <td>${fmtTime(r.created_at)}</td>
      <td>${cmdLabel(r.type)}</td>
      <td><span class="badge ${statusBadgeClass(r.status)}">${r.status}</span></td>
    </tr>`).join('')
}

// Minimal dependency-free SVG line chart of hourly average temperature.
function renderChart(rows) {
  const el = document.getElementById('chart')
  const pts = (rows || []).filter(r => r.temp_avg != null)
  if (pts.length < 2) {
    el.innerHTML = '<p class="text-muted">Not enough data yet for a chart.</p>'
    return
  }
  const W = 640, H = 160, P = 8
  const temps = pts.map(r => r.temp_avg)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  const range = (max - min) || 1
  const n = pts.length
  const x = i => P + (i / (n - 1)) * (W - 2 * P)
  const y = t => H - P - ((t - min) / range) * (H - 2 * P)
  const d = pts.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(r.temp_avg).toFixed(1)}`).join(' ')
  el.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" class="chart-svg" preserveAspectRatio="none" role="img" aria-label="Average temperature over the last 7 days">` +
    `<path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>` +
    `<div class="chart-legend"><span>${min.toFixed(1)}°C</span><span>${max.toFixed(1)}°C</span></div>`
}

async function sendCmd(type) {
  const label = cmdLabel(type)
  if (type === 'power_off_force') {
    const ok = await confirmDialog({
      title: 'Force Off?',
      message: 'Force Off holds the power button for 6 seconds and cuts power immediately. Use only if normal Power Off has no effect.',
      confirmLabel: 'Force Off',
      danger: true,
    })
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

// Schedule a command
document.getElementById('sched-btn').addEventListener('click', async (e) => {
  const btn   = e.currentTarget
  const type  = document.getElementById('sched-type').value
  const atVal = document.getElementById('sched-at').value
  const errEl = document.getElementById('sched-error')
  errEl.classList.remove('show')

  if (!atVal) { errEl.textContent = 'Pick a date and time.'; errEl.classList.add('show'); return }
  const when = new Date(atVal) // datetime-local is interpreted in local time
  if (isNaN(when.getTime()) || when.getTime() <= Date.now()) {
    errEl.textContent = 'Choose a time in the future.'; errEl.classList.add('show'); return
  }

  btn.disabled = true
  const { error } = await api.schedule(deviceId, type, when.toISOString())
  btn.disabled = false
  if (error) { errEl.textContent = error; errEl.classList.add('show'); return }
  document.getElementById('sched-at').value = ''
  toast('Command scheduled')
  loadSchedules()
})

// Cancel a scheduled command (event delegation, CSP-safe)
document.getElementById('schedules-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action="cancel-sched"]')
  if (!btn) return
  const { error } = await api.cancelSchedule(deviceId, btn.dataset.id)
  if (error) { toast(error, 'error'); return }
  toast('Schedule cancelled')
  loadSchedules()
})

document.getElementById('logout-btn').addEventListener('click', async () => {
  await api.logout()
  location.replace('/login.html')
})

setInterval(load, 30000)
load()
