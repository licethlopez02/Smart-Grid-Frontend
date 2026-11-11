import i18n from '../i18n'
import type { ConsumptionPoint, Reading } from '../types'
import { formatDate } from './format'

export type Period = 'day' | 'week' | 'month' | 'year'
export const PERIODS: Period[] = ['day', 'week', 'month', 'year']

const locale = () => (i18n.language === 'es' ? 'es-CO' : i18n.language)
const pad = (value: number) => String(value).padStart(2, '0')

// Range boundaries are local midnights, so they stay stable between renders (safe as query keys).
export function getRange(period: Period, now = new Date()): { from: Date; to: Date } {
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  switch (period) {
    case 'day':
      return { from: new Date(year, month, day), to: new Date(year, month, day + 1) }
    case 'week':
      return { from: new Date(year, month, day - 6), to: new Date(year, month, day + 1) }
    case 'month':
      return { from: new Date(year, month, 1), to: new Date(year, month + 1, 1) }
    case 'year':
      return { from: new Date(year, 0, 1), to: new Date(year + 1, 0, 1) }
  }
}

export const toApiInstant = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z')

// Sums raw readings into hours (day), days (week/month) or months (year).
export function groupReadings(readings: Reading[], period: Period): ConsumptionPoint[] {
  const buckets = new Map<string, ConsumptionPoint>()

  for (const reading of readings) {
    const date = new Date(reading.timestamp)
    const dayKey = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

    let key: string
    let label: string
    let fullLabel: string
    if (period === 'day') {
      key = `${dayKey}T${pad(date.getHours())}`
      label = `${pad(date.getHours())}:00`
      fullLabel = `${formatDate(dayKey)} ${label}`
    } else if (period === 'year') {
      key = dayKey.slice(0, 7)
      label = new Intl.DateTimeFormat(locale(), { month: 'short' }).format(date)
      fullLabel = new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' }).format(date)
    } else {
      key = dayKey
      label =
        period === 'month'
          ? String(date.getDate())
          : new Intl.DateTimeFormat(locale(), { weekday: 'short', day: 'numeric' }).format(date)
      fullLabel = formatDate(dayKey)
    }

    const bucket = buckets.get(key)
    if (bucket) bucket.kwh += reading.kwh
    else buckets.set(key, { key, label, fullLabel, kwh: reading.kwh })
  }

  return [...buckets.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((point) => ({ ...point, kwh: Math.round(point.kwh * 100) / 100 }))
}
