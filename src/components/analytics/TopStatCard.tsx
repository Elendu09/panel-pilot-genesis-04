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
      "p-3 md:p-4 bg-card/80 backdrop-blur-xl border-border/50",
      "hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
      "group relative overflow-hidden",
      "ring-1 ring-primary/5 hover:ring-primary/10"
    )}>
      {/* Glassmorphic gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1 space-y-1.5 md:space-y-2 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs md:text-sm font-medium text-muted-foreground truncate">{title}</span>
            {tooltip && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>
                    <p className="text-xs max-w-[220px]">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight truncate">
            {value}
          </p>
          
          <div className={cn(
            "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
            change.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 
            change.trend === 'down' ? 'text-red-600 dark:text-red-400 bg-red-500/10' : 
            'text-muted-foreground bg-muted'
          )}>
            {change.trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : change.trend === 'down' ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <span className="w-3 h-3 flex items-center justify-center text-[10px]">→</span>
            )}
            <span className="truncate">{change.value}</span>
          </div>
        </div>
        
        <div className={cn(
          "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-lg shrink-0",
          "group-hover:scale-110 group-hover:shadow-xl transition-all duration-300",
          "ring-1 ring-white/10",
          iconBg
        )}>
          <div className={cn("w-5 h-5 md:w-6 md:h-6", iconColor)}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}