import { create } from 'zustand'
import { request } from './api'

export type ShopSettings = {
  shopName: string
  shopAddress: string
  shopPhone: string
  receiptFooter: string
}

const DEFAULTS: ShopSettings = {
  shopName: 'POSVERA',
  shopAddress: '',
  shopPhone: '',
  receiptFooter: '',
}

type SettingsStore = {
  settings: ShopSettings
  fetchSettings: () => Promise<void>
  saveSettings: (data: ShopSettings) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>()((set) => ({
  settings: DEFAULTS,

  fetchSettings: async () => {
    const settings = await request<ShopSettings>('/settings')
    set({ settings })
  },

  saveSettings: async (data) => {
    const settings = await request<ShopSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    set({ settings })
  },
}))