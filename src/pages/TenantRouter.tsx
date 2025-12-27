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
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import App from '../App';

// Buyer pages
import BuyerDashboard from './buyer/BuyerDashboard';
import BuyerServices from './buyer/BuyerServices';
import BuyerOrders from './buyer/BuyerOrders';
import BuyerOrderTracking from './buyer/BuyerOrderTracking';
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
              <CurrencyProvider>
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
                      <Route path="/orders" element={
                        <BuyerProtectedRoute>
                          <BuyerOrders />
                        </BuyerProtectedRoute>
                      } />
                      <Route path="/orders/:orderId" element={
                        <BuyerProtectedRoute>
                          <BuyerOrderTracking />
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
              </CurrencyProvider>
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
              <div className="min-h-screen flex items-center justify-center bg-[#0a0a12] relative overflow-hidden">
                {/* Grid pattern background */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(99, 102, 241, 0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                  }}
                />
                
                {/* Top gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-purple-600/10 via-purple-600/5 to-transparent" />
                
                {/* Animated glow circles */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
                
                <div className="text-center max-w-lg p-8 relative z-10">
                  {/* Enhanced Logo/Icon with glow */}
                  <div className="w-28 h-28 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/40 ring-2 ring-white/10 ring-offset-4 ring-offset-[#0a0a12]">
                    <span className="text-6xl">🚀</span>
                  </div>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-sm font-medium">Available for Registration</span>
                  </div>
                  
                  <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
                    {requestedSubdomain}
                  </h1>
                  <p className="text-xl text-purple-300 mb-2 font-medium">
                    .smmpilot.online
                  </p>
                  <p className="text-slate-400 mb-10 leading-relaxed">
                    This subdomain is not yet configured. Be the first to claim it and start your SMM business today.
                  </p>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => window.location.href = `https://smmpilot.online/auth?subdomain=${requestedSubdomain}`}
                      className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">✨</span>
                      Claim This Subdomain
                    </button>
                    <button 
                      onClick={() => window.location.href = "https://smmpilot.online"}
                      className="flex items-center justify-center gap-2 w-full px-8 py-4 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-white/5 hover:border-slate-600 transition-all duration-300"
                    >
                      Learn More About SMMPilot
                    </button>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-slate-800/50">
                    <p className="text-sm text-slate-500">
                      Powered by <span className="text-purple-400 font-medium hover:text-purple-300 transition-colors cursor-pointer">SMMPilot</span> — The #1 SMM Panel Platform
                    </p>
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