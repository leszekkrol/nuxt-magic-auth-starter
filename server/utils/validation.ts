// ============================================================================
// Email Validation
// ============================================================================

/**
 * RFC 5322 compliant email regex pattern
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  if (email.length > 254) return false
  if (!EMAIL_REGEX.test(email)) return false
  
  const parts = email.split('@')
  if (parts[0].length > 64) return false
  
  return true
}

/**
 * Normalizes email address (lowercase, trimmed)
 * @param email - Email address to normalize
 * @returns Normalized email string
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Validates and normalizes email in one step
 * @param email - Email address to process
 * @returns Normalized email if valid, null otherwise
 */
export function validateAndNormalizeEmail(email: string): string | null {
  const normalized = normalizeEmail(email)
  return isValidEmail(normalized) ? normalized : null
}

// ============================================================================
// Name Validation
// ============================================================================

/**
 * Validates user name format
 * @param name - Name to validate
 * @returns True if name is valid (2-100 characters)
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false
  const trimmed = name.trim()
  return trimmed.length >= 2 && trimmed.length <= 100
}

/**
 * Normalizes name (trims whitespace, capitalizes words)
 * @param name - Name to normalize
 * @returns Properly capitalized name
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// ============================================================================
// Generic Type Guards
// ============================================================================

/**
 * Type guard for non-empty strings
 * @param value - Value to check
 * @returns True if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Type guard for valid database IDs (CUID or UUID format)
 * @param id - Value to validate
 * @returns True if id matches CUID or UUID format
 */
export function isValidId(id: unknown): id is string {
  if (typeof id !== 'string') return false
  
  // CUID format: starts with 'c', followed by 24+ alphanumeric chars
  const cuidRegex = /^c[a-z0-9]{24,}$/
  // UUID v1-5 format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  return cuidRegex.test(id) || uuidRegex.test(id)
}

// ============================================================================
// Error Handling
// ============================================================================

export interface ValidationError {
  field: string
  message: string
}

/**
 * Creates a standardized validation error response
 * @param errors - Array of validation errors
 * @returns H3 error object with 400 status
 */
export function createValidationError(errors: ValidationError[]): ReturnType<typeof createError> {
  return createError({
    statusCode: 400,
    statusMessage: 'Validation Error',
    message: 'Invalid input data',
    data: { errors }
  })
}
