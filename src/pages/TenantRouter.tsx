import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
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
  const { panel, loading, error, isTenantDomain, isPlatformDomain, debugInfo } = useTenant();

  if (loading) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <div className="text-center max-w-md px-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-2">Connecting to panel...</p>
          <p className="text-xs text-muted-foreground/60 font-mono">{hostname}</p>
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

  // If this is a tenant domain but no panel found, show subdomain claim CTA with debugging
  if (isTenantDomain && !panel) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const requestedSubdomain = hostname.split('.')[0];
    
    return (
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider defaultTheme="dark" storageKey="smm-panel-theme">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10">
                <div className="text-center max-w-md p-8">
                  {/* Subdomain Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    {hostname}
                  </div>
                  
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
                    <span className="text-4xl">🔍</span>
                  </div>
                  
                  <h1 className="text-3xl font-bold mb-3">Panel Not Found</h1>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find an active panel for <span className="font-semibold text-foreground">{requestedSubdomain}</span>.
                  </p>
                  
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-left">
                      <p className="text-destructive text-sm font-medium mb-2">Debug Information:</p>
                      <p className="text-xs text-muted-foreground font-mono break-all">{error}</p>
                      {debugInfo && (
                        <div className="mt-2 text-xs text-muted-foreground/80 space-y-1">
                          <p>Hostname: {debugInfo.hostname}</p>
                          <p>Subdomain: {debugInfo.detectedSubdomain || 'none'}</p>
                          <p>Attempts: {debugInfo.searchAttempts?.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm font-medium mb-2">Possible reasons:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• The panel status is not "active"</li>
                      <li>• DNS is not configured correctly</li>
                      <li>• The subdomain was never created</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => window.location.href = `https://smmpilot.online/auth?subdomain=${requestedSubdomain}`}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Claim This Subdomain
                    </button>
                    <button 
                      onClick={() => window.location.href = "https://smmpilot.online"}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 border border-border/50 text-foreground font-medium rounded-xl hover:bg-accent/50 transition-colors"
                    >
                      Go to SMMPilot
                    </button>
                  </div>
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