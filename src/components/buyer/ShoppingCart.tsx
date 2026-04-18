import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart as CartIcon, 
  Trash2, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Zap,
  X,
  RefreshCw,
  Layers,
  Repeat
} from "lucide-react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/hooks/use-buyer-cart";
import { BulkAddForm } from "./BulkAddForm";
import { QuickRepeatOrder } from "./QuickRepeatOrder";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShoppingCartProps {
  cart: CartItem[];
  cartTotal: number;
  syncing: boolean;
  buyerBalance: number;
  buyerId: string;
  panelId: string;
  formatPrice: (amount: number) => string;
  onUpdateItem: (itemId: string, updates: Partial<{ quantity: number; targetUrl: string }>) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onClearCart: () => Promise<void>;
  onCheckoutComplete: () => void;
  services?: any[];
  getEffectivePrice?: (service: any) => number;
}

const ShoppingCart = ({ 
  cart, 
  cartTotal,
  syncing,
  buyerBalance, 
  buyerId, 
  panelId,
  formatPrice,
  onUpdateItem,
  onRemoveItem,
  onClearCart,
  onCheckoutComplete,
  services = [],
  getEffectivePrice = (s) => s.price,
}: ShoppingCartProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutProgress, setCheckoutProgress] = useState(0);
  const [completedOrders, setCompletedOrders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("cart");

  const getCategoryData = (categoryId: string) => {
    return SOCIAL_ICONS_MAP[categoryId] || SOCIAL_ICONS_MAP.other;
  };

  const liveCartTotal = cart.reduce((sum, item) => sum + (getEffectivePrice(item.service) * item.quantity) / 1000, 0);
  const hasEnoughBalance = buyerBalance >= liveCartTotal;

  const validateCart = () => {
    const errors: string[] = [];
    cart.forEach(item => {
      if (!item.targetUrl.trim()) {
        errors.push(`${item.service.name}: Target URL required`);
      }
      if (item.quantity < (item.service.min_quantity || 1)) {
        errors.push(`${item.service.name}: Quantity below minimum`);
      }
    });
    return errors;
  };

  const handleBulkCheckout = async () => {
    const errors = validateCart();
    if (errors.length > 0) {
      toast({ 
        variant: "destructive", 
        title: "Validation Error", 
        description: errors[0] 
      });
      return;
    }

    if (!hasEnoughBalance) {
      toast({ 
        variant: "destructive", 
        title: "Insufficient Balance", 
        description: `You need ${formatPrice(cartTotal)} but only have ${formatPrice(buyerBalance)}` 
      });
      return;
    }

    setCheckoutLoading(true);
    setCheckoutProgress(0);
    setCompletedOrders([]);

    const failed: string[] = [];

    try {
      for (let index = 0; index < cart.length; index++) {
        const item = cart[index];
        try {
          const { data, error } = await supabase.functions.invoke('buyer-api', {
            body: {
              key: '__buyer_id_auth__',
              action: 'add',
              buyerId,
              panelId,
              service: item.service.id,
              link: item.targetUrl,
              quantity: item.quantity,
            },
          });

          if (error) throw error;
          if (data?.error) throw new Error(data.error);

          setCheckoutProgress(((index + 1) / cart.length) * 100);
          setCompletedOrders(prev => [...prev, item.service.id]);
        } catch (itemErr: any) {
          console.error(`Order failed for ${item.service.name}:`, itemErr);
          failed.push(item.service.name);
        }
      }

      if (failed.length === cart.length) {
        throw new Error(failed[0] || 'All orders failed');
      }

      const successCount = cart.length - failed.length;
      toast({
        title: t('cart.order_placed'),
        description: failed.length > 0
          ? `${successCount} order(s) placed. ${failed.length} failed: ${failed.join(', ')}`
          : `${successCount} ${t('cart.items')} ordered successfully.`,
        variant: failed.length > 0 ? 'destructive' : 'default',
      });

      setTimeout(async () => {
        await onClearCart();
        setOpen(false);
        onCheckoutComplete();
      }, 1500);

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({ 
        variant: "destructive", 
        title: "Checkout Failed", 
        description: error.message || "Some orders failed. Please try again." 
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Handle bulk add from BulkAddForm or QuickRepeatOrder
  const handleBulkAdd = async (items: { service: any; quantity: number; targetUrl: string; effectivePrice: number }[]) => {
    if (!buyerId || !panelId) {
      toast({ variant: 'destructive', title: 'Please log in to add items to cart' });
      return;
    }

    try {
      for (const item of items) {
        const { data: addData, error: addError } = await supabase.functions.invoke('buyer-api', {
          body: {
            action: 'cart-add',
            buyerId,
            panelId,
            serviceId: item.service.id,
            quantity: item.quantity,
            targetUrl: item.targetUrl,
          },
        });
        if (addError) throw addError;
        if (addData?.error) throw new Error(addData.error);
      }

      toast({ 
        title: 'Added to cart', 
        description: `${items.length} item${items.length > 1 ? 's' : ''} added` 
      });

      // Switch to cart tab to show added items
      setActiveTab("cart");
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({ variant: 'destructive', title: 'Failed to add items to cart' });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2 h-9">
          <CartIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Cart</span>
          {cart.length > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-in zoom-in"
            >
              {cart.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2">
            <CartIcon className="w-5 h-5" />
            {t('cart.title')}
            <Badge variant="secondary" className="ml-2">{cart.length} {t('cart.items')}</Badge>
            {syncing && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
          </SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 sm:mx-6 mt-4 grid grid-cols-3 text-[10px] sm:text-xs">
            <TabsTrigger value="cart" className="gap-1 sm:gap-1.5 px-1 sm:px-2">
              <CartIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ({cart.length})
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-1 sm:gap-1.5 px-1 sm:px-2">
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Mass Order
            </TabsTrigger>
            <TabsTrigger value="repeat" className="gap-1 sm:gap-1.5 px-1 sm:px-2">
              <Repeat className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Repeat
            </TabsTrigger>
          </TabsList>

          {/* Cart Tab */}
          <TabsContent value="cart" className="flex-1 flex flex-col m-0 min-h-0 data-[state=active]:flex">
            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center px-6">
                <div className="text-center">
                  <CartIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('cart.empty')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('services.add_to_cart')}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setActiveTab("bulk")}
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    {t('cart.bulk_add')}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 min-h-0 px-6">
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-4 py-4">
                      {cart.map((item) => {
                        const categoryData = getCategoryData(item.service.category);
                        const CategoryIcon = categoryData.icon;
                        const livePrice = getEffectivePrice(item.service);
                        const lineTotal = (livePrice * item.quantity) / 1000;
                        const isCompleted = completedOrders.includes(item.service.id);

                        return (
                          <motion.div
                            key={item.id || item.service.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={cn(
                              "p-4 rounded-xl border bg-card/50 transition-all",
                              isCompleted && "border-green-500/50 bg-green-500/5"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn("p-2 rounded-lg shrink-0", categoryData.bgColor)}>
                                <CategoryIcon className="w-4 h-4 text-white" size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-medium text-sm truncate">{item.service.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatPrice(getEffectivePrice(item.service))}/1K
                                    </p>
                                  </div>
                                  {isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                                      onClick={() => item.id && onRemoveItem(item.id)}
                                      disabled={checkoutLoading || syncing}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>

                                  <div className="mt-3 space-y-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">{t('orders.target_url')}</Label>
                                    <Input
                                      placeholder="https://..."
                                      value={item.targetUrl}
                                      onChange={(e) => item.id && onUpdateItem(item.id, { targetUrl: e.target.value })}
                                      className="h-8 text-sm bg-background/50"
                                      disabled={checkoutLoading || syncing}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 space-y-1">
                                      <Label className="text-xs">{t('common.quantity')}</Label>
                                      <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => item.id && onUpdateItem(item.id, { 
                                          quantity: Math.max(item.service.min_quantity || 1, parseInt(e.target.value) || 0) 
                                        })}
                                        min={item.service.min_quantity || 1}
                                        className="h-8 text-sm bg-background/50"
                                        disabled={checkoutLoading || syncing}
                                      />
                                    </div>
                                    <div className="text-right pt-5">
                                      <p className="font-bold">{formatPrice(lineTotal)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </AnimatePresence>
                </ScrollArea>

                <div className="border-t p-6 space-y-4 shrink-0">
                  {checkoutLoading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('cart.processing')}</span>
                        <span>{Math.round(checkoutProgress)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${checkoutProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('nav.your_balance')}</span>
                      <span className={cn(
                        "font-medium",
                        hasEnoughBalance ? "text-green-500" : "text-destructive"
                      )}>
                        {formatPrice(buyerBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t('common.total')} ({cart.length} {t('cart.items')})</span>
                      <span className="text-xl font-bold">{formatPrice(liveCartTotal)}</span>
                    </div>
                  </div>

                  {!hasEnoughBalance && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Insufficient balance. Please add {formatPrice(liveCartTotal - buyerBalance)} more.</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      onClick={onClearCart}
                      disabled={checkoutLoading || syncing}
                      className="flex-1"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('cart.clear')}
                    </Button>
                    <Button 
                      onClick={handleBulkCheckout}
                      disabled={!hasEnoughBalance || checkoutLoading || syncing || cart.length === 0}
                      className="flex-1 gap-2"
                      size="sm"
                    >
                      {checkoutLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      {checkoutLoading ? t('cart.processing') : t('cart.checkout')}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Bulk Add Tab */}
          <TabsContent value="bulk" className="flex-1 flex flex-col m-0 min-h-0 data-[state=active]:flex">
            <div className="flex-1 overflow-y-auto min-h-0 px-6 pt-4 pb-6">
              <BulkAddForm
                services={services}
                getEffectivePrice={getEffectivePrice}
                formatPrice={formatPrice}
                onAddToCart={handleBulkAdd}
                disabled={syncing}
              />
            </div>
          </TabsContent>

          {/* Quick Repeat Tab */}
          <TabsContent value="repeat" className="flex-1 flex flex-col m-0 min-h-0 data-[state=active]:flex">
            <div className="flex-1 overflow-y-auto min-h-0 px-6 pt-4 pb-6">
              <QuickRepeatOrder
                services={services}
                getEffectivePrice={getEffectivePrice}
                formatPrice={formatPrice}
                onAddToCart={handleBulkAdd}
                disabled={syncing}
              />
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;
