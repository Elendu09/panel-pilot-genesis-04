import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Package, 
  Search,
  ShoppingCart as CartIcon,
  Clock,
  Zap,
  Plus,
  Check,
  ChevronRight,
  Filter,
  Sparkles
} from "lucide-react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTenant, useTenantServices } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";
import ShoppingCart from "@/components/buyer/ShoppingCart";
import { FavoriteButton } from "@/components/buyer/FavoriteButton";
import { ServiceRating } from "@/components/buyer/ServiceRating";
import { LanguageSelector } from "@/components/buyer/LanguageSelector";
import { CurrencySelector } from "@/components/buyer/CurrencySelector";

interface CartItem {
  service: any;
  quantity: number;
  targetUrl: string;
  effectivePrice: number;
}

const CART_STORAGE_KEY = (panelId: string) => `buyer_cart_${panelId}`;

const BuyerServices = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
  const { buyer, refreshBuyer } = useBuyerAuth();
  const { formatPrice } = useCurrency();
  const { services, loading } = useTenantServices(panel?.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customPrices, setCustomPrices] = useState<Map<string, number>>(new Map());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quickAddService, setQuickAddService] = useState<string | null>(null);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [fastOrderApplied, setFastOrderApplied] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (!panel?.id) return;
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY(panel.id));
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
  }, [panel?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!panel?.id) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY(panel.id), JSON.stringify(cart));
      // Dispatch event for other components to update
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart, panel?.id]);

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

  // Handle Fast Order URL parameters - redirect to new-order page
  useEffect(() => {
    if (!services.length || fastOrderApplied) return;
    
    const serviceId = searchParams.get('service');
    const quantityParam = searchParams.get('quantity');
    const urlParam = searchParams.get('url');
    
    if (serviceId) {
      const service = services.find((s: any) => s.id === serviceId);
      if (service) {
        setFastOrderApplied(true);
        // Redirect to dedicated order page
        const params = new URLSearchParams({ service: serviceId });
        if (quantityParam) params.append('quantity', quantityParam);
        if (urlParam) params.append('url', urlParam);
        navigate(`/new-order?${params.toString()}`);
      }
    }
  }, [services, searchParams, navigate, fastOrderApplied]);

  // Get effective price for a service (custom or default)
  const getEffectivePrice = (service: any) => {
    return customPrices.get(service.id) ?? service.price;
  };

  // Use SOCIAL_ICONS_MAP for proper branded icons
  const getCategoryData = (categoryId: string) => {
    return SOCIAL_ICONS_MAP[categoryId] || SOCIAL_ICONS_MAP.other;
  };

  // Get categories with counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = { all: services.length };
    services.forEach((s: any) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    
    return [
      { id: 'all', name: 'All Services', count: services.length, ...SOCIAL_ICONS_MAP.other },
      { id: 'instagram', name: 'Instagram', count: counts.instagram || 0, ...SOCIAL_ICONS_MAP.instagram },
      { id: 'facebook', name: 'Facebook', count: counts.facebook || 0, ...SOCIAL_ICONS_MAP.facebook },
      { id: 'twitter', name: 'Twitter / X', count: counts.twitter || 0, ...SOCIAL_ICONS_MAP.twitter },
      { id: 'youtube', name: 'YouTube', count: counts.youtube || 0, ...SOCIAL_ICONS_MAP.youtube },
      { id: 'tiktok', name: 'TikTok', count: counts.tiktok || 0, ...SOCIAL_ICONS_MAP.tiktok },
      { id: 'linkedin', name: 'LinkedIn', count: counts.linkedin || 0, ...SOCIAL_ICONS_MAP.linkedin },
      { id: 'telegram', name: 'Telegram', count: counts.telegram || 0, ...SOCIAL_ICONS_MAP.telegram },
      { id: 'other', name: 'Other', count: counts.other || 0, ...SOCIAL_ICONS_MAP.other },
    ].filter(c => c.count > 0 || c.id === 'all');
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((service: any) => {
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const handleQuickAdd = (service: any) => {
    setQuickAddService(service.id);
    const effectivePrice = getEffectivePrice(service);
    
    setTimeout(() => {
      const existing = cart.find(item => item.service.id === service.id);
      if (existing) {
        setCart(cart.map(item => 
          item.service.id === service.id 
            ? { ...item, quantity: item.quantity + 1000 } 
            : item
        ));
      } else {
        setCart([...cart, { 
          service, 
          quantity: service.min_quantity || 1000, 
          targetUrl: '',
          effectivePrice 
        }]);
      }
      toast({ title: "Added to cart", description: service.name });
      setTimeout(() => setQuickAddService(null), 500);
    }, 200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const selectedCategoryData = categoriesWithCounts.find(c => c.id === selectedCategory);

  return (
    <BuyerLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 md:space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Services</h1>
            <p className="text-sm text-muted-foreground">Browse and order SMM services</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1">
              <LanguageSelector />
              <CurrencySelector />
            </div>
            <ShoppingCart
              cart={cart}
              setCart={setCart}
              buyerBalance={buyer?.balance || 0}
              buyerId={buyer?.id || ''}
              panelId={panel?.id || ''}
              onCheckoutComplete={refreshBuyer}
            />
          </div>
        </motion.div>

        {/* Mobile Category Filter Button */}
        <motion.div variants={itemVariants} className="lg:hidden">
          <Sheet open={mobileCategoryOpen} onOpenChange={setMobileCategoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>{selectedCategoryData?.name || 'All Services'}</span>
                </div>
                <Badge variant="secondary">{selectedCategoryData?.count || 0}</Badge>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
              <SheetHeader className="pb-4">
                <SheetTitle>Select Category</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="space-y-2 pb-6">
                  {categoriesWithCounts.map((cat) => {
                    const CategoryIcon = cat.icon;
                    const isActive = selectedCategory === cat.id;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setMobileCategoryOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent/50"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg",
                          isActive ? "bg-white/20" : cat.bgColor
                        )}>
                          <CategoryIcon 
                            className={cn(
                              "w-5 h-5",
                              isActive ? "text-current" : "text-white"
                            )} 
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{cat.name}</p>
                        </div>
                        <Badge variant={isActive ? "secondary" : "outline"}>
                          {cat.count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-9 bg-card/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Desktop Category Sidebar */}
          <motion.div variants={itemVariants} className="hidden lg:block lg:col-span-1">
            <Card className="glass-card sticky top-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
                  Categories
                </h3>
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-1">
                    {categoriesWithCounts.map((cat) => {
                      const CategoryIcon = cat.icon;
                      const isActive = selectedCategory === cat.id;

                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg",
                            isActive ? "bg-white/20" : cat.bgColor
                          )}>
                            <CategoryIcon 
                              className={cn(
                                "w-4 h-4",
                                isActive ? "text-current" : "text-white"
                              )} 
                              size={16} 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium text-sm truncate",
                              !isActive && "text-foreground"
                            )}>
                              {cat.name}
                            </p>
                          </div>
                          <Badge 
                            variant={isActive ? "secondary" : "outline"} 
                            className={cn(
                              "text-xs",
                              isActive && "bg-white/20 border-0"
                            )}
                          >
                            {cat.count}
                          </Badge>
                          {isActive && <ChevronRight className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Services List */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <div className="space-y-3">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredServices.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No services found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredServices.map((service: any) => {
                    const categoryData = getCategoryData(service.category);
                    const CategoryIcon = categoryData.icon;
                    const serviceEffectivePrice = getEffectivePrice(service);
                    const hasCustomPrice = customPrices.has(service.id);
                    const isQuickAdding = quickAddService === service.id;
                    const isInCart = cart.some(item => item.service.id === service.id);

                    return (
                      <motion.div
                        key={service.id}
                        variants={itemVariants}
                        layout
                      >
                        <Card 
                          className={cn(
                            "glass-card-hover cursor-pointer transition-all group",
                            isInCart && "border-green-500/30"
                          )}
                          onClick={() => navigate(`/new-order?service=${service.id}`)}
                        >
                          <CardContent className="p-3 md:p-4">
                            <div className="flex items-start gap-3 md:gap-4">
                              <div className={cn(
                                "p-2 md:p-3 rounded-xl shadow-lg shrink-0",
                                categoryData.bgColor
                              )}>
                                <CategoryIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="font-semibold text-sm md:text-base truncate">{service.name}</h3>
                                      {isInCart && (
                                        <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500 shrink-0">
                                          In Cart
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                      {service.description || 'High quality service'}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1">
                                      <p className="text-base md:text-lg font-bold">${serviceEffectivePrice.toFixed(2)}</p>
                                      {hasCustomPrice && (
                                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                          VIP
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-[10px] md:text-xs text-muted-foreground">per 1K</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 md:mt-3">
                                  <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {service.estimated_time || '0-24h'}
                                    </div>
                                    <div>
                                      Min: {service.min_quantity || 100}
                                    </div>
                                    <ServiceRating serviceId={service.id} size="sm" />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <FavoriteButton serviceId={service.id} size="sm" />
                                    <Button
                                      size="sm"
                                      variant={isInCart ? "secondary" : "ghost"}
                                      className={cn(
                                        "gap-1 h-7 md:h-8 text-xs transition-opacity",
                                        !isInCart && "opacity-0 group-hover:opacity-100"
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuickAdd(service);
                                      }}
                                      disabled={isQuickAdding}
                                    >
                                      {isQuickAdding ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <>
                                          <Plus className="w-3 h-3" />
                                          <span className="hidden sm:inline">Add</span>
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerServices;
