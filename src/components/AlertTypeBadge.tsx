import { useTranslation } from 'react-i18next'
import { AlertTriangle, Zap } from 'lucide-react'
import type { AlertType } from '../types'

const config: Record<AlertType, { color: string; icon: typeof AlertTriangle }> = {
  anomalia_consumo: { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  sensor_defectuoso: { color: 'bg-orange-100 text-orange-700', icon: Zap },
}

function AlertTypeBadge({ type }: { type: AlertType }) {
  const { t } = useTranslation()
  const { color, icon: Icon } = config[type]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} />
      {t(`alerts.type.${type}`)}
    </span>
  )
}

export default AlertTypeBadge