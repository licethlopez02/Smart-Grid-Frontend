import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getAlerts } from '../api/alerts.api'
import { getConsumptionTotal, getReadings } from '../api/consumption.api'
import { getInvoice, getMyInvoices } from '../api/invoices.api'
import { getMyMeterId } from '../api/meters.api'
import { getRange, toApiInstant, type Period } from '../utils/consumption'

/**
 * Hook centralizado para obtener el ID del medidor activo.
 *
 * TODO: Actualmente el backend no expone un endpoint para listar los medidores de un usuario
 * ni asociar automáticamente un medidor al usuario autenticado (ver docs/backend-contract.md:
 * "NO existe endpoint para listar los medidores de un usuario ni para listar zonas").
 * Por ahora se utiliza VITE_DEV_METER_ID configurado en config/env.ts.
 * Cuando exista una fuente real en el backend (ej: GET /api/medidores/mio o endpoint de usuario),
 * solo será necesario cambiar la lógica dentro de este hook.
 */
export function useMedidorActivo() {
  return useQuery({
    queryKey: ['medidor-activo'],
    queryFn: getMyMeterId,
    staleTime: Infinity,
  })
}

// Alias de retrocompatibilidad
export const useMyMeterId = useMedidorActivo

// Runs a query that needs the user's meter id, and merges both loading/error states.
function useMeterQuery<T>(key: unknown[], fetcher: (meterId: number) => Promise<T>, refetchInterval?: number) {
  const meter = useMedidorActivo()
  const meterId = meter.data
  const query = useQuery({
    queryKey: [...key, meterId],
    queryFn: () => fetcher(meterId as number),
    enabled: typeof meterId === 'number' && !isNaN(meterId),
    refetchInterval,
  })
  const error = meter.error ?? query.error
  return { data: query.data, error, isPending: meter.isPending || (!error && query.isPending) }
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
  return useQuery({
    queryKey: ['invoices', 'mias'],
    queryFn: getMyInvoices,
  })
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoice(id),
    enabled: Number.isFinite(id) && id > 0,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404)) {
        return false
      }
      return failureCount < 2
    },
  })
}
