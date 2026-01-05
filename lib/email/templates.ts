import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get the directory of this file (inside the package)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageTemplatesDir = join(__dirname, '..', '..', 'templates')

// ============================================================================
// Types
// ============================================================================

/**
 * Variables that can be injected into email templates
 */
export interface EmailVariables {
  [key: string]: string
}

// ============================================================================
// Template Loading
// ============================================================================

/**
 * Loads an HTML email template and replaces placeholders with variables
 * 
 * Template resolution order:
 * 1. User's project: `{project}/templates/{name}.html` (allows customization)
 * 2. Package default: `{package}/templates/{name}.html` (built-in templates)
 * 3. Fallback: Minimal inline HTML template
 * 
 * Placeholders use Mustache-style syntax: {{variableName}}
 * 
 * @param templateName - Name of template file (without .html extension)
 * @param variables - Key-value pairs to replace in template
 * @returns Processed HTML string
 * 
 * @example
 * ```ts
 * const html = loadEmailTemplate('magic-link', {
 *   name: 'John',
 *   magicLink: 'https://app.com/verify?token=abc'
 * })
 * ```
 */
export function loadEmailTemplate(templateName: string, variables: EmailVariables = {}): string {
  try {
    // First, try to load from user's project (allows customization)
    const userTemplatePath = join(process.cwd(), 'templates', `${templateName}.html`)
    // Fallback to package templates
    const packageTemplatePath = join(packageTemplatesDir, `${templateName}.html`)
    
    let templatePath: string
    if (existsSync(userTemplatePath)) {
      templatePath = userTemplatePath
    } else if (existsSync(packageTemplatePath)) {
      templatePath = packageTemplatePath
    } else {
      throw new Error(`Template not found: ${templateName}`)
    }
    
    let template = readFileSync(templatePath, 'utf-8')
    
    // Replace all {{placeholder}} occurrences with values
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      template = template.replace(regex, value)
    })
    
    return template
  } catch (error) {
    console.error(`[Email] Failed to load template: ${templateName}`, error)
    
    // Fallback to minimal HTML when template file is missing
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

// ============================================================================
// Template Constants
// ============================================================================

/**
 * Available email template names
 */
export const EmailTemplates = {
  MAGIC_LINK: 'magic-link',
  WELCOME: 'welcome'
} as const

export type EmailTemplateName = typeof EmailTemplates[keyof typeof EmailTemplates]
