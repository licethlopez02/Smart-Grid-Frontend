import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card from '../../components/Card'
import { currentPeriodConsumption, currentPeriodLabel, consumptionHistory } from '../../mocks/homeData'

const PERIOD_OPTIONS = ['day', 'week', 'month', 'year'] as const
type Period = (typeof PERIOD_OPTIONS)[number]

const ROWS_PER_PAGE = 4

function Consumption() {
  const { t } = useTranslation()
  const [activePeriod, setActivePeriod] = useState<Period>('month')
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_PAGE)

  const chartData = consumptionHistory.map((reading) => ({
    day: new Date(reading.date).getDate(),
    kwh: reading.kwh,
  }))

  const sortedForTable = [...consumptionHistory].reverse()
  const rowsToShow = sortedForTable.slice(0, visibleRows)
  const hasMore = visibleRows < sortedForTable.length

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.consumption')}</h1>
      <p className="text-gray-500 mt-1">{t('consumption.subtitle')}</p>

      {/* Filtros de período */}
      <Card className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-2">{t('consumption.periodLabel')}</p>
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {PERIOD_OPTIONS.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activePeriod === period
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(`consumption.periods.${period}`)}
            </button>
          ))}
        </div>
      </Card>

      {/* Consumo acumulado */}
      <Card className="mt-6">
        <h2 className="font-semibold text-gray-900">
          {t('consumption.accumulatedTitle', { period: currentPeriodLabel })}
        </h2>
        <p className="mt-4">
          <span className="text-4xl font-bold text-blue-600">{currentPeriodConsumption}</span>
          <span className="text-lg font-semibold text-blue-600 ml-1">kWh</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">{t('consumption.total')}</p>
      </Card>

      {/* Gráfica */}
      <Card className="mt-6">
        <h2 className="font-semibold text-gray-900">{t('consumption.chartTitle')}</h2>
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend formatter={() => t('consumption.legend')} />
              <Line type="monotone" dataKey="kwh" name={t('consumption.legend')} stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Detalle diario */}
      <Card className="mt-6">
        <h2 className="font-semibold text-gray-900">{t('consumption.detailTitle')}</h2>
        <table className="w-full mt-4 text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="font-normal pb-2">{t('consumption.table.date')}</th>
              <th className="font-normal pb-2">{t('consumption.table.kwh')}</th>
              <th className="font-normal pb-2">{t('consumption.table.type')}</th>
            </tr>
          </thead>
          <tbody>
            {rowsToShow.map((reading) => (
              <tr key={reading.date} className="border-t border-gray-100">
                <td className="py-3 text-gray-900">
                  {new Date(reading.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="py-3 text-gray-900">{reading.kwh.toFixed(1)}</td>
                <td className="py-3 text-gray-500">{t('consumption.table.typeValue')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {hasMore && (
          <button
            onClick={() => setVisibleRows((prev) => prev + ROWS_PER_PAGE)}
            className="text-blue-600 text-sm font-medium mt-4"
          >
            {t('consumption.showMore')}
          </button>
        )}
      </Card>
    </div>
  )
}

export default Consumption