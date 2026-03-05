import { useState, lazy, Suspense } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  CreditCard,
  Menu,
  X,
  LogOut,
  Crown,
  DollarSign,
  MessageSquare,
  FileText,
  Webhook,
  Server,
  Megaphone,
  Database,
  Download,
  Globe,
  Activity,
  BookOpen,
  Receipt,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import PanelManagement from "./admin/PanelManagement";
import UserManagement from "./admin/UserManagement";
import PlatformSettings from "./admin/PlatformSettings";
import AdminOverview from "./admin/AdminOverview";
import PaymentManagement from "./admin/PaymentManagement";
import SecuritySettings from "./admin/SecuritySettings";
import SubscriptionManagement from "./admin/SubscriptionManagement";
import RevenueAnalytics from "./admin/RevenueAnalytics";
import SupportTickets from "./admin/SupportTickets";
import AuditLogs from "./admin/AuditLogs";
import AdminMoreMenu from "./admin/AdminMoreMenu";
import WebhookManagement from "./admin/WebhookManagement";
import SystemHealth from "./admin/SystemHealth";
import PlatformProviderManagement from "./admin/PlatformProviderManagement";
import AnnouncementsManagement from "./admin/AnnouncementsManagement";
import ReportsExport from "./admin/ReportsExport";
import BackupManagement from "./admin/BackupManagement";
import DomainManagement from "./admin/DomainManagement";
import ReceiptManagement from "./admin/ReceiptManagement";
import BlogManagement from "./admin/BlogManagement";
import DocsManagement from "./admin/DocsManagement";
import { Helmet } from "react-helmet-async";

const AdsManagement = lazy(() => import("./admin/AdsManagement"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : '';

  const navigationGroups = [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'System Health', href: '/admin/system', icon: Activity },
      ]
    },
    {
      label: 'Management',
      items: [
        { name: 'Panels', href: '/admin/panels', icon: BarChart3, badge: undefined as number | undefined },
        { name: 'Ads', href: '/admin/ads', icon: Megaphone },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Domains', href: '/admin/domains', icon: Globe },
        { name: 'Platform Providers', href: '/admin/platform-providers', icon: Server },
      ]
    },
    {
      label: 'Finance',
      items: [
        { name: 'Revenue', href: '/admin/revenue', icon: DollarSign },
        { name: 'Subscriptions', href: '/admin/subscriptions', icon: Crown },
        { name: 'Payments', href: '/admin/payments', icon: CreditCard },
        { name: 'Receipts', href: '/admin/receipts', icon: Receipt },
      ]
    },
    {
      label: 'Communication',
      items: [
        { name: 'Tickets', href: '/admin/tickets', icon: MessageSquare },
        { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
        { name: 'Blog', href: '/admin/blog', icon: BookOpen },
        { name: 'Docs', href: '/admin/docs', icon: FileText },
      ]
    },
    {
      label: 'System',
      items: [
        { name: 'Webhooks', href: '/admin/webhooks', icon: Webhook },
        { name: 'Reports', href: '/admin/reports', icon: Download },
        { name: 'Backups', href: '/admin/backups', icon: Database },
        { name: 'Logs', href: '/admin/logs', icon: FileText },
        { name: 'Security', href: '/admin/security', icon: Shield },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  ];

  const navigation = navigationGroups.flatMap(g => g.items);

  const bottomNavItems = [
    { name: 'Home', href: '/admin', icon: LayoutDashboard },
    { name: 'Panels', href: '/admin/panels', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Revenue', href: '/admin/revenue', icon: DollarSign },
    { name: 'More', href: '/admin/more', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const currentPageName = navigation.find(item => isActive(item.href))?.name || 'Dashboard';

  const SidebarContent = ({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) => (
    <>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="p-3 border-b border-sidebar-border/50">
        <div className="flex items-center justify-between gap-2">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="overflow-hidden">
                  <h2
                    className="text-sm font-bold tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Super Admin
                  </h2>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">System Control</p>
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
                <Shield className="w-4 h-4 text-primary-foreground" />
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (onNavigate) {
                onNavigate();
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            className="hidden md:flex"
            data-testid="button-toggle-sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 [&>[data-radix-scroll-area-viewport]]:pr-1">
        <nav className="p-2 pr-3 space-y-4">
          {navigationGroups.map((group, groupIndex) => (
            <div key={group.label} className="space-y-0.5">
              {!collapsed && (
                <p className="px-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  title={item.name}
                  onClick={onNavigate}
                  data-testid={`link-admin-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    "group relative flex items-center rounded-xl transition-all duration-200",
                    collapsed ? "justify-center px-0 py-3" : "justify-start px-3 py-2.5 gap-3",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "shrink-0 transition-transform duration-200",
                    collapsed ? "w-6 h-6" : "w-5 h-5",
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

                  {'badge' in item && item.badge !== undefined && !collapsed && (
                    <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 h-5">
                      {item.badge}
                    </Badge>
                  )}

                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg border border-border">
                      {item.name}
                    </div>
                  )}
                </Link>
              ))}
              {!collapsed && groupIndex < navigationGroups.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="mt-auto p-2 border-t border-sidebar-border/50 space-y-2 bg-sidebar/95 backdrop-blur-sm sticky bottom-0">
        <div className={cn(
          "flex items-center gap-1",
          collapsed && "flex-col"
        )}>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await signOut();
              navigate('/auth');
            }}
            title="Logout"
            data-testid="button-admin-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background w-full">
      <Helmet>
        <title>Admin Dashboard | HOME OF SMM Platform</title>
        <meta name="description" content="Super Admin console to manage panels, users, revenue and platform settings." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <aside
        className={cn(
          "hidden md:flex flex-col fixed left-0 top-0 h-screen glass-sidebar transition-all duration-300 z-20",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed left-0 top-0 h-screen w-[280px] glass-sidebar z-50 md:hidden flex flex-col"
            >
              <div className="absolute top-3 right-3 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileDrawerOpen(false)}
                  data-testid="button-close-mobile-drawer"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <SidebarContent collapsed={false} onNavigate={() => setMobileDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "md:ml-20"
      )}>
        <header className="md:hidden glass border-b border-border/50 p-3 flex items-center justify-between gap-2 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileDrawerOpen(true)}
              data-testid="button-open-mobile-drawer"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-bold tracking-wide text-sm leading-tight"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Super Admin
                </span>
                <span className="text-[9px] text-muted-foreground leading-tight" data-testid="text-current-page">
                  {currentPageName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto bg-mesh">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route index element={<AdminOverview />} />
                <Route path="panels" element={<PanelManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="domains" element={<DomainManagement />} />
                <Route path="subscriptions" element={<SubscriptionManagement />} />
                <Route path="revenue" element={<RevenueAnalytics />} />
                <Route path="tickets" element={<SupportTickets />} />
                <Route path="webhooks" element={<WebhookManagement />} />
                <Route path="system" element={<SystemHealth />} />
                <Route path="platform-providers" element={<PlatformProviderManagement />} />
                <Route path="announcements" element={<AnnouncementsManagement />} />
                <Route path="reports" element={<ReportsExport />} />
                <Route path="backups" element={<BackupManagement />} />
                <Route path="logs" element={<AuditLogs />} />
                <Route path="settings" element={<PlatformSettings />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="payments" element={<PaymentManagement />} />
                <Route path="receipts" element={<ReceiptManagement />} />
                <Route path="blog" element={<BlogManagement />} />
                <Route path="docs" element={<DocsManagement />} />
                <Route path="ads" element={<AdsManagement />} />
                <Route path="more" element={<AdminMoreMenu />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </main>

      <BottomNav items={bottomNavItems} />
    </div>
  );
};

export default SuperAdminDashboard;
