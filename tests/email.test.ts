import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConsoleProvider } from '../lib/email/providers/console'
import { ResendProvider } from '../lib/email/providers/resend'
import { NodemailerProvider } from '../lib/email/providers/nodemailer'
import { createEmailProvider } from '../lib/email'
import type { EmailConfig } from '../lib/email/providers/base'

describe('Email Providers', () => {
  const mockConfig: EmailConfig = {
    fromEmail: 'noreply@test.com',
    fromName: 'Test App',
    appUrl: 'http://localhost:3000'
  }

  describe('ConsoleProvider', () => {
    let provider: ConsoleProvider
    let consoleSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      provider = new ConsoleProvider(mockConfig)
      consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('should log magic link email to console', async () => {
      await provider.sendMagicLink('user@test.com', 'abc123', 'John')

      expect(consoleSpy).toHaveBeenCalled()
      const allCalls = consoleSpy.mock.calls.flat().join(' ')
      expect(allCalls).toContain('user@test.com')
      expect(allCalls).toContain('abc123')
      expect(allCalls).toContain('John')
      expect(allCalls).toContain('Magic Link')
    })

    it('should log welcome email to console', async () => {
      await provider.sendWelcome('user@test.com', 'Jane')

      expect(consoleSpy).toHaveBeenCalled()
      const allCalls = consoleSpy.mock.calls.flat().join(' ')
      expect(allCalls).toContain('user@test.com')
      expect(allCalls).toContain('Jane')
      expect(allCalls).toContain('Welcome')
    })

    it('should use default greeting when name not provided', async () => {
      await provider.sendMagicLink('user@test.com', 'token123')

      const allCalls = consoleSpy.mock.calls.flat().join(' ')
      expect(allCalls).toContain('there')
    })

    it('should include correct magic link URL', async () => {
      await provider.sendMagicLink('user@test.com', 'mytoken')

      const allCalls = consoleSpy.mock.calls.flat().join(' ')
      expect(allCalls).toContain('http://localhost:3000/verify?token=mytoken')
    })

    it('should include app URL in welcome email', async () => {
      await provider.sendWelcome('user@test.com', 'User')

      const allCalls = consoleSpy.mock.calls.flat().join(' ')
      expect(allCalls).toContain('http://localhost:3000')
    })
  })

  describe('createEmailProvider factory', () => {
    it('should create ConsoleProvider by default', () => {
      const provider = createEmailProvider('console', mockConfig)
      expect(provider).toBeInstanceOf(ConsoleProvider)
    })

    it('should create ConsoleProvider for unknown provider', () => {
      const provider = createEmailProvider('unknown', mockConfig)
      expect(provider).toBeInstanceOf(ConsoleProvider)
    })

    it('should be case insensitive', () => {
      const provider1 = createEmailProvider('CONSOLE', mockConfig)
      const provider2 = createEmailProvider('Console', mockConfig)
      expect(provider1).toBeInstanceOf(ConsoleProvider)
      expect(provider2).toBeInstanceOf(ConsoleProvider)
    })
  })

  describe('ResendProvider', () => {
    it('should throw error when API key is missing', () => {
      expect(() => new ResendProvider(mockConfig)).toThrow('Resend API key is required')
    })
  })

  describe('NodemailerProvider', () => {
    it('should throw error when SMTP config is incomplete', () => {
      expect(() => new NodemailerProvider(mockConfig)).toThrow('SMTP configuration is incomplete')
    })

    it('should throw error when only host is provided', () => {
      const config = { ...mockConfig, smtpHost: 'smtp.test.com' }
      expect(() => new NodemailerProvider(config)).toThrow('SMTP configuration is incomplete')
    })

    it('should throw error when user is missing', () => {
      const config = { ...mockConfig, smtpHost: 'smtp.test.com', smtpPass: 'pass' }
      expect(() => new NodemailerProvider(config)).toThrow('SMTP configuration is incomplete')
    })
  })
})
