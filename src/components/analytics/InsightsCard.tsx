import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Sparkles, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const topInsight = insights[0];
  
  if (!topInsight) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Insights
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No insights available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = () => {
    switch (topInsight.type) {
      case 'success':
        return <TrendingUp className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (topInsight.type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5',
          ring: 'text-emerald-500',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5',
          ring: 'text-amber-500',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
          ring: 'text-blue-500',
        };
    }
  };

  const colors = getColors();
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (topInsight.metric / 100) * circumference;

  return (
    <Card className={cn(
      "bg-card border-border/50 overflow-hidden",
      colors.bg
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Insights
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Circular Metric Display */}
          <div className="relative flex-shrink-0">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-muted/30"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={cn("transition-all duration-700", colors.ring)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-xl font-bold", colors.ring)}>
                {topInsight.metric.toFixed(0)}%
              </span>
            </div>
          </div>
          
          {/* Insight Content */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn("p-1 rounded", colors.ring)}>
                {getIcon()}
              </span>
              <h4 className="font-semibold text-foreground">{topInsight.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {topInsight.description}
            </p>
            {topInsight.projectedImpact && (
              <p className={cn("text-xs font-medium mt-2", colors.ring)}>
                {topInsight.projectedImpact}
              </p>
            )}
          </div>
        </div>
        
        {/* Additional insights preview */}
        {insights.length > 1 && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              +{insights.length - 1} more insight{insights.length > 2 ? 's' : ''} available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
