import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OrderUpdate {
  id: string;
  order_number: string;
  status: string;
  progress: number;
  service_id?: string;
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  in_progress: 'In Progress',
  completed: 'Completed',
  partial: 'Partial',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const statusEmoji: Record<string, string> = {
  pending: '⏳',
  processing: '🔄',
  in_progress: '⚡',
  completed: '✅',
  partial: '⚠️',
  cancelled: '❌',
  refunded: '💰',
};

export function useBuyerRealtimeOrders(
  buyerId: string | undefined,
  panelId: string | undefined,
  onOrderUpdate?: (order: OrderUpdate) => void
) {
  const notificationPermissionRef = useRef<NotificationPermission>('default');

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        notificationPermissionRef.current = permission;
      });
    } else if ('Notification' in window) {
      notificationPermissionRef.current = Notification.permission;
    }
  }, []);

  // Send browser push notification
  const sendPushNotification = (title: string, body: string, orderNumber: string) => {
    if ('Notification' in window && notificationPermissionRef.current === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: `order-${orderNumber}`,
          requireInteraction: false,
        });
      } catch (e) {
        // Some browsers don't support Notification constructor
        console.log('Push notification not supported');
      }
    }
  };

  useEffect(() => {
    if (!buyerId || !panelId) return;

    // Subscribe to order updates for this buyer
    // Note: orders.buyer_id references profiles.id, not client_users.id
    // The buyer context stores the client_users.id, so we need to match that
    const channel = supabase
      .channel(`buyer-orders-${buyerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as OrderUpdate;
          const oldOrder = payload.old as OrderUpdate;

          // Only notify if status changed
          if (newOrder.status !== oldOrder.status) {
            const statusLabel = statusLabels[newOrder.status] || newOrder.status;
            const emoji = statusEmoji[newOrder.status] || '📦';

            // Show toast notification
            toast({
              title: `${emoji} Order #${newOrder.order_number}`,
              description: `Status updated to: ${statusLabel}`,
              duration: 5000,
            });

            // Send push notification
            sendPushNotification(
              `Order ${newOrder.order_number} Updated`,
              `Your order status is now: ${statusLabel}`,
              newOrder.order_number
            );

            // Call callback if provided
            onOrderUpdate?.(newOrder);
          } else if (newOrder.progress !== oldOrder.progress && newOrder.progress > 0) {
            // Progress update (only if significant)
            const progressDiff = newOrder.progress - (oldOrder.progress || 0);
            if (progressDiff >= 10) {
              toast({
                title: `📈 Order #${newOrder.order_number}`,
                description: `Progress: ${Math.round(newOrder.progress)}%`,
                duration: 3000,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as OrderUpdate;
          
          toast({
            title: `🎉 New Order Created`,
            description: `Order #${newOrder.order_number} has been placed`,
            duration: 5000,
          });

          onOrderUpdate?.(newOrder);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buyerId, panelId, onOrderUpdate]);

  return null;
}

export default useBuyerRealtimeOrders;
