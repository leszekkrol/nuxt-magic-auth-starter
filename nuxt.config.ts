// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  
  // Nitro configuration for Prisma 7 adapter
  nitro: {
    externals: {
      inline: ['@prisma/client', '@prisma/adapter-pg']
    }
  },
  
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    // Email provider config (user configures according to choice)
    emailProvider: process.env.EMAIL_PROVIDER || 'console', // console, resend, nodemailer
    emailConfig: {
      // Resend
      resendApiKey: process.env.RESEND_API_KEY,
      // Nodemailer (SMTP)
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpSecure: process.env.SMTP_SECURE === 'true',
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      // Common
      fromEmail: process.env.FROM_EMAIL || 'noreply@yourapp.com',
      fromName: process.env.FROM_NAME || 'Your App'
    },
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000'
    }
  }
})

