import { useTranslation } from 'react-i18next'
import type { InvoiceStatus } from '../types'

const statusStyles: Record<InvoiceStatus, string> = {
  pagada: 'bg-green-100 text-green-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
  vencida: 'bg-red-100 text-red-700',
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {t(`invoiceStatus.${status}`)}
    </span>
  )
}

export default InvoiceStatusBadge