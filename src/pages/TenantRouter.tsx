import { useEffect } from 'react';
import { useTenant } from '@/hooks/useTenant';
import Storefront from './Storefront';
import App from '../App';

/**
 * TenantRouter determines if we should show the storefront or the main app
 * based on the current domain and tenant detection
 */
const TenantRouter = () => {
  const { panel, loading, error, isTenantDomain, isPlatformDomain } = useTenant();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If this is a platform domain, show the main app
  if (isPlatformDomain) {
    return <App />;
  }

  // If this is a tenant domain and we found a panel, show the storefront
  if (isTenantDomain && panel) {
    return <Storefront />;
  }

  // If this is a tenant domain but no panel found, show error
  if (isTenantDomain && !panel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Panel Not Found</h1>
          <p className="text-muted-foreground">
            {error || 'This panel is not available or has been deactivated.'}
          </p>
        </div>
      </div>
    );
  }

  // Fallback to main app
  return <App />;
};

export default TenantRouter;