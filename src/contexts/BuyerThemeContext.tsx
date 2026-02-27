import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface BuyerThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  defaultThemeMode: ThemeMode;
}

const BuyerThemeContext = createContext<BuyerThemeContextValue | undefined>(undefined);

interface BuyerThemeProviderProps {
  children: ReactNode;
  panelId?: string;
  defaultThemeMode?: ThemeMode;
}

/**
 * BuyerThemeProvider manages light/dark mode for buyer-facing pages.
 * - Uses panel owner's saved themeMode as default
 * - Allows buyers to toggle, saving preference to localStorage per-panel
 * - Applies theme class to document root for CSS selectors
 */
export function BuyerThemeProvider({ 
  children, 
  panelId,
  defaultThemeMode = 'dark' 
}: BuyerThemeProviderProps) {
  const storageKey = panelId ? `buyer-theme-${panelId}` : 'buyer-theme-default';
  
  // Initialize theme from localStorage or fall back to panel default
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultThemeMode;
    const stored = localStorage.getItem(storageKey);
    // Only use stored value if buyer explicitly set it
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return defaultThemeMode;
  });

  // Update theme when default changes (e.g., panel owner updates settings)
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    // If buyer hasn't explicitly set a preference, follow panel default
    if (!stored) {
      setThemeModeState(defaultThemeMode);
    }
  }, [defaultThemeMode, storageKey]);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(themeMode);
    
    // Also set data attribute for additional CSS hooks
    root.setAttribute('data-buyer-theme', themeMode);
  }, [themeMode]);

  // Listen for design updates from panel owner
  useEffect(() => {
    const handleDesignUpdate = () => {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        setThemeModeState(defaultThemeMode);
      }
    };

    window.addEventListener('panelDesignUpdated', handleDesignUpdate);
    return () => window.removeEventListener('panelDesignUpdated', handleDesignUpdate);
  }, [defaultThemeMode, storageKey]);

  // Listen for theme-change events from ThemeProvider to stay in sync
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.theme && (detail.theme === 'light' || detail.theme === 'dark')) {
        setThemeModeState(detail.theme);
        localStorage.setItem(storageKey, detail.theme);
      }
    };

    window.addEventListener('theme-change', handleThemeChange);
    return () => window.removeEventListener('theme-change', handleThemeChange);
  }, [storageKey]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    // Immediately update DOM for instant feedback
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    root.setAttribute('data-buyer-theme', mode);
    
    // Save to localStorage so buyer's preference persists
    localStorage.setItem(storageKey, mode);
    
    // Also update ThemeProvider's storage key so both stay in sync
    const themeProviderKey = panelId ? `smm-tenant-theme-${panelId}` : 'smm-panel-theme';
    localStorage.setItem(themeProviderKey, mode);
    
    // Dispatch theme-change event so ThemeProvider picks it up
    window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: mode, source: 'buyer' } }));
    
    // Update state
    setThemeModeState(mode);
  }, [storageKey, panelId]);

  const toggleThemeMode = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);

  return (
    <BuyerThemeContext.Provider value={{ 
      themeMode, 
      setThemeMode, 
      toggleThemeMode,
      defaultThemeMode 
    }}>
      {children}
    </BuyerThemeContext.Provider>
  );
}

export function useBuyerThemeMode() {
  const context = useContext(BuyerThemeContext);
  if (!context) {
    // Return a fallback if used outside provider (e.g., in preview)
    return {
      themeMode: 'dark' as ThemeMode,
      setThemeMode: () => {},
      toggleThemeMode: () => {},
      defaultThemeMode: 'dark' as ThemeMode,
    };
  }
  return context;
}

export { BuyerThemeContext };
