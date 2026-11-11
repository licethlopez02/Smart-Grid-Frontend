import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowRight, Info, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AsyncState from '../../components/AsyncState'
import Card from '../../components/Card'
import InvoiceStatusBadge from '../../components/InvoiceStatusBadge'
import { useAlerts, useConsumptionTotal, useInvoices, useReadings } from '../../hooks/queries'
import { groupReadings } from '../../utils/consumption'
import { formatDate, formatDateTime, formatKwh, formatPeriod } from '../../utils/format'

function Home() {
  const { t } = useTranslation()
  const total = useConsumptionTotal('month')
  const readings = useReadings('month')
  const alerts = useAlerts()
  const invoices = useInvoices()

  const chartData = useMemo(() => groupReadings(readings.data ?? [], 'month'), [readings.data])
  const latestAlert = alerts.data?.[0]
  const recentInvoices = invoices.data?.slice(0, 2) ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.home')}</h1>
      <p className="text-gray-500 mt-1">{t('home.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <AsyncState isPending={total.isPending} error={total.error}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-gray-900">{t('home.consumptionCard.title')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('home.consumptionCard.period')}</p>
                <p className="mt-4">
                  <span className="text-4xl font-bold text-blue-600">{formatKwh(total.data ?? 0)}</span>
                  <span className="text-lg font-semibold text-blue-600 ml-1">kWh</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">{t('home.consumptionCard.label')}</p>
              </div>
              <div className="bg-blue-50 rounded-full p-4">
                <Zap className="text-blue-600" size={24} />
              </div>
            </div>
          </AsyncState>
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900">{t('home.alertsCard.title')}</h2>
          <AsyncState isPending={alerts.isPending} error={alerts.error}>
            {latestAlert ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mt-4 flex gap-3">
                <AlertTriangle className="text-red-500 shrink-0" size={20} />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t('home.alertsCard.latestAnomaly')}</p>
                  <p className="text-sm text-gray-500">{latestAlert.razon}</p>
                  <p className="text-sm text-gray-500">{formatDateTime(latestAlert.timestamp)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-4">{t('home.alertsCard.empty')}</p>
            )}
          </AsyncState>
          <Link to="/alerts" className="text-blue-600 text-sm font-medium flex items-center gap-1 mt-4">
            {t('home.alertsCard.viewAll')} <ArrowRight size={14} />
          </Link>
        </Card>

        <Card>
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">{t('home.chartCard.title')}</h2>
            <span className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1">
              {t('home.chartCard.period')}
            </span>
          </div>
          <AsyncState isPending={readings.isPending} error={readings.error}>
            {chartData.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">{t('consumption.empty')}</p>
            ) : (
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="kwh" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">{t('home.chartCard.caption')}</p>
          </AsyncState>
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900">{t('home.invoicesCard.title')}</h2>
          <AsyncState isPending={invoices.isPending} error={invoices.error}>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-gray-500 mt-4">{t('home.invoicesCard.empty')}</p>
            ) : (
              <table className="w-full mt-4 text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="font-normal pb-2">{t('home.invoicesCard.period')}</th>
                    <th className="font-normal pb-2">{t('home.invoicesCard.status')}</th>
                    <th className="font-normal pb-2">{t('home.invoicesCard.dueDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-gray-100">
                      <td className="py-3 text-gray-900">{formatPeriod(invoice.periodoInicio, invoice.periodoFin)}</td>
                      <td className="py-3">
                        <InvoiceStatusBadge status={invoice.estado} />
                      </td>
                      <td className="py-3 text-gray-500">
                        {invoice.fechaVencimiento ? formatDate(invoice.fechaVencimiento) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </AsyncState>
          <Link to="/invoices" className="text-blue-600 text-sm font-medium flex items-center gap-1 mt-4">
            {t('home.invoicesCard.viewAll')} <ArrowRight size={14} />
          </Link>
        </Card>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 flex gap-3">
        <Info className="text-amber-500 shrink-0" size={20} />
        <div>
          <p className="font-medium text-gray-900 text-sm">{t('home.infoBanner.title')}</p>
          <p className="text-sm text-gray-600 mt-0.5">{t('home.infoBanner.text')}</p>
        </div>
      </div>
    </div>
  )
}

export default Home
