if (api.token.get()) location.replace('/dashboard.html')

const isRegister = !!document.getElementById('register-form')
const form = document.getElementById(isRegister ? 'register-form' : 'login-form')
const errorEl = document.getElementById('error')
const submitBtn = form.querySelector('button[type=submit]')

// Show confirmation when redirected here after self-service account deletion
if (!isRegister && new URLSearchParams(location.search).get('deleted') === '1') {
  history.replaceState(null, '', '/login.html')
  const notice = document.createElement('div')
  notice.className = 'success-msg show'
  notice.textContent = 'Your account has been deleted. Sorry to see you go.'
  errorEl.after(notice)
}

function showError(msg) {
  errorEl.textContent = msg
  errorEl.classList.add('show')
}

function setLoading(on) {
  submitBtn.disabled = on
  submitBtn.textContent = on
    ? (isRegister ? 'Creating account…' : 'Signing in…')
    : (isRegister ? 'Create account' : 'Sign in')
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorEl.classList.remove('show')

  const email    = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value

  setLoading(true)

  if (isRegister) {
    const inviteCode = (document.getElementById('invite-code')?.value ?? '').trim()
    const { error } = await api.register(email, password, inviteCode)
    if (error) { showError(error); setLoading(false); return }
    const { data, error: loginErr } = await api.login(email, password)
    if (loginErr) { location.replace('/login.html'); return }
    api.token.set(data.token)
  } else {
    const { data, error } = await api.login(email, password)
    if (error) {
      showError(error === 'invalid credentials' ? 'Invalid email or password.' : error)
      setLoading(false)
      return
    }
    api.token.set(data.token)
  }

  location.replace('/dashboard.html')
})
