import { API_URL } from './config'
import { useAuthStore } from './authStore'

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new Error("Serverga ulanib bo'lmadi")
  }

  if (res.status === 401) {
    useAuthStore.getState().logout()
    throw new Error('Sessiya tugagan, qaytadan kiring')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Server xatosi: ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}