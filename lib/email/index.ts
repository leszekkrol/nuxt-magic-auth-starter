import type { EmailProvider, EmailConfig } from './providers/base'
import { ConsoleProvider } from './providers/console'
import { ResendProvider } from './providers/resend'
import { NodemailerProvider } from './providers/nodemailer'

// ============================================================================
// Re-exports
// ============================================================================

export type { EmailProvider, EmailConfig }
export { ConsoleProvider, ResendProvider, NodemailerProvider }
export { loadEmailTemplate, EmailTemplates } from './templates'
export type { EmailVariables, EmailTemplateName } from './templates'
export type { EmailTemplateLoader } from './providers/base'

// ============================================================================
// Provider Factory
// ============================================================================

/**
 * Creates an email provider instance based on provider name
 * 
 * @param provider - Provider name: 'console', 'resend', 'nodemailer', or 'smtp'
 * @param config - Email configuration including credentials
 * @returns Configured email provider instance
 * 
 * @example
 * ```ts
 * const provider = createEmailProvider('resend', {
 *   fromEmail: 'noreply@app.com',
 *   fromName: 'My App',
 *   appUrl: 'https://app.com',
 *   resendApiKey: 'your-api-key'
 * })
 * ```
 */
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

// ============================================================================
// Nuxt Integration
// ============================================================================

/**
 * Creates email provider from Nuxt runtime configuration
 * 
 * Reads email settings from `nuxt.config.ts` runtimeConfig.
 * Use this in server API routes for seamless integration.
 * 
 * @returns Configured email provider based on runtime config
 * 
 * @example
 * ```ts
 * // In server/api/auth/send-magic-link.post.ts
 * const emailProvider = useEmailProvider()
 * await emailProvider.sendMagicLink(email, token)
 * ```
 */
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
