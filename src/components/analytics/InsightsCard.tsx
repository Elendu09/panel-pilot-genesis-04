import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Sparkles, TrendingUp, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InsightData {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  metric: number;
  metricLabel: string;
  projectedImpact?: string;
}

interface InsightsCardProps {
  insights: InsightData[];
}

export function InsightsCard({ insights }: InsightsCardProps) {
  const topInsight = insights[0];
  
  if (!topInsight) {
    return (
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            Insights
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>
                  <p className="text-xs max-w-[220px]">AI-generated recommendations based on your performance trends.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-muted-foreground text-sm">No insights available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = () => {
    switch (topInsight.type) {
      case 'success':
        return <TrendingUp className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getColors = () => {
    switch (topInsight.type) {
      case 'success':
        return {
          bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
          ring: 'text-emerald-500',
          ringBg: 'stroke-emerald-500',
          glow: 'shadow-emerald-500/20',
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'warning':
        return {
          bg: 'from-amber-500/10 via-amber-500/5 to-transparent',
          ring: 'text-amber-500',
          ringBg: 'stroke-amber-500',
          glow: 'shadow-amber-500/20',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      default:
        return {
          bg: 'from-blue-500/10 via-blue-500/5 to-transparent',
          ring: 'text-blue-500',
          ringBg: 'stroke-blue-500',
          glow: 'shadow-blue-500/20',
          badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
    }
  };

  const colors = getColors();
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (topInsight.metric / 100) * circumference;

  return (
    <Card className={cn(
      "bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden",
      "shadow-lg hover:shadow-xl transition-all duration-300",
      "relative group"
    )}>
      {/* Gradient background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50",
        colors.bg
      )} />
      
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          Insights
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>
                <p className="text-xs max-w-[220px]">AI-generated recommendations based on your performance trends.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Circular Metric Display */}
          <div className={cn(
            "relative flex-shrink-0",
            "shadow-lg rounded-full",
            colors.glow
          )}>
            <svg className="w-20 h-20 md:w-24 md:h-24 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                className="text-muted/30"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                strokeWidth="5"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={cn("transition-all duration-1000 ease-out", colors.ringBg)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-lg md:text-xl font-bold", colors.ring)}>
                {topInsight.metric.toFixed(0)}%
              </span>
            </div>
          </div>
          
          {/* Insight Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "p-1.5 rounded-lg border",
                colors.badge
              )}>
                {getIcon()}
              </span>
              <h4 className="font-semibold text-foreground text-sm md:text-base truncate">{topInsight.title}</h4>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {topInsight.description}
            </p>
            {topInsight.projectedImpact && (
              <p className={cn("text-[10px] md:text-xs font-medium mt-1", colors.ring)}>
                {topInsight.projectedImpact}
              </p>
            )}
          </div>
        </div>
        
        {/* Additional insights preview */}
        {insights.length > 1 && (
          <div className="pt-3 border-t border-border/50 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              +{insights.length - 1} more insight{insights.length > 2 ? 's' : ''}
            </p>
            <Button variant="ghost" size="sm" className="h-7 text-xs hover:bg-muted">
              View all <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
