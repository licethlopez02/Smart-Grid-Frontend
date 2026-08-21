import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import Card from '../../components/Card'
import InvoiceStatusBadge from '../../components/InvoiceStatusBadge'
import { invoices } from '../../mocks/invoicesData'

function InvoiceDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const invoice = invoices.find((inv) => inv.id === id)

  if (!invoice) {
    return <p className="text-gray-500">{t('invoiceDetail.notFound')}</p>
  }

  return (
    <div>
      <Link to="/invoices" className="text-blue-600 text-sm font-medium flex items-center gap-1 mb-4">
        <ArrowLeft size={14} /> {t('invoiceDetail.back')}
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.invoices')}</h1>
          <p className="text-gray-500 mt-1">{t('invoiceDetail.subtitle')}</p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <Card className="mt-6 max-w-xl">
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-1">{t('invoiceDetail.periodLabel')}</p>
          <div className="border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900">{invoice.period}</div>
        </div>
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-1">{t('invoiceDetail.consumptionLabel')}</p>
          <div className="border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900">
            {invoice.accumulatedConsumption} kWh
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">{t('invoiceDetail.tariffLabel')}</p>
          <div className="border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900">{invoice.tariffLabel}</div>
        </div>
      </Card>
    </div>
  )
}

export default InvoiceDetail