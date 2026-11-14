import { http } from './http'
import type { ConsumoResponse, ConsumoZonaResponse, LecturaResponse } from './dto'

export async function getReadings(
  meterId: number,
  desde?: string,
  hasta?: string,
): Promise<LecturaResponse[]> {
  const { data } = await http.get<LecturaResponse[]>(`/api/medidores/${meterId}/lecturas`, {
    params: { desde, hasta },
  })
  return data
}

export async function getConsumption(
  meterId: number,
  desde?: string,
  hasta?: string,
): Promise<ConsumoResponse> {
  const { data } = await http.get<ConsumoResponse>(`/api/medidores/${meterId}/consumo`, {
    params: { desde, hasta },
  })
  return data
}

export async function getConsumptionTotal(
  meterId: number,
  desde?: string,
  hasta?: string,
): Promise<number> {
  const data = await getConsumption(meterId, desde, hasta)
  return data.consumoAcumulado
}

/** GET /api/medidores/consumo-por-zona — solo OPERADOR.
 *  desde y hasta son instantes ISO opcionales; zona es obligatoria. */
export async function getConsumptionByZone(
  zona: string,
  desde?: string,
  hasta?: string,
): Promise<ConsumoZonaResponse[]> {
  const params: Record<string, string> = { zona: zona.trim() }
  if (desde) params.desde = desde
  if (hasta) params.hasta = hasta
  const { data } = await http.get<ConsumoZonaResponse[]>('/medidores/consumo-por-zona', { params })
  return data
}
