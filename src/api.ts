const BASE = 'http://localhost:3000/api'

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Server xatosi: ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}