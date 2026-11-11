import { useTranslation } from 'react-i18next'
import AlertStatusBadge from '../../components/AlertStatusBadge'
import AlertTypeBadge from '../../components/AlertTypeBadge'
import AsyncState from '../../components/AsyncState'
import Card from '../../components/Card'
import { useAlerts } from '../../hooks/queries'
import { formatDateTime, formatMeterId } from '../../utils/format'

function Alerts() {
  const { t } = useTranslation()
  const { data: alerts = [], isPending, error } = useAlerts()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.alerts')}</h1>
      <p className="text-gray-500 mt-1">{t('alerts.subtitle')}</p>

      <Card className="mt-6">
        <AsyncState isPending={isPending} error={error}>
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">{t('alerts.empty')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="font-normal pb-2">{t('alerts.table.type')}</th>
                  <th className="font-normal pb-2">{t('alerts.table.description')}</th>
                  <th className="font-normal pb-2">{t('alerts.table.meter')}</th>
                  <th className="font-normal pb-2">{t('alerts.table.detectedAt')}</th>
                  <th className="font-normal pb-2">{t('alerts.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} className="border-t border-gray-100">
                    <td className="py-3">
                      <AlertTypeBadge type={alert.type} />
                    </td>
                    <td className="py-3 text-gray-900">{alert.description}</td>
                    <td className="py-3 text-gray-500">{formatMeterId(alert.meterId)}</td>
                    <td className="py-3 text-gray-500">{formatDateTime(alert.detectedAt)}</td>
                    <td className="py-3">
                      <AlertStatusBadge status={alert.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AsyncState>
      </Card>
    </div>
  )
}

export default Alerts
