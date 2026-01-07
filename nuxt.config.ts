/**
 * Nuxt Configuration
 * 
 * @see https://nuxt.com/docs/api/configuration/nuxt-config
 * 
 * Environment Variables:
 * - JWT_SECRET: Secret key for signing JWT tokens (required in production)
 * - EMAIL_PROVIDER: Email provider to use ('console', 'resend', 'nodemailer')
 * - RESEND_API_KEY: API key for Resend (if using Resend provider)
 * - SMTP_*: SMTP configuration (if using Nodemailer provider)
 * - FROM_EMAIL: Sender email address
 * - FROM_NAME: Sender display name
 * - APP_URL: Application base URL for magic links
 * - STRIPE_SECRET_KEY: Stripe secret API key (required for payments)
 * - STRIPE_PUBLISHABLE_KEY: Stripe publishable API key (exposed to client)
 * - STRIPE_WEBHOOK_SECRET: Stripe webhook signing secret (optional but recommended)
 */
export default defineNuxtConfig({
  compatibilityDate: '2026-01-04',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  
  runtimeConfig: {
    // Server-only secrets
    jwtSecret: process.env.JWT_SECRET,
    
    // Email provider selection: 'console' (dev), 'resend', or 'nodemailer'
    emailProvider: process.env.EMAIL_PROVIDER || 'console',
    
    // Email configuration
    emailConfig: {
      // Resend provider
      resendApiKey: process.env.RESEND_API_KEY,
      
      // Nodemailer/SMTP provider
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpSecure: process.env.SMTP_SECURE === 'true',
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      
      // Common sender settings
      fromEmail: process.env.FROM_EMAIL || 'noreply@yourapp.com',
      fromName: process.env.FROM_NAME || 'Your App'
    },
    
    // Stripe configuration
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    
    // Public (exposed to client)
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }
  }
})
