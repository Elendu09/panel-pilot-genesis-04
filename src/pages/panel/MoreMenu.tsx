import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plug, 
  CreditCard, 
  Code, 
  FileText, 
  Globe, 
  Palette, 
  Shield, 
  Settings,
  MessageSquare,
  Users,
  LogOut,
  HelpCircle,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Wrench,
  FileEdit
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingTour } from "@/hooks/use-onboarding-tour";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// Kanban-style grouped menu items
const menuGroups = [
  {
    title: "Management",
    icon: LayoutGrid,
    color: "from-blue-500 to-blue-600",
    items: [
      { name: "Customers", href: "/panel/customers", icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
      { name: "Providers", href: "/panel/providers", icon: Plug, color: "text-purple-500", bgColor: "bg-purple-500/10" },
      { name: "Payments", href: "/panel/payments", icon: CreditCard, color: "text-green-500", bgColor: "bg-green-500/10" },
      { name: "Billing", href: "/panel/billing", icon: Sparkles, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    ]
  },
  {
    title: "Content",
    icon: FileEdit,
    color: "from-pink-500 to-pink-600",
    items: [
      { name: "Blog", href: "/panel/blog", icon: FileText, color: "text-pink-500", bgColor: "bg-pink-500/10" },
      { name: "Design", href: "/panel/design", icon: Palette, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
      { name: "Domain", href: "/panel/domain", icon: Globe, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
    ]
  },
  {
    title: "System",
    icon: Wrench,
    color: "from-orange-500 to-orange-600",
    items: [
      { name: "API", href: "/panel/api", icon: Code, color: "text-orange-500", bgColor: "bg-orange-500/10" },
      { name: "Security", href: "/panel/security", icon: Shield, color: "text-red-500", bgColor: "bg-red-500/10" },
      { name: "Settings", href: "/panel/settings", icon: Settings, color: "text-muted-foreground", bgColor: "bg-muted" },
      { name: "Support", href: "/panel/support", icon: MessageSquare, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
    ]
  },
];

const MoreMenu = () => {
  const { profile, signOut } = useAuth();
  const { restartTour } = useOnboardingTour();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-5 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center pt-2">
        <h1 className="text-2xl font-bold">More</h1>
        <p className="text-muted-foreground text-sm">Quick access to all features</p>
      </motion.div>

      {/* User Profile Card */}
      <motion.div variants={itemVariants}>
        <Card className="glass-stat-card overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                  {profile?.full_name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{profile?.full_name || 'Panel Owner'}</h3>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Kanban-style Menu Groups */}
      <div className="space-y-4">
        {menuGroups.map((group, groupIndex) => (
          <motion.div 
            key={group.title}
            variants={itemVariants}
          >
            <Card className="glass-stat-card overflow-hidden">
              {/* Group Header */}
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", group.color)}>
                    <group.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{group.title}</CardTitle>
                  <span className="ml-auto text-xs text-muted-foreground">{group.items.length}</span>
                </div>
              </CardHeader>
              
              {/* Group Items */}
              <CardContent className="p-2 pt-0">
                <div className="space-y-1">
                  {group.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIndex * 0.1 + itemIndex * 0.05 }}
                    >
                      <Link to={item.href}>
                        <div className={cn(
                          "flex items-center gap-3 p-2.5 rounded-xl",
                          "hover:bg-accent/50 active:bg-accent/70",
                          "transition-all duration-200 group"
                        )}>
                          <div className={cn("p-2 rounded-lg", item.bgColor)}>
                            <item.icon className={cn("w-4 h-4", item.color)} />
                          </div>
                          <span className="font-medium text-sm flex-1">{item.name}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Quick Actions
        </h2>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-11 glass-stat-card border-border/50"
          onClick={restartTour}
        >
          <div className="p-1.5 rounded-lg bg-primary/10">
            <HelpCircle className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm">Take Platform Tour</span>
          <Sparkles className="w-4 h-4 ml-auto text-primary" />
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-11 glass-stat-card border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <div className="p-1.5 rounded-lg bg-destructive/10">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-sm">Sign Out</span>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default MoreMenu;