import { useState, useEffect } from 'react';
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
import BuyerPublicServices from './buyer/BuyerPublicServices';
import Storefront from './Storefront';

const queryClient = new QueryClient();

/**
 * TenantRouter determines if we should show the storefront/buyer dashboard or the main app
 * based on the current domain and tenant detection.
 * 
 * DOMAIN ROUTING LOGIC:
 * 1. Platform domains (smmpilot.online, www.smmpilot.online) → Main App
 * 2. Development/preview domains (*.lovableproject.com, localhost) → Main App
 * 3. Tenant subdomains (*.smmpilot.online) → Buyer Dashboard
 * 4. Custom domains (verified in panel_domains) → Buyer Dashboard
 * 5. External hosting domains (*.netlify.app, etc.) → Buyer Dashboard (if configured)
 */
const TenantRouter = () => {
  const { panel, loading, error, isTenantDomain, isPlatformDomain, domainConfig, debugInfo } = useTenant();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout for loading state
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn('[TenantRouter] Loading timeout reached');
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout
      return () => clearTimeout(timer);
    }
    setLoadingTimeout(false);
  }, [loading]);

  // Skip loading spinner - render immediately
  if (loading && !loadingTimeout) {
    return null;
  }

  // Show error if loading timed out
  if (loadingTimeout) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    return (
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider defaultTheme="dark" storageKey="smm-panel-theme">
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10">
              <div className="text-center max-w-md px-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Connection Timeout</h1>
                <p className="text-muted-foreground mb-4">
                  Unable to load panel for <span className="font-mono text-sm">{hostname}</span>
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  Retry
                </button>
                {debugInfo && (
                  <div className="mt-6 text-left bg-muted/50 p-4 rounded-lg text-xs">
                    <p className="font-mono text-muted-foreground">
                      Subdomain: {debugInfo.detectedSubdomain || 'none'}<br/>
                      Attempts: {debugInfo.searchAttempts?.join(', ') || 'none'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    );
  }

  // If this is a platform domain, show the main app
  if (isPlatformDomain) {
    return <App />;
  }

  // If this is a tenant domain and we found a panel, show PUBLIC storefront first
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
                    {/* PUBLIC routes - Storefront accessible without login */}
                    <Route path="/" element={<Storefront />} />
                    <Route path="/auth" element={<BuyerAuth />} />
                    <Route path="/services" element={<BuyerPublicServices />} />
                    
                    {/* Protected buyer routes */}
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
                    
                    {/* Catch all - redirect to storefront */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </BrowserRouter>
              </BuyerAuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    );
  }

  // If this is a tenant domain but no panel found, show clean subdomain claim CTA
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
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                
                <div className="text-center max-w-md p-8 relative z-10">
                  {/* Logo/Icon */}
                  <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/20">
                    <span className="text-5xl">🚀</span>
                  </div>
                  
                  <h1 className="text-4xl font-bold text-white mb-4">
                    {requestedSubdomain}
                  </h1>
                  <p className="text-xl text-slate-300 mb-2">
                    is available!
                  </p>
                  <p className="text-slate-400 mb-8">
                    This subdomain is not yet configured. Be the first to claim it and start your SMM business today.
                  </p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => window.location.href = `https://smmpilot.online/auth?subdomain=${requestedSubdomain}`}
                      className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all"
                    >
                      <span className="text-lg">✨</span>
                      Claim {requestedSubdomain}.smmpilot.online
                    </button>
                    <button 
                      onClick={() => window.location.href = "https://smmpilot.online"}
                      className="flex items-center justify-center gap-2 w-full px-8 py-4 border border-slate-600 text-slate-300 font-medium rounded-xl hover:bg-slate-800/50 transition-colors"
                    >
                      Visit SMMPilot
                    </button>
                  </div>
                  
                  <p className="text-sm text-slate-500 mt-8">
                    Powered by <span className="text-purple-400 font-medium">SMMPilot</span>
                  </p>
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