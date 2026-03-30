import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  id?: string;
  service: any;
  quantity: number;
  targetUrl: string;
  effectivePrice: number;
}

interface UseBuyerCartOptions {
  buyerId: string | null;
  panelId: string | null;
  services: any[];
  getEffectivePrice: (service: any) => number;
}

// Route cart operations through buyer-api edge function to bypass RLS
async function cartEdgeFn(action: string, payload: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke('buyer-api', {
    body: { action, ...payload },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export const useBuyerCart = ({ buyerId, panelId, services, getEffectivePrice }: UseBuyerCartOptions) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Fetch cart from edge function
  const fetchCart = useCallback(async () => {
    if (!buyerId || !panelId) {
      setLoading(false);
      return;
    }

    try {
      const data = await cartEdgeFn('cart-list', { buyerId, panelId });
      const items = data?.items || [];

      const cartItems: CartItem[] = items.map((item: any) => {
        const service = services.find(s => s.id === item.service_id);
        if (!service) return null;
        return {
          id: item.id,
          service,
          quantity: item.quantity,
          targetUrl: item.target_url,
          effectivePrice: getEffectivePrice(service),
        };
      }).filter(Boolean) as CartItem[];

      setCart(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [buyerId, panelId, services, getEffectivePrice]);

  // Add item to cart
  const addToCart = useCallback(async (item: Omit<CartItem, 'id'>) => {
    if (!buyerId || !panelId) {
      toast({ variant: 'destructive', title: 'Please log in to add items to cart' });
      return false;
    }

    setSyncing(true);
    try {
      const existingIndex = cart.findIndex(
        c => c.service.id === item.service.id && c.targetUrl === item.targetUrl
      );

      if (existingIndex >= 0) {
        const newQuantity = cart[existingIndex].quantity + item.quantity;
        await cartEdgeFn('cart-update', { buyerId, panelId, itemId: cart[existingIndex].id, quantity: newQuantity });
        setCart(prev => prev.map((c, i) => i === existingIndex ? { ...c, quantity: newQuantity } : c));
        toast({ title: 'Cart updated', description: `Quantity updated to ${newQuantity}` });
      } else {
        const data = await cartEdgeFn('cart-add', {
          buyerId,
          panelId,
          serviceId: item.service.id,
          quantity: item.quantity,
          targetUrl: item.targetUrl,
        });
        setCart(prev => [...prev, { ...item, id: data?.id || data?.item?.id }]);
        toast({ title: 'Added to cart', description: item.service.name });
      }
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({ variant: 'destructive', title: 'Failed to add to cart' });
      return false;
    } finally {
      setSyncing(false);
    }
  }, [buyerId, panelId, cart]);

  // Update cart item
  const updateCartItem = useCallback(async (itemId: string, updates: Partial<{ quantity: number; targetUrl: string }>) => {
    setSyncing(true);
    try {
      await cartEdgeFn('cart-update', { buyerId, panelId, itemId, ...updates });
      setCart(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast({ variant: 'destructive', title: 'Failed to update cart' });
    } finally {
      setSyncing(false);
    }
  }, [buyerId, panelId]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    setSyncing(true);
    try {
      await cartEdgeFn('cart-remove', { buyerId, panelId, itemId });
      setCart(prev => prev.filter(item => item.id !== itemId));
      toast({ title: 'Removed from cart' });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({ variant: 'destructive', title: 'Failed to remove from cart' });
    } finally {
      setSyncing(false);
    }
  }, [buyerId, panelId]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!buyerId || !panelId) return;
    setSyncing(true);
    try {
      await cartEdgeFn('cart-clear', { buyerId, panelId });
      setCart([]);
      toast({ title: 'Cart cleared' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({ variant: 'destructive', title: 'Failed to clear cart' });
    } finally {
      setSyncing(false);
    }
  }, [buyerId, panelId]);

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => {
    return sum + (item.effectivePrice * item.quantity) / 1000;
  }, 0);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!buyerId || !panelId) return;

    const channel = supabase
      .channel('buyer-cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buyer_cart',
          filter: `buyer_id=eq.${buyerId}`
        },
        () => {
          fetchCart();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buyerId, panelId, fetchCart]);

  // Initial fetch
  useEffect(() => {
    if (services.length > 0) {
      fetchCart();
    }
  }, [fetchCart, services.length]);

  return {
    cart,
    loading,
    syncing,
    cartTotal,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };
};
