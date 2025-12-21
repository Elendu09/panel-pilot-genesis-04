import { useState, useEffect, useCallback } from "react";

export type NotificationType = "order" | "payment" | "system" | "provider";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon?: string;
}

const NOTIFICATIONS_KEY = "panel_notifications";
const READ_NOTIFICATIONS_KEY = "panel_notifications_read";

// Simulated notifications for demo
const demoNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "New Order Received",
    message: "Order #12345 for Instagram Followers has been placed",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    actionUrl: "/panel/orders",
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Received",
    message: "You received $50.00 via PayPal from john@example.com",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    actionUrl: "/panel/analytics",
  },
  {
    id: "3",
    type: "system",
    title: "Domain Verified",
    message: "Your custom domain example.com has been verified successfully",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/panel/domain",
  },
  {
    id: "4",
    type: "provider",
    title: "Provider Sync Complete",
    message: "SMMWorld services have been synced. 150 new services available.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/panel/providers",
  },
  {
    id: "5",
    type: "order",
    title: "Order Completed",
    message: "Order #12340 has been completed successfully",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/panel/orders",
  },
  {
    id: "6",
    type: "system",
    title: "API Rate Limit Warning",
    message: "You've used 80% of your API rate limit this hour",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/panel/api",
  },
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const readIds = JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || "[]");
        const notifs = demoNotifications.map(n => ({
          ...n,
          read: readIds.includes(n.id)
        }));
        setNotifications(notifs);
      } catch {
        setNotifications(demoNotifications);
      }
      setIsLoading(false);
    };

    loadNotifications();

    // Simulate real-time updates
    const interval = setInterval(() => {
      const randomNotif = Math.random();
      if (randomNotif > 0.95) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ["order", "payment", "system", "provider"][Math.floor(Math.random() * 4)] as NotificationType,
          title: ["New Order", "Payment Received", "System Update", "Provider Alert"][Math.floor(Math.random() * 4)],
          message: "This is a real-time notification update",
          timestamp: new Date(),
          read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    const readIds = JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || "[]");
    if (!readIds.includes(id)) {
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...readIds, id]));
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const allIds = notifications.map(n => n.id);
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(allIds));
  }, [notifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(READ_NOTIFICATIONS_KEY);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotif: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

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
  };
};

export default useNotifications;
