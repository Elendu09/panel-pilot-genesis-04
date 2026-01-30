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
    <Card className="p-5 bg-card border-border/50 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {peakLabel && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Peak: {peakLabel}
          </span>
        )}
      </div>
      
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {prefix}{formatCompactNumber(value)}{suffix}
          </p>
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            change.trend === 'up' ? 'text-green-500' : 
            change.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
          )}>
            {change.trend === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : change.trend === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : null}
            <span>{change.value} vs last period</span>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <MiniSparkline 
            data={sparklineData} 
            color={sparklineColor}
            width={80}
            height={36}
            showArea
          />
        </div>
      </div>
    </Card>
  );
}
