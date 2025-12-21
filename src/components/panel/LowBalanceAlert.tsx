import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LowBalanceAlertProps {
  balance?: number;
  threshold?: number;
  commissionDue?: number;
  onDismiss?: () => void;
  className?: string;
}

export const LowBalanceAlert = ({
  balance = 0,
  threshold = 10,
  commissionDue = 25.50,
  onDismiss,
  className
}: LowBalanceAlertProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show alert if balance is below threshold or commission is due
    if (balance < threshold || commissionDue > 0) {
      setIsVisible(true);
    }
  }, [balance, threshold, commissionDue]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    onDismiss?.();
  };

  if (isDismissed || !isVisible) return null;

  const isPanelInactive = commissionDue > balance;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg",
          className
        )}
      >
        <div className={cn(
          "relative overflow-hidden rounded-xl border shadow-lg backdrop-blur-xl",
          isPanelInactive 
            ? "bg-destructive/10 border-destructive/30" 
            : "bg-amber-500/10 border-amber-500/30"
        )}>
          {/* Animated gradient background */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r opacity-20",
            isPanelInactive 
              ? "from-destructive via-destructive/50 to-transparent" 
              : "from-amber-500 via-amber-500/50 to-transparent"
          )} />
          
          {/* Pulsing glow effect */}
          <div className={cn(
            "absolute -left-4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-3xl animate-pulse",
            isPanelInactive ? "bg-destructive/30" : "bg-amber-500/30"
          )} />

          <div className="relative p-4 flex items-center gap-4">
            {/* Icon */}
            <div className={cn(
              "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
              isPanelInactive 
                ? "bg-destructive/20" 
                : "bg-amber-500/20"
            )}>
              <AlertTriangle className={cn(
                "w-6 h-6",
                isPanelInactive ? "text-destructive" : "text-amber-500"
              )} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-semibold",
                isPanelInactive ? "text-destructive" : "text-amber-600 dark:text-amber-400"
              )}>
                {isPanelInactive ? "Your panel is inactive" : "Low Balance Warning"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isPanelInactive 
                  ? `Pay the commission ($${commissionDue.toFixed(2)}) to proceed`
                  : `Balance is low ($${balance.toFixed(2)}). Add funds to avoid service interruption.`
                }
              </p>
            </div>

            {/* Actions */}
            <div className="shrink-0 flex items-center gap-2">
              <Link to="/panel/billing">
                <Button 
                  size="sm" 
                  className={cn(
                    "gap-2",
                    isPanelInactive 
                      ? "bg-destructive hover:bg-destructive/90" 
                      : "bg-amber-500 hover:bg-amber-600 text-white"
                  )}
                >
                  <Wallet className="w-4 h-4" />
                  Add Funds
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress bar showing how much of commission is covered */}
          {isPanelInactive && (
            <div className="h-1 bg-destructive/20">
              <motion.div 
                className="h-full bg-destructive"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((balance / commissionDue) * 100, 100)}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
