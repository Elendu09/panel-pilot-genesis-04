import { useState, useEffect, useCallback } from "react";
import { Bell, Check, CheckCheck, Trash2, ShoppingCart, CreditCard, Settings, Plug, X, MessageCircle, Mail, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNotifications, NotificationType } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const typeIcons: Record<NotificationType, React.ElementType> = {
  order: ShoppingCart,
  payment: CreditCard,
  system: Settings,
  provider: Plug,
  chat: MessageCircle,
  info: Settings,
  warning: Settings,
  error: Settings,
};

const typeColors: Record<NotificationType, string> = {
  order: "bg-blue-500/10 text-blue-500",
  payment: "bg-green-500/10 text-green-500",
  system: "bg-orange-500/10 text-orange-500",
  provider: "bg-purple-500/10 text-purple-500",
  chat: "bg-cyan-500/10 text-cyan-500",
  info: "bg-blue-500/10 text-blue-500",
  warning: "bg-yellow-500/10 text-yellow-500",
  error: "bg-red-500/10 text-red-500",
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

interface NotificationItemProps {
  notification: {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
  };
  onRead: (id: string) => void;
  onNavigate: (url: string) => void;
}

const NotificationItem = ({ notification, onRead, onNavigate }: NotificationItemProps) => {
  const Icon = typeIcons[notification.type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "flex gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50",
        !notification.read && "bg-primary/5"
      )}
      onClick={() => {
        onRead(notification.id);
        if (notification.actionUrl) {
          onNavigate(notification.actionUrl);
        }
      }}
    >
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", typeColors[notification.type])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium truncate", !notification.read && "text-foreground")}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatTime(notification.timestamp)}
        </p>
      </div>
    </motion.div>
  );
};

interface NotificationCenterProps {
  variant?: "popover" | "sheet";
}

export const NotificationCenter = ({ variant = "popover" }: NotificationCenterProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, getByType } = useNotifications();

  const [panelId, setPanelId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchPanelSettings = async () => {
      const { data: panel } = await supabase
        .from('panels')
        .select('id, subscription_tier, settings')
        .eq('owner_id', profile.id)
        .limit(1)
        .maybeSingle();
      if (panel) {
        setPanelId(panel.id);
        if (panel.subscription_tier) setSubscriptionTier(panel.subscription_tier);
        const settings = (panel.settings as Record<string, any>) || {};
        if (settings.email_notifications === true) setEmailEnabled(true);
      }
    };
    fetchPanelSettings();
  }, [profile?.id]);

  const handleEmailToggle = useCallback(async (checked: boolean) => {
    if (!profile?.id || !panelId) return;
    setEmailEnabled(checked);

    try {
      const { data: panel } = await supabase
        .from('panels')
        .select('settings')
        .eq('id', panelId)
        .single();

      const currentSettings = (panel?.settings as Record<string, any>) || {};
      await supabase
        .from('panels')
        .update({ settings: { ...currentSettings, email_notifications: checked } })
        .eq('id', panelId);
    } catch (err) {
      console.error('Failed to save email notification preference:', err);
    }
  }, [profile?.id, panelId]);

  const canUseEmail = subscriptionTier === 'basic' || subscriptionTier === 'pro' || subscriptionTier === 'enterprise';

  const handleNavigate = (url: string) => {
    navigate(url);
    setOpen(false);
  };

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : getByType(activeTab as NotificationType);

  const NotificationContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="h-8 text-xs"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            Mark all read
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className={cn("h-8 w-8 p-0", showSettings && "bg-accent")}
          >
            <Settings className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            disabled={notifications.length === 0}
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>
        <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your notifications. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => { clearAll(); setShowClearConfirm(false); }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-[11px] text-muted-foreground">Forward notifications to your email</p>
                  </div>
                </div>
                {canUseEmail ? (
                  <Switch checked={emailEnabled} onCheckedChange={handleEmailToggle} />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0">
                      <Crown className="w-3 h-3 text-amber-500" />
                      Basic+
                    </Badge>
                    <Switch disabled checked={false} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-10 px-2">
          <TabsTrigger value="all" className="text-xs data-[state=active]:shadow-none">
            All
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="order" className="text-xs data-[state=active]:shadow-none">
            Orders
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs data-[state=active]:shadow-none">
            Payments
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-xs data-[state=active]:shadow-none">
            Chat
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs data-[state=active]:shadow-none">
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex-1 m-0">
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              <AnimatePresence>
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                      onNavigate={handleNavigate}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-muted-foreground"
                  >
                    <Bell className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">No notifications</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );

  const TriggerButton = (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </motion.span>
      )}
    </Button>
  );

  if (variant === "sheet") {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {TriggerButton}
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0">
          <SheetHeader className="px-4 py-3 border-b border-border">
            <SheetTitle className="text-left">Notifications</SheetTitle>
          </SheetHeader>
          <NotificationContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {TriggerButton}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[380px] p-0" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <NotificationContent />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
