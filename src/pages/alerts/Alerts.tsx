import { useTranslation } from 'react-i18next'
import Card from '../../components/Card'
import AlertTypeBadge from '../../components/AlertTypeBadge'
import { alerts } from '../../mocks/homeData'

function Alerts() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.alerts')}</h1>
      <p className="text-gray-500 mt-1">{t('alerts.subtitle')}</p>

      <Card className="mt-6">
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
                  <td className="py-3 text-gray-500">{alert.meterId}</td>
                  <td className="py-3 text-gray-500">{alert.detectedAt}</td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        alert.status === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {t(`alerts.status.${alert.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

export default Alerts