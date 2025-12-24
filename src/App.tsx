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
import Index from "./pages/Index";
import Services from "./pages/Services";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import PanelOwnerDashboard from "./pages/PanelOwnerDashboard";
import PanelOnboarding from "./pages/panel/PanelOnboarding";
import NotFound from "./pages/NotFound";
import NewOrder from "./pages/NewOrder";
import OrderManagement from "./pages/OrderManagement";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Documentation from "./pages/Documentation";
import Contact from "./pages/Contact";
import Storefront from "./pages/Storefront";
import StorefrontPreview from "./pages/StorefrontPreview";
import { ThemeOne } from "./components/themes/ThemeOne";
import { ThemeTwo } from "./components/themes/ThemeTwo";
import { ThemeThree } from "./components/themes/ThemeThree";
import UserHome from "./pages/UserHome";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Tutorial from "./pages/Tutorial";
import Blog from "./pages/Blog";
import Auth from "./pages/Auth";
import SEOSettings from "./pages/panel/SEOSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="smm-panel-theme">
        <AuthProvider>
          <OnboardingTourProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                <Route path="/docs" element={<Documentation />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/new-order" element={<NewOrder />} />
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
                <Route path="/tutorial" element={<Tutorial />} />
                <Route path="/blog" element={<Blog />} />
                
                {/* Public storefront route */}
                <Route path="/store" element={<Storefront />} />
                
                {/* Design Preview Route */}
                <Route path="/preview/:previewId" element={<StorefrontPreview />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </OnboardingTourProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
