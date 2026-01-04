import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import jwt from 'jsonwebtoken'

const mockSecret = 'test-jwt-secret-key-for-testing'

// Mock Nuxt auto-imports globally
beforeAll(() => {
  ;(globalThis as any).useRuntimeConfig = () => ({
    jwtSecret: mockSecret
  })
  ;(globalThis as any).createError = (opts: any) => {
    const error = new Error(opts.message) as any
    error.statusCode = opts.statusCode
    error.statusMessage = opts.statusMessage
    return error
  }
})

// Import after setting up mocks
const authModule = await import('../server/utils/auth')
const { 
  generateJWT, 
  verifyJWT, 
  decodeJWT,
  setAuthCookie,
  clearAuthCookie,
  getCurrentUser,
  isAuthenticated,
  requireAuth,
  loginUser,
  logoutUser
} = authModule

describe('Auth Utils', () => {
  describe('generateJWT', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 'user123', email: 'test@example.com' }
      const token = generateJWT(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('should include payload in token', () => {
      const payload = { userId: 'user123', email: 'test@example.com' }
      const token = generateJWT(payload)
      
      const decoded = jwt.decode(token) as any
      expect(decoded.userId).toBe('user123')
      expect(decoded.email).toBe('test@example.com')
    })

    it('should set expiration', () => {
      const payload = { userId: 'user123', email: 'test@example.com' }
      const token = generateJWT(payload)
      
      const decoded = jwt.decode(token) as any
      expect(decoded.exp).toBeDefined()
      expect(decoded.iat).toBeDefined()
    })
  })

  describe('verifyJWT', () => {
    it('should verify valid token', () => {
      const payload = { userId: 'user123', email: 'test@example.com' }
      const token = generateJWT(payload)
      
      const result = verifyJWT(token)
      expect(result).not.toBeNull()
      expect(result?.userId).toBe('user123')
      expect(result?.email).toBe('test@example.com')
    })

    it('should return null for invalid token', () => {
      const result = verifyJWT('invalid.token.here')
      expect(result).toBeNull()
    })

    it('should return null for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 'user123', email: 'test@example.com' },
        mockSecret,
        { expiresIn: '-1s' }
      )
      
      const result = verifyJWT(expiredToken)
      expect(result).toBeNull()
    })

    it('should return null for token with wrong secret', () => {
      const wrongToken = jwt.sign(
        { userId: 'user123', email: 'test@example.com' },
        'wrong-secret',
        { expiresIn: '1h' }
      )
      
      const result = verifyJWT(wrongToken)
      expect(result).toBeNull()
    })
  })

  describe('decodeJWT', () => {
    it('should decode token without verification', () => {
      const payload = { userId: 'user123', email: 'test@example.com' }
      const token = generateJWT(payload)
      
      const result = decodeJWT(token)
      expect(result?.userId).toBe('user123')
      expect(result?.email).toBe('test@example.com')
    })

    it('should decode token even with wrong secret', () => {
      const wrongToken = jwt.sign(
        { userId: 'user123', email: 'test@example.com' },
        'different-secret',
        { expiresIn: '1h' }
      )
      
      const result = decodeJWT(wrongToken)
      expect(result?.userId).toBe('user123')
    })

    it('should return null for malformed token', () => {
      const result = decodeJWT('not-a-valid-jwt')
      expect(result).toBeNull()
    })
  })

  describe('Cookie functions', () => {
    let mockEvent: any

    beforeEach(() => {
      mockEvent = {
        node: {
          req: { headers: { cookie: '' } },
          res: { setHeader: vi.fn(), getHeader: vi.fn(() => []) }
        }
      }
    })

    it('setAuthCookie should not throw', () => {
      expect(() => setAuthCookie(mockEvent, 'test-token')).not.toThrow()
    })

    it('clearAuthCookie should not throw', () => {
      expect(() => clearAuthCookie(mockEvent)).not.toThrow()
    })
  })

  describe('Auth helper functions', () => {
    let mockEvent: any

    beforeEach(() => {
      mockEvent = {
        node: {
          req: { headers: { cookie: '' } },
          res: { setHeader: vi.fn(), getHeader: vi.fn(() => []) }
        }
      }
    })

    it('getCurrentUser should return null when no cookie', () => {
      const result = getCurrentUser(mockEvent)
      expect(result).toBeNull()
    })

    it('isAuthenticated should return false when no cookie', () => {
      const result = isAuthenticated(mockEvent)
      expect(result).toBe(false)
    })

    it('requireAuth should throw when not authenticated', () => {
      expect(() => requireAuth(mockEvent)).toThrow()
    })

    it('loginUser should return token', () => {
      const user = { id: 'user123', email: 'test@example.com', name: 'Test' }
      const token = loginUser(mockEvent, user)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('logoutUser should not throw', () => {
      expect(() => logoutUser(mockEvent)).not.toThrow()
    })
  })
})
