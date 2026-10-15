import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uz } from './uz'
import type { Dictionary, TranslationKey } from './uz'
import { ru } from './ru'
import { en } from './en'

export type Lang = 'uz' | 'ru' | 'en'
export type { TranslationKey }

type Params = Record<string, string | number>

const dictionaries: Record<Lang, Dictionary> = { uz, ru, en }

const getDictionary = (lang: Lang): Dictionary => dictionaries[lang] ?? uz

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'uz', label: "O'zbekcha" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]

type LangStore = {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLangStore = create<LangStore>()(
  persist(
    (set) => ({
      lang: 'uz',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'posvera-lang' }
  )
)

function translateWith(lang: Lang, key: TranslationKey, params?: Params): string {
  let text = getDictionary(lang)[key]
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}

// Komponent tashqarisida (masalan api.ts da) ishlatish uchun
export function translate(key: TranslationKey, params?: Params): string {
  return translateWith(useLangStore.getState().lang, key, params)
}

// Komponent ichida: til o'zgarsa komponent o'zi yangilanadi
export function useT() {
  const lang = useLangStore((state) => state.lang)
  return (key: TranslationKey, params?: Params) =>
    translateWith(lang, key, params)
}

// Raqam, pul va sanani tanlangan tilga mos ko'rsatadi
export function useFormat() {
  const lang = useLangStore((state) => state.lang)
  const locale = lang === 'en' ? 'en-GB' : 'ru-RU'
  const currency = getDictionary(lang).currency

  return {
    number: (n: number) => n.toLocaleString(locale),
    money: (n: number) => `${n.toLocaleString(locale)} ${currency}`,
    date: (iso: string) => new Date(iso).toLocaleString(locale),
  }
}