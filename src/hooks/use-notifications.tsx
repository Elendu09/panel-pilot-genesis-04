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
  panelId?: string | null;
}

const mapDbTypeToNotificationType = (dbType: string | null, title?: string): NotificationType => {
  switch (dbType) {
    case 'order': return 'order';
    case 'payment': return 'payment';
    case 'system': return 'system';
    case 'provider': return 'provider';
    case 'warning': return 'warning';
    case 'error': return 'error';
  }
  
  if (title) {
    const low = title.toLowerCase();
    if (low.includes('payment') || low.includes('deposit') || low.includes('transfer') || low.includes('transaction') || low.includes('ad purchase')) return 'payment';
    if (low.includes('order')) return 'order';
    if (low.includes('provider') || low.includes('sync')) return 'provider';
  }
  
  return 'info';
};

const getActionUrlFromType = (type: string | null, title: string): string | undefined => {
  const lowTitle = title.toLowerCase();
  
  if (type === 'order' || lowTitle.includes('order')) return '/panel/orders';
  
  if (lowTitle.includes('ad purchase') || lowTitle.includes('promotion') || lowTitle.includes('advertis') || lowTitle.includes('promote') || lowTitle.includes('ad campaign')) {
    return '/panel/promote';
  }
  
  if (lowTitle.includes('deposit') || lowTitle.includes('pending verification') || lowTitle.includes('manual transfer') || lowTitle.includes('buyer payment')) {
    return '/panel/payments?tab=transactions';
  }
  
  if (lowTitle.includes('subscription') || lowTitle.includes('commission') || lowTitle.includes('plan') || lowTitle.includes('balance')) {
    return '/panel/billing';
  }
  
  if (type === 'payment') return '/panel/transactions';
  if (type === 'provider' || lowTitle.includes('provider') || lowTitle.includes('sync')) return '/panel/providers';
  if (lowTitle.includes('domain') || lowTitle.includes('dns') || lowTitle.includes('ssl')) return '/panel/domain';
  if (lowTitle.includes('service')) return '/panel/services';
  if (lowTitle.includes('api')) return '/panel/api';
  if (lowTitle.includes('customer') || lowTitle.includes('user')) return '/panel/customers';
  
  return undefined;
};

interface UseNotificationsOptions {
  panelId?: string | null;
}

export const useNotifications = (options?: UseNotificationsOptions) => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const panelId = options?.panelId;

  // Fetch notifications from database - filtered by panel if provided
  const fetchNotifications = useCallback(async () => {
    if (!profile?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('panel_notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Multi-panel support: filter by panel_id when provided
      if (panelId) {
        query = query.or(`panel_id.eq.${panelId},panel_id.is.null`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedNotifications: Notification[] = (data || []).map(n => ({
        id: n.id,
        type: mapDbTypeToNotificationType(n.type, n.title),
        title: n.title,
        message: n.message,
        timestamp: new Date(n.created_at),
        read: n.is_read || false,
        actionUrl: getActionUrlFromType(n.type, n.title),
        panelId: n.panel_id,
      }));

      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, panelId]);

  // Set up realtime subscription + polling fallback
  useEffect(() => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    fetchNotifications();

    // Realtime subscription for new/updated/deleted notifications
    const channel = supabase
      .channel(`notifications-realtime-${panelId || 'all'}`)
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
          // For multi-panel: only add if matches current panel or is global
          if (panelId && newNotif.panel_id && newNotif.panel_id !== panelId) return;
          
          const notification: Notification = {
            id: newNotif.id,
            type: mapDbTypeToNotificationType(newNotif.type, newNotif.title),
            title: newNotif.title,
            message: newNotif.message,
            timestamp: new Date(newNotif.created_at),
            read: newNotif.is_read || false,
            actionUrl: getActionUrlFromType(newNotif.type, newNotif.title),
            panelId: newNotif.panel_id,
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

    // Polling fallback every 60s for missed realtime events
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [profile?.id, panelId, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
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

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      let query = supabase
        .from('panel_notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      // Only mark read for current panel's notifications
      if (panelId) {
        query = query.or(`panel_id.eq.${panelId},panel_id.is.null`);
      }

      await query;
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [profile?.id, panelId]);

  const clearAll = useCallback(async () => {
    if (!profile?.id) return;

    setNotifications([]);

    try {
      let query = supabase
        .from('panel_notifications')
        .delete()
        .eq('user_id', profile.id);

      // Only clear current panel's notifications
      if (panelId) {
        query = query.or(`panel_id.eq.${panelId},panel_id.is.null`);
      }

      await query;
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [profile?.id, panelId]);

  const addNotification = useCallback(async (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    if (!profile?.id) return;

    try {
      await supabase
        .from('panel_notifications')
        .insert({
          user_id: profile.id,
          panel_id: panelId || null,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: false,
        });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }, [profile?.id, panelId]);

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
