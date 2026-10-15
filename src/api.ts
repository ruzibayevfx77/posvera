import { API_URL } from './config'
import { useAuthStore } from './authStore'
import { translate } from './i18n'

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
    throw new Error(translate('error.network'))
  }

  if (res.status === 401) {
    useAuthStore.getState().logout()
    throw new Error(translate('error.session'))
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `${translate('error.generic')} (${res.status})`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}