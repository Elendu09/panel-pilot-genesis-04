import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Settings, 
  Palette, 
  CreditCard, 
  Users, 
  Package,
  Menu,
  X,
  LogOut,
  MessageSquare,
  Globe,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BottomNav } from "@/components/ui/bottom-nav";
import ProviderManagement from "./panel/ProviderManagement";
import GeneralSettings from "./panel/GeneralSettings";
import PaymentMethods from "./panel/PaymentMethods";
import DesignCustomization from "./panel/DesignCustomization";
import UserManagement from "./panel/UserManagement";
import Analytics from "./panel/Analytics";
import SupportCenter from "./panel/SupportCenter";
import { useAuth } from '@/contexts/AuthContext';
import PanelOverview from "./panel/PanelOverview";
import DomainSettings from "./panel/DomainSettings";
import { Helmet } from "react-helmet-async";

const PanelOwnerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : '';

  const navigation = [
    { name: 'Dashboard', href: '/panel', icon: LayoutDashboard },
    { name: 'Services', href: '/panel/services', icon: Package },
    { name: 'Orders', href: '/panel/orders', icon: CreditCard },
    { name: 'Customers', href: '/panel/customers', icon: Users },
    { name: 'Analytics', href: '/panel/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/panel/settings', icon: Settings },
    { name: 'Domain', href: '/panel/domain', icon: Globe },
    { name: 'Support', href: '/panel/support', icon: MessageSquare },
  ];

  const bottomNavItems = [
    { name: 'Dashboard', href: '/panel', icon: LayoutDashboard },
    { name: 'Services', href: '/panel/services', icon: Package },
    { name: 'Orders', href: '/panel/orders', icon: CreditCard, badge: 3 },
    { name: 'Analytics', href: '/panel/analytics', icon: BarChart3 },
  ];

  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
  };


  return (
    <div className="min-h-screen bg-background flex">
      <Helmet>
        <title>Panel Owner Dashboard | SMMPilot</title>
        <meta name="description" content="Manage services, clients, payments, domains, and panel settings." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      {/* Sidebar */}
      <div className={`hidden md:block ${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r border-border transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className={`${sidebarOpen ? 'block' : 'hidden'} flex items-center gap-2`}>
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Panel Owner</h2>
                <p className="text-xs text-muted-foreground">SMM Manager</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        <Routes>
          <Route index element={<PanelOverview />} />
          <Route path="services" element={<div>Services Management (Coming Soon)</div>} />
          <Route path="orders" element={<div>Orders Management (Coming Soon)</div>} />
          <Route path="customers" element={<div>Customer Management (Coming Soon)</div>} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<GeneralSettings />} />
          <Route path="domain" element={<DomainSettings />} />
          <Route path="support" element={<SupportCenter />} />
        </Routes>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav items={bottomNavItems} />
    </div>
  );
};

export default PanelOwnerDashboard;