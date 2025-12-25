import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart as CartIcon, 
  Trash2, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Zap,
  X
} from "lucide-react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  service: any;
  quantity: number;
  targetUrl: string;
  effectivePrice: number;
}

interface ShoppingCartProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  buyerBalance: number;
  buyerId: string;
  panelId: string;
  onCheckoutComplete: () => void;
}

const ShoppingCart = ({ 
  cart, 
  setCart, 
  buyerBalance, 
  buyerId, 
  panelId,
  onCheckoutComplete 
}: ShoppingCartProps) => {
  const [open, setOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutProgress, setCheckoutProgress] = useState(0);
  const [completedOrders, setCompletedOrders] = useState<string[]>([]);

  const getCategoryData = (categoryId: string) => {
    return SOCIAL_ICONS_MAP[categoryId] || SOCIAL_ICONS_MAP.other;
  };

  const updateCartItem = (serviceId: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(item => 
      item.service.id === serviceId ? { ...item, ...updates } : item
    ));
  };

  const removeFromCart = (serviceId: string) => {
    setCart(prev => prev.filter(item => item.service.id !== serviceId));
    toast({ title: "Removed from cart" });
  };

  const clearCart = () => {
    setCart([]);
    setCompletedOrders([]);
    toast({ title: "Cart cleared" });
  };

  const cartTotal = cart.reduce((sum, item) => {
    return sum + (item.effectivePrice * item.quantity) / 1000;
  }, 0);

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
        description: `You need $${cartTotal.toFixed(2)} but only have $${buyerBalance.toFixed(2)}` 
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
        title: "Orders Placed Successfully!",
        description: `${cart.length} orders placed. Total: $${totalPrice.toFixed(2)}`,
      });

      setTimeout(() => {
        setCart([]);
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <CartIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Cart</span>
          {cart.length > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {cart.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CartIcon className="w-5 h-5" />
            Shopping Cart
            <Badge variant="secondary" className="ml-2">{cart.length} items</Badge>
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <CartIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add services to get started
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <AnimatePresence mode="popLayout">
                <div className="space-y-4 py-4">
                  {cart.map((item) => {
                    const categoryData = getCategoryData(item.service.category);
                    const CategoryIcon = categoryData.icon;
                    const lineTotal = (item.effectivePrice * item.quantity) / 1000;
                    const isCompleted = completedOrders.includes(item.service.id);

                    return (
                      <motion.div
                        key={item.service.id}
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
                                  ${item.effectivePrice.toFixed(2)}/1K
                                </p>
                              </div>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeFromCart(item.service.id)}
                                  disabled={checkoutLoading}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Target URL</Label>
                                <Input
                                  placeholder="https://..."
                                  value={item.targetUrl}
                                  onChange={(e) => updateCartItem(item.service.id, { targetUrl: e.target.value })}
                                  className="h-8 text-sm bg-background/50"
                                  disabled={checkoutLoading}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 space-y-1">
                                  <Label className="text-xs">Quantity</Label>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateCartItem(item.service.id, { 
                                      quantity: Math.max(item.service.min_quantity || 1, parseInt(e.target.value) || 0) 
                                    })}
                                    min={item.service.min_quantity || 1}
                                    className="h-8 text-sm bg-background/50"
                                    disabled={checkoutLoading}
                                  />
                                </div>
                                <div className="text-right pt-5">
                                  <p className="font-bold">${lineTotal.toFixed(2)}</p>
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

            <div className="border-t pt-4 space-y-4">
              {checkoutLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing orders...</span>
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
                  <span className="text-muted-foreground">Your Balance</span>
                  <span className={cn(
                    "font-medium",
                    hasEnoughBalance ? "text-green-500" : "text-destructive"
                  )}>
                    ${buyerBalance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total ({cart.length} items)</span>
                  <span className="text-xl font-bold">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {!hasEnoughBalance && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Insufficient balance. Please add ${(cartTotal - buyerBalance).toFixed(2)} more.</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  disabled={checkoutLoading}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button 
                  onClick={handleBulkCheckout}
                  disabled={!hasEnoughBalance || checkoutLoading || cart.length === 0}
                  className="flex-1 gap-2"
                >
                  {checkoutLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {checkoutLoading ? 'Processing...' : 'Checkout All'}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;
