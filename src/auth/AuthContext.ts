import { createContext } from 'react'
import type { AuthUser, Role } from '../types'

export interface AuthContextValue {
  token: string | null
  usuarioId: number | null
  roles: Role[]
  esOperador: boolean
  user: AuthUser | null
  isLoading: boolean
  login: (correo: string, contrasena: string) => Promise<void>
  logout: () => void
  hasRole: (role: Role) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
