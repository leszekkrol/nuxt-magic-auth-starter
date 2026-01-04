export default defineNuxtRouteMiddleware(async (to) => {
  const { user, refreshUser } = useAuth()
  
  // Refresh user data if not loaded
  if (user.value === null) {
    await refreshUser()
  }
  
  // Redirect to login if not authenticated
  if (!user.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})

