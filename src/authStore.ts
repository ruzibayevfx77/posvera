import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'admin' | 'cashier'

export type User = {
  username: string
  name: string
  role: Role
}

const USERS: (User & { password: string })[] = [
  { username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' },
  { username: 'kassir', password: 'kassir123', name: 'Kassir', role: 'cashier' },
]

type AuthStore = {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: (username, password) => {
        const found = USERS.find(
          (u) => u.username === username && u.password === password
        )
        if (!found) return false
        set({
          user: { username: found.username, name: found.name, role: found.role },
        })
        return true
      },
      logout: () => set({ user: null }),
    }),
    { name: 'posvera-auth' }
  )
)