import type { AnomaliaResponse } from '../api/dto'

const hoursAgo = (hours: number, now: Date) => new Date(now.getTime() - hours * 3_600_000).toISOString()

export function buildAnomaliesMock(now = new Date()): AnomaliaResponse[] {
  return [
    {
      id: 1,
      valor: 14.2,
      timestamp: hoursAgo(1, now),
      razon: 'La lectura se desvía más del 50% del promedio histórico',
      resuelta: false,
    },
    {
      id: 2,
      valor: 12.8,
      timestamp: hoursAgo(300, now),
      razon: 'La lectura se desvía más del 50% del promedio histórico',
      resuelta: true,
    },
  ]
}
