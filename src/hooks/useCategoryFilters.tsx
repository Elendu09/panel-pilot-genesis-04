import { useMemo } from "react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";

interface Service {
  id: string;
  category: string;
  name: string;
}

interface CategoryFilter {
  id: string;
  name: string;
  count: number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

/**
 * Hook that generates category filters from services
 * Ensures all buyer pages show the same category filters with 70+ platforms
 */
export const useCategoryFilters = (services: Service[]) => {
  const activeCategories = useMemo(() => {
    // Get unique categories from services with counts
    const categoryCounts: Record<string, number> = {};
    
    services.forEach(service => {
      const category = service.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Map to category filters with icon data from SOCIAL_ICONS_MAP
    const filters: CategoryFilter[] = Object.entries(categoryCounts)
      .map(([category, count]) => {
        const iconData = SOCIAL_ICONS_MAP[category] || SOCIAL_ICONS_MAP.other;
        return {
          id: category,
          name: iconData.label || category.charAt(0).toUpperCase() + category.slice(1),
          count,
          icon: iconData.icon,
          color: iconData.color,
          bgColor: iconData.bgColor,
        };
      })
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return filters;
  }, [services]);

  // Get all available platform categories (for showing all 70+ even if empty)
  const allCategories = useMemo(() => {
    return Object.entries(SOCIAL_ICONS_MAP).map(([id, data]) => ({
      id,
      name: data.label,
      icon: data.icon,
      color: data.color,
      bgColor: data.bgColor,
      count: 0,
    }));
  }, []);

  // Merge active categories with all categories (showing count = 0 for inactive)
  const mergedCategories = useMemo(() => {
    const activeMap = new Map(activeCategories.map(c => [c.id, c]));
    
    return allCategories.map(cat => ({
      ...cat,
      count: activeMap.get(cat.id)?.count || 0,
    }));
  }, [activeCategories, allCategories]);

  return { 
    activeCategories, 
    allCategories: mergedCategories,
    totalCategories: activeCategories.length,
    totalPlatforms: allCategories.length,
  };
};

export default useCategoryFilters;
