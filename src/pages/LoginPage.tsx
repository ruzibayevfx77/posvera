import { useState } from 'react'
import { useAuthStore } from '../authStore'
import { useT } from '../i18n'
import LanguageSwitcher from '../LanguageSwitcher'

function LoginPage() {
  const t = useT()
  const login = useAuthStore((state) => state.login)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (loading) return
    setError('')
    setLoading(true)
    const errorMessage = await login(username.trim(), password)
    if (errorMessage) {
      setError(errorMessage)
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg bg-slate-700 p-3 outline-none focus:ring-2 focus:ring-emerald-400'

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
      <div className="w-full max-w-sm rounded-xl bg-slate-800 p-8">
        <h1 className="mb-1 text-center text-4xl font-bold text-emerald-400">
          POSVERA
        </h1>
        <p className="mb-6 text-center text-slate-400">{t('login.subtitle')}</p>

        <div className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('login.username')}
            className={inputClass}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder={t('login.password')}
            className={inputClass}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 p-3 font-bold text-slate-900 hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? t('login.checking') : t('login.submit')}
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}

export default LoginPage