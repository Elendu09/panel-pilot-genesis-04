// Wrapper to maintain backward compatibility with the old ThemeAliPanel interface
// The detailed AliPanelHomepage component in buyer-themes is the actual implementation
import AliPanelHomepage from '@/components/buyer-themes/alipanel/AliPanelHomepage';

interface ThemeAliPanelProps {
  panel: any;
  services: any[];
  customization?: any;
  isPreview?: boolean;
}

export function ThemeAliPanel({ panel, services, customization, isPreview }: ThemeAliPanelProps) {
  return (
    <AliPanelHomepage 
      panelName={panel?.name}
      services={services}
      stats={{
        totalOrders: panel?.total_orders || 0,
        totalUsers: 0,
        servicesCount: services?.length || 0,
      }}
      customization={customization || panel?.custom_branding}
      logoUrl={panel?.logo_url}
    />
  );
}

export default ThemeAliPanel;
