import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import AsyncState from '../../components/AsyncState'
import Card from '../../components/Card'
import { useConsumptionTotal, useReadings } from '../../hooks/queries'
import { groupReadings, PERIODS, type Period } from '../../utils/consumption'
import { formatKwh } from '../../utils/format'

const ROWS_PER_PAGE = 4

function Consumption() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<Period>('month')
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_PAGE)

  const total = useConsumptionTotal(period)
  const readings = useReadings(period)

  const points = useMemo(() => groupReadings(readings.data ?? [], period), [readings.data, period])
  const tableRows = useMemo(() => [...points].reverse(), [points])

  const handlePeriodChange = (next: Period) => {
    setPeriod(next)
    setVisibleRows(ROWS_PER_PAGE)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.consumption')}</h1>
      <p className="text-gray-500 mt-1">{t('consumption.subtitle')}</p>

      <Card className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-2">{t('consumption.periodLabel')}</p>
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {PERIODS.map((option) => (
            <button
              key={option}
              onClick={() => handlePeriodChange(option)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === option ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(`consumption.periods.${option}`)}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <AsyncState isPending={total.isPending} error={total.error}>
          <h2 className="font-semibold text-gray-900">{t(`consumption.accumulatedTitle.${period}`)}</h2>
          <p className="mt-4">
            <span className="text-4xl font-bold text-blue-600">{formatKwh(total.data ?? 0)}</span>
            <span className="text-lg font-semibold text-blue-600 ml-1">{t('common.kwh')}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">{t('consumption.total')}</p>
        </AsyncState>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-gray-900">{t('consumption.chartTitle')}</h2>
        <AsyncState isPending={readings.isPending} error={readings.error}>
          {points.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">{t('consumption.empty')}</p>
          ) : (
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="kwh"
                    name={t('consumption.legend')}
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </AsyncState>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-gray-900">{t('consumption.detailTitle')}</h2>
        <AsyncState isPending={readings.isPending} error={readings.error}>
          {tableRows.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">{t('consumption.empty')}</p>
          ) : (
            <>
              <table className="w-full mt-4 text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="font-normal pb-2">{t('consumption.table.date')}</th>
                    <th className="font-normal pb-2">{t('consumption.table.kwh')}</th>
                    <th className="font-normal pb-2">{t('consumption.table.type')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.slice(0, visibleRows).map((point) => (
                    <tr key={point.key} className="border-t border-gray-100">
                      <td className="py-3 text-gray-900">{point.fullLabel}</td>
                      <td className="py-3 text-gray-900">{formatKwh(point.kwh)}</td>
                      <td className="py-3 text-gray-500">{t('consumption.table.typeValue')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleRows < tableRows.length && (
                <button
                  onClick={() => setVisibleRows((previous) => previous + ROWS_PER_PAGE)}
                  className="text-blue-600 text-sm font-medium mt-4"
                >
                  {t('consumption.showMore')}
                </button>
              )}
            </>
          )}
        </AsyncState>
      </Card>
    </div>
  )
}

export default Consumption
