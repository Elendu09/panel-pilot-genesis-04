import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ReactNode } from 'react';

interface TopStatCardProps {
  title: string;
  value: string | number;
  change: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  tooltip?: string;
}

export function TopStatCard({
  title,
  value,
  change,
  icon,
  iconBg,
  iconColor,
  tooltip
}: TopStatCardProps) {
  return (
    <Card className="p-4 bg-card border-border/50 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {value}
          </p>
          
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            change.trend === 'up' ? 'text-emerald-500' : 
            change.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
          )}>
            {change.trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : change.trend === 'down' ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <span className="w-4 h-4 flex items-center justify-center">→</span>
            )}
            <span>{change.value}</span>
          </div>
        </div>
        
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl",
          iconBg
        )}>
          <div className={cn("w-6 h-6", iconColor)}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}
