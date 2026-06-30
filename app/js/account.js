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
})

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
  api.token.clear()
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

  api.token.clear()
  location.replace('/login.html?deleted=1')
})
