import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, BarChart2, Bell, FileText, Zap, User, LogOut } from 'lucide-react'

const navItems = [
  { to: '/', labelKey: 'nav.home', icon: Home },
  { to: '/consumption', labelKey: 'nav.consumption', icon: BarChart2 },
  { to: '/alerts', labelKey: 'nav.alerts', icon: Bell },
  { to: '/invoices', labelKey: 'nav.invoices', icon: FileText },
]

function MainLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-[#0b1834] text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="bg-blue-500 rounded-lg p-2">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold leading-tight">{t('common.appName')}</p>
              <p className="text-xs text-slate-400 leading-tight">{t('common.appTagline')}</p>
            </div>
          </div>

          <nav className="mt-4 px-3 flex flex-col gap-1">
            {navItems.map(({ to, labelKey, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {t(labelKey)}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-slate-600 rounded-full p-2">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{t('common.userHome')}</p>
              <p className="text-xs text-slate-400 leading-tight">{t('common.myAccount')}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mt-4 transition-colors">
            <LogOut size={16} />
            {t('common.logOut')}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout