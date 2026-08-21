import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowRight, Info, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '../../components/Card'
import InvoiceStatusBadge from '../../components/InvoiceStatusBadge'
import { currentPeriodConsumption, consumptionHistory, recentAnomaly, recentInvoices } from '../../mocks/homeData'

function Home() {
  const { t } = useTranslation()

  const chartData = consumptionHistory.map((reading) => ({
    day: new Date(reading.date).getDate(),
    kwh: reading.kwh,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.home')}</h1>
      <p className="text-gray-500 mt-1">{t('home.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Consumo acumulado */}
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-gray-900">{t('home.consumptionCard.title')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('home.consumptionCard.period')}</p>
              <p className="mt-4">
                <span className="text-4xl font-bold text-blue-600">{currentPeriodConsumption}</span>
                <span className="text-lg font-semibold text-blue-600 ml-1">kWh</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{t('home.consumptionCard.label')}</p>
            </div>
            <div className="bg-blue-50 rounded-full p-4">
              <Zap className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        {/* Alertas */}
        <Card>
          <h2 className="font-semibold text-gray-900">{t('home.alertsCard.title')}</h2>
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mt-4 flex gap-3">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <div>
              <p className="font-medium text-gray-900 text-sm">{recentAnomaly.description}</p>
              <p className="text-sm text-gray-500">
                {t('nav.consumption')} — {recentAnomaly.meterId}
              </p>
              <p className="text-sm text-gray-500">{recentAnomaly.detectedAt}</p>
            </div>
          </div>
          <a href="/alerts" className="text-blue-600 text-sm font-medium flex items-center gap-1 mt-4">
            {t('home.alertsCard.viewAll')} <ArrowRight size={14} />
          </a>
        </Card>

        {/* Gráfica de historial */}
        <Card>
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">{t('home.chartCard.title')}</h2>
            <span className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1">
              {t('home.chartCard.period')}
            </span>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="kwh" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 mt-2">{t('home.chartCard.caption')}</p>
        </Card>

        {/* Facturas */}
        <Card>
          <h2 className="font-semibold text-gray-900">{t('home.invoicesCard.title')}</h2>
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
                  <td className="py-3 text-gray-900">{invoice.period}</td>
                  <td className="py-3">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="py-3 text-gray-500">{invoice.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a href="/invoices" className="text-blue-600 text-sm font-medium flex items-center gap-1 mt-4">
            {t('home.invoicesCard.viewAll')} <ArrowRight size={14} />
          </a>
        </Card>
      </div>

      {/* Banner informativo */}
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