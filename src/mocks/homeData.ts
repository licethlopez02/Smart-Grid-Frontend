import type { ConsumptionReading, Alert } from '../types'
import { invoices } from './invoicesData'

export const currentPeriodConsumption = 184
export const currentPeriodLabel = 'Agosto 2026'

export const consumptionHistory: ConsumptionReading[] = [
  { date: '2026-08-01', kwh: 3.1 }, { date: '2026-08-02', kwh: 3.6 },
  { date: '2026-08-03', kwh: 4.2 }, { date: '2026-08-04', kwh: 5.8 },
  { date: '2026-08-05', kwh: 4.5 }, { date: '2026-08-06', kwh: 3.2 },
  { date: '2026-08-07', kwh: 3.8 }, { date: '2026-08-08', kwh: 6.9 },
  { date: '2026-08-09', kwh: 6.1 }, { date: '2026-08-10', kwh: 5.9 },
  { date: '2026-08-11', kwh: 5.4 }, { date: '2026-08-12', kwh: 7.9 },
  { date: '2026-08-13', kwh: 8.4 }, { date: '2026-08-14', kwh: 7.0 },
  { date: '2026-08-15', kwh: 6.3 }, { date: '2026-08-16', kwh: 5.9 },
  { date: '2026-08-17', kwh: 6.5 }, { date: '2026-08-18', kwh: 7.1 },
  { date: '2026-08-19', kwh: 7.5 }, { date: '2026-08-20', kwh: 8.1 },
  { date: '2026-08-21', kwh: 6.8 }, { date: '2026-08-22', kwh: 6.1 },
  { date: '2026-08-23', kwh: 5.2 }, { date: '2026-08-24', kwh: 6.0 },
  { date: '2026-08-25', kwh: 6.6 }, { date: '2026-08-26', kwh: 7.3 },
  { date: '2026-08-27', kwh: 5.0 }, { date: '2026-08-28', kwh: 6.3 },
  { date: '2026-08-29', kwh: 9.1 }, { date: '2026-08-30', kwh: 7.2 },
  { date: '2026-08-31', kwh: 5.6 },
]

export const alerts: Alert[] = [
  {
    id: 'a1',
    meterId: 'M-001',
    type: 'anomalia_consumo',
    description: 'Consumo inusual detectado',
    detectedAt: 'Hoy 14:32',
    status: 'pendiente',
  },
  {
    id: 'a2',
    meterId: 'M-001',
    type: 'sensor_defectuoso',
    description: 'Lectura negativa descartada',
    detectedAt: 'Ayer 09:10',
    status: 'resuelta',
  },
  {
    id: 'a3',
    meterId: 'M-001',
    type: 'anomalia_consumo',
    description: 'Pico de consumo sobre el histórico',
    detectedAt: '15 Ago 2026 20:45',
    status: 'resuelta',
  },
]

export const recentAnomaly = alerts[0]

export const recentInvoices = invoices.slice(0, 2)