import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// Generate or retrieve session ID for unique visitor tracking
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
};

interface TrackEventOptions {
  deduplicate?: boolean;
}

/**
 * Hook for tracking analytics events on the storefront
 * Events are stored in analytics_events table for funnel analysis
 */
export function useAnalyticsTracking(panelId: string | undefined) {
  const trackedEvents = useRef(new Set<string>());
  const sessionId = getSessionId();

  const trackEvent = useCallback(async (
    eventType: string,
    metadata: Record<string, unknown> = {},
    options: TrackEventOptions = { deduplicate: true }
  ) => {
    if (!panelId || !sessionId) return;

    // Deduplicate same event within session (unless disabled)
    if (options.deduplicate) {
      const eventKey = `${eventType}-${JSON.stringify(metadata)}`;
      if (trackedEvents.current.has(eventKey)) {
        return;
      }
      trackedEvents.current.add(eventKey);
    }

    try {
      // Insert event directly - RLS allows anonymous inserts
      const { error } = await supabase
        .from('analytics_events')
        .insert([{
          panel_id: panelId,
          event_type: eventType,
          session_id: sessionId,
          metadata: metadata as Json,
        }]);

      if (error) {
        console.log('[Analytics] Track event error:', error.message);
      }
    } catch (err) {
      // Silent fail - analytics should not break the app
      console.log('[Analytics] Track event exception:', err);
    }
  }, [panelId, sessionId]);

  // Track page visit - call once on mount
  const trackPageVisit = useCallback((pageName: string, additionalMeta: Record<string, unknown> = {}) => {
    trackEvent(`${pageName}_visit`, { page: pageName, ...additionalMeta });
  }, [trackEvent]);

  // Track fast order funnel steps
  const trackFastOrderStep = useCallback((step: number, stepName: string) => {
    trackEvent('fast_order_step', { step, stepName });
  }, [trackEvent]);

  // Track service selection
  const trackServiceSelect = useCallback((serviceId: string, serviceName: string, category: string) => {
    trackEvent('service_select', { serviceId, serviceName, category });
  }, [trackEvent]);

  // Track checkout start
  const trackCheckoutStart = useCallback((serviceId: string, amount: number) => {
    trackEvent('checkout_start', { serviceId, amount });
  }, [trackEvent]);

  // Track order complete
  const trackOrderComplete = useCallback((orderId: string, amount: number) => {
    trackEvent('order_complete', { orderId, amount }, { deduplicate: false });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageVisit,
    trackFastOrderStep,
    trackServiceSelect,
    trackCheckoutStart,
    trackOrderComplete,
    sessionId,
  };
}
