import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Users,
  Settings,
  DollarSign,
  Shield,
  MessageSquare,
  Database,
  Bell,
  FileText,
  Crown,
  Activity,
  CreditCard,
  Megaphone,
  Globe,
  HardDrive
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3 },
  { title: "Panel Management", url: "/admin/panels", icon: Crown },
  { title: "User Management", url: "/admin/users", icon: Users },
  { title: "Revenue Analytics", url: "/admin/revenue", icon: DollarSign },
  { title: "Platform Settings", url: "/admin/settings", icon: Settings },
  { title: "Payment Gateways", url: "/admin/payments", icon: Database },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Support System", url: "/admin/support", icon: MessageSquare },
  { title: "Security & Access", url: "/admin/security", icon: Shield },
  { title: "System Health", url: "/admin/system-health", icon: Activity },
  { title: "Domain Management", url: "/admin/domains", icon: Globe },
  { title: "Ads Management", url: "/admin/ads", icon: Megaphone },
  { title: "Backups", url: "/admin/backups", icon: HardDrive },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
];

export function SuperAdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50";

  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            Super Admin
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}