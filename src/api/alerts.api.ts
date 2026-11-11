import { http } from './http'
import { env } from '../config/env'
import { buildAnomaliesMock } from '../mocks/anomalies.mock'
import type { AnomaliaResponse } from './dto'
import type { Alert, AlertStatus } from '../types'

function toStatus(resuelta: boolean): AlertStatus {
  return resuelta ? 'resolved' : 'pending'
}

function toAlert(meterId: number, dto: AnomaliaResponse): Alert {
  return {
    id: `${meterId}-${dto.id}`,
    meterId,
    type: 'consumption_anomaly',
    description: dto.razon,
    detectedAt: dto.timestamp,
    status: toStatus(dto.resuelta),
  }
}

export async function getAlerts(meterId: number): Promise<Alert[]> {
  const dtos = env.useMocks.alerts
    ? buildAnomaliesMock()
    : (await http.get<AnomaliaResponse[]>(`/api/medidores/${meterId}/anomalias`)).data
  return dtos.map((dto) => toAlert(meterId, dto)).sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
}
