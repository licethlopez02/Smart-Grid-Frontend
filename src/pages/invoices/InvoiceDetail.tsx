import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import AsyncState from '../../components/AsyncState'
import Card from '../../components/Card'
import InvoiceStatusBadge from '../../components/InvoiceStatusBadge'
import { useInvoice } from '../../hooks/queries'
import { formatCurrency, formatKwh, formatPeriod } from '../../utils/format'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      <div className="border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900">{value}</div>
    </div>
  )
}

function InvoiceDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { data: invoice, isPending, error } = useInvoice(Number(id))

  return (
    <div>
      <Link to="/invoices" className="text-blue-600 text-sm font-medium flex items-center gap-1 mb-4">
        <ArrowLeft size={14} /> {t('invoiceDetail.back')}
      </Link>

      <AsyncState isPending={isPending} error={error}>
        {invoice && (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('nav.invoices')}</h1>
                <p className="text-gray-500 mt-1">{t('invoiceDetail.subtitle')}</p>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>

            <Card className="mt-6 max-w-xl">
              <Field label={t('invoiceDetail.periodLabel')} value={formatPeriod(invoice.periodStart, invoice.periodEnd)} />
              <Field
                label={t('invoiceDetail.consumptionLabel')}
                value={invoice.accumulatedKwh === null ? '—' : `${formatKwh(invoice.accumulatedKwh)} kWh`}
              />
              <Field
                label={t('invoiceDetail.tariffLabel')}
                value={invoice.appliedTariff === null ? '—' : `${formatCurrency(invoice.appliedTariff)} / kWh`}
              />
            </Card>
          </>
        )}
      </AsyncState>
    </div>
  )
}

export default InvoiceDetail
