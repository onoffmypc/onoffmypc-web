api.me().then(({ data }) => { if (data) location.replace('/dashboard.html') })

const token     = new URLSearchParams(location.search).get('token')
const form      = document.getElementById('reset-form')
const errorEl   = document.getElementById('error')
const successEl = document.getElementById('success')
const btn       = form.querySelector('button[type=submit]')

if (!token) {
  errorEl.textContent = 'Invalid or missing reset link. Please request a new one.'
  errorEl.classList.add('show')
  btn.disabled = true
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorEl.classList.remove('show')
  successEl.classList.remove('show')

  const password = document.getElementById('password').value
  const confirm  = document.getElementById('confirm').value

  if (password.length < 8) {
    errorEl.textContent = 'Password must be at least 8 characters.'
    errorEl.classList.add('show')
    return
  }
  if (password !== confirm) {
    errorEl.textContent = 'Passwords do not match.'
    errorEl.classList.add('show')
    return
  }

  btn.disabled = true
  btn.textContent = 'Saving…'

  const { error } = await api.resetPassword(token, password)

  if (error) {
    btn.disabled = false
    btn.textContent = 'Set new password'
    errorEl.textContent = error === 'invalid or expired reset link'
      ? 'This reset link has expired or already been used. Please request a new one.'
      : error
    errorEl.classList.add('show')
    return
  }

  form.style.display = 'none'
  successEl.textContent = 'Password updated. Redirecting to sign in…'
  successEl.classList.add('show')
  setTimeout(() => location.replace('/login.html?reset=1'), 2000)
})
