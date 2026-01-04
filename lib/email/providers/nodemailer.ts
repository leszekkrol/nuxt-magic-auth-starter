import { BaseEmailProvider, type EmailConfig } from './base'

export class NodemailerProvider extends BaseEmailProvider {
  private transporter: any
  
  constructor(config: EmailConfig) {
    super(config)
    
    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
      throw new Error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.')
    }
    
    this.initTransporter()
  }
  
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
