if (!api.requireAuth()) throw new Error('unauthenticated')

let devices = []

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function toast(msg, type = 'success') {
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = msg
  document.getElementById('toast-wrap').appendChild(el)
  setTimeout(() => el.remove(), 4000)
}

async function loadDevices() {
  const { data, error } = await api.devices()
  if (error) {
    document.getElementById('devices-list').innerHTML = '<p class="loading">Failed to load devices.</p>'
    return
  }
  devices = data
  renderDevices()
  devices.forEach(fetchStatus)
}

function renderDevices() {
  const el = document.getElementById('devices-list')
  if (devices.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <p>No devices yet.</p>
        <button class="btn btn-primary" onclick="openAddModal()">Add your first device</button>
      </div>`
    return
  }
  el.innerHTML = `<div class="devices-grid">${devices.map(deviceCard).join('')}</div>`
}

function deviceCard(d) {
  const nameParam = encodeURIComponent(d.name)
  return `
    <div class="device-card" data-id="${esc(d.id)}">
      <div class="device-card-header">
        <span class="device-name" id="name-${esc(d.id)}">${esc(d.name)}</span>
        <span class="badge badge-offline" id="badge-${esc(d.id)}">—</span>
      </div>
      <div class="device-controls">
        <button class="btn btn-success btn-sm" onclick="sendCmd('${esc(d.id)}','power_on')">Power On</button>
        <button class="btn btn-danger btn-sm"  onclick="sendCmd('${esc(d.id)}','power_off')">Power Off</button>
        <button class="btn btn-danger btn-sm"  onclick="sendCmd('${esc(d.id)}','power_off_force')" title="Hold power button 6s">Force Off</button>
        <button class="btn btn-warn btn-sm"    onclick="sendCmd('${esc(d.id)}','reset')">Reset</button>
      </div>
      <div class="device-footer">
        <a href="/device.html?id=${esc(d.id)}&name=${nameParam}">View details →</a>
        <span class="footer-actions">
          <button class="ghost-btn" onclick="startRename('${esc(d.id)}')">Rename</button>
          <button class="delete-btn" onclick="deleteDevice('${esc(d.id)}','${esc(d.name)}')">Delete</button>
        </span>
      </div>
    </div>`
}

async function fetchStatus(device) {
  const { data } = await api.telemetry(device.id)
  if (!data || data.length === 0) return
  const latest = data[0]
  const badge = document.getElementById(`badge-${device.id}`)
  if (!badge) return
  const age = (Date.now() - new Date(latest.recorded_at).getTime()) / 1000
  if (age < 90) {
    const on = latest.pc_on === 1
    badge.className = `badge ${on ? 'badge-on' : 'badge-off'}`
    badge.textContent = on ? 'PC On' : 'PC Off'
  } else {
    badge.className = 'badge badge-offline'
    badge.textContent = 'Offline'
  }
}

async function sendCmd(deviceId, type) {
  const labels = { power_on: 'Power On', power_off: 'Power Off', power_off_force: 'Force Off', reset: 'Reset' }
  if (type === 'power_off_force') {
    if (!confirm('Force Off holds the power button for 6 seconds and cuts power immediately. Use only if normal Power Off has no effect. Continue?')) return
  }
  const { data, error } = await api.sendCommand(deviceId, type)
  if (error) { toast(error, 'error'); return }
  if (!data.delivered) {
    toast(`${labels[type]}: device offline`, 'error')
  } else {
    toast(`${labels[type]} sent`)
  }
}

async function deleteDevice(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
  const { error } = await api.deleteDevice(id)
  if (error) { toast(error, 'error'); return }
  toast('Device removed')
  devices = devices.filter(d => d.id !== id)
  renderDevices()
}

function startRename(id) {
  const device = devices.find(d => d.id === id)
  if (!device) return
  const nameEl = document.getElementById(`name-${id}`)
  if (!nameEl) return

  const input = document.createElement('input')
  input.type = 'text'
  input.className = 'inline-rename'
  input.value = device.name
  input.maxLength = 64

  nameEl.replaceWith(input)
  input.select()

  async function commit() {
    const newName = input.value.trim()
    if (!newName || newName === device.name) {
      renderDevices()
      return
    }
    const { error } = await api.renameDevice(id, newName)
    if (error) { toast(error, 'error'); renderDevices(); return }
    device.name = newName
    toast('Device renamed')
    renderDevices()
  }

  input.addEventListener('blur', commit)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { input.blur() }
    if (e.key === 'Escape') { device._cancel = true; renderDevices() }
  })
}

// ── Add device modal ──
function openAddModal() {
  document.getElementById('add-modal').style.display = 'flex'
  document.getElementById('modal-form').style.display = 'block'
  document.getElementById('token-reveal').style.display = 'none'
  document.getElementById('setup-guide').style.display = 'none'
  document.getElementById('add-error').classList.remove('show')
  document.getElementById('device-name').value = ''
  // Bug fix: clear stale credential values from a previous modal open
  document.getElementById('device-id').textContent    = ''
  document.getElementById('device-token').textContent = ''
  setTimeout(() => document.getElementById('device-name').focus(), 50)
}

document.getElementById('add-device-btn').addEventListener('click', openAddModal)

document.getElementById('cancel-btn').addEventListener('click', () => {
  document.getElementById('add-modal').style.display = 'none'
})

document.getElementById('add-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('add-modal')) document.getElementById('add-modal').style.display = 'none'
})

document.getElementById('device-name').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('create-btn').click()
})

document.getElementById('create-btn').addEventListener('click', async () => {
  const name = document.getElementById('device-name').value.trim()
  if (!name) return

  const errEl = document.getElementById('add-error')
  errEl.classList.remove('show')
  const btn = document.getElementById('create-btn')
  btn.disabled = true
  btn.textContent = 'Creating…'

  const { data, error } = await api.addDevice(name)
  btn.disabled = false
  btn.textContent = 'Create'

  if (error) { errEl.textContent = error; errEl.classList.add('show'); return }

  devices.push(data)
  renderDevices()

  document.getElementById('modal-form').style.display = 'none'
  document.getElementById('device-id').textContent = data.id
  document.getElementById('device-token').textContent = data.token
  document.getElementById('token-reveal').style.display = 'block'
})

document.getElementById('copy-id-btn').addEventListener('click', () => {
  const id = document.getElementById('device-id').textContent
  navigator.clipboard.writeText(id).then(() => toast('Device ID copied'))
})

document.getElementById('copy-token-btn').addEventListener('click', () => {
  const token = document.getElementById('device-token').textContent
  navigator.clipboard.writeText(token).then(() => toast('Token copied'))
})

document.getElementById('show-setup-btn').addEventListener('click', () => {
  document.getElementById('token-reveal').style.display = 'none'
  document.getElementById('setup-guide').style.display = 'block'
})

document.getElementById('done-btn').addEventListener('click', () => {
  document.getElementById('add-modal').style.display = 'none'
})

document.getElementById('logout-btn').addEventListener('click', () => {
  api.token.clear()
  location.replace('/login.html')
})

// Auto-refresh device statuses every 30 seconds
setInterval(() => devices.forEach(fetchStatus), 30000)

loadDevices()
