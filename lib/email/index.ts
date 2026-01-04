import type { EmailProvider, EmailConfig } from './providers/base'
import { ConsoleProvider } from './providers/console'
import { ResendProvider } from './providers/resend'
import { NodemailerProvider } from './providers/nodemailer'

export type { EmailProvider, EmailConfig }
export { ConsoleProvider, ResendProvider, NodemailerProvider }

export function createEmailProvider(provider: string, config: EmailConfig): EmailProvider {
  switch (provider.toLowerCase()) {
    case 'resend':
      return new ResendProvider(config)
    case 'nodemailer':
    case 'smtp':
      return new NodemailerProvider(config)
    case 'console':
    default:
      return new ConsoleProvider(config)
  }
}

export function useEmailProvider(): EmailProvider {
  const config = useRuntimeConfig()
  
  const emailConfig: EmailConfig = {
    fromEmail: config.emailConfig.fromEmail,
    fromName: config.emailConfig.fromName,
    appUrl: config.public.appUrl,
    resendApiKey: config.emailConfig.resendApiKey,
    smtpHost: config.emailConfig.smtpHost,
    smtpPort: parseInt(config.emailConfig.smtpPort) || 587,
    smtpSecure: config.emailConfig.smtpSecure,
    smtpUser: config.emailConfig.smtpUser,
    smtpPass: config.emailConfig.smtpPass
  }
  
  return createEmailProvider(config.emailProvider, emailConfig)
}
