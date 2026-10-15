import { useEffect, useState } from 'react'
import { useSettingsStore } from '../settingsStore'
import type { ShopSettings } from '../settingsStore'
import { useT } from '../i18n'
import LanguageSwitcher from '../LanguageSwitcher'

function SettingsPage() {
  const t = useT()
  const settings = useSettingsStore((state) => state.settings)
  const saveSettings = useSettingsStore((state) => state.saveSettings)

  const [form, setForm] = useState<ShopSettings>(settings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Serverdan ma'lumot kelganda formani yangilaydi
  useEffect(() => {
    setForm(settings)
  }, [settings])

  const update = (key: keyof ShopSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!form.shopName.trim()) {
      setError(t('settings.nameRequired'))
      return
    }
    setError('')
    setSaving(true)
    try {
      await saveSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error.generic'))
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-lg bg-slate-700 p-3 outline-none focus:ring-2 focus:ring-emerald-400'

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">{t('settings.title')}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Til */}
          <div className="rounded-xl bg-slate-800 p-5">
            <h2 className="mb-3 text-lg font-semibold">{t('settings.language')}</h2>
            <LanguageSwitcher />
          </div>

          {/* Do'kon ma'lumotlari */}
          <div className="space-y-4 rounded-xl bg-slate-800 p-5">
            <h2 className="text-lg font-semibold">{t('settings.shop')}</h2>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                {t('settings.shopName')}
              </label>
              <input
                value={form.shopName}
                onChange={(e) => update('shopName', e.target.value)}
                maxLength={60}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                {t('settings.shopAddress')}
              </label>
              <input
                value={form.shopAddress}
                onChange={(e) => update('shopAddress', e.target.value)}
                maxLength={120}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                {t('settings.shopPhone')}
              </label>
              <input
                value={form.shopPhone}
                onChange={(e) => update('shopPhone', e.target.value)}
                maxLength={30}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                {t('settings.receiptFooter')}
              </label>
              <input
                value={form.receiptFooter}
                onChange={(e) => update('receiptFooter', e.target.value)}
                maxLength={120}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500">
                {t('settings.footerHint')}
              </p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-emerald-500 px-6 py-3 font-bold text-slate-900 hover:bg-emerald-400 disabled:opacity-50"
              >
                {saving ? t('pay.saving') : t('settings.save')}
              </button>
              {saved && (
                <span className="text-emerald-400">✓ {t('settings.saved')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Chekning jonli ko'rinishi */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">{t('settings.preview')}</h2>
          <div className="w-72 bg-white p-4 font-mono text-sm text-black">
            <h3 className="text-center text-xl font-bold">
              {form.shopName || 'POSVERA'}
            </h3>
            {form.shopAddress && (
              <p className="text-center text-xs">{form.shopAddress}</p>
            )}
            {form.shopPhone && (
              <p className="text-center text-xs">{form.shopPhone}</p>
            )}
            <p className="text-center">{t('receipt.title')}</p>
            <hr className="my-2 border-dashed border-black" />
            <div className="flex justify-between">
              <span>1 x 12 000</span>
              <span>12 000</span>
            </div>
            <hr className="my-2 border-dashed border-black" />
            <p className="mt-3 text-center">
              {form.receiptFooter || t('receipt.thanks')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage