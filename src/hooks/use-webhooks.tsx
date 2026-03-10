import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type WebhookEventType = 
  | "order.created" 
  | "order.completed" 
  | "order.cancelled" 
  | "order.refunded"
  | "gateway.requested"
  | "gateway.approved"
  | "gateway.rejected"
  | "dns.propagated"
  | "dns.failed";

export interface WebhookConfig {
  url: string;
  enabled: boolean;
  events: WebhookEventType[];
  secret?: string;
}

export interface WebhookDelivery {
  id: string;
  event: WebhookEventType;
  url: string;
  status: "pending" | "success" | "failed";
  statusCode?: number;
  response?: string;
  createdAt: string;
  retries: number;
}

export const useWebhooks = () => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);

  const sendWebhook = useCallback(async (
    event: WebhookEventType,
    payload: Record<string, any>,
    webhookUrl?: string
  ) => {
    if (!webhookUrl) {
      console.warn("No webhook URL configured");
      return null;
    }

    setSending(true);
    
    const delivery: WebhookDelivery = {
      id: crypto.randomUUID(),
      event,
      url: webhookUrl,
      status: "pending",
      createdAt: new Date().toISOString(),
      retries: 0,
    };

    setDeliveries(prev => [delivery, ...prev].slice(0, 50));

    try {
      const { data, error } = await supabase.functions.invoke("webhook-notify", {
        body: {
          event,
          payload,
          webhookUrl,
        },
      });

      if (error) throw error;

      setDeliveries(prev => 
        prev.map(d => 
          d.id === delivery.id 
            ? { ...d, status: "success" as const, statusCode: 200 }
            : d
        )
      );

      return data;
    } catch (error) {
      console.error("Webhook delivery failed:", error);
      
      setDeliveries(prev => 
        prev.map(d => 
          d.id === delivery.id 
            ? { ...d, status: "failed" as const, response: String(error) }
            : d
        )
      );

      return null;
    } finally {
      setSending(false);
    }
  }, []);

  const notifyGatewayApproval = useCallback(async (
    gatewayName: string,
    panelId: string,
    webhookUrl?: string
  ) => {
    return sendWebhook("gateway.approved", {
      gateway_name: gatewayName,
      panel_id: panelId,
      approved_at: new Date().toISOString(),
    }, webhookUrl);
  }, [sendWebhook]);

  const notifyDnsPropagation = useCallback(async (
    domain: string,
    recordType: string,
    propagationPercentage: number,
    webhookUrl?: string
  ) => {
    const event = propagationPercentage >= 100 ? "dns.propagated" : "dns.failed";
    
    return sendWebhook(event, {
      domain,
      record_type: recordType,
      propagation_percentage: propagationPercentage,
      checked_at: new Date().toISOString(),
    }, webhookUrl);
  }, [sendWebhook]);

  const testWebhook = useCallback(async (webhookUrl: string) => {
    setSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("webhook-notify", {
        body: {
          event: "test",
          payload: { message: "Test webhook from Home of SMM" },
          webhookUrl,
        },
      });

      if (error) throw error;

      toast({
        title: "Webhook test successful",
        description: "Your webhook endpoint responded correctly",
      });

      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Webhook test failed",
        description: String(error),
      });
      return false;
    } finally {
      setSending(false);
    }
  }, [toast]);

  return {
    sending,
    deliveries,
    sendWebhook,
    notifyGatewayApproval,
    notifyDnsPropagation,
    testWebhook,
  };
};
