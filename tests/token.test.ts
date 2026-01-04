import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateSecureToken,
  generateShortToken,
  hashToken,
  verifyTokenHash,
  getTokenExpiration,
  isTokenExpired,
  getTokenRemainingTime
} from '../server/utils/token'

describe('Token Utils', () => {
  describe('generateSecureToken', () => {
    it('should generate a 64-character hex string by default', () => {
      const token = generateSecureToken()
      expect(token).toHaveLength(64) // 32 bytes = 64 hex chars
      expect(token).toMatch(/^[a-f0-9]+$/)
    })

    it('should generate different tokens each time', () => {
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()
      expect(token1).not.toBe(token2)
    })

    it('should respect custom length parameter', () => {
      const token = generateSecureToken(16)
      expect(token).toHaveLength(32) // 16 bytes = 32 hex chars
    })
  })

  describe('generateShortToken', () => {
    it('should generate a 6-character token by default', () => {
      const token = generateShortToken()
      expect(token).toHaveLength(6)
    })

    it('should only contain allowed characters', () => {
      const token = generateShortToken()
      // Bez podobnych znaków: 0/O, 1/I/L
      expect(token).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/)
    })

    it('should respect custom length parameter', () => {
      const token = generateShortToken(10)
      expect(token).toHaveLength(10)
    })
  })

  describe('hashToken & verifyTokenHash', () => {
    it('should hash token consistently', () => {
      const token = 'test-token-123'
      const hash1 = hashToken(token)
      const hash2 = hashToken(token)
      expect(hash1).toBe(hash2)
    })

    it('should produce 64-character SHA256 hash', () => {
      const hash = hashToken('test')
      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]+$/)
    })

    it('should verify correct token', () => {
      const token = 'my-secret-token'
      const hash = hashToken(token)
      expect(verifyTokenHash(token, hash)).toBe(true)
    })

    it('should reject incorrect token', () => {
      const token = 'my-secret-token'
      const hash = hashToken(token)
      expect(verifyTokenHash('wrong-token', hash)).toBe(false)
    })
  })

  describe('getTokenExpiration', () => {
    it('should return date 15 minutes in future by default', () => {
      const now = Date.now()
      const expiration = getTokenExpiration()
      const diff = expiration.getTime() - now
      
      // Should be approximately 15 minutes (900000 ms)
      expect(diff).toBeGreaterThan(14 * 60 * 1000)
      expect(diff).toBeLessThan(16 * 60 * 1000)
    })

    it('should respect custom minutes parameter', () => {
      const now = Date.now()
      const expiration = getTokenExpiration(30)
      const diff = expiration.getTime() - now
      
      // Should be approximately 30 minutes
      expect(diff).toBeGreaterThan(29 * 60 * 1000)
      expect(diff).toBeLessThan(31 * 60 * 1000)
    })
  })

  describe('isTokenExpired', () => {
    it('should return false for future date', () => {
      const futureDate = new Date(Date.now() + 60000)
      expect(isTokenExpired(futureDate)).toBe(false)
    })

    it('should return true for past date', () => {
      const pastDate = new Date(Date.now() - 60000)
      expect(isTokenExpired(pastDate)).toBe(true)
    })
  })

  describe('getTokenRemainingTime', () => {
    it('should return positive seconds for future date', () => {
      const futureDate = new Date(Date.now() + 120000) // 2 minutes
      const remaining = getTokenRemainingTime(futureDate)
      
      expect(remaining).toBeGreaterThan(110)
      expect(remaining).toBeLessThanOrEqual(120)
    })

    it('should return 0 for past date', () => {
      const pastDate = new Date(Date.now() - 60000)
      expect(getTokenRemainingTime(pastDate)).toBe(0)
    })
  })
})

