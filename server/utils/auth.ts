import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  email: string
  name: string | null
}

const JWT_COOKIE_NAME = 'auth_token'
const JWT_EXPIRATION = '7d'
const JWT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

function getJwtSecret(): string {
  const config = useRuntimeConfig()
  const secret = config.jwtSecret
  
  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Please set it in your environment variables.')
  }
  
  return secret
}

export function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRATION })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload
  } catch {
    return null
  }
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}

export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: JWT_COOKIE_MAX_AGE,
    path: '/'
  })
}

export function getAuthCookie(event: H3Event): string | undefined {
  return getCookie(event, JWT_COOKIE_NAME)
}

export function clearAuthCookie(event: H3Event): void {
  deleteCookie(event, JWT_COOKIE_NAME, { path: '/' })
}

export function getCurrentUser(event: H3Event): JWTPayload | null {
  const token = getAuthCookie(event)
  if (!token) return null
  return verifyJWT(token)
}

export function isAuthenticated(event: H3Event): boolean {
  return getCurrentUser(event) !== null
}

export function requireAuth(event: H3Event): JWTPayload {
  const user = getCurrentUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required'
    })
  }
  
  return user
}

export function loginUser(event: H3Event, user: AuthUser): string {
  const token = generateJWT({
    userId: user.id,
    email: user.email
  })
  
  setAuthCookie(event, token)
  return token
}

export function logoutUser(event: H3Event): void {
  clearAuthCookie(event)
}
