import { http } from './http'
import type { MedidorRequest, MedidorResponse } from './dto'

/** GET /api/medidores/mios — medidores asociados al usuario autenticado */
export async function getMyMeters(): Promise<MedidorResponse[]> {
  const { data } = await http.get<MedidorResponse[]>('/medidores/mios')
  return data
}

/** POST /api/medidores — solo OPERADOR */
export async function registrarMedidor(data: MedidorRequest): Promise<MedidorResponse> {
  const res = await http.post<MedidorResponse>('/medidores', data)
  return res.data
}
