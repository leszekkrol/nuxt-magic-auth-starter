import type { Ref } from 'vue'

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Authenticated user data structure
 */
export interface User {
  id: string
  email: string
  name: string | null
  createdAt?: string
}

/**
 * Authentication state managed by the composable
 */
export interface AuthState {
  user: Ref<User | null>
  isLoggedIn: ComputedRef<boolean>
  loading: Ref<boolean>
  error: Ref<string | null>
}

/**
 * Options for sending magic link
 */
export interface SendMagicLinkOptions {
  name?: string
}

/**
 * Result returned after sending magic link
 */
export interface SendMagicLinkResult {
  success: boolean
  message: string
}

/**
 * Result returned after verifying magic link token
 */
export interface VerifyTokenResult {
  success: boolean
  user: User
  isNewUser: boolean
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Authentication composable for magic link authentication
 * 
 * Provides reactive state and methods for:
 * - Sending magic links to users
 * - Verifying magic link tokens
 * - Managing user sessions
 * - Logging out users
 * 
 * @example
 * ```vue
 * <script setup>
 * const { user, isLoggedIn, sendMagicLink, logout } = useAuth()
 * 
 * async function handleLogin(email: string) {
 *   await sendMagicLink(email)
 * }
 * </script>
 * ```
 */
export function useAuth(): AuthState & {
  sendMagicLink: (email: string, options?: SendMagicLinkOptions) => Promise<SendMagicLinkResult>
  verifyToken: (token: string) => Promise<VerifyTokenResult>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
} {
  // Shared state across components using useState for SSR compatibility
  const user = useState<User | null>('auth-user', () => null)
  const loading = useState<boolean>('auth-loading', () => false)
  const error = useState<string | null>('auth-error', () => null)
  
  const isLoggedIn = computed(() => user.value !== null)
  
  /**
   * Sends a magic link to the specified email address
   * @param email - User's email address
   * @param options - Optional parameters (e.g., user's name for new accounts)
   * @returns Promise with success status and message
   * @throws Error if the request fails
   */
  async function sendMagicLink(email: string, options?: SendMagicLinkOptions): Promise<SendMagicLinkResult> {
    loading.value = true
    error.value = null
    
    try {
      const result = await $fetch<SendMagicLinkResult>('/api/auth/send-magic-link', {
        method: 'POST',
        body: { email, name: options?.name }
      })
      
      return result
    } catch (err: any) {
      const message = err.data?.message || err.message || 'Failed to send magic link'
      error.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Verifies a magic link token and establishes user session
   * @param token - Magic link token from URL
   * @returns Promise with user data and new user flag
   * @throws Error if token is invalid or expired
   */
  async function verifyToken(token: string): Promise<VerifyTokenResult> {
    loading.value = true
    error.value = null
    
    try {
      const result = await $fetch<VerifyTokenResult>('/api/auth/verify-token', {
        method: 'POST',
        body: { token }
      })
      
      user.value = result.user
      return result
    } catch (err: any) {
      const message = err.data?.message || err.message || 'Failed to verify token'
      error.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Logs out the current user and clears session
   * @throws Error if logout request fails
   */
  async function logout(): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
    } catch (err: any) {
      const message = err.data?.message || err.message || 'Failed to logout'
      error.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Refreshes current user data from server
   * Silently handles errors (useful for initial load)
   */
  async function refreshUser(): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const result = await $fetch<{ user: User | null }>('/api/auth/me')
      user.value = result.user
    } catch (err: any) {
      // Silently fail - user is simply not authenticated
      user.value = null
    } finally {
      loading.value = false
    }
  }
  
  return {
    user,
    isLoggedIn,
    loading,
    error,
    sendMagicLink,
    verifyToken,
    logout,
    refreshUser
  }
}
