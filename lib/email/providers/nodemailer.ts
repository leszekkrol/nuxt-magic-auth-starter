import { BaseEmailProvider, type EmailConfig } from './base'

// ============================================================================
// Nodemailer Email Provider
// ============================================================================

/**
 * Email provider using Nodemailer with SMTP
 * 
 * Supports any SMTP server (Gmail, Mailgun, SendGrid, custom).
 * Requires `nodemailer` package: npm install nodemailer
 * 
 * @see https://nodemailer.com/
 * 
 * @example
 * ```ts
 * const provider = new NodemailerProvider({
 *   fromEmail: 'noreply@app.com',
 *   fromName: 'My App',
 *   appUrl: 'https://app.com',
 *   smtpHost: 'smtp.gmail.com',
 *   smtpPort: 587,
 *   smtpSecure: false,
 *   smtpUser: 'user@gmail.com',
 *   smtpPass: 'app-password'
 * })
 * ```
 */
export class NodemailerProvider extends BaseEmailProvider {
  private transporter: any
  
  constructor(config: EmailConfig) {
    super(config)
    
    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
      throw new Error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.')
    }
    
    this.initTransporter()
  }
  
  /**
   * Initializes Nodemailer transport with SMTP settings
   * Uses dynamic import to avoid bundling if not used
   */
  private async initTransporter(): Promise<void> {
    try {
      const nodemailer = await import('nodemailer')
      
      this.transporter = nodemailer.createTransport({
        host: this.config.smtpHost,
        port: this.config.smtpPort || 587,
        secure: this.config.smtpSecure ?? false,
        auth: {
          user: this.config.smtpUser,
          pass: this.config.smtpPass
        }
      })
    } catch {
      throw new Error('Nodemailer package not found. Install it with: npm install nodemailer')
    }
  }
  
  /**
   * Sends magic link email via SMTP
   */
  async sendMagicLink(to: string, token: string, name?: string): Promise<void> {
    if (!this.transporter) {
      await this.initTransporter()
    }
    
    try {
      await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to,
        subject: '🪄 Your Magic Link',
        html: this.getMagicLinkHtml(token, name)
      })
    } catch (error: any) {
      throw new Error(`Failed to send magic link email: ${error.message}`)
    }
  }
  
  /**
   * Sends welcome email via SMTP
   */
  async sendWelcome(to: string, name: string): Promise<void> {
    if (!this.transporter) {
      await this.initTransporter()
    }
    
    try {
      await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to,
        subject: `Welcome to ${this.config.fromName}!`,
        html: this.getWelcomeHtml(name)
      })
    } catch (error: any) {
      throw new Error(`Failed to send welcome email: ${error.message}`)
    }
  }
}
