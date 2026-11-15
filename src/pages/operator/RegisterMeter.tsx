import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'lucide-react'
import AsyncState from '../../components/AsyncState'
import Card from '../../components/Card'
import { getErrorMessage } from '../../api/http'
import type { MedidorResponse, UsuarioResponse } from '../../api/dto'
import { useRegisterMeter, useUsers } from '../../hooks/queries'

// ── helpers ──────────────────────────────────────────────────────────────────

function eligibleUsers(users: UsuarioResponse[]): UsuarioResponse[] {
  return users.filter((u) => u.activo && u.roles.includes('USUARIO'))
}

// ── label component ───────────────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  label,
  hint,
}: {
  htmlFor: string
  label: string
  hint?: string
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

// ── success panel ─────────────────────────────────────────────────────────────

function SuccessPanel({
  meter,
  userName,
  onReset,
}: {
  meter: MedidorResponse
  userName: string | null
  onReset: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="rounded-lg bg-green-50 border border-green-200 p-5 space-y-3">
      <div className="flex items-center gap-2 text-green-700 font-semibold">
        <CheckCircle size={18} />
        <span>{t('operator.registerMeter.successTitle')}</span>
      </div>
      <dl className="text-sm text-gray-700 space-y-1">
        <div className="flex gap-2">
          <dt className="font-medium">{t('operator.registerMeter.successId')}:</dt>
          <dd>{meter.id}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">{t('operator.registerMeter.successLocation')}:</dt>
          <dd>{meter.ubicacion}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">{t('operator.registerMeter.successProperty')}:</dt>
          <dd>{meter.propiedad}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">{t('operator.registerMeter.successUser')}:</dt>
          <dd>{userName ?? t('operator.registerMeter.successNoUser')}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
      >
        {t('operator.registerMeter.registerAnother')}
      </button>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

function RegisterMeter() {
  const { t } = useTranslation()

  // form state
  const [meterId, setMeterId] = useState('')
  const [location, setLocation] = useState('')
  const [property, setProperty] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  // ui state
  const [clientError, setClientError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ meter: MedidorResponse; userName: string | null } | null>(null)

  const usersQuery = useUsers()
  const mutation = useRegisterMeter()

  const users = usersQuery.data ? eligibleUsers(usersQuery.data) : []

  const resetForm = () => {
    setMeterId('')
    setLocation('')
    setProperty('')
    setSelectedUserId('')
    setClientError(null)
    setServerError(null)
    setSuccessData(null)
    mutation.reset()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setClientError(null)
    setServerError(null)

    // client-side validation
    const idNum = parseInt(meterId, 10)
    if (!meterId || !Number.isInteger(idNum) || idNum < 1) {
      setClientError(t('operator.registerMeter.validationId'))
      return
    }
    const trimmedLocation = location.trim()
    if (!trimmedLocation) {
      setClientError(t('operator.registerMeter.validationLocation'))
      return
    }

    const userId = selectedUserId ? parseInt(selectedUserId, 10) : undefined
    const resolvedUserName = selectedUserId
      ? (users.find((u) => u.id === userId)?.nombre ?? null)
      : null

    try {
      const result = await mutation.mutateAsync({
        id: idNum,
        ubicacion: trimmedLocation,
        ...(property.trim() ? { propiedad: property.trim() } : {}),
        ...(userId !== undefined ? { usuarioId: userId } : {}),
      })
      setSuccessData({ meter: result, userName: resolvedUserName })
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  const inputClass =
    'mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('operator.registerMeter.title')}</h1>
      <p className="text-sm text-gray-500 mb-6">{t('operator.registerMeter.subtitle')}</p>

      <Card>
        {successData ? (
          <SuccessPanel
            meter={successData.meter}
            userName={successData.userName}
            onReset={resetForm}
          />
        ) : (
          <form onSubmit={(e) => { void handleSubmit(e) }} noValidate className="space-y-5">
            {/* Meter ID */}
            <div>
              <FieldLabel
                htmlFor="meterId"
                label={t('operator.registerMeter.idLabel')}
                hint={t('operator.registerMeter.idHelp')}
              />
              <input
                id="meterId"
                type="number"
                min={1}
                step={1}
                required
                value={meterId}
                onChange={(e) => setMeterId(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Location */}
            <div>
              <FieldLabel
                htmlFor="location"
                label={t('operator.registerMeter.locationLabel')}
                hint={t('operator.registerMeter.locationHelp')}
              />
              <input
                id="location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Property */}
            <div>
              <FieldLabel
                htmlFor="property"
                label={t('operator.registerMeter.propertyLabel')}
                hint={t('operator.registerMeter.propertyHelp')}
              />
              <input
                id="property"
                type="text"
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* User selector */}
            <div>
              <FieldLabel
                htmlFor="userId"
                label={t('operator.registerMeter.userLabel')}
              />
              <AsyncState isPending={usersQuery.isPending} error={usersQuery.error}>
                <select
                  id="userId"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t('operator.registerMeter.userPlaceholder')}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} — {u.correo}
                    </option>
                  ))}
                </select>
              </AsyncState>
            </div>

            {/* Errors */}
            {(clientError ?? serverError) && (
              <p role="alert" className="text-sm text-red-600">
                {clientError ?? serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
            >
              {mutation.isPending
                ? t('operator.registerMeter.submitting')
                : t('operator.registerMeter.submit')}
            </button>
          </form>
        )}
      </Card>
    </div>
  )
}

export default RegisterMeter
