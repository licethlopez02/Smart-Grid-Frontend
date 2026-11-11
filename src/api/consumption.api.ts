import { http } from './http'
import type { ConsumoResponse, LecturaResponse } from './dto'

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
