import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import { ConsoleProvider } from '../lib/email/providers/console'
import { ResendProvider } from '../lib/email/providers/resend'
import { NodemailerProvider } from '../lib/email/providers/nodemailer'
import { createEmailProvider } from '../lib/email'
import type { EmailConfig } from '../lib/email/providers/base'

// Mock fs for templates
vi.mock('fs', () => ({
  readFileSync: vi.fn(() => '<html>{{name}} {{magicLink}} {{appName}} {{appUrl}} {{year}}</html>')
}))

// Mock useRuntimeConfig for useEmailProvider tests
beforeAll(() => {
  ;(globalThis as any).useRuntimeConfig = () => ({
    emailProvider: 'console',
    emailConfig: {
      fromEmail: 'test@example.com',
      fromName: 'Test App',
      resendApiKey: '',
      smtpHost: '',
      smtpPort: '587',
      smtpSecure: false,
      smtpUser: '',
      smtpPass: ''
    },
    public: {
      appUrl: 'http://localhost:3000'
    }
  })
})

describe('Email Providers', () => {
  const mockConfig: EmailConfig = {
    fromEmail: 'noreply@test.com',
    fromName: 'Test App',
    appUrl: 'http://localhost:3000'
  }

  // ==========================================================================
  // ConsoleProvider
  // ==========================================================================

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

    it('should include from email in output', async () => {
      await provider.sendMagicLink('user@test.com', 'token')

      const allCalls = consoleSpy.mock.calls.flat().join(' ')
      expect(allCalls).toContain('noreply@test.com')
    })

    it('should include from name in output', async () => {
      await provider.sendMagicLink('user@test.com', 'token')

      const allCalls = consoleSpy.mock.calls.flat().join(' ')
      expect(allCalls).toContain('Test App')
    })
  })

  // ==========================================================================
  // createEmailProvider Factory
  // ==========================================================================

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

    it('should create ConsoleProvider for empty string', () => {
      const provider = createEmailProvider('', mockConfig)
      expect(provider).toBeInstanceOf(ConsoleProvider)
    })
  })

  // ==========================================================================
  // ResendProvider
  // ==========================================================================

  describe('ResendProvider', () => {
    it('should throw error when API key is missing', () => {
      expect(() => new ResendProvider(mockConfig)).toThrow('Resend API key is required')
    })

    it('should throw error with specific message', () => {
      try {
        new ResendProvider(mockConfig)
      } catch (error: any) {
        expect(error.message).toContain('RESEND_API_KEY')
      }
    })

    it('should accept config with API key', () => {
      const configWithKey = { ...mockConfig, resendApiKey: 'test-api-key' }
      expect(() => new ResendProvider(configWithKey)).not.toThrow()
    })
  })

  // ==========================================================================
  // NodemailerProvider
  // ==========================================================================

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

    it('should throw error when password is missing', () => {
      const config = { ...mockConfig, smtpHost: 'smtp.test.com', smtpUser: 'user' }
      expect(() => new NodemailerProvider(config)).toThrow('SMTP configuration is incomplete')
    })

    it('should throw error when host is missing but user and pass provided', () => {
      const config = { ...mockConfig, smtpUser: 'user', smtpPass: 'pass' }
      expect(() => new NodemailerProvider(config)).toThrow('SMTP configuration is incomplete')
    })
  })

  // ==========================================================================
  // createEmailProvider - All Branches
  // ==========================================================================

  describe('createEmailProvider - all provider types', () => {
    it('should create ResendProvider when provider is resend', () => {
      const configWithKey = { ...mockConfig, resendApiKey: 'test-key' }
      const provider = createEmailProvider('resend', configWithKey)
      expect(provider).toBeInstanceOf(ResendProvider)
    })

    it('should create NodemailerProvider when provider is nodemailer', () => {
      const configWithSmtp = {
        ...mockConfig,
        smtpHost: 'smtp.test.com',
        smtpUser: 'user',
        smtpPass: 'pass'
      }
      const provider = createEmailProvider('nodemailer', configWithSmtp)
      expect(provider).toBeInstanceOf(NodemailerProvider)
    })

    it('should create NodemailerProvider when provider is smtp', () => {
      const configWithSmtp = {
        ...mockConfig,
        smtpHost: 'smtp.test.com',
        smtpUser: 'user',
        smtpPass: 'pass'
      }
      const provider = createEmailProvider('smtp', configWithSmtp)
      expect(provider).toBeInstanceOf(NodemailerProvider)
    })

    it('should create ConsoleProvider when provider is console', () => {
      const provider = createEmailProvider('console', mockConfig)
      expect(provider).toBeInstanceOf(ConsoleProvider)
    })
  })

  // ==========================================================================
  // useEmailProvider
  // ==========================================================================

  describe('useEmailProvider', () => {
    it('should create provider from runtime config', async () => {
      const { useEmailProvider } = await import('../lib/email')
      const provider = useEmailProvider()
      expect(provider).toBeInstanceOf(ConsoleProvider)
    })

    it('should use emailProvider from config', async () => {
      ;(globalThis as any).useRuntimeConfig = () => ({
        emailProvider: 'console',
        emailConfig: {
          fromEmail: 'custom@example.com',
          fromName: 'Custom App',
          resendApiKey: '',
          smtpHost: '',
          smtpPort: '587',
          smtpSecure: false,
          smtpUser: '',
          smtpPass: ''
        },
        public: {
          appUrl: 'http://custom.com'
        }
      })

      const { useEmailProvider } = await import('../lib/email')
      const provider = useEmailProvider()
      expect(provider).toBeDefined()
    })
  })

  // ==========================================================================
  // Provider Exports
  // ==========================================================================

  describe('Provider exports', () => {
    it('should export ConsoleProvider', () => {
      expect(ConsoleProvider).toBeDefined()
    })

    it('should export ResendProvider', () => {
      expect(ResendProvider).toBeDefined()
    })

    it('should export NodemailerProvider', () => {
      expect(NodemailerProvider).toBeDefined()
    })

    it('should export createEmailProvider', () => {
      expect(createEmailProvider).toBeDefined()
      expect(typeof createEmailProvider).toBe('function')
    })
  })

  // ==========================================================================
  // Provider Index Exports
  // ==========================================================================

  describe('Provider index exports', () => {
    it('should export all providers from index', async () => {
      const providers = await import('../lib/email/providers')
      expect(providers.ConsoleProvider).toBeDefined()
      expect(providers.ResendProvider).toBeDefined()
      expect(providers.NodemailerProvider).toBeDefined()
      expect(providers.BaseEmailProvider).toBeDefined()
    })
  })
})
