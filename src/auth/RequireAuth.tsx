import { Navigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Role } from '../types'
import { useAuth } from './useAuth'

// Without `role`: only requires a session. With `role`: also requires that role.
function RequireAuth({ role }: { role?: Role }) {
  const { t } = useTranslation()
  const { user, isLoading, hasRole } = useAuth()

  if (isLoading) return <p className="p-8 text-sm text-gray-500">{t('common.loading')}</p>
  if (!user) return <Navigate to="/login" replace />
  if (role && !hasRole(role)) return <p className="text-sm text-gray-500">{t('common.noAccess')}</p>
  return <Outlet />
}

export default RequireAuth
