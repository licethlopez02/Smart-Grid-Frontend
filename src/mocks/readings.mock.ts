import type { LecturaResponse } from '../api/dto'

// Daily kWh pattern repeated over time; each day is split into four readings.
const DAILY_KWH = [
  3.1, 3.6, 4.2, 5.8, 4.5, 3.2, 3.8, 6.9, 6.1, 5.9, 5.4, 7.9, 8.4, 7.0, 6.3, 5.9, 6.5, 7.1, 7.5, 8.1, 6.8, 6.1,
  5.2, 6.0, 6.6, 7.3, 5.0, 6.3, 9.1, 7.2, 5.6,
]
const HOURS = [0, 6, 12, 18]
const WEIGHTS = [0.15, 0.2, 0.3, 0.35]

export function buildReadingsMock(meterId: number, now = new Date()): LecturaResponse[] {
  const readings: LecturaResponse[] = []
  for (let back = 400; back >= 0; back--) {
    HOURS.forEach((hour, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back, hour)
      if (date > now) return
      readings.push({
        valor: Math.round(DAILY_KWH[back % DAILY_KWH.length] * WEIGHTS[index] * 100) / 100,
        timestamp: date.toISOString(),
        medidorId: meterId,
      })
    })
  }
  return readings
}
