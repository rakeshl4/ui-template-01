import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from '@/components/theme/theme-context'

// The theme is no longer user-selectable: the app always renders in the light theme.
const FIXED_THEME: Theme = 'light'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(FIXED_THEME)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((t) => (t === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
