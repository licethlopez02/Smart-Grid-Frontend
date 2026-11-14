import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import AsyncState from '../../components/AsyncState'
import Card from '../../components/Card'
import { getErrorMessage } from '../../api/http'
import { useConsumptionByZone, type ConsumptionByZoneParams } from '../../hooks/queries'
import { TIMEZONE, toApiInstant } from '../../utils/consumption'
import { formatDate, formatKwh } from '../../utils/format'

// ── date helpers ──────────────────────────────────────────────────────────────

/** Returns 'YYYY-MM' for the current month in America/Bogota. */
function currentMonthValue(): string {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  })
  // en-CA gives YYYY-MM-DD; we only need YYYY-MM
  return fmt.format(now).slice(0, 7)
}

/** Converts a 'YYYY-MM-DD' date string to an ISO instant at start-of-day (00:00:00) in Bogota. */
function toStartOfDay(dateStr: string): string {
  return toApiInstant(new Date(`${dateStr}T00:00:00-05:00`))
}

/** Converts a 'YYYY-MM-DD' date string to an ISO instant at end-of-day (23:59:59) in Bogota. */
function toEndOfDay(dateStr: string): string {
  return toApiInstant(new Date(`${dateStr}T23:59:59-05:00`))
}

/** Returns the first and last day of a 'YYYY-MM' month as 'YYYY-MM-DD'. */
function monthBounds(ym: string): { first: string; last: string } {
  const [year, month] = ym.split('-').map(Number)
  const first = `${ym}-01`
  const lastDate = new Date(year, month, 0) // last day of month
  const last = `${year}-${String(month).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`
  return { first, last }
}

/** Converts a 'YYYY-MM' month selector value to 'YYYY-MM-DD' first day. */
function monthToFirstDay(ym: string): string {
  return monthBounds(ym).first
}

/** Converts a 'YYYY-MM' month selector value to 'YYYY-MM-DD' last day. */
function monthToLastDay(ym: string): string {
  return monthBounds(ym).last
}

// ── main component ────────────────────────────────────────────────────────────

function ConsumptionByZone() {
  const { t } = useTranslation()

  const currentMonth = currentMonthValue()

  // form fields
  const [zone, setZone] = useState('')
  const [fromMonth, setFromMonth] = useState(currentMonth)
  const [toMonth, setToMonth] = useState(currentMonth)

  // committed params (null = not yet queried)
  const [queryParams, setQueryParams] = useState<ConsumptionByZoneParams | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)

  const result = useConsumptionByZone(queryParams)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setClientError(null)

    const trimmedZone = zone.trim()
    if (!trimmedZone) {
      setClientError(t('operator.consumptionByZone.validationZone'))
      return
    }

    // Convert month pickers → ISO instants
    const desdeDate = monthToFirstDay(fromMonth)
    const hastaDate = monthToLastDay(toMonth)

    if (desdeDate > hastaDate) {
      setClientError(t('operator.consumptionByZone.validationDateRange'))
      return
    }

    setQueryParams({
      zona: trimmedZone,
      desde: toStartOfDay(desdeDate),
      hasta: toEndOfDay(hastaDate),
    })
  }

  const inputClass =
    'mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {t('operator.consumptionByZone.title')}
        </h1>
        <p className="text-sm text-gray-500">{t('operator.consumptionByZone.subtitle')}</p>
      </div>

      {/* Query form */}
      <Card>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Zone */}
          <div>
            <label htmlFor="zone" className="block text-sm font-medium text-gray-700">
              {t('operator.consumptionByZone.zoneLabel')}
            </label>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('operator.consumptionByZone.zoneHelp')}
            </p>
            <input
              id="zone"
              type="text"
              required
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Date range — month pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fromMonth" className="block text-sm font-medium text-gray-700">
                {t('operator.consumptionByZone.fromLabel')}
              </label>
              <input
                id="fromMonth"
                type="month"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="toMonth" className="block text-sm font-medium text-gray-700">
                {t('operator.consumptionByZone.toLabel')}
              </label>
              <input
                id="toMonth"
                type="month"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {clientError && (
            <p role="alert" className="text-sm text-red-600">
              {clientError}
            </p>
          )}

          <button
            type="submit"
            disabled={result.isFetching}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
          >
            {result.isFetching
              ? t('operator.consumptionByZone.submitting')
              : t('operator.consumptionByZone.submit')}
          </button>
        </form>
      </Card>

      {/* Results */}
      {queryParams !== null && (
        <AsyncState isPending={result.isPending} error={result.error}>
          {result.data && (
            <>
              {result.data.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">
                  {t('operator.consumptionByZone.empty')}
                </p>
              ) : (
                <div className="space-y-3">
                  {result.data.map((item) => {
                    const rangeLabel = queryParams.desde && queryParams.hasta
                      ? `${formatDate(queryParams.desde)} – ${formatDate(queryParams.hasta)}`
                      : t('operator.consumptionByZone.resultRangeAll')

                    return (
                      <Card key={item.zona}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                              {t('operator.consumptionByZone.resultZone')}
                            </p>
                            <p className="text-lg font-semibold text-gray-900">{item.zona}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {t('operator.consumptionByZone.resultRange')}: {rangeLabel}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                              {t('operator.consumptionByZone.resultConsumption')}
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              {formatKwh(item.consumoAcumulado)}{' '}
                              <span className="text-sm font-medium text-gray-500">
                                {t('common.kwh')}
                              </span>
                            </p>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}

              {result.error && (
                <p role="alert" className="text-sm text-red-600 mt-2">
                  {getErrorMessage(result.error)}
                </p>
              )}
            </>
          )}
        </AsyncState>
      )}
    </div>
  )
}

export default ConsumptionByZone
