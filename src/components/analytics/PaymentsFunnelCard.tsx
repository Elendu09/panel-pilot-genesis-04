import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCompactNumber } from '@/lib/analytics-utils';
import { MoreHorizontal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  dropOff: number;
}

interface PaymentsFunnelCardProps {
  stages: FunnelStage[];
  totalTransactions: number;
  conversionRate: number;
  overallDropOff: number;
}

export function PaymentsFunnelCard({
  stages,
  totalTransactions,
  conversionRate,
  overallDropOff
}: PaymentsFunnelCardProps) {
  const maxCount = Math.max(...stages.map(s => s.count), 1);
  
  // Colors for the funnel bars (blue gradient)
  const barColors = [
    'bg-blue-500',
    'bg-blue-400', 
    'bg-blue-500',
    'bg-amber-500',
    'bg-emerald-500'
  ];

  return (
    <Card className="col-span-full lg:col-span-2 bg-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Payments</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Funnel Stages */}
        <div className="space-y-4">
          {/* Stage Headers */}
          <div className="grid grid-cols-5 gap-2 text-center">
            {stages.map((stage, i) => (
              <div key={stage.name} className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{stage.name}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
            ))}
          </div>
          
          {/* Stage Values */}
          <div className="grid grid-cols-5 gap-2 text-center">
            {stages.map((stage, i) => (
              <div key={`${stage.name}-value`} className="flex flex-col items-center">
                <p className="text-xl md:text-2xl font-bold text-foreground">
                  {formatCompactNumber(stage.count)}
                </p>
                {i < stages.length - 1 && stage.dropOff > 0 && (
                  <span className="text-[10px] text-red-400 mt-1">
                    -{stage.dropOff.toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Funnel Bars */}
          <div className="relative h-12 flex items-end gap-0.5">
            {stages.map((stage, i) => {
              const widthPercent = (stage.count / maxCount) * 100;
              return (
                <div 
                  key={`${stage.name}-bar`}
                  className="flex-1 flex flex-col items-center"
                >
                  <div 
                    className={cn(
                      "w-full rounded-t transition-all duration-500",
                      barColors[i]
                    )}
                    style={{ 
                      height: `${Math.max((stage.count / maxCount) * 48, 4)}px`,
                      opacity: 0.6 + (stage.percentage / 100) * 0.4
                    }}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Connected funnel visualization */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-500 rounded-full opacity-60" />
        </div>
        
        {/* Summary Stats */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm border-t border-border/50 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold">{formatCompactNumber(totalTransactions)} Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Conversion:</span>
            <span className="font-semibold text-emerald-500">{conversionRate.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Drop-off:</span>
            <span className="font-semibold text-red-400">-{overallDropOff.toFixed(0)}%</span>
          </div>
        </div>

        {/* Exploration Prompt */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <span className="text-lg">💬</span>
            What would you like to explore next?
          </p>
          <div className="flex items-center gap-2 text-sm bg-background rounded-md px-3 py-2 border border-border/50">
            <span className="text-muted-foreground">I want to know what caused the drop-off from authorized to</span>
            <span className="text-primary font-medium">[successful payments]</span>
            <ArrowRight className="w-4 h-4 text-primary ml-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
