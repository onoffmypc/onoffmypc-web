;(async () => {
  const token     = new URLSearchParams(location.search).get('token')
  const statusEl  = document.getElementById('status')
  const errorEl   = document.getElementById('error')
  const successEl = document.getElementById('success')

  if (!token) {
    statusEl.style.display = 'none'
    errorEl.textContent = 'Invalid verification link.'
    errorEl.classList.add('show')
    return
  }

  const { error } = await api.verifyEmail(token)

  statusEl.style.display = 'none'
  if (error) {
    errorEl.textContent = error === 'invalid or expired verification link'
      ? 'This link has expired or already been used. Sign in and request a new one from your account page.'
      : error
    errorEl.classList.add('show')
  } else {
    successEl.textContent = 'Email confirmed! Redirecting…'
    successEl.classList.add('show')
    setTimeout(() => location.replace(api.token.get() ? '/dashboard.html' : '/login.html'), 2000)
  }
})()
