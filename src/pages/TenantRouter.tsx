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
import { LanguageProvider } from '@/contexts/LanguageContext';
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
import StorefrontBlog from './storefront/StorefrontBlog';

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

  // Show branded loading screen instead of blank page
  if (loading && !loadingTimeout) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    return (
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider defaultTheme="dark" storageKey="smm-panel-theme">
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
              </div>
              
              <div className="relative z-10 text-center">
                {/* Loading animation */}
                <div className="w-16 h-16 mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
                
                <h2 className="text-xl font-semibold text-white mb-2">Loading Panel</h2>
                <p className="text-sm text-slate-400 mb-4">{hostname}</p>
                
                {/* Loading dots */}
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div 
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    );
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
                <LanguageProvider>
                  <BuyerAuthProvider panelId={panel.id}>
                    <BrowserRouter>
                      <Routes>
                        {/* PUBLIC routes - Storefront accessible without login */}
                        <Route path="/" element={<Storefront />} />
                        <Route path="/auth" element={<BuyerAuth />} />
                        <Route path="/services" element={<BuyerPublicServices />} />

                        {/* Tenant blog route */}
                        <Route path="/blog" element={<StorefrontBlog />} />
                        
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
                </LanguageProvider>
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
              <div className="min-h-screen flex items-center justify-center bg-[#0d0d12] relative overflow-hidden">
                {/* Grid pattern background - blue-gray subtle */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                  }}
                />
                
                <div className="text-center max-w-lg p-8 relative z-10">
                  {/* Clean Logo/Icon */}
                  <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-700/50">
                    <span className="text-5xl">🚀</span>
                  </div>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-sm font-medium">Available for Registration</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                    {requestedSubdomain}
                  </h1>
                  <p className="text-xl text-slate-400 mb-2 font-medium">
                    .smmpilot.online
                  </p>
                  <p className="text-slate-500 mb-10 leading-relaxed">
                    This subdomain is not yet configured. Be the first to claim it and start your SMM business today.
                  </p>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => window.location.href = `https://smmpilot.online/auth?subdomain=${requestedSubdomain}`}
                      className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 hover:-translate-y-0.5 transition-all duration-300 group"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">✨</span>
                      Claim This Subdomain
                    </button>
                    <button 
                      onClick={() => window.location.href = `https://${requestedSubdomain}.smmpilot.online`}
                      className="flex items-center justify-center gap-2 w-full px-8 py-4 border border-slate-700 text-slate-400 font-medium rounded-xl hover:bg-white/5 hover:border-slate-600 hover:text-slate-300 transition-all duration-300"
                    >
                      Visit {requestedSubdomain}.smmpilot.online
                    </button>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-slate-800/50">
                    <p className="text-sm text-slate-600">
                      Powered by <span className="text-slate-400 font-medium hover:text-slate-300 transition-colors cursor-pointer">SMMPilot</span> — The #1 SMM Panel Platform
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