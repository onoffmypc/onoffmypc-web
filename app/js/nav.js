// Mobile hamburger nav: toggles the .nav-actions dropdown on small screens.
// CSP-safe (no inline handlers). The toggle button is hidden via CSS on wide
// viewports, so this is a no-op there.
(function () {
  var toggle = document.getElementById('nav-toggle')
  var actions = document.getElementById('nav-actions')
  if (!toggle || !actions) return

  toggle.addEventListener('click', function (e) {
    e.stopPropagation()
    var open = actions.classList.toggle('open')
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
  })

  // Close when clicking outside the menu.
  document.addEventListener('click', function (e) {
    if (!actions.classList.contains('open')) return
    if (actions.contains(e.target) || toggle.contains(e.target)) return
    actions.classList.remove('open')
    toggle.setAttribute('aria-expanded', 'false')
  })

  // Close on Escape.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      actions.classList.remove('open')
      toggle.setAttribute('aria-expanded', 'false')
    }
  })
})()
