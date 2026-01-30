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
    <Card className={cn(
      "p-4 bg-card/80 backdrop-blur-sm border-border/50",
      "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
      "group relative overflow-hidden"
    )}>
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors" />
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
            "inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full",
            change.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 
            change.trend === 'down' ? 'text-red-600 dark:text-red-400 bg-red-500/10' : 
            'text-muted-foreground bg-muted'
          )}>
            {change.trend === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : change.trend === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px]">→</span>
            )}
            <span>{change.value}</span>
          </div>
        </div>
        
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl shadow-sm",
          "group-hover:scale-110 transition-transform duration-300",
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
