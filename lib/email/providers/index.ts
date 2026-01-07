/**
 * Email Providers - Barrel Export
 * 
 * Re-exports all email provider implementations:
 * - BaseEmailProvider: Abstract base class
 * - ConsoleProvider: Development (console output)
 * - ResendProvider: Resend API integration
 * - AutoSendProvider: AutoSend API integration
 * - NodemailerProvider: SMTP via Nodemailer
 */
export { BaseEmailProvider, type EmailProvider, type EmailConfig } from './base'
export { ConsoleProvider } from './console'
export { ResendProvider } from './resend'
export { AutoSendProvider } from './autosend'
export { NodemailerProvider } from './nodemailer'
