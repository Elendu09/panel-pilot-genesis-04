import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCompactNumber } from '@/lib/analytics-utils';
import { MoreHorizontal, ArrowRight, FileText, CheckCircle, CircleCheck, AlertCircle, CheckCheck } from 'lucide-react';
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
  
  // Kanban stage colors and icons
  const stageConfig = [
    { color: 'bg-blue-500', dotColor: 'bg-blue-500', icon: FileText, label: 'blue' },
    { color: 'bg-indigo-500', dotColor: 'bg-indigo-500', icon: CheckCircle, label: 'indigo' },
    { color: 'bg-emerald-500', dotColor: 'bg-emerald-500', icon: CircleCheck, label: 'emerald' },
    { color: 'bg-amber-500', dotColor: 'bg-amber-500', icon: AlertCircle, label: 'amber' },
    { color: 'bg-green-600', dotColor: 'bg-green-600', icon: CheckCheck, label: 'green' },
  ];

  return (
    <Card className="col-span-full lg:col-span-2 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Payments Funnel
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Kanban-Style Funnel Stages - Horizontal scroll on mobile, grid on desktop */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin">
          <div className="flex md:grid md:grid-cols-5 gap-3 min-w-[640px] md:min-w-0">
            {stages.map((stage, i) => {
              const config = stageConfig[i] || stageConfig[0];
              const Icon = config.icon;
              
              return (
                <div 
                  key={stage.name}
                  className={cn(
                    "flex-shrink-0 w-[120px] md:w-auto rounded-xl p-3 md:p-4",
                    "bg-gradient-to-b from-card to-card/80",
                    "border border-border/40 backdrop-blur-sm",
                    "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
                    "group cursor-default"
                  )}
                >
                  {/* Stage header with color indicator */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center",
                      config.color + "/20"
                    )}>
                      <Icon className={cn("w-3.5 h-3.5", config.color.replace('bg-', 'text-'))} />
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate flex-1">
                      {stage.name}
                    </p>
                  </div>
                  
                  {/* Count */}
                  <p className="text-xl md:text-2xl font-bold text-foreground mb-0.5">
                    {formatCompactNumber(stage.count)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Orders</p>
                  
                  {/* Drop-off badge */}
                  {i < stages.length - 1 && stage.dropOff > 0 && (
                    <Badge 
                      variant="outline" 
                      className="mt-2 text-[10px] bg-red-500/10 text-red-500 border-red-500/20 px-1.5"
                    >
                      -{stage.dropOff.toFixed(0)}% drop
                    </Badge>
                  )}
                  {i === stages.length - 1 && (
                    <Badge 
                      variant="outline" 
                      className="mt-2 text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-1.5"
                    >
                      Final
                    </Badge>
                  )}
                  
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        config.color
                      )}
                      style={{ width: `${Math.max((stage.count / maxCount) * 100, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Arrow Connectors - Desktop only */}
        <div className="hidden md:flex items-center justify-between px-8 -mt-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center">
              <ArrowRight className="w-4 h-4 text-muted-foreground/60" />
            </div>
          ))}
        </div>
        
        {/* Gradient flow indicator */}
        <div className="h-1 rounded-full overflow-hidden bg-muted/30">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 via-emerald-500 via-amber-500 to-green-600 rounded-full"
            style={{ width: `${conversionRate}%`, minWidth: '10%' }}
          />
        </div>
        
        {/* Summary Stats */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm border-t border-border/50 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold text-foreground">{formatCompactNumber(totalTransactions)} Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Success:</span>
            <span className="font-semibold text-emerald-500">{conversionRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Drop-off:</span>
            <span className="font-semibold text-red-400">-{overallDropOff.toFixed(1)}%</span>
          </div>
        </div>

        {/* AI Prompt Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <span className="text-lg">💬</span>
            What would you like to explore?
          </p>
          <div className="flex items-center gap-2 text-sm bg-background/80 backdrop-blur-sm rounded-md px-3 py-2 border border-border/50">
            <span className="text-muted-foreground text-xs md:text-sm">Analyze drop-off from</span>
            <span className="text-primary font-medium text-xs md:text-sm">Authorized → Successful</span>
            <ArrowRight className="w-4 h-4 text-primary ml-auto flex-shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
