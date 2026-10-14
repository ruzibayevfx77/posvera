import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { products as initialProducts } from './data'
import type { Product } from './types'

type ProductData = Omit<Product, 'id'>

type ProductStore = {
  products: Product[]
  addProduct: (data: ProductData) => void
  updateProduct: (id: number, data: ProductData) => void
  deleteProduct: (id: number) => void
  decreaseStock: (items: { id: number; quantity: number }[]) => void
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: initialProducts,
      addProduct: (data) =>
        set((state) => ({
          products: [...state.products, { id: Date.now(), ...data }],
        })),
      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { id, ...data } : p)),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      decreaseStock: (items) =>
        set((state) => ({
          products: state.products.map((p) => {
            const sold = items.find((i) => i.id === p.id)
            return sold
              ? { ...p, stock: Math.max(0, p.stock - sold.quantity) }
              : p
          }),
        })),
    }),
    { name: 'posvera-products-v2' }
  )
)