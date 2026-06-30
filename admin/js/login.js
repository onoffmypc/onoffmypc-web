const _key     = sessionStorage.getItem('admin_key')
const _expires = parseInt(sessionStorage.getItem('admin_key_expires') || '0', 10)
if (_key && Date.now() <= _expires) {
  location.replace('/dashboard.html')
} else if (_key) {
  sessionStorage.removeItem('admin_key')
  sessionStorage.removeItem('admin_key_expires')
}

const input  = document.getElementById('key-input')
const errEl  = document.getElementById('error')
const btn    = document.getElementById('login-btn')

async function tryLogin() {
  const key = input.value.trim()
  if (!key) return
  btn.disabled = true
  btn.textContent = 'Verifying…'
  errEl.classList.remove('show')

  const res = await fetch('https://api.onoffmypc.com/admin/stats', {
    headers: { 'Authorization': `Bearer ${key}` }
  }).catch(() => null)

  btn.disabled = false
  btn.textContent = 'Sign in'

  if (!res || res.status === 401) {
    errEl.textContent = 'Invalid admin key.'
    errEl.classList.add('show')
    input.select()
    return
  }

  sessionStorage.setItem('admin_key', key)
  sessionStorage.setItem('admin_key_expires', String(Date.now() + 86400_000))
  location.replace('/dashboard.html')
}

btn.addEventListener('click', tryLogin)
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin() })
input.focus()
