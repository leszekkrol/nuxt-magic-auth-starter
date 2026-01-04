import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  normalizeEmail,
  validateAndNormalizeEmail,
  isValidName,
  normalizeName,
  isNonEmptyString,
  isValidId
} from '../server/utils/validation'

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.co.uk',
        'firstname.lastname@company.com',
        'email@subdomain.domain.com',
        'user123@test.io'
      ]

      validEmails.forEach(email => {
        expect(isValidEmail(email), `${email} should be valid`).toBe(true)
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'notanemail',
        '@nodomain.com',
        'missing@.com',
        'spaces in@email.com',
        'double@@at.com',
        null,
        undefined,
        123
      ]

      invalidEmails.forEach(email => {
        expect(isValidEmail(email as any), `${email} should be invalid`).toBe(false)
      })
    })

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(isValidEmail(longEmail)).toBe(false)
    })
  })

  describe('normalizeEmail', () => {
    it('should convert to lowercase', () => {
      expect(normalizeEmail('Test@EXAMPLE.COM')).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com')
    })
  })

  describe('validateAndNormalizeEmail', () => {
    it('should return normalized email for valid input', () => {
      expect(validateAndNormalizeEmail('Test@Example.COM')).toBe('test@example.com')
    })

    it('should return null for invalid input', () => {
      expect(validateAndNormalizeEmail('invalid')).toBeNull()
    })
  })

  describe('isValidName', () => {
    it('should accept valid names', () => {
      const validNames = [
        'John',
        'John Doe',
        'María García',
        'Jean-Pierre',
        'O\'Brien'
      ]

      validNames.forEach(name => {
        expect(isValidName(name), `${name} should be valid`).toBe(true)
      })
    })

    it('should reject invalid names', () => {
      const invalidNames = [
        '',
        ' ',
        'A', // too short
        null,
        undefined,
        'a'.repeat(101) // too long
      ]

      invalidNames.forEach(name => {
        expect(isValidName(name as any), `${name} should be invalid`).toBe(false)
      })
    })
  })

  describe('normalizeName', () => {
    it('should capitalize each word', () => {
      expect(normalizeName('john doe')).toBe('John Doe')
    })

    it('should handle single word', () => {
      expect(normalizeName('JOHN')).toBe('John')
    })

    it('should trim whitespace', () => {
      expect(normalizeName('  John Doe  ')).toBe('John Doe')
    })
  })

  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true)
      expect(isNonEmptyString('  hello  ')).toBe(true)
    })

    it('should return false for empty or whitespace strings', () => {
      expect(isNonEmptyString('')).toBe(false)
      expect(isNonEmptyString('   ')).toBe(false)
    })

    it('should return false for non-strings', () => {
      expect(isNonEmptyString(null)).toBe(false)
      expect(isNonEmptyString(undefined)).toBe(false)
      expect(isNonEmptyString(123)).toBe(false)
      expect(isNonEmptyString({})).toBe(false)
    })
  })

  describe('isValidId', () => {
    it('should accept valid CUIDs', () => {
      const cuid = 'clh3am8f20000qwer1234abcd'
      expect(isValidId(cuid)).toBe(true)
    })

    it('should accept valid UUIDs', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      expect(isValidId(uuid)).toBe(true)
    })

    it('should reject invalid IDs', () => {
      expect(isValidId('')).toBe(false)
      expect(isValidId('abc')).toBe(false)
      expect(isValidId(123)).toBe(false)
      expect(isValidId(null)).toBe(false)
    })
  })
})

