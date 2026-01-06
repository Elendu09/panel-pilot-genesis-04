import { useMemo, useEffect, useState } from "react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  category: string;
  name: string;
  is_active?: boolean;
}

interface ServiceCategoryDB {
  id: string;
  panel_id: string;
  name: string;
  slug: string;
  icon_key: string;
  color: string;
  position: number;
  is_active: boolean;
  service_count: number;
}

interface CategoryFilter {
  id: string;
  name: string;
  count: number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  isActive: boolean;
  position: number;
}

interface CategoryStats {
  totalServices: number;
  totalCategories: number;
  categoryCounts: Record<string, number>;
}

/**
 * Enhanced hook that syncs category filters from service_categories table
 * Uses persistent ordering from database for consistent display across all pages
 */
export const useCategoryFilters = (panelId: string | null | undefined, services?: Service[]) => {
  const [dbCategories, setDbCategories] = useState<ServiceCategoryDB[]>([]);
  const [serviceCounts, setServiceCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from service_categories table (with persistent ordering)
  useEffect(() => {
    if (!panelId) {
      setIsLoading(false);
      return;
    }

    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        // First try to get from service_categories table (persistent ordering)
        const { data: catData, error: catError } = await supabase
          .from('service_categories')
          .select('*')
          .eq('panel_id', panelId)
          .eq('is_active', true)
          .order('position', { ascending: true });

        if (!catError && catData && catData.length > 0) {
          setDbCategories(catData);
        }

        // Also get service counts directly
        const { data: svcData, error: svcError } = await supabase
          .from('services')
          .select('category')
          .eq('panel_id', panelId)
          .eq('is_active', true);

        if (!svcError && svcData) {
          const counts: Record<string, number> = {};
          svcData.forEach((service: any) => {
            const cat = service.category || 'other';
            counts[cat] = (counts[cat] || 0) + 1;
          });
          setServiceCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();

    // Subscribe to real-time updates for both tables
    const channel = supabase
      .channel(`category-sync-v2-${panelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `panel_id=eq.${panelId}`,
        },
        () => fetchCategories()
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
  }, [panelId]);

  // Build category counts from services or serviceCounts
  const categoryCounts = useMemo(() => {
    if (services && services.length > 0) {
      const counts: Record<string, number> = {};
      services.forEach((service) => {
        if (service.is_active !== false) {
          const cat = service.category || 'other';
          counts[cat] = (counts[cat] || 0) + 1;
        }
      });
      return counts;
    }
    return serviceCounts;
  }, [services, serviceCounts]);

  // Build active categories - use DB categories for ordering if available
  const activeCategories = useMemo(() => {
    // If we have DB categories with persistent ordering, use those
    if (dbCategories.length > 0) {
      return dbCategories.map(cat => {
        const iconData = SOCIAL_ICONS_MAP[cat.icon_key] || SOCIAL_ICONS_MAP.other;
        return {
          id: cat.slug,
          name: cat.name,
          count: categoryCounts[cat.slug] || cat.service_count || 0,
          icon: iconData.icon,
          color: iconData.color,
          bgColor: iconData.bgColor,
          isActive: cat.is_active,
          position: cat.position,
        };
      });
    }

    // Fallback: build from categoryCounts
    const filters: CategoryFilter[] = Object.entries(categoryCounts)
      .filter(([_, count]) => count > 0)
      .map(([category, count], idx) => {
        const iconData = SOCIAL_ICONS_MAP[category] || SOCIAL_ICONS_MAP.other;
        return {
          id: category,
          name: iconData.label || category.charAt(0).toUpperCase() + category.slice(1),
          count,
          icon: iconData.icon,
          color: iconData.color,
          bgColor: iconData.bgColor,
          isActive: true,
          position: idx,
        };
      })
      .sort((a, b) => b.count - a.count);

    return filters;
  }, [dbCategories, categoryCounts]);

  // Get all available platform categories (70+ from SOCIAL_ICONS_MAP)
  const allCategories = useMemo(() => {
    return Object.entries(SOCIAL_ICONS_MAP).map(([id, data], idx) => {
      const count = categoryCounts[id] || 0;
      return {
        id,
        name: data.label,
        icon: data.icon,
        color: data.color,
        bgColor: data.bgColor,
        count,
        isActive: count > 0,
        position: idx,
      };
    });
  }, [categoryCounts]);

  // Filter pills for UI - only show categories with services, ordered by position
  const filterPills = useMemo(() => {
    const totalCount = Object.values(categoryCounts).reduce((sum, c) => sum + c, 0);
    return [
      {
        id: 'all',
        name: 'All',
        icon: SOCIAL_ICONS_MAP.other.icon,
        color: 'text-primary',
        bgColor: 'bg-primary',
        count: totalCount,
        isActive: true,
        position: -1,
      },
      ...activeCategories.sort((a, b) => a.position - b.position),
    ];
  }, [activeCategories, categoryCounts]);

  // Category stats
  const stats: CategoryStats = useMemo(() => ({
    totalServices: Object.values(categoryCounts).reduce((sum, c) => sum + c, 0),
    totalCategories: activeCategories.length,
    categoryCounts,
  }), [categoryCounts, activeCategories]);

  // Group services by category for hierarchical display
  const groupedByCategory = useMemo(() => {
    if (!services) return {};
    
    const groups: Record<string, Service[]> = {};
    services.forEach((service) => {
      if (service.is_active !== false) {
        const cat = service.category || 'other';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(service);
      }
    });
    
    // Sort each group alphabetically
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return groups;
  }, [services]);

  return {
    // Category filters
    activeCategories,
    allCategories,
    filterPills,
    
    // Stats
    stats,
    totalCategories: activeCategories.length,
    totalPlatforms: allCategories.length,
    
    // Grouped data
    groupedByCategory,
    categoryCounts,
    
    // Loading state
    isLoading,
    
    // Helper to get category data
    getCategoryData: (categoryId: string) => {
      return SOCIAL_ICONS_MAP[categoryId] || SOCIAL_ICONS_MAP.other;
    },
  };
};

export default useCategoryFilters;
