if (!api.requireAuth()) throw new Error('unauthenticated')

function toast(msg, type = 'success') {
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = msg
  document.getElementById('toast-wrap').appendChild(el)
  setTimeout(() => el.remove(), 4000)
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

// Load account info
let userEmail = ''
api.me().then(({ data, error }) => {
  if (error || !data) return
  userEmail = data.email
  document.getElementById('account-email').textContent = data.email
  document.getElementById('account-since').textContent = fmtDate(data.created_at)
  if (!data.email_verified) {
    document.getElementById('verify-row').style.display = ''
  }
})

document.getElementById('resend-verify-btn').addEventListener('click', async (e) => {
  const btn = e.currentTarget
  btn.disabled = true
  btn.textContent = 'Sending…'
  const { error } = await api.resendVerify()
  btn.disabled = false
  btn.textContent = 'Resend email'
  if (error) { toast(error, 'error'); return }
  toast('Verification email sent — check your inbox')
})

// Change password
document.getElementById('change-pw-btn').addEventListener('click', async (e) => {
  const btn     = e.currentTarget
  const errEl   = document.getElementById('pw-error')
  const okEl    = document.getElementById('pw-success')
  const cur     = document.getElementById('cur-pw')
  const next    = document.getElementById('new-pw')
  const confirm = document.getElementById('confirm-pw')
  errEl.classList.remove('show'); okEl.classList.remove('show')

  if (!cur.value || !next.value) { errEl.textContent = 'Enter your current and new password.'; errEl.classList.add('show'); return }
  if (next.value.length < 8)      { errEl.textContent = 'New password must be at least 8 characters.'; errEl.classList.add('show'); return }
  if (next.value !== confirm.value) { errEl.textContent = 'New passwords do not match.'; errEl.classList.add('show'); return }

  btn.disabled = true; btn.textContent = 'Saving…'
  const { error } = await api.changePassword(cur.value, next.value)
  btn.disabled = false; btn.textContent = 'Change password'

  if (error) { errEl.textContent = error; errEl.classList.add('show'); return }
  cur.value = ''; next.value = ''; confirm.value = ''
  okEl.textContent = 'Password changed. Other devices have been signed out.'
  okEl.classList.add('show')
})

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await api.logout()
  location.replace('/login.html')
})

// Delete account
document.getElementById('delete-account-btn').addEventListener('click', () => {
  document.getElementById('delete-confirm-email').value = ''
  document.getElementById('delete-error').classList.remove('show')
  document.getElementById('delete-modal').style.display = 'flex'
  setTimeout(() => document.getElementById('delete-confirm-email').focus(), 50)
})

document.getElementById('delete-cancel').addEventListener('click', () => {
  document.getElementById('delete-modal').style.display = 'none'
})

document.getElementById('delete-confirm').addEventListener('click', async () => {
  const typed  = document.getElementById('delete-confirm-email').value.trim().toLowerCase()
  const errEl  = document.getElementById('delete-error')
  errEl.classList.remove('show')

  if (typed !== userEmail) {
    errEl.textContent = 'Email does not match.'
    errEl.classList.add('show')
    return
  }

  const btn = document.getElementById('delete-confirm')
  btn.disabled = true
  btn.textContent = 'Deleting…'

  const { error } = await api.deleteAccount()
  if (error) {
    btn.disabled = false
    btn.textContent = 'Delete forever'
    errEl.textContent = error
    errEl.classList.add('show')
    return
  }

  await api.logout()
  location.replace('/login.html?deleted=1')
})
