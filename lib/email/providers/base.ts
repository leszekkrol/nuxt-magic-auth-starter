import { 
  loadEmailTemplate as defaultLoadEmailTemplate,
  type EmailVariables
} from '../templates'

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Email provider interface for sending authentication emails
 */
export interface EmailProvider {
  /**
   * Sends magic link email to user
   * @param to - Recipient email address
   * @param token - Magic link verification token
   * @param name - Optional recipient name for personalization
   */
  sendMagicLink(to: string, token: string, name?: string): Promise<void>
  
  /**
   * Sends welcome email to newly registered user
   * @param to - Recipient email address
   * @param name - User's name for personalization
   */
  sendWelcome(to: string, name: string): Promise<void>
}

/**
 * Custom template loader function type
 * Allows overriding default template loading behavior
 */
export type EmailTemplateLoader = (templateName: string, variables: EmailVariables) => string

/**
 * Configuration options for email providers
 */
export interface EmailConfig {
  /** Sender email address */
  fromEmail: string
  /** Sender display name */
  fromName: string
  /** Application base URL (for magic links) */
  appUrl: string
  
  // Resend provider options
  resendApiKey?: string
  
  // AutoSend provider options
  autosendApiKey?: string
  
  // SMTP/Nodemailer options
  smtpHost?: string
  smtpPort?: number
  smtpSecure?: boolean
  smtpUser?: string
  smtpPass?: string
  
  /**
   * Custom template loader function
   * If not provided, uses default file-based loader
   */
  loadEmailTemplate?: EmailTemplateLoader
}

// ============================================================================
// Base Provider
// ============================================================================

/**
 * Abstract base class for email providers
 * 
 * Provides common functionality for all email providers:
 * - Template loading and variable substitution
 * - Magic link URL generation
 * - Standard email content generation
 * 
 * Extend this class to implement custom email providers.
 */
export abstract class BaseEmailProvider implements EmailProvider {
  protected config: EmailConfig
  private templateLoader: EmailTemplateLoader
  
  constructor(config: EmailConfig) {
    this.config = config
    this.templateLoader = config.loadEmailTemplate || defaultLoadEmailTemplate
  }
  
  abstract sendMagicLink(to: string, token: string, name?: string): Promise<void>
  abstract sendWelcome(to: string, name: string): Promise<void>
  
  /**
   * Generates complete magic link URL from token
   */
  protected getMagicLinkUrl(token: string): string {
    return `${this.config.appUrl}/verify?token=${token}`
  }
  
  /**
   * Generates magic link email HTML content
   */
  protected getMagicLinkHtml(token: string, name?: string): string {
    return this.templateLoader('magic-link', {
      magicLink: this.getMagicLinkUrl(token),
      name: name || 'there',
      appName: this.config.fromName,
      appUrl: this.config.appUrl,
      year: new Date().getFullYear().toString()
    })
  }
  
  /**
   * Generates welcome email HTML content
   */
  protected getWelcomeHtml(name: string): string {
    return this.templateLoader('welcome', {
      name,
      appName: this.config.fromName,
      appUrl: this.config.appUrl,
      year: new Date().getFullYear().toString()
    })
  }
}
