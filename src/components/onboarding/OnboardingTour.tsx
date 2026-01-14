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
  Menu
} from "lucide-react";

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

interface TourStep {
  id: string;
  title: string;
  description: string;
  mobileDescription?: string;
  tabletDescription?: string;
  icon: React.ComponentType<{ className?: string }>;
  target: string | null;
  selector?: string;
  tabletSelector?: string;
  mobileSelector?: string;
  fallbackSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  tabletPosition?: "top" | "bottom" | "left" | "right" | "center";
  mobilePosition?: "top" | "bottom" | "center";
  action?: string;
  mobileAction?: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  tabletOnly?: boolean;
}

// PANEL OWNER onboarding tour steps
const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Panel",
    description: "Let's take a quick tour to help you get oriented in your SMM panel admin interface.",
    mobileDescription: "Let's take a quick 30-second tour to help you get started!",
    tabletDescription: "Let's quickly walk through the main areas of your panel and how to navigate them.",
    icon: Sparkles,
    target: null,
    position: "center",
    tabletPosition: "center",
    mobilePosition: "center",
  },
  // MOBILE-ONLY STEPS - Panel Owner bottom nav
  {
    id: "mobile-dashboard",
    title: "Your Dashboard",
    description: "Your main hub showing stats and quick actions.",
    mobileDescription: "View your revenue, orders, and key stats at a glance.",
    icon: LayoutDashboard,
    target: "mobile-home",
    mobileSelector: "[data-tour='mobile-home']",
    fallbackSelector: "[href='/panel']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap to view dashboard",
    mobileAction: "Tap to view dashboard",
  },
  {
    id: "mobile-customers",
    title: "Customer Management",
    description: "View and manage your customers.",
    mobileDescription: "Manage customer accounts, balances, and custom pricing.",
    icon: Users,
    target: "mobile-customers",
    mobileSelector: "[data-tour='mobile-customers']",
    fallbackSelector: "[href*='customers']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap to manage customers",
    mobileAction: "Tap to manage customers",
  },
  {
    id: "mobile-services",
    title: "Services Management",
    description: "Add, edit, and organize your services.",
    mobileDescription: "Import services from providers, set markups, and organize by category.",
    icon: Package,
    target: "mobile-services",
    mobileSelector: "[data-tour='mobile-services']",
    fallbackSelector: "[href*='services']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap to manage services",
    mobileAction: "Tap to manage services",
  },
  {
    id: "mobile-orders",
    title: "Orders Management",
    description: "Track and process customer orders.",
    mobileDescription: "Monitor order status, process refunds, and track delivery progress.",
    icon: ShoppingCart,
    target: "mobile-orders",
    mobileSelector: "[data-tour='mobile-orders']",
    fallbackSelector: "[href*='orders']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap to view orders",
    mobileAction: "Tap to view orders",
  },
  {
    id: "mobile-more",
    title: "More Options",
    description: "Access additional settings like API management, domain configuration, and more from the menu.",
    mobileDescription: "Find providers, payments, API, domain settings, and more!",
    icon: Menu,
    target: "mobile-more",
    mobileSelector: "[data-tour='mobile-more']",
    fallbackSelector: "[href*='more']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap for more options",
    mobileAction: "Tap for more options",
  },
  // DESKTOP/TABLET STEPS
  {
    id: "sidebar",
    title: "Navigation Sidebar",
    description: "This is your main navigation. Click any menu item to access different sections of your panel.",
    tabletDescription: "This is your main navigation sidebar. Tap any menu item to access different sections.",
    icon: LayoutDashboard,
    target: "sidebar",
    selector: "[data-tour='sidebar']",
    tabletSelector: "[data-tour='sidebar']",
    fallbackSelector: "[data-tour='mobile-home']",
    position: "right",
    tabletPosition: "right",
    desktopOnly: true,
    action: "Click menu items to navigate",
  },
  {
    id: "customers",
    title: "Customer Management",
    description: "View and manage all your customers. Track balances, orders, and engagement.",
    tabletDescription: "Full customer management with balances, order history, custom pricing, and bulk actions.",
    icon: Users,
    target: "customers",
    selector: "[data-tour='customers']",
    tabletSelector: "[data-tour='customers']",
    fallbackSelector: "[href*='customers']",
    position: "right",
    tabletPosition: "right",
    desktopOnly: true,
    action: "Click to manage customers",
  },
  {
    id: "dashboard",
    title: "Dashboard Overview",
    description: "Your real-time business intelligence hub! The dashboard displays key metrics including today's revenue, total orders, active customers, and service performance.",
    tabletDescription: "Your command center showing real-time stats, recent activity, and quick actions. Tap any card for more details.",
    icon: LayoutDashboard,
    target: "overview",
    selector: "[data-tour='dashboard-stats']",
    tabletSelector: "[data-tour='dashboard-stats']",
    fallbackSelector: ".dashboard-stats, [class*='stats'], [class*='overview']",
    position: "bottom",
    tabletPosition: "bottom",
    desktopOnly: true,
    action: "View your key metrics here",
  },
  {
    id: "services",
    title: "Services Management",
    description: "The heart of your SMM business! Here you can add, edit, and organize services. Import services in bulk from providers with automatic markup calculation.",
    tabletDescription: "Manage your SMM services. Import from providers, set markups, organize by category, and toggle visibility.",
    icon: Package,
    target: "services",
    selector: "[data-tour='services']",
    tabletSelector: "[data-tour='services']",
    fallbackSelector: "[href*='services']",
    position: "right",
    tabletPosition: "right",
    desktopOnly: true,
    action: "Click to manage services",
  },
  {
    id: "orders",
    title: "Orders Management",
    description: "Complete order lifecycle management! Track order status from pending to completed, view detailed order information, process refunds, and monitor delivery progress.",
    tabletDescription: "Full order management: track status, process refunds, filter by date/status, and use bulk actions.",
    icon: ShoppingCart,
    target: "orders",
    selector: "[data-tour='orders']",
    tabletSelector: "[data-tour='orders']",
    fallbackSelector: "[href*='orders']",
    position: "right",
    tabletPosition: "right",
    desktopOnly: true,
    action: "Click to view orders",
  },
  {
    id: "providers",
    title: "Provider Integration",
    description: "Connect to multiple SMM providers for automated order fulfillment! Add provider API credentials, check real-time balances, and sync their service catalogs with one click.",
    tabletDescription: "Connect SMM providers for automated fulfillment. Add API credentials, check balances, and sync services.",
    icon: Users,
    target: "providers",
    selector: "[data-tour='providers']",
    tabletSelector: "[data-tour='providers']",
    fallbackSelector: "[href*='provider']",
    position: "right",
    tabletPosition: "right",
    desktopOnly: true,
    action: "Click to add providers",
  },
  {
    id: "analytics",
    title: "Analytics & Reports",
    description: "Deep insights into your business performance! View revenue trends, order volumes, and customer activity over customizable time periods.",
    tabletDescription: "Business intelligence at your fingertips. Interactive charts, customizable date ranges, and exportable reports.",
    icon: BarChart3,
    target: "analytics",
    selector: "[data-tour='analytics']",
    tabletSelector: "[data-tour='analytics']",
    fallbackSelector: "[href*='analytics']",
    position: "right",
    tabletPosition: "right",
    desktopOnly: true,
    action: "Click for insights",
  },
  {
    id: "payments",
    title: "Payment Methods",
    description: "Configure how customers pay you! Integrate popular payment gateways like Stripe, PayPal, and cryptocurrency options.",
    tabletDescription: "Configure payment gateways: Stripe, PayPal, crypto, and more. Set minimum deposits and view transaction logs.",
    icon: CreditCard,
    target: "payment-methods",
    selector: "[data-tour='payments']",
    tabletSelector: "[data-tour='payments']",
    fallbackSelector: "[href*='payment']",
    position: "right",
    tabletPosition: "right",
    desktopOnly: true,
    action: "Click to configure",
  },
  {
    id: "design",
    title: "Design Customization",
    description: "Make your panel uniquely yours! Choose from multiple themes, customize colors to match your brand, upload your logo, and configure the layout.",
    tabletDescription: "Customize your brand: themes, colors, logo, and layout. Preview across all device sizes before publishing.",
    icon: Palette,
    target: "design",
    selector: "[data-tour='design']",
    tabletSelector: "[data-tour='design']",
    fallbackSelector: "[href*='design']",
    position: "right",
    tabletPosition: "right",
    desktopOnly: true,
    action: "Click to customize design",
  },
  {
    id: "api",
    title: "API Management",
    description: "Empower your resellers with API access! Generate secure API keys for customers who want to integrate your services into their own systems.",
    tabletDescription: "Generate API keys for customers to integrate your services. View documentation and monitor usage.",
    icon: Code,
    target: "api",
    selector: "[data-tour='api']",
    tabletSelector: "[data-tour='api']",
    fallbackSelector: "[href*='api']",
    position: "right",
    tabletPosition: "right",
    mobilePosition: "center",
    desktopOnly: true,
    action: "Click to manage API",
  },
  {
    id: "domain",
    title: "Domain Settings",
    description: "Professional branding with your own domain! Connect a custom domain (e.g., panel.yourbrand.com) for a polished look.",
    tabletDescription: "Connect your custom domain with guided DNS setup. Automatic SSL certificates for secure connections.",
    icon: Globe,
    target: "domains",
    selector: "[data-tour='domain']",
    tabletSelector: "[data-tour='domain']",
    fallbackSelector: "[href*='domain']",
    position: "right",
    tabletPosition: "right",
    mobilePosition: "center",
    desktopOnly: true,
    action: "Click to set up domain",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Congratulations! You're now ready to run your SMM panel like a pro. Remember: the sidebar provides quick access to all sections.",
    mobileDescription: "All done! Start managing your panel. Tap More for additional settings.",
    tabletDescription: "You're ready! Use the sidebar for quick navigation. Visit Support Center if you need assistance.",
    icon: Sparkles,
    target: null,
    position: "center",
    tabletPosition: "center",
    mobilePosition: "center",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  isOpen: boolean;
}

// Hook to detect screen size
const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };
    
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenSize, 100);
    };
    
    const handleOrientationChange = () => {
      setTimeout(updateScreenSize, 150);
    };
    
    updateScreenSize();
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  return screenSize;
};

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
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';
  const isDesktop = screenSize === 'desktop';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  
  // FIXED: Proper step filtering logic for all device modes
  const filteredSteps = useMemo(() => {
    return tourSteps.filter(step => {
      // Mobile mode: exclude desktopOnly and tabletOnly
      if (isMobile) {
        if (step.desktopOnly || step.tabletOnly) return false;
        return true;
      }
      // Tablet mode: exclude mobileOnly (show desktopOnly and tabletOnly)
      if (isTablet) {
        if (step.mobileOnly) return false;
        return true;
      }
      // Desktop mode: exclude mobileOnly and tabletOnly
      if (isDesktop) {
        if (step.mobileOnly || step.tabletOnly) return false;
        return true;
      }
      return true;
    });
  }, [isMobile, isTablet, isDesktop]);
  
  const step = filteredSteps[currentStep];
  const progress = ((currentStep + 1) / filteredSteps.length) * 100;

  // Smart selector - tries multiple selectors and finds the first visible one
  const getActiveSelector = useCallback((): string | null => {
    if (!step) return null;
    
    const selectors: (string | undefined)[] = [];
    
    if (isMobile) {
      selectors.push(step.mobileSelector, step.tabletSelector, step.selector, step.fallbackSelector);
    } else if (isTablet) {
      selectors.push(step.tabletSelector, step.selector, step.mobileSelector, step.fallbackSelector);
    } else {
      selectors.push(step.selector, step.tabletSelector, step.fallbackSelector);
    }
    
    for (const sel of selectors) {
      if (!sel) continue;
      const element = document.querySelector(sel);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
          return sel;
        }
      }
    }
    
    return null;
  }, [step, isMobile, isTablet]);

  // Get the appropriate description based on screen size
  const getDescription = useCallback(() => {
    if (!step) return "";
    if (isMobile && step.mobileDescription) return step.mobileDescription;
    if (isTablet && step.tabletDescription) return step.tabletDescription;
    return step.description;
  }, [step, isMobile, isTablet]);

  // Get the appropriate action text based on screen size
  const getActionText = useCallback(() => {
    if (!step) return "";
    if ((isMobile || isTablet) && step.mobileAction) return step.mobileAction;
    return step.action || "";
  }, [step, isMobile, isTablet]);

  // Get the appropriate position based on screen size
  const getPosition = useCallback(() => {
    if (!step) return "center";
    if (isMobile && step.mobilePosition) return step.mobilePosition;
    if (isTablet && step.tabletPosition) return step.tabletPosition;
    return step.position || "center";
  }, [step, isMobile, isTablet]);

  // Find and highlight target element
  const updateTargetRect = useCallback(() => {
    const selector = getActiveSelector();
    if (selector) {
      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        setClickPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
        return;
      }
    }
    setTargetRect(null);
    setClickPosition(null);
  }, [getActiveSelector]);

  // Auto-scroll target into view
  useEffect(() => {
    if (isOpen) {
      const selector = getActiveSelector();
      if (selector) {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          setTimeout(updateTargetRect, 350);
        }
      }
    }
  }, [currentStep, isOpen, getActiveSelector, updateTargetRect]);

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(updateTargetRect, 100);
      window.addEventListener('resize', updateTargetRect);
      window.addEventListener('scroll', updateTargetRect);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener('resize', updateTargetRect);
        window.removeEventListener('scroll', updateTargetRect);
      };
    }
  }, [isOpen, currentStep, updateTargetRect]);

  // Track previous isOpen state to reset only when tour opens fresh
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  
  // Reset step only when tour is opened (not on every resize)
  useEffect(() => {
    if (isOpen && !prevIsOpen) {
      setCurrentStep(0);
    }
    setPrevIsOpen(isOpen);
  }, [isOpen, prevIsOpen]);

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

  // Check if this is a centered step (welcome or complete)
  const isCenteredStep = step?.id === 'welcome' || step?.id === 'complete' || currentStep === 0;
  const position = getPosition();

  // FIXED: Calculate positioning using a wrapper div (no transform conflicts with Framer Motion)
  const getPositionStyles = useMemo(() => {
    // Welcome and complete steps: ALWAYS center
    if (isCenteredStep || position === "center") {
      return {
        position: "fixed" as const,
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "16px" : "24px",
        pointerEvents: "none" as const,
      };
    }

    // MOBILE: Position above bottom nav for targeted steps
    if (isMobile && position === "top" && targetRect) {
      return {
        position: "fixed" as const,
        left: 0,
        right: 0,
        bottom: 88, // Bottom nav (64px) + safe area (24px)
        display: "flex",
        justifyContent: "center",
        padding: "0 16px",
        pointerEvents: "none" as const,
      };
    }

    // MOBILE fallback: Center
    if (isMobile) {
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

    // TABLET/DESKTOP: Positioned relative to target
    if (!targetRect) {
      return {
        position: "fixed" as const,
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        pointerEvents: "none" as const,
      };
    }

    const cardWidth = isTablet ? 380 : 450;
    const cardHeight = isTablet ? 400 : 500;
    const padding = 24;

    switch (position) {
      case "right":
        return {
          position: "fixed" as const,
          top: Math.max(padding, Math.min(targetRect.top, window.innerHeight - cardHeight - padding)),
          left: Math.min(targetRect.right + padding, window.innerWidth - cardWidth - padding),
          pointerEvents: "none" as const,
        };
      case "left":
        return {
          position: "fixed" as const,
          top: Math.max(padding, Math.min(targetRect.top, window.innerHeight - cardHeight - padding)),
          right: window.innerWidth - targetRect.left + padding,
          pointerEvents: "none" as const,
        };
      case "bottom":
        return {
          position: "fixed" as const,
          top: Math.min(targetRect.bottom + padding, window.innerHeight - cardHeight - padding),
          left: Math.max(padding, Math.min(targetRect.left, window.innerWidth - cardWidth - padding)),
          pointerEvents: "none" as const,
        };
      case "top":
        return {
          position: "fixed" as const,
          bottom: window.innerHeight - targetRect.top + padding,
          left: Math.max(padding, Math.min(targetRect.left, window.innerWidth - cardWidth - padding)),
          pointerEvents: "none" as const,
        };
      default:
        return {
          position: "fixed" as const,
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          pointerEvents: "none" as const,
        };
    }
  }, [isCenteredStep, position, isMobile, isTablet, targetRect]);

  // Card width styles (separate from positioning)
  const cardWidthStyle = useMemo(() => {
    if (isMobile) {
      return {
        width: "100%",
        maxWidth: "340px",
      };
    }
    if (isTablet) {
      return {
        width: "400px",
        maxWidth: "400px",
      };
    }
    return {
      width: "480px",
      maxWidth: "480px",
    };
  }, [isMobile, isTablet]);

  if (!isOpen || !step) return null;

  const isCompact = isMobile;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[98]">
        {/* Backdrop for non-targeted steps - Don't close on welcome */}
        {!targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={isCenteredStep ? undefined : handleSkip}
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

        {/* FIXED: Positioning wrapper (no animation transforms here) */}
        <div
          className="z-[101]"
          style={getPositionStyles}
        >
          {/* Tour Card (animations happen here, separate from positioning) */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ 
              ...cardWidthStyle, 
              pointerEvents: "auto" 
            }}
          >
            <Card className={`bg-card/95 backdrop-blur-xl border-primary/30 shadow-2xl ${isCompact ? 'p-4 space-y-3' : isDesktop ? 'p-8 space-y-6' : 'p-6 space-y-5'}`}>
              {/* Header with close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 font-medium bg-primary/10 text-primary rounded-full ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                    Step {currentStep + 1} of {filteredSteps.length}
                  </span>
                  {step.action && !isCompact && (
                    <span className="px-2 py-1 text-xs font-medium bg-accent/10 text-accent-foreground rounded-full flex items-center gap-1">
                      <MousePointer2 className="w-3 h-3" />
                      Interactive
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
              <Progress value={progress} className={isDesktop ? "h-2" : "h-1.5"} />

              {/* Icon */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                  className={`rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 ${isCompact ? 'p-3' : isDesktop ? 'p-6' : 'p-5'}`}
                >
                  <step.icon className={`text-primary ${isCompact ? 'w-8 h-8' : isDesktop ? 'w-14 h-14' : 'w-10 h-10'}`} />
                </motion.div>
              </div>

              {/* Content */}
              <div className="text-center space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`font-bold ${isCompact ? 'text-lg' : isDesktop ? 'text-2xl' : 'text-xl'}`}
                >
                  {step.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`text-muted-foreground leading-relaxed ${isCompact ? 'text-xs' : isDesktop ? 'text-base' : 'text-sm'}`}
                >
                  {getDescription()}
                </motion.p>
                
                {/* Action hint */}
                {getActionText() && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-2"
                  >
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      <Hand className="w-3 h-3" />
                      {getActionText()}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Step Progress Indicator */}
              <div className={`${isCompact ? 'space-y-2' : 'space-y-3'}`}>
                <div className={`flex items-center justify-between text-muted-foreground ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                  <span>{currentStep + 1} of {filteredSteps.length} steps</span>
                  <span>{filteredSteps.length - currentStep - 1} remaining</span>
                </div>
                
                {/* Simplified progress bar */}
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
                      className={`h-1 flex-1 rounded-full transition-colors cursor-pointer ${
                        index === currentStep ? "bg-primary" : ""
                      }`}
                      onClick={() => handleStepClick(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className={`text-muted-foreground ${isCompact ? 'text-xs h-9' : ''}`}
                >
                  Skip Tour
                </Button>
                
                <div className="flex-1" />
                
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`gap-1 ${isCompact ? 'text-xs h-9 px-3' : ''}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {!isCompact && "Back"}
                </Button>
                
                <Button
                  onClick={handleNext}
                  className={`gap-1 min-w-[100px] ${isCompact ? 'text-xs h-9' : ''}`}
                >
                  {currentStep === filteredSteps.length - 1 ? (
                    <>
                      <Check className="w-4 h-4" />
                      {isCompact ? "Done" : "Complete Tour"}
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
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

export default OnboardingTour;
