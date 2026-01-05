import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// =====================================================
// BUYER SERVICES HOOK
// Real-time synchronized services for buyer pages
// Used by: New Order, Fast Order, Services, Bulk Order
// =====================================================

type Service = Database['public']['Tables']['services']['Row'];

export interface BuyerService {
  id: string;
  name: string;
  displayName: string;
  platform: string;
  platformDisplay: string;
  serviceType: string;
  deliveryType: string;
  price: number;
  providerCost: number;
  minQuantity: number;
  maxQuantity: number;
  description: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
  refillAvailable: boolean;
  cancelAvailable: boolean;
  averageTime: string;
}

interface UseBuyerServicesOptions {
  panelId: string | null;
  platform?: string;
  serviceType?: string;
  deliveryType?: string;
  search?: string;
  sortBy?: 'price' | 'name' | 'popular' | 'category';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  enabled?: boolean;
}

interface UseBuyerServicesReturn {
  services: BuyerService[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  platforms: string[];
  serviceTypes: string[];
  totalCount: number;
  groupedByPlatform: Record<string, BuyerService[]>;
}

// Platform display names
const PLATFORM_DISPLAY: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter/X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  telegram: 'Telegram',
  threads: 'Threads',
  snapchat: 'Snapchat',
  pinterest: 'Pinterest',
  whatsapp: 'WhatsApp',
  twitch: 'Twitch',
  discord: 'Discord',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  audiomack: 'Audiomack',
  reddit: 'Reddit',
  vk: 'VKontakte',
  kick: 'Kick',
  rumble: 'Rumble',
  dailymotion: 'Dailymotion',
  other: 'Other',
};

export function useBuyerServices(options: UseBuyerServicesOptions): UseBuyerServicesReturn {
  const {
    panelId,
    platform,
    serviceType,
    deliveryType,
    search,
    sortBy = 'category',
    sortOrder = 'asc',
    limit,
    enabled = true,
  } = options;

  const [services, setServices] = useState<BuyerService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    if (!panelId || !enabled) {
      setServices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('services')
        .select('*')
        .eq('panel_id', panelId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      // Apply filters
      if (platform && platform !== 'all') {
        query = query.eq('category', platform as any);
      }

      if (serviceType && serviceType !== 'all') {
        query = query.eq('service_type', serviceType);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Transform to BuyerService format
      const buyerServices: BuyerService[] = (data || []).map(svc => {
        const categoryStr = String(svc.category);
        return {
          id: svc.id,
          name: svc.name,
          displayName: svc.name,
          platform: categoryStr,
          platformDisplay: PLATFORM_DISPLAY[categoryStr] || categoryStr,
          serviceType: svc.service_type || 'other',
          deliveryType: 'default',
          price: svc.price,
          providerCost: svc.provider_cost || svc.provider_price || 0,
          minQuantity: svc.min_quantity || 10,
          maxQuantity: svc.max_quantity || 1000000,
          description: svc.description || '',
          icon: svc.image_url || categoryStr,
          isActive: svc.is_active ?? true,
          displayOrder: svc.display_order || 0,
          refillAvailable: svc.refill_available || false,
          cancelAvailable: svc.cancel_available || false,
          averageTime: svc.average_time || '',
        };
      });

      // Sort
      let sorted = [...buyerServices];
      switch (sortBy) {
        case 'price':
          sorted.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
          break;
        case 'name':
          sorted.sort((a, b) => sortOrder === 'asc' 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name));
          break;
        case 'category':
          sorted.sort((a, b) => {
            const catCompare = a.platform.localeCompare(b.platform);
            if (catCompare !== 0) return sortOrder === 'asc' ? catCompare : -catCompare;
            return a.displayOrder - b.displayOrder;
          });
          break;
      }

      setServices(sorted);
    } catch (err) {
      console.error('Error fetching buyer services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, [panelId, platform, serviceType, deliveryType, search, sortBy, sortOrder, limit, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Real-time subscription
  useEffect(() => {
    if (!panelId || !enabled) return;

    const channel = supabase
      .channel(`buyer-services-${panelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `panel_id=eq.${panelId}`,
        },
        () => {
          // Refetch on any change
          fetchServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [panelId, enabled, fetchServices]);

  // Derived data
  const platforms = useMemo(() => {
    const unique = [...new Set(services.map(s => s.platform))];
    return unique.sort();
  }, [services]);

  const serviceTypes = useMemo(() => {
    const unique = [...new Set(services.map(s => s.serviceType))];
    return unique.sort();
  }, [services]);

  const groupedByPlatform = useMemo(() => {
    return services.reduce((acc, svc) => {
      if (!acc[svc.platform]) {
        acc[svc.platform] = [];
      }
      acc[svc.platform].push(svc);
      return acc;
    }, {} as Record<string, BuyerService[]>);
  }, [services]);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
    platforms,
    serviceTypes,
    totalCount: services.length,
    groupedByPlatform,
  };
}

// Hook for getting a single service
export function useBuyerService(serviceId: string | null, panelId: string | null) {
  const [service, setService] = useState<BuyerService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId || !panelId) {
      setService(null);
      setLoading(false);
      return;
    }

    const fetchService = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .eq('panel_id', panelId)
        .single();

      if (error || !data) {
        setService(null);
      } else {
        const categoryStr = String(data.category);
        setService({
          id: data.id,
          name: data.name,
          displayName: data.name,
          platform: categoryStr,
          platformDisplay: PLATFORM_DISPLAY[categoryStr] || categoryStr,
          serviceType: data.service_type || 'other',
          deliveryType: 'default',
          price: data.price,
          providerCost: data.provider_cost || data.provider_price || 0,
          minQuantity: data.min_quantity || 10,
          maxQuantity: data.max_quantity || 1000000,
          description: data.description || '',
          icon: data.image_url || categoryStr,
          isActive: data.is_active ?? true,
          displayOrder: data.display_order || 0,
          refillAvailable: data.refill_available || false,
          cancelAvailable: data.cancel_available || false,
          averageTime: data.average_time || '',
        });
      }
      setLoading(false);
    };

    fetchService();
  }, [serviceId, panelId]);

  return { service, loading };
}

// Hook for platform statistics
export function usePlatformStats(panelId: string | null) {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!panelId) {
      setStats({});
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('category')
        .eq('panel_id', panelId)
        .eq('is_active', true);

      if (!error && data) {
        const counts: Record<string, number> = {};
        data.forEach(svc => {
          counts[svc.category] = (counts[svc.category] || 0) + 1;
        });
        setStats(counts);
      }
      setLoading(false);
    };

    fetchStats();
  }, [panelId]);

  return { stats, loading };
}
