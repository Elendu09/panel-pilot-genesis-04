import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Settings, 
  Package,
  Menu,
  X,
  LogOut,
  MessageSquare,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { useOnboardingTour } from "@/hooks/use-onboarding-tour";
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
import UserManagement from "./panel/UserManagement";
import APIManagement from "./panel/APIManagement";
import BlogManagement from "./panel/BlogManagement";
import CustomerManagement from "./panel/CustomerManagement";
import PaymentMethods from "./panel/PaymentMethods";
import SecuritySettings from "./panel/SecuritySettings";
import MoreMenu from "./panel/MoreMenu";
import Billing from "./panel/Billing";
import Integrations from "./panel/Integrations";
import { Helmet } from "react-helmet-async";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LowBalanceAlert } from "@/components/panel/LowBalanceAlert";

const PanelOwnerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : '';
  const { profile, signOut } = useAuth();
  const { isOpen: tourOpen, completeTour, restartTour } = useOnboardingTour();

  const mainNavigation = [
    { name: 'Dashboard', href: '/panel', icon: LayoutDashboard },
    { name: 'Services', href: '/panel/services', icon: Package },
    { name: 'Orders', href: '/panel/orders', icon: ShoppingCart, badge: 3 },
    { name: 'Customers', href: '/panel/customers', icon: Users },
    { name: 'Analytics', href: '/panel/analytics', icon: BarChart3 },
  ];

  const settingsNavigation = [
    { name: 'Providers', href: '/panel/providers', icon: Plug },
    { name: 'Payments', href: '/panel/payments', icon: CreditCard },
    { name: 'API', href: '/panel/api', icon: Code },
    { name: 'Blog', href: '/panel/blog', icon: FileText },
    { name: 'Domain', href: '/panel/domain', icon: Globe },
    { name: 'Design', href: '/panel/design', icon: Palette },
    { name: 'Security', href: '/panel/security', icon: Shield },
    { name: 'Settings', href: '/panel/settings', icon: Settings },
  ];

  const supportNavigation = [
    { name: 'Support', href: '/panel/support', icon: MessageSquare },
  ];

  const bottomNavItems = [
    { name: 'Home', href: '/panel', icon: LayoutDashboard },
    { name: 'Services', href: '/panel/services', icon: Package },
    { name: 'Orders', href: '/panel/orders', icon: ShoppingCart, badge: 3 },
    { name: 'Analytics', href: '/panel/analytics', icon: BarChart3 },
    { name: 'More', href: '/panel/more', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
  };

  const NavItem = ({ item, collapsed }: { item: typeof mainNavigation[0], collapsed: boolean }) => (
    <Link
      to={item.href}
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
        <title>Panel Dashboard | SMMPilot</title>
        <meta name="description" content="Manage services, clients, payments, domains, and panel settings." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      {/* Low Balance Alert - Only show when balance is actually low */}
      {/* Removed for now - will be data-driven in future */}

      {/* Glassmorphic Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col glass-sidebar transition-all duration-300 relative z-20",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-4 border-b border-sidebar-border/50">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.div
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="text-base font-bold text-foreground">SMMPilot</h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Panel Manager</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mini"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 mx-auto"
                >
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search... ⌘K"
                    className="pl-9 bg-sidebar-accent/50 border-sidebar-border/50 h-9 text-sm"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
          {/* Main */}
          <div className="space-y-1">
            {sidebarOpen && (
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Main
              </p>
            )}
            {mainNavigation.map((item) => (
              <NavItem key={item.name} item={item} collapsed={!sidebarOpen} />
            ))}
          </div>

          {/* Settings */}
          <div className="space-y-1">
            {sidebarOpen && (
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Configuration
              </p>
            )}
            {settingsNavigation.map((item) => (
              <NavItem key={item.name} item={item} collapsed={!sidebarOpen} />
            ))}
          </div>

          {/* Support */}
          <div className="space-y-1">
            {sidebarOpen && (
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Help
              </p>
            )}
            {supportNavigation.map((item) => (
              <NavItem key={item.name} item={item} collapsed={!sidebarOpen} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border/50 space-y-3">
          {/* Quick Stats */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-3 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Today's Revenue</span>
                  <span className="font-semibold text-primary">$1,234</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Active Orders</span>
                  <span className="font-semibold">23</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Card */}
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors cursor-pointer",
            !sidebarOpen && "justify-center p-3"
          )}>
            <Avatar className="w-9 h-9 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {profile?.full_name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.full_name || 'Panel Owner'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={cn(
            "flex items-center gap-2",
            !sidebarOpen && "flex-col"
          )}>
            <NotificationCenter />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={restartTour}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              title="Restart Tour"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground ml-auto"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
            <Route path="more" element={<MoreMenu />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav items={bottomNavItems} showFab />

      {/* Onboarding Tour */}
      <OnboardingTour isOpen={tourOpen} onComplete={completeTour} />
    </div>
  );
};

export default PanelOwnerDashboard;
