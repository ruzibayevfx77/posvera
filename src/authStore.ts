import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_URL } from './config'

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
          const data = await res.json().catch(() => ({}))
          if (!res.ok) return data.error || 'Xato chiqdi'

          set({ user: data.user, token: data.token })
          return null
        } catch {
          return "Serverga ulanib bo'lmadi"
        }
      },

      logout: () => set({ user: null, token: null }),
    }),
    { name: 'posvera-auth-v2' }
  )
)