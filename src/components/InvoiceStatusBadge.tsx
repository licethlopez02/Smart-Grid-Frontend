import { useTranslation } from 'react-i18next'
import type { EstadoFactura } from '../api/dto'

const statusStyles: Record<EstadoFactura, string> = {
  PAGADA: 'bg-green-100 text-green-700',
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  VENCIDA: 'bg-red-100 text-red-700',
}

interface InvoiceStatusBadgeProps {
  status: EstadoFactura
}

function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const { t } = useTranslation()

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
        statusStyles[status] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {t(`invoiceStatus.${status}`)}
    </span>
  )
}

export default InvoiceStatusBadge
