import { create } from 'zustand'
import { request } from './api'
import type { Product } from './types'

type ProductData = Omit<Product, 'id'>

type ProductStore = {
  products: Product[]
  fetchProducts: () => Promise<void>
  addProduct: (data: ProductData) => Promise<void>
  updateProduct: (id: number, data: ProductData) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
}

export const useProductStore = create<ProductStore>()((set) => ({
  products: [],

  fetchProducts: async () => {
    const products = await request<Product[]>('/products')
    set({ products })
  },

  addProduct: async (data) => {
    const product = await request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    set((state) => ({ products: [...state.products, product] }))
  },

  updateProduct: async (id, data) => {
    const product = await request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? product : p)),
    }))
  },

  deleteProduct: async (id) => {
    await request<void>(`/products/${id}`, { method: 'DELETE' })
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }))
  },
}))