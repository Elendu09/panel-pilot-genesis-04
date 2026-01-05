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
  Menu,
  Home
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

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Panel",
    description: "Let’s take a quick tour to help you get oriented in your SMM panel admin interface.",
    mobileDescription: "Let's take a quick 30-second tour to help you get started!",
    tabletDescription: "Let’s quickly walk through the main areas of your panel and how to navigate them.",
    icon: Sparkles,
    target: null,
    position: "center",
    tabletPosition: "center",
    mobilePosition: "center",
  },
  {
    id: "mobile-dashboard",
    title: "Your Dashboard",
    description: "Your main hub showing stats and quick actions.",
    mobileDescription: "See your balance, recent orders, and quick stats at a glance.",
    icon: LayoutDashboard,
    target: "mobile-home",
    mobileSelector: "[data-tour='mobile-home']",
    fallbackSelector: "[data-tour='sidebar']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap to view dashboard",
    mobileAction: "Tap to view dashboard",
  },
  {
    id: "mobile-deposit",
    title: "Add Funds",
    description: "Top up your balance to start ordering services.",
    mobileDescription: "Top up your balance quickly to start ordering services.",
    icon: CreditCard,
    target: "mobile-deposit",
    mobileSelector: "[data-tour='mobile-deposit']",
    fallbackSelector: "[href*='deposit']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap to add funds",
    mobileAction: "Tap to add funds",
  },
  {
    id: "mobile-new-order",
    title: "Place New Order",
    description: "The center button is your shortcut to ordering any service!",
    mobileDescription: "The center button is your shortcut to ordering any service!",
    icon: ShoppingCart,
    target: "mobile-services",
    mobileSelector: "[data-tour='mobile-services']",
    fallbackSelector: "[href*='new-order']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap to order",
    mobileAction: "Tap to order",
  },
  {
    id: "mobile-support",
    title: "Get Support",
    description: "Need help? Access support tickets and live chat here.",
    mobileDescription: "Need help? Access support tickets and live chat here.",
    icon: Users,
    target: "mobile-support",
    mobileSelector: "[data-tour='mobile-support']",
    fallbackSelector: "[href*='support']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap for support",
    mobileAction: "Tap for support",
  },
  {
    id: "mobile-more",
    title: "More Options",
    description: "Access additional settings like API management, domain configuration, and more from the menu.",
    mobileDescription: "Find profile settings, API access, favorites, and more!",
    icon: Menu,
    target: "mobile-more",
    mobileSelector: "[data-tour='mobile-more']",
    fallbackSelector: "[data-tour='sidebar']",
    mobilePosition: "top",
    mobileOnly: true,
    action: "Tap for more options",
    mobileAction: "Tap the More icon",
  },
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
    description: "Empower your resellers with API access! Generate secure API keys for customers who want to integrate your services into their own systems. View API documentation, monitor usage statistics, and manage key permissions. Rate limiting protects your system while allowing legitimate high-volume users.",
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
    description: "Professional branding with your own domain! Connect a custom domain (e.g., panel.yourbrand.com) for a polished look. The setup wizard guides you through DNS configuration. SSL certificates are automatically provisioned for secure HTTPS connections. Monitor domain health and troubleshoot issues here.",
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
    mobileDescription: "All done! Start managing your panel. Need help? Tap the More menu.",
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

// Hook to detect screen size - aligned with CSS md: breakpoint (768px) for sidebar visibility
// Includes device rotation detection for responsive tour
const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      // Mobile: < 768px (no sidebar, uses bottom nav)
      // Tablet: 768px - 1024px (sidebar visible)
      // Desktop: >= 1024px (sidebar visible)
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };
    
    // Debounce to prevent rapid-fire updates
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenSize, 100);
    };
    
    // Handle orientation change with delay to wait for orientation to settle
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
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Filter steps based on screen size
  // Tablet (768px+) has sidebar visible, so treat it like desktop for navigation
  const filteredSteps = useMemo(() => {
    return tourSteps.filter(step => {
      // Skip desktop-only steps on mobile only (tablet has sidebar)
      if (isMobile && step.desktopOnly) return false;
      // Skip mobile-only steps on tablet and desktop (they have sidebar)
      if (!isMobile && step.mobileOnly) return false;
      return true;
    });
  }, [isMobile]);
  
  const step = filteredSteps[currentStep];
  const progress = ((currentStep + 1) / filteredSteps.length) * 100;

  // Smart selector - tries multiple selectors and finds the first visible one
  const getActiveSelector = useCallback((): string | null => {
    if (!step) return null;
    
    // Build priority list based on screen size
    const selectors: (string | undefined)[] = [];
    
    if (isMobile) {
      selectors.push(step.mobileSelector, step.tabletSelector, step.selector, step.fallbackSelector);
    } else if (isTablet) {
      selectors.push(step.tabletSelector, step.selector, step.mobileSelector, step.fallbackSelector);
    } else {
      selectors.push(step.selector, step.tabletSelector, step.fallbackSelector);
    }
    
    // Find first selector that matches a visible element
    for (const sel of selectors) {
      if (!sel) continue;
      const element = document.querySelector(sel);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Check if element is visible (not zero-sized, on screen)
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
  }, [getActiveSelector]);

  // Auto-scroll target into view
  useEffect(() => {
    if (isOpen) {
      const selector = getActiveSelector();
      if (selector) {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          // Wait for scroll, then update rect
          setTimeout(updateTargetRect, 350);
        }
      }
    }
  }, [currentStep, isOpen, getActiveSelector, updateTargetRect]);

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
  }, [screenSize]);

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
    
    // FIRST STEP (welcome): ALWAYS center on ALL devices - this takes priority
    if (currentStep === 0) {
      return { 
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: isMobile ? "calc(100vw - 32px)" : undefined,
        width: isMobile ? "auto" : undefined,
      };
    }
    
    // Center position - also always centered on all devices
    if (position === "center") {
      return { 
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: isMobile ? "calc(100vw - 32px)" : undefined,
        width: isMobile ? "auto" : undefined,
      };
    }
    
    // MOBILE ONLY: Position above bottom nav for targeted steps
    if (isMobile) {
      if (position === "top" && targetRect) {
        // Card positioned above the bottom nav, below the target element
        const bottomNavHeight = 80; // Safe area for bottom nav
        return {
          position: "fixed" as const,
          bottom: bottomNavHeight + 16,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "min(340px, calc(100vw - 32px))",
          width: "100%",
        };
      }
      // Default mobile position - center with better max-width
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "min(340px, calc(100vw - 32px))",
        width: "100%",
      };
    }

    // TABLET & DESKTOP: Center the modal (both have sidebars, no bottom nav)
    // This provides a clean, focused experience on larger screens
    if (!targetRect) {
      return { 
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      };
    }

    // For targeted elements on tablet/desktop, position relative to target
    const cardWidth = isTablet ? 380 : 450;
    const cardHeight = isTablet ? 400 : 500;
    const padding = 24;

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
        // Default to centered for tablet/desktop
        return {
          position: "fixed" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        };
    }
  };

  if (!isOpen || !step) return null;

  // Desktop gets a richer experience with larger cards
  const isCompact = isMobile;
  const isDesktop = screenSize === 'desktop';

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
          className={`z-[101] ${isCompact ? 'w-auto' : isDesktop ? 'w-full max-w-lg mx-4' : 'w-full max-w-md mx-4'}`}
          style={getCardPosition()}
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
                {isDesktop && (
                  <span className="px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-600 rounded-full">
                    Desktop Mode
                  </span>
                )}
                {isTablet && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-600 rounded-full">
                    Tablet Mode
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

            {/* Icon - larger on desktop */}
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

            {/* Content - richer on desktop */}
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
              
              {/* Action hint - uses device-specific action text */}
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

            {/* Enhanced Step Progress Indicator */}
            <div className={`${isCompact ? 'space-y-2' : 'space-y-3'}`}>
              {/* Step counter text */}
              <div className={`flex items-center justify-between text-muted-foreground ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                <span>{currentStep + 1} of {filteredSteps.length} steps</span>
                <span>{filteredSteps.length - currentStep - 1} remaining</span>
              </div>
              
              {/* Visual step indicators - simplified on mobile/tablet */}
              {isCompact ? (
                // Simplified progress bar for mobile/tablet
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
            <div className={`flex ${isCompact ? 'gap-2' : 'gap-3'}`}>
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className={`flex-1 gap-1 ${isCompact ? 'text-sm py-2' : 'gap-2'}`}
                  size={isCompact ? "sm" : "default"}
                >
                  <ChevronLeft className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                  {isCompact ? "" : "Back"}
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={`flex-1 gap-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 ${isCompact ? 'text-sm py-2' : 'gap-2'}`}
                size={isCompact ? "sm" : "default"}
              >
                {currentStep === filteredSteps.length - 1 ? (
                  <>
                    <Sparkles className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                    {isCompact ? "Start" : "Get Started"}
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className={isCompact ? "w-3 h-3" : "w-4 h-4"} />
                  </>
                )}
              </Button>
            </div>

            {/* Skip link */}
            {currentStep < filteredSteps.length - 1 && (
              <button
                onClick={handleSkip}
                className={`w-full text-center text-muted-foreground hover:text-foreground transition-colors ${isCompact ? 'text-[10px]' : 'text-xs'}`}
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