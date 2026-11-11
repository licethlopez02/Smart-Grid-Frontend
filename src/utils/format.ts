import i18n from '../i18n'
import { env } from '../config/env'

const locale = () => (i18n.language === 'es' ? 'es-CO' : i18n.language)

// 'YYYY-MM-DD' must be read as a local date, otherwise it shifts one day back in UTC-5.
export function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const toDate = (iso: string) => (iso.length === 10 ? parseLocalDate(iso) : new Date(iso))

export const formatKwh = (value: number) =>
  new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(value)

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat(locale(), {
    style: 'currency',
    currency: env.currency,
    maximumFractionDigits: 0,
  }).format(value)

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(locale(), { day: '2-digit', month: 'short', year: 'numeric' }).format(toDate(iso))

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat(locale(), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(toDate(iso))

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export function formatPeriod(startIso: string, endIso: string): string {
  const start = parseLocalDate(startIso)
  const end = parseLocalDate(endIso)
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return capitalize(new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' }).format(start))
  }
  return `${formatDate(startIso)} – ${formatDate(endIso)}`
}

export const formatMeterId = (id: number) => `M-${String(id).padStart(3, '0')}`
