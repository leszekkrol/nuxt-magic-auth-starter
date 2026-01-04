import { randomBytes, createHash } from 'crypto'

export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

export function generateShortToken(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  const bytes = randomBytes(length)
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }
  
  return result
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function verifyTokenHash(token: string, hash: string): boolean {
  return hashToken(token) === hash
}

export function getTokenExpiration(minutes: number = 15): Date {
  return new Date(Date.now() + minutes * 60 * 1000)
}

export function isTokenExpired(expirationDate: Date): boolean {
  return new Date() > expirationDate
}

export function getTokenRemainingTime(expirationDate: Date): number {
  const remaining = expirationDate.getTime() - Date.now()
  return Math.max(0, Math.floor(remaining / 1000))
}
