import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { getAnomalies, getPendingAnomalies, resolveAnomaly } from '../api/alerts.api'
import { getConsumptionTotal, getReadings, getConsumptionByZone } from '../api/consumption.api'
import { getInvoice, getMyInvoices } from '../api/invoices.api'
import { getMyMeters, registrarMedidor } from '../api/meters.api'
import { listarUsuarios } from '../api/users.api'
import i18n from '../i18n'
import { getRange, toApiInstant, type Period } from '../utils/consumption'
import { getErrorMessage } from '../api/http'

/**
 * Hook centralizado para obtener el ID del medidor activo.
 * Consulta los medidores del usuario autenticado vía GET /api/medidores/mios.
 * Si el usuario tiene varios medidores, toma el primero ordenado por ID ascendente.
 */
export function useMedidorActivo() {
  const query = useQuery({
    queryKey: ['meters', 'mine'],
    queryFn: getMyMeters,
  })

  const sortedMeters = useMemo(() => {
    if (!query.data) return []
    return [...query.data].sort((a, b) => a.id - b.id)
  }, [query.data])

  const meterId = sortedMeters.length > 0 ? sortedMeters[0].id : null
  const hasNoMeter = !query.isPending && !query.error && sortedMeters.length === 0

  return {
    ...query,
    data: meterId,
    meters: sortedMeters,
    hasNoMeter,
  }
}

// Runs a query that needs the user's meter id, and merges both loading/error states.
function useMeterQuery<T>(
  key: unknown[],
  fetcher: (meterId: number) => Promise<T>,
  options?: { refetchInterval?: number; refetchIntervalInBackground?: boolean },
) {
  const meter = useMedidorActivo()
  const meterId = meter.data
  const hasMeter = typeof meterId === 'number' && !isNaN(meterId)
  const query = useQuery({
    queryKey: [...key, meterId],
    queryFn: () => fetcher(meterId as number),
    enabled: hasMeter,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: options?.refetchIntervalInBackground ?? false,
  })
  const error = meter.error ?? (hasMeter ? query.error : null)
  return {
    data: query.data,
    error,
    isPending: meter.isPending || (hasMeter && query.isPending),
    hasNoMeter: meter.hasNoMeter,
  }
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
  return useMeterQuery(['consumption-total', period, from, to], (meterId) =>
    getConsumptionTotal(meterId, from, to),
  )
}

// Polling each 30 s, only while the tab is visible (refetchIntervalInBackground: false).
export function useAnomalies() {
  return useMeterQuery(['anomalies'], getAnomalies, {
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
}

// Alias for backward-compatible usage in Home.tsx (shows all anomalies).
export const useAlerts = useAnomalies

export function useResolveAnomaly() {
  const queryClient = useQueryClient()
  const meter = useMedidorActivo()
  const meterId = meter.data

  return useMutation({
    mutationFn: (anomalyId: number) => {
      if (typeof meterId !== 'number') throw new Error(i18n.t('errors.meterUnavailable'))
      return resolveAnomaly(meterId, anomalyId)
    },
    onSuccess: () => {
      // Invalidate all anomaly queries so the list refreshes.
      void queryClient.invalidateQueries({ queryKey: ['anomalies'] })
      void queryClient.invalidateQueries({ queryKey: ['anomalies-pending'] })
    },
  })
}

export function usePendingAnomalies(desde?: string, hasta?: string) {
  const meter = useMedidorActivo()
  const meterId = meter.data
  const hasMeter = typeof meterId === 'number' && !isNaN(meterId)
  const query = useQuery({
    queryKey: ['anomalies-pending', meterId, desde, hasta],
    queryFn: () => getPendingAnomalies(meterId as number, desde, hasta),
    enabled: hasMeter,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
  const error = meter.error ?? (hasMeter ? query.error : null)
  return {
    data: query.data,
    error,
    isPending: meter.isPending || (hasMeter && query.isPending),
    hasNoMeter: meter.hasNoMeter,
  }
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
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 400 || error.response?.status === 403 || error.response?.status === 404)
      ) {
        return false
      }
      if (error instanceof Error && !axios.isAxiosError(error)) {
        return false
      }
      return failureCount < 2
    },
  })
}

// Re-export for callers that need the helper outside of components
export { getErrorMessage }

// ── Operator hooks ──────────────────────────────────────────────────────────

/** GET /api/usuarios — lista todos los usuarios (solo OPERADOR). */
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: listarUsuarios,
    staleTime: 60_000,
  })
}

/** POST /api/medidores — registra un nuevo medidor (solo OPERADOR). */
export function useRegisterMeter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: registrarMedidor,
    onSuccess: () => {
      // Invalidate users list and meters query in case meter association changes.
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({ queryKey: ['meters'] })
    },
  })
}

export interface ConsumptionByZoneParams {
  zona: string
  desde?: string
  hasta?: string
}

/** GET /api/medidores/consumo-por-zona — solo OPERADOR.
 *  La query se ejecuta solo cuando params !== null (el operador pulsó "Consultar"). */
export function useConsumptionByZone(params: ConsumptionByZoneParams | null) {
  const normalizedParams = params
    ? { ...params, zona: params.zona.trim() }
    : null

  return useQuery({
    queryKey: ['consumption-by-zone', normalizedParams],
    queryFn: () => getConsumptionByZone(normalizedParams!.zona, normalizedParams?.desde, normalizedParams?.hasta),
    enabled: normalizedParams !== null,
    staleTime: 0,
  })
}
