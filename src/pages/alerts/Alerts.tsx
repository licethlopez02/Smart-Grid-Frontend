import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AlertStatusBadge from '../../components/AlertStatusBadge'
import AsyncState from '../../components/AsyncState'
import Card from '../../components/Card'
import { useAnomalies, useResolveAnomaly, getErrorMessage } from '../../hooks/queries'
import { formatDateTime } from '../../utils/format'

type Filter = 'all' | 'pending'

function Alerts() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<Filter>('all')
  const { data: anomalies = [], isPending, error } = useAnomalies()
  const resolveAnomaly = useResolveAnomaly()

  const filtered = filter === 'pending' ? anomalies.filter((a) => !a.resuelta) : anomalies
  const resolving = resolveAnomaly.isPending
  const resolveError = resolveAnomaly.error
    ? getErrorMessage(resolveAnomaly.error, t('alerts.resolveError'))
    : null

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.alerts')}</h1>
      <p className="text-gray-500 mt-1">{t('alerts.subtitle')}</p>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-gray-600 border-gray-300 hover:border-blue-400'
          }`}
        >
          {t('alerts.filterAll')}
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            filter === 'pending'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-gray-600 border-gray-300 hover:border-blue-400'
          }`}
        >
          {t('alerts.filterPending')}
        </button>
      </div>

      {resolveError && (
        <p className="mt-3 text-sm text-red-600">{resolveError}</p>
      )}

      <Card className="mt-4">
        <AsyncState isPending={isPending} error={error}>
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">
              {filter === 'pending' ? t('alerts.emptyPending') : t('alerts.empty')}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="font-normal pb-2">{t('alerts.table.value')}</th>
                  <th className="font-normal pb-2">{t('alerts.table.description')}</th>
                  <th className="font-normal pb-2">{t('alerts.table.detectedAt')}</th>
                  <th className="font-normal pb-2">{t('alerts.table.status')}</th>
                  <th className="font-normal pb-2">{t('alerts.table.action')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((anomaly) => (
                  <tr key={anomaly.id} className="border-t border-gray-100">
                    <td className="py-3 text-gray-900">{anomaly.valor} {t('common.kwh')}</td>
                    <td className="py-3 text-gray-700">{anomaly.razon}</td>
                    <td className="py-3 text-gray-500">{formatDateTime(anomaly.timestamp)}</td>
                    <td className="py-3">
                      <AlertStatusBadge resuelta={anomaly.resuelta} />
                    </td>
                    <td className="py-3">
                      {!anomaly.resuelta && (
                        <button
                          disabled={resolving}
                          onClick={() => resolveAnomaly.mutate(anomaly.id)}
                          className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resolving ? t('alerts.resolving') : t('alerts.resolve')}
                        </button>
                      )}
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
