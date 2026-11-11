import type { Role } from '../types'

export interface JwtPayload {
  sub: string
  correo?: string
  roles?: Role[]
  iss?: string
  iat?: number
  exp?: number
  [key: string]: unknown
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const jsonString = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonString) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(payload: JwtPayload | null): boolean {
  if (!payload || typeof payload.exp !== 'number') return false
  return payload.exp * 1000 <= Date.now()
}
