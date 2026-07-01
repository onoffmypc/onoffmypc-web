// Route to the dashboard if a valid session cookie exists, otherwise to login.
api.me().then(({ data }) => {
  location.replace(data ? '/dashboard.html' : '/login.html')
})
