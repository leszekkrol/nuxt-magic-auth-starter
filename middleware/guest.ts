/**
 * Guest middleware
 * 
 * Protects routes that should only be accessible to unauthenticated users.
 * Redirects authenticated users to dashboard.
 * 
 * Useful for login/register pages to prevent already logged-in users
 * from accessing authentication flows.
 * 
 * @example
 * ```vue
 * <script setup>
 * definePageMeta({
 *   middleware: 'guest'
 * })
 * </script>
 * ```
 */
export default defineNuxtRouteMiddleware(async () => {
  const { user, refreshUser } = useAuth()
  
  // Ensure user state is loaded (handles page refresh scenarios)
  if (user.value === null) {
    await refreshUser()
  }
  
  // Redirect authenticated users away from guest-only pages
  if (user.value) {
    return navigateTo('/dashboard')
  }
})
