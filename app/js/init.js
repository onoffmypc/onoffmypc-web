if (localStorage.getItem('token')) {
  location.replace('/dashboard.html')
} else {
  location.replace('/login.html')
}
