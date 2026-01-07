import { BaseEmailProvider, type EmailConfig } from './base'

// ============================================================================
// AutoSend Email Provider
// ============================================================================

/**
 * Email provider using AutoSend API
 * 
 * AutoSend is an email platform for developers and marketers to send
 * transactional and marketing emails.
 * 
 * @see https://docs.autosend.com
 * 
 * @example
 * ```ts
 * const provider = new AutoSendProvider({
 *   fromEmail: 'noreply@app.com',
 *   fromName: 'My App',
 *   appUrl: 'https://app.com',
 *   autosendApiKey: 'as_xxxx'
 * })
 * ```
 */
export class AutoSendProvider extends BaseEmailProvider {
  private apiKey: string
  private apiUrl = 'https://api.autosend.com/v1/mails/send'
  
  constructor(config: EmailConfig) {
    super(config)
    
    if (!config.autosendApiKey) {
      throw new Error('AutoSend API key is required. Set AUTOSEND_API_KEY in your environment.')
    }
    
    this.apiKey = config.autosendApiKey
  }
  
  /**
   * Sends email via AutoSend API
   * @private
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: { email: to },
          from: {
            email: this.config.fromEmail,
            name: this.config.fromName
          },
          subject,
          html
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`AutoSend API error: ${response.status} - ${error}`)
      }

      return await response.json()
    } catch (error: any) {
      throw new Error(`Failed to send email via AutoSend: ${error.message}`)
    }
  }
  
  /**
   * Sends magic link email via AutoSend API
   */
  async sendMagicLink(to: string, token: string, name?: string): Promise<void> {
    const html = this.getMagicLinkHtml(token, name)
    await this.sendEmail(to, '🪄 Your Magic Link', html)
  }
  
  /**
   * Sends welcome email via AutoSend API
   */
  async sendWelcome(to: string, name: string): Promise<void> {
    const html = this.getWelcomeHtml(name)
    await this.sendEmail(to, `Welcome to ${this.config.fromName}!`, html)
  }
}



