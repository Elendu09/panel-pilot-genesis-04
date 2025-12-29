import { useState, useMemo, useEffect } from "react";
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
  ShoppingCart,
  Link as LinkIcon,
  Hash,
  ChevronDown,
  Info,
  Loader2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles
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
  
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1000);
  const [targetUrl, setTargetUrl] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [customPrices, setCustomPrices] = useState<Map<string, number>>(new Map());
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

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
        setSelectedCategory(service.category);
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

  // Get effective price for a service (custom or default)
  const getEffectivePrice = (service: any) => {
    return customPrices.get(service.id) ?? service.price;
  };

  // Group services by category
  const categoriesWithServices = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    services.forEach((s: any) => {
      if (!grouped[s.category]) {
        grouped[s.category] = [];
      }
      grouped[s.category].push(s);
    });
    
    return Object.entries(grouped).map(([category, categoryServices]) => ({
      id: category,
      name: SOCIAL_ICONS_MAP[category]?.label || category.charAt(0).toUpperCase() + category.slice(1),
      icon: SOCIAL_ICONS_MAP[category]?.icon || SOCIAL_ICONS_MAP.other.icon,
      color: SOCIAL_ICONS_MAP[category]?.color || SOCIAL_ICONS_MAP.other.color,
      bgColor: SOCIAL_ICONS_MAP[category]?.bgColor || SOCIAL_ICONS_MAP.other.bgColor,
      services: categoryServices.sort((a, b) => a.name.localeCompare(b.name)),
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [services]);

  // Get filtered services based on selected category
  const filteredServices = useMemo(() => {
    if (!selectedCategory) return [];
    const category = categoriesWithServices.find(c => c.id === selectedCategory);
    return category?.services || [];
  }, [selectedCategory, categoriesWithServices]);

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

      setOrderSuccess(true);
      toast({
        title: "Order Placed Successfully!",
        description: `Order #${orderNumber} - ${quantity.toLocaleString()} ${selectedService.name}`,
      });

      // Reset form after animation
      setTimeout(() => {
        setSelectedServiceId("");
        setTargetUrl("");
        setQuantity(1000);
        setAppliedPromo(null);
        setOrderSuccess(false);
        navigate('/orders');
      }, 1500);
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
              <ShoppingCart className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">New Order</h1>
              <p className="text-sm text-muted-foreground">Place a new service order</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CurrencySelector />
            <LanguageSelector />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Order Form - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesWithServices.map((category) => {
                        const CategoryIcon = category.icon;
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-3">
                              <div className={cn("p-1.5 rounded-md", category.bgColor)}>
                                <CategoryIcon className="w-4 h-4 text-white" />
                              </div>
                              <span>{category.name}</span>
                              <Badge variant="secondary" className="ml-auto">
                                {category.services.length}
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Service</Label>
                  <Select 
                    value={selectedServiceId} 
                    onValueChange={handleServiceChange}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={selectedCategory ? "Select a service" : "Select a category first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredServices.map((service: any) => {
                        const price = getEffectivePrice(service);
                        const catData = getCategoryData(service.category);
                        const CatIcon = catData.icon;
                        return (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center gap-3 w-full">
                              <div className={cn("p-1 rounded", catData.bgColor)}>
                                <CatIcon className="w-3 h-3 text-white" />
                              </div>
                              <span className="truncate max-w-[220px]">{service.name}</span>
                              <Badge variant="outline" className="shrink-0 ml-auto">
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
                              className="w-full justify-between h-auto py-3 px-4 bg-muted/50 hover:bg-muted"
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
                              {(() => {
                                const catData = getCategoryData(selectedService.category);
                                const CatIcon = catData.icon;
                                return (
                                  <div className={cn("p-2 rounded-lg", catData.bgColor)}>
                                    <CatIcon className="w-5 h-5 text-white" />
                                  </div>
                                );
                              })()}
                              <div>
                                <p className="font-semibold text-foreground">{selectedService.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{selectedService.category}</p>
                              </div>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {selectedService.description || "No description available for this service."}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Badge variant="secondary" className="gap-1">
                                <span className="text-muted-foreground">Min:</span> {selectedService.min_quantity?.toLocaleString() || 1}
                              </Badge>
                              <Badge variant="secondary" className="gap-1">
                                <span className="text-muted-foreground">Max:</span> {selectedService.max_quantity?.toLocaleString() || 'No limit'}
                              </Badge>
                              {selectedService.estimated_time && (
                                <Badge variant="secondary" className="gap-1">
                                  <span className="text-muted-foreground">Time:</span> {selectedService.estimated_time}
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        </CollapsibleContent>
                      </Collapsible>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Quantity Presets */}
                {selectedService && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Quick Select
                    </Label>
                    <QuantityPresets
                      onSelect={setQuantity}
                      selectedQuantity={quantity}
                      pricePerUnit={effectivePrice}
                      minQuantity={selectedService.min_quantity}
                      maxQuantity={selectedService.max_quantity}
                      category={selectedService.category}
                      formatPrice={formatPrice}
                    />
                  </motion.div>
                )}

                {/* Target URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Target URL / Link
                  </Label>
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <Input
                      placeholder="https://instagram.com/your-profile"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="h-12"
                    />
                  </motion.div>
                </div>

                {/* Custom Quantity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Custom Quantity
                    </Label>
                    {selectedService && (
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Min: {selectedService.min_quantity?.toLocaleString() || 1}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Max: {selectedService.max_quantity?.toLocaleString() || '∞'}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    min={selectedService?.min_quantity || 1}
                    max={selectedService?.max_quantity || 1000000}
                    className="h-12"
                  />
                </div>

                {/* Promo Code */}
                {panel?.id && (
                  <PromoCodeInput
                    panelId={panel.id}
                    orderAmount={baseTotal}
                    onApply={setAppliedPromo}
                    appliedPromo={appliedPromo}
                  />
                )}

                {/* Price Summary */}
                <motion.div 
                  className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
                  layout
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Price per 1000</span>
                    <span className="font-medium">{formatPrice(effectivePrice)}</span>
                  </div>
                  
                  {promoDiscount > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center justify-between mb-2 text-chart-2"
                    >
                      <span className="text-sm">Promo Discount</span>
                      <span className="font-medium">-{formatPrice(promoDiscount)}</span>
                    </motion.div>
                  )}
                  
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <motion.span 
                      key={totalPrice}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-primary"
                    >
                      {formatPrice(totalPrice)}
                    </motion.span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">Your Balance</span>
                    <span className={cn(
                      "font-medium",
                      hasEnoughBalance ? "text-chart-2" : "text-destructive"
                    )}>
                      {formatPrice(buyer?.balance || 0)}
                    </span>
                  </div>
                </motion.div>

                {/* Insufficient Balance Warning */}
                <AnimatePresence>
                  {selectedService && !hasEnoughBalance && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="text-sm">
                        Insufficient balance. You need {formatPrice(totalPrice - (buyer?.balance || 0))} more.
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto border-destructive/30 hover:bg-destructive/10"
                        onClick={() => navigate('/deposit')}
                      >
                        Deposit
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Order Button */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button 
                    className="w-full h-14 text-lg font-semibold relative overflow-hidden"
                    disabled={!selectedService || !targetUrl || orderLoading || !hasEnoughBalance}
                    onClick={handleOrder}
                  >
                    <AnimatePresence mode="wait">
                      {orderSuccess ? (
                        <motion.div
                          key="success"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Order Placed!
                        </motion.div>
                      ) : orderLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Placing Order...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Place Order - {formatPrice(totalPrice)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </div>

          {/* Service Info Panel - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <ServiceInfoPanel service={selectedService} />
            </div>
          </div>
        </div>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerNewOrder;
