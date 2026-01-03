import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles, ArrowRight, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PromotionalBannerProps {
  customization?: {
    primaryColor?: string;
    companyName?: string;
    themeMode?: 'dark' | 'light';
  };
  onSignUp?: () => void;
  className?: string;
}

interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  discount?: string;
  icon: typeof Gift;
  gradient: string;
  cta: string;
  expiresIn?: string;
}

const defaultPromotions: Promotion[] = [
  {
    id: 'welcome',
    title: 'Welcome Bonus!',
    subtitle: 'Get 10% extra on your first deposit',
    discount: '10%',
    icon: Gift,
    gradient: 'from-primary via-primary/80 to-accent',
    cta: 'Claim Now',
    expiresIn: 'Limited time',
  },
  {
    id: 'flash',
    title: 'Flash Sale',
    subtitle: 'All Instagram services at special prices',
    discount: '25% OFF',
    icon: Zap,
    gradient: 'from-pink-500 via-rose-500 to-orange-500',
    cta: 'View Deals',
    expiresIn: '24 hours left',
  },
  {
    id: 'new',
    title: 'New Services Available',
    subtitle: 'Try our new TikTok & YouTube packages',
    icon: Sparkles,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    cta: 'Explore',
  },
];

export const PromotionalBanner = ({ 
  customization, 
  onSignUp,
  className 
}: PromotionalBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const promotions = defaultPromotions;
  const currentPromo = promotions[currentIndex];
  const Icon = currentPromo.icon;

  // Auto-rotate promotions
  useEffect(() => {
    if (promotions.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [promotions.length]);

  // Check if banner was dismissed
  useEffect(() => {
    const dismissed = sessionStorage.getItem('promo-banner-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('promo-banner-dismissed', 'true');
  };

  const handleCTA = () => {
    if (onSignUp) {
      onSignUp();
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative overflow-hidden",
          className
        )}
      >
        <div 
          className={cn(
            "relative py-2.5 px-4 sm:px-6",
            `bg-gradient-to-r ${currentPromo.gradient}`
          )}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                                  radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 0%'],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            {/* Sparkle effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

          <div className="relative flex items-center justify-between gap-3 max-w-7xl mx-auto">
            {/* Left: Icon + Content */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <motion.div
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className="w-4 h-4 text-white" />
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPromo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0"
                >
                  <div className="flex items-center gap-2">
                    {currentPromo.discount && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-white/20 text-white backdrop-blur-sm">
                        {currentPromo.discount}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-semibold text-white truncate">
                      {currentPromo.title}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-white/90 truncate hidden sm:inline">
                    {currentPromo.subtitle}
                  </span>
                  {currentPromo.expiresIn && (
                    <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-white/75">
                      <Clock className="w-3 h-3" />
                      {currentPromo.expiresIn}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: CTA + Dismiss */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Promotion dots */}
              {promotions.length > 1 && (
                <div className="hidden md:flex items-center gap-1 mr-2">
                  {promotions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        index === currentIndex
                          ? "bg-white w-3"
                          : "bg-white/40 hover:bg-white/60"
                      )}
                    />
                  ))}
                </div>
              )}

              <Button
                size="sm"
                onClick={handleCTA}
                className="h-7 px-3 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
              >
                {currentPromo.cta}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>

              <button
                onClick={handleDismiss}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4 text-white/80" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromotionalBanner;
