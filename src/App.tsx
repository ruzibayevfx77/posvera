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
import CashierPage from './pages/CashierPage'
import ProductsPage from './pages/ProductsPage'
import SalesPage from './pages/SalesPage'
import LoginPage from './pages/LoginPage'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-4 py-2 font-semibold ${
    isActive ? 'bg-emerald-500 text-slate-900' : 'text-slate-300 hover:bg-slate-700'
  }`

function App() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const fetchSales = useSaleStore((state) => state.fetchSales)

  useEffect(() => {
    if (!user) return
    fetchProducts().catch(() =>
      alert("Serverga ulanib bo'lmadi. Server ishlayotganini tekshiring.")
    )
    if (user.role === 'admin') {
      fetchSales().catch(() => {})
    }
  }, [user, fetchProducts, fetchSales])

  if (!user) return <LoginPage />

  const isAdmin = user.role === 'admin'

  return (
    <BrowserRouter>
      <div className="flex h-screen flex-col bg-slate-900 text-white">
        <nav className="flex items-center gap-2 bg-slate-800 px-6 py-3">
          <span className="mr-6 text-2xl font-bold text-emerald-400">POSVERA</span>
          <NavLink to="/" end className={linkClass}>
            Kassa
          </NavLink>
          {isAdmin && (
            <NavLink to="/products" className={linkClass}>
              Mahsulotlar
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/sales" className={linkClass}>
              Sotuvlar
            </NavLink>
          )}

          <div className="ml-auto flex items-center gap-3">
            <span className="text-slate-300">{user.name}</span>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-700 px-4 py-2 hover:bg-slate-600"
            >
              Chiqish
            </button>
          </div>
        </nav>
        <main className="min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<CashierPage />} />
            {isAdmin && <Route path="/products" element={<ProductsPage />} />}
            {isAdmin && <Route path="/sales" element={<SalesPage />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App