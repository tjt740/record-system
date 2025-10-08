import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './translations'

const STORAGE_KEY = 'aam-language'
const DEFAULT_LANGUAGE = 'zh'

const I18nContext = createContext({
  lang: DEFAULT_LANGUAGE,
  t: (path, params) => path,
  setLanguage: () => {},
})

const getTranslationValue = (lang, path, params) => {
  const segments = path.split('.')
  let ref = translations[lang]
  for (const segment of segments) {
    ref = ref?.[segment]
    if (ref === undefined || ref === null) {
      break
    }
  }
  if (typeof ref === 'function') {
    if (Array.isArray(params)) {
      return ref(...params)
    }
    if (params && typeof params === 'object') {
      return ref(...Object.values(params))
    }
    return ref(params)
  }
  if (typeof ref === 'string') {
    if (!params) {
      return ref
    }
    return Object.keys(params).reduce(
      (acc, key) => acc.replace(new RegExp(`{${key}}`, 'g'), params[key]),
      ref,
    )
  }
  return path
}

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const cached = localStorage.getItem(STORAGE_KEY)
    return cached && translations[cached] ? cached : DEFAULT_LANGUAGE
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      t: (path, params) => getTranslationValue(lang, path, params),
      setLanguage: (nextLang) => {
        if (translations[nextLang]) {
          setLang(nextLang)
        }
      },
      availableLanguages: Object.keys(translations),
    }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
