import { supabase } from '@/integrations/supabase/client';

// =====================================================
// SUPABASE UTILITIES
// Helpers for bypassing Supabase default limits
// =====================================================

const SUPABASE_PAGE_SIZE = 1000;
const MAX_SERVICES = 10000;

/**
 * Fetches all services for a panel, bypassing the 1000-row limit.
 * Maximum 10,000 services per panel.
 * 
 * @param panelId - The panel ID to fetch services for
 * @param activeOnly - Whether to filter by is_active=true (default true)
 * @returns Promise<any[]> - All services for the panel
 */
export async function fetchAllServices(
  panelId: string,
  activeOnly = true
): Promise<any[]> {
  let allData: any[] = [];
  let from = 0;
  let hasMore = true;

  console.log(`[fetchAllServices] Starting paginated fetch for panel: ${panelId}`);

  while (hasMore && allData.length < MAX_SERVICES) {
    let query = supabase
      .from('services')
      .select('*')
      .eq('panel_id', panelId);
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    query = query
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('display_order', { ascending: true })
      .range(from, from + SUPABASE_PAGE_SIZE - 1);
    
    const { data, error } = await query;

    if (error) {
      console.error('[fetchAllServices] Error:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      allData = [...allData, ...data];
      console.log(`[fetchAllServices] Fetched page ${Math.floor(from / SUPABASE_PAGE_SIZE) + 1}: ${data.length} services (total: ${allData.length})`);
      from += SUPABASE_PAGE_SIZE;
      hasMore = data.length === SUPABASE_PAGE_SIZE;
    } else {
      hasMore = false;
    }
  }

  console.log(`[fetchAllServices] Complete: ${allData.length} total services fetched`);
  return allData.slice(0, MAX_SERVICES);
}

/**
 * Constants for pagination
 */
export const PAGINATION_CONSTANTS = {
  PAGE_SIZE: SUPABASE_PAGE_SIZE,
  MAX_SERVICES,
} as const;
