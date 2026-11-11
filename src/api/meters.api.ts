import { env } from '../config/env'

/**
 * Obtiene el ID del medidor asociado al usuario.
 *
 * TODO: El backend no implementa actualmente un endpoint para listar los medidores
 * de un usuario ni para obtener el medidor asignado (ver docs/backend-contract.md:
 * "NO existe endpoint para listar los medidores de un usuario ni para listar zonas").
 * Por el momento se utiliza el valor de desarrollo VITE_DEV_METER_ID definido en config/env.ts.
 * Cuando el backend añada soporte para consultar el medidor propio (por ejemplo GET /api/medidores/mio),
 * se debe actualizar esta función.
 */
export async function getMyMeterId(): Promise<number> {
  return env.devMeterId
}
