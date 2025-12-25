import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BulkOperationProgress } from "@/lib/bulk-ops";

interface BulkProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: BulkOperationProgress;
  title: string;
  description?: string;
  onComplete?: () => void;
}

export function BulkProgressModal({
  open,
  onOpenChange,
  progress,
  title,
  description,
  onComplete,
}: BulkProgressModalProps) {
  const percentage = progress.total > 0 
    ? Math.round((progress.processed / progress.total) * 100) 
    : 0;
  
  const isComplete = progress.status === 'completed' || progress.status === 'error';
  
  const handleClose = () => {
    if (isComplete && onComplete) {
      onComplete();
    }
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {progress.status === 'running' && (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            )}
            {progress.status === 'completed' && (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            )}
            {progress.status === 'error' && (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {progress.status === 'running' ? 'Processing...' : 
                 progress.status === 'completed' ? 'Complete!' :
                 progress.status === 'error' ? 'Completed with errors' : 'Preparing...'}
              </span>
              <span className="font-mono font-medium">
                {progress.processed.toLocaleString()} / {progress.total.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={percentage} 
              className={cn(
                "h-3",
                progress.status === 'error' && "[&>div]:bg-amber-500"
              )}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Chunk {progress.currentChunk} of {progress.totalChunks}</span>
              <span className="font-bold text-foreground">{percentage}%</span>
            </div>
          </div>
          
          {/* Error Display */}
          {progress.error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
                <div>
                  <p className="font-medium text-destructive">Some errors occurred:</p>
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-3">{progress.error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Status Messages */}
          {progress.status === 'completed' && !progress.error && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  Successfully processed {progress.total.toLocaleString()} services
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {isComplete && (
          <div className="flex justify-end">
            <Button onClick={handleClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
