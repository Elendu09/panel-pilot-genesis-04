import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingTourProvider } from "@/contexts/OnboardingTourContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

// Lazy load all pages for smaller initial bundle
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load non-critical routes for better TTI
const Services = lazy(() => import("./pages/Services"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const PanelOwnerDashboard = lazy(() => import("./pages/PanelOwnerDashboard"));
const PanelOnboarding = lazy(() => import("./pages/panel/PanelOnboarding"));
const PanelOnboardingV2 = lazy(() => import("./pages/panel/PanelOnboardingV2"));
const NewOrder = lazy(() => import("./pages/NewOrder"));
const OrderManagement = lazy(() => import("./pages/OrderManagement"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const DocsHub = lazy(() => import("./pages/docs/DocsHub"));
const DocsArticlePage = lazy(() => import("./pages/docs/DocsArticlePage"));
const Contact = lazy(() => import("./pages/Contact"));
const Storefront = lazy(() => import("./pages/Storefront"));
const StorefrontPreview = lazy(() => import("./pages/StorefrontPreview"));
const ThemeOne = lazy(() => import("./components/themes/ThemeOne").then(m => ({ default: m.ThemeOne })));
const ThemeTwo = lazy(() => import("./components/themes/ThemeTwo").then(m => ({ default: m.ThemeTwo })));
const ThemeThree = lazy(() => import("./components/themes/ThemeThree").then(m => ({ default: m.ThemeThree })));
const UserHome = lazy(() => import("./pages/UserHome"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const About = lazy(() => import("./pages/About"));
const Tutorial = lazy(() => import("./pages/Tutorial"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Auth = lazy(() => import("./pages/Auth"));
const FastOrder = lazy(() => import("./pages/FastOrder"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Sitemap = lazy(() => import("./pages/Sitemap"));

// Minimal loading fallback for lazy routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Enhanced QueryClient with caching for faster page loads
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch when user focuses window
      retry: 1, // Only retry failed requests once
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <ThemeProvider defaultTheme="dark" storageKey="smm-panel-theme">
            <AuthProvider>
              <OnboardingTourProvider>
                <TooltipProvider>
                <Toaster />
                <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/theme-one" element={<ThemeOne />} />
                  <Route path="/theme-two" element={<ThemeTwo />} />
                  <Route path="/theme-three" element={<ThemeThree />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/docs" element={<DocsHub />} />
                  <Route path="/docs/:category/:slug" element={<DocsArticlePage />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/new-order" element={<NewOrder />} />
                  <Route path="/fast-order" element={<FastOrder />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/orders" element={<OrderManagement />} />
                  <Route path="/user-home" element={<UserHome />} />
                  
                  {/* Admin Portal - Super Admin Dashboard */}
                  <Route path="/admin/*" element={
                    <ProtectedRoute requiredRole="admin">
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Panel Management - Panel Owner Dashboard */}
                  <Route path="/panel/onboarding" element={
                    <ProtectedRoute requiredRole="panel_owner">
                      <PanelOnboardingV2 />
                    </ProtectedRoute>
                  } />
                  <Route path="/panel/onboarding-legacy" element={
                    <ProtectedRoute requiredRole="panel_owner">
                      <PanelOnboarding />
                    </ProtectedRoute>
                  } />
                  <Route path="/panel/*" element={
                    <ProtectedRoute requiredRole="panel_owner">
                      <PanelOwnerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/tutorial" element={<Tutorial />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/sitemap.xml" element={<Sitemap />} />
                  
                  {/* Public storefront route */}
                  <Route path="/store" element={<Storefront />} />
                  
                  {/* Design Preview Route */}
                  <Route path="/preview/:previewId" element={<StorefrontPreview />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
                </TooltipProvider>
              </OnboardingTourProvider>
            </AuthProvider>
          </ThemeProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
