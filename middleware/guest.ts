export default defineNuxtRouteMiddleware(async () => {
  const { user, refreshUser } = useAuth()
  
  // Refresh user data if not loaded
  if (user.value === null) {
    await refreshUser()
  }
  
  // Redirect to dashboard if already authenticated
  if (user.value) {
    return navigateTo('/dashboard')
  }
})

