import { http } from './http'
import type { AnomaliaResponse } from './dto'

export async function getAnomalies(meterId: number): Promise<AnomaliaResponse[]> {
  const { data } = await http.get<AnomaliaResponse[]>(`/api/medidores/${meterId}/anomalias`)
  return data
}

export async function getPendingAnomalies(
  meterId: number,
  desde?: string,
  hasta?: string,
): Promise<AnomaliaResponse[]> {
  const { data } = await http.get<AnomaliaResponse[]>(`/api/medidores/${meterId}/anomalias/pendientes`, {
    params: { desde, hasta },
  })
  return data
}

export async function resolveAnomaly(meterId: number, anomalyId: number): Promise<void> {
  await http.post(`/api/medidores/${meterId}/anomalias/${anomalyId}/resolver`)
}

export const getAlerts = getAnomalies
