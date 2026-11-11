import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, login as loginRequest } from '../api/auth.api'
import type { AuthUser, Role } from '../types'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { decodeJwt, isTokenExpired } from './jwt'
import { tokenStorage } from './tokenStorage'

function getValidInitialToken(): string | null {
  const token = tokenStorage.get()
  if (!token) return null
  const payload = decodeJwt(token)
  if (!payload || isTokenExpired(payload)) {
    tokenStorage.clear()
    return null
  }
  return token
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(getValidInitialToken)

  const payload = useMemo(() => (token ? decodeJwt(token) : null), [token])

  const usuarioId = useMemo(() => {
    if (!payload?.sub) return null
    const parsed = Number(payload.sub)
    return Number.isFinite(parsed) ? parsed : null
  }, [payload])

  const roles = useMemo<Role[]>(() => (payload?.roles ?? []) as Role[], [payload])

  const esOperador = useMemo(() => roles.includes('OPERADOR'), [roles])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    queryClient.clear()
  }, [queryClient])

  // Manejar expiración (exp)
  useEffect(() => {
    if (!token || !payload?.exp) return

    const msUntilExpire = Math.max(0, payload.exp * 1000 - Date.now())
    const timer = setTimeout(() => {
      logout()
    }, msUntilExpire)

    return () => clearTimeout(timer)
  }, [token, payload, logout])

  const { data: usuarioData = null, isLoading } = useQuery({
    queryKey: ['me', token],
    queryFn: getMe,
    enabled: token !== null,
    retry: false,
  })

  const login = useCallback(async (correo: string, contrasena: string) => {
    const tokenResponse = await loginRequest(correo, contrasena)
    tokenStorage.set(tokenResponse.token)
    setToken(tokenResponse.token)
  }, [])

  const user = useMemo<AuthUser | null>(() => {
    if (!token) return null
    const id = usuarioId ?? usuarioData?.id ?? 0
    const userRoles = usuarioData ? (usuarioData.roles as Role[]) : roles
    return {
      id,
      name: usuarioData?.nombre ?? payload?.correo ?? '',
      email: usuarioData?.correo ?? payload?.correo ?? '',
      roles: userRoles,
      active: usuarioData?.activo ?? true,
    }
  }, [token, usuarioId, usuarioData, roles, payload])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      usuarioId,
      roles,
      esOperador,
      user,
      isLoading,
      login,
      logout,
      hasRole: (role: Role) => roles.includes(role),
    }),
    [token, usuarioId, roles, esOperador, user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
