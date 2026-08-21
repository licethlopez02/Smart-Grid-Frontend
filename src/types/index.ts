export interface ConsumptionReading {
  date: string
  kwh: number
}

export type AlertType = 'anomalia_consumo' | 'sensor_defectuoso'
export type AlertStatus = 'pendiente' | 'resuelta'

export interface Alert {
  id: string
  meterId: string
  type: AlertType
  description: string
  detectedAt: string
  status: AlertStatus
}

export type InvoiceStatus = 'pagada' | 'pendiente' | 'vencida'

export interface Invoice {
  id: string
  period: string
  status: InvoiceStatus
  dueDate: string
  accumulatedConsumption: number
  tariffLabel: string
}