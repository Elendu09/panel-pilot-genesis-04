import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle, Download, Sparkles, Search, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AutoFixProgress {
  phase: 'idle' | 'fetching' | 'analyzing' | 'previewing' | 'applying' | 'categorizing' | 'completed' | 'error';
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
  title = "Smart Organize",
}: AutoFixProgressDialogProps) => {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  
  const phaseConfig = {
    idle: { label: "Preparing...", icon: Loader2, color: "text-muted-foreground" },
    fetching: { label: "Fetching services...", icon: Download, color: "text-blue-500" },
    analyzing: { label: "Analyzing services...", icon: Search, color: "text-amber-500" },
    previewing: { label: "Generating preview...", icon: Layers, color: "text-cyan-500" },
    applying: { label: "Applying changes...", icon: Sparkles, color: "text-purple-500" },
    categorizing: { label: "Updating categories...", icon: Layers, color: "text-teal-500" },
    completed: { label: "Completed!", icon: Check, color: "text-green-500" },
    error: { label: "Error occurred", icon: AlertCircle, color: "text-destructive" },
  };
  
  const currentPhase = phaseConfig[progress.phase];
  const PhaseIcon = currentPhase.icon;
  const isAnimating = ['fetching', 'analyzing', 'previewing', 'applying', 'categorizing'].includes(progress.phase);
  
  // All phases in order
  const phases: Array<{ key: string; label: string }> = [
    { key: 'fetching', label: 'Fetch' },
    { key: 'analyzing', label: 'Analyze' },
    { key: 'applying', label: 'Apply' },
    { key: 'categorizing', label: 'Categorize' },
    { key: 'completed', label: 'Done' },
  ];
  
  const currentPhaseIndex = phases.findIndex(p => p.key === progress.phase);
  
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
            {phases.map((phase, idx) => {
              const isActive = progress.phase === phase.key;
              const isPast = currentPhaseIndex > idx || progress.phase === 'completed';
              
              return (
                <div key={phase.key} className="flex items-center">
                  <div className={cn(
                    "flex items-center gap-1",
                    isPast && "text-green-500",
                    isActive && "text-primary font-medium"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      isPast ? "bg-green-500" : isActive ? "bg-primary" : "bg-muted"
                    )} />
                    {phase.label}
                  </div>
                  {idx < phases.length - 1 && (
                    <div className="flex-1 h-px bg-border mx-2" />
                  )}
                </div>
              );
            })}
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
