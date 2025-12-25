import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, 
  Search,
  ShoppingCart,
  Clock,
  Zap,
  Loader2,
  Plus,
  Check,
  ChevronRight
} from "lucide-react";
import { SOCIAL_ICONS_MAP, getIconByKey } from "@/components/icons/SocialIcons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTenant, useTenantServices } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";

interface CartItem {
  service: any;
  quantity: number;
  targetUrl: string;
}

const BuyerServices = () => {
  const { panel } = useTenant();
  const { buyer, refreshBuyer } = useBuyerAuth();
  const { services, loading } = useTenantServices(panel?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [quantity, setQuantity] = useState(1000);
  const [targetUrl, setTargetUrl] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [customPrices, setCustomPrices] = useState<Map<string, number>>(new Map());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quickAddService, setQuickAddService] = useState<string | null>(null);

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
    setTimeout(() => {
      const existing = cart.find(item => item.service.id === service.id);
      if (existing) {
        setCart(cart.map(item => 
          item.service.id === service.id 
            ? { ...item, quantity: item.quantity + 1000 } 
            : item
        ));
      } else {
        setCart([...cart, { service, quantity: 1000, targetUrl: '' }]);
      }
      toast({ title: "Added to cart", description: service.name });
      setTimeout(() => setQuickAddService(null), 500);
    }, 200);
  };

  const handleOrder = async () => {
    if (!selectedService || !buyer || !panel) {
      toast({ title: "Please select a service", variant: "destructive" });
      return;
    }
    if (!targetUrl) {
      toast({ title: "Please enter a target URL", variant: "destructive" });
      return;
    }
    if (quantity < (selectedService.min_quantity || 1)) {
      toast({ title: `Minimum quantity is ${selectedService.min_quantity || 1}`, variant: "destructive" });
      return;
    }

    const effectivePrice = getEffectivePrice(selectedService);
    const totalPrice = (effectivePrice * quantity) / 1000;
    
    // Check balance
    if ((buyer.balance || 0) < totalPrice) {
      toast({ 
        title: "Insufficient Balance", 
        description: `You need $${totalPrice.toFixed(2)} but only have $${(buyer.balance || 0).toFixed(2)}`,
        variant: "destructive" 
      });
      return;
    }

    setOrderLoading(true);
    try {
      // Generate order number
      const orderNumber = `ORD${Date.now()}`;

      // Create order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          panel_id: panel.id,
          buyer_id: buyer.id,
          service_id: selectedService.id,
          target_url: targetUrl,
          quantity,
          price: totalPrice,
          status: 'pending',
          progress: 0,
        });

      if (orderError) throw orderError;

      // Deduct balance
      const newBalance = (buyer.balance || 0) - totalPrice;
      const { error: balanceError } = await supabase
        .from('client_users')
        .update({ 
          balance: newBalance,
          total_spent: (buyer.total_spent || 0) + totalPrice,
        })
        .eq('id', buyer.id);

      if (balanceError) throw balanceError;

      // Refresh buyer data
      await refreshBuyer();

      toast({
        title: "Order Placed!",
        description: `Your order for ${quantity.toLocaleString()} ${selectedService.name} has been placed. Total: $${totalPrice.toFixed(2)}`,
      });

      setSelectedService(null);
      setTargetUrl("");
      setQuantity(1000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({ 
        title: "Order Failed", 
        description: "Failed to place order. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setOrderLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const effectivePrice = selectedService ? getEffectivePrice(selectedService) : 0;
  const totalPrice = selectedService ? (effectivePrice * quantity) / 1000 : 0;
  const hasEnoughBalance = (buyer?.balance || 0) >= totalPrice;

  return (
    <BuyerLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Services</h1>
            <p className="text-muted-foreground">Browse and order our SMM services</p>
          </div>
          {cart.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <ShoppingCart className="w-3 h-3" />
              {cart.length} items
            </Badge>
          )}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="glass-card sticky top-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
                  Categories
                </h3>
                <ScrollArea className="h-[calc(100vh-300px)] lg:h-auto">
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
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="space-y-3">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
                ))
              ) : filteredServices.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No services found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredServices.map((service: any) => {
                  const categoryData = getCategoryData(service.category);
                  const CategoryIcon = categoryData.icon;
                  const isSelected = selectedService?.id === service.id;
                  const serviceEffectivePrice = getEffectivePrice(service);
                  const hasCustomPrice = customPrices.has(service.id);
                  const isQuickAdding = quickAddService === service.id;

                  return (
                    <motion.div
                      key={service.id}
                      variants={itemVariants}
                      layout
                    >
                      <Card 
                        className={cn(
                          "glass-card-hover cursor-pointer transition-all group",
                          isSelected && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedService(service)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "p-3 rounded-xl shadow-lg",
                              categoryData.bgColor
                            )}>
                              <CategoryIcon className="w-6 h-6 text-white" size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold truncate">{service.name}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {service.description || 'High quality service with fast delivery'}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="flex items-center gap-1">
                                    <p className="text-lg font-bold">${serviceEffectivePrice.toFixed(2)}</p>
                                    {hasCustomPrice && (
                                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                        VIP
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">per 1K</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {service.estimated_time || '0-24 hours'}
                                  </div>
                                  <div>
                                    Min: {service.min_quantity || 100}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={cn(
                                    "gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                    isQuickAdding && "opacity-100"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAdd(service);
                                  }}
                                >
                                  <AnimatePresence mode="wait">
                                    {isQuickAdding ? (
                                      <motion.div
                                        key="check"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                      >
                                        <Check className="w-4 h-4 text-emerald-500" />
                                      </motion.div>
                                    ) : (
                                      <motion.div
                                        key="plus"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                      >
                                        <Plus className="w-4 h-4" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                  Quick Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Order Form */}
          <motion.div variants={itemVariants} className="lg:col-span-1 lg:sticky lg:top-4 h-fit">
            <Card className="glass-card">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Place Order</h2>
                    <p className="text-sm text-muted-foreground">Fill in the details below</p>
                  </div>
                </div>

                {selectedService ? (
                  <div className="glass-card p-4 bg-primary/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const catData = getCategoryData(selectedService.category);
                        const CatIcon = catData.icon;
                        return (
                          <div className={cn("p-2 rounded-lg", catData.bgColor)}>
                            <CatIcon className="w-4 h-4 text-white" size={16} />
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedService.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${getEffectivePrice(selectedService).toFixed(2)}/1K
                          {customPrices.has(selectedService.id) && (
                            <span className="text-emerald-500 ml-1">(VIP price)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-4 text-center rounded-xl border-dashed border-2">
                    <p className="text-sm text-muted-foreground">Select a service from the list</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Target URL</Label>
                  <Input
                    placeholder="https://..."
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    min={selectedService?.min_quantity || 1}
                    max={selectedService?.max_quantity || 100000}
                    className="bg-background/50"
                  />
                  {selectedService && (
                    <p className="text-xs text-muted-foreground">
                      Min: {selectedService.min_quantity || 100} | Max: {(selectedService.max_quantity || 10000).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Your Balance</span>
                    <span className={cn(
                      "font-medium",
                      hasEnoughBalance ? "text-emerald-500" : "text-destructive"
                    )}>
                      ${(buyer?.balance || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  
                  {!hasEnoughBalance && selectedService && (
                    <p className="text-xs text-destructive mb-2">
                      Insufficient balance. Please add funds.
                    </p>
                  )}
                  
                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    onClick={handleOrder}
                    disabled={!selectedService || orderLoading || !hasEnoughBalance}
                  >
                    {orderLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    {orderLoading ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerServices;