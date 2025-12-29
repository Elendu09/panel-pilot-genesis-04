import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface SpeedGaugeProps {
  estimatedTime?: string;
  className?: string;
}

export const SpeedGauge = ({ estimatedTime, className = '' }: SpeedGaugeProps) => {
  // Parse estimated time to determine speed level (0-100)
  const speedLevel = useMemo(() => {
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
  }, [estimatedTime]);

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

  // Calculate needle rotation (-90 to 90 degrees)
  const needleRotation = -90 + (speedLevel / 100) * 180;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative w-24 h-14">
        <svg viewBox="0 0 100 55" className="w-full h-full">
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
      
      <motion.span
        key={speedLabel}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium"
        style={{ color: speedColor }}
      >
        {speedLabel}
      </motion.span>
      
      {estimatedTime && (
        <span className="text-xs text-muted-foreground text-center">
          {estimatedTime}
        </span>
      )}
    </div>
  );
};
