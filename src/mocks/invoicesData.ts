import type { Invoice } from '../types'

export const invoices: Invoice[] = [
  {
    id: 'i1',
    period: 'Agosto 2026',
    status: 'pagada',
    dueDate: '30 Ago 2026',
    accumulatedConsumption: 184,
    tariffLabel: 'Residencial · $650/kWh',
  },
  {
    id: 'i2',
    period: 'Julio 2026',
    status: 'vencida',
    dueDate: '30 Jul 2026',
    accumulatedConsumption: 162,
    tariffLabel: 'Residencial · $650/kWh',
  },
  {
    id: 'i3',
    period: 'Junio 2026',
    status: 'pagada',
    dueDate: '30 Jun 2026',
    accumulatedConsumption: 171,
    tariffLabel: 'Residencial · $620/kWh',
  },
  {
    id: 'i4',
    period: 'Mayo 2026',
    status: 'pagada',
    dueDate: '30 May 2026',
    accumulatedConsumption: 158,
    tariffLabel: 'Residencial · $620/kWh',
  },
]