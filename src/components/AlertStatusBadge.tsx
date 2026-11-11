import { useTranslation } from 'react-i18next'
import type { AlertStatus } from '../types'

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
}

interface AlertStatusBadgeProps {
  resuelta?: boolean
  status?: AlertStatus | null
}

function AlertStatusBadge({ resuelta, status }: AlertStatusBadgeProps) {
  const { t } = useTranslation()
  const isResolved = resuelta !== undefined ? resuelta : status === 'resolved'
  const key = isResolved ? 'resolved' : 'pending'
  const style = isResolved ? statusStyles.resolved : statusStyles.pending

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {t(`alerts.status.${key}`)}
    </span>
  )
}

export default AlertStatusBadge
