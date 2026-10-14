import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Sale } from './types'

type SaleStore = {
  sales: Sale[]
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void
}

export const useSaleStore = create<SaleStore>()(
  persist(
    (set) => ({
      sales: [],
      addSale: (sale) =>
        set((state) => ({
          sales: [
            { id: Date.now(), date: new Date().toISOString(), ...sale },
            ...state.sales,
          ],
        })),
    }),
    { name: 'posvera-sales' }
  )
)