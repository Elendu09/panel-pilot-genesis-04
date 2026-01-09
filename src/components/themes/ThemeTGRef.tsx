// Wrapper to maintain backward compatibility with the old ThemeTGRef interface
// The detailed TGRefHomepage component in buyer-themes is the actual implementation
import TGRefHomepage from '@/components/buyer-themes/tgref/TGRefHomepage';

interface ThemeTGRefProps {
  panel: any;
  services: any[];
  customization?: any;
  isPreview?: boolean;
}

export function ThemeTGRef({ panel, services, customization, isPreview }: ThemeTGRefProps) {
  return (
    <TGRefHomepage 
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

export default ThemeTGRef;
