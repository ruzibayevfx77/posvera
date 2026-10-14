import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import CashierPage from './pages/CashierPage'
import ProductsPage from './pages/ProductsPage'
import SalesPage from './pages/SalesPage'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-4 py-2 font-semibold ${
    isActive ? 'bg-emerald-500 text-slate-900' : 'text-slate-300 hover:bg-slate-700'
  }`

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen flex-col bg-slate-900 text-white">
        <nav className="flex items-center gap-2 bg-slate-800 px-6 py-3">
          <span className="mr-6 text-2xl font-bold text-emerald-400">POSVERA</span>
          <NavLink to="/" end className={linkClass}>
            Kassa
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            Mahsulotlar
          </NavLink>
          <NavLink to="/sales" className={linkClass}>
            Sotuvlar
          </NavLink>
        </nav>
        <main className="min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<CashierPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/sales" element={<SalesPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App