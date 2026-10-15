import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_URL } from './config'
import { translate } from './i18n'

export type Role = 'admin' | 'cashier'

export type User = {
  username: string
  name: string
  role: Role
}

type AuthStore = {
  user: User | null
  token: string | null
  // Xato bo'lsa xabar matnini, muvaffaqiyatli bo'lsa null qaytaradi
  login: (username: string, password: string) => Promise<string | null>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (username, password) => {
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          })
          if (res.status === 401) return translate('login.invalid')

          const data = await res.json().catch(() => ({}))
          if (!res.ok) return data.error || translate('error.generic')

          set({ user: data.user, token: data.token })
          return null
        } catch {
          return translate('error.network')
        }
      },

      logout: () => set({ user: null, token: null }),
    }),
    { name: 'posvera-auth-v2' }
  )
)