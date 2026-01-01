import { useState } from "react";
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
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
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
import { Helmet } from "react-helmet-async";

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : '';

  // Grouped navigation for better organization
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
        { name: 'Panels', href: '/admin/panels', icon: BarChart3 },
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
      ]
    },
    {
      label: 'Communication',
      items: [
        { name: 'Tickets', href: '/admin/tickets', icon: MessageSquare },
        { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
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

  // Flat navigation for legacy compatibility
  const navigation = navigationGroups.flatMap(g => g.items);

  const bottomNavItems = [
    { name: 'Home', href: '/admin', icon: LayoutDashboard },
    { name: 'Panels', href: '/admin/panels', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Revenue', href: '/admin/revenue', icon: DollarSign },
    { name: 'More', href: '/admin/more', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      <Helmet>
        <title>Admin Dashboard | HomeOfSMM Platform</title>
        <meta name="description" content="Super Admin console to manage panels, users, revenue and platform settings." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      {/* Sidebar */}
      <div className={`hidden md:block ${sidebarOpen ? 'w-72' : 'w-24'} bg-card border-r border-border transition-all duration-300 relative`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className={`${sidebarOpen ? 'flex' : 'hidden'} items-center gap-3`}>
              <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-base font-semibold leading-tight">Super Admin</h2>
                <p className="text-xs text-muted-foreground">System Control</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        <nav className={`px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] ${sidebarOpen ? '' : 'pt-4'}`}>
          {sidebarOpen ? (
            // Grouped navigation when sidebar is open
            navigationGroups.map((group, groupIndex) => (
              <div key={group.label} className="mb-4">
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    title={item.name}
                    className={`group flex items-center rounded-lg transition-colors justify-start px-3 py-2 gap-3 ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                ))}
                {groupIndex < navigationGroups.length - 1 && <Separator className="my-2" />}
              </div>
            ))
          ) : (
            // Flat icons when collapsed
            navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                title={item.name}
                className={`group flex items-center rounded-lg transition-colors justify-center px-0 py-3 ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <item.icon className="w-7 h-7 shrink-0" />
              </Link>
            ))
          )}
        </nav>

        <div className="absolute bottom-4 left-3 right-3">
          <Button
            variant="ghost"
            onClick={async () => {
              await signOut();
              navigate('/auth');
            }}
            className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} text-muted-foreground hover:text-foreground hover:text-destructive`}
          >
            <LogOut className={`${sidebarOpen ? 'w-4 h-4 mr-3' : 'w-6 h-6'} `} />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
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
          <Route path="more" element={<AdminMoreMenu />} />
        </Routes>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav items={bottomNavItems} />
    </div>
  );
};

export default SuperAdminDashboard;
