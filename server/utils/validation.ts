const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  if (email.length > 254) return false
  if (!EMAIL_REGEX.test(email)) return false
  
  const parts = email.split('@')
  if (parts[0].length > 64) return false
  
  return true
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function validateAndNormalizeEmail(email: string): string | null {
  const normalized = normalizeEmail(email)
  return isValidEmail(normalized) ? normalized : null
}

export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false
  const trimmed = name.trim()
  return trimmed.length >= 2 && trimmed.length <= 100
}

export function normalizeName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isValidId(id: unknown): id is string {
  if (typeof id !== 'string') return false
  
  const cuidRegex = /^c[a-z0-9]{24,}$/
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  return cuidRegex.test(id) || uuidRegex.test(id)
}

export interface ValidationError {
  field: string
  message: string
}

export function createValidationError(errors: ValidationError[]): ReturnType<typeof createError> {
  return createError({
    statusCode: 400,
    statusMessage: 'Validation Error',
    message: 'Invalid input data',
    data: { errors }
  })
}
