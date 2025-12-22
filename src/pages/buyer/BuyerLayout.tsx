import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package,
  ShoppingCart,
  User,
  MessageSquare,
  Wallet,
  LogOut,
  Home,
  CreditCard,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useTenant } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";

interface BuyerLayoutProps {
  children?: React.ReactNode;
}

const BuyerLayout = ({ children }: BuyerLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { panel } = useTenant();
  const { buyer, signOut } = useBuyerAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Services', href: '/services', icon: Package },
    { name: 'My Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Add Funds', href: '/deposit', icon: Wallet },
    { name: 'Support', href: '/support', icon: MessageSquare },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const bottomNavItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Services', href: '/services', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Wallet', href: '/deposit', icon: Wallet },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  const userName = buyer?.full_name || buyer?.email?.split('@')[0] || 'User';
  const userEmail = buyer?.email || '';
  const userBalance = buyer?.balance || 0;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Apply panel theme colors */}
      <style>
        {`
          :root {
            --panel-primary: ${panel?.primary_color || '#3b82f6'};
            --panel-secondary: ${panel?.secondary_color || '#1e40af'};
          }
        `}
      </style>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 glass-sidebar z-20">
        {/* Header with Panel Branding */}
        <div className="p-4 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            {panel?.logo_url ? (
              <img src={panel.logo_url} alt={panel.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ background: `linear-gradient(135deg, ${panel?.primary_color || '#3b82f6'}, ${panel?.secondary_color || '#1e40af'})` }}
              >
                {panel?.name?.charAt(0) || 'P'}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold">{panel?.name || 'Panel'}</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">SMM Services</p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-4">
          <div className="glass-card p-4 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Your Balance</p>
                <p className="text-xl font-bold">${userBalance.toFixed(2)}</p>
              </div>
            </div>
            <Button size="sm" className="w-full mt-3 gap-2" asChild>
              <Link to="/deposit">
                <CreditCard className="w-4 h-4" />
                Add Funds
              </Link>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "nav-item group relative",
                isActive(item.href) && "active"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border/50 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/30">
            <Avatar className="w-9 h-9 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden glass border-b border-border/50 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {panel?.logo_url ? (
            <img src={panel.logo_url} alt={panel.name} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${panel?.primary_color || '#3b82f6'}, ${panel?.secondary_color || '#1e40af'})` }}
            >
              {panel?.name?.charAt(0) || 'P'}
            </div>
          )}
          <span className="font-bold">{panel?.name || 'Panel'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            ${userBalance.toFixed(2)}
          </Badge>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border/50 z-30">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
                isActive(item.href) 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default BuyerLayout;
