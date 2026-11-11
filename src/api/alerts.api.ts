import { http } from './http'
import { env } from '../config/env'
import { buildAnomaliesMock } from '../mocks/anomalies.mock'
import type { AnomalyDto } from './dto'
import type { Alert, AlertStatus } from '../types'

function toStatus(estado: AnomalyDto['estado']): AlertStatus | null {
  if (estado === 'PENDIENTE') return 'pending'
  if (estado === 'RESUELTA') return 'resolved'
  return null
}

function toAlert(meterId: number, dto: AnomalyDto): Alert {
  return {
    id: `${meterId}-${dto.timestamp}`,
    meterId,
    type: dto.tipo === 'SENSOR_DEFECTUOSO' ? 'faulty_sensor' : 'consumption_anomaly',
    description: dto.razon,
    detectedAt: dto.timestamp,
    status: toStatus(dto.estado),
  }
}

export async function getAlerts(meterId: number): Promise<Alert[]> {
  const dtos = env.useMocks.alerts
    ? buildAnomaliesMock()
    : (await http.get<AnomalyDto[]>(`/api/medidores/${meterId}/anomalias`)).data
  return dtos.map((dto) => toAlert(meterId, dto)).sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
}
