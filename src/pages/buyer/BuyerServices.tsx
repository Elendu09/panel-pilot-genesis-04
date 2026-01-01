import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Search,
  ArrowLeft,
  Globe,
  Zap,
  ChevronRight,
  LayoutDashboard,
  Filter,
  Package,
  ShoppingCart as ShoppingCartIcon
} from "lucide-react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTenant, useTenantServices } from "@/hooks/useTenant";
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
import { detectServiceType, getSubCategory } from "@/lib/service-icon-detection";
import { useBuyerCart } from "@/hooks/use-buyer-cart";

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

// Dynamically build platform filters from SOCIAL_ICONS_MAP
const platformFilters = [
  { id: 'all', name: 'All', icon: Filter, bgColor: 'bg-primary', color: 'text-primary' },
  ...Object.entries(SOCIAL_ICONS_MAP)
    .filter(([key]) => key !== 'other')
    .map(([id, data]) => ({
      id,
      name: data.label || id.charAt(0).toUpperCase() + id.slice(1),
      ...data,
    })),
  { id: 'other', name: 'Other', ...SOCIAL_ICONS_MAP.other },
];

const BuyerServices = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
  const { buyer, refreshBuyer } = useBuyerAuth();
  const { formatPrice, currency } = useCurrency();
  const { t } = useLanguage();
  const { services, loading } = useTenantServices(panel?.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customPrices, setCustomPrices] = useState<Map<string, number>>(new Map());
  const [fastOrderApplied, setFastOrderApplied] = useState(false);

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


  // Get categories with counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = { all: services.length };
    services.forEach((s: any) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [services]);

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

  const getCategoryData = (categoryId: string) => {
    return SOCIAL_ICONS_MAP[categoryId] || SOCIAL_ICONS_MAP.other;
  };

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
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex gap-2"
                asChild
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
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
                      "flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all shrink-0",
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

        {/* Services List - Grouped by Category */}
        <div className="space-y-6 pb-32 md:pb-24">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : Object.keys(groupedServices).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or filter
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {Object.entries(groupedServices).map(([category, categoryData]) => {
                const categoryInfo = getCategoryData(category);
                const CategoryIcon = categoryInfo.icon;
                const totalServices = getTotalServicesInCategory(categoryData);

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-3 px-1">
                      <div className={cn("p-2 rounded-lg", categoryInfo.bgColor)}>
                        <CategoryIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-semibold capitalize">{category}</h2>
                        <p className="text-xs text-muted-foreground">
                          {totalServices} services
                        </p>
                      </div>
                    </div>

                    {/* Sub-categories (Service Types) */}
                    {Object.entries(categoryData.subCategories).map(([subCategory, subServices]) => (
                      <div key={`${category}-${subCategory}`} className="space-y-2">
                        {/* Sub-category Header */}
                        <div className="flex items-center gap-2 px-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] font-medium",
                              SERVICE_TYPE_COLORS[subCategory.toLowerCase()] || SERVICE_TYPE_COLORS.general
                            )}
                          >
                            {subCategory}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {subServices.length} services
                          </span>
                        </div>

                        {/* Service Cards in this sub-category */}
                        <div className="space-y-2 pl-2">
                          {subServices.map((service: any) => {
                            const effectivePrice = getEffectivePrice(service);
                            const hasCustomPrice = customPrices.has(service.id);
                            const isInstant = service.estimated_time?.toLowerCase().includes('instant') || 
                                             service.estimated_time?.includes('0-1');
                            const serviceType = detectServiceType(service.name);

                            return (
                              <motion.div
                                key={service.id}
                                whileHover={{ scale: 1.005 }}
                                whileTap={{ scale: 0.995 }}
                                className={cn(
                                  "bg-card rounded-xl border border-border/50 overflow-hidden",
                                  "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
                                )}
                              >
                                <div className="p-3 sm:p-4">
                                  {/* Service Info */}
                                  <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-medium text-xs sm:text-sm leading-tight line-clamp-2 mb-1.5">
                                        {service.name}
                                      </h3>
                                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                        {/* Service Type Badge */}
                                        <Badge 
                                          variant="outline" 
                                          className={cn(
                                            "text-[9px] sm:text-[10px]",
                                            SERVICE_TYPE_COLORS[serviceType] || SERVICE_TYPE_COLORS.general
                                          )}
                                        >
                                          {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
                                        </Badge>
                                        
                                        {/* Price */}
                                        <Badge 
                                          variant="secondary" 
                                          className={cn(
                                            "text-[10px] sm:text-xs",
                                            hasCustomPrice && "bg-green-500/10 text-green-600 border-green-500/20"
                                          )}
                                        >
                                          {formatPrice(effectivePrice)}/1K
                                        </Badge>
                                        
                                        {/* Instant Badge */}
                                        {isInstant && (
                                          <Badge className="text-[9px] sm:text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                                            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                                            Instant
                                          </Badge>
                                        )}

                                        {/* VIP Discount */}
                                        {hasCustomPrice && (
                                          <Badge className="text-[9px] sm:text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                                            VIP
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Quantity Range */}
                                    <div className="text-right shrink-0">
                                      <p className="text-[9px] sm:text-[10px] text-muted-foreground">Qty</p>
                                      <p className="text-[10px] sm:text-xs font-medium">
                                        {(service.min_quantity || 100).toLocaleString()} - {(service.max_quantity || 10000).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Order Now Button */}
                                  <Button
                                    className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium gap-2"
                                    onClick={() => navigate(`/new-order?service=${service.id}`)}
                                  >
                                    {t('orderNow') || 'Order Now'}
                                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Bottom Navigation for authenticated users only */}
      {buyer && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
          <div className="flex items-center justify-around py-2 px-1">
            <Link
              to="/dashboard"
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors",
                location.pathname === '/dashboard' ? "text-primary" : "text-muted-foreground"
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-medium">Dashboard</span>
            </Link>
            <Link
              to="/services"
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-primary"
            >
              <Package className="w-5 h-5" />
              <span className="text-[10px] font-medium">Services</span>
            </Link>
            <Link to="/new-order" className="relative -mt-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
            </Link>
            <Link
              to="/support"
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-muted-foreground"
            >
              <Filter className="w-5 h-5" />
              <span className="text-[10px] font-medium">Support</span>
            </Link>
            <Link
              to="/orders"
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-muted-foreground"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              <span className="text-[10px] font-medium">Orders</span>
            </Link>
          </div>
        </nav>
      )}
    </BuyerLayout>
  );
};

export default BuyerServices;
