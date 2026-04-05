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

  const hasEnoughBalance = buyerBalance >= cartTotal;

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

    try {
      const orderPromises = cart.map(async (item, index) => {
        const orderNumber = `ORD${Date.now()}${index}`;
        const price = (item.effectivePrice * item.quantity) / 1000;

        const { error } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            panel_id: panelId,
            buyer_id: buyerId,
            service_id: item.service.id,
            target_url: item.targetUrl,
            quantity: item.quantity,
            price,
            status: 'pending',
            progress: 0,
          });

        if (error) throw error;

        setCheckoutProgress(prev => prev + (100 / cart.length));
        setCompletedOrders(prev => [...prev, item.service.id]);

        return { orderNumber, price };
      });

      const results = await Promise.all(orderPromises);
      const totalPrice = results.reduce((sum, r) => sum + r.price, 0);

      // Deduct balance
      const newBalance = buyerBalance - totalPrice;
      await supabase
        .from('client_users')
        .update({ 
          balance: newBalance,
          total_spent: supabase.rpc ? totalPrice : totalPrice,
        })
        .eq('id', buyerId);

      toast({
        title: t('cart.order_placed'),
        description: `${cart.length} ${t('cart.items')}. ${t('common.total')}: ${formatPrice(totalPrice)}`,
      });

      setTimeout(async () => {
        await onClearCart();
        setOpen(false);
        onCheckoutComplete();
      }, 1500);

    } catch (error) {
      console.error('Checkout error:', error);
      toast({ 
        variant: "destructive", 
        title: "Checkout Failed", 
        description: "Some orders failed. Please try again." 
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
        await supabase
          .from('buyer_cart')
          .insert({
            buyer_id: buyerId,
            panel_id: panelId,
            service_id: item.service.id,
            quantity: item.quantity,
            target_url: item.targetUrl,
          });
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
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
          <TabsContent value="cart" className="flex-1 min-h-0 flex flex-col m-0 data-[state=active]:flex">
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
                <ScrollArea className="flex-1 px-6">
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-4 py-4">
                      {cart.map((item) => {
                        const categoryData = getCategoryData(item.service.category);
                        const CategoryIcon = categoryData.icon;
                        const lineTotal = (item.effectivePrice * item.quantity) / 1000;
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
                                      {formatPrice(item.effectivePrice)}/1K
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

                <div className="border-t p-6 space-y-4">
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
                      <span className="text-xl font-bold">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  {!hasEnoughBalance && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Insufficient balance. Please add {formatPrice(cartTotal - buyerBalance)} more.</span>
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
          <TabsContent value="bulk" className="flex-1 min-h-0 flex flex-col m-0 overflow-hidden data-[state=active]:flex">
            <ScrollArea className="h-0 flex-1">
              <div className="p-6 pt-4">
                <BulkAddForm
                  services={services}
                  getEffectivePrice={getEffectivePrice}
                  formatPrice={formatPrice}
                  onAddToCart={handleBulkAdd}
                  disabled={syncing}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Quick Repeat Tab */}
          <TabsContent value="repeat" className="flex-1 min-h-0 flex flex-col m-0 overflow-hidden data-[state=active]:flex">
            <ScrollArea className="h-0 flex-1">
              <div className="p-6 pt-4">
                <QuickRepeatOrder
                  services={services}
                  getEffectivePrice={getEffectivePrice}
                  formatPrice={formatPrice}
                  onAddToCart={handleBulkAdd}
                  disabled={syncing}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;
