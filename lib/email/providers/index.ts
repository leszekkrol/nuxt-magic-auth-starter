/**
 * Email Providers - Barrel Export
 * 
 * Re-exports all email provider implementations:
 * - BaseEmailProvider: Abstract base class
 * - ConsoleProvider: Development (console output)
 * - ResendProvider: Resend API integration
 * - NodemailerProvider: SMTP via Nodemailer
 */
export { BaseEmailProvider, type EmailProvider, type EmailConfig } from './base'
export { ConsoleProvider } from './console'
export { ResendProvider } from './resend'
export { NodemailerProvider } from './nodemailer'
