import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "smm-panel-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey) as Theme
    // If no stored preference, default to dark for buyer pages
    if (!stored) {
      localStorage.setItem(storageKey, defaultTheme)
      return defaultTheme
    }
    return stored
  })
  const [userId, setUserId] = useState<string | null>(null)

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null)
    })

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch theme from Supabase when user logs in
  useEffect(() => {
    if (!userId) return

    const fetchThemeFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('user_id', userId)
          .single()

        if (!error && data?.theme_preference) {
          const dbTheme = data.theme_preference as Theme
          setThemeState(dbTheme)
          localStorage.setItem(storageKey, dbTheme)
        }
      } catch (error) {
        console.error('Error fetching theme preference:', error)
      }
    }

    fetchThemeFromSupabase()
  }, [userId, storageKey])

  // Apply theme to DOM - skip when buyer theme is active
  useEffect(() => {
    const root = window.document.documentElement

    // If buyer theme is controlling the DOM, don't override it
    if (root.hasAttribute('data-buyer-theme')) {
      return;
    }

    root.style.setProperty("--theme-transition", "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease")
    root.classList.add("theme-transition")

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(mediaQuery.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  // Listen for buyer theme changes to stay in sync
  useEffect(() => {
    const handleBuyerThemeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.source === 'buyer' && detail?.theme) {
        const newTheme = detail.theme as Theme;
        localStorage.setItem(storageKey, newTheme);
        setThemeState(newTheme);
      }
    };

    window.addEventListener('theme-change', handleBuyerThemeChange);
    return () => window.removeEventListener('theme-change', handleBuyerThemeChange);
  }, [storageKey])

  const setTheme = useCallback(async (t: Theme) => {
    const root = window.document.documentElement

    // Skip DOM manipulation if buyer theme is active
    if (!root.hasAttribute('data-buyer-theme')) {
      root.classList.remove("light", "dark")
      
      if (t === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        root.classList.add(systemTheme)
      } else {
        root.classList.add(t)
      }
    }
    
    // Update local state and storage
    localStorage.setItem(storageKey, t)
    setThemeState(t)
    
    // Dispatch custom event for cross-component sync
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: t } }))

    // Persist to Supabase if user is logged in (fire and forget)
    if (userId) {
      (async () => {
        try {
          await supabase
            .from('profiles')
            .update({ theme_preference: t })
            .eq('user_id', userId)
        } catch (error) {
          console.error('Error saving theme preference:', error)
        }
      })()
    }
  }, [storageKey, userId])

  const value = {
    theme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
