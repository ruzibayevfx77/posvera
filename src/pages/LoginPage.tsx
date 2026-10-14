import { useState } from 'react'
import { useAuthStore } from '../authStore'

function LoginPage() {
  const login = useAuthStore((state) => state.login)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    const ok = login(username.trim(), password)
    if (!ok) setError("Login yoki parol noto'g'ri")
  }

  const inputClass =
    'w-full rounded-lg bg-slate-700 p-3 outline-none focus:ring-2 focus:ring-emerald-400'

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
      <div className="w-full max-w-sm rounded-xl bg-slate-800 p-8">
        <h1 className="mb-1 text-center text-4xl font-bold text-emerald-400">
          POSVERA
        </h1>
        <p className="mb-6 text-center text-slate-400">Tizimga kirish</p>

        <div className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Login"
            className={inputClass}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Parol"
            className={inputClass}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-emerald-500 p-3 font-bold text-slate-900 hover:bg-emerald-400"
          >
            Kirish
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage