import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  Shield,
  CreditCard,
  FileText,
  DollarSign,
  MessageSquare,
  Crown,
  LogOut,
  ChevronRight,
  Sparkles,
  Webhook,
  Activity
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const AdminMoreMenu = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const menuCategories = [
    {
      title: 'Management',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-blue-600',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Panel Management', href: '/admin/panels', icon: BarChart3 },
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Subscriptions', href: '/admin/subscriptions', icon: Crown }
      ]
    },
    {
      title: 'Finance',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      items: [
        { name: 'Revenue Analytics', href: '/admin/revenue', icon: DollarSign },
        { name: 'Payments', href: '/admin/payments', icon: CreditCard }
      ]
    },
    {
      title: 'System',
      icon: Shield,
      color: 'from-violet-500 to-violet-600',
      items: [
        { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
        { name: 'Security', href: '/admin/security', icon: Shield },
        { name: 'Support Tickets', href: '/admin/tickets', icon: MessageSquare },
        { name: 'Webhooks', href: '/admin/webhooks', icon: Webhook },
        { name: 'System Health', href: '/admin/system', icon: Activity },
        { name: 'Audit Logs', href: '/admin/logs', icon: FileText }
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20"
    >
      <Helmet>
        <title>More - Admin Dashboard</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold">More</h1>
        <p className="text-muted-foreground">All admin features and settings</p>
      </motion.div>

      {/* User Profile Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {profile?.full_name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
              <Badge className="mt-1 bg-red-500/20 text-red-400">
                <Shield className="w-3 h-3 mr-1" />
                Super Admin
              </Badge>
            </div>
            <ThemeToggle />
          </CardContent>
        </Card>
      </motion.div>

      {/* Kanban-style Menu Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {menuCategories.map((category) => {
          const CategoryIcon = category.icon;
          
          return (
            <motion.div key={category.title} variants={itemVariants}>
              <Card className="glass-card h-full">
                {/* Category Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-gradient-to-br", category.color)}>
                      <CategoryIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{category.items.length} items</p>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Category Items */}
                <CardContent className="space-y-2">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                          active 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-accent/50"
                        )}
                      >
                        <Icon className={cn(
                          "w-5 h-5",
                          active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        <span className={cn(
                          "flex-1 text-sm font-medium",
                          !active && "group-hover:text-foreground"
                        )}>
                          {item.name}
                        </span>
                        <ChevronRight className={cn(
                          "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity",
                          active && "opacity-100"
                        )} />
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-500"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
            <Link
              to="/admin/settings"
              className="flex items-center gap-3 p-4 rounded-xl bg-accent/50 hover:bg-accent transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminMoreMenu;
