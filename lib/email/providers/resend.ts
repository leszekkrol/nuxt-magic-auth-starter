import { BaseEmailProvider, type EmailConfig } from './base'

export class ResendProvider extends BaseEmailProvider {
  private resend: any
  
  constructor(config: EmailConfig) {
    super(config)
    
    if (!config.resendApiKey) {
      throw new Error('Resend API key is required. Set RESEND_API_KEY in your environment.')
    }
    
    this.initResend(config.resendApiKey)
  }
  
  private async initResend(apiKey: string): Promise<void> {
    try {
      const { Resend } = await import('resend')
      this.resend = new Resend(apiKey)
    } catch {
      throw new Error('Resend package not found. Install it with: npm install resend')
    }
  }
  
  async sendMagicLink(to: string, token: string, name?: string): Promise<void> {
    if (!this.resend) {
      await this.initResend(this.config.resendApiKey!)
    }
    
    const { error } = await this.resend.emails.send({
      from: `${this.config.fromName} <${this.config.fromEmail}>`,
      to,
      subject: '🪄 Your Magic Link',
      html: this.getMagicLinkHtml(token, name)
    })
    
    if (error) {
      throw new Error(`Failed to send magic link email: ${error.message}`)
    }
  }
  
  async sendWelcome(to: string, name: string): Promise<void> {
    if (!this.resend) {
      await this.initResend(this.config.resendApiKey!)
    }
    
    const { error } = await this.resend.emails.send({
      from: `${this.config.fromName} <${this.config.fromEmail}>`,
      to,
      subject: `Welcome to ${this.config.fromName}!`,
      html: this.getWelcomeHtml(name)
    })
    
    if (error) {
      throw new Error(`Failed to send welcome email: ${error.message}`)
    }
  }
}
