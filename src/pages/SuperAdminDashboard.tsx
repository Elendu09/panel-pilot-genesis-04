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
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import PanelManagement from "./admin/PanelManagement";
import UserManagement from "./admin/UserManagement";
import PlatformSettings from "./admin/PlatformSettings";
import AdminOverview from "./admin/AdminOverview";
import { Helmet } from "react-helmet-async";

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : '';

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Panel Management', href: '/admin/panels', icon: BarChart3 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
    { name: 'Security', href: '/admin/security', icon: Shield },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
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
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r border-border transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
              <h2 className="text-lg font-semibold">Super Admin</h2>
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
          >
            <LogOut className="w-4 h-4 mr-3" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="panels" element={<PanelManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<PlatformSettings />} />
          <Route path="security" element={<div>Security Settings (Coming Soon)</div>} />
          <Route path="payments" element={<div>Payment Management (Coming Soon)</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;