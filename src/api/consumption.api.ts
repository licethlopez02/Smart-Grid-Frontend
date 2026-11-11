import { http } from './http'
import { env } from '../config/env'
import { buildReadingsMock } from '../mocks/readings.mock'
import type { ConsumptionDto, ReadingDto } from './dto'
import type { Reading } from '../types'

function inRange(readings: ReadingDto[], from: string, to: string) {
  const start = new Date(from).getTime()
  const end = new Date(to).getTime()
  return readings.filter((reading) => {
    const time = new Date(reading.timestamp).getTime()
    return time >= start && time < end
  })
}

export async function getReadings(meterId: number, from: string, to: string): Promise<Reading[]> {
  const dtos = env.useMocks.consumption
    ? inRange(buildReadingsMock(meterId), from, to)
    : (await http.get<ReadingDto[]>(`/api/medidores/${meterId}/lecturas`, { params: { desde: from, hasta: to } })).data
  return dtos.map((dto) => ({ timestamp: dto.timestamp, kwh: dto.valor }))
}

export async function getConsumptionTotal(meterId: number, from: string, to: string): Promise<number> {
  if (env.useMocks.consumption) {
    const total = inRange(buildReadingsMock(meterId), from, to).reduce((sum, reading) => sum + reading.valor, 0)
    return Math.round(total * 100) / 100
  }
  const { data } = await http.get<ConsumptionDto>(`/api/medidores/${meterId}/consumo`, {
    params: { desde: from, hasta: to },
  })
  return data.consumoAcumulado
}
