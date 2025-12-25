/**
 * Bulk operations helper with chunking, progress tracking, and database job persistence
 */

import { supabase } from "@/integrations/supabase/client";

export interface BulkOperationProgress {
  processed: number;
  total: number;
  currentChunk: number;
  totalChunks: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
  jobId?: string;
}

export type ProgressCallback = (progress: BulkOperationProgress) => void;

const DEFAULT_CHUNK_SIZE = 250;

export interface BulkOperationJob {
  id: string;
  panel_id: string;
  operation_type: string;
  status: string;
  total_items: number;
  processed_items: number;
  failed_items: number;
  target_ids: string[];
  operation_data: Record<string, any>;
  error_log: Array<{ chunk: number; error: string }>;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
}

/**
 * Create a bulk operation job in the database for tracking
 */
export async function createBulkOperationJob(
  panelId: string,
  operationType: string,
  targetIds: string[],
  operationData: Record<string, any> = {},
  createdBy?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('bulk_operation_jobs')
      .insert({
        panel_id: panelId,
        operation_type: operationType,
        status: 'pending',
        total_items: targetIds.length,
        processed_items: 0,
        failed_items: 0,
        target_ids: targetIds,
        operation_data: operationData,
        error_log: [],
        created_by: createdBy || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating bulk job:', error);
      return null;
    }
    return data.id;
  } catch (err) {
    console.error('Failed to create bulk job:', err);
    return null;
  }
}

/**
 * Update a bulk operation job's progress
 */
export async function updateBulkOperationJob(
  jobId: string,
  updates: {
    status?: string;
    processed_items?: number;
    failed_items?: number;
    error_log?: Array<{ chunk: number; error: string }>;
    started_at?: string;
    completed_at?: string;
  }
): Promise<void> {
  try {
    await supabase
      .from('bulk_operation_jobs')
      .update(updates)
      .eq('id', jobId);
  } catch (err) {
    console.error('Failed to update bulk job:', err);
  }
}

/**
 * Fetch recent bulk operation jobs for a panel
 */
export async function fetchBulkOperationJobs(
  panelId: string,
  limit: number = 20
): Promise<BulkOperationJob[]> {
  const { data, error } = await supabase
    .from('bulk_operation_jobs')
    .select('*')
    .eq('panel_id', panelId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching bulk jobs:', error);
    return [];
  }
  return data as BulkOperationJob[];
}

/**
 * Subscribe to realtime updates for a specific bulk operation job
 */
export function subscribeToBulkOperationJob(
  jobId: string,
  onUpdate: (job: Partial<BulkOperationJob>) => void
): () => void {
  const channel = supabase
    .channel(`bulk-job-${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'bulk_operation_jobs',
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        onUpdate(payload.new as Partial<BulkOperationJob>);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Run a bulk operation in chunks with progress tracking
 */
export async function runBulkInChunks<T>(
  ids: string[],
  actionFn: (chunkIds: string[]) => Promise<T>,
  onProgress?: ProgressCallback,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  jobId?: string
): Promise<{ success: boolean; results: T[]; errors: string[] }> {
  const totalChunks = Math.ceil(ids.length / chunkSize);
  const results: T[] = [];
  const errors: string[] = [];
  const errorLog: Array<{ chunk: number; error: string }> = [];

  // Mark job as started
  if (jobId) {
    await updateBulkOperationJob(jobId, {
      status: 'running',
      started_at: new Date().toISOString(),
    });
  }

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const currentChunk = Math.floor(i / chunkSize) + 1;

    const progressUpdate: BulkOperationProgress = {
      processed: i,
      total: ids.length,
      currentChunk,
      totalChunks,
      status: 'running',
      jobId,
    };

    onProgress?.(progressUpdate);

    // Update database job progress
    if (jobId) {
      await updateBulkOperationJob(jobId, {
        processed_items: i,
      });
    }

    try {
      const result = await actionFn(chunk);
      results.push(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Chunk ${currentChunk}: ${errorMsg}`);
      errorLog.push({ chunk: currentChunk, error: errorMsg });
    }
  }

  const finalStatus = errors.length > 0 ? 'error' : 'completed';

  // Final database update
  if (jobId) {
    await updateBulkOperationJob(jobId, {
      status: finalStatus,
      processed_items: ids.length,
      failed_items: errors.length,
      error_log: errorLog,
      completed_at: new Date().toISOString(),
    });
  }

  onProgress?.({
    processed: ids.length,
    total: ids.length,
    currentChunk: totalChunks,
    totalChunks,
    status: errors.length > 0 ? 'error' : 'completed',
    error: errors.length > 0 ? errors.join('; ') : undefined,
    jobId,
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
      allIds.push(...data.map((s) => s.id));
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
    .filter((cat) => cat !== 'all')
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
  onProgress?: ProgressCallback,
  panelId?: string
): Promise<{ success: boolean; errors: string[]; jobId?: string }> {
  let jobId: string | undefined;

  if (panelId) {
    const jId = await createBulkOperationJob(panelId, isActive ? 'enable' : 'disable', ids, { isActive });
    if (jId) jobId = jId;
  }

  const result = await runBulkInChunks(
    ids,
    async (chunkIds) => {
      const { error } = await supabase
        .from('services')
        .update({ is_active: isActive })
        .in('id', chunkIds);

      if (error) throw error;
      return { updated: chunkIds.length };
    },
    onProgress,
    DEFAULT_CHUNK_SIZE,
    jobId
  );

  return { ...result, jobId };
}

/**
 * Bulk delete services
 */
export async function bulkDeleteServices(
  ids: string[],
  onProgress?: ProgressCallback,
  panelId?: string
): Promise<{ success: boolean; errors: string[]; jobId?: string }> {
  let jobId: string | undefined;

  if (panelId) {
    const jId = await createBulkOperationJob(panelId, 'delete', ids);
    if (jId) jobId = jId;
  }

  const result = await runBulkInChunks(
    ids,
    async (chunkIds) => {
      const { error } = await supabase.from('services').delete().in('id', chunkIds);

      if (error) throw error;
      return { deleted: chunkIds.length };
    },
    onProgress,
    DEFAULT_CHUNK_SIZE,
    jobId
  );

  return { ...result, jobId };
}

/**
 * Bulk update service icons
 */
export async function bulkUpdateIcons(
  ids: string[],
  iconValue: string,
  onProgress?: ProgressCallback,
  panelId?: string
): Promise<{ success: boolean; errors: string[]; jobId?: string }> {
  let jobId: string | undefined;

  if (panelId) {
    const jId = await createBulkOperationJob(panelId, 'update_icons', ids, { iconValue });
    if (jId) jobId = jId;
  }

  const result = await runBulkInChunks(
    ids,
    async (chunkIds) => {
      const { error } = await supabase
        .from('services')
        .update({ image_url: iconValue })
        .in('id', chunkIds);

      if (error) throw error;
      return { updated: chunkIds.length };
    },
    onProgress,
    DEFAULT_CHUNK_SIZE,
    jobId
  );

  return { ...result, jobId };
}

/**
 * Bulk update service categories
 */
export async function bulkUpdateCategories(
  ids: string[],
  category: string,
  iconValue?: string,
  onProgress?: ProgressCallback,
  panelId?: string
): Promise<{ success: boolean; errors: string[]; jobId?: string }> {
  let jobId: string | undefined;

  if (panelId) {
    const jId = await createBulkOperationJob(panelId, 'update_category', ids, { category, iconValue });
    if (jId) jobId = jId;
  }

  const result = await runBulkInChunks(
    ids,
    async (chunkIds) => {
      const updateData: any = { category: category as any };
      if (iconValue) {
        updateData.image_url = iconValue;
      }

      const { error } = await supabase.from('services').update(updateData).in('id', chunkIds);

      if (error) throw error;
      return { updated: chunkIds.length };
    },
    onProgress,
    DEFAULT_CHUNK_SIZE,
    jobId
  );

  return { ...result, jobId };
}

/**
 * Bulk update display order (for drag-and-drop reordering)
 */
export async function bulkUpdateDisplayOrder(
  updates: Array<{ id: string; display_order: number }>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use a transaction-like batch update
    const promises = updates.map(({ id, display_order }) =>
      supabase.from('services').update({ display_order }).eq('id', id)
    );

    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error('Error updating display order:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
