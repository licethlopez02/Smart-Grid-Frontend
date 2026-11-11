import i18n from '../i18n'
import type { ConsumptionPoint } from '../types'
import type { LecturaResponse } from '../api/dto'
import { formatDate, parseLocalDate } from './format'

export type Period = 'day' | 'week' | 'month' | 'year'
export const PERIODS: Period[] = ['day', 'week', 'month', 'year']

/**
 * Zona horaria estándar de operación de la red inteligente Smart Grid.
 * Colombia opera en UTC-5 todo el año sin horario de verano.
 * Se define y documenta explícitamente para agrupar lecturas horarias,
 * diarias y mensuales en el huso horario oficial (America/Bogota).
 */
export const TIMEZONE = 'America/Bogota'

const locale = () => (i18n.language === 'es' ? 'es-CO' : i18n.language)
const pad = (value: number) => String(value).padStart(2, '0')
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Extrae los componentes de fecha y hora proyectados en una zona horaria específica.
 */
export function getZonedParts(date: Date, timeZone = TIMEZONE) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(date)
  const map: Record<string, string> = {}
  for (const part of parts) {
    map[part.type] = part.value
  }
  return {
    year: Number(map.year),
    month: Number(map.month), // 1-12
    day: Number(map.day),
    hour: Number(map.hour === '24' ? '00' : map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  }
}

/**
 * Genera los límites de rango de consulta en America/Bogota (UTC-5).
 * Los límites corresponden a medianoches locales (00:00:00-05:00) para garantizar
 * que los rangos sean estables como claves de consulta en React Query.
 */
export function getRange(period: Period, now = new Date()): { from: Date; to: Date } {
  const { year, month, day } = getZonedParts(now, TIMEZONE)

  // Crea una fecha correspondiente a la medianoche en America/Bogota (UTC-5)
  const bogotaDate = (y: number, m: number, d: number) =>
    new Date(`${y}-${pad(m)}-${pad(d)}T00:00:00-05:00`)

  switch (period) {
    case 'day': {
      const from = bogotaDate(year, month, day)
      const to = new Date(from.getTime() + 24 * 60 * 60 * 1000)
      return { from, to }
    }
    case 'week': {
      const startDay = new Date(bogotaDate(year, month, day).getTime() - 6 * 24 * 60 * 60 * 1000)
      const { year: sy, month: sm, day: sd } = getZonedParts(startDay, TIMEZONE)
      const from = bogotaDate(sy, sm, sd)
      const to = new Date(bogotaDate(year, month, day).getTime() + 24 * 60 * 60 * 1000)
      return { from, to }
    }
    case 'month': {
      const from = bogotaDate(year, month, 1)
      const nextMonthYear = month === 12 ? year + 1 : year
      const nextMonth = month === 12 ? 1 : month + 1
      const to = bogotaDate(nextMonthYear, nextMonth, 1)
      return { from, to }
    }
    case 'year': {
      const from = bogotaDate(year, 1, 1)
      const to = bogotaDate(year + 1, 1, 1)
      return { from, to }
    }
  }
}

/**
 * Convierte un objeto Date a formato ISO con hora y zona UTC (ej. 2026-10-01T00:00:00.000Z).
 */
export const toApiInstant = (date: Date) => date.toISOString()

/**
 * Agrupa las lecturas reales recibidas del backend según el período (día, semana, mes, año)
 * utilizando la zona horaria oficial America/Bogota.
 * El backend no entrega lecturas agregadas por día o mes, por lo que se suman las lecturas
 * crudas existentes por cubeta sin inventar datos ni interpolar valores.
 */
export function groupReadings(readings: LecturaResponse[], period: Period): ConsumptionPoint[] {
  const buckets = new Map<string, ConsumptionPoint>()

  for (const reading of readings) {
    const date = new Date(reading.timestamp)
    if (isNaN(date.getTime())) continue

    const { year, month, day, hour } = getZonedParts(date, TIMEZONE)
    const dayKey = `${year}-${pad(month)}-${pad(day)}`

    let key: string
    let label: string
    let fullLabel: string

    if (period === 'day') {
      key = `${dayKey}T${pad(hour)}:00`
      label = `${pad(hour)}:00`
      fullLabel = `${formatDate(dayKey)} ${label}`
    } else if (period === 'year') {
      key = `${year}-${pad(month)}`
      const monthDate = parseLocalDate(`${key}-01`)
      label = new Intl.DateTimeFormat(locale(), { month: 'short' }).format(monthDate)
      fullLabel = capitalize(
        new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' }).format(monthDate),
      )
    } else {
      key = dayKey
      const dayDate = parseLocalDate(dayKey)
      label =
        period === 'month'
          ? String(day)
          : new Intl.DateTimeFormat(locale(), { weekday: 'short', day: 'numeric' }).format(dayDate)
      fullLabel = formatDate(dayKey)
    }

    const existing = buckets.get(key)
    if (existing) {
      existing.kwh += reading.valor
    } else {
      buckets.set(key, { key, label, fullLabel, kwh: reading.valor })
    }
  }

  return [...buckets.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((point) => ({ ...point, kwh: Math.round(point.kwh * 100) / 100 }))
}
