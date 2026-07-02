// Contact form: submit over fetch to the /api/contact Pages Function so the
// visitor stays on the page, with an inline status message.
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
    var btn = form.querySelector('button[type=submit]')
    btn.disabled = true
    setStatus('Sending…', '')

    var payload = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
      company: form.company.value, // honeypot
    }

    try {
      var res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      var data = await res.json().catch(function () { return {} })
      if (res.ok && data.ok) {
        form.reset()
        setStatus('Thanks — your message has been sent. We’ll be in touch.', 'success')
      } else {
        setStatus(data.error || ('Something went wrong. Please email ' + SUPPORT_EMAIL + ' instead.'), 'error')
      }
    } catch (err) {
      setStatus('Network error. Please email ' + SUPPORT_EMAIL + ' instead.', 'error')
    } finally {
      btn.disabled = false
    }
  })
})()
