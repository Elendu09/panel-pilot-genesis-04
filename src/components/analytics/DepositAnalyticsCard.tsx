import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowDownRight, Info, TrendingUp, TrendingDown, Wallet, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, calculateChange } from '@/lib/analytics-utils';

interface DepositAnalyticsCardProps {
  totalDeposits: number;
  completedDeposits: number;
  pendingDeposits: number;
  failedDeposits: number;
  previousTotalDeposits: number;
}

export function DepositAnalyticsCard({
  totalDeposits,
  completedDeposits,
  pendingDeposits,
  failedDeposits,
  previousTotalDeposits
}: DepositAnalyticsCardProps) {
  const change = calculateChange(totalDeposits, previousTotalDeposits);
  const completedPercent = totalDeposits > 0 ? (completedDeposits / totalDeposits) * 100 : 0;
  const pendingPercent = totalDeposits > 0 ? (pendingDeposits / totalDeposits) * 100 : 0;
  const failedPercent = totalDeposits > 0 ? (failedDeposits / totalDeposits) * 100 : 0;

  const statusItems = [
    { 
      label: 'Completed', 
      value: completedDeposits, 
      percent: completedPercent,
      icon: CheckCircle, 
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      barColor: 'bg-emerald-500'
    },
    { 
      label: 'Pending', 
      value: pendingDeposits, 
      percent: pendingPercent,
      icon: Clock, 
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      barColor: 'bg-amber-500'
    },
    { 
      label: 'Failed', 
      value: failedDeposits, 
      percent: failedPercent,
      icon: XCircle, 
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      barColor: 'bg-red-400'
    },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
          </div>
          Deposit Overview
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help hover:text-muted-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">Summary of buyer deposits by status for this period.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {/* Main Value */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight tabular-nums truncate">
            {formatCurrency(totalDeposits)}
          </span>
          <div className={cn(
            "flex items-center gap-1 text-xs md:text-sm font-medium px-2 md:px-2.5 py-0.5 md:py-1 rounded-full shrink-0",
            change.trend === 'up' 
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' 
              : change.trend === 'down'
              ? 'text-red-600 dark:text-red-400 bg-red-500/10'
              : 'text-muted-foreground bg-muted'
          )}>
            {change.trend === 'up' ? (
              <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5" />
            ) : change.trend === 'down' ? (
              <TrendingDown className="w-3 h-3 md:w-3.5 md:h-3.5" />
            ) : null}
            {change.value}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.label}
                className="flex items-center justify-between text-xs md:text-sm py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={cn("w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center shrink-0", item.bgColor)}>
                    <Icon className={cn("w-3 h-3 md:w-3.5 md:h-3.5", item.color)} />
                  </div>
                  <span className="text-muted-foreground truncate">{item.label}</span>
                  <div className="flex-1 mx-2 h-1.5 rounded-full bg-muted overflow-hidden max-w-[60px]">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", item.barColor)}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
                <span className={cn("font-medium tabular-nums shrink-0", item.color)}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Success Rate */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 bg-gradient-to-r from-blue-500/5 to-transparent -mx-6 px-6 py-3 rounded-b-lg">
          <span className="text-xs md:text-sm font-medium text-muted-foreground">Success Rate</span>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-medium",
              completedPercent >= 80 
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : completedPercent >= 50
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            )}
          >
            {completedPercent.toFixed(1)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
