import { useState } from 'react'
import { useProductStore } from '../store'
import { useFormat, useT } from '../i18n'
import type { Product } from '../types'

function ProductsPage() {
  const t = useT()
  const format = useFormat()
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
      category: category.trim(),
      stock: Number(stock) || 0,
    }
    const action =
      editingId === null ? addProduct(data) : updateProduct(editingId, data)
    action.catch((e) =>
      alert(e instanceof Error ? e.message : t('error.generic'))
    )
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
      <h1 className="mb-4 text-2xl font-bold">{t('products.title')}</h1>

      {/* Forma */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-xl bg-slate-800 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('products.name')}
          className={`${inputClass} flex-1`}
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={t('products.price')}
          className={`${inputClass} w-36`}
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={t('products.category')}
          className={`${inputClass} w-44`}
        />
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder={t('products.stock')}
          className={`${inputClass} w-28`}
        />
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-emerald-500 px-6 font-bold text-slate-900 hover:bg-emerald-400"
        >
          {editingId === null ? t('products.add') : t('products.save')}
        </button>
        {editingId !== null && (
          <button
            onClick={resetForm}
            className="rounded-lg bg-slate-700 px-6 hover:bg-slate-600"
          >
            {t('common.cancel')}
          </button>
        )}
      </div>

      {/* Jadval */}
      <table className="w-full overflow-hidden rounded-xl bg-slate-800 text-left">
        <thead className="bg-slate-700 text-slate-300">
          <tr>
            <th className="p-3">{t('products.name')}</th>
            <th className="p-3">{t('products.category')}</th>
            <th className="p-3">{t('products.price')}</th>
            <th className="p-3">{t('products.stock')}</th>
            <th className="p-3 text-right">{t('products.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-slate-700">
              <td className="p-3">{p.name}</td>
              <td className="p-3 text-slate-400">{p.category}</td>
              <td className="p-3 text-emerald-400">{format.money(p.price)}</td>
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
                  {t('products.edit')}
                </button>
                <button
                  onClick={() =>
                    deleteProduct(p.id).catch((e) =>
                      alert(e instanceof Error ? e.message : t('error.generic'))
                    )
                  }
                  className="rounded bg-red-500/80 px-3 py-1 hover:bg-red-500"
                >
                  {t('products.delete')}
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-slate-400">
                {t('products.empty')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ProductsPage