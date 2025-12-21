import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, XCircle, CheckCircle, Info, Bell } from 'lucide-react';

type AlertType = 'low_balance' | 'failed_transaction' | 'sync_error' | 'service_update' | 'info' | 'warning' | 'error' | 'success';

interface AlertConfig {
  lowBalanceThreshold: number;
  enablePopups: boolean;
  enableSound: boolean;
  enableEmails: boolean;
}

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  metadata?: Record<string, any>;
}

const DEFAULT_CONFIG: AlertConfig = {
  lowBalanceThreshold: 50,
  enablePopups: true,
  enableSound: false,
  enableEmails: false,
};

export function useAlertNotifications(panelId?: string) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [config, setConfig] = useState<AlertConfig>(DEFAULT_CONFIG);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('alertConfig');
    if (saved) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse alert config:', e);
      }
    }
  }, []);

  // Save config to localStorage
  const updateConfig = useCallback((newConfig: Partial<AlertConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem('alertConfig', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Show popup notification
  const showPopup = useCallback((type: AlertType, title: string, message: string) => {
    if (!config.enablePopups) return;

    const iconMap = {
      low_balance: AlertTriangle,
      failed_transaction: XCircle,
      sync_error: XCircle,
      service_update: Info,
      info: Info,
      warning: AlertTriangle,
      error: XCircle,
      success: CheckCircle,
    };

    const Icon = iconMap[type] || Bell;

    const toastOptions = {
      icon: <Icon className="w-5 h-5" />,
      duration: type === 'error' || type === 'failed_transaction' ? 8000 : 5000,
    };

    switch (type) {
      case 'low_balance':
      case 'warning':
        toast.warning(title, { description: message, ...toastOptions });
        break;
      case 'failed_transaction':
      case 'sync_error':
      case 'error':
        toast.error(title, { description: message, ...toastOptions });
        break;
      case 'success':
        toast.success(title, { description: message, ...toastOptions });
        break;
      default:
        toast.info(title, { description: message, ...toastOptions });
    }

    // Play sound if enabled
    if (config.enableSound && (type === 'error' || type === 'warning' || type === 'low_balance')) {
      playAlertSound();
    }
  }, [config.enablePopups, config.enableSound]);

  // Add alert to list
  const addAlert = useCallback((type: AlertType, title: string, message: string, metadata?: Record<string, any>) => {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      metadata,
    };

    setAlerts(prev => [alert, ...prev].slice(0, 100)); // Keep last 100
    setUnreadCount(prev => prev + 1);
    showPopup(type, title, message);

    return alert;
  }, [showPopup]);

  // Mark alert as read
  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, read: true } : a
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setUnreadCount(0);
  }, []);

  // Specific alert functions
  const alertLowBalance = useCallback((providerName: string, balance: number) => {
    if (balance < config.lowBalanceThreshold) {
      addAlert(
        'low_balance',
        'Low Provider Balance',
        `${providerName} balance is low: $${balance.toFixed(2)}. Consider adding funds.`,
        { providerName, balance, threshold: config.lowBalanceThreshold }
      );
    }
  }, [addAlert, config.lowBalanceThreshold]);

  const alertFailedTransaction = useCallback((orderId: string, reason: string) => {
    addAlert(
      'failed_transaction',
      'Transaction Failed',
      `Order ${orderId} failed: ${reason}`,
      { orderId, reason }
    );
  }, [addAlert]);

  const alertSyncError = useCallback((providerName: string, error: string) => {
    addAlert(
      'sync_error',
      'Sync Error',
      `Failed to sync with ${providerName}: ${error}`,
      { providerName, error }
    );
  }, [addAlert]);

  const alertServiceUpdate = useCallback((serviceName: string, changes: string) => {
    addAlert(
      'service_update',
      'Service Updated',
      `${serviceName}: ${changes}`,
      { serviceName, changes }
    );
  }, [addAlert]);

  // Send notification via edge function (with database storage)
  const sendNotification = useCallback(async (
    type: AlertType,
    title: string,
    message: string,
    options?: { sendEmail?: boolean; emailTo?: string }
  ) => {
    if (!panelId) {
      console.warn('Panel ID not set, skipping notification send');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          panelId,
          type,
          title,
          message,
          sendEmail: options?.sendEmail && config.enableEmails,
          emailTo: options?.emailTo,
        },
      });

      if (error) throw error;
      
      // Also show local popup
      addAlert(type, title, message);
      
      return data;
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Still show local popup even if remote fails
      addAlert(type, title, message);
    }
  }, [panelId, config.enableEmails, addAlert]);

  return {
    alerts,
    unreadCount,
    config,
    updateConfig,
    addAlert,
    markAsRead,
    markAllAsRead,
    clearAlerts,
    alertLowBalance,
    alertFailedTransaction,
    alertSyncError,
    alertServiceUpdate,
    sendNotification,
  };
}

// Helper function to play alert sound
function playAlertSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (e) {
    console.warn('Could not play alert sound:', e);
  }
}

export default useAlertNotifications;
