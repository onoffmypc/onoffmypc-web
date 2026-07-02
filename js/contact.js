// Contact form: submit over fetch so the visitor stays on the page, with an
// inline status message. Works with Formspree (or any endpoint that accepts a
// POST and returns JSON). Until a real form ID is configured, fall back to the
// support email so the form never silently fails.
(function () {
  var form = document.getElementById('contact-form')
  var statusEl = document.getElementById('contact-status')
  if (!form) return

  var SUPPORT_EMAIL = 'support@onoffmypc.com'

  function setStatus(msg, kind) {
    statusEl.textContent = msg
    statusEl.className = 'contact-status ' + (kind || '')
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault()

    // Not wired to a real endpoint yet — point the visitor at email instead.
    if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
      setStatus('The message form isn’t set up yet — please email ' + SUPPORT_EMAIL + ' directly.', 'error')
      return
    }

    var btn = form.querySelector('button[type=submit]')
    btn.disabled = true
    setStatus('Sending…', '')

    try {
      var res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      })
      if (res.ok) {
        form.reset()
        setStatus('Thanks — your message has been sent. We’ll be in touch.', 'success')
      } else {
        setStatus('Something went wrong. Please email ' + SUPPORT_EMAIL + ' instead.', 'error')
      }
    } catch (err) {
      setStatus('Network error. Please email ' + SUPPORT_EMAIL + ' instead.', 'error')
    } finally {
      btn.disabled = false
    }
  })
})()
