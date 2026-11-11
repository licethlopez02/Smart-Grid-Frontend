import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '../api/http'

interface AsyncStateProps {
  isPending: boolean
  error: unknown
  children: ReactNode
}

function AsyncState({ isPending, error, children }: AsyncStateProps) {
  const { t } = useTranslation()

  if (isPending) return <p className="py-6 text-center text-sm text-gray-500">{t('common.loading')}</p>
  if (error) {
    return (
      <p role="alert" className="py-6 text-center text-sm text-red-600">
        {getErrorMessage(error, t('common.loadError'))}
      </p>
    )
  }
  return <>{children}</>
}

export default AsyncState
