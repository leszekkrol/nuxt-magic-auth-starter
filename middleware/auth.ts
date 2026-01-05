/**
 * Authentication middleware
 * 
 * Protects routes that require authentication.
 * Redirects unauthenticated users to login page with return URL.
 * 
 * @example
 * ```vue
 * <script setup>
 * definePageMeta({
 *   middleware: 'auth'
 * })
 * </script>
 * ```
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { user, refreshUser } = useAuth()
  
  // Ensure user state is loaded (handles page refresh scenarios)
  if (user.value === null) {
    await refreshUser()
  }
  
  // Redirect unauthenticated users to login with return path
  if (!user.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})
