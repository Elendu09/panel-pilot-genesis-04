import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Settings, 
  Package,
  LogOut,
  Globe,
  BarChart3,
  Users,
  ShoppingCart,
  Palette,
  Plug,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Code,
  FileText,
  HelpCircle,
  CreditCard,
  Shield
} from "lucide-react";
import { usePendingOrders } from "@/hooks/use-pending-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { useOnboardingTour } from "@/contexts/OnboardingTourContext";
import { PanelSearchCommand, usePanelSearch } from "@/components/panel/PanelSearchCommand";
import ProviderManagement from "./panel/ProviderManagement";
import GeneralSettings from "./panel/GeneralSettings";
import DesignCustomization from "./panel/DesignCustomization";
import Analytics from "./panel/Analytics";
import SupportCenter from "./panel/SupportCenter";
import { useAuth } from '@/contexts/AuthContext';
import PanelOverview from "./panel/PanelOverview";
import DomainSettings from "./panel/DomainSettings";
import ServicesManagement from "./panel/ServicesManagement";
import OrdersManagement from "./panel/OrdersManagement";
import APIManagement from "./panel/APIManagement";
import BlogManagement from "./panel/BlogManagement";
import CustomerManagement from "./panel/CustomerManagement";
import PaymentMethods from "./panel/PaymentMethods";
import SecuritySettings from "./panel/SecuritySettings";
import MoreMenu from "./panel/MoreMenu";
import Billing from "./panel/Billing";
import Integrations from "./panel/Integrations";
import TeamManagement from "./panel/TeamManagement";
import { Helmet } from "react-helmet-async";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";

const PanelOwnerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarStats, setSidebarStats] = useState({ todayRevenue: 0, activeOrders: 0 });
  const location = useLocation();
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : '';
  const { profile, signOut } = useAuth();
  const { isOpen: tourOpen, completeTour, restartTour } = useOnboardingTour();
  const { pendingCount } = usePendingOrders();
  const { panel } = usePanel();
  const { open: searchOpen, setOpen: setSearchOpen } = usePanelSearch();

  // Fetch real sidebar stats
  useEffect(() => {
    const fetchSidebarStats = async () => {
      if (!panel?.id) return;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Today's revenue from orders
        const { data: todayOrders } = await supabase
          .from('orders')
          .select('price')
          .eq('panel_id', panel.id)
          .gte('created_at', today.toISOString());

        const todayRevenue = todayOrders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0;

        // Active orders (pending + in_progress)
        const { data: activeOrders } = await supabase
          .from('orders')
          .select('id')
          .eq('panel_id', panel.id)
          .in('status', ['pending', 'in_progress']);

        setSidebarStats({
          todayRevenue,
          activeOrders: activeOrders?.length || 0
        });
      } catch (error) {
        console.error('Error fetching sidebar stats:', error);
      }
    };

    fetchSidebarStats();
    // Refresh every 60 seconds
    const interval = setInterval(fetchSidebarStats, 60000);
    return () => clearInterval(interval);
  }, [panel?.id]);

  const mainNavigation = [
    { name: 'Dashboard', href: '/panel', icon: LayoutDashboard, tourId: 'overview' },
    { name: 'Services', href: '/panel/services', icon: Package, tourId: 'services' },
    { name: 'Orders', href: '/panel/orders', icon: ShoppingCart, badge: pendingCount > 0 ? pendingCount : undefined, tourId: 'orders' },
    { name: 'Customers', href: '/panel/customers', icon: Users, tourId: 'customers' },
    { name: 'Analytics', href: '/panel/analytics', icon: BarChart3, tourId: 'analytics' },
  ];

  const settingsNavigation = [
    { name: 'Providers', href: '/panel/providers', icon: Plug, tourId: 'providers' },
    { name: 'Payments', href: '/panel/payments', icon: CreditCard, tourId: 'payments' },
    { name: 'Team', href: '/panel/team', icon: Users, tourId: 'team' },
    { name: 'API', href: '/panel/api', icon: Code, tourId: 'api' },
    { name: 'Blog', href: '/panel/blog', icon: FileText, tourId: 'blog' },
    { name: 'Domain', href: '/panel/domain', icon: Globe, tourId: 'domain' },
    { name: 'Design', href: '/panel/design', icon: Palette, tourId: 'design' },
    { name: 'Security', href: '/panel/security', icon: Shield, tourId: 'security' },
    { name: 'Settings', href: '/panel/settings', icon: Settings, tourId: 'settings' },
  ];

  const supportNavigation = [
    { name: 'Support', href: '/panel/support', icon: HelpCircle, tourId: 'support' },
  ];

  const bottomNavItems = [
    { name: 'Home', href: '/panel', icon: LayoutDashboard, tourId: 'mobile-home' },
    { name: 'Services', href: '/panel/services', icon: Package, tourId: 'mobile-services' },
    { name: 'Orders', href: '/panel/orders', icon: ShoppingCart, badge: pendingCount > 0 ? pendingCount : undefined, tourId: 'mobile-orders' },
    { name: 'Analytics', href: '/panel/analytics', icon: BarChart3, tourId: 'mobile-analytics' },
    { name: 'More', href: '/panel/more', icon: Settings, tourId: 'mobile-more' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
  };

  const NavItem = ({ item, collapsed }: { item: typeof mainNavigation[0], collapsed: boolean }) => (
    <Link
      to={item.href}
      data-tour={item.tourId}
      className={cn(
        "nav-item group relative",
        isActive(item.href) && "active"
      )}
    >
      <item.icon className={cn(
        "w-5 h-5 shrink-0 transition-transform duration-200",
        isActive(item.href) && "scale-110"
      )} />
      
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>

      {item.badge && !collapsed && (
        <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 h-5 animate-pulse">
          {item.badge}
        </Badge>
      )}

      {item.badge && collapsed && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg border border-border">
          {item.name}
        </div>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Helmet>
        <title>Panel Dashboard | HomeOfSMM</title>
        <meta name="description" content="Manage services, clients, payments, domains, and panel settings." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      {/* Glassmorphic Sidebar */}
      <aside 
        data-tour="sidebar"
        className={cn(
          "hidden md:flex flex-col glass-sidebar transition-all duration-300 relative z-20",
          sidebarOpen ? "w-64" : "w-20"
        )}>
        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-3 border-b border-sidebar-border/50">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.div
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="text-sm font-bold text-foreground">SMMPilot</h2>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Panel Manager</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mini"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 mx-auto"
                >
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
            >
              {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Search */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-full relative flex items-center"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <div className="w-full pl-9 pr-3 py-2 bg-sidebar-accent/50 border border-sidebar-border/50 rounded-md text-sm text-muted-foreground text-left hover:bg-sidebar-accent/70 transition-colors">
                    Search... <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">⌘K</kbd>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation with ScrollArea */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-4">
            {/* Main */}
            <div className="space-y-0.5">
              {sidebarOpen && (
                <p className="px-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Main
                </p>
              )}
              {mainNavigation.map((item) => (
                <NavItem key={item.name} item={item} collapsed={!sidebarOpen} />
              ))}
            </div>

            {/* Settings */}
            <div className="space-y-0.5">
              {sidebarOpen && (
                <p className="px-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Configuration
                </p>
              )}
              {settingsNavigation.map((item) => (
                <NavItem key={item.name} item={item} collapsed={!sidebarOpen} />
              ))}
            </div>

            {/* Support */}
            <div className="space-y-0.5">
              {sidebarOpen && (
                <p className="px-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Help
                </p>
              )}
              {supportNavigation.map((item) => (
                <NavItem key={item.name} item={item} collapsed={!sidebarOpen} />
              ))}
            </div>
          </nav>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="mt-auto p-2 border-t border-sidebar-border/50 space-y-2 bg-sidebar/95 backdrop-blur-sm sticky bottom-0">
          {/* Quick Stats */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-2 space-y-1"
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground">Today's Revenue</span>
                  <span className="font-semibold text-primary">${sidebarStats.todayRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground">Active Orders</span>
                  <span className="font-semibold">{sidebarStats.activeOrders}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Card */}
          <div className={cn(
            "flex items-center gap-2 p-1.5 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors cursor-pointer",
            !sidebarOpen && "justify-center p-2"
          )}>
            <Avatar className="w-7 h-7 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {profile?.full_name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{profile?.full_name || 'Panel Owner'}</p>
                <p className="text-[9px] text-muted-foreground truncate">{profile?.email}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={cn(
            "flex items-center gap-1",
            !sidebarOpen && "flex-col"
          )}>
            <NotificationCenter />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={restartTour}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Restart Tour"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden glass border-b border-border/50 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold">SMMPilot</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter variant="sheet" />
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-auto bg-mesh">
          <Routes>
            <Route index element={<PanelOverview />} />
            <Route path="services" element={<ServicesManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="providers" element={<ProviderManagement />} />
            <Route path="domain" element={<DomainSettings />} />
            <Route path="design" element={<DesignCustomization />} />
            <Route path="settings" element={<GeneralSettings />} />
            <Route path="support" element={<SupportCenter />} />
            <Route path="api" element={<APIManagement />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="payments" element={<PaymentMethods />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="billing" element={<Billing />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="more" element={<MoreMenu />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav items={bottomNavItems} showFab />

      {/* Onboarding Tour */}
      <OnboardingTour isOpen={tourOpen} onComplete={completeTour} />

      {/* Panel Search Command */}
      <PanelSearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default PanelOwnerDashboard;
