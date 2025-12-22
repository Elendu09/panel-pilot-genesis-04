import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BuyerAuthProvider } from '@/contexts/BuyerAuthContext';
import { BuyerProtectedRoute } from '@/components/buyer/BuyerProtectedRoute';
import App from '../App';

// Buyer pages
import BuyerDashboard from './buyer/BuyerDashboard';
import BuyerServices from './buyer/BuyerServices';
import BuyerOrders from './buyer/BuyerOrders';
import BuyerProfile from './buyer/BuyerProfile';
import BuyerAuth from './buyer/BuyerAuth';
import BuyerDeposit from './buyer/BuyerDeposit';
import BuyerSupport from './buyer/BuyerSupport';

const queryClient = new QueryClient();

/**
 * TenantRouter determines if we should show the storefront/buyer dashboard or the main app
 * based on the current domain and tenant detection
 */
const TenantRouter = () => {
  const { panel, loading, error, isTenantDomain, isPlatformDomain } = useTenant();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10">
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
              <BuyerAuthProvider panelId={panel.id}>
                <BrowserRouter>
                  <Routes>
                    {/* Public auth route */}
                    <Route path="/auth" element={<BuyerAuth />} />
                    
                    {/* Protected buyer routes */}
                    <Route path="/" element={
                      <BuyerProtectedRoute>
                        <BuyerDashboard />
                      </BuyerProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                      <BuyerProtectedRoute>
                        <BuyerDashboard />
                      </BuyerProtectedRoute>
                    } />
                    <Route path="/services" element={
                      <BuyerProtectedRoute>
                        <BuyerServices />
                      </BuyerProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <BuyerProtectedRoute>
                        <BuyerOrders />
                      </BuyerProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <BuyerProtectedRoute>
                        <BuyerProfile />
                      </BuyerProtectedRoute>
                    } />
                    <Route path="/deposit" element={
                      <BuyerProtectedRoute>
                        <BuyerDeposit />
                      </BuyerProtectedRoute>
                    } />
                    <Route path="/support" element={
                      <BuyerProtectedRoute>
                        <BuyerSupport />
                      </BuyerProtectedRoute>
                    } />
                    
                    {/* Catch all - redirect to auth */}
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                  </Routes>
                </BrowserRouter>
              </BuyerAuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    );
  }

  // If this is a tenant domain but no panel found, redirect to auth or show error
  if (isTenantDomain && !panel) {
    return (
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider defaultTheme="dark" storageKey="smm-panel-theme">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10">
                <div className="text-center max-w-md p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h1 className="text-2xl font-bold mb-4">Panel Not Found</h1>
                  <p className="text-muted-foreground mb-6">
                    {error || 'This panel is not available or has been deactivated.'}
                  </p>
                  <a 
                    href="https://smmpilot.online" 
                    className="text-primary hover:underline"
                  >
                    Visit SMMPilot.online →
                  </a>
                </div>
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    );
  }

  // Fallback to main app
  return <App />;
};

export default TenantRouter;