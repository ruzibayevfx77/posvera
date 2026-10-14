import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Sale } from './types'

type SaleStore = {
  sales: Sale[]
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Sale
}

export const useSaleStore = create<SaleStore>()(
  persist(
    (set) => ({
      sales: [],
      addSale: (data) => {
        const sale: Sale = {
          id: Date.now(),
          date: new Date().toISOString(),
          ...data,
        }
        set((state) => ({ sales: [sale, ...state.sales] }))
        return sale
      },
    }),
    { name: 'posvera-sales' }
  )
)