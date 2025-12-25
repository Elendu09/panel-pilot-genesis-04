/**
 * Bulk operations helper with chunking and progress tracking
 */

import { supabase } from "@/integrations/supabase/client";

export interface BulkOperationProgress {
  processed: number;
  total: number;
  currentChunk: number;
  totalChunks: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
}

export type ProgressCallback = (progress: BulkOperationProgress) => void;

const DEFAULT_CHUNK_SIZE = 250;

/**
 * Run a bulk operation in chunks with progress tracking
 */
export async function runBulkInChunks<T>(
  ids: string[],
  actionFn: (chunkIds: string[]) => Promise<T>,
  onProgress?: ProgressCallback,
  chunkSize: number = DEFAULT_CHUNK_SIZE
): Promise<{ success: boolean; results: T[]; errors: string[] }> {
  const totalChunks = Math.ceil(ids.length / chunkSize);
  const results: T[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const currentChunk = Math.floor(i / chunkSize) + 1;
    
    onProgress?.({
      processed: i,
      total: ids.length,
      currentChunk,
      totalChunks,
      status: 'running',
    });
    
    try {
      const result = await actionFn(chunk);
      results.push(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Chunk ${currentChunk}: ${errorMsg}`);
    }
  }
  
  onProgress?.({
    processed: ids.length,
    total: ids.length,
    currentChunk: totalChunks,
    totalChunks,
    status: errors.length > 0 ? 'error' : 'completed',
    error: errors.length > 0 ? errors.join('; ') : undefined,
  });
  
  return { success: errors.length === 0, results, errors };
}

/**
 * Fetch all service IDs with pagination (up to 10,000)
 */
export async function fetchAllServiceIds(
  panelId: string,
  filters: {
    category?: string;
    search?: string;
  } = {},
  maxLimit: number = 10000
): Promise<{ ids: string[]; totalCount: number; capped: boolean }> {
  const pageSize = 1000;
  const allIds: string[] = [];
  let page = 0;
  let hasMore = true;
  
  // First get exact count
  let countQuery = supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('panel_id', panelId);
  
  if (filters.category && filters.category !== 'all') {
    countQuery = countQuery.eq('category', filters.category as any);
  }
  if (filters.search) {
    countQuery = countQuery.ilike('name', `%${filters.search}%`);
  }
  
  const { count: totalCount } = await countQuery;
  const actualTotal = totalCount || 0;
  const capped = actualTotal > maxLimit;
  
  // Paginate to fetch IDs
  while (hasMore && allIds.length < maxLimit) {
    let query = supabase
      .from('services')
      .select('id')
      .eq('panel_id', panelId)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category as any);
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allIds.push(...data.map(s => s.id));
      page++;
      if (data.length < pageSize) {
        hasMore = false;
      }
    }
  }
  
  return {
    ids: allIds.slice(0, maxLimit),
    totalCount: actualTotal,
    capped,
  };
}

/**
 * Fetch accurate category counts
 */
export async function fetchAccurateCategoryCounts(
  panelId: string,
  categories: string[]
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  
  // Fetch total count
  const { count: totalCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('panel_id', panelId);
  
  counts['all'] = totalCount || 0;
  
  // Fetch counts per category in parallel
  const categoryPromises = categories
    .filter(cat => cat !== 'all')
    .map(async (category) => {
      const { count } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panelId)
        .eq('category', category as any);
      
      return { category, count: count || 0 };
    });
  
  const results = await Promise.all(categoryPromises);
  
  results.forEach(({ category, count }) => {
    counts[category] = count;
  });
  
  return counts;
}

/**
 * Bulk update services status
 */
export async function bulkUpdateStatus(
  ids: string[],
  isActive: boolean,
  onProgress?: ProgressCallback
): Promise<{ success: boolean; errors: string[] }> {
  return runBulkInChunks(
    ids,
    async (chunkIds) => {
      const { error } = await supabase
        .from('services')
        .update({ is_active: isActive })
        .in('id', chunkIds);
      
      if (error) throw error;
      return { updated: chunkIds.length };
    },
    onProgress
  );
}

/**
 * Bulk delete services
 */
export async function bulkDeleteServices(
  ids: string[],
  onProgress?: ProgressCallback
): Promise<{ success: boolean; errors: string[] }> {
  return runBulkInChunks(
    ids,
    async (chunkIds) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .in('id', chunkIds);
      
      if (error) throw error;
      return { deleted: chunkIds.length };
    },
    onProgress
  );
}

/**
 * Bulk update service icons
 */
export async function bulkUpdateIcons(
  ids: string[],
  iconValue: string,
  onProgress?: ProgressCallback
): Promise<{ success: boolean; errors: string[] }> {
  return runBulkInChunks(
    ids,
    async (chunkIds) => {
      const { error } = await supabase
        .from('services')
        .update({ image_url: iconValue })
        .in('id', chunkIds);
      
      if (error) throw error;
      return { updated: chunkIds.length };
    },
    onProgress
  );
}

/**
 * Bulk update service categories
 */
export async function bulkUpdateCategories(
  ids: string[],
  category: string,
  iconValue?: string,
  onProgress?: ProgressCallback
): Promise<{ success: boolean; errors: string[] }> {
  return runBulkInChunks(
    ids,
    async (chunkIds) => {
      const updateData: any = { category: category as any };
      if (iconValue) {
        updateData.image_url = iconValue;
      }
      
      const { error } = await supabase
        .from('services')
        .update(updateData)
        .in('id', chunkIds);
      
      if (error) throw error;
      return { updated: chunkIds.length };
    },
    onProgress
  );
}
