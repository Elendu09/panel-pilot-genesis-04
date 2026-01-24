import { ReactNode, createContext, useContext, useMemo, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateBuyerThemeCSS } from '@/lib/color-utils';
import { useBuyerThemeMode } from '@/contexts/BuyerThemeContext';
import BuyerThemeDefault, { defaultThemeConfig } from './BuyerThemeDefault';
import BuyerThemeAliPanel, { aliPanelThemeConfig } from './BuyerThemeAliPanel';
import BuyerThemeFlySMM, { flySMMThemeConfig } from './BuyerThemeFlySMM';
import BuyerThemeSMMStay, { smmStayThemeConfig } from './BuyerThemeSMMStay';
import BuyerThemeTGRef, { tgRefThemeConfig } from './BuyerThemeTGRef';
import BuyerThemeSMMVisit, { smmVisitThemeConfig } from './BuyerThemeSMMVisit';

export type BuyerThemeKey = 'default' | 'alipanel' | 'flysmm' | 'smmstay' | 'tgref' | 'smmvisit';

interface BuyerThemeContextValue {
  themeKey: BuyerThemeKey;
  themeConfig: typeof defaultThemeConfig;
  customization: any;
}

const BuyerThemeContext = createContext<BuyerThemeContextValue>({
  themeKey: 'default',
  themeConfig: defaultThemeConfig,
  customization: {},
});

export const useBuyerTheme = () => useContext(BuyerThemeContext);

// Theme components map
const themeComponents: Record<BuyerThemeKey, React.FC<{ children: ReactNode; className?: string; themeMode?: 'light' | 'dark' }>> = {
  default: BuyerThemeDefault,
  alipanel: BuyerThemeAliPanel,
  flysmm: BuyerThemeFlySMM,
  smmstay: BuyerThemeSMMStay,
  tgref: BuyerThemeTGRef,
  smmvisit: BuyerThemeSMMVisit,
};

// Theme configs map
const themeConfigs: Record<BuyerThemeKey, typeof defaultThemeConfig> = {
  default: defaultThemeConfig,
  alipanel: aliPanelThemeConfig,
  flysmm: flySMMThemeConfig,
  smmstay: smmStayThemeConfig,
  tgref: tgRefThemeConfig,
  smmvisit: smmVisitThemeConfig,
};

// All available themes for selection UI
export const availableThemes = [
  { key: 'default' as const, ...defaultThemeConfig },
  { key: 'alipanel' as const, ...aliPanelThemeConfig },
  { key: 'flysmm' as const, ...flySMMThemeConfig },
  { key: 'smmstay' as const, ...smmStayThemeConfig },
  { key: 'tgref' as const, ...tgRefThemeConfig },
  { key: 'smmvisit' as const, ...smmVisitThemeConfig },
];

interface BuyerThemeWrapperProps {
  children: ReactNode;
  panelId?: string;
  themeKey?: BuyerThemeKey;
  className?: string;
}

export const BuyerThemeWrapper = ({ 
  children, 
  panelId, 
  themeKey: propThemeKey,
  className 
}: BuyerThemeWrapperProps) => {
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Use the buyer theme context for consistent theme mode
  const { themeMode: contextThemeMode } = useBuyerThemeMode();

  // Listen for design updates to refresh theme instantly
  useEffect(() => {
    const onDesignUpdated = () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['panel-buyer-theme', panelId] });
      queryClient.invalidateQueries({ queryKey: ['panel-customization', panelId] });
      setRefreshKey(k => k + 1);
    };

    window.addEventListener('panelDesignUpdated', onDesignUpdated);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'panelDesignUpdatedAt') onDesignUpdated();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('panelDesignUpdated', onDesignUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [panelId, queryClient]);

  // Fetch panel's buyer theme and full customization from database
  const { data: panelData } = useQuery({
    queryKey: ['panel-buyer-theme', panelId, refreshKey],
    queryFn: async () => {
      if (!panelId) return null;
      const { data } = await supabase
        .from('panels')
        .select('buyer_theme, custom_branding, logo_url, name, primary_color, secondary_color')
        .eq('id', panelId)
        .single();
      return data;
    },
    enabled: !!panelId,
    staleTime: 30000, // 30 seconds - allows quick refresh on design changes
  });

  // Determine which theme to use - check buyer_theme column first, then fallback to custom_branding.selectedTheme
  const themeKey = useMemo(() => {
    if (propThemeKey) return propThemeKey;
    
    // First check buyer_theme column
    if (panelData?.buyer_theme && panelData.buyer_theme !== 'default') {
      return panelData.buyer_theme as BuyerThemeKey;
    }
    
    // Fallback to selectedTheme from custom_branding
    const branding = panelData?.custom_branding as any;
    if (branding?.selectedTheme) {
      const themeMap: Record<string, BuyerThemeKey> = {
        'theme_tgref': 'tgref',
        'tgref': 'tgref',
        'theme_alipanel': 'alipanel',
        'alipanel': 'alipanel',
        'theme_flysmm': 'flysmm',
        'flysmm': 'flysmm',
        'theme_smmstay': 'smmstay',
        'smmstay': 'smmstay',
        'theme_smmvisit': 'smmvisit',
        'smmvisit': 'smmvisit',
      };
      if (themeMap[branding.selectedTheme]) {
        return themeMap[branding.selectedTheme];
      }
    }
    
    return 'default';
  }, [propThemeKey, panelData?.buyer_theme, panelData?.custom_branding]);

  // Get theme component and config
  const ThemeComponent = themeComponents[themeKey] || themeComponents.default;
  const themeConfig = themeConfigs[themeKey] || themeConfigs.default;

  // Force light mode for SMMVisit theme (it's light-mode only)
  const themeMode = themeKey === 'smmvisit' ? 'light' : contextThemeMode;

  // Build full customization from panel data
  const customization = useMemo(() => {
    if (!panelData) return {};
    const branding = panelData.custom_branding as any || {};
    return {
      ...branding,
      logoUrl: branding.logoUrl || panelData.logo_url,
      companyName: branding.companyName || panelData.name,
      primaryColor: branding.primaryColor || panelData.primary_color || '#6366F1',
      secondaryColor: branding.secondaryColor || panelData.secondary_color || '#8B5CF6',
      // Use themeMode from context (buyer's choice) instead of database
      themeMode,
      // Ensure all color fields are propagated
      accentColor: branding.accentColor || '#EC4899',
      backgroundColor: branding.backgroundColor || '#0F172A',
      surfaceColor: branding.surfaceColor || '#1E293B',
      cardColor: branding.cardColor || branding.surfaceColor || '#1E293B',
      textColor: branding.textColor || '#FFFFFF',
      mutedColor: branding.mutedColor || '#94A3B8',
      borderColor: branding.borderColor || '#334155',
      successColor: branding.successColor || '#22C55E',
      warningColor: branding.warningColor || '#F59E0B',
      infoColor: branding.infoColor || '#3B82F6',
      errorColor: branding.errorColor || '#EF4444',
      // Typography
      fontFamily: branding.fontFamily || 'Inter',
      headingFont: branding.headingFont || 'Inter',
      headingWeight: branding.headingWeight || '700',
      // Section toggles
      enableFastOrder: branding.enableFastOrder ?? true,
      enablePlatformFeatures: branding.enablePlatformFeatures ?? true,
      enableStats: branding.enableStats ?? true,
      enableFeatures: branding.enableFeatures ?? true,
      enableTestimonials: branding.enableTestimonials ?? true,
      enableFAQs: branding.enableFAQs ?? true,
      // Content
      heroTitle: branding.heroTitle || '',
      heroSubtitle: branding.heroSubtitle || '',
      heroBadgeText: branding.heroBadgeText || '',
      heroCTAText: branding.heroCTAText || 'Get Started',
      heroSecondaryCTAText: branding.heroSecondaryCTAText || 'View Services',
      featureCards: branding.featureCards || [],
      testimonials: branding.testimonials || [],
      faqs: branding.faqs || [],
      showBlogInMenu: branding.showBlogInMenu ?? false,
      // Spacing & animations
      sectionPaddingY: branding.sectionPaddingY || 80,
      containerMaxWidth: branding.containerMaxWidth || 1280,
      enableAnimations: branding.enableAnimations ?? true,
    };
  }, [panelData, themeMode]);

  // Generate CSS variables for theme colors
  const themeCSS = useMemo(() => {
    if (!customization.primaryColor) return '';
    return generateBuyerThemeCSS({
      primaryColor: customization.primaryColor,
      secondaryColor: customization.secondaryColor || '#8B5CF6',
      accentColor: customization.accentColor || '#EC4899',
      backgroundColor: customization.backgroundColor || '#0F172A',
      surfaceColor: customization.surfaceColor || '#1E293B',
      cardColor: customization.cardColor || customization.surfaceColor || '#1E293B',
      textColor: customization.textColor || '#FFFFFF',
      mutedColor: customization.mutedColor || '#94A3B8',
      borderColor: customization.borderColor || '#334155',
      successColor: customization.successColor || '#22C55E',
      warningColor: customization.warningColor || '#F59E0B',
      infoColor: customization.infoColor || '#3B82F6',
      errorColor: customization.errorColor || '#EF4444',
    });
  }, [customization]);

  const contextValue = useMemo(() => ({
    themeKey,
    themeConfig,
    customization,
  }), [themeKey, themeConfig, customization]);

  return (
    <BuyerThemeContext.Provider value={contextValue}>
      {themeCSS && <style>{themeCSS}</style>}
      <ThemeComponent className={className} themeMode={themeMode}>
        {children}
      </ThemeComponent>
    </BuyerThemeContext.Provider>
  );
};

export default BuyerThemeWrapper;
