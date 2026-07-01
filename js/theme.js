// Light/dark theme: follows the OS by default, remembers a manual choice, and
// injects a floating toggle. Loaded in <head> so the theme is set before paint.
(function () {
  var KEY = 'onoffmypc-theme'
  var root = document.documentElement

  function stored() {
    try { return localStorage.getItem(KEY) } catch (e) { return null }
  }
  function save(t) {
    try { localStorage.setItem(KEY, t) } catch (e) { /* private mode */ }
  }
  function system() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  function apply(t) { root.dataset.theme = t }

  apply(stored() || system())

  var SUN = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
  var MOON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'

  function mount() {
    if (document.getElementById('theme-toggle')) return
    var btn = document.createElement('button')
    btn.id = 'theme-toggle'
    btn.className = 'theme-toggle'
    btn.type = 'button'
    function label() {
      var t = root.dataset.theme
      btn.innerHTML = t === 'dark' ? SUN : MOON
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')
    }
    label()
    btn.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark'
      save(next); apply(next); label()
    })
    document.body.appendChild(btn)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount)
  else mount()
})()
