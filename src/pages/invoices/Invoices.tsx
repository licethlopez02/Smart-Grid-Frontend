import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import AsyncState from '../../components/AsyncState'
import Card from '../../components/Card'
import InvoiceStatusBadge from '../../components/InvoiceStatusBadge'
import { useInvoices } from '../../hooks/queries'
import { formatCurrency, formatDate, formatPeriod } from '../../utils/format'

function Invoices() {
  const { t } = useTranslation()
  const { data: invoices = [], isPending, error } = useInvoices()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.invoices')}</h1>
      <p className="text-gray-500 mt-1">{t('invoices.subtitle')}</p>

      <Card className="mt-6">
        <AsyncState isPending={isPending} error={error}>
          {invoices.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">{t('invoices.empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="font-normal pb-3">{t('invoices.table.period')}</th>
                    <th className="font-normal pb-3">{t('invoices.table.total')}</th>
                    <th className="font-normal pb-3">{t('invoices.table.status')}</th>
                    <th className="font-normal pb-3">{t('invoices.table.dueDate')}</th>
                    <th className="font-normal pb-3 text-right">{t('invoices.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-3.5 text-gray-900 font-medium">
                        {formatPeriod(invoice.periodoInicio, invoice.periodoFin)}
                      </td>
                      <td className="py-3.5 text-gray-900 font-semibold">
                        {formatCurrency(invoice.montoTotal)}
                      </td>
                      <td className="py-3.5">
                        <InvoiceStatusBadge status={invoice.estado} />
                      </td>
                      <td className="py-3.5 text-gray-500">
                        {invoice.fechaVencimiento ? formatDate(invoice.fechaVencimiento) : t('common.emptyValue')}
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                        >
                          {t('invoices.viewDetail')} <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncState>
      </Card>
    </div>
  )
}

export default Invoices
