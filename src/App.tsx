import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
} from 'react-router-dom'
import { useAuthStore } from './authStore'
import { useProductStore } from './store'
import { useSaleStore } from './salesStore'
import { useSettingsStore } from './settingsStore'
import { translate, useT } from './i18n'
import LanguageSwitcher from './LanguageSwitcher'
import CashierPage from './pages/CashierPage'
import ProductsPage from './pages/ProductsPage'
import SalesPage from './pages/SalesPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-4 py-2 font-semibold ${
    isActive ? 'bg-emerald-500 text-slate-900' : 'text-slate-300 hover:bg-slate-700'
  }`

function App() {
  const t = useT()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const fetchSales = useSaleStore((state) => state.fetchSales)
  const fetchSettings = useSettingsStore((state) => state.fetchSettings)

  useEffect(() => {
    if (!user) return
    fetchProducts().catch((e) =>
      alert(e instanceof Error ? e.message : translate('error.generic'))
    )
    fetchSettings().catch(() => {})
    if (user.role === 'admin') {
      fetchSales().catch(() => {})
    }
  }, [user, fetchProducts, fetchSales, fetchSettings])

  if (!user) return <LoginPage />

  const isAdmin = user.role === 'admin'

  return (
    <BrowserRouter>
      <div className="flex h-screen flex-col bg-slate-900 text-white">
        <nav className="flex items-center gap-2 bg-slate-800 px-6 py-3">
          <span className="mr-6 text-2xl font-bold text-emerald-400">POSVERA</span>
          <NavLink to="/" end className={linkClass}>
            {t('nav.cashier')}
          </NavLink>
          {isAdmin && (
            <NavLink to="/products" className={linkClass}>
              {t('nav.products')}
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/sales" className={linkClass}>
              {t('nav.sales')}
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/settings" className={linkClass}>
              {t('nav.settings')}
            </NavLink>
          )}

          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <span className="text-slate-300">{user.name}</span>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-700 px-4 py-2 hover:bg-slate-600"
            >
              {t('nav.logout')}
            </button>
          </div>
        </nav>
        <main className="min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<CashierPage />} />
            {isAdmin && <Route path="/products" element={<ProductsPage />} />}
            {isAdmin && <Route path="/sales" element={<SalesPage />} />}
            {isAdmin && <Route path="/settings" element={<SettingsPage />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App