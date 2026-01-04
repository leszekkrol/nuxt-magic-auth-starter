export interface EmailProvider {
  sendMagicLink(to: string, token: string, name?: string): Promise<void>
  sendWelcome(to: string, name: string): Promise<void>
}

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
}

export abstract class BaseEmailProvider implements EmailProvider {
  protected config: EmailConfig
  
  constructor(config: EmailConfig) {
    this.config = config
  }
  
  abstract sendMagicLink(to: string, token: string, name?: string): Promise<void>
  abstract sendWelcome(to: string, name: string): Promise<void>
  
  protected getMagicLinkUrl(token: string): string {
    return `${this.config.appUrl}/verify?token=${token}`
  }
  
  protected getMagicLinkHtml(token: string, name?: string): string {
    const url = this.getMagicLinkUrl(token)
    const greeting = name ? `Hi ${name}` : 'Hi there'
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Magic Link</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">🪄 Magic Link</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        ${greeting}!
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Click the button below to sign in to your account. This link will expire in 15 minutes.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Sign In to Your Account
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
        If you didn't request this email, you can safely ignore it.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${url}" style="color: #6366f1; word-break: break-all;">${url}</a>
      </p>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} ${this.config.fromName}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }
  
  protected getWelcomeHtml(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; margin: 0;">🎉 Welcome!</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${name}!
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Welcome to ${this.config.fromName}! Your account has been successfully created.
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        We're excited to have you on board. If you have any questions, feel free to reach out.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${this.config.appUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Get Started
        </a>
      </div>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} ${this.config.fromName}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }
}
