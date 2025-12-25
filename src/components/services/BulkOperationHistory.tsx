import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Trash2,
  Power,
  PowerOff,
  Image,
  Layers,
  RotateCcw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { fetchBulkOperationJobs, BulkOperationJob } from "@/lib/bulk-ops";
import { usePanel } from "@/hooks/usePanel";
import { supabase } from "@/integrations/supabase/client";

interface BulkOperationHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry?: (job: BulkOperationJob) => void;
}

const operationIcons: Record<string, React.ElementType> = {
  enable: Power,
  disable: PowerOff,
  delete: Trash2,
  update_icons: Image,
  update_category: Layers,
};

const operationLabels: Record<string, string> = {
  enable: "Enable Services",
  disable: "Disable Services",
  delete: "Delete Services",
  update_icons: "Update Icons",
  update_category: "Update Categories",
};

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  running: "bg-primary/20 text-primary",
  completed: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  error: "bg-destructive/20 text-destructive",
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle,
  error: AlertCircle,
};

export function BulkOperationHistory({
  open,
  onOpenChange,
  onRetry,
}: BulkOperationHistoryProps) {
  const { panel } = usePanel();
  const [jobs, setJobs] = useState<BulkOperationJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && panel?.id) {
      loadJobs();
      
      // Subscribe to realtime updates for all jobs
      const channel = supabase
        .channel('bulk-jobs-list')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bulk_operation_jobs',
            filter: `panel_id=eq.${panel.id}`,
          },
          () => {
            loadJobs();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [open, panel?.id]);

  const loadJobs = async () => {
    if (!panel?.id) return;
    setLoading(true);
    try {
      const data = await fetchBulkOperationJobs(panel.id, 50);
      setJobs(data);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = (job: BulkOperationJob) => {
    onRetry?.(job);
    onOpenChange(false);
  };

  const getProgress = (job: BulkOperationJob): number => {
    if (job.total_items === 0) return 0;
    return Math.round((job.processed_items / job.total_items) * 100);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Bulk Operations History
          </SheetTitle>
          <SheetDescription>
            View past bulk operations and retry failed ones
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">
            {jobs.length} operations
          </span>
          <Button variant="ghost" size="sm" onClick={loadJobs} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No bulk operations yet</p>
              <p className="text-sm text-muted-foreground/70">
                Bulk operations will appear here when you perform them
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {jobs.map((job) => {
                const OperationIcon = operationIcons[job.operation_type] || Layers;
                const StatusIcon = statusIcons[job.status] || Clock;
                const progress = getProgress(job);

                return (
                  <Card key={job.id} className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <OperationIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {operationLabels[job.operation_type] || job.operation_type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn("capitalize text-xs", statusColors[job.status])}
                        >
                          <StatusIcon
                            className={cn(
                              "w-3 h-3 mr-1",
                              job.status === "running" && "animate-spin"
                            )}
                          />
                          {job.status}
                        </Badge>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {job.processed_items.toLocaleString()} / {job.total_items.toLocaleString()} items
                          </span>
                          <span className="font-mono">{progress}%</span>
                        </div>
                        <Progress
                          value={progress}
                          className={cn(
                            "h-1.5",
                            job.status === "error" && "[&>div]:bg-destructive",
                            job.status === "running" && "[&>div]:bg-primary"
                          )}
                        />
                      </div>

                      {/* Error info */}
                      {job.failed_items > 0 && (
                        <div className="mt-3 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {job.failed_items} failed item(s)
                          </p>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {job.started_at && (
                          <span>Started: {new Date(job.started_at).toLocaleTimeString()}</span>
                        )}
                        {job.completed_at && (
                          <span>Completed: {new Date(job.completed_at).toLocaleTimeString()}</span>
                        )}
                      </div>

                      {/* Actions */}
                      {job.status === "error" && job.failed_items > 0 && onRetry && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleRetry(job)}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retry Failed Items
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
