import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  X,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Menu,
  Sparkles,
  Hand,
  Check,
  HeadphonesIcon,
} from "lucide-react";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  target: string | null;
  selector?: string;
  position: "top" | "center";
  action?: string;
}

// Buyer mobile tour steps
const buyerTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Dashboard",
    description: "Let's quickly explore how to navigate and use the key features!",
    icon: Sparkles,
    target: null,
    position: "center",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Your main hub! View your balance, recent orders, and quick stats at a glance.",
    icon: LayoutDashboard,
    target: "buyer-dashboard",
    selector: "[data-tour='mobile-dashboard']",
    position: "top",
    action: "Tap to view your dashboard",
  },
  {
    id: "deposit",
    title: "Add Funds",
    description: "Top up your balance using various payment methods to place orders.",
    icon: Wallet,
    target: "buyer-deposit",
    selector: "[data-tour='mobile-deposit']",
    position: "top",
    action: "Tap to add funds",
  },
  {
    id: "new-order",
    title: "New Order",
    description: "Browse services and place new orders for social media growth!",
    icon: ShoppingCart,
    target: "buyer-new-order",
    selector: "[data-tour='mobile-new-order']",
    position: "top",
    action: "Tap to create an order",
  },
  {
    id: "support",
    title: "Support",
    description: "Need help? Contact our support team for assistance with your orders.",
    icon: HeadphonesIcon,
    target: "buyer-support",
    selector: "[data-tour='mobile-support']",
    position: "top",
    action: "Tap for support",
  },
  {
    id: "more",
    title: "More Options",
    description: "Access your profile, orders history, favorites, and additional settings.",
    icon: Menu,
    target: "buyer-more",
    selector: "[data-tour='mobile-more']",
    position: "top",
    action: "Tap for more options",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Start exploring services and grow your social presence! 🚀",
    icon: Sparkles,
    target: null,
    position: "center",
  },
];

interface BuyerOnboardingTourProps {
  onComplete?: () => void;
}

export const BuyerOnboardingTour = ({ onComplete }: BuyerOnboardingTourProps) => {
  const { buyer } = useBuyerAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Only run on mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Listen for tour restart event
  useEffect(() => {
    const handleRestartTour = () => {
      if (isMobile) {
        setCurrentStep(0);
        setIsOpen(true);
      }
    };

    window.addEventListener("restartBuyerTour", handleRestartTour);
    return () => window.removeEventListener("restartBuyerTour", handleRestartTour);
  }, [isMobile]);

  // Check localStorage for tour completion
  useEffect(() => {
    if (!buyer?.id || !isMobile) return;

    const tourKey = `buyer_tour_completed_${buyer.id}`;
    const hasCompleted = localStorage.getItem(tourKey);

    // Auto-start for first-time users (optional - uncomment if desired)
    // if (!hasCompleted) {
    //   setIsOpen(true);
    // }
  }, [buyer?.id, isMobile]);

  const step = buyerTourSteps[currentStep];
  const progress = ((currentStep + 1) / buyerTourSteps.length) * 100;

  // Find target element
  const updateTargetRect = useCallback(() => {
    if (!step?.selector) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect);
        return;
      }
    }
    setTargetRect(null);
  }, [step]);

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(updateTargetRect, 100);
      window.addEventListener("resize", updateTargetRect);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener("resize", updateTargetRect);
      };
    }
  }, [isOpen, currentStep, updateTargetRect]);

  const handleNext = () => {
    if (currentStep < buyerTourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    if (buyer?.id) {
      localStorage.setItem(`buyer_tour_completed_${buyer.id}`, "true");
    }
    setIsOpen(false);
    setCurrentStep(0);
    onComplete?.();
  };

  const handleSkip = () => {
    completeTour();
  };

  // Check if this is a centered step
  const isCenteredStep = step?.id === "welcome" || step?.id === "complete";

  // Positioning for mobile
  const getPositionStyles = useMemo(() => {
    if (isCenteredStep || !targetRect) {
      return {
        position: "fixed" as const,
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        pointerEvents: "none" as const,
      };
    }

    // Position above bottom nav
    return {
      position: "fixed" as const,
      left: 0,
      right: 0,
      bottom: 88,
      display: "flex",
      justifyContent: "center",
      padding: "0 16px",
      pointerEvents: "none" as const,
    };
  }, [isCenteredStep, targetRect]);

  if (!isOpen || !step || !isMobile) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[98]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={isCenteredStep ? undefined : handleSkip}
        />

        {/* Spotlight for targeted elements */}
        {targetRect && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[99] pointer-events-none"
              style={{
                background: "rgba(0, 0, 0, 0.75)",
                clipPath: `polygon(
                  0% 0%, 
                  0% 100%, 
                  ${targetRect.left - 4}px 100%, 
                  ${targetRect.left - 4}px ${targetRect.top - 4}px, 
                  ${targetRect.right + 4}px ${targetRect.top - 4}px, 
                  ${targetRect.right + 4}px ${targetRect.bottom + 4}px, 
                  ${targetRect.left - 4}px ${targetRect.bottom + 4}px, 
                  ${targetRect.left - 4}px 100%, 
                  100% 100%, 
                  100% 0%
                )`,
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed z-[100] pointer-events-none rounded-lg border-2 border-primary"
              style={{
                left: targetRect.left - 4,
                top: targetRect.top - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
                boxShadow: "0 0 0 4px hsl(var(--primary) / 0.3)",
              }}
            />
          </>
        )}

        {/* Click indicator for targeted steps */}
        {targetRect && step.action && (
          <motion.div
            className="fixed pointer-events-none z-[102]"
            style={{
              left: targetRect.left + targetRect.width / 2,
              top: targetRect.top + targetRect.height / 2,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }}>
              <Hand className="w-6 h-6 text-primary drop-shadow-lg -rotate-12" />
            </motion.div>
          </motion.div>
        )}

        {/* Card positioning wrapper */}
        <div className="z-[101]" style={getPositionStyles}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              width: "100%",
              maxWidth: "340px",
              pointerEvents: "auto",
            }}
          >
            <Card className="bg-card/95 backdrop-blur-xl border-primary/30 shadow-2xl p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                  Step {currentStep + 1} of {buyerTourSteps.length}
                </span>
                <Button variant="ghost" size="icon" onClick={handleSkip} className="h-7 w-7 text-muted-foreground">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress */}
              <Progress value={progress} className="h-1.5" />

              {/* Icon */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
                >
                  <step.icon className="w-8 h-8 text-primary" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="text-center space-y-1.5">
                <h2 className="text-lg font-bold">{step.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                {step.action && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium bg-primary/10 text-primary rounded-full mt-2">
                    <Hand className="w-3 h-3" />
                    {step.action}
                  </span>
                )}
              </div>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-1">
                {buyerTourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index <= currentStep ? "bg-primary w-4" : "bg-muted w-1.5"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs text-muted-foreground h-8">
                  Skip
                </Button>

                <div className="flex-1" />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <Button size="sm" onClick={handleNext} className="h-8 gap-1 min-w-[80px]">
                  {currentStep === buyerTourSteps.length - 1 ? (
                    <>
                      <Check className="w-3 h-3" />
                      Done
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-3 h-3" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default BuyerOnboardingTour;
