import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SOCIAL_ICONS_MAP } from '@/components/icons/SocialIcons';

// =====================================================
// UNIFIED SERVICES HOOK
// Single source of truth for services across ALL buyer pages
// Fixes: Pages out of sync, inconsistent service ordering
// =====================================================

export interface ServiceCategory {
  id: string;
  panelId: string;
  name: string;
  slug: string;
  iconKey: string;
  color: string;
  position: number;
  isActive: boolean;
  serviceCount: number;
}

export interface UnifiedService {
  id: string;
  name: string;
  category: string;
  categoryId: string | null;
  price: number;
  costUsd: number | null;
  providerCost: number | null;
  minQuantity: number;
  maxQuantity: number;
  description: string;
  isActive: boolean;
  displayOrder: number;
  refillAvailable: boolean;
  cancelAvailable: boolean;
  averageTime: string;
  serviceType: string;
  providerServiceId: string | null;
  providerId: string | null;
}

interface UseUnifiedServicesOptions {
  panelId: string | null | undefined;
  enabled?: boolean;
}

interface UseUnifiedServicesReturn {
  // Services
  services: UnifiedService[];
  servicesLoading: boolean;
  servicesError: string | null;
  refetchServices: () => Promise<void>;
  
  // Categories
  categories: ServiceCategory[];
  categoriesLoading: boolean;
  refetchCategories: () => Promise<void>;
  
  // Grouped data
  servicesByCategory: Record<string, UnifiedService[]>;
  categoriesWithServices: Array<ServiceCategory & { services: UnifiedService[] }>;
  
  // Category management
  updateCategoryOrder: (categoryId: string, newPosition: number) => Promise<void>;
  reorderCategories: (orderedIds: string[]) => Promise<void>;
  syncCategoriesFromServices: () => Promise<void>;
  
  // Stats
  totalServices: number;
  totalCategories: number;
}

export function useUnifiedServices({ panelId, enabled = true }: UseUnifiedServicesOptions): UseUnifiedServicesReturn {
  const [services, setServices] = useState<UnifiedService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Fetch categories from service_categories table
  const fetchCategories = useCallback(async () => {
    if (!panelId || !enabled) {
      setCategories([]);
      setCategoriesLoading(false);
      return;
    }

    setCategoriesLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('panel_id', panelId)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;

      const cats: ServiceCategory[] = (data || []).map(cat => ({
        id: cat.id,
        panelId: cat.panel_id,
        name: cat.name,
        slug: cat.slug,
        iconKey: cat.icon_key || 'other',
        color: cat.color || '#6B7280',
        position: cat.position,
        isActive: cat.is_active ?? true,
        serviceCount: cat.service_count || 0,
      }));

      setCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, [panelId, enabled]);

  // Fetch services
  const fetchServices = useCallback(async () => {
    if (!panelId || !enabled) {
      setServices([]);
      setServicesLoading(false);
      return;
    }

    setServicesLoading(true);
    setServicesError(null);

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('panel_id', panelId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const svcList: UnifiedService[] = (data || []).map(svc => ({
        id: svc.id,
        name: svc.name,
        category: String(svc.category),
        categoryId: svc.category_id || null,
        price: svc.price,
        costUsd: svc.cost_usd || null,
        providerCost: svc.provider_cost || svc.provider_price || null,
        minQuantity: svc.min_quantity || 10,
        maxQuantity: svc.max_quantity || 1000000,
        description: svc.description || '',
        isActive: svc.is_active ?? true,
        displayOrder: svc.display_order || 0,
        refillAvailable: svc.refill_available || false,
        cancelAvailable: svc.cancel_available || false,
        averageTime: svc.average_time || '',
        serviceType: svc.service_type || 'default',
        providerServiceId: svc.provider_service_id || null,
        providerId: svc.provider_id || null,
      }));

      setServices(svcList);
    } catch (err) {
      console.error('Error fetching services:', err);
      setServicesError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setServicesLoading(false);
    }
  }, [panelId, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, [fetchCategories, fetchServices]);

  // Real-time subscription for services
  useEffect(() => {
    if (!panelId || !enabled) return;

    const channel = supabase
      .channel(`unified-services-${panelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `panel_id=eq.${panelId}`,
        },
        () => fetchServices()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_categories',
          filter: `panel_id=eq.${panelId}`,
        },
        () => fetchCategories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [panelId, enabled, fetchServices, fetchCategories]);

  // Group services by category
  const servicesByCategory = useMemo(() => {
    const groups: Record<string, UnifiedService[]> = {};
    services.forEach(svc => {
      const cat = svc.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(svc);
    });
    return groups;
  }, [services]);

  // Categories with their services attached (ordered by position)
  const categoriesWithServices = useMemo(() => {
    // First, use database categories if available
    if (categories.length > 0) {
      return categories.map(cat => ({
        ...cat,
        services: servicesByCategory[cat.slug] || [],
      }));
    }

    // Fallback: build categories from services
    const catMap = new Map<string, ServiceCategory & { services: UnifiedService[] }>();
    
    services.forEach(svc => {
      const slug = svc.category || 'other';
      if (!catMap.has(slug)) {
        const iconData = SOCIAL_ICONS_MAP[slug] || SOCIAL_ICONS_MAP.other;
        catMap.set(slug, {
          id: slug,
          panelId: panelId || '',
          name: iconData.label || slug.charAt(0).toUpperCase() + slug.slice(1),
          slug,
          iconKey: slug,
          color: iconData.color || '#6B7280',
          position: catMap.size,
          isActive: true,
          serviceCount: 0,
          services: [],
        });
      }
      catMap.get(slug)!.services.push(svc);
      catMap.get(slug)!.serviceCount++;
    });

    return Array.from(catMap.values()).sort((a, b) => b.serviceCount - a.serviceCount);
  }, [categories, services, servicesByCategory, panelId]);

  // Update a single category's position
  const updateCategoryOrder = useCallback(async (categoryId: string, newPosition: number) => {
    if (!panelId) return;

    const { error } = await supabase
      .from('service_categories')
      .update({ position: newPosition, updated_at: new Date().toISOString() })
      .eq('id', categoryId);

    if (error) {
      console.error('Error updating category position:', error);
      throw error;
    }

    await fetchCategories();
  }, [panelId, fetchCategories]);

  // Reorder multiple categories at once (for drag-drop)
  const reorderCategories = useCallback(async (orderedIds: string[]) => {
    if (!panelId) return;

    // Update each category's position based on array order
    const updates = orderedIds.map((id, index) => 
      supabase
        .from('service_categories')
        .update({ position: index, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    await Promise.all(updates);
    await fetchCategories();
  }, [panelId, fetchCategories]);

  // Sync categories from services (creates missing categories)
  const syncCategoriesFromServices = useCallback(async () => {
    if (!panelId) return;

    // Call the database function to sync categories
    const { error } = await supabase.rpc('sync_panel_categories', { p_panel_id: panelId });
    
    if (error) {
      console.error('Error syncing categories:', error);
      throw error;
    }

    await fetchCategories();
  }, [panelId, fetchCategories]);

  return {
    // Services
    services,
    servicesLoading,
    servicesError,
    refetchServices: fetchServices,
    
    // Categories
    categories,
    categoriesLoading,
    refetchCategories: fetchCategories,
    
    // Grouped data
    servicesByCategory,
    categoriesWithServices,
    
    // Category management
    updateCategoryOrder,
    reorderCategories,
    syncCategoriesFromServices,
    
    // Stats
    totalServices: services.length,
    totalCategories: categories.length || Object.keys(servicesByCategory).length,
  };
}

// Hook for category order management specifically
export function useCategoryOrder(panelId: string | null | undefined) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!panelId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('panel_id', panelId)
        .order('position', { ascending: true });

      if (error) throw error;

      setCategories((data || []).map(cat => ({
        id: cat.id,
        panelId: cat.panel_id,
        name: cat.name,
        slug: cat.slug,
        iconKey: cat.icon_key || 'other',
        color: cat.color || '#6B7280',
        position: cat.position,
        isActive: cat.is_active ?? true,
        serviceCount: cat.service_count || 0,
      })));
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [panelId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const saveOrder = useCallback(async (orderedCategories: ServiceCategory[]) => {
    if (!panelId) return;

    setSaving(true);
    try {
      const updates = orderedCategories.map((cat, index) => 
        supabase
          .from('service_categories')
          .update({ position: index, updated_at: new Date().toISOString() })
          .eq('id', cat.id)
      );

      await Promise.all(updates);
      setCategories(orderedCategories.map((cat, i) => ({ ...cat, position: i })));
    } catch (err) {
      console.error('Error saving category order:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [panelId]);

  const addCategory = useCallback(async (name: string, iconKey: string) => {
    if (!panelId) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const position = categories.length;

    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        panel_id: panelId,
        name,
        slug,
        icon_key: iconKey,
        position,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    await fetchCategories();
    return data;
  }, [panelId, categories.length, fetchCategories]);

  const removeCategory = useCallback(async (categoryId: string) => {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;

    await fetchCategories();
  }, [fetchCategories]);

  const toggleCategory = useCallback(async (categoryId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('service_categories')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', categoryId);

    if (error) throw error;

    await fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    saving,
    refetch: fetchCategories,
    saveOrder,
    addCategory,
    removeCategory,
    toggleCategory,
  };
}

export default useUnifiedServices;
