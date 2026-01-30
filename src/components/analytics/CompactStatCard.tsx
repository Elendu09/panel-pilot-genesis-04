import { Card } from '@/components/ui/card';
import { MiniSparkline } from './MiniSparkline';
import { formatCompactNumber } from '@/lib/analytics-utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompactStatCardProps {
  title: string;
  value: number;
  change: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  sparklineData: number[];
  peakLabel?: string;
  sparklineColor?: string;
  prefix?: string;
  suffix?: string;
}

export function CompactStatCard({
  title,
  value,
  change,
  sparklineData,
  peakLabel,
  sparklineColor = 'hsl(var(--primary))',
  prefix = '',
  suffix = ''
}: CompactStatCardProps) {
  return (
    <Card className={cn(
      "p-4 md:p-5 bg-card/80 backdrop-blur-sm border-border/50",
      "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
      "group relative overflow-hidden"
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <span className="text-xs md:text-sm font-medium text-muted-foreground">{title}</span>
          {peakLabel && (
            <span className="text-[10px] md:text-xs text-muted-foreground bg-muted px-1.5 md:px-2 py-0.5 rounded">
              Peak: {peakLabel}
            </span>
          )}
        </div>
        
        <div className="flex items-end justify-between gap-2 md:gap-4">
          <div className="space-y-1 md:space-y-1.5 min-w-0 flex-1">
            <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight truncate">
              {prefix}{formatCompactNumber(value)}{suffix}
            </p>
            <div className={cn(
              "inline-flex items-center gap-1 text-xs md:text-sm font-medium px-2 py-0.5 rounded-full",
              change.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 
              change.trend === 'down' ? 'text-red-600 dark:text-red-400 bg-red-500/10' : 
              'text-muted-foreground bg-muted'
            )}>
              {change.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5" />
              ) : change.trend === 'down' ? (
                <TrendingDown className="w-3 h-3 md:w-3.5 md:h-3.5" />
              ) : null}
              <span className="truncate">{change.value}</span>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <MiniSparkline 
              data={sparklineData} 
              color={sparklineColor}
              width={60}
              height={28}
              showArea
              className="md:w-[80px] md:h-[36px]"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
