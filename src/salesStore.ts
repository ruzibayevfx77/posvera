import { create } from 'zustand'
import { request } from './api'
import type { Sale } from './types'

type NewSale = {
  items: { productId: number; quantity: number }[]
  discountAmount: number
  cardAmount: number
  cashReceived: number
}

type SaleStore = {
  sales: Sale[]
  fetchSales: () => Promise<void>
  addSale: (data: NewSale) => Promise<Sale>
}

export const useSaleStore = create<SaleStore>()((set) => ({
  sales: [],

  fetchSales: async () => {
    const sales = await request<Sale[]>('/sales')
    set({ sales })
  },

  addSale: async (data) => {
    const sale = await request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    set((state) => ({ sales: [sale, ...state.sales] }))
    return sale
  },
}))