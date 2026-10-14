import { useState } from 'react'
import { useProductStore } from '../store'
import type { Product } from '../types'

function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('')

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setPrice('')
    setCategory('')
    setStock('')
  }

  const handleSubmit = () => {
    if (!name.trim() || !price) return
    const data = {
      name: name.trim(),
      price: Number(price),
      category: category.trim() || 'Boshqa',
      stock: Number(stock) || 0,
    }
    if (editingId === null) {
      addProduct(data)
    } else {
      updateProduct(editingId, data)
    }
    resetForm()
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setName(product.name)
    setPrice(String(product.price))
    setCategory(product.category)
    setStock(String(product.stock))
  }

  const inputClass =
    'rounded-lg bg-slate-700 p-3 outline-none focus:ring-2 focus:ring-emerald-400'

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="mb-4 text-2xl font-bold">Mahsulotlar</h1>

      {/* Forma */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-xl bg-slate-800 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nomi"
          className={`${inputClass} flex-1`}
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Narxi"
          className={`${inputClass} w-36`}
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Kategoriya"
          className={`${inputClass} w-44`}
        />
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Qoldiq"
          className={`${inputClass} w-28`}
        />
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-emerald-500 px-6 font-bold text-slate-900 hover:bg-emerald-400"
        >
          {editingId === null ? "Qo'shish" : 'Saqlash'}
        </button>
        {editingId !== null && (
          <button
            onClick={resetForm}
            className="rounded-lg bg-slate-700 px-6 hover:bg-slate-600"
          >
            Bekor qilish
          </button>
        )}
      </div>

      {/* Jadval */}
      <table className="w-full overflow-hidden rounded-xl bg-slate-800 text-left">
        <thead className="bg-slate-700 text-slate-300">
          <tr>
            <th className="p-3">Nomi</th>
            <th className="p-3">Kategoriya</th>
            <th className="p-3">Narxi</th>
            <th className="p-3">Qoldiq</th>
            <th className="p-3 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-slate-700">
              <td className="p-3">{p.name}</td>
              <td className="p-3 text-slate-400">{p.category}</td>
              <td className="p-3 text-emerald-400">
                {p.price.toLocaleString()} so'm
              </td>
              <td
                className={`p-3 ${
                  p.stock <= 5 ? 'font-bold text-red-400' : 'text-slate-300'
                }`}
              >
                {p.stock}
              </td>
              <td className="space-x-2 p-3 text-right">
                <button
                  onClick={() => startEdit(p)}
                  className="rounded bg-slate-600 px-3 py-1 hover:bg-slate-500"
                >
                  Tahrirlash
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="rounded bg-red-500/80 px-3 py-1 hover:bg-red-500"
                >
                  O'chirish
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-slate-400">
                Mahsulotlar yo'q
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ProductsPage