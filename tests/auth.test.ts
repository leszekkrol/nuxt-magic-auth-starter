import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import jwt from 'jsonwebtoken'

const mockSecret = 'test-jwt-secret-key-for-testing'
let currentMockSecret: string | undefined = mockSecret

// Mock Nuxt auto-imports globally
beforeAll(() => {
  ;(globalThis as any).useRuntimeConfig = () => ({
    jwtSecret: currentMockSecret
  })
  ;(globalThis as any).createError = (opts: any) => {
    const error = new Error(opts.message) as any
    error.statusCode = opts.statusCode
    error.statusMessage = opts.statusMessage
    return error
  }
})

beforeEach(() => {
  currentMockSecret = mockSecret
})

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
}

vi.mock('../server/utils/prisma', () => ({
  default: mockPrisma,
}))

// Import after setting up mocks
const authModule = await import('../server/utils/auth')
const { 
  generateJWT, 
  verifyJWT, 
  decodeJWT,
  getJwtExpiration,
  isTokenExpiringSoon,
  setAuthCookie,
  getAuthCookie,
  clearAuthCookie,
  getCurrentUser,
  isAuthenticated,
  requireAuth,
  requireUser,
  loginUser,
  logoutUser,
  refreshTokenIfNeeded
} = authModule

describe('Auth Utils', () => {
  // ==========================================================================
  // JWT Secret Validation
  // ==========================================================================

  describe('JWT Secret', () => {
    it('should throw error when JWT_SECRET is not configured', async () => {
      // Temporarily set secret to undefined
      ;(globalThis as any).useRuntimeConfig = () => ({
        jwtSecret: undefined
      })

      // Re-import to get fresh module
      const freshModule = await import('../server/utils/auth?v=' + Date.now())
      
      expect(() => {
        freshModule.generateJWT({ userId: 'test', email: 'test@test.com' })
      }).toThrow('JWT_SECRET is not configured')

      // Restore mock
      ;(globalThis as any).useRuntimeConfig = () => ({
        jwtSecret: mockSecret
      })
    })

    it('should throw error when JWT_SECRET is empty string', async () => {
      ;(globalThis as any).useRuntimeConfig = () => ({
        jwtSecret: ''
      })

      const freshModule = await import('../server/utils/auth?v=' + Date.now() + 1)
      
      expect(() => {
        freshModule.generateJWT({ userId: 'test', email: 'test@test.com' })
      }).toThrow('JWT_SECRET is not configured')

      ;(globalThis as any).useRuntimeConfig = () => ({
        jwtSecret: mockSecret
      })
    })
  })

  // ==========================================================================
  // JWT Generation
  // ==========================================================================
  
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

  // ==========================================================================
  // JWT Verification
  // ==========================================================================

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

  // ==========================================================================
  // JWT Decoding (without verification)
  // ==========================================================================

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

    it('should return null for empty string', () => {
      const result = decodeJWT('')
      expect(result).toBeNull()
    })
  })

  // ==========================================================================
  // Token Expiration Helpers
  // ==========================================================================

  describe('getJwtExpiration', () => {
    it('should return expiration date for valid token', () => {
      const token = generateJWT({ userId: 'user123', email: 'test@example.com' })
      const expiration = getJwtExpiration(token)
      
      expect(expiration).toBeInstanceOf(Date)
      expect(expiration!.getTime()).toBeGreaterThan(Date.now())
    })

    it('should return null for invalid token', () => {
      const expiration = getJwtExpiration('invalid-token')
      expect(expiration).toBeNull()
    })

    it('should return null for token without exp claim', () => {
      const tokenWithoutExp = jwt.sign(
        { userId: 'user123' },
        mockSecret,
        { noTimestamp: true }
      )
      // Manually remove exp - jwt.sign always adds it with expiresIn
      const expiration = getJwtExpiration('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c2VyMTIzIn0.invalid')
      expect(expiration).toBeNull()
    })
  })

  describe('isTokenExpiringSoon', () => {
    it('should return false for fresh token', () => {
      const token = generateJWT({ userId: 'user123', email: 'test@example.com' })
      // Token expires in 7 days, threshold is 60 minutes
      expect(isTokenExpiringSoon(token, 60)).toBe(false)
    })

    it('should return true for token expiring soon', () => {
      const soonExpiring = jwt.sign(
        { userId: 'user123', email: 'test@example.com' },
        mockSecret,
        { expiresIn: '30m' } // Expires in 30 minutes
      )
      // Threshold is 60 minutes, so 30m token should be "expiring soon"
      expect(isTokenExpiringSoon(soonExpiring, 60)).toBe(true)
    })

    it('should return true for invalid token', () => {
      expect(isTokenExpiringSoon('invalid-token', 60)).toBe(true)
    })

    it('should use default threshold of 60 minutes', () => {
      const token = generateJWT({ userId: 'user123', email: 'test@example.com' })
      expect(isTokenExpiringSoon(token)).toBe(false)
    })
  })

  // ==========================================================================
  // Cookie Management
  // ==========================================================================

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

    it('getAuthCookie should return undefined when no cookie', () => {
      const result = getAuthCookie(mockEvent)
      expect(result).toBeUndefined()
    })

    it('getAuthCookie should return cookie value when present', () => {
      mockEvent.node.req.headers.cookie = 'auth_token=test-token-value'
      const result = getAuthCookie(mockEvent)
      expect(result).toBe('test-token-value')
    })
  })

  // ==========================================================================
  // Authentication Helpers
  // ==========================================================================

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

    it('getCurrentUser should return payload when valid token in cookie', () => {
      const token = generateJWT({ userId: 'user123', email: 'test@example.com' })
      mockEvent.node.req.headers.cookie = `auth_token=${token}`
      
      const result = getCurrentUser(mockEvent)
      expect(result?.userId).toBe('user123')
      expect(result?.email).toBe('test@example.com')
    })

    it('getCurrentUser should return null for invalid token', () => {
      mockEvent.node.req.headers.cookie = 'auth_token=invalid-token'
      const result = getCurrentUser(mockEvent)
      expect(result).toBeNull()
    })

    it('isAuthenticated should return false when no cookie', () => {
      const result = isAuthenticated(mockEvent)
      expect(result).toBe(false)
    })

    it('isAuthenticated should return true when valid token present', () => {
      const token = generateJWT({ userId: 'user123', email: 'test@example.com' })
      mockEvent.node.req.headers.cookie = `auth_token=${token}`
      
      const result = isAuthenticated(mockEvent)
      expect(result).toBe(true)
    })

    it('requireAuth should throw when not authenticated', () => {
      expect(() => requireAuth(mockEvent)).toThrow()
    })

    it('requireAuth should return payload when authenticated', () => {
      const token = generateJWT({ userId: 'user123', email: 'test@example.com' })
      mockEvent.node.req.headers.cookie = `auth_token=${token}`
      
      const result = requireAuth(mockEvent)
      expect(result.userId).toBe('user123')
      expect(result.email).toBe('test@example.com')
    })

    it('requireAuth should throw 401 error', () => {
      try {
        requireAuth(mockEvent)
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
        expect(error.statusMessage).toBe('Unauthorized')
      }
    })
  })

  // ==========================================================================
  // Require User (Database Fetch)
  // ==========================================================================

  describe('requireUser', () => {
    let mockEvent: any

    beforeEach(() => {
      mockEvent = {
        node: {
          req: { headers: { cookie: '' } },
          res: { setHeader: vi.fn(), getHeader: vi.fn(() => []) }
        }
      }
      vi.clearAllMocks()
    })

    it('should return full user from database when authenticated', async () => {
      const token = generateJWT({ userId: 'user123', email: 'test@example.com' })
      mockEvent.node.req.headers.cookie = `auth_token=${token}`

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        stripeCustomerId: 'cus_test123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await requireUser(mockEvent)

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' }
      })
    })

    it('should throw 401 when not authenticated', async () => {
      await expect(requireUser(mockEvent)).rejects.toThrow('Authentication required')
    })

    it('should throw 401 when user not found in database', async () => {
      const token = generateJWT({ userId: 'nonexistent', email: 'test@example.com' })
      mockEvent.node.req.headers.cookie = `auth_token=${token}`

      mockPrisma.user.findUnique.mockResolvedValue(null)

      try {
        await requireUser(mockEvent)
        throw new Error('Should have thrown')
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
        expect(error.statusMessage).toBe('Unauthorized')
        expect(error.message).toBe('User not found')
      }
    })

    it('should include all user fields including stripeCustomerId', async () => {
      const token = generateJWT({ userId: 'user123', email: 'test@example.com' })
      mockEvent.node.req.headers.cookie = `auth_token=${token}`

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        stripeCustomerId: 'cus_test123',
        customField: 'custom value',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await requireUser(mockEvent)

      expect(result.stripeCustomerId).toBe('cus_test123')
      expect(result.customField).toBe('custom value')
    })
  })

  // ==========================================================================
  // Session Management
  // ==========================================================================

  describe('Session management', () => {
    let mockEvent: any

    beforeEach(() => {
      mockEvent = {
        node: {
          req: { headers: { cookie: '' } },
          res: { setHeader: vi.fn(), getHeader: vi.fn(() => []) }
        }
      }
    })

    it('loginUser should return token', () => {
      const user = { id: 'user123', email: 'test@example.com', name: 'Test' }
      const token = loginUser(mockEvent, user)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('loginUser should generate token with correct payload', () => {
      const user = { id: 'user123', email: 'test@example.com', name: 'Test' }
      const token = loginUser(mockEvent, user)
      
      const decoded = decodeJWT(token)
      expect(decoded?.userId).toBe('user123')
      expect(decoded?.email).toBe('test@example.com')
    })

    it('logoutUser should not throw', () => {
      expect(() => logoutUser(mockEvent)).not.toThrow()
    })

    it('refreshTokenIfNeeded should return null when token not expiring', () => {
      const token = generateJWT({ userId: 'user123', email: 'test@example.com' })
      mockEvent.node.req.headers.cookie = `auth_token=${token}`
      
      const user = { id: 'user123', email: 'test@example.com', name: 'Test' }
      const result = refreshTokenIfNeeded(mockEvent, user, 60)
      
      expect(result).toBeNull()
    })

    it('refreshTokenIfNeeded should return new token when expiring soon', () => {
      const soonExpiring = jwt.sign(
        { userId: 'user123', email: 'test@example.com' },
        mockSecret,
        { expiresIn: '30m' }
      )
      mockEvent.node.req.headers.cookie = `auth_token=${soonExpiring}`
      
      const user = { id: 'user123', email: 'test@example.com', name: 'Test' }
      const result = refreshTokenIfNeeded(mockEvent, user, 60)
      
      expect(result).toBeDefined()
      expect(result).not.toBe(soonExpiring)
    })

    it('refreshTokenIfNeeded should return null when no token', () => {
      const user = { id: 'user123', email: 'test@example.com', name: 'Test' }
      const result = refreshTokenIfNeeded(mockEvent, user, 60)
      
      expect(result).toBeNull()
    })
  })
})
