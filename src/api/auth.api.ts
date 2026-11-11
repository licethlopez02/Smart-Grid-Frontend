import { http } from './http'
import type { LoginRequest, RegistroRequest, TokenResponse, UsuarioResponse } from './dto'

export async function login(correo: string, contrasena: string): Promise<TokenResponse> {
  const { data } = await http.post<TokenResponse>('/api/auth/login', {
    correo,
    contrasena,
  } satisfies LoginRequest)
  return data
}

export async function registro(data: RegistroRequest): Promise<UsuarioResponse> {
  const { data: responseData } = await http.post<UsuarioResponse>('/api/auth/registro', data)
  return responseData
}

export async function getMe(): Promise<UsuarioResponse> {
  const { data } = await http.get<UsuarioResponse>('/api/usuarios/me')
  return data
}
