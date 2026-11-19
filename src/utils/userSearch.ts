import type { UsuarioResponse } from '../api/dto'

/**
 * Normaliza un texto eliminando tildes y pasándolo a minúsculas,
 * para que el filtro sea insensible a mayúsculas y acentos.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Filtra una lista de usuarios cuyo nombre o correo contienen el texto buscado.
 * El filtro ignora mayúsculas y tildes.
 *
 * @param users  Lista de usuarios elegibles.
 * @param query  Texto que el operador ha escrito.
 * @returns      Subconjunto de usuarios que coinciden.
 */
export function filterUsers(users: UsuarioResponse[], query: string): UsuarioResponse[] {
  const q = normalize(query.trim())
  if (!q) return users
  return users.filter((u) => {
    const name = normalize(u.nombre)
    const email = normalize(u.correo)
    return name.includes(q) || email.includes(q)
  })
}
