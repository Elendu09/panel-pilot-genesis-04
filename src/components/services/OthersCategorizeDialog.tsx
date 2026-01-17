import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Layers,
  Zap,
  FolderSearch,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type OthersPhase = 
  | 'idle' 
  | 'counting'
  | 'processing' 
  | 'completed' 
  | 'error';

export interface OthersProgress {
  phase: OthersPhase;
  current: number;
  total: number;
  recategorized: number;
  remaining: number;
  message?: string;
}

interface OthersCategorizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelId: string;
  onComplete: () => void;
  onRefreshCounts: () => void;
}

export const OthersCategorizeDialog = ({
  open,
  onOpenChange,
  panelId,
  onComplete,
  onRefreshCounts,
}: OthersCategorizeDialogProps) => {
  const [progress, setProgress] = useState<OthersProgress>({
    phase: 'idle',
    current: 0,
    total: 0,
    recategorized: 0,
    remaining: 0,
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});

  // Calculate percentage
  const percentage = useMemo(() => {
    if (progress.total === 0) return 0;
    return Math.round((progress.current / progress.total) * 100);
  }, [progress.current, progress.total]);

  // Start processing when dialog opens
  useEffect(() => {
    if (open && progress.phase === 'idle') {
      startCategorization();
    }
  }, [open]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setProgress({ phase: 'idle', current: 0, total: 0, recategorized: 0, remaining: 0 });
      setIsProcessing(false);
      setCategoryStats({});
    }
  }, [open]);

  const startCategorization = async () => {
    if (!panelId) return;
    
    setIsProcessing(true);
    setProgress({ phase: 'counting', current: 0, total: 0, recategorized: 0, remaining: 0, message: 'Counting services in Other category...' });
    setCategoryStats({});
    
    try {
      // First, count total "Other" services
      const { count } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panelId)
        .or('category.is.null,category.eq.other,category.eq.Other');
      
      const totalOthers = count || 0;
      
      if (totalOthers === 0) {
        setProgress({ 
          phase: 'completed', 
          current: 0, 
          total: 0, 
          recategorized: 0,
          remaining: 0,
          message: 'No services in Other category found!' 
        });
        setIsProcessing(false);
        return;
      }
      
      setProgress({ 
        phase: 'processing', 
        current: 0, 
        total: totalOthers, 
        recategorized: 0,
        remaining: totalOthers,
        message: `Processing ${totalOthers.toLocaleString()} services with AI...` 
      });
      
      // Process in batches via edge function
      let offset = 0;
      const BATCH_SIZE = 100;
      let hasMore = true;
      let totalRecategorized = 0;
      const aggregatedStats: Record<string, number> = {};
      
      while (hasMore) {
        const { data, error } = await supabase.functions.invoke('categorize-others', {
          body: { panelId, batchSize: BATCH_SIZE, offset }
        });
        
        if (error) {
          console.error('Edge function error:', error);
          throw new Error(error.message || 'Edge function failed');
        }
        
        if (data) {
          totalRecategorized += data.recategorized || 0;
          offset = data.offset || offset + BATCH_SIZE;
          hasMore = data.hasMore || false;
          
          // Aggregate category stats
          if (data.categoryStats) {
            for (const [cat, count] of Object.entries(data.categoryStats)) {
              aggregatedStats[cat] = (aggregatedStats[cat] || 0) + (count as number);
            }
            setCategoryStats({ ...aggregatedStats });
          }
          
          setProgress({
            phase: 'processing',
            current: offset,
            total: totalOthers,
            recategorized: totalRecategorized,
            remaining: Math.max(0, totalOthers - offset),
            message: `Processed ${Math.min(offset, totalOthers).toLocaleString()} / ${totalOthers.toLocaleString()} services...`
          });
        }
        
        // Small delay between batches
        if (hasMore) {
          await new Promise(r => setTimeout(r, 200));
        }
      }
      
      // Refresh category counts
      await onRefreshCounts();
      
      setProgress({
        phase: 'completed',
        current: totalOthers,
        total: totalOthers,
        recategorized: totalRecategorized,
        remaining: 0,
        message: `Recategorized ${totalRecategorized.toLocaleString()} services into ${Object.keys(aggregatedStats).length} categories!`
      });
      
      toast({
        title: 'Deep Categorization Complete!',
        description: `Moved ${totalRecategorized.toLocaleString()} services from Other to ${Object.keys(aggregatedStats).length} refined categories.`,
      });
      
      // Auto-close after brief delay
      setTimeout(() => {
        onComplete();
        onOpenChange(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error in Others Categorization:', error);
      setProgress({ 
        phase: 'error', 
        current: 0, 
        total: 0, 
        recategorized: 0,
        remaining: 0,
        message: 'Failed to categorize services' 
      });
      toast({ title: 'Failed to categorize services', variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const showProgress = ['counting', 'processing'].includes(progress.phase);
  
  // Get top categories for display
  const topCategories = useMemo(() => {
    return Object.entries(categoryStats)
      .filter(([cat]) => cat !== 'other')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [categoryStats]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-lg"
        onEscapeKeyDown={(e) => {
          if (['completed', 'error'].includes(progress.phase)) {
            onOpenChange(false);
          } else {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-lg",
              progress.phase === 'completed' ? "bg-green-500/20" : 
              progress.phase === 'error' ? "bg-destructive/20" :
              "bg-gradient-to-br from-amber-500 to-orange-500"
            )}>
              {progress.phase === 'completed' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : progress.phase === 'error' ? (
                <AlertCircle className="w-4 h-4 text-destructive" />
              ) : (
                <FolderSearch className="w-4 h-4 text-white animate-pulse" />
              )}
            </div>
            Deep Categorize "Others"
          </DialogTitle>
          <DialogDescription>
            {progress.message || 'AI-powered categorization into 70+ platforms'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress View */}
        {showProgress && (
          <div className="space-y-5 py-4">
            {/* Phase indicator */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="font-medium text-amber-500">
                  {progress.phase === 'counting' ? 'Counting...' : 'AI Categorizing...'}
                </span>
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
              <span className="text-muted-foreground font-mono text-xs">
                {progress.current.toLocaleString()} / {progress.total.toLocaleString()}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="relative">
              <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
                <div 
                  className="h-full transition-all duration-300 ease-out rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {/* Shimmer */}
              <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </div>
            
            {/* Percentage */}
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                {percentage}%
              </div>
            </div>
            
            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-primary">{progress.current.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Processed</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-green-500">{progress.recategorized.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Recategorized</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-amber-500">{progress.remaining.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Remaining</div>
              </div>
            </div>
            
            {/* Top categories found */}
            {topCategories.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Categories Found
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topCategories.map(([cat, count]) => (
                    <span 
                      key={cat} 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                    >
                      {cat}
                      <span className="text-[10px] opacity-70">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Completed state */}
        {progress.phase === 'completed' && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Deep Categorization Complete!</h3>
                <p className="text-sm text-muted-foreground">{progress.message}</p>
              </div>
            </div>
            
            {/* Final Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-primary">{progress.total.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Scanned</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-green-500">{progress.recategorized.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Moved</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-amber-500">{Object.keys(categoryStats).length}</div>
                <div className="text-[10px] text-muted-foreground">Categories</div>
              </div>
            </div>
            
            {/* Top categories */}
            {topCategories.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Top Categories Found</div>
                <div className="flex flex-wrap gap-1.5">
                  {topCategories.map(([cat, count]) => (
                    <span 
                      key={cat} 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-600"
                    >
                      {cat}
                      <span className="text-[10px] opacity-70">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <Button onClick={() => onOpenChange(false)} className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
              <Check className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        )}
        
        {/* Error state */}
        {progress.phase === 'error' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div className="text-center text-destructive">
                {progress.message}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => startCategorization()} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button variant="destructive" onClick={() => onOpenChange(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OthersCategorizeDialog;
