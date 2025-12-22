import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from '../App';

// Buyer pages
import BuyerDashboard from './buyer/BuyerDashboard';
import BuyerServices from './buyer/BuyerServices';
import BuyerOrders from './buyer/BuyerOrders';
import BuyerProfile from './buyer/BuyerProfile';

const queryClient = new QueryClient();

/**
 * TenantRouter determines if we should show the storefront/buyer dashboard or the main app
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

  // If this is a tenant domain and we found a panel, show the buyer dashboard
  if (isTenantDomain && panel) {
    return (
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider defaultTheme="dark" storageKey="smm-panel-theme">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<BuyerDashboard />} />
                  <Route path="/dashboard" element={<BuyerDashboard />} />
                  <Route path="/services" element={<BuyerServices />} />
                  <Route path="/orders" element={<BuyerOrders />} />
                  <Route path="/profile" element={<BuyerProfile />} />
                  <Route path="/deposit" element={<BuyerDashboard />} />
                  <Route path="/support" element={<BuyerDashboard />} />
                  <Route path="*" element={<BuyerDashboard />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    );
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
