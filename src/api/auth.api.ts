import { http } from './http'
import type { TokenDto, UserDto } from './dto'
import type { AuthUser, Role } from '../types'

export async function login(email: string, password: string): Promise<string> {
  const { data } = await http.post<TokenDto>('/api/auth/login', { correo: email, contrasena: password })
  return data.token
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await http.get<UserDto>('/api/usuarios/me')
  return {
    id: data.id,
    name: data.nombre,
    email: data.correo,
    roles: data.roles as Role[],
    active: data.activo,
  }
}
