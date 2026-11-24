"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICTS, LOCALES, type Locale, type TKey } from "./dictionaries";

interface Ctx { locale: Locale; setLocale: (l: Locale) => void; t: (key: TKey) => string }
const I18nContext = createContext<Ctx>({ locale: "en", setLocale: () => {}, t: k => DICTS.en[k] ?? k });

/** Client-side i18n: starts in English (keeps pages static/cacheable), then switches to the saved language. */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Locale | null;
      if (saved && LOCALES.some(l => l.code === saved)) setLocaleState(saved);
      else { const nav = navigator.language?.slice(0, 2); if (nav === "fr") setLocaleState("fr"); else if (nav === "rw") setLocaleState("rw"); }
    } catch { /* storage blocked */ }
  }, []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const setLocale = useCallback((l: Locale) => { setLocaleState(l); try { localStorage.setItem("lang", l); } catch { /* ignore */ } }, []);
  const t = useCallback((key: TKey) => DICTS[locale][key] ?? DICTS.en[key] ?? key, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export const useI18n = () => useContext(I18nContext);
export const useT = () => useContext(I18nContext).t;
export { LOCALES };
