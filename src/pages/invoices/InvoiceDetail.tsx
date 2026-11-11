import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import AsyncState from '../../components/AsyncState'
import Card from '../../components/Card'
import InvoiceStatusBadge from '../../components/InvoiceStatusBadge'
import { useInvoice } from '../../hooks/queries'
import { formatCurrency, formatDate, formatDateTime, formatKwh, formatPeriod } from '../../utils/format'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 bg-gray-50/50 font-medium text-sm">
        {value}
      </div>
    </div>
  )
}

function InvoiceDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const invoiceId = Number(id)
  const { data: invoice, isPending, error } = useInvoice(invoiceId)

  return (
    <div>
      <Link
        to="/invoices"
        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft size={16} /> {t('invoiceDetail.back')}
      </Link>

      <AsyncState isPending={isPending} error={error}>
        {invoice && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('nav.invoices')} #{invoice.id}
                </h1>
                <p className="text-gray-500 mt-1">
                  {formatPeriod(invoice.periodoInicio, invoice.periodoFin)}
                </p>
              </div>
              <InvoiceStatusBadge status={invoice.estado} />
            </div>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                {t('invoiceDetail.billingInfo')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label={t('invoiceDetail.periodLabel')}
                  value={`${formatDate(invoice.periodoInicio)} – ${formatDate(invoice.periodoFin)}`}
                />
                <Field
                  label={t('invoiceDetail.amountLabel')}
                  value={formatCurrency(invoice.montoTotal)}
                />
                <Field
                  label={t('invoiceDetail.consumptionLabel')}
                  value={`${formatKwh(invoice.consumoAcumuladoKwh)} kWh`}
                />
                <Field
                  label={t('invoiceDetail.tariffLabel')}
                  value={`${formatCurrency(invoice.tarifaValor)} / kWh`}
                />
                <Field
                  label={t('invoiceDetail.tariffValidityLabel')}
                  value={`${formatDate(invoice.tarifaVigenciaDesde)} – ${formatDate(invoice.tarifaVigenciaHasta)}`}
                />
                <Field
                  label={t('invoiceDetail.generationDateLabel')}
                  value={formatDate(invoice.fechaGeneracion)}
                />
                <Field
                  label={t('invoiceDetail.dueDateLabel')}
                  value={formatDate(invoice.fechaVencimiento)}
                />
                <Field
                  label={t('invoiceDetail.paymentDateLabel')}
                  value={invoice.fechaPago ? formatDate(invoice.fechaPago) : t('invoiceDetail.notPaid')}
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <AlertTriangle size={18} className="text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('invoiceDetail.anomaliesTitle')}
                </h2>
              </div>

              {invoice.anomaliasNoResueltas.length === 0 ? (
                <p className="text-sm text-gray-500 py-3">
                  {t('invoiceDetail.anomaliesEmpty')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="font-normal pb-2">{t('invoiceDetail.anomaliesTable.id')}</th>
                        <th className="font-normal pb-2">{t('invoiceDetail.anomaliesTable.timestamp')}</th>
                        <th className="font-normal pb-2">{t('invoiceDetail.anomaliesTable.value')}</th>
                        <th className="font-normal pb-2">{t('invoiceDetail.anomaliesTable.reason')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.anomaliasNoResueltas.map((anomalia) => (
                        <tr key={anomalia.anomaliaId} className="border-b border-gray-100 last:border-b-0">
                          <td className="py-2.5 text-gray-900 font-mono text-xs">#{anomalia.anomaliaId}</td>
                          <td className="py-2.5 text-gray-600">{formatDateTime(anomalia.momento)}</td>
                          <td className="py-2.5 text-gray-900 font-medium">{formatKwh(anomalia.valor)} kWh</td>
                          <td className="py-2.5 text-gray-600">{anomalia.razon}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </AsyncState>
    </div>
  )
}

export default InvoiceDetail
