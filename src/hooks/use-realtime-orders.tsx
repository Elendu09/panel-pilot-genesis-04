import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePanel } from "@/hooks/usePanel";
import { Bell } from "lucide-react";

interface OrderPayload {
  id: string;
  order_number: string;
  price: number;
  status: string;
  target_url: string;
  created_at: string;
  buyer_id: string;
  panel_id: string;
  service_id: string;
}

interface UseRealtimeOrdersOptions {
  enabled?: boolean;
  onNewOrder?: (order: OrderPayload) => void;
}

export const useRealtimeOrders = (options: UseRealtimeOrdersOptions = {}) => {
  const { enabled = true, onNewOrder } = options;
  const { panel } = usePanel();
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const playNotificationSound = useCallback(() => {
    // Create a simple notification beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880; // A5 note
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log("Could not play notification sound");
    }
  }, []);

  useEffect(() => {
    if (!enabled || !panel?.id) return;

    // Subscribe to new orders for this panel
    const channel = supabase
      .channel(`orders-panel-${panel.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `panel_id=eq.${panel.id}`,
        },
        (payload) => {
          const newOrder = payload.new as OrderPayload;
          console.log("New order received:", newOrder);

          // Play notification sound
          playNotificationSound();

          // Show toast notification
          toast({
            title: "🎉 New Order Received!",
            description: `Order #${newOrder.order_number} for $${Number(newOrder.price).toFixed(2)}`,
            duration: 5000,
          });

          // Call the callback if provided
          onNewOrder?.(newOrder);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `panel_id=eq.${panel.id}`,
        },
        (payload) => {
          const updatedOrder = payload.new as OrderPayload;
          const oldOrder = payload.old as OrderPayload;

          // Notify on status changes
          if (oldOrder.status !== updatedOrder.status) {
            toast({
              title: "Order Status Updated",
              description: `Order #${updatedOrder.order_number}: ${oldOrder.status} → ${updatedOrder.status}`,
              duration: 3000,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, panel?.id, toast, onNewOrder, playNotificationSound]);

  return {
    isSubscribed: !!channelRef.current,
  };
};
