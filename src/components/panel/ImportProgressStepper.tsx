import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Loader2, Server, Download, Database, CheckCircle } from "lucide-react";

export type ImportStep = "connecting" | "fetching" | "processing" | "complete" | "error";

interface ImportProgressStepperProps {
  currentStep: ImportStep;
  progress: number;
  servicesCount?: number;
  error?: string;
}

const steps = [
  { id: "connecting", label: "Connecting", icon: Server, description: "Connecting to provider API..." },
  { id: "fetching", label: "Fetching", icon: Download, description: "Fetching services from provider..." },
  { id: "processing", label: "Processing", icon: Database, description: "Saving services to database..." },
  { id: "complete", label: "Complete", icon: CheckCircle, description: "Import completed successfully!" },
];

const stepOrder = ["connecting", "fetching", "processing", "complete"];

export const ImportProgressStepper = ({
  currentStep,
  progress,
  servicesCount = 0,
  error,
}: ImportProgressStepperProps) => {
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const isError = currentStep === "error";

  return (
    <div className="space-y-4">
      {/* Kanban-style progress steps */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = currentStepIndex > index;
          const StepIcon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-xl p-3 border transition-all",
                isComplete && "bg-green-500/10 border-green-500/30",
                isActive && "bg-primary/10 border-primary/30 ring-2 ring-primary/20",
                !isActive && !isComplete && "bg-muted/30 border-border/50 opacity-50"
              )}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isComplete && "bg-green-500 text-white",
                    isActive && "bg-primary text-primary-foreground",
                    !isActive && !isComplete && "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className={cn(
                    "text-xs font-medium",
                    isComplete && "text-green-500",
                    isActive && "text-primary"
                  )}>
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-1/2 -right-1 w-2 h-0.5 -translate-y-1/2",
                    isComplete ? "bg-green-500" : "bg-border"
                  )}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              isError ? "bg-destructive" : "bg-gradient-to-r from-primary to-green-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isError
              ? error || "Import failed"
              : steps.find(s => s.id === currentStep)?.description}
          </span>
          <span className="font-medium">{progress}%</span>
        </div>
      </div>

      {/* Services count badge */}
      {servicesCount > 0 && currentStep !== "connecting" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20"
        >
          <Database className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {currentStep === "complete"
              ? `${servicesCount} services imported successfully!`
              : `Processing ${servicesCount} services...`}
          </span>
        </motion.div>
      )}
    </div>
  );
};
