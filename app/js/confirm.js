// Shared styled confirm dialog. Returns a Promise that resolves true when the
// user confirms and false when they cancel (button, backdrop click, or Escape).
// Reuses the app's .modal-backdrop/.modal classes so it matches the account
// page's delete modal. CSP-safe: DOM is built in JS with addEventListener, no
// inline handlers or style attributes.
function confirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false } = {}) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div')
    backdrop.className = 'modal-backdrop'

    const dialog = document.createElement('div')
    dialog.className = 'modal confirm-dialog'
    dialog.setAttribute('role', 'dialog')
    dialog.setAttribute('aria-modal', 'true')

    const h = document.createElement('h2')
    h.textContent = title
    const p = document.createElement('p')
    p.textContent = message

    const actions = document.createElement('div')
    actions.className = 'modal-actions'

    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'btn btn-ghost'
    cancelBtn.textContent = cancelLabel

    const okBtn = document.createElement('button')
    okBtn.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`
    okBtn.textContent = confirmLabel

    actions.append(cancelBtn, okBtn)
    dialog.append(h, p, actions)
    backdrop.append(dialog)
    document.body.append(backdrop)

    okBtn.focus()

    function close(result) {
      document.removeEventListener('keydown', onKey)
      backdrop.remove()
      resolve(result)
    }
    function onKey(e) {
      if (e.key === 'Escape') close(false)
      if (e.key === 'Enter') close(true)
    }

    cancelBtn.addEventListener('click', () => close(false))
    okBtn.addEventListener('click', () => close(true))
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(false) })
    document.addEventListener('keydown', onKey)
  })
}
