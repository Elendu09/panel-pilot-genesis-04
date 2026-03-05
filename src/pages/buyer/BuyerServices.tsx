import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Search,
  ArrowLeft,
  Zap,
  ChevronRight,
  LayoutDashboard,
  Filter,
  Package,
  ShoppingCart as ShoppingCartIcon,
  Star,
  Heart,
  TrendingUp,
  Clock,
  DollarSign,
  Sparkles,
  Eye,
  Wallet,
  Award
} from "lucide-react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTenant } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";
import ShoppingCart from "@/components/buyer/ShoppingCart";
import { LanguageSelector } from "@/components/buyer/LanguageSelector";
import { CurrencySelector } from "@/components/buyer/CurrencySelector";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useBuyerRealtimeOrders } from "@/hooks/use-buyer-realtime-orders";
import { detectServiceType } from "@/lib/service-icon-detection";
import { useBuyerCart } from "@/hooks/use-buyer-cart";
import { ServiceInfoPanel } from "@/components/buyer/ServiceInfoPanel";
import { useUnifiedServices } from "@/hooks/useUnifiedServices";
import { SpeedGauge } from "@/components/buyer/SpeedGauge";
import { InterstitialAdCard } from "@/components/buyer/SponsoredProviderBanner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

// Service type colors for badges
const SERVICE_TYPE_COLORS: Record<string, string> = {
  followers: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  likes: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  views: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  comments: 'bg-green-500/10 text-green-600 border-green-500/20',
  shares: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  plays: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  streams: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  subscribers: 'bg-red-500/10 text-red-600 border-red-500/20',
  members: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  general: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

// Dynamically build platform filters from database categories with real-time sync
// This ensures 70+ categories are displayed when active

const BuyerServices = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
  const { buyer, refreshBuyer } = useBuyerAuth();
  const { formatPrice, currency } = useCurrency();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customPrices, setCustomPrices] = useState<Map<string, number>>(new Map());
  const [fastOrderApplied, setFastOrderApplied] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, completed: 0 });

  // Use unified services hook for consistent data across all buyer pages
  const { 
    services, 
    categories: dbCategories, 
    loading,
    categoriesWithServices 
  } = useUnifiedServices({ panelId: panel?.id || null });

  // Build filter pills from unified categories - with fallback to build from services directly
  const filterPills = useMemo(() => {
    const pills: Array<{ id: string; name: string; icon: any; bgColor: string }> = [
      { id: 'all', name: 'All', icon: Package, bgColor: 'bg-primary' }
    ];
    
    // If unified categories are available, use them
    if (categoriesWithServices.length > 0) {
      categoriesWithServices.forEach(cat => {
        const catData = SOCIAL_ICONS_MAP[cat.slug.toLowerCase()] || SOCIAL_ICONS_MAP.other;
        pills.push({
          id: cat.slug,
          name: cat.name,
          icon: catData.icon,
          bgColor: catData.bgColor,
        });
      });
    } else if (services.length > 0) {
      // Fallback: build categories directly from services (same as NewOrder page)
      const uniqueCategories = [...new Set(services.map((s: any) => s.category || 'other'))];
      uniqueCategories.forEach(cat => {
        const catData = SOCIAL_ICONS_MAP[cat.toLowerCase()] || SOCIAL_ICONS_MAP.other;
        pills.push({
          id: cat,
          name: catData.label || cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: catData.icon,
          bgColor: catData.bgColor,
        });
      });
    }
    
    return pills;
  }, [categoriesWithServices, services]);
  const getHookCategoryData = useCallback((category: string) => {
    const catData = SOCIAL_ICONS_MAP[category.toLowerCase()] || SOCIAL_ICONS_MAP.other;
    return {
      icon: catData.icon,
      label: catData.label || category.charAt(0).toUpperCase() + category.slice(1),
      color: catData.color,
      bgColor: catData.bgColor,
    };
  }, []);

  // Real-time order tracking
  useBuyerRealtimeOrders(buyer?.id, panel?.id);

  // Get effective price for a service (custom or default)
  const getEffectivePrice = useCallback((service: any) => {
    return customPrices.get(service.id) ?? service.price;
  }, [customPrices]);

  // Supabase-backed cart
  const {
    cart,
    cartTotal,
    syncing: cartSyncing,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  } = useBuyerCart({
    buyerId: buyer?.id || null,
    panelId: panel?.id || null,
    services,
    getEffectivePrice,
  });

  // Fetch custom prices for this buyer
  useEffect(() => {
    const fetchCustomPrices = async () => {
      if (!buyer?.id || !panel?.id) return;
      
      const { data } = await supabase
        .from('client_custom_prices')
        .select('service_id, custom_price, discount_percent')
        .eq('panel_id', panel.id)
        .eq('client_id', buyer.id);
      
      if (data) {
        const pricesMap = new Map<string, number>();
        data.forEach((p: any) => {
          const service = services.find((s: any) => s.id === p.service_id);
          if (service) {
            if (p.custom_price !== null) {
              pricesMap.set(p.service_id, p.custom_price);
            } else if (p.discount_percent) {
              pricesMap.set(p.service_id, service.price * (1 - p.discount_percent / 100));
            }
          }
        });
        setCustomPrices(pricesMap);
      }
    };

    if (services.length > 0) {
      fetchCustomPrices();
    }
  }, [buyer?.id, panel?.id, services]);

  // Fetch favorites for authenticated users
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!buyer?.id || !panel?.id) return;
      
      const { data } = await supabase
        .from('buyer_favorites')
        .select('service_id')
        .eq('buyer_id', buyer.id)
        .eq('panel_id', panel.id);
      
      if (data) {
        setFavorites(new Set(data.map(f => f.service_id)));
      }
    };
    
    fetchFavorites();
  }, [buyer?.id, panel?.id]);

  // Fetch recent orders and stats for authenticated users
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!buyer?.id || !panel?.id) return;
      
      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, status, price, quantity, created_at, service:services(name, category)')
        .eq('panel_id', panel.id)
        .eq('buyer_id', buyer.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (orders) {
        setRecentOrders(orders);
        setOrderStats({
          total: orders.length,
          pending: orders.filter(o => ['pending', 'processing', 'in_progress'].includes(o.status)).length,
          completed: orders.filter(o => o.status === 'completed').length
        });
      }
    };
    
    fetchOrderData();
  }, [buyer?.id, panel?.id]);

  // Handle Fast Order URL parameters
  useEffect(() => {
    if (!services.length || fastOrderApplied) return;
    
    const serviceId = searchParams.get('service');
    const quantityParam = searchParams.get('quantity');
    const urlParam = searchParams.get('url');
    
    if (serviceId) {
      const service = services.find((s: any) => s.id === serviceId);
      if (service) {
        setFastOrderApplied(true);
        const params = new URLSearchParams({ service: serviceId });
        if (quantityParam) params.append('quantity', quantityParam);
        if (urlParam) params.append('url', urlParam);
        navigate(`/new-order?${params.toString()}`);
      }
    }
  }, [services, searchParams, navigate, fastOrderApplied]);


  // Get categories with counts - now uses the hook's categoryCounts for consistency
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = { all: services.length };
    services.forEach((s: any) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [services]);

  // Platform filters from hook (real-time synced with 70+ categories)
  const platformFilters = filterPills;

  // Group services by category and sub-category
  const groupedServices = useMemo(() => {
    const filtered = services.filter((service: any) => {
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Group by category, then by sub-category (service type)
    const groups: Record<string, { subCategories: Record<string, any[]> }> = {};
    
    filtered.forEach((service: any) => {
      const category = service.category || 'other';
      const serviceType = detectServiceType(service.name);
      const subCategory = serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
      
      if (!groups[category]) {
        groups[category] = { subCategories: {} };
      }
      if (!groups[category].subCategories[subCategory]) {
        groups[category].subCategories[subCategory] = [];
      }
      groups[category].subCategories[subCategory].push(service);
    });

    return groups;
  }, [services, selectedCategory, searchQuery]);

  // Calculate total services in grouped structure
  const getTotalServicesInCategory = (categoryData: { subCategories: Record<string, any[]> }) => {
    return Object.values(categoryData.subCategories).reduce((sum, arr) => sum + arr.length, 0);
  };

  // Use the hook's getCategoryData for consistency
  const getCategoryData = getHookCategoryData;

  return (
    <BuyerLayout>
      <div className="min-h-screen">
        {/* Professional Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/50 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 shrink-0"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg md:text-xl font-bold">{t('services')}</h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <LanguageSelector />
              <CurrencySelector />
              <ThemeToggle />
              <ShoppingCart
                cart={cart}
                cartTotal={cartTotal}
                syncing={cartSyncing}
                buyerBalance={buyer?.balance || 0}
                buyerId={buyer?.id || ''}
                panelId={panel?.id || ''}
                formatPrice={formatPrice}
                onUpdateItem={updateCartItem}
                onRemoveItem={removeFromCart}
                onClearCart={clearCart}
                onCheckoutComplete={async () => {
                  await refreshBuyer();
                  refreshCart();
                }}
              />
            </div>
          </div>
        </div>

        {/* Authenticated User Widgets */}
        {buyer && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
            {/* Balance Widget */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Balance</span>
              </div>
              <p className="text-lg font-bold">{formatPrice(buyer.balance || 0)}</p>
            </motion.div>

            {/* Total Services Widget */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Services</span>
              </div>
              <p className="text-lg font-bold">{services.length.toLocaleString()}</p>
            </motion.div>

            {/* Favorites Widget */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-xl p-3 border border-pink-500/20 cursor-pointer"
              onClick={() => navigate('/favorites')}
            >
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-xs text-muted-foreground">Favorites</span>
              </div>
              <p className="text-lg font-bold">{favorites.size}</p>
            </motion.div>

            {/* Orders Widget */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl p-3 border border-emerald-500/20 cursor-pointer"
              onClick={() => navigate('/orders')}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Orders</span>
              </div>
              <p className="text-lg font-bold">{orderStats.total}</p>
            </motion.div>
          </div>
        )}

        {/* Quick Actions for Auth Users */}
        {buyer && (
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 border-primary/30 bg-primary/5"
              onClick={() => navigate('/new-order')}
            >
              <Zap className="w-4 h-4 text-primary" />
              Quick Order
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              onClick={() => navigate('/favorites')}
            >
              <Heart className="w-4 h-4 text-pink-500" />
              My Favorites
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              onClick={() => navigate('/orders')}
            >
              <Clock className="w-4 h-4" />
              Order History
            </Button>
            {buyer.is_vip && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2 border-amber-500/30 bg-amber-500/5"
              >
                <Award className="w-4 h-4 text-amber-500" />
                VIP Prices
              </Button>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t('searchServices') || "Search services..."}
              className="pl-10 h-12 text-base bg-muted/50 border-border/50 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Pills - Horizontal Scroll */}
        <div className="-mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pb-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {platformFilters.map((platform) => {
                const isActive = selectedCategory === platform.id;
                const count = categoriesWithCounts[platform.id] || 0;
                const PlatformIcon = platform.icon;
                const bgColor = platform.id === 'all' ? 'bg-primary' : (platform as any).bgColor;
                
                return (
                  <motion.button
                    key={platform.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(platform.id)}
                    className={cn(
                      "flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border transition-all shrink-0",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "bg-card hover:bg-accent border-border/50"
                    )}
                  >
                    <div className={cn(
                      "p-1 rounded-md",
                      isActive ? "bg-white/20" : bgColor
                    )}>
                      <PlatformIcon className={cn(
                        "w-4 h-4",
                        isActive ? "text-current" : "text-white"
                      )} />
                    </div>
                    <span className="text-sm font-medium">{platform.name}</span>
                    {count > 0 && platform.id !== 'all' && (
                      <Badge variant="secondary" className={cn(
                        "text-[10px] px-1.5 py-0",
                        isActive && "bg-white/20 text-current"
                      )}>
                        {count}
                      </Badge>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {/* Services - Carousel Layout per Category */}
        <div className="space-y-8 pb-36 md:pb-24">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-3">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                  <div className="flex gap-3 overflow-hidden">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="w-64 h-40 bg-muted rounded-xl animate-pulse shrink-0" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedServices).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('orders.no_orders') || 'No services found'}</h3>
              <p className="text-muted-foreground text-sm">
                {t('common.retry') || 'Try adjusting your search or filter'}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {Object.entries(groupedServices).map(([category, categoryData], categoryIndex) => {
                const categoryInfo = getCategoryData(category);
                const CategoryIcon = categoryInfo.icon;
                const totalServices = getTotalServicesInCategory(categoryData);
                
                const allCategoryServices = Object.values(categoryData.subCategories).flat();

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", categoryInfo.bgColor)}>
                          <CategoryIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="font-semibold capitalize">{category}</h2>
                          <p className="text-xs text-muted-foreground">
                            {totalServices} {t('services.title')?.toLowerCase() || 'services'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                        {t('common.view_all')}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Service Cards Carousel */}
                    <Carousel
                      opts={{
                        align: "start",
                        loop: false,
                      }}
                      className="w-full overflow-hidden"
                    >
                      <CarouselContent className="-ml-2 md:-ml-3 overflow-visible">
                        {allCategoryServices.slice(0, 10).map((service: any) => {
                          const effectivePrice = getEffectivePrice(service);
                          const hasCustomPrice = customPrices.has(service.id);
                          const isInstant = service.estimated_time?.toLowerCase().includes('instant') || 
                                           service.estimated_time?.includes('0-1');
                          const serviceType = detectServiceType(service.name);

                          return (
                            <CarouselItem key={service.id} className="pl-2 md:pl-3 basis-[240px] sm:basis-[260px] md:basis-[320px]">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Card 
                                  className={cn(
                                    "bg-card border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all h-full cursor-pointer",
                                    selectedService?.id === service.id && "border-primary ring-2 ring-primary/20"
                                  )}
                                  onClick={() => setSelectedService(service)}
                                >
                                  <CardContent className="p-4">
                                    {/* Header with Favorite - Mobile responsive */}
                                    <div className="flex items-center justify-between gap-1.5 mb-3 flex-wrap">
                                      <Badge 
                                        variant="outline" 
                                        className={cn(
                                          "text-[10px] shrink-0",
                                          SERVICE_TYPE_COLORS[serviceType] || SERVICE_TYPE_COLORS.general
                                        )}
                                      >
                                        {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
                                      </Badge>
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {favorites.has(service.id) && (
                                          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 shrink-0" />
                                        )}
                                        {isInstant && (
                                          <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0">
                                            <Zap className="w-2.5 h-2.5 mr-0.5" />
                                            <span className="hidden sm:inline">Instant</span>
                                          </Badge>
                                        )}
                                        {hasCustomPrice && (
                                          <Badge className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20 shrink-0">
                                            <Star className="w-2.5 h-2.5 mr-0.5" />
                                            <span className="hidden sm:inline">VIP</span>
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Service ID & Name */}
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Badge variant="secondary" className="text-[9px] font-mono px-1 py-0 h-4">
                                        ID: {service.provider_service_id || service.id?.slice(0, 6)}
                                      </Badge>
                                      {service.refill_available && (
                                        <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-1 py-0 h-4">
                                          ♻️
                                        </Badge>
                                      )}
                                    </div>
                                    <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-2 min-h-[2.25rem]">
                                      {service.name}
                                    </h3>

                                    {/* Price & Quantity */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                      <span>{(service.min_quantity || 100).toLocaleString()} - {(service.max_quantity || 10000).toLocaleString()}</span>
                                      <Badge 
                                        variant="secondary" 
                                        className={cn(
                                          "font-mono text-xs",
                                          hasCustomPrice && "bg-green-500/10 text-green-600 border-green-500/20"
                                        )}
                                      >
                                        {formatPrice(effectivePrice)}/1K
                                      </Badge>
                                    </div>
                                    
                                    {/* Speed Gauge */}
                                    <div className="mb-3">
                                      <SpeedGauge 
                                        estimatedTime={service.average_time || service.averageTime || service.estimated_time} 
                                        compact 
                                        size="sm"
                                        className="justify-start"
                                      />
                                    </div>

                                    {/* Actions with View Now button */}
                                    <div className="flex gap-2">
                                      <Button
                                        className="flex-1 h-9 text-sm font-medium gap-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/new-order?service=${service.id}&quantity=${service.min_quantity || 100}`);
                                        }}
                                      >
                                        {t('services.order_now') || 'Order Now'}
                                        <ChevronRight className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0 h-9 gap-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Navigate to new order with pre-filled service
                                          navigate(`/new-order?service=${service.id}&quantity=${service.min_quantity || 100}`);
                                        }}
                                      >
                                        <Eye className="w-4 h-4" />
                                        <span className="hidden sm:inline">View</span>
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            </CarouselItem>
                          );
                        })}
                      </CarouselContent>
                      <CarouselPrevious className="hidden md:flex -left-4" />
                      <CarouselNext className="hidden md:flex -right-4" />
                    </Carousel>

                    {categoryIndex === 1 && (
                      <InterstitialAdCard currentPanelId={panel?.id} className="mt-4" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Service Info Panel - Desktop Sidebar */}
      {buyer && selectedService && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block fixed right-6 top-24 w-80 z-20"
        >
          <ServiceInfoPanel 
            service={selectedService} 
            showFavorite={true}
          />
          <div className="mt-3 space-y-2">
            <Button
              className="w-full gap-2"
              onClick={() => navigate(`/new-order?service=${selectedService.id}`)}
            >
              <Zap className="w-4 h-4" />
              Order This Service
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setSelectedService(null)}
            >
              Close Panel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Mobile Service Info Sheet */}
      {buyer && selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="lg:hidden fixed bottom-20 left-4 right-4 z-20 bg-background border border-border rounded-xl shadow-2xl p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="text-[9px] font-mono mb-1">
                ID: {selectedService.provider_service_id || selectedService.id?.slice(0, 6)}
              </Badge>
              <h3 className="font-semibold text-sm line-clamp-2">{selectedService.name}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={() => setSelectedService(null)}
            >
              ×
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="secondary" className="font-mono">
              {formatPrice(getEffectivePrice(selectedService))}/1K
            </Badge>
            <span className="text-xs text-muted-foreground">
              {selectedService.min_quantity?.toLocaleString() || 100} - {selectedService.max_quantity?.toLocaleString() || '10K'}
            </span>
          </div>
          <Button
            className="w-full gap-2"
            onClick={() => navigate(`/new-order?service=${selectedService.id}`)}
          >
            <Zap className="w-4 h-4" />
            Order Now
          </Button>
        </motion.div>
      )}

      {/* Bottom Navigation for authenticated users only */}
      {buyer && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
          <div className="flex items-center justify-around py-1.5 px-0.5">
            <Link
              to="/dashboard"
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0",
                location.pathname === '/dashboard' ? "text-primary" : "text-muted-foreground"
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[9px] font-medium">Dashboard</span>
            </Link>
            <Link
              to="/services"
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-primary min-w-0"
            >
              <Package className="w-5 h-5" />
              <span className="text-[9px] font-medium">Services</span>
            </Link>
            <Link to="/new-order" className="relative -mt-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
            </Link>
            <Link
              to="/support"
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-muted-foreground min-w-0"
            >
              <Filter className="w-5 h-5" />
              <span className="text-[9px] font-medium">Support</span>
            </Link>
            <Link
              to="/orders"
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-muted-foreground min-w-0"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              <span className="text-[9px] font-medium">Orders</span>
            </Link>
          </div>
        </nav>
      )}
    </BuyerLayout>
  );
};

export default BuyerServices;
