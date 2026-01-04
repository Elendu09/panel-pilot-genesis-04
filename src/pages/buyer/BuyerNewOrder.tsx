import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ShoppingCart as ShoppingCartIcon,
  Link as LinkIcon,
  Hash,
  ChevronDown,
  Info,
  Loader2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Globe,
  Layers,
  Package,
  Plus,
  Users,
  Heart,
  Eye,
  MessageCircle,
  Share2,
  ThumbsUp,
  Play,
  UserPlus,
  Star,
  Bell,
  Bookmark
} from "lucide-react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTenant, useTenantServices } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";
import { QuantityPresets } from "@/components/buyer/QuantityPresets";
import { PromoCodeInput } from "@/components/buyer/PromoCodeInput";
import { ServiceInfoPanel } from "@/components/buyer/ServiceInfoPanel";
import { CurrencySelector } from "@/components/buyer/CurrencySelector";
import { LanguageSelector } from "@/components/buyer/LanguageSelector";
import { OrderSuccessModal } from "@/components/buyer/OrderSuccessModal";
import { detectServiceType, getSubCategory, ICON_CATEGORIES } from "@/lib/service-icon-detection";
import ShoppingCart from "@/components/buyer/ShoppingCart";
import { useBuyerCart } from "@/hooks/use-buyer-cart";

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount: number;
}

const BuyerNewOrder = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
  const { buyer, refreshBuyer } = useBuyerAuth();
  const { services, loading } = useTenantServices(panel?.id);
  const { formatPrice, convertPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const [customPrices, setCustomPrices] = useState<Map<string, number>>(new Map());
  
  // 3-Tier Selection State
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  
  const [quantity, setQuantity] = useState<number>(1000);
  const [targetUrl, setTargetUrl] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");
  const [placedServiceName, setPlacedServiceName] = useState("");
  const [placedQuantity, setPlacedQuantity] = useState(0);
  const [placedTotalPrice, setPlacedTotalPrice] = useState("");

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

  // Handle URL autofill
  useEffect(() => {
    if (!services.length) return;
    
    const serviceId = searchParams.get('service');
    const quantityParam = searchParams.get('quantity');
    const urlParam = searchParams.get('url');
    
    if (serviceId) {
      const service = services.find((s: any) => s.id === serviceId);
      if (service) {
        setSelectedNetwork(service.category);
        const subCat = getSubCategory(service.name);
        setSelectedCategory(subCat);
        setSelectedServiceId(service.id);
        if (quantityParam) setQuantity(parseInt(quantityParam) || service.min_quantity || 1000);
        else setQuantity(service.min_quantity || 1000);
        if (urlParam) setTargetUrl(decodeURIComponent(urlParam));
        
        toast({
          title: "Service Selected",
          description: `${service.name} has been pre-selected.`,
        });
      }
    }
  }, [services, searchParams]);


  // TIER 1: Group by Network (Platform)
  const networks = useMemo(() => {
    const networkMap = new Map<string, { services: any[]; count: number }>();
    
    services.forEach((s: any) => {
      const network = s.category || 'other';
      if (!networkMap.has(network)) {
        networkMap.set(network, { services: [], count: 0 });
      }
      networkMap.get(network)!.services.push(s);
      networkMap.get(network)!.count++;
    });

    return Array.from(networkMap.entries())
      .map(([id, data]) => ({
        id,
        name: SOCIAL_ICONS_MAP[id]?.label || id.charAt(0).toUpperCase() + id.slice(1),
        icon: SOCIAL_ICONS_MAP[id]?.icon || SOCIAL_ICONS_MAP.other.icon,
        color: SOCIAL_ICONS_MAP[id]?.color || SOCIAL_ICONS_MAP.other.color,
        bgColor: SOCIAL_ICONS_MAP[id]?.bgColor || SOCIAL_ICONS_MAP.other.bgColor,
        count: data.count,
        services: data.services,
      }))
      .sort((a, b) => b.count - a.count);
  }, [services]);

  // Helper function to get category icon based on category name
  const getCategoryIcon = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('follower')) return Users;
    if (lower.includes('like')) return Heart;
    if (lower.includes('view')) return Eye;
    if (lower.includes('comment')) return MessageCircle;
    if (lower.includes('share')) return Share2;
    if (lower.includes('subscriber')) return UserPlus;
    if (lower.includes('watch')) return Play;
    if (lower.includes('reaction')) return ThumbsUp;
    if (lower.includes('save')) return Bookmark;
    if (lower.includes('review') || lower.includes('rating')) return Star;
    if (lower.includes('notification')) return Bell;
    return Layers;
  };

  // TIER 2: Group by Category (Sub-category within Network)
  const categories = useMemo(() => {
    if (!selectedNetwork) return [];
    
    const networkServices = services.filter((s: any) => s.category === selectedNetwork);
    const categoryMap = new Map<string, { services: any[]; count: number }>();
    
    networkServices.forEach((s: any) => {
      const subCat = getSubCategory(s.name);
      if (!categoryMap.has(subCat)) {
        categoryMap.set(subCat, { services: [], count: 0 });
      }
      categoryMap.get(subCat)!.services.push(s);
      categoryMap.get(subCat)!.count++;
    });

    return Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        id: name,
        name,
        count: data.count,
        services: data.services,
        icon: getCategoryIcon(name),
      }))
      .sort((a, b) => b.count - a.count);
  }, [selectedNetwork, services]);

  // TIER 3: Get filtered services based on Network + Category
  const filteredServices = useMemo(() => {
    if (!selectedCategory) return [];
    const category = categories.find(c => c.id === selectedCategory);
    return category?.services?.sort((a: any, b: any) => a.name.localeCompare(b.name)) || [];
  }, [selectedCategory, categories]);

  // Get selected service
  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return services.find((s: any) => s.id === selectedServiceId);
  }, [selectedServiceId, services]);

  // Calculate total price with promo
  const effectivePrice = selectedService ? getEffectivePrice(selectedService) : 0;
  const baseTotal = selectedService ? (effectivePrice * quantity) / 1000 : 0;
  
  const promoDiscount = useMemo(() => {
    if (!appliedPromo || baseTotal === 0) return 0;
    if (appliedPromo.discount_type === 'percent') {
      return baseTotal * (appliedPromo.discount_value / 100);
    }
    return Math.min(appliedPromo.discount_value, baseTotal);
  }, [appliedPromo, baseTotal]);
  
  const totalPrice = baseTotal - promoDiscount;
  const hasEnoughBalance = (buyer?.balance || 0) >= totalPrice;

  // Handle network change
  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
    setSelectedCategory("");
    setSelectedServiceId("");
    setQuantity(1000);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedServiceId("");
    setQuantity(1000);
  };

  // Handle service change
  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find((s: any) => s.id === serviceId);
    if (service) {
      setQuantity(service.min_quantity || 1000);
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!selectedService) {
      toast({ title: "Please select a service", variant: "destructive" });
      return;
    }
    if (!targetUrl) {
      toast({ title: "Please enter a target URL", variant: "destructive" });
      return;
    }

    await addToCart({
      service: selectedService,
      quantity,
      targetUrl,
      effectivePrice: getEffectivePrice(selectedService),
    });

    // Reset form
    setSelectedServiceId("");
    setTargetUrl("");
    setQuantity(1000);
  };

  // Handle order
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
    if (quantity > (selectedService.max_quantity || 1000000)) {
      toast({ title: `Maximum quantity is ${selectedService.max_quantity || 1000000}`, variant: "destructive" });
      return;
    }

    if (!hasEnoughBalance) {
      toast({ 
        title: "Insufficient Balance", 
        description: `You need ${formatPrice(totalPrice)} but only have ${formatPrice(buyer.balance || 0)}`,
        variant: "destructive" 
      });
      return;
    }

    setOrderLoading(true);
    try {
      const orderNumber = `ORD${Date.now()}`;

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
          notes: appliedPromo ? `Promo: ${appliedPromo.code}` : null,
        });

      if (orderError) throw orderError;

      // Update promo code usage
      if (appliedPromo) {
        await supabase
          .from('promo_codes')
          .update({ used_count: (appliedPromo as any).used_count + 1 })
          .eq('id', appliedPromo.id);
      }

      const newBalance = (buyer.balance || 0) - totalPrice;
      const { error: balanceError } = await supabase
        .from('client_users')
        .update({ 
          balance: newBalance,
          total_spent: (buyer.total_spent || 0) + totalPrice,
        })
        .eq('id', buyer.id);

      if (balanceError) throw balanceError;

      await refreshBuyer();

      // Store order details for success modal
      setPlacedOrderNumber(orderNumber);
      setPlacedServiceName(selectedService.name);
      setPlacedQuantity(quantity);
      setPlacedTotalPrice(formatPrice(totalPrice));
      setShowSuccessModal(true);
      
      toast({
        title: "Order Placed Successfully!",
        description: `Order #${orderNumber} - ${quantity.toLocaleString()} ${selectedService.name}`,
      });
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

  const getCategoryData = (categoryId: string) => {
    return SOCIAL_ICONS_MAP[categoryId] || SOCIAL_ICONS_MAP.other;
  };

  const selectedNetworkData = selectedNetwork ? getCategoryData(selectedNetwork) : null;

  return (
    <BuyerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header with Currency/Language */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-3 rounded-xl bg-primary/10"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCartIcon className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">New Order</h1>
              <p className="text-sm text-muted-foreground">Place a new service order</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
              services={services}
              getEffectivePrice={getEffectivePrice}
            />
            <CurrencySelector />
            <LanguageSelector />
          </div>
        </div>

        {/* Two Column Layout - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Order Form - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* TIER 1: Network Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Network
                  </Label>
                  <Select value={selectedNetwork} onValueChange={handleNetworkChange}>
                    <SelectTrigger className="h-12 sm:h-14 bg-background/50 border-2 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Select a network (e.g., Instagram, Facebook)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[60vh] overflow-y-auto bg-background border shadow-lg z-50">
                      {networks.map((network) => {
                        const NetworkIcon = network.icon;
                        return (
                          <SelectItem key={network.id} value={network.id}>
                            <div className="flex items-center gap-3 py-1">
                              <div className={cn("p-2 rounded-lg", network.bgColor)}>
                                <NetworkIcon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">{network.name}</span>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                {network.count}
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* TIER 2: Category Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Category
                  </Label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={handleCategoryChange}
                    disabled={!selectedNetwork}
                  >
                    <SelectTrigger className={cn(
                      "h-12 sm:h-14 bg-background/50 border-2 transition-colors",
                      selectedNetwork ? "hover:border-primary/50" : "opacity-60"
                    )}>
                      <SelectValue placeholder={selectedNetwork ? "Select a category (e.g., Followers, Likes)" : "Select a network first"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[60vh] overflow-y-auto bg-background border shadow-lg z-50">
                      {categories.map((category) => {
                        const CategoryIcon = category.icon;
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-3 py-1">
                              <div className={cn(
                                "p-1.5 rounded-md",
                                selectedNetworkData?.bgColor || "bg-primary/10"
                              )}>
                                <CategoryIcon className="w-3 h-3 text-white" />
                              </div>
                              <span className="font-medium">{category.name}</span>
                              <Badge variant="outline" className="ml-auto">
                                {category.count}
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* TIER 3: Service Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Service
                  </Label>
                  <Select 
                    value={selectedServiceId} 
                    onValueChange={handleServiceChange}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger className={cn(
                      "h-12 sm:h-14 bg-background/50 border-2 transition-colors",
                      selectedCategory ? "hover:border-primary/50" : "opacity-60"
                    )}>
                      <SelectValue placeholder={selectedCategory ? "Select a service" : "Select a category first"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[60vh] overflow-y-auto bg-background border shadow-lg z-50">
                      {filteredServices.map((service: any) => {
                        const price = getEffectivePrice(service);
                        const serviceType = detectServiceType(service.name);
                        const ServiceTypeIcon = getCategoryIcon(selectedCategory);
                        return (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center gap-3 w-full py-1">
                              <div className={cn(
                                "p-1.5 rounded-md shrink-0",
                                selectedNetworkData?.bgColor || "bg-primary/10"
                              )}>
                                <ServiceTypeIcon className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm truncate block max-w-[140px] sm:max-w-[200px]">
                                    {service.name}
                                  </span>
                                  <Badge variant="secondary" className="text-[10px] font-mono px-1 py-0 h-4 shrink-0">
                                    ID: {service.provider_service_id || service.id?.slice(0, 6)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="text-xs text-muted-foreground">
                                    Min: {(service.min_quantity || 100).toLocaleString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                                  <span className="text-xs text-muted-foreground hidden sm:inline">
                                    Max: {(service.max_quantity || 10000).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <Badge variant="outline" className="shrink-0 font-mono text-xs">
                                {formatPrice(price)}/1k
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Description - Collapsible */}
                <AnimatePresence>
                  {selectedService && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Collapsible open={descriptionOpen} onOpenChange={setDescriptionOpen}>
                        <CollapsibleTrigger asChild>
                          <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-between h-auto py-3 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-foreground border border-blue-200/50 dark:border-blue-800/50"
                            >
                              <div className="flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                <span>Read more about this service</span>
                              </div>
                              <motion.div
                                animate={{ rotate: descriptionOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </motion.div>
                            </Button>
                          </motion.div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 mt-2 rounded-lg bg-card border border-border space-y-3"
                          >
                            <div className="flex items-center gap-2">
                              {selectedNetworkData && (
                                <div className={cn("p-2 rounded-lg", selectedNetworkData.bgColor)}>
                                  <selectedNetworkData.icon className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold">{selectedService.name}</h4>
                                <p className="text-xs text-muted-foreground">{selectedService.category}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {selectedService.description || "High-quality service with fast delivery and great results. Satisfaction guaranteed."}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="gap-1">
                                <Hash className="w-3 h-3" />
                                Min: {selectedService.min_quantity || 100}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Hash className="w-3 h-3" />
                                Max: {selectedService.max_quantity || 10000}
                              </Badge>
                              <Badge variant="secondary" className="gap-1">
                                <Zap className="w-3 h-3" />
                                Fast Delivery
                              </Badge>
                            </div>
                          </motion.div>
                        </CollapsibleContent>
                      </Collapsible>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quantity Presets */}
                <AnimatePresence>
                  {selectedService && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <QuantityPresets 
                        onSelect={setQuantity}
                        selectedQuantity={quantity}
                        pricePerUnit={effectivePrice}
                        minQuantity={selectedService.min_quantity || 100}
                        maxQuantity={selectedService.max_quantity || 100000}
                        category={selectedService.category}
                        formatPrice={formatPrice}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Target URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-primary" />
                    Target URL
                  </Label>
                  <Input
                    placeholder="https://instagram.com/username or post link"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="h-12 bg-background/50 border-2 focus:border-primary"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    Quantity
                  </Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    min={selectedService?.min_quantity || 1}
                    max={selectedService?.max_quantity || 1000000}
                    className="h-12 bg-background/50 border-2 focus:border-primary font-mono"
                  />
                  {selectedService && (
                    <p className="text-xs text-muted-foreground">
                      Range: {(selectedService.min_quantity || 100).toLocaleString()} - {(selectedService.max_quantity || 100000).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Promo Code */}
                <PromoCodeInput 
                  panelId={panel?.id}
                  orderAmount={baseTotal}
                  onApply={setAppliedPromo}
                  appliedPromo={appliedPromo}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price Summary */}
          <div className="space-y-6">
            <Card className="sticky top-20 overflow-hidden border-0 shadow-lg max-h-[calc(100vh-6rem)] overflow-y-auto">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {selectedService ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service</span>
                        <span className="font-medium truncate max-w-[180px]">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium">{quantity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price/1K</span>
                        <span className="font-medium">{formatPrice(effectivePrice)}</span>
                      </div>
                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-{formatPrice(promoDiscount)}</span>
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Balance</span>
                      <span className={cn(
                        "font-medium",
                        hasEnoughBalance ? "text-green-600" : "text-destructive"
                      )}>
                        {formatPrice(buyer?.balance || 0)}
                      </span>
                    </div>

                    {!hasEnoughBalance && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>Insufficient balance</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => navigate('/deposit')}
                        >
                          Add Funds
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button 
                        onClick={handleOrder}
                        disabled={!hasEnoughBalance || orderLoading || !targetUrl}
                        className="w-full h-12 text-base font-medium gap-2"
                      >
                        {orderLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                        {orderLoading ? "Processing..." : "Place Order"}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={handleAddToCart}
                        disabled={!selectedService || !targetUrl}
                        className="w-full h-12 text-base font-medium gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add to Cart
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCartIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">
                      Select a service to see pricing
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Info Panel */}
            {selectedService && <ServiceInfoPanel service={selectedService} />}
          </div>
        </div>
      </motion.div>

      {/* Success Modal */}
      <OrderSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        orderNumber={placedOrderNumber}
        serviceName={placedServiceName}
        quantity={placedQuantity}
        totalPrice={placedTotalPrice}
        onNewOrder={() => {
          setShowSuccessModal(false);
          setSelectedServiceId("");
          setTargetUrl("");
          setQuantity(1000);
          setAppliedPromo(null);
        }}
      />
    </BuyerLayout>
  );
};

export default BuyerNewOrder;
