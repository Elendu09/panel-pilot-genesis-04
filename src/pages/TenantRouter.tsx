import { useState, useEffect, useMemo } from 'react';
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
import App from '../App';

// CRITICAL: Set initial branding immediately based on domain
// This prevents "HOME OF SMM" from flashing on tenant domains
(function setInitialBranding() {
  if (typeof window === 'undefined') return;
  const hostname = window.location.hostname.toLowerCase();
  const hostnameWithoutWww = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  
  // Check if platform domain
  const platformDomains = ['homeofsmm.com', 'smmpilot.online'];
  const isPlatform = platformDomains.some(d => hostnameWithoutWww === d);
  
  // Check if development/preview domain
  const isDevDomain = hostname.includes('lovableproject.com') || 
                       hostname.includes('lovable.app') || 
                       hostname === 'localhost' ||
                       hostname.startsWith('localhost:');
  
  if (isPlatform) {
    document.title = 'HOME OF SMM - Advanced SMM Panel Platform';
  } else if (!isDevDomain) {
    // TENANT DOMAIN - Remove ALL platform branding immediately
    
    // 1. Set neutral title based on subdomain or hostname
    const parts = hostname.split('.');
    let tenantName = 'SMM Panel';
    
    // Check for subdomain pattern (xxx.homeofsmm.com, xxx.smmpilot.online)
    const isSubdomain = platformDomains.some(d => hostname.endsWith(`.${d}`));
    if (isSubdomain && parts.length > 2) {
      tenantName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } else if (!isSubdomain) {
      // Custom domain - use first part of hostname
      tenantName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    
    document.title = `${tenantName} - Loading...`;
    
    // 2. Remove ALL existing favicons (prevents platform favicon flash)
    document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
    
    // 3. Add neutral default favicon immediately
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = '/default-panel-favicon.png';
    document.head.appendChild(favicon);
    
    // 4. Remove any platform-specific meta tags
    document.querySelectorAll('meta[property="og:title"], meta[property="og:site_name"], meta[name="title"]').forEach(el => {
      const content = el.getAttribute('content') || '';
      if (content.toLowerCase().includes('home of smm') || content.toLowerCase().includes('homeofsmm')) {
        el.remove();
      }
    });
    
    // 5. Hide body briefly to prevent any visual flash (will be shown once React renders)
    document.documentElement.style.visibility = 'hidden';
  }
})();

// Buyer pages
import BuyerDashboard from './buyer/BuyerDashboard';
import BuyerServices from './buyer/BuyerServices';
import BuyerNewOrder from './buyer/BuyerNewOrder';
import BuyerOrders from './buyer/BuyerOrders';
import BuyerOrderTracking from './buyer/BuyerOrderTracking';
import BuyerProfile from './buyer/BuyerProfile';
import BuyerAuth from './buyer/BuyerAuth';
import BuyerDeposit from './buyer/BuyerDeposit';
import BuyerSupport from './buyer/BuyerSupport';
import BuyerPublicServices from './buyer/BuyerPublicServices';
import BuyerFavorites from './buyer/BuyerFavorites';
import BuyerPrivacy from './buyer/BuyerPrivacy';
import BuyerTerms from './buyer/BuyerTerms';
import BuyerAPI from './buyer/BuyerAPI';
import BuyerContact from './buyer/BuyerContact';
import BuyerBlog from './buyer/BuyerBlog';
import BuyerBlogPost from './buyer/BuyerBlogPost';
import Storefront from './Storefront';
import StorefrontBlog from './storefront/StorefrontBlog';
import FastOrder from './FastOrder';
import BuyerBulkOrder from './buyer/BuyerBulkOrder';
import TrackOrder from './TrackOrder';
import Sitemap from './Sitemap';
import RobotsTxt from './RobotsTxt';
import TeamAuth from './buyer/TeamAuth';
import TeamDashboard from './panel/TeamDashboard';

const queryClient = new QueryClient();

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
    return <App />;
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

  // Always set default favicon for tenant domains and make document visible
  useEffect(() => {
    if (isTenantDomain && typeof document !== 'undefined') {
      // Make document visible (was hidden by index.html script to prevent branding flash)
      document.documentElement.style.visibility = 'visible';
      document.documentElement.style.opacity = '1';
      
      const faviconUrl = '/default-panel-favicon.png';
      
      // Remove existing favicons
      document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
      
      // Add default favicon
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/png';
      favicon.href = faviconUrl;
      document.head.appendChild(favicon);
      
      // Add apple touch icon with proper 180x180 size
      const appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.sizes = '180x180';
      appleIcon.href = '/default-panel-apple-touch-icon.png';
      document.head.appendChild(appleIcon);
    }
  }, [isTenantDomain]);

  // Set early title for tenant domains based on subdomain
  useEffect(() => {
    if (isTenantDomain && !panel) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const subdomain = hostname.split('.')[0];
      if (subdomain && subdomain !== 'www') {
        // Set a subdomain-based title early, before panel loads
        document.title = `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} - SMM Panel`;
      }
    }
  }, [isTenantDomain, panel]);

  // Show centered logo + shimmer for tenant domains during loading - prevents blank screen
  if (loading && !loadingTimeout) {
    // For platform domains, render App immediately (optimistic)
    if (isPlatformDomain) {
      return <App />;
    }
    // For tenant domains, show completely neutral loading screen (no branding)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          {/* Neutral loading with shimmer - no text, just visual indicator */}
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
    return <App />;
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
          <ThemeProvider defaultTheme="dark" storageKey="smm-panel-theme">
            <TooltipProvider>
              <CurrencyProvider>
                <Toaster />
                <Sonner />
                <LanguageProvider>
                  <BuyerAuthProvider panelId={panel.id}>
                    <BuyerThemeProvider panelId={panel.id} defaultThemeMode={panelDefaultTheme}>
                      <BrowserRouter>
                        <Routes>
                          {/* PUBLIC routes - Storefront accessible without login */}
                          <Route path="/" element={<Storefront />} />
                          <Route path="/auth" element={<BuyerAuth />} />
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
  return <App />;
};

export default TenantRouter;