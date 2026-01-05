import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Zap, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeedGaugeProps {
  estimatedTime?: string;
  averageDeliveryTime?: number; // in minutes - from provider data
  providerSpeed?: 'instant' | 'fast' | 'medium' | 'slow';
  className?: string;
  compact?: boolean; // For mobile/small spaces
}

export const SpeedGauge = ({ 
  estimatedTime, 
  averageDeliveryTime,
  providerSpeed,
  className = '',
  compact = false
}: SpeedGaugeProps) => {
  // Parse estimated time to determine speed level (0-100)
  const speedLevel = useMemo(() => {
    // Priority 1: Use explicit provider speed if available
    if (providerSpeed) {
      switch (providerSpeed) {
        case 'instant': return 95;
        case 'fast': return 80;
        case 'medium': return 50;
        case 'slow': return 25;
      }
    }
    
    // Priority 2: Use average delivery time in minutes
    if (averageDeliveryTime) {
      if (averageDeliveryTime <= 5) return 95; // Under 5 mins = instant
      if (averageDeliveryTime <= 30) return 85; // Under 30 mins = fast
      if (averageDeliveryTime <= 60) return 70; // Under 1 hour
      if (averageDeliveryTime <= 360) return 50; // Under 6 hours
      if (averageDeliveryTime <= 1440) return 30; // Under 24 hours
      return 15; // Over 24 hours = slow
    }
    
    // Priority 3: Parse estimatedTime string
    if (!estimatedTime) return 50;
    
    const lower = estimatedTime.toLowerCase();
    
    // Fast indicators
    if (lower.includes('instant') || lower.includes('1-5 min') || lower.includes('5 min') || 
        lower.includes('seconds') || lower.includes('minutes')) {
      return 90;
    }
    
    // Medium-fast
    if (lower.includes('1 hour') || lower.includes('1-2 hour') || lower.includes('few hours')) {
      return 70;
    }
    
    // Medium
    if (lower.includes('hour') || lower.includes('12 hour') || lower.includes('same day')) {
      return 50;
    }
    
    // Slow
    if (lower.includes('day') || lower.includes('24 hour') || lower.includes('1-2 day')) {
      return 30;
    }
    
    // Very slow
    if (lower.includes('week') || lower.includes('days')) {
      return 15;
    }
    
    return 50;
  }, [estimatedTime, averageDeliveryTime, providerSpeed]);

  const speedLabel = useMemo(() => {
    if (speedLevel >= 80) return 'Fast';
    if (speedLevel >= 50) return 'Medium';
    return 'Slow';
  }, [speedLevel]);

  const speedColor = useMemo(() => {
    if (speedLevel >= 80) return 'hsl(var(--chart-2))';
    if (speedLevel >= 50) return 'hsl(var(--chart-4))';
    return 'hsl(var(--destructive))';
  }, [speedLevel]);

  const speedColorClass = useMemo(() => {
    if (speedLevel >= 80) return 'text-emerald-500';
    if (speedLevel >= 50) return 'text-amber-500';
    return 'text-red-500';
  }, [speedLevel]);

  const glowColorClass = useMemo(() => {
    if (speedLevel >= 80) return 'bg-emerald-500';
    if (speedLevel >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  }, [speedLevel]);

  // Calculate needle rotation (-90 to 90 degrees)
  const needleRotation = -90 + (speedLevel / 100) * 180;

  const SpeedIcon = useMemo(() => {
    if (speedLevel >= 80) return Zap;
    if (speedLevel >= 50) return Clock;
    return AlertCircle;
  }, [speedLevel]);

  // Compact mode for mobile - just show label and icon
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <motion.div
          key={speedLabel}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
            speedLevel >= 80 ? "bg-emerald-500/10" : 
            speedLevel >= 50 ? "bg-amber-500/10" : "bg-red-500/10"
          )}
        >
          <SpeedIcon className={cn("w-3.5 h-3.5", speedColorClass)} />
          <span className={cn("text-xs font-semibold", speedColorClass)}>
            {speedLabel}
          </span>
        </motion.div>
        {estimatedTime && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
            {estimatedTime}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Gauge with glow effect */}
      <div className="relative w-32 h-20">
        {/* Background glow */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-xl opacity-20",
          glowColorClass
        )} />
        
        {/* Fast service pulse effect */}
        {speedLevel >= 80 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={cn(
              "absolute inset-0 rounded-full",
              glowColorClass,
              "opacity-20"
            )}
          />
        )}
        
        <svg viewBox="0 0 100 55" className="w-full h-full relative z-10">
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Gradient arc segments */}
          <defs>
            <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--destructive))" />
              <stop offset="50%" stopColor="hsl(var(--chart-4))" />
              <stop offset="100%" stopColor="hsl(var(--chart-2))" />
            </linearGradient>
          </defs>
          
          {/* Colored arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="url(#speedGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(speedLevel / 100) * 126} 126`}
          />
          
          {/* Tick marks */}
          <g className="text-muted-foreground">
            <text x="8" y="48" fontSize="6" fill="currentColor" opacity="0.5">Low</text>
            <text x="43" y="12" fontSize="6" fill="currentColor" opacity="0.5">Med</text>
            <text x="78" y="48" fontSize="6" fill="currentColor" opacity="0.5">Fast</text>
          </g>
          
          {/* Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: needleRotation }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
            style={{ transformOrigin: '50px 50px' }}
          >
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke={speedColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="5" fill={speedColor} />
          </motion.g>
        </svg>
      </div>
      
      {/* Speed label with icon */}
      <motion.div
        key={speedLabel}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-full",
          speedLevel >= 80 ? "bg-emerald-500/10" : 
          speedLevel >= 50 ? "bg-amber-500/10" : "bg-red-500/10"
        )}
      >
        <SpeedIcon className={cn("w-4 h-4", speedColorClass)} />
        <span className={cn("text-sm font-semibold", speedColorClass)}>
          {speedLabel}
        </span>
      </motion.div>
      
      {estimatedTime && (
        <span className="text-xs text-muted-foreground text-center max-w-[120px]">
          {estimatedTime}
        </span>
      )}
    </div>
  );
};
