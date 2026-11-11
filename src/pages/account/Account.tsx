import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { cambiarContrasena } from '../../api/auth.api'
import { getErrorMessage } from '../../api/http'
import Card from '../../components/Card'
import { useAuth } from '../../auth/useAuth'

const MIN_PASSWORD = 8

function Account() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    if (nueva.length < MIN_PASSWORD) {
      setError(t('account.passwordTooShort', { min: MIN_PASSWORD }))
      return
    }
    if (nueva !== confirmacion) {
      setError(t('account.passwordMismatch'))
      return
    }
    if (nueva === actual) {
      setError(t('account.samePassword'))
      return
    }

    setIsSubmitting(true)
    try {
      await cambiarContrasena(actual, nueva)
      setSuccess(true)
      setActual('')
      setNueva('')
      setConfirmacion('')
    } catch (err) {
      setError(getErrorMessage(err, t('account.error')))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = 'mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900'

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900">{t('account.title')}</h1>
      <p className="text-gray-500 mt-1">{user?.name}</p>

      <Card>
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            {t('account.changePassword')}
          </h2>

          <label className="block text-sm font-medium text-gray-700" htmlFor="actual">
            {t('account.currentPassword')}
          </label>
          <input
            id="actual"
            type="password"
            required
            autoComplete="current-password"
            value={actual}
            onChange={(event) => setActual(event.target.value)}
            className={inputClass}
          />

          <label className="block mt-4 text-sm font-medium text-gray-700" htmlFor="nueva">
            {t('account.newPassword')}
          </label>
          <input
            id="nueva"
            type="password"
            required
            minLength={MIN_PASSWORD}
            autoComplete="new-password"
            value={nueva}
            onChange={(event) => setNueva(event.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">{t('account.passwordHint', { min: MIN_PASSWORD })}</p>

          <label className="block mt-4 text-sm font-medium text-gray-700" htmlFor="confirmacion">
            {t('account.confirmPassword')}
          </label>
          <input
            id="confirmacion"
            type="password"
            required
            autoComplete="new-password"
            value={confirmacion}
            onChange={(event) => setConfirmacion(event.target.value)}
            className={inputClass}
          />

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="mt-4 text-sm text-green-700">
              {t('account.success')}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg px-5 py-2.5 transition-colors"
          >
            {isSubmitting ? t('account.submitting') : t('account.submit')}
          </button>
        </form>
      </Card>
    </div>
  )
}

export default Account