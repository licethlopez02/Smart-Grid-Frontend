import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import Card from '../../components/Card'
import InvoiceStatusBadge from '../../components/InvoiceStatusBadge'
import { invoices } from '../../mocks/invoicesData'

function Invoices() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.invoices')}</h1>
      <p className="text-gray-500 mt-1">{t('invoices.subtitle')}</p>

      <Card className="mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="font-normal pb-2">{t('invoices.table.period')}</th>
              <th className="font-normal pb-2">{t('invoices.table.status')}</th>
              <th className="font-normal pb-2">{t('invoices.table.dueDate')}</th>
              <th className="font-normal pb-2">{t('invoices.table.action')}</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t border-gray-100">
                <td className="py-3 text-gray-900">{invoice.period}</td>
                <td className="py-3">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="py-3 text-gray-500">{invoice.dueDate}</td>
                <td className="py-3">
                  <Link
                    to={`/invoices/${invoice.id}`}
                    className="text-blue-600 font-medium flex items-center gap-1"
                  >
                    {t('invoices.viewDetail')} <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export default Invoices