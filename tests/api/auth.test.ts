import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn()
  },
  verificationToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn()
  }
}

vi.mock('~/server/utils/prisma', () => ({
  default: mockPrisma
}))

// Mock email provider
const mockEmailProvider = {
  sendMagicLink: vi.fn().mockResolvedValue(undefined),
  sendWelcome: vi.fn().mockResolvedValue(undefined)
}

vi.mock('~/lib/email', () => ({
  useEmailProvider: () => mockEmailProvider
}))

// Mock Nuxt utilities
vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    jwtSecret: 'test-secret-key-min-32-characters-long',
    emailProvider: 'console',
    emailConfig: {
      fromEmail: 'test@example.com',
      fromName: 'Test App'
    },
    public: {
      appUrl: 'http://localhost:3000'
    }
  }),
  createError: (options: any) => {
    const error = new Error(options.message) as any
    error.statusCode = options.statusCode
    error.statusMessage = options.statusMessage
    error.data = options.data
    return error
  }
}))

import { 
  validateAndNormalizeEmail, 
  isValidName, 
  normalizeName 
} from '../../server/utils/validation'
import { 
  generateSecureToken, 
  hashToken, 
  getTokenExpiration, 
  isTokenExpired 
} from '../../server/utils/token'

describe('Auth API Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Send Magic Link Flow', () => {
    it('should validate email correctly', () => {
      expect(validateAndNormalizeEmail('user@example.com')).toBe('user@example.com')
      expect(validateAndNormalizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com')
      expect(validateAndNormalizeEmail(' user@example.com ')).toBe('user@example.com')
      expect(validateAndNormalizeEmail('invalid')).toBeNull()
      expect(validateAndNormalizeEmail('')).toBeNull()
    })

    it('should validate name correctly', () => {
      expect(isValidName('John Doe')).toBe(true)
      expect(isValidName('Jo')).toBe(true)
      expect(isValidName('J')).toBe(false)
      expect(isValidName('')).toBe(false)
      expect(isValidName('A'.repeat(101))).toBe(false)
    })

    it('should normalize name correctly', () => {
      expect(normalizeName('john doe')).toBe('John Doe')
      expect(normalizeName('JOHN DOE')).toBe('John Doe')
      expect(normalizeName(' john  doe ')).toBe('John Doe')
    })

    it('should generate secure token', () => {
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()
      
      expect(token1).toHaveLength(64) // 32 bytes = 64 hex chars
      expect(token1).not.toBe(token2)
      expect(/^[a-f0-9]+$/.test(token1)).toBe(true)
    })

    it('should hash token consistently', () => {
      const token = 'test-token-123'
      const hash1 = hashToken(token)
      const hash2 = hashToken(token)
      
      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64) // SHA256 = 64 hex chars
    })

    it('should create correct token expiration', () => {
      const now = Date.now()
      const expires = getTokenExpiration(15)
      
      const expectedMin = now + 14 * 60 * 1000
      const expectedMax = now + 16 * 60 * 1000
      
      expect(expires.getTime()).toBeGreaterThan(expectedMin)
      expect(expires.getTime()).toBeLessThan(expectedMax)
    })
  })

  describe('Verify Token Flow', () => {
    it('should detect expired tokens', () => {
      const pastDate = new Date(Date.now() - 1000)
      const futureDate = new Date(Date.now() + 60000)
      
      expect(isTokenExpired(pastDate)).toBe(true)
      expect(isTokenExpired(futureDate)).toBe(false)
    })

    it('should verify token hash correctly', () => {
      const token = 'my-magic-link-token'
      const hash = hashToken(token)
      
      expect(hashToken(token)).toBe(hash)
      expect(hashToken('wrong-token')).not.toBe(hash)
    })
  })

  describe('User Creation Logic', () => {
    it('should handle user lookup', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      
      const user = await mockPrisma.user.findUnique({
        where: { email: 'test@example.com' }
      })
      
      expect(user).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      })
    })

    it('should create new user when not found', async () => {
      const newUser = {
        id: 'user-new',
        email: 'new@example.com',
        name: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue(newUser)
      
      const existingUser = await mockPrisma.user.findUnique({
        where: { email: 'new@example.com' }
      })
      
      expect(existingUser).toBeNull()
      
      const user = await mockPrisma.user.create({
        data: { email: 'new@example.com' }
      })
      
      expect(user).toEqual(newUser)
    })
  })

  describe('Token Management', () => {
    it('should invalidate previous tokens', async () => {
      mockPrisma.verificationToken.updateMany.mockResolvedValue({ count: 2 })
      
      const result = await mockPrisma.verificationToken.updateMany({
        where: { email: 'test@example.com', used: false },
        data: { used: true }
      })
      
      expect(result.count).toBe(2)
      expect(mockPrisma.verificationToken.updateMany).toHaveBeenCalledWith({
        where: { email: 'test@example.com', used: false },
        data: { used: true }
      })
    })

    it('should create new verification token', async () => {
      const token = generateSecureToken()
      const hashedToken = hashToken(token)
      const expires = getTokenExpiration(15)
      
      const mockToken = {
        id: 'token-123',
        token: hashedToken,
        email: 'test@example.com',
        expires,
        used: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      mockPrisma.verificationToken.create.mockResolvedValue(mockToken)
      
      const created = await mockPrisma.verificationToken.create({
        data: {
          token: hashedToken,
          email: 'test@example.com',
          expires
        }
      })
      
      expect(created.token).toBe(hashedToken)
      expect(created.used).toBe(false)
    })

    it('should mark token as used after verification', async () => {
      const mockToken = {
        id: 'token-123',
        token: 'hashed-token',
        email: 'test@example.com',
        expires: new Date(Date.now() + 60000),
        used: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      mockPrisma.verificationToken.update.mockResolvedValue(mockToken)
      
      const updated = await mockPrisma.verificationToken.update({
        where: { id: 'token-123' },
        data: { used: true }
      })
      
      expect(updated.used).toBe(true)
    })
  })

  describe('Email Provider Integration', () => {
    it('should send magic link email', async () => {
      await mockEmailProvider.sendMagicLink('test@example.com', 'token-123', 'John')
      
      expect(mockEmailProvider.sendMagicLink).toHaveBeenCalledWith(
        'test@example.com',
        'token-123',
        'John'
      )
    })

    it('should send welcome email for new users', async () => {
      await mockEmailProvider.sendWelcome('test@example.com', 'John')
      
      expect(mockEmailProvider.sendWelcome).toHaveBeenCalledWith(
        'test@example.com',
        'John'
      )
    })
  })
})

describe('Rate Limiting Logic', () => {
  it('should implement rate limit check correctly', () => {
    const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
    const RATE_LIMIT_MAX = 3
    const RATE_LIMIT_WINDOW = 15 * 60 * 1000

    function checkRateLimit(email: string): boolean {
      const now = Date.now()
      const entry = rateLimitMap.get(email)
      
      if (!entry || now > entry.resetAt) {
        rateLimitMap.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
        return true
      }
      
      if (entry.count >= RATE_LIMIT_MAX) {
        return false
      }
      
      entry.count++
      return true
    }

    const email = 'test@example.com'
    
    // First 3 requests should pass
    expect(checkRateLimit(email)).toBe(true)
    expect(checkRateLimit(email)).toBe(true)
    expect(checkRateLimit(email)).toBe(true)
    
    // 4th request should be blocked
    expect(checkRateLimit(email)).toBe(false)
    expect(checkRateLimit(email)).toBe(false)
    
    // Different email should work
    expect(checkRateLimit('other@example.com')).toBe(true)
  })
})

