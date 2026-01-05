import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package,
  ShoppingCart,
  User,
  MessageSquare,
  Wallet,
  LogOut,
  CreditCard,
  HelpCircle,
  Menu,
  ClipboardList,
  HeadphonesIcon,
  Heart,
  BookOpen,
  Code,
  FileText,
  Layers,
  Search,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTenant } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { BuyerNotifications } from "@/components/buyer/BuyerNotifications";
import { LanguageSelector } from "@/components/buyer/LanguageSelector";
import { CurrencySelector } from "@/components/buyer/CurrencySelector";
import { TenantHead } from "@/components/tenant/TenantHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { BuyerThemeWrapper } from "@/components/buyer-themes";

interface BuyerLayoutProps {
  children?: React.ReactNode;
}

interface PanelSettings {
  floating_chat_whatsapp?: string;
  floating_chat_telegram?: string;
  floating_chat_enabled?: boolean;
}

const BuyerLayout = ({ children }: BuyerLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { panel } = useTenant();
  const { buyer, signOut } = useBuyerAuth();
  const { t } = useLanguage();
  const [panelSettings, setPanelSettings] = useState<PanelSettings | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Fetch panel settings for WhatsApp
  useEffect(() => {
    const fetchSettings = async () => {
      if (!panel?.id) return;
      const { data } = await supabase
        .from('panel_settings')
        .select('floating_chat_whatsapp, floating_chat_telegram, floating_chat_enabled')
        .eq('panel_id', panel.id)
        .single();
      if (data) setPanelSettings(data);
    };
    fetchSettings();
  }, [panel?.id]);

  // Load cart count from localStorage
  useEffect(() => {
    const loadCartCount = () => {
      try {
        const savedCart = localStorage.getItem(`buyer_cart_${panel?.id}`);
        if (savedCart) {
          const cart = JSON.parse(savedCart);
          setCartCount(Array.isArray(cart) ? cart.length : 0);
        }
      } catch {
        setCartCount(0);
      }
    };
    loadCartCount();
    window.addEventListener('storage', loadCartCount);
    window.addEventListener('cartUpdated', loadCartCount);
    return () => {
      window.removeEventListener('storage', loadCartCount);
      window.removeEventListener('cartUpdated', loadCartCount);
    };
  }, [panel?.id]);

  // Desktop navigation - includes New Order
  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.new_order'), href: '/new-order', icon: Plus },
    { name: t('nav.services'), href: '/services', icon: Package },
    { name: t('nav.orders'), href: '/orders', icon: ShoppingCart },
    { name: t('nav.track_order'), href: '/track-order', icon: Search },
    { name: t('nav.favorites'), href: '/favorites', icon: Heart },
    { name: t('nav.deposit'), href: '/deposit', icon: Wallet },
    { name: t('nav.support'), href: '/support', icon: MessageSquare },
    { name: t('nav.profile'), href: '/profile', icon: User },
  ];

  // Bottom nav items: Dashboard, Add Funds, New Order (center, goes to new-order page), Support, More
  const bottomNavItems = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.deposit'), href: '/deposit', icon: Wallet, badge: cartCount > 0 ? cartCount : undefined },
    { name: t('nav.new_order'), href: '/new-order', icon: ShoppingCart, isCenter: true },
    { name: t('nav.support'), href: '/support', icon: HeadphonesIcon },
    { name: t('nav.more'), href: '#menu', icon: Menu, isMenu: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  const userName = buyer?.full_name || buyer?.email?.split('@')[0] || 'User';
  const userEmail = buyer?.email || '';
  const userBalance = buyer?.balance || 0;

  const handleSignOut = async () => {
    await signOut();
  };

  const whatsappNumber = panelSettings?.floating_chat_whatsapp;

  return (
    <BuyerThemeWrapper panelId={panel?.id}>
      <TenantHead />
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
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 glass-sidebar z-20">
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
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('nav.smm_services')}</p>
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
                <p className="text-xs text-muted-foreground">{t('nav.your_balance')}</p>
                <p className="text-xl font-bold">${userBalance.toFixed(2)}</p>
              </div>
            </div>
            <Button size="sm" className="w-full mt-3 gap-2" asChild>
              <Link to="/deposit">
                <CreditCard className="w-4 h-4" />
                {t('nav.deposit')}
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
            <CurrencySelector />
            <LanguageSelector />
            <BuyerNotifications />
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

      {/* Tablet Sidebar (collapsible) */}
      <aside className="hidden md:flex lg:hidden flex-col fixed left-0 top-0 h-full w-16 glass-sidebar z-20 items-center py-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold mb-6"
          style={{ background: `linear-gradient(135deg, ${panel?.primary_color || '#3b82f6'}, ${panel?.secondary_color || '#1e40af'})` }}
        >
          {panel?.name?.charAt(0) || 'P'}
        </div>
        
        <nav className="flex-1 flex flex-col items-center gap-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "p-3 rounded-xl transition-all",
                isActive(item.href) 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={item.name}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden glass border-b border-border/50 p-2 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
          {panel?.logo_url ? (
            <img src={panel.logo_url} alt={panel.name} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${panel?.primary_color || '#3b82f6'}, ${panel?.secondary_color || '#1e40af'})` }}
            >
              {panel?.name?.charAt(0) || 'P'}
            </div>
          )}
          <span className="font-bold text-xs truncate max-w-[80px]">{panel?.name || 'Panel'}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Balance + Add Funds Button */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Link to="/deposit" className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800/90 dark:bg-slate-800/90">
              <span className="text-xs font-bold text-white">${userBalance.toFixed(2)}</span>
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Plus className="w-3 h-3 text-primary-foreground" />
              </div>
            </Link>
          </motion.div>
          <BuyerNotifications />
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 md:ml-16 min-h-screen pb-24 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Floating WhatsApp Button - Mobile only, above bottom nav */}
      <AnimatePresence>
        {whatsappNumber && (
          <motion.a
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden fixed right-4 bottom-24 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </motion.a>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-around py-1.5 px-0.5">
          {bottomNavItems.map((item, index) => {
            if (item.isMenu) {
              return (
                <Sheet key={item.name} open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <button 
                      data-tour="mobile-more"
                      className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-muted-foreground min-w-0"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-[9px] font-medium truncate">{item.name}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-3xl overflow-y-auto">
                    <SheetHeader className="pb-4">
                      <SheetTitle>{t('nav.menu')}</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-2 pb-6 overflow-y-auto max-h-[65vh]">
                      {/* User Info */}
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 mb-4">
                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{userName}</p>
                          <p className="text-sm text-muted-foreground">{userEmail}</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-0">
                          ${userBalance.toFixed(2)}
                        </Badge>
                      </div>

                      {/* Quick Settings - Language & Currency */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                          <span className="text-xs font-medium text-muted-foreground">{t('nav.language') || 'Language'}</span>
                          <LanguageSelector />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                          <span className="text-xs font-medium text-muted-foreground">{t('nav.currency') || 'Currency'}</span>
                          <CurrencySelector />
                        </div>
                      </div>

                      {/* Primary Actions */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <Link
                          to="/new-order"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all border border-primary/10"
                        >
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Layers className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-xs font-medium text-center">{t('nav.bulk_order')}</span>
                        </Link>
                        <Link
                          to="/blog"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-border/50"
                        >
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                          </div>
                          <span className="text-xs font-medium text-center">{t('nav.blog')}</span>
                        </Link>
                        <Link
                          to="/api"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-border/50"
                        >
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <Code className="w-5 h-5 text-purple-500" />
                          </div>
                          <span className="text-xs font-medium text-center">{t('nav.api')}</span>
                        </Link>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-1">
                        <Link
                          to="/support"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all"
                        >
                          <HeadphonesIcon className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">Support</span>
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all"
                        >
                          <Heart className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">Favorites</span>
                        </Link>
                        <Link
                          to="/track-order"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all"
                        >
                          <Search className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">Track Order</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all"
                        >
                          <User className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">Profile</span>
                        </Link>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            // Trigger buyer tour restart
                            window.dispatchEvent(new CustomEvent('restartBuyerTour'));
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all w-full text-left"
                        >
                          <Sparkles className="w-5 h-5 text-primary" />
                          <span className="font-medium text-primary">Take a Tour</span>
                        </button>
                        <Link
                          to="/terms"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all"
                        >
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">Terms of Service</span>
                        </Link>
                        <Link
                          to="/privacy"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all"
                        >
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">Privacy Policy</span>
                        </Link>
                      </div>

                      {/* Sign Out */}
                      <Button 
                        variant="outline" 
                        className="w-full mt-4 gap-2" 
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              );
            }

            // Center button (New Order)
            if (item.isCenter) {
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  data-tour="mobile-services"
                  className="relative -mt-5"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all",
                      isActive(item.href) 
                        ? "bg-primary text-primary-foreground shadow-primary/30" 
                        : "bg-primary/90 text-primary-foreground shadow-primary/20"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
              );
            }

            // Regular nav items with data-tour attributes
            const getTourAttribute = () => {
              if (item.href === '/dashboard') return 'mobile-home';
              if (item.href === '/deposit') return 'mobile-deposit';
              if (item.href === '/support') return 'mobile-support';
              return undefined;
            };

            return (
              <Link
                key={item.name}
                to={item.href}
                data-tour={getTourAttribute()}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative min-w-0",
                  isActive(item.href) 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] font-medium truncate">{item.name}</span>
                {item.badge && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 p-0 flex items-center justify-center text-[8px]"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
    </BuyerThemeWrapper>
  );
};

export default BuyerLayout;
