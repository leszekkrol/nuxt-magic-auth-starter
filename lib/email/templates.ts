import { readFileSync } from 'fs'
import { join } from 'path'

export interface EmailVariables {
  [key: string]: string
}

export function loadEmailTemplate(templateName: string, variables: EmailVariables = {}): string {
  try {
    const templatePath = join(process.cwd(), 'templates', `${templateName}.html`)
    
    let template = readFileSync(templatePath, 'utf-8')
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      template = template.replace(regex, value)
    })
    
    return template
  } catch (error) {
    console.error(`[Email] Failed to load template: ${templateName}`, error)
    
    const magicLink = variables.magicLink || '#'
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${variables.appName || 'MagicAuth'}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🪄 ${variables.appName || 'MagicAuth'}</h2>
          <p>Click the link below to continue:</p>
          <a href="${magicLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Continue
          </a>
          <p>Or copy and paste this link: ${magicLink}</p>
          <p><small>This link will expire in 15 minutes.</small></p>
          <hr>
          <p><small>© ${variables.year || new Date().getFullYear()} ${variables.appName || 'MagicAuth'}. All rights reserved.</small></p>
        </body>
      </html>
    `
  }
}

export const EmailTemplates = {
  MAGIC_LINK: 'magic-link',
  WELCOME: 'welcome'
} as const

export type EmailTemplateName = typeof EmailTemplates[keyof typeof EmailTemplates]
