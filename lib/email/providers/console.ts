import { BaseEmailProvider, type EmailConfig } from './base'

// ============================================================================
// Console Email Provider
// ============================================================================

/**
 * Development email provider that outputs to console
 * 
 * Use this provider during development to see email content
 * without actually sending emails. Perfect for local testing.
 * 
 * @example
 * ```ts
 * const provider = new ConsoleProvider({
 *   fromEmail: 'noreply@app.com',
 *   fromName: 'My App',
 *   appUrl: 'http://localhost:3000'
 * })
 * 
 * await provider.sendMagicLink('user@example.com', 'token123')
 * // Outputs formatted email to console
 * ```
 */
export class ConsoleProvider extends BaseEmailProvider {
  constructor(config: EmailConfig) {
    super(config)
  }
  
  /**
   * Outputs magic link email to console
   */
  async sendMagicLink(to: string, token: string, name?: string): Promise<void> {
    const url = this.getMagicLinkUrl(token)
    
    console.log('\n' + '='.repeat(60))
    console.log('🪄 MAGIC LINK EMAIL')
    console.log('='.repeat(60))
    console.log(`To: ${to}`)
    console.log(`From: ${this.config.fromName} <${this.config.fromEmail}>`)
    console.log(`Subject: 🪄 Your Magic Link`)
    console.log('-'.repeat(60))
    console.log(`Hi ${name || 'there'}!`)
    console.log('')
    console.log('Click the link below to sign in:')
    console.log('')
    console.log(`  👉 ${url}`)
    console.log('')
    console.log('This link expires in 15 minutes.')
    console.log('='.repeat(60) + '\n')
  }
  
  /**
   * Outputs welcome email to console
   */
  async sendWelcome(to: string, name: string): Promise<void> {
    console.log('\n' + '='.repeat(60))
    console.log('🎉 WELCOME EMAIL')
    console.log('='.repeat(60))
    console.log(`To: ${to}`)
    console.log(`From: ${this.config.fromName} <${this.config.fromEmail}>`)
    console.log(`Subject: Welcome to ${this.config.fromName}!`)
    console.log('-'.repeat(60))
    console.log(`Hi ${name}!`)
    console.log('')
    console.log(`Welcome to ${this.config.fromName}!`)
    console.log('Your account has been successfully created.')
    console.log('')
    console.log(`Get started: ${this.config.appUrl}`)
    console.log('='.repeat(60) + '\n')
  }
}
