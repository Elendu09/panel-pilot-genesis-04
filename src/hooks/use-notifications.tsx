import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type NotificationType = "order" | "payment" | "system" | "provider" | "info" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const mapDbTypeToNotificationType = (dbType: string | null): NotificationType => {
  switch (dbType) {
    case 'order': return 'order';
    case 'payment': return 'payment';
    case 'system': return 'system';
    case 'provider': return 'provider';
    case 'warning': return 'warning';
    case 'error': return 'error';
    default: return 'info';
  }
};

const getActionUrlFromType = (type: string | null, title: string): string | undefined => {
  const lowTitle = title.toLowerCase();
  
  // Orders
  if (type === 'order' || lowTitle.includes('order')) return '/panel/orders';
  
  // Deposit from tenants -> Payment Methods (Transactions tab)
  if (lowTitle.includes('deposit') || lowTitle.includes('pending verification') || lowTitle.includes('manual transfer') || lowTitle.includes('buyer payment')) {
    return '/panel/payment-methods?tab=transactions';
  }
  
  // Subscription/balance/commission -> Billing  
  if (lowTitle.includes('subscription') || lowTitle.includes('commission') || lowTitle.includes('plan') || lowTitle.includes('balance')) {
    return '/panel/billing';
  }
  
  // Generic payment type -> Payment Methods
  if (type === 'payment') return '/panel/payment-methods?tab=transactions';
  
  if (type === 'provider' || lowTitle.includes('provider') || lowTitle.includes('sync')) return '/panel/providers';
  if (lowTitle.includes('domain') || lowTitle.includes('dns') || lowTitle.includes('ssl')) return '/panel/domain';
  if (lowTitle.includes('service')) return '/panel/services';
  if (lowTitle.includes('api')) return '/panel/api';
  if (lowTitle.includes('customer') || lowTitle.includes('user')) return '/panel/customers';
  
  return undefined;
};

export const useNotifications = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!profile?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('panel_notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mappedNotifications: Notification[] = (data || []).map(n => ({
        id: n.id,
        type: mapDbTypeToNotificationType(n.type),
        title: n.title,
        message: n.message,
        timestamp: new Date(n.created_at),
        read: n.is_read || false,
        actionUrl: getActionUrlFromType(n.type, n.title),
      }));

      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  // Set up realtime subscription
  useEffect(() => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    fetchNotifications();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'panel_notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const newNotif = payload.new as any;
          const notification: Notification = {
            id: newNotif.id,
            type: mapDbTypeToNotificationType(newNotif.type),
            title: newNotif.title,
            message: newNotif.message,
            timestamp: new Date(newNotif.created_at),
            read: newNotif.is_read || false,
            actionUrl: getActionUrlFromType(newNotif.type, newNotif.title),
          };
          setNotifications(prev => [notification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'panel_notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setNotifications(prev => 
            prev.map(n => n.id === updated.id ? { ...n, read: updated.is_read || false } : n)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'panel_notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const deleted = payload.old as any;
          setNotifications(prev => prev.filter(n => n.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    try {
      await supabase
        .from('panel_notifications')
        .update({ is_read: true })
        .eq('id', id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!profile?.id) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      await supabase
        .from('panel_notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [profile?.id]);

  const clearAll = useCallback(async () => {
    if (!profile?.id) return;

    // Optimistic update
    setNotifications([]);

    try {
      await supabase
        .from('panel_notifications')
        .delete()
        .eq('user_id', profile.id);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [profile?.id]);

  const addNotification = useCallback(async (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    if (!profile?.id) return;

    try {
      await supabase
        .from('panel_notifications')
        .insert({
          user_id: profile.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: false,
        });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }, [profile?.id]);

  const getByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
    getByType,
    refetch: fetchNotifications,
  };
};

export default useNotifications;
