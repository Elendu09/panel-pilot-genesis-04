import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, Zap, Info, TrendingUp, TrendingDown, MousePointer, ListChecks, CreditCard, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCompactNumber } from '@/lib/analytics-utils';

interface FastOrderStage {
  name: string;
  count: number;
  percentage: number;
  dropOff: number;
}

interface FastOrderAnalyticsCardProps {
  stages: FastOrderStage[];
  totalFastOrders: number;
  conversionRate: number;
  growthTrend: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
}

const stageConfig = [
  { name: 'Visitors', icon: MousePointer, color: 'bg-blue-500', barColor: 'bg-blue-500' },
  { name: 'Selections', icon: ListChecks, color: 'bg-indigo-500', barColor: 'bg-indigo-500' },
  { name: 'Checkout', icon: CreditCard, color: 'bg-amber-500', barColor: 'bg-amber-500' },
  { name: 'Completed', icon: CheckCircle, color: 'bg-emerald-500', barColor: 'bg-emerald-500' },
];

export function FastOrderAnalyticsCard({
  stages,
  totalFastOrders,
  conversionRate,
  growthTrend
}: FastOrderAnalyticsCardProps) {
  // Use provided stages or generate mock data
  const displayStages = stages.length > 0 ? stages : [
    { name: 'Visitors', count: 0, percentage: 100, dropOff: 0 },
    { name: 'Selections', count: 0, percentage: 0, dropOff: 0 },
    { name: 'Checkout', count: 0, percentage: 0, dropOff: 0 },
    { name: 'Completed', count: 0, percentage: 0, dropOff: 0 },
  ];

  return (
    <Card className="lg:col-span-2 bg-card/80 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
      
      <CardHeader className="relative pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
          <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Sales Funnel
                <Badge variant="outline" className="ml-1 text-[10px] font-normal bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  Fast Order
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">Tracks visitor engagement through the fast order flow: from initial page visit to completed payment.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Quick checkout conversion tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium",
                growthTrend.trend === 'up' 
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                  : growthTrend.trend === 'down'
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {growthTrend.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : growthTrend.trend === 'down' ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : null}
              {growthTrend.value} vs last period
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              {conversionRate.toFixed(1)}% conv.
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        {/* Kanban-style funnel - Horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex md:grid md:grid-cols-4 gap-3 min-w-[520px] md:min-w-0">
            {displayStages.map((stage, i) => {
              const config = stageConfig[i] || stageConfig[0];
              const Icon = config.icon;
              
              return (
                <div key={stage.name} className="relative flex items-stretch">
                  <div 
                    className={cn(
                      "flex-shrink-0 w-[120px] md:w-full rounded-xl p-3 md:p-4",
                      "bg-gradient-to-b from-card/90 to-card",
                      "border border-border/40 backdrop-blur-sm",
                      "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
                      "group"
                    )}
                  >
                    {/* Stage header with color badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", `${config.color}/20`)}>
                        <Icon className={cn("w-3.5 h-3.5", config.color.replace('bg-', 'text-'))} />
                      </div>
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {stage.name}
                      </p>
                    </div>
                    
                    {/* Count */}
                    <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums">
                      {formatCompactNumber(stage.count)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mb-2">visitors</p>
                    
                    {/* Drop-off indicator */}
                    {i > 0 && stage.dropOff > 0 && (
                      <Badge 
                        variant="outline" 
                        className="mb-2 text-[9px] md:text-[10px] bg-red-500/10 text-red-400 border-red-500/20"
                      >
                        -{stage.dropOff.toFixed(0)}% drop
                      </Badge>
                    )}
                    
                    {/* Progress bar */}
                    <div className="mt-auto h-1.5 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", config.barColor)}
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Arrow connector (visible on md+) */}
                  {i < displayStages.length - 1 && (
                    <div className="hidden md:flex items-center justify-center px-1 text-muted-foreground/40">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg md:text-xl font-bold text-foreground">{formatCompactNumber(totalFastOrders)}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Total Fast Orders</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-500/10">
            <p className="text-lg md:text-xl font-bold text-emerald-500">{conversionRate.toFixed(1)}%</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Conversion Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
