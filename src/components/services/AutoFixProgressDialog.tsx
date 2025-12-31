import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle, Download, Sparkles, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AutoFixProgress {
  phase: 'idle' | 'fetching' | 'analyzing' | 'applying' | 'completed' | 'error';
  current: number;
  total: number;
  message?: string;
}

interface AutoFixProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: AutoFixProgress;
  title?: string;
}

export const AutoFixProgressDialog = ({
  open,
  onOpenChange,
  progress,
  title = "Auto-Fix Icons",
}: AutoFixProgressDialogProps) => {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  
  const phaseConfig = {
    idle: { label: "Preparing...", icon: Loader2, color: "text-muted-foreground" },
    fetching: { label: "Fetching services...", icon: Download, color: "text-blue-500" },
    analyzing: { label: "Analyzing services...", icon: Search, color: "text-amber-500" },
    applying: { label: "Applying changes...", icon: Sparkles, color: "text-purple-500" },
    completed: { label: "Completed!", icon: Check, color: "text-green-500" },
    error: { label: "Error occurred", icon: AlertCircle, color: "text-destructive" },
  };
  
  const currentPhase = phaseConfig[progress.phase];
  const PhaseIcon = currentPhase.icon;
  const isAnimating = ['fetching', 'analyzing', 'applying'].includes(progress.phase);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhaseIcon className={cn(
              "w-5 h-5",
              currentPhase.color,
              isAnimating && "animate-spin"
            )} />
            {title}
          </DialogTitle>
          <DialogDescription>
            {progress.message || currentPhase.label}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Phase indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className={cn("font-medium", currentPhase.color)}>
              {currentPhase.label}
            </span>
            <span className="text-muted-foreground">
              {progress.current.toLocaleString()} / {progress.total.toLocaleString()}
            </span>
          </div>
          
          {/* Progress bar */}
          <Progress value={percentage} className="h-3" />
          
          {/* Percentage */}
          <div className="text-center text-2xl font-bold">
            {percentage}%
          </div>
          
          {/* Phase steps */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <div className={cn(
              "flex items-center gap-1",
              ['fetching', 'analyzing', 'applying', 'completed'].includes(progress.phase) && "text-green-500"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                ['fetching', 'analyzing', 'applying', 'completed'].includes(progress.phase) ? "bg-green-500" : "bg-muted"
              )} />
              Fetch
            </div>
            <div className="flex-1 h-px bg-border mx-2" />
            <div className={cn(
              "flex items-center gap-1",
              ['analyzing', 'applying', 'completed'].includes(progress.phase) && "text-green-500"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                ['analyzing', 'applying', 'completed'].includes(progress.phase) ? "bg-green-500" : "bg-muted"
              )} />
              Analyze
            </div>
            <div className="flex-1 h-px bg-border mx-2" />
            <div className={cn(
              "flex items-center gap-1",
              ['applying', 'completed'].includes(progress.phase) && "text-green-500"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                ['applying', 'completed'].includes(progress.phase) ? "bg-green-500" : "bg-muted"
              )} />
              Apply
            </div>
            <div className="flex-1 h-px bg-border mx-2" />
            <div className={cn(
              "flex items-center gap-1",
              progress.phase === 'completed' && "text-green-500"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                progress.phase === 'completed' ? "bg-green-500" : "bg-muted"
              )} />
              Done
            </div>
          </div>
        </div>
        
        {progress.phase === 'completed' && (
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        )}
        
        {progress.phase === 'error' && (
          <Button variant="destructive" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AutoFixProgressDialog;
