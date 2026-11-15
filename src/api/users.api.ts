import { http } from './http'
import type { UsuarioResponse } from './dto'

/** GET /api/usuarios — solo OPERADOR */
export async function listarUsuarios(): Promise<UsuarioResponse[]> {
  const res = await http.get<UsuarioResponse[]>('/usuarios')
  return res.data
}
