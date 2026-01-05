import { describe, it, expect, beforeAll } from 'vitest'
import {
  isValidEmail,
  normalizeEmail,
  validateAndNormalizeEmail,
  isValidName,
  normalizeName,
  isNonEmptyString,
  isValidId,
  createValidationError
} from '../server/utils/validation'

// Mock Nuxt auto-imports
beforeAll(() => {
  ;(globalThis as any).createError = (opts: any) => {
    const error = new Error(opts.message) as any
    error.statusCode = opts.statusCode
    error.statusMessage = opts.statusMessage
    error.data = opts.data
    return error
  }
})

describe('Validation Utils', () => {
  // ==========================================================================
  // Email Validation
  // ==========================================================================
  
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

    it('should reject emails with local part too long', () => {
      const longLocalPart = 'a'.repeat(65) + '@example.com'
      expect(isValidEmail(longLocalPart)).toBe(false)
    })
  })

  describe('normalizeEmail', () => {
    it('should convert to lowercase', () => {
      expect(normalizeEmail('Test@EXAMPLE.COM')).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com')
    })

    it('should handle mixed case and whitespace', () => {
      expect(normalizeEmail('  Test.User@EXAMPLE.COM  ')).toBe('test.user@example.com')
    })
  })

  describe('validateAndNormalizeEmail', () => {
    it('should return normalized email for valid input', () => {
      expect(validateAndNormalizeEmail('Test@Example.COM')).toBe('test@example.com')
    })

    it('should return null for invalid input', () => {
      expect(validateAndNormalizeEmail('invalid')).toBeNull()
    })

    it('should return null for empty string', () => {
      expect(validateAndNormalizeEmail('')).toBeNull()
    })

    it('should handle whitespace-only input', () => {
      expect(validateAndNormalizeEmail('   ')).toBeNull()
    })
  })

  // ==========================================================================
  // Name Validation
  // ==========================================================================

  describe('isValidName', () => {
    it('should accept valid names', () => {
      const validNames = [
        'John',
        'John Doe',
        'María García',
        'Jean-Pierre',
        'O\'Brien',
        'AB' // Minimum length
      ]

      validNames.forEach(name => {
        expect(isValidName(name), `${name} should be valid`).toBe(true)
      })
    })

    it('should reject invalid names', () => {
      const invalidNames = [
        '',
        ' ',
        'A', // Too short
        null,
        undefined,
        'a'.repeat(101) // Too long
      ]

      invalidNames.forEach(name => {
        expect(isValidName(name as any), `${name} should be invalid`).toBe(false)
      })
    })

    it('should accept name at max length boundary', () => {
      const maxLengthName = 'a'.repeat(100)
      expect(isValidName(maxLengthName)).toBe(true)
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

    it('should handle multiple spaces between words', () => {
      expect(normalizeName('john    doe')).toBe('John Doe')
    })

    it('should handle mixed case', () => {
      expect(normalizeName('jOhN dOE')).toBe('John Doe')
    })
  })

  // ==========================================================================
  // Generic Type Guards
  // ==========================================================================

  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true)
      expect(isNonEmptyString('  hello  ')).toBe(true)
      expect(isNonEmptyString('a')).toBe(true)
    })

    it('should return false for empty or whitespace strings', () => {
      expect(isNonEmptyString('')).toBe(false)
      expect(isNonEmptyString('   ')).toBe(false)
      expect(isNonEmptyString('\t\n')).toBe(false)
    })

    it('should return false for non-strings', () => {
      expect(isNonEmptyString(null)).toBe(false)
      expect(isNonEmptyString(undefined)).toBe(false)
      expect(isNonEmptyString(123)).toBe(false)
      expect(isNonEmptyString({})).toBe(false)
      expect(isNonEmptyString([])).toBe(false)
      expect(isNonEmptyString(true)).toBe(false)
    })
  })

  describe('isValidId', () => {
    it('should accept valid CUIDs', () => {
      const cuid = 'clh3am8f20000qwer1234abcd'
      expect(isValidId(cuid)).toBe(true)
    })

    it('should accept valid CUIDs with longer length', () => {
      const longCuid = 'clh3am8f20000qwer1234abcdefgh'
      expect(isValidId(longCuid)).toBe(true)
    })

    it('should accept valid UUIDs v1', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      expect(isValidId(uuid)).toBe(true)
    })

    it('should accept valid UUIDs v4', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      expect(isValidId(uuid)).toBe(true)
    })

    it('should accept UUIDs with uppercase letters', () => {
      const uuid = '550E8400-E29B-41D4-A716-446655440000'
      expect(isValidId(uuid)).toBe(true)
    })

    it('should reject invalid IDs', () => {
      expect(isValidId('')).toBe(false)
      expect(isValidId('abc')).toBe(false)
      expect(isValidId(123)).toBe(false)
      expect(isValidId(null)).toBe(false)
      expect(isValidId(undefined)).toBe(false)
      expect(isValidId({})).toBe(false)
    })

    it('should reject IDs with invalid format', () => {
      expect(isValidId('not-a-valid-id')).toBe(false)
      expect(isValidId('123-456-789')).toBe(false)
      expect(isValidId('abc123')).toBe(false)
    })
  })

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe('createValidationError', () => {
    it('should create error with 400 status code', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }]
      const error = createValidationError(errors) as any
      
      expect(error.statusCode).toBe(400)
    })

    it('should create error with Validation Error status message', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }]
      const error = createValidationError(errors) as any
      
      expect(error.statusMessage).toBe('Validation Error')
    })

    it('should include errors in data', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'name', message: 'Name too short' }
      ]
      const error = createValidationError(errors) as any
      
      expect(error.data.errors).toEqual(errors)
    })

    it('should handle single error', () => {
      const errors = [{ field: 'token', message: 'Token required' }]
      const error = createValidationError(errors) as any
      
      expect(error.data.errors).toHaveLength(1)
      expect(error.data.errors[0].field).toBe('token')
    })

    it('should handle empty errors array', () => {
      const error = createValidationError([]) as any
      
      expect(error.data.errors).toEqual([])
    })
  })
})
