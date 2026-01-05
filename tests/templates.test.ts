import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadEmailTemplate, EmailTemplates } from '../lib/email/templates'
import * as fs from 'fs'

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn()
}))

describe('Email Templates', () => {
  // ==========================================================================
  // EmailTemplates Constants
  // ==========================================================================
  
  describe('EmailTemplates', () => {
    it('should have MAGIC_LINK template name', () => {
      expect(EmailTemplates.MAGIC_LINK).toBe('magic-link')
    })

    it('should have WELCOME template name', () => {
      expect(EmailTemplates.WELCOME).toBe('welcome')
    })
  })

  // ==========================================================================
  // loadEmailTemplate
  // ==========================================================================

  describe('loadEmailTemplate', () => {
    const mockReadFileSync = fs.readFileSync as ReturnType<typeof vi.fn>
    const mockExistsSync = fs.existsSync as ReturnType<typeof vi.fn>
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      mockReadFileSync.mockReset()
      mockExistsSync.mockReset()
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should load and return template content', () => {
      const templateContent = '<html><body>Hello {{name}}</body></html>'
      // Return true for first existsSync call (user template found)
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(templateContent)

      const result = loadEmailTemplate('test', { name: 'John' })
      
      expect(result).toBe('<html><body>Hello John</body></html>')
    })

    it('should replace multiple variables', () => {
      const templateContent = '<html><body>{{greeting}} {{name}}, your link: {{link}}</body></html>'
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(templateContent)

      const result = loadEmailTemplate('test', {
        greeting: 'Hello',
        name: 'John',
        link: 'https://example.com'
      })
      
      expect(result).toBe('<html><body>Hello John, your link: https://example.com</body></html>')
    })

    it('should replace same variable multiple times', () => {
      const templateContent = '{{name}} is great. {{name}} is awesome.'
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(templateContent)

      const result = loadEmailTemplate('test', { name: 'John' })
      
      expect(result).toBe('John is great. John is awesome.')
    })

    it('should preserve unreplaced variables', () => {
      const templateContent = 'Hello {{name}}, {{unknown}} variable'
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(templateContent)

      const result = loadEmailTemplate('test', { name: 'John' })
      
      expect(result).toBe('Hello John, {{unknown}} variable')
    })

    it('should handle empty variables object', () => {
      const templateContent = 'Hello {{name}}'
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(templateContent)

      const result = loadEmailTemplate('test', {})
      
      expect(result).toBe('Hello {{name}}')
    })

    it('should return fallback HTML when file not found', () => {
      // No files exist
      mockExistsSync.mockReturnValue(false)

      const result = loadEmailTemplate('nonexistent', { magicLink: 'https://test.com' })
      
      expect(result).toContain('https://test.com')
      expect(result).toContain('<!DOCTYPE html>')
    })

    it('should log error when file not found', () => {
      mockExistsSync.mockReturnValue(false)

      loadEmailTemplate('nonexistent', {})
      
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should use appName in fallback template', () => {
      mockExistsSync.mockReturnValue(false)

      const result = loadEmailTemplate('test', { appName: 'MyApp' })
      
      expect(result).toContain('MyApp')
    })

    it('should use default values in fallback when variables missing', () => {
      mockExistsSync.mockReturnValue(false)

      const result = loadEmailTemplate('test', {})
      
      expect(result).toContain('MagicAuth')
      expect(result).toContain(new Date().getFullYear().toString())
    })

    it('should read file with utf-8 encoding', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('<html></html>')

      loadEmailTemplate('test', {})
      
      expect(mockReadFileSync).toHaveBeenCalledWith(
        expect.any(String),
        'utf-8'
      )
    })

    it('should construct correct file path', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('<html></html>')

      loadEmailTemplate('magic-link', {})
      
      const calledPath = mockReadFileSync.mock.calls[0][0] as string
      expect(calledPath).toContain('templates')
      expect(calledPath).toContain('magic-link.html')
    })

    it('should prefer user template over package template', () => {
      // First call (user template) returns true, package template not checked
      mockExistsSync.mockImplementation((path: string) => {
        return path.includes(process.cwd())
      })
      mockReadFileSync.mockReturnValue('<user>Custom Template</user>')

      const result = loadEmailTemplate('test', {})
      
      expect(result).toBe('<user>Custom Template</user>')
      // Should check user path first
      expect(mockExistsSync.mock.calls[0][0]).toContain(process.cwd())
    })
  })
})
