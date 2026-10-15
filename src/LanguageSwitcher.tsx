import { LANGUAGES, useLangStore } from './i18n'
import type { Lang } from './i18n'

function LanguageSwitcher() {
  const lang = useLangStore((state) => state.lang)
  const setLang = useLangStore((state) => state.setLang)

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      className="rounded-lg bg-slate-700 px-3 py-2 outline-none hover:bg-slate-600"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  )
}

export default LanguageSwitcher