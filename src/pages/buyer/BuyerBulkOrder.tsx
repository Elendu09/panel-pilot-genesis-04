import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package,
  Layers,
  ArrowLeft,
  ShoppingCart as ShoppingCartIcon,
  Repeat,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTenant } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";
import ShoppingCart from "@/components/buyer/ShoppingCart";
import { CurrencySelector } from "@/components/buyer/CurrencySelector";
import { LanguageSelector } from "@/components/buyer/LanguageSelector";
import { BulkAddForm } from "@/components/buyer/BulkAddForm";
import { QuickRepeatOrder } from "@/components/buyer/QuickRepeatOrder";
import { useBuyerCart } from "@/hooks/use-buyer-cart";
import { useUnifiedServices } from "@/hooks/useUnifiedServices";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const BuyerBulkOrder = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
  const { buyer, refreshBuyer } = useBuyerAuth();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const [customPrices, setCustomPrices] = useState<Map<string, number>>(new Map());
  const [activeTab, setActiveTab] = useState("bulk");

  // Use unified services for consistent data across all buyer pages
  const { 
    services, 
    categories, 
    loading, 
    categoriesWithServices 
  } = useUnifiedServices({ panelId: panel?.id || null });

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

  // Handle bulk add to cart
  const handleBulkAddToCart = async (items: { service: any; quantity: number; targetUrl: string; effectivePrice: number }[]) => {
    for (const item of items) {
      await addToCart(item);
    }
    toast({
      title: "Added to Cart",
      description: `${items.length} items added to your cart`,
    });
  };

  // Get category display data
  const getCategoryData = (category: string) => {
    const catData = SOCIAL_ICONS_MAP[category.toLowerCase()] || SOCIAL_ICONS_MAP.other;
    return catData;
  };

  // Stats
  const totalServices = services.length;
  const totalCategories = categories.length;

  return (
    <BuyerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div 
              className="p-3 rounded-xl bg-primary/10"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Layers className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">{t('nav.bulk_order') || 'Bulk Order'}</h1>
              <p className="text-sm text-muted-foreground">Add multiple services at once</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Services</span>
              </div>
              <p className="text-xl font-bold">{totalServices.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Categories</span>
              </div>
              <p className="text-xl font-bold">{totalCategories}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCartIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Cart Items</span>
              </div>
              <p className="text-xl font-bold">{cart.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">Your Balance</span>
              </div>
              <p className="text-xl font-bold">{formatPrice(buyer?.balance || 0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Summary */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Available Categories ({totalCategories})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2 flex-wrap">
                {categoriesWithServices.map((cat) => {
                  const catData = getCategoryData(cat.slug);
                  const CatIcon = catData.icon;
                  return (
                    <Badge
                      key={cat.id}
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 cursor-default",
                        "hover:bg-accent transition-colors"
                      )}
                    >
                      <div className={cn("p-1 rounded", catData.bgColor)}>
                        <CatIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm">{cat.name}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({cat.services.length})
                      </span>
                    </Badge>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Bulk Order Tabs */}
        <Card>
          <CardHeader className="border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bulk" className="gap-2">
                  <Package className="w-4 h-4" />
                  Bulk Add
                </TabsTrigger>
                <TabsTrigger value="repeat" className="gap-2">
                  <Repeat className="w-4 h-4" />
                  Quick Repeat
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="bulk" className="mt-0">
                  <BulkAddForm
                    services={services}
                    getEffectivePrice={getEffectivePrice}
                    formatPrice={formatPrice}
                    onAddToCart={handleBulkAddToCart}
                    disabled={!buyer}
                  />
                </TabsContent>
                <TabsContent value="repeat" className="mt-0">
                  <QuickRepeatOrder
                    services={services}
                    getEffectivePrice={getEffectivePrice}
                    formatPrice={formatPrice}
                    onAddToCart={handleBulkAddToCart}
                    disabled={!buyer}
                  />
                </TabsContent>
              </Tabs>
            )}
            
            {!buyer && (
              <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Please <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>login</Button> to add items to your cart.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerBulkOrder;