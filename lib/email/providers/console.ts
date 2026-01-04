import { BaseEmailProvider, type EmailConfig } from './base'

export class ConsoleProvider extends BaseEmailProvider {
  constructor(config: EmailConfig) {
    super(config)
  }
  
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
