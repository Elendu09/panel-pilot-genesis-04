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
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingTour } from "@/hooks/use-onboarding-tour";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Customers", href: "/panel/customers", icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { name: "Providers", href: "/panel/providers", icon: Plug, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { name: "Payments", href: "/panel/payments", icon: CreditCard, color: "text-green-500", bgColor: "bg-green-500/10" },
  { name: "API", href: "/panel/api", icon: Code, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { name: "Blog", href: "/panel/blog", icon: FileText, color: "text-pink-500", bgColor: "bg-pink-500/10" },
  { name: "Domain", href: "/panel/domain", icon: Globe, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  { name: "Design", href: "/panel/design", icon: Palette, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  { name: "Security", href: "/panel/security", icon: Shield, color: "text-red-500", bgColor: "bg-red-500/10" },
  { name: "Settings", href: "/panel/settings", icon: Settings, color: "text-muted-foreground", bgColor: "bg-muted" },
  { name: "Support", href: "/panel/support", icon: MessageSquare, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
];

const MoreMenu = () => {
  const { profile, signOut } = useAuth();
  const { restartTour } = useOnboardingTour();

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold">More Options</h1>
        <p className="text-muted-foreground text-sm">Quick access to all features</p>
      </motion.div>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-primary/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {profile?.full_name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{profile?.full_name || 'Panel Owner'}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Link to={item.href}>
              <Card className={cn(
                "glass-card-hover group cursor-pointer",
                "border-border/50 hover:border-primary/30"
              )}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl", item.bgColor)}>
                    <item.icon className={cn("w-5 h-5", item.color)} />
                  </div>
                  <span className="font-medium text-sm flex-1">{item.name}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Quick Actions
        </h2>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 glass-card border-border/50"
          onClick={restartTour}
        >
          <div className="p-1.5 rounded-lg bg-primary/10">
            <HelpCircle className="w-4 h-4 text-primary" />
          </div>
          <span>Take Platform Tour</span>
          <Sparkles className="w-4 h-4 ml-auto text-primary" />
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 glass-card border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <div className="p-1.5 rounded-lg bg-destructive/10">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Sign Out</span>
        </Button>
      </motion.div>
    </div>
  );
};

export default MoreMenu;
