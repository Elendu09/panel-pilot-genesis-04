import { ReactNode, createContext, useContext, useMemo, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateBuyerThemeCSS } from '@/lib/color-utils';
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
const themeComponents: Record<BuyerThemeKey, React.FC<{ children: ReactNode; className?: string }>> = {
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

  // Determine which theme to use
  const themeKey = useMemo(() => {
    if (propThemeKey) return propThemeKey;
    if (panelData?.buyer_theme) return panelData.buyer_theme as BuyerThemeKey;
    return 'default';
  }, [propThemeKey, panelData?.buyer_theme]);

  // Get theme component and config
  const ThemeComponent = themeComponents[themeKey] || themeComponents.default;
  const themeConfig = themeConfigs[themeKey] || themeConfigs.default;

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
    };
  }, [panelData]);

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
      <ThemeComponent className={className}>
        {children}
      </ThemeComponent>
    </BuyerThemeContext.Provider>
  );
};

export default BuyerThemeWrapper;
