import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Zap } from 'lucide-react'
import { registro } from '../../api/auth.api'
import { getErrorMessage } from '../../api/http'
import { useAuth } from '../../auth/useAuth'

const MIN_PASSWORD = 8

function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token, login } = useAuth()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (token) return <Navigate to="/" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (contrasena.length < MIN_PASSWORD) {
      setError(t('register.passwordTooShort', { min: MIN_PASSWORD }))
      return
    }
    if (contrasena !== confirmacion) {
      setError(t('register.passwordMismatch'))
      return
    }

    setIsSubmitting(true)
    try {
      await registro({ nombre: nombre.trim(), correo: correo.trim(), contrasena })
      await login(correo.trim(), contrasena)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, t('register.error')))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = 'mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900'

  return (
    <div className="min-h-screen bg-[#0b1834] flex items-center justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500 rounded-lg p-2">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold leading-tight text-gray-900">{t('common.appName')}</p>
            <p className="text-xs text-gray-500 leading-tight">{t('common.appTagline')}</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900">{t('register.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('register.subtitle')}</p>

        <label className="block mt-6 text-sm font-medium text-gray-700" htmlFor="nombre">
          {t('register.name')}
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          autoComplete="name"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          className={inputClass}
        />

        <label className="block mt-4 text-sm font-medium text-gray-700" htmlFor="correo">
          {t('login.email')}
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          required
          autoComplete="username"
          value={correo}
          onChange={(event) => setCorreo(event.target.value)}
          className={inputClass}
        />

        <label className="block mt-4 text-sm font-medium text-gray-700" htmlFor="contrasena">
          {t('login.password')}
        </label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          required
          minLength={MIN_PASSWORD}
          autoComplete="new-password"
          value={contrasena}
          onChange={(event) => setContrasena(event.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-500">{t('register.passwordHint', { min: MIN_PASSWORD })}</p>

        <label className="block mt-4 text-sm font-medium text-gray-700" htmlFor="confirmacion">
          {t('register.confirmPassword')}
        </label>
        <input
          id="confirmacion"
          name="confirmacion"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition-colors"
        >
          {isSubmitting ? t('register.submitting') : t('register.submit')}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            {t('register.goToLogin')}
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register