import { useMemo, useEffect, useState } from "react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  category: string;
  name: string;
  is_active?: boolean;
}

interface CategoryFilter {
  id: string;
  name: string;
  count: number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  isActive: boolean;
}

interface CategoryStats {
  totalServices: number;
  totalCategories: number;
  categoryCounts: Record<string, number>;
}

/**
 * Enhanced hook that syncs category filters from database with real-time updates
 * Ensures all buyer pages show consistent 70+ platform categories
 */
export const useCategoryFilters = (panelId: string | null | undefined, services?: Service[]) => {
  const [dbCategories, setDbCategories] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch category counts directly from database
  useEffect(() => {
    if (!panelId) {
      setIsLoading(false);
      return;
    }

    const fetchCategoryCounts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('category')
          .eq('panel_id', panelId)
          .eq('is_active', true);

        if (error) throw error;

        const counts: Record<string, number> = {};
        data?.forEach((service) => {
          const cat = service.category || 'other';
          counts[cat] = (counts[cat] || 0) + 1;
        });

        setDbCategories(counts);
      } catch (error) {
        console.error('Error fetching category counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryCounts();

    // Subscribe to real-time updates for services table
    const channel = supabase
      .channel(`category-sync-${panelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `panel_id=eq.${panelId}`,
        },
        () => {
          // Refetch category counts on any service change
          fetchCategoryCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [panelId]);

  // If services array is provided, use it directly; otherwise use db counts
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
    return dbCategories;
  }, [services, dbCategories]);

  // Build active categories with icons from SOCIAL_ICONS_MAP
  const activeCategories = useMemo(() => {
    const filters: CategoryFilter[] = Object.entries(categoryCounts)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => {
        const iconData = SOCIAL_ICONS_MAP[category] || SOCIAL_ICONS_MAP.other;
        return {
          id: category,
          name: iconData.label || category.charAt(0).toUpperCase() + category.slice(1),
          count,
          icon: iconData.icon,
          color: iconData.color,
          bgColor: iconData.bgColor,
          isActive: true,
        };
      })
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return filters;
  }, [categoryCounts]);

  // Get all available platform categories (70+ from SOCIAL_ICONS_MAP)
  const allCategories = useMemo(() => {
    return Object.entries(SOCIAL_ICONS_MAP).map(([id, data]) => {
      const count = categoryCounts[id] || 0;
      return {
        id,
        name: data.label,
        icon: data.icon,
        color: data.color,
        bgColor: data.bgColor,
        count,
        isActive: count > 0,
      };
    });
  }, [categoryCounts]);

  // Filter pills for UI - only show categories with services
  const filterPills = useMemo(() => {
    return [
      {
        id: 'all',
        name: 'All',
        icon: SOCIAL_ICONS_MAP.other.icon,
        color: 'text-primary',
        bgColor: 'bg-primary',
        count: Object.values(categoryCounts).reduce((sum, c) => sum + c, 0),
        isActive: true,
      },
      ...activeCategories,
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
