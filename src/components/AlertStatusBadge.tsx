import { useTranslation } from 'react-i18next'
import type { AlertStatus } from '../types'

const statusStyles: Record<AlertStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
}

// The backend does not send the alert status yet: show a dash instead of inventing one.
function AlertStatusBadge({ status }: { status: AlertStatus | null }) {
  const { t } = useTranslation()
  if (!status) return <span className="text-gray-400">—</span>
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {t(`alerts.status.${status}`)}
    </span>
  )
}

export default AlertStatusBadge
