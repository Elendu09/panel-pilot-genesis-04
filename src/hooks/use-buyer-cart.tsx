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

export const useBuyerCart = ({ buyerId, panelId, services, getEffectivePrice }: UseBuyerCartOptions) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Fetch cart from Supabase
  const fetchCart = useCallback(async () => {
    if (!buyerId || !panelId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('buyer_cart')
        .select('*')
        .eq('buyer_id', buyerId)
        .eq('panel_id', panelId);

      if (error) throw error;

      // Map to CartItem format
      const cartItems: CartItem[] = (data || []).map(item => {
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
      // Check if item already exists
      const existingIndex = cart.findIndex(
        c => c.service.id === item.service.id && c.targetUrl === item.targetUrl
      );

      if (existingIndex >= 0) {
        // Update quantity
        const newQuantity = cart[existingIndex].quantity + item.quantity;
        await updateCartItem(cart[existingIndex].id!, { quantity: newQuantity });
        toast({ title: 'Cart updated', description: `Quantity updated to ${newQuantity}` });
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('buyer_cart')
          .insert({
            buyer_id: buyerId,
            panel_id: panelId,
            service_id: item.service.id,
            quantity: item.quantity,
            target_url: item.targetUrl,
          })
          .select()
          .single();

        if (error) throw error;

        setCart(prev => [...prev, { ...item, id: data.id }]);
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
      const updateData: any = {};
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.targetUrl !== undefined) updateData.target_url = updates.targetUrl;

      const { error } = await supabase
        .from('buyer_cart')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;

      setCart(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast({ variant: 'destructive', title: 'Failed to update cart' });
    } finally {
      setSyncing(false);
    }
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    setSyncing(true);
    try {
      const { error } = await supabase
        .from('buyer_cart')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setCart(prev => prev.filter(item => item.id !== itemId));
      toast({ title: 'Removed from cart' });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({ variant: 'destructive', title: 'Failed to remove from cart' });
    } finally {
      setSyncing(false);
    }
  }, []);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!buyerId || !panelId) return;

    setSyncing(true);
    try {
      const { error } = await supabase
        .from('buyer_cart')
        .delete()
        .eq('buyer_id', buyerId)
        .eq('panel_id', panelId);

      if (error) throw error;

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
