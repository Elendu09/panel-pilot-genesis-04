import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
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
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BottomNav } from "@/components/ui/bottom-nav";
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
import { Helmet } from "react-helmet-async";

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : '';

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Panels', href: '/admin/panels', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: Crown },
    { name: 'Revenue', href: '/admin/revenue', icon: DollarSign },
    { name: 'Tickets', href: '/admin/tickets', icon: MessageSquare },
    { name: 'Logs', href: '/admin/logs', icon: FileText },
    { name: 'Security', href: '/admin/security', icon: Shield },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

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
        <title>Admin Dashboard | SMMPilot Platform</title>
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

        <nav className={`px-3 space-y-2 ${sidebarOpen ? '' : 'pt-4'}`}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              title={item.name}
              className={`group flex items-center rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              } ${sidebarOpen ? 'justify-start px-3 py-2 gap-3' : 'justify-center px-0 py-3'}`}
            >
              <item.icon className={`${sidebarOpen ? 'w-5 h-5' : 'w-7 h-7'} shrink-0`} />
              {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 right-3">
          <Button
            variant="ghost"
            className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} text-muted-foreground hover:text-foreground`}
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
          <Route path="subscriptions" element={<SubscriptionManagement />} />
          <Route path="revenue" element={<RevenueAnalytics />} />
          <Route path="tickets" element={<SupportTickets />} />
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
