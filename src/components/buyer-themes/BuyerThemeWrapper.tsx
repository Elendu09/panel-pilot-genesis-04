import { ReactNode, createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BuyerThemeDefault, { defaultThemeConfig } from './BuyerThemeDefault';
import BuyerThemeAliPanel, { aliPanelThemeConfig } from './BuyerThemeAliPanel';
import BuyerThemeFlySMM, { flySMMThemeConfig } from './BuyerThemeFlySMM';
import BuyerThemeSMMStay, { smmStayThemeConfig } from './BuyerThemeSMMStay';
import BuyerThemeTGRef, { tgRefThemeConfig } from './BuyerThemeTGRef';
import BuyerThemeSMMus, { smmusThemeConfig } from './BuyerThemeSMMus';

export type BuyerThemeKey = 'default' | 'alipanel' | 'flysmm' | 'smmstay' | 'tgref' | 'smmus';

interface BuyerThemeContextValue {
  themeKey: BuyerThemeKey;
  themeConfig: typeof defaultThemeConfig;
}

const BuyerThemeContext = createContext<BuyerThemeContextValue>({
  themeKey: 'default',
  themeConfig: defaultThemeConfig,
});

export const useBuyerTheme = () => useContext(BuyerThemeContext);

// Theme components map
const themeComponents: Record<BuyerThemeKey, React.FC<{ children: ReactNode; className?: string }>> = {
  default: BuyerThemeDefault,
  alipanel: BuyerThemeAliPanel,
  flysmm: BuyerThemeFlySMM,
  smmstay: BuyerThemeSMMStay,
  tgref: BuyerThemeTGRef,
  smmus: BuyerThemeSMMus,
};

// Theme configs map
const themeConfigs: Record<BuyerThemeKey, typeof defaultThemeConfig> = {
  default: defaultThemeConfig,
  alipanel: aliPanelThemeConfig,
  flysmm: flySMMThemeConfig,
  smmstay: smmStayThemeConfig,
  tgref: tgRefThemeConfig,
  smmus: smmusThemeConfig,
};

// All available themes for selection UI
export const availableThemes = [
  { key: 'default' as const, ...defaultThemeConfig },
  { key: 'alipanel' as const, ...aliPanelThemeConfig },
  { key: 'flysmm' as const, ...flySMMThemeConfig },
  { key: 'smmstay' as const, ...smmStayThemeConfig },
  { key: 'tgref' as const, ...tgRefThemeConfig },
  { key: 'smmus' as const, ...smmusThemeConfig },
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
  // Fetch panel's buyer theme from database if panelId provided
  const { data: panelData } = useQuery({
    queryKey: ['panel-buyer-theme', panelId],
    queryFn: async () => {
      if (!panelId) return null;
      const { data } = await supabase
        .from('panels')
        .select('buyer_theme')
        .eq('id', panelId)
        .single();
      return data;
    },
    enabled: !!panelId && !propThemeKey,
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

  const contextValue = useMemo(() => ({
    themeKey,
    themeConfig,
  }), [themeKey, themeConfig]);

  return (
    <BuyerThemeContext.Provider value={contextValue}>
      <ThemeComponent className={className}>
        {children}
      </ThemeComponent>
    </BuyerThemeContext.Provider>
  );
};

export default BuyerThemeWrapper;
