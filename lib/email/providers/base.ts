import { 
  loadEmailTemplate as defaultLoadEmailTemplate,
  type EmailVariables
} from '../templates'

export interface EmailProvider {
  sendMagicLink(to: string, token: string, name?: string): Promise<void>
  sendWelcome(to: string, name: string): Promise<void>
}

export type EmailTemplateLoader = (templateName: string, variables: EmailVariables) => string

export interface EmailConfig {
  fromEmail: string
  fromName: string
  appUrl: string
  resendApiKey?: string
  smtpHost?: string
  smtpPort?: number
  smtpSecure?: boolean
  smtpUser?: string
  smtpPass?: string
  loadEmailTemplate?: EmailTemplateLoader
}

export abstract class BaseEmailProvider implements EmailProvider {
  protected config: EmailConfig
  private templateLoader: EmailTemplateLoader
  
  constructor(config: EmailConfig) {
    this.config = config
    this.templateLoader = config.loadEmailTemplate || defaultLoadEmailTemplate
  }
  
  abstract sendMagicLink(to: string, token: string, name?: string): Promise<void>
  abstract sendWelcome(to: string, name: string): Promise<void>
  
  protected getMagicLinkUrl(token: string): string {
    return `${this.config.appUrl}/verify?token=${token}`
  }
  
  protected getMagicLinkHtml(token: string, name?: string): string {
    return this.templateLoader('magic-link', {
      magicLink: this.getMagicLinkUrl(token),
      name: name || 'there',
      appName: this.config.fromName,
      appUrl: this.config.appUrl,
      year: new Date().getFullYear().toString()
    })
  }
  
  protected getWelcomeHtml(name: string): string {
    return this.templateLoader('welcome', {
      name,
      appName: this.config.fromName,
      appUrl: this.config.appUrl,
      year: new Date().getFullYear().toString()
    })
  }
}
