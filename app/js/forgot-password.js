api.me().then(({ data }) => { if (data) location.replace('/dashboard.html') })

const form      = document.getElementById('forgot-form')
const errorEl   = document.getElementById('error')
const successEl = document.getElementById('success')
const btn       = form.querySelector('button[type=submit]')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorEl.classList.remove('show')
  successEl.classList.remove('show')

  const email = document.getElementById('email').value.trim()
  btn.disabled = true
  btn.textContent = 'Sending…'

  await api.forgotPassword(email)

  // Always show the same message regardless of outcome (prevents email enumeration)
  btn.disabled = false
  btn.textContent = 'Send reset link'
  successEl.textContent = 'If an account with that email exists, a reset link is on its way.'
  successEl.classList.add('show')
  form.reset()
})
