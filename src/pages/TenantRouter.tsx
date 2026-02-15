import { useState, useEffect, useMemo, lazy, Suspense, memo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import { analyzeDomain, PLATFORM_DOMAIN, ALL_PLATFORM_DOMAINS } from '@/lib/tenant-domain-config';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { ThemeProvider } from "@/hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BuyerAuthProvider } from '@/contexts/BuyerAuthContext';
import { BuyerThemeProvider } from '@/contexts/BuyerThemeContext';
import { BuyerProtectedRoute } from '@/components/buyer/BuyerProtectedRoute';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Rocket, Sparkles } from 'lucide-react';

// Lazy load App to reduce initial bundle for tenant domains
const App = lazy(() => import('../App'));

// No IIFE branding hack needed - index.html is now clean with neutral fallback.
// React Helmet in Index.tsx and TenantHead.tsx handle all SEO.

// Lazy load buyer pages for code splitting
const BuyerDashboard = lazy(() => import('./buyer/BuyerDashboard'));
const BuyerServices = lazy(() => import('./buyer/BuyerServices'));
const BuyerNewOrder = lazy(() => import('./buyer/BuyerNewOrder'));
const BuyerOrders = lazy(() => import('./buyer/BuyerOrders'));
const BuyerOrderTracking = lazy(() => import('./buyer/BuyerOrderTracking'));
const BuyerProfile = lazy(() => import('./buyer/BuyerProfile'));
const BuyerAuth = lazy(() => import('./buyer/BuyerAuth'));
const BuyerOAuthCallback = lazy(() => import('./buyer/BuyerOAuthCallback'));
const BuyerDeposit = lazy(() => import('./buyer/BuyerDeposit'));
const BuyerSupport = lazy(() => import('./buyer/BuyerSupport'));
const BuyerPublicServices = lazy(() => import('./buyer/BuyerPublicServices'));
const BuyerFavorites = lazy(() => import('./buyer/BuyerFavorites'));
const BuyerPrivacy = lazy(() => import('./buyer/BuyerPrivacy'));
const BuyerTerms = lazy(() => import('./buyer/BuyerTerms'));
const BuyerAPI = lazy(() => import('./buyer/BuyerAPI'));
const BuyerContact = lazy(() => import('./buyer/BuyerContact'));
const BuyerBlog = lazy(() => import('./buyer/BuyerBlog'));
const BuyerBlogPost = lazy(() => import('./buyer/BuyerBlogPost'));
const Storefront = lazy(() => import('./Storefront'));
const StorefrontBlog = lazy(() => import('./storefront/StorefrontBlog'));
const FastOrder = lazy(() => import('./FastOrder'));
const BuyerBulkOrder = lazy(() => import('./buyer/BuyerBulkOrder'));
const TrackOrder = lazy(() => import('./TrackOrder'));
const Sitemap = lazy(() => import('./Sitemap'));
const RobotsTxt = lazy(() => import('./RobotsTxt'));
const TeamAuth = lazy(() => import('./buyer/TeamAuth'));
const TeamDashboard = lazy(() => import('./panel/TeamDashboard'));
const BuyerAbout = lazy(() => import('./buyer/BuyerAbout'));

// Minimal loader for lazy routes - optimized for performance
const PageLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label="Loading" />
  </div>
));
PageLoader.displayName = 'PageLoader';

// Memoize QueryClient to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * TenantRouter determines if we should show the storefront/buyer dashboard or the main app
 * based on the current domain and tenant detection.
 * 
 * DOMAIN ROUTING LOGIC:
 * 1. Platform domains (homeofsmm.com, www.homeofsmm.com) → Main App
 * 2. Development/preview domains (*.lovableproject.com, localhost) → Main App
 * 3. Tenant subdomains (*.homeofsmm.com) → Buyer Dashboard
 * 4. Custom domains (verified in panel_domains) → Buyer Dashboard
 * 5. External hosting domains (*.netlify.app, etc.) → Buyer Dashboard (if configured)
 */
const TenantRouter = () => {
  // Synchronous domain detection - runs immediately before any async operations
  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const domainConfig = useMemo(() => analyzeDomain(hostname), [hostname]);
  const isImmediatelyPlatform = domainConfig.type === 'platform' || domainConfig.type === 'development';
  
  // If we know synchronously it's the platform domain, render App immediately
  // This prevents the main website from briefly showing on subdomain loads
  if (isImmediatelyPlatform) {
    return (
      <Suspense fallback={<PageLoader />}>
        <App />
      </Suspense>
    );
  }
  
  // For tenant domains, proceed with async panel detection
  return <TenantContent />;
};

// Separate component for tenant domain handling
const TenantContent = () => {
  const { panel, loading, error, isTenantDomain, isPlatformDomain, domainConfig, debugInfo } = useTenant();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout for loading state - increased to 15 seconds
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn('[TenantRouter] Loading timeout reached');
        setLoadingTimeout(true);
      }, 15000); // 15 second timeout
      return () => clearTimeout(timer);
    }
    setLoadingTimeout(false);
  }, [loading]);

  // Favicon for tenant domains is handled by TenantHead.tsx via Helmet
  // No visibility hacks needed - index.html is now clean

  // Title is set by TenantHead.tsx via Helmet - no manual DOM manipulation needed

  // Show centered logo + shimmer for tenant domains during loading - prevents blank screen
  if (loading && !loadingTimeout) {
    // For platform domains, render App immediately (optimistic)
    if (isPlatformDomain) {
      return (
        <Suspense fallback={<PageLoader />}>
          <App />
        </Suspense>
      );
    }
    // For tenant domains, show loading screen with default tenant favicon (changeable)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          {/* Default tenant favicon with shimmer overlay */}
          <div className="relative w-16 h-16 mx-auto mb-4">
            <img 
              src="/default-panel-favicon.png" 
              alt="Loading" 
              className="w-16 h-16 rounded-2xl object-contain"
            />
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>
          {/* Shimmer text placeholder - no actual text */}
          <div className="h-4 w-32 mx-auto bg-slate-800 rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </div>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
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
    return (
      <Suspense fallback={<PageLoader />}>
        <App />
      </Suspense>
    );
  }

  // If this is a tenant domain and we found a panel, show PUBLIC storefront first
  if (isTenantDomain && panel) {
    // Favicon is handled globally by the useEffect above
    
    // Get panel owner's default theme mode from custom_branding
    const customBranding = panel.custom_branding as any;
    const panelDefaultTheme: 'light' | 'dark' = customBranding?.themeMode === 'light' ? 'light' : 'dark';

    return (
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
           <ThemeProvider defaultTheme={panelDefaultTheme} storageKey={`smm-tenant-theme-${panel.id}`}>
            <TooltipProvider>
              <CurrencyProvider>
                <Toaster />
                <Sonner />
                <LanguageProvider>
                  <BuyerAuthProvider panelId={panel.id}>
                    <BuyerThemeProvider panelId={panel.id} defaultThemeMode={panelDefaultTheme}>
                      <BrowserRouter>
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            {/* PUBLIC routes - Storefront accessible without login */}
                            <Route path="/" element={<Storefront />} />
                            <Route path="/auth" element={<BuyerAuth />} />
                            <Route path="/auth/callback" element={<BuyerOAuthCallback />} />
                            <Route path="/services" element={<BuyerPublicServices />} />
                            <Route path="/fast-order" element={<FastOrder />} />
                            <Route path="/track-order" element={<TrackOrder />} />
                            <Route path="/privacy" element={<BuyerPrivacy />} />
                            <Route path="/terms" element={<BuyerTerms />} />
                            <Route path="/api" element={<BuyerAPI />} />
                            <Route path="/contact" element={<BuyerContact />} />

                            {/* Blog routes */}
                            <Route path="/blog" element={<BuyerBlog />} />
                            <Route path="/blog/:slug" element={<BuyerBlogPost />} />
                            
                            {/* About page */}
                            <Route path="/about" element={<BuyerAbout />} />

                            {/* Sitemap and robots.txt routes */}
                            <Route path="/sitemap.xml" element={<Sitemap />} />
                            <Route path="/robots.txt" element={<RobotsTxt />} />
                            
                            {/* Protected buyer routes */}
                            <Route path="/dashboard" element={
                              <BuyerProtectedRoute>
                                <BuyerDashboard />
                              </BuyerProtectedRoute>
                            } />
                            <Route path="/new-order" element={
                              <BuyerProtectedRoute>
                                <BuyerNewOrder />
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
                            <Route path="/favorites" element={
                              <BuyerProtectedRoute>
                                <BuyerFavorites />
                              </BuyerProtectedRoute>
                            } />
                            <Route path="/bulk-order" element={
                              <BuyerProtectedRoute>
                                <BuyerBulkOrder />
                              </BuyerProtectedRoute>
                            } />
                            
                            {/* Team member routes */}
                            <Route path="/team-login" element={<TeamAuth />} />
                            <Route path="/team-dashboard" element={<TeamDashboard />} />
                            
                            {/* Catch all - redirect to storefront */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </Suspense>
                      </BrowserRouter>
                    </BuyerThemeProvider>
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
    const platformDomain = PLATFORM_DOMAIN;
    
    return (
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider defaultTheme="dark" storageKey="smm-panel-theme">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Helmet>
                <link rel="icon" type="image/png" href="/default-panel-favicon.png" />
                <title>{requestedSubdomain}.{platformDomain} - Claim This Subdomain</title>
              </Helmet>
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
                    <Rocket className="w-12 h-12 text-emerald-400" />
                  </div>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-sm font-medium">Available for Registration</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                    {requestedSubdomain}
                  </h1>
                  <p className="text-xl text-slate-400 mb-2 font-medium">
                    .{platformDomain}
                  </p>
                  <p className="text-slate-500 mb-10 leading-relaxed">
                    This subdomain is not yet configured. Be the first to claim it and start your SMM business today.
                  </p>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => window.location.href = `https://${platformDomain}/auth?subdomain=${requestedSubdomain}`}
                      className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 hover:-translate-y-0.5 transition-all duration-300 group"
                    >
                      <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Claim This Subdomain
                    </button>
                    <button 
                      onClick={() => window.location.href = `https://${requestedSubdomain}.${platformDomain}`}
                      className="flex items-center justify-center gap-2 w-full px-8 py-4 border border-slate-700 text-slate-400 font-medium rounded-xl hover:bg-white/5 hover:border-slate-600 hover:text-slate-300 transition-all duration-300"
                    >
                      Visit {requestedSubdomain}.{platformDomain}
                    </button>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-slate-800/50">
                    <p className="text-sm text-slate-600">
                      Powered by <span className="text-slate-400 font-medium hover:text-slate-300 transition-colors cursor-pointer">HomeOfSMM</span> — The #1 SMM Panel Platform
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
  return (
    <Suspense fallback={<PageLoader />}>
      <App />
    </Suspense>
  );
};

export default TenantRouter;