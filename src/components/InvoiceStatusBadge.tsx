import { useTranslation } from 'react-i18next'
import type { EstadoFactura } from '../api/dto'

const statusStyles: Record<EstadoFactura, string> = {
  PAGADA: 'bg-green-100 text-green-700',
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  VENCIDA: 'bg-red-100 text-red-700',
}

const statusLabels: Record<EstadoFactura, string> = {
  PAGADA: 'Pagada',
  PENDIENTE: 'Pendiente',
  VENCIDA: 'Vencida',
}

export type SupportedInvoiceStatus = EstadoFactura | 'paid' | 'pending' | 'overdue'

function normalizeStatus(status: SupportedInvoiceStatus): EstadoFactura {
  if (status === 'paid') return 'PAGADA'
  if (status === 'pending') return 'PENDIENTE'
  if (status === 'overdue') return 'VENCIDA'
  return status
}

interface InvoiceStatusBadgeProps {
  status: SupportedInvoiceStatus
}

function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const { t } = useTranslation()
  const normalized = normalizeStatus(status)
  const label = t(`invoiceStatus.${normalized}`, { defaultValue: statusLabels[normalized] ?? normalized })

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
        statusStyles[normalized] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {label}
    </span>
  )
}

export default InvoiceStatusBadge
