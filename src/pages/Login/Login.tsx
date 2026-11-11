import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Zap } from 'lucide-react'
import { getErrorMessage } from '../../api/http'
import { useAuth } from '../../auth/useAuth'

function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, t('login.error')))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1834] flex items-center justify-center px-4">
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

        <h1 className="text-xl font-bold text-gray-900">{t('login.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('login.subtitle')}</p>

        <label className="block mt-6 text-sm font-medium text-gray-700" htmlFor="email">
          {t('login.email')}
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900"
        />

        <label className="block mt-4 text-sm font-medium text-gray-700" htmlFor="password">
          {t('login.password')}
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900"
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
          {isSubmitting ? t('login.submitting') : t('login.submit')}
        </button>
      </form>
    </div>
  )
}

export default Login
