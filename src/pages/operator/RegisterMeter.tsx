import { useTranslation } from 'react-i18next'

function RegisterMeter() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('operator.registerMeter.title')}</h1>
      <p className="text-gray-500">{t('common.comingSoon')}</p>
    </div>
  )
}

export default RegisterMeter
