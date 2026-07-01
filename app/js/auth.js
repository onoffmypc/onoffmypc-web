// If already signed in (valid session cookie), skip straight to the dashboard.
api.me().then(({ data }) => { if (data) location.replace('/dashboard.html') })

const isRegister = !!document.getElementById('register-form')
const form = document.getElementById(isRegister ? 'register-form' : 'login-form')
const errorEl = document.getElementById('error')
const submitBtn = form.querySelector('button[type=submit]')

// Show a confirmation banner when redirected to sign-in after another flow.
if (!isRegister) {
  const params = new URLSearchParams(location.search)
  const MESSAGES = {
    registered: 'Account created. Please sign in.',
    reset: 'Password updated. Please sign in with your new password.',
    deleted: 'Your account has been deleted. Sorry to see you go.',
  }
  const successEl = document.getElementById('success')
  for (const key of Object.keys(MESSAGES)) {
    if (params.get(key) === '1') {
      history.replaceState(null, '', '/login.html')
      successEl.textContent = MESSAGES[key]
      successEl.classList.add('show')
      break
    }
  }
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
    const confirm = document.getElementById('confirm-password').value
    if (password !== confirm) { showError('Passwords do not match.'); setLoading(false); return }

    const inviteCode = (document.getElementById('invite-code')?.value ?? '').trim()
    const { error } = await api.register(email, password, inviteCode)
    if (error) { showError(error); setLoading(false); return }
    // Registration succeeded; sign in to set the session cookie. If the
    // auto-login fails, send them to sign in with a clear confirmation.
    const { error: loginErr } = await api.login(email, password)
    if (loginErr) { location.replace('/login.html?registered=1'); return }
  } else {
    const { error } = await api.login(email, password)
    if (error) {
      showError(error === 'invalid credentials' ? 'Invalid email or password.' : error)
      setLoading(false)
      return
    }
  }

  location.replace('/dashboard.html')
})
