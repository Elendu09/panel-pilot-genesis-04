import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const primaryInsight = insights[0];
  
  if (!primaryInsight) {
    return (
      <Card className="bg-card border-border/50 row-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-muted-foreground">No insights available yet</p>
        </CardContent>
      </Card>
    );
  }
  
  const getIconAndColor = (type: InsightData['type']) => {
    switch (type) {
      case 'success':
        return { 
          icon: TrendingUp, 
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          textColor: 'text-emerald-500',
          ringColor: 'ring-emerald-500/20'
        };
      case 'warning':
        return { 
          icon: AlertTriangle, 
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          textColor: 'text-amber-500',
          ringColor: 'ring-amber-500/20'
        };
      default:
        return { 
          icon: Info, 
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-500',
          ringColor: 'ring-blue-500/20'
        };
    }
  };
  
  const { icon: Icon, bgColor, borderColor, textColor, ringColor } = getIconAndColor(primaryInsight.type);

  return (
    <Card className={cn(
      "bg-card border-border/50 row-span-2 relative overflow-hidden",
      primaryInsight.type === 'success' && "border-l-2 border-l-emerald-500",
      primaryInsight.type === 'warning' && "border-l-2 border-l-amber-500",
      primaryInsight.type === 'info' && "border-l-2 border-l-blue-500"
    )}>
      {/* Subtle gradient glow */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        primaryInsight.type === 'success' && "bg-gradient-to-br from-emerald-500 to-transparent",
        primaryInsight.type === 'warning' && "bg-gradient-to-br from-amber-500 to-transparent",
        primaryInsight.type === 'info' && "bg-gradient-to-br from-blue-500 to-transparent"
      )} />
      
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {/* Main Insight */}
        <div className="flex items-start gap-4">
          {/* Metric Circle */}
          <div className={cn(
            "flex-shrink-0 w-20 h-20 rounded-full flex flex-col items-center justify-center ring-4",
            bgColor,
            ringColor
          )}>
            <span className={cn("text-2xl font-bold", textColor)}>
              {primaryInsight.metric.toFixed(0)}%
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {primaryInsight.metricLabel}
            </span>
          </div>
          
          {/* Insight Text */}
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Icon className={cn("w-4 h-4", textColor)} />
              {primaryInsight.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {primaryInsight.description}
            </p>
            {primaryInsight.projectedImpact && (
              <p className={cn("text-xs font-medium mt-2", textColor)}>
                {primaryInsight.projectedImpact}
              </p>
            )}
          </div>
        </div>
        
        {/* Secondary Insights */}
        {insights.length > 1 && (
          <div className="pt-4 border-t border-border/50 space-y-3">
            {insights.slice(1, 3).map((insight, i) => {
              const { textColor: secondaryColor } = getIconAndColor(insight.type);
              return (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    insight.type === 'success' && 'bg-emerald-500/10',
                    insight.type === 'warning' && 'bg-amber-500/10',
                    insight.type === 'info' && 'bg-blue-500/10'
                  )}>
                    <span className={cn("text-xs font-bold", secondaryColor)}>
                      {insight.metric.toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-muted-foreground flex-1 truncate">
                    {insight.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
