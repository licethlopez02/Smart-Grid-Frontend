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

export type AlertStatus = 'pending' | 'resolved'
