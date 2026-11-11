import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAlerts } from '../api/alerts.api'
import { getConsumptionTotal, getReadings } from '../api/consumption.api'
import { getInvoice, getInvoicesByMeter } from '../api/invoices.api'
import { getMyMeterId } from '../api/meters.api'
import { getRange, toApiInstant, type Period } from '../utils/consumption'

export function useMyMeterId() {
  return useQuery({ queryKey: ['my-meter'], queryFn: getMyMeterId, staleTime: Infinity })
}

// Runs a query that needs the user's meter id, and merges both loading/error states.
function useMeterQuery<T>(key: unknown[], fetcher: (meterId: number) => Promise<T>, refetchInterval?: number) {
  const meter = useMyMeterId()
  const meterId = meter.data
  const query = useQuery({
    queryKey: [...key, meterId],
    queryFn: () => fetcher(meterId as number),
    enabled: meterId !== undefined,
    refetchInterval,
  })
  const error = meter.error ?? query.error
  return { data: query.data, error, isPending: !error && query.isPending }
}

function useRange(period: Period) {
  return useMemo(() => {
    const { from, to } = getRange(period)
    return { from: toApiInstant(from), to: toApiInstant(to) }
  }, [period])
}

export function useReadings(period: Period) {
  const { from, to } = useRange(period)
  return useMeterQuery(['readings', period, from, to], (meterId) => getReadings(meterId, from, to))
}

export function useConsumptionTotal(period: Period) {
  const { from, to } = useRange(period)
  return useMeterQuery(['consumption-total', period, from, to], (meterId) => getConsumptionTotal(meterId, from, to))
}

// Alerts must show up close to when they happen (HU-04): poll every 15 s until the backend can push.
export function useAlerts() {
  return useMeterQuery(['alerts'], getAlerts, 15_000)
}

export function useInvoices() {
  return useMeterQuery(['invoices'], getInvoicesByMeter)
}

export function useInvoice(id: number) {
  return useQuery({ queryKey: ['invoice', id], queryFn: () => getInvoice(id) })
}
