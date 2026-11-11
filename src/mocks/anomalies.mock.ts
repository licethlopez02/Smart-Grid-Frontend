import type { AnomalyDto } from '../api/dto'

const hoursAgo = (hours: number, now: Date) => new Date(now.getTime() - hours * 3_600_000).toISOString()

export function buildAnomaliesMock(now = new Date()): AnomalyDto[] {
  return [
    {
      valor: 14.2,
      timestamp: hoursAgo(1, now),
      razon: 'La lectura se desvía más del 50% del promedio histórico',
      tipo: 'ANOMALIA_CONSUMO',
      estado: 'PENDIENTE',
    },
    {
      valor: -1,
      timestamp: hoursAgo(30, now),
      razon: 'Lectura negativa descartada; alerta de sensor defectuoso generada',
      tipo: 'SENSOR_DEFECTUOSO',
      estado: 'RESUELTA',
    },
    {
      valor: 12.8,
      timestamp: hoursAgo(300, now),
      razon: 'La lectura se desvía más del 50% del promedio histórico',
      tipo: 'ANOMALIA_CONSUMO',
      estado: 'RESUELTA',
    },
  ]
}
