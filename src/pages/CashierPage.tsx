import { useState } from 'react'
import { useProductStore } from '../store'
import { useSaleStore } from '../salesStore'
import { useAuthStore } from '../authStore'
import PaymentModal from '../PaymentModal'
import Receipt from '../Receipt'
import type { CartItem, PaymentResult, Product, Sale } from '../types'

function CashierPage() {
  const products = useProductStore((state) => state.products)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const addSale = useSaleStore((state) => state.addSale)
  const user = useAuthStore((state) => state.user)

  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showPayment, setShowPayment] = useState(false)
  const [receipt, setReceipt] = useState<Sale | null>(null)
  const [saving, setSaving] = useState(false)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      const currentQty = exists ? exists.quantity : 0
      if (currentQty >= product.stock) return prev

      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const changeQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.min(item.stock, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSuccess = async (payment: PaymentResult) => {
    if (saving) return
    setSaving(true)
    try {
      const sale = await addSale({
        items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
        discountAmount: payment.discountAmount,
        method: payment.method,
        cashier: user?.name,
      })
      await fetchProducts()
      setCart([])
      setShowPayment(false)
      setReceipt(sale)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Sotuvni saqlashda xato chiqdi")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full">
      {/* Chap tomon: mahsulotlar */}
      <div className="flex-1 overflow-y-auto p-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Mahsulot qidirish..."
          className="mb-6 w-full rounded-lg bg-slate-800 p-3 outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="rounded-xl bg-slate-800 p-4 text-left transition hover:bg-slate-700 disabled:opacity-40"
            >
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-slate-400">{product.category}</p>
              <p className="mt-2 text-emerald-400">
                {product.price.toLocaleString()} so'm
              </p>
              <p
                className={`mt-1 text-sm ${
                  product.stock <= 5 ? 'text-red-400' : 'text-slate-400'
                }`}
              >
                {product.stock === 0 ? 'Tugagan' : `Qoldiq: ${product.stock}`}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* O'ng tomon: savat */}
      <div className="flex w-96 flex-col bg-slate-800 p-6">
        <h2 className="mb-4 text-2xl font-bold">Savat</h2>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {cart.length === 0 && <p className="text-slate-400">Savat bo'sh</p>}
          {cart.map((item) => (
            <div key={item.id} className="rounded-lg bg-slate-700 p-3">
              <div className="flex justify-between">
                <span>{item.name}</span>
                <span>{(item.price * item.quantity).toLocaleString()}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => changeQuantity(item.id, -1)}
                  className="h-8 w-8 rounded bg-slate-600 hover:bg-slate-500"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => changeQuantity(item.id, 1)}
                  className="h-8 w-8 rounded bg-slate-600 hover:bg-slate-500"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-600 pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Jami:</span>
            <span className="text-emerald-400">{total.toLocaleString()} so'm</span>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="mt-4 w-full rounded-lg bg-emerald-500 p-3 font-bold text-slate-900 hover:bg-emerald-400 disabled:opacity-40"
          >
            To'lov qilish
          </button>
        </div>
      </div>

      {/* To'lov oynasi */}
      {showPayment && (
        <PaymentModal
          total={total}
          onClose={() => setShowPayment(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Chek */}
      {receipt && <Receipt sale={receipt} onClose={() => setReceipt(null)} />}
    </div>
  )
}

export default CashierPage