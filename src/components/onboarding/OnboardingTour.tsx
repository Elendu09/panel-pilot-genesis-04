import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Users,
  Code,
  Palette,
  CreditCard,
  Globe,
  Sparkles,
  MousePointer2,
  Hand,
  Check,
  Menu,
  Home
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  target: string | null;
  selector?: string;
  mobileSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  mobilePosition?: "top" | "bottom" | "center";
  action?: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Panel! 🎉",
    description: "Let's take a quick tour to help you get started with managing your SMM panel. We'll show you where everything is.",
    icon: Sparkles,
    target: null,
    position: "center",
    mobilePosition: "center",
  },
  {
    id: "sidebar",
    title: "Navigation Sidebar",
    description: "This is your main navigation. Click any menu item to access different sections of your panel.",
    icon: LayoutDashboard,
    target: "sidebar",
    selector: "[data-tour='sidebar']",
    position: "right",
    desktopOnly: true,
    action: "Click menu items to navigate",
  },
  {
    id: "mobile-nav",
    title: "Bottom Navigation",
    description: "Use the bottom navigation bar to quickly access key features of your panel on mobile.",
    icon: Menu,
    target: "mobile-nav",
    mobileSelector: "[data-tour='mobile-home']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap icons to navigate",
  },
  {
    id: "dashboard",
    title: "Dashboard Overview",
    description: "Your dashboard shows real-time stats, recent orders, and quick actions. Monitor everything at a glance.",
    icon: LayoutDashboard,
    target: "overview",
    selector: "[data-tour='dashboard-stats']",
    mobileSelector: "[data-tour='mobile-home']",
    position: "bottom",
    mobilePosition: "top",
    action: "View your key metrics here",
  },
  {
    id: "services",
    title: "Services Management",
    description: "Add and manage SMM services. Set prices, categories, and import services from providers.",
    icon: Package,
    target: "services",
    selector: "[data-tour='services']",
    mobileSelector: "[data-tour='mobile-services']",
    position: "right",
    mobilePosition: "top",
    action: "Click to manage services",
  },
  {
    id: "orders",
    title: "Orders Management",
    description: "View and manage customer orders. Track status, process refunds, and monitor delivery progress.",
    icon: ShoppingCart,
    target: "orders",
    selector: "[data-tour='orders']",
    mobileSelector: "[data-tour='mobile-orders']",
    position: "right",
    mobilePosition: "top",
    action: "Click to view orders",
  },
  {
    id: "providers",
    title: "Provider Integration",
    description: "Connect to SMM providers, sync services, and manage API connections for automated order processing.",
    icon: Users,
    target: "providers",
    selector: "[data-tour='providers']",
    position: "right",
    mobilePosition: "center",
    action: "Click to add providers",
  },
  {
    id: "analytics",
    title: "Analytics & Reports",
    description: "Detailed analytics showing revenue, orders, and customer activity trends over time.",
    icon: BarChart3,
    target: "analytics",
    selector: "[data-tour='analytics']",
    mobileSelector: "[data-tour='mobile-analytics']",
    position: "right",
    mobilePosition: "top",
    action: "Click for insights",
  },
  {
    id: "payments",
    title: "Payment Methods",
    description: "Configure payment gateways to accept payments from customers worldwide.",
    icon: CreditCard,
    target: "payment-methods",
    selector: "[data-tour='payments']",
    position: "right",
    mobilePosition: "center",
    action: "Click to configure",
  },
  {
    id: "design",
    title: "Design Customization",
    description: "Customize your panel's appearance with themes, colors, and branding options.",
    icon: Palette,
    target: "design",
    selector: "[data-tour='design']",
    position: "right",
    mobilePosition: "center",
    action: "Click to customize",
  },
  {
    id: "more-menu",
    title: "More Options",
    description: "Access additional settings like API management, domain configuration, and more from the menu.",
    icon: Menu,
    target: "more",
    mobileSelector: "[data-tour='mobile-more']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap for more options",
  },
  {
    id: "api",
    title: "API Management",
    description: "Generate API keys for customers to integrate with their own systems.",
    icon: Code,
    target: "api",
    selector: "[data-tour='api']",
    position: "right",
    mobilePosition: "center",
    desktopOnly: true,
    action: "Click to manage API",
  },
  {
    id: "domain",
    title: "Domain Settings",
    description: "Connect your custom domain and configure SSL for a professional appearance.",
    icon: Globe,
    target: "domains",
    selector: "[data-tour='domain']",
    position: "right",
    mobilePosition: "center",
    desktopOnly: true,
    action: "Click to set up domain",
  },
  {
    id: "complete",
    title: "You're All Set! ✨",
    description: "You're ready to start managing your SMM panel. Explore all features and grow your business!",
    icon: Sparkles,
    target: null,
    position: "center",
    mobilePosition: "center",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  isOpen: boolean;
}

// Animated click indicator component
const ClickIndicator = ({ position }: { position: { x: number; y: number } }) => (
  <motion.div
    className="fixed pointer-events-none z-[102]"
    style={{ left: position.x, top: position.y }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1.2, 1],
      opacity: [0, 1, 1]
    }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <motion.div
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative"
    >
      <Hand className="w-8 h-8 text-primary drop-shadow-lg transform -rotate-12" />
      <motion.div
        className="absolute -inset-2 rounded-full bg-primary/20"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  </motion.div>
);

// Spotlight overlay component
const SpotlightOverlay = ({ targetRect }: { targetRect: DOMRect | null }) => {
  if (!targetRect) return null;

  const padding = 8;
  const left = targetRect.left - padding;
  const top = targetRect.top - padding;
  const width = targetRect.width + padding * 2;
  const height = targetRect.height + padding * 2;

  return (
    <>
      {/* Spotlight cutout using clip-path */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99] pointer-events-none"
        style={{
          background: 'rgba(0, 0, 0, 0.75)',
          clipPath: `polygon(
            0% 0%, 
            0% 100%, 
            ${left}px 100%, 
            ${left}px ${top}px, 
            ${left + width}px ${top}px, 
            ${left + width}px ${top + height}px, 
            ${left}px ${top + height}px, 
            ${left}px 100%, 
            100% 100%, 
            100% 0%
          )`
        }}
      />
      
      {/* Highlight border around target */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[100] pointer-events-none rounded-lg"
        style={{
          left: left,
          top: top,
          width: width,
          height: height,
        }}
      >
        <div className="absolute inset-0 rounded-lg border-2 border-primary" />
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-primary"
          animate={{
            boxShadow: [
              "0 0 0 0 hsl(var(--primary) / 0.4)",
              "0 0 0 8px hsl(var(--primary) / 0)",
              "0 0 0 0 hsl(var(--primary) / 0)"
            ]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </motion.div>
    </>
  );
};

export const OnboardingTour = ({ onComplete, isOpen }: OnboardingTourProps) => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Filter steps based on device
  const filteredSteps = tourSteps.filter(step => {
    if (isMobile && step.desktopOnly) return false;
    if (!isMobile && step.mobileOnly) return false;
    return true;
  });
  
  const step = filteredSteps[currentStep];
  const progress = ((currentStep + 1) / filteredSteps.length) * 100;

  // Get the appropriate selector based on device
  const getSelector = useCallback(() => {
    if (!step) return null;
    if (isMobile && step.mobileSelector) return step.mobileSelector;
    return step.selector || null;
  }, [step, isMobile]);

  // Get the appropriate position based on device
  const getPosition = useCallback(() => {
    if (!step) return "center";
    if (isMobile && step.mobilePosition) return step.mobilePosition;
    return step.position || "center";
  }, [step, isMobile]);

  // Find and highlight target element
  const updateTargetRect = useCallback(() => {
    const selector = getSelector();
    if (selector) {
      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        // Position click indicator at center of element
        setClickPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
        return;
      }
    }
    setTargetRect(null);
    setClickPosition(null);
  }, [getSelector]);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(updateTargetRect, 100);
      // Update on scroll/resize
      window.addEventListener('resize', updateTargetRect);
      window.addEventListener('scroll', updateTargetRect);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener('resize', updateTargetRect);
        window.removeEventListener('scroll', updateTargetRect);
      };
    }
  }, [isOpen, currentStep, updateTargetRect]);

  // Reset step when switching device modes
  useEffect(() => {
    setCurrentStep(0);
  }, [isMobile]);

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleStepClick = (index: number) => {
    if (index < filteredSteps.length) {
      setCurrentStep(index);
    }
  };

  // Calculate card position based on target and device
  const getCardPosition = () => {
    const position = getPosition();
    
    // Mobile: always position card in safe area
    if (isMobile) {
      if (position === "top" && targetRect) {
        // Card above the bottom nav but below target
        return {
          position: "fixed" as const,
          bottom: window.innerHeight - targetRect.top + 16,
          left: 16,
          right: 16,
        };
      }
      // Default mobile position - center or top area
      return {
        position: "fixed" as const,
        top: position === "center" ? "50%" : 80,
        left: 16,
        right: 16,
        transform: position === "center" ? "translateY(-50%)" : undefined,
      };
    }

    // Desktop positioning
    if (!targetRect || position === "center") {
      return { 
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      };
    }

    const cardWidth = 400;
    const cardHeight = 450;
    const padding = 20;

    switch (position) {
      case "right":
        return {
          position: "fixed" as const,
          top: Math.max(padding, Math.min(targetRect.top, window.innerHeight - cardHeight - padding)),
          left: Math.min(targetRect.right + padding, window.innerWidth - cardWidth - padding),
        };
      case "left":
        return {
          position: "fixed" as const,
          top: Math.max(padding, Math.min(targetRect.top, window.innerHeight - cardHeight - padding)),
          right: window.innerWidth - targetRect.left + padding,
        };
      case "bottom":
        return {
          position: "fixed" as const,
          top: Math.min(targetRect.bottom + padding, window.innerHeight - cardHeight - padding),
          left: Math.max(padding, Math.min(targetRect.left, window.innerWidth - cardWidth - padding)),
        };
      case "top":
        return {
          position: "fixed" as const,
          bottom: window.innerHeight - targetRect.top + padding,
          left: Math.max(padding, Math.min(targetRect.left, window.innerWidth - cardWidth - padding)),
        };
      default:
        return {
          position: "fixed" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        };
    }
  };

  if (!isOpen || !step) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[98]">
        {/* Backdrop for non-targeted steps */}
        {!targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={handleSkip}
          />
        )}

        {/* Spotlight overlay for targeted steps */}
        <SpotlightOverlay targetRect={targetRect} />

        {/* Click indicator */}
        {clickPosition && step.action && (
          <ClickIndicator position={clickPosition} />
        )}
        
        {/* Ambient glow effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            className="absolute w-[600px] h-[600px] opacity-20 rounded-full bg-primary blur-3xl"
            animate={{
              x: targetRect ? targetRect.left - 300 : "calc(50vw - 300px)",
              y: targetRect ? targetRect.top - 300 : "calc(50vh - 300px)"
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Tour Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`z-[101] ${isMobile ? 'w-auto' : 'w-full max-w-md mx-4'}`}
          style={getCardPosition()}
        >
          <Card className={`bg-card/95 backdrop-blur-xl border-primary/30 shadow-2xl ${isMobile ? 'p-4 space-y-3' : 'p-6 space-y-5'}`}>
            {/* Header with close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full ${isMobile ? 'text-[10px]' : ''}`}>
                  Step {currentStep + 1} of {filteredSteps.length}
                </span>
                {step.action && !isMobile && (
                  <span className="px-2 py-1 text-xs font-medium bg-accent/10 text-accent-foreground rounded-full flex items-center gap-1">
                    <MousePointer2 className="w-3 h-3" />
                    Interactive
                  </span>
                )}
                {isMobile && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-secondary/50 text-secondary-foreground rounded-full">
                    Mobile
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
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
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className={`rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 ${isMobile ? 'p-3' : 'p-5'}`}
              >
                <step.icon className={`text-primary ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`} />
              </motion.div>
            </div>

            {/* Content */}
            <div className="text-center space-y-1.5">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}
              >
                {step.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-muted-foreground leading-relaxed ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                {step.description}
              </motion.p>
              
              {/* Action hint */}
              {step.action && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2"
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    <Hand className="w-3 h-3" />
                    {step.action}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Enhanced Step Progress Indicator */}
            <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
              {/* Step counter text */}
              <div className={`flex items-center justify-between text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                <span>{currentStep + 1} of {filteredSteps.length} steps</span>
                <span>{filteredSteps.length - currentStep - 1} remaining</span>
              </div>
              
              {/* Visual step indicators - simplified on mobile */}
              {isMobile ? (
                // Simplified progress bar for mobile
                <div className="flex items-center gap-1">
                  {filteredSteps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={false}
                      animate={{
                        backgroundColor: index <= currentStep 
                          ? "hsl(var(--primary))" 
                          : "hsl(var(--muted))"
                      }}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        index === currentStep ? "bg-primary" : ""
                      }`}
                      onClick={() => handleStepClick(index)}
                    />
                  ))}
                </div>
              ) : (
                // Full step indicators for desktop
                <div className="flex items-center justify-center gap-1">
                  {filteredSteps.map((s, index) => (
                    <button
                      key={index}
                      onClick={() => handleStepClick(index)}
                      className="group relative flex items-center"
                      title={s.title}
                    >
                      {/* Connector line */}
                      {index > 0 && (
                        <div className={`absolute right-full w-1 h-0.5 ${
                          index <= currentStep ? "bg-primary" : "bg-muted"
                        }`} />
                      )}
                      
                      {/* Step dot/icon */}
                      <motion.div
                        initial={false}
                        animate={{
                          scale: index === currentStep ? 1 : 0.8,
                          backgroundColor: index < currentStep 
                            ? "hsl(var(--primary))" 
                            : index === currentStep 
                              ? "hsl(var(--primary))"
                              : "hsl(var(--muted))"
                        }}
                        className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                          index === currentStep 
                            ? "w-6 h-6 ring-2 ring-primary/30 ring-offset-2 ring-offset-background" 
                            : "w-4 h-4 hover:scale-110"
                        }`}
                      >
                        {index < currentStep ? (
                          <Check className="w-2.5 h-2.5 text-primary-foreground" />
                        ) : index === currentStep ? (
                          <motion.div 
                            className="w-2 h-2 bg-primary-foreground rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        ) : null}
                      </motion.div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="px-2 py-1 text-[10px] font-medium bg-popover border border-border rounded shadow-lg whitespace-nowrap">
                          {s.title.replace(/[🎉✨]/g, '').trim()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'}`}>
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className={`flex-1 gap-1 ${isMobile ? 'text-sm py-2' : 'gap-2'}`}
                  size={isMobile ? "sm" : "default"}
                >
                  <ChevronLeft className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                  {isMobile ? "" : "Back"}
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={`flex-1 gap-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 ${isMobile ? 'text-sm py-2' : 'gap-2'}`}
                size={isMobile ? "sm" : "default"}
              >
                {currentStep === filteredSteps.length - 1 ? (
                  <>
                    <Sparkles className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                    {isMobile ? "Start" : "Get Started"}
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                  </>
                )}
              </Button>
            </div>

            {/* Skip link */}
            {currentStep < filteredSteps.length - 1 && (
              <button
                onClick={handleSkip}
                className={`w-full text-center text-muted-foreground hover:text-foreground transition-colors ${isMobile ? 'text-[10px]' : 'text-xs'}`}
              >
                Skip tour
              </button>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
