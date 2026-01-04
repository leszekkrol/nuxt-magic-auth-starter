import type { Ref } from 'vue'

export interface User {
  id: string
  email: string
  name: string | null
  createdAt?: string
}

export interface AuthState {
  user: Ref<User | null>
  isLoggedIn: ComputedRef<boolean>
  loading: Ref<boolean>
  error: Ref<string | null>
}

export interface SendMagicLinkOptions {
  name?: string
}

export interface SendMagicLinkResult {
  success: boolean
  message: string
}

export interface VerifyTokenResult {
  success: boolean
  user: User
  isNewUser: boolean
}

export function useAuth(): AuthState & {
  sendMagicLink: (email: string, options?: SendMagicLinkOptions) => Promise<SendMagicLinkResult>
  verifyToken: (token: string) => Promise<VerifyTokenResult>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
} {
  const user = useState<User | null>('auth-user', () => null)
  const loading = useState<boolean>('auth-loading', () => false)
  const error = useState<string | null>('auth-error', () => null)
  
  const isLoggedIn = computed(() => user.value !== null)
  
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
  
  async function refreshUser(): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const result = await $fetch<{ user: User | null }>('/api/auth/me')
      user.value = result.user
    } catch (err: any) {
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

