import { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";

const tourSteps = [
  {
    id: "welcome",
    title: "Welcome to Your Panel! 🎉",
    description: "Let's take a quick tour to help you get started with managing your SMM panel.",
    icon: Sparkles,
    target: null,
  },
  {
    id: "dashboard",
    title: "Dashboard Overview",
    description: "Your dashboard shows real-time stats, recent orders, and quick actions. Monitor everything at a glance.",
    icon: LayoutDashboard,
    target: "overview",
  },
  {
    id: "services",
    title: "Services Management",
    description: "Add and manage SMM services. Set prices, categories, and import services from providers.",
    icon: Package,
    target: "services",
  },
  {
    id: "orders",
    title: "Orders Management",
    description: "View and manage customer orders. Track status, process refunds, and monitor delivery.",
    icon: ShoppingCart,
    target: "orders",
  },
  {
    id: "providers",
    title: "Provider Integration",
    description: "Connect to SMM providers, sync services, and manage API connections for automated order processing.",
    icon: Users,
    target: "providers",
  },
  {
    id: "analytics",
    title: "Analytics & Reports",
    description: "Detailed analytics showing revenue, orders, and customer activity trends.",
    icon: BarChart3,
    target: "analytics",
  },
  {
    id: "payments",
    title: "Payment Methods",
    description: "Configure payment gateways to accept payments from customers worldwide.",
    icon: CreditCard,
    target: "payment-methods",
  },
  {
    id: "design",
    title: "Design Customization",
    description: "Customize your panel's appearance with themes, colors, and branding options.",
    icon: Palette,
    target: "design",
  },
  {
    id: "api",
    title: "API Management",
    description: "Generate API keys for customers to integrate with their own systems.",
    icon: Code,
    target: "api",
  },
  {
    id: "domain",
    title: "Domain Settings",
    description: "Connect your custom domain and configure SSL for a professional appearance.",
    icon: Globe,
    target: "domains",
  },
  {
    id: "complete",
    title: "You're All Set! ✨",
    description: "You're ready to start managing your SMM panel. Explore all features and grow your business!",
    icon: Sparkles,
    target: null,
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  isOpen: boolean;
}

export const OnboardingTour = ({ onComplete, isOpen }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={handleSkip}
        />
        
        {/* Spotlight effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 rounded-full bg-primary blur-3xl" />
        </div>

        {/* Tour Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <Card className="glass-card border-primary/30 p-6 space-y-6">
            {/* Header with close */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="p-6 rounded-2xl bg-primary/10 border border-primary/20"
              >
                <step.icon className="w-12 h-12 text-primary" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="text-center space-y-3">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold"
              >
                {step.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground"
              >
                {step.description}
              </motion.p>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center gap-2">
              {tourSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? "w-6 bg-primary" 
                      : index < currentStep
                        ? "bg-primary/50"
                        : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="flex-1 gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
                {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>

            {/* Skip link */}
            {currentStep < tourSteps.length - 1 && (
              <button
                onClick={handleSkip}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
