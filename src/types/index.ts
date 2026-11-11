export type Role = 'USUARIO' | 'OPERADOR'

export interface AuthUser {
  id: number
  name: string
  email: string
  roles: Role[]
  active: boolean
}

export interface Reading {
  timestamp: string // ISO instant
  kwh: number
}

export interface ConsumptionPoint {
  key: string // sortable bucket id
  label: string // short label for the chart axis
  fullLabel: string // readable label for the table
  kwh: number
}

export type AlertType = 'consumption_anomaly' | 'faulty_sensor'
export type AlertStatus = 'pending' | 'resolved'

export interface Alert {
  id: string
  meterId: number
  type: AlertType
  description: string
  detectedAt: string // ISO instant
  status: AlertStatus | null // null while the backend does not send it
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue'

export interface Invoice {
  id: number
  meterId: number
  periodStart: string // YYYY-MM-DD
  periodEnd: string // YYYY-MM-DD
  totalAmount: number
  status: InvoiceStatus
  accumulatedKwh: number | null // null while the backend does not send it
  appliedTariff: number | null // value per kWh; null while the backend does not send it
  dueDate: string | null // null while the backend does not send it
}
