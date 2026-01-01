import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle, Download, Sparkles, Search, Layers, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AutoFixProgress {
  phase: 'idle' | 'fetching' | 'analyzing' | 'previewing' | 'applying' | 'organizing' | 'categorizing' | 'completed' | 'error';
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
  title = "AutoFix Icon + Smart Organize",
}: AutoFixProgressDialogProps) => {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  
  const phaseConfig = {
    idle: { label: "Preparing...", icon: Loader2, color: "text-muted-foreground", gradient: "from-muted to-muted" },
    fetching: { label: "Fetching services...", icon: Download, color: "text-blue-500", gradient: "from-blue-500 to-blue-400" },
    analyzing: { label: "AI Analyzing...", icon: Search, color: "text-amber-500", gradient: "from-amber-500 to-orange-400" },
    previewing: { label: "Generating preview...", icon: Layers, color: "text-cyan-500", gradient: "from-cyan-500 to-blue-400" },
    applying: { label: "Applying changes...", icon: Sparkles, color: "text-purple-500", gradient: "from-purple-500 to-pink-400" },
    organizing: { label: "Organizing by type...", icon: Layers, color: "text-indigo-500", gradient: "from-indigo-500 to-purple-400" },
    categorizing: { label: "Updating categories...", icon: Wand2, color: "text-teal-500", gradient: "from-teal-500 to-green-400" },
    completed: { label: "Completed!", icon: Check, color: "text-green-500", gradient: "from-green-500 to-emerald-400" },
    error: { label: "Error occurred", icon: AlertCircle, color: "text-destructive", gradient: "from-destructive to-red-400" },
  };
  
  const currentPhase = phaseConfig[progress.phase];
  const PhaseIcon = currentPhase.icon;
  const isAnimating = ['fetching', 'analyzing', 'previewing', 'applying', 'organizing', 'categorizing'].includes(progress.phase);
  
  // All phases in order with descriptions
  const phases: Array<{ key: string; label: string; description: string }> = [
    { key: 'fetching', label: 'Fetch', description: 'Loading services' },
    { key: 'analyzing', label: 'Analyze', description: 'AI detection' },
    { key: 'applying', label: 'Apply', description: 'Updating icons' },
    { key: 'organizing', label: 'Organize', description: 'Sort by type' },
    { key: 'categorizing', label: 'Categorize', description: 'Update counts' },
    { key: 'completed', label: 'Done', description: 'All complete' },
  ];
  
  const currentPhaseIndex = phases.findIndex(p => p.key === progress.phase);
  
  // Calculate overall progress considering all phases
  const overallProgress = (() => {
    const phaseWeights: Record<string, { start: number; weight: number }> = {
      idle: { start: 0, weight: 0 },
      fetching: { start: 0, weight: 15 },
      analyzing: { start: 15, weight: 30 },
      previewing: { start: 45, weight: 5 },
      applying: { start: 50, weight: 25 },
      organizing: { start: 75, weight: 15 },
      categorizing: { start: 90, weight: 10 },
      completed: { start: 100, weight: 0 },
      error: { start: 0, weight: 0 },
    };
    
    const { start, weight } = phaseWeights[progress.phase] || { start: 0, weight: 0 };
    const phaseProgress = progress.total > 0 ? (progress.current / progress.total) : 0;
    return Math.min(100, Math.round(start + (phaseProgress * weight)));
  })();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => {
          if (['completed', 'error'].includes(progress.phase)) {
            onOpenChange(false);
          } else {
            e.preventDefault(); // Prevent closing during processing
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-lg bg-gradient-to-br",
              currentPhase.gradient
            )}>
              <PhaseIcon className={cn(
                "w-4 h-4 text-white",
                isAnimating && "animate-pulse"
              )} />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription>
            {progress.message || currentPhase.label}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Phase indicator with icon */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={cn("font-medium", currentPhase.color)}>
                {currentPhase.label}
              </span>
              {isAnimating && (
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </div>
            <span className="text-muted-foreground font-mono text-xs">
              {progress.current.toLocaleString()} / {progress.total.toLocaleString()}
            </span>
          </div>
          
          {/* Enhanced gradient progress bar */}
          <div className="relative">
            <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
              <div 
                className={cn(
                  "h-full transition-all duration-300 ease-out rounded-full bg-gradient-to-r",
                  currentPhase.gradient
                )}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            {/* Shimmer effect */}
            {isAnimating && (
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            )}
          </div>
          
          {/* Percentage with service count */}
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              {overallProgress}%
            </div>
            {progress.total > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Processing {progress.total.toLocaleString()} services
              </div>
            )}
          </div>
          
          {/* Phase steps with connecting lines */}
          <div className="relative pt-4">
            <div className="flex items-center justify-between">
              {phases.map((phase, idx) => {
                const isActive = progress.phase === phase.key;
                const isPast = currentPhaseIndex > idx || progress.phase === 'completed';
                
                return (
                  <div key={phase.key} className="flex flex-col items-center relative z-10">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                      isPast ? "bg-green-500 text-white scale-100" : 
                      isActive ? "bg-primary text-primary-foreground scale-110 ring-4 ring-primary/20" : 
                      "bg-muted text-muted-foreground"
                    )}>
                      {isPast ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span className={cn(
                      "text-[10px] mt-1.5 font-medium",
                      isPast && "text-green-500",
                      isActive && "text-primary"
                    )}>
                      {phase.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Connecting line behind phases */}
            <div className="absolute top-[26px] left-3 right-3 h-0.5 bg-muted -z-0">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${Math.max(0, (currentPhaseIndex / (phases.length - 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        
        {progress.phase === 'completed' && (
          <Button onClick={() => onOpenChange(false)} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <Check className="w-4 h-4 mr-2" />
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
