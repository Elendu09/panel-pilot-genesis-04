import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, calculateChange } from '@/lib/analytics-utils';
import { MoreHorizontal, TrendingUp, TrendingDown, DollarSign, ArrowDownRight, ArrowUpRight, Wallet, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GrossVolumeCardProps {
  grossVolume: number;
  previousGrossVolume: number;
  orderPayments: number;
  deposits: number;
  refunds: number;
  netRevenue: number;
}

export function GrossVolumeCard({
  grossVolume,
  previousGrossVolume,
  orderPayments,
  deposits,
  refunds,
  netRevenue
}: GrossVolumeCardProps) {
  const change = calculateChange(grossVolume, previousGrossVolume);
  
  const breakdownItems = [
    { 
      label: 'Order Payments', 
      value: orderPayments, 
      icon: DollarSign, 
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      label: 'Deposits', 
      value: deposits, 
      icon: ArrowDownRight, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Refunds', 
      value: -refunds, 
      icon: ArrowUpRight, 
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      isNegative: true
    },
  ];
  
  return (
    <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Wallet className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          Gross Volume
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>
                <p className="text-xs max-w-[220px]">Total revenue before deductions. Net Revenue = Order Payments + Deposits - Refunds.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Main Value */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight tabular-nums truncate">
            {formatCurrency(grossVolume)}
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
        
        {/* Breakdown */}
        <div className="space-y-1.5 md:space-y-2 pt-2 border-t border-border/50">
          {breakdownItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.label}
                className="flex items-center justify-between text-xs md:text-sm py-1 md:py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn("w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center shrink-0", item.bgColor)}>
                    <Icon className={cn("w-3 h-3 md:w-3.5 md:h-3.5", item.color)} />
                  </div>
                  <span className="text-muted-foreground truncate">{item.label}</span>
                </div>
                <span className={cn(
                  "font-medium tabular-nums shrink-0",
                  item.isNegative ? 'text-red-400' : 'text-foreground'
                )}>
                  {item.isNegative ? '-' : ''}{formatCurrency(Math.abs(item.value))}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Net Revenue */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 bg-gradient-to-r from-emerald-500/5 to-transparent -mx-6 px-6 py-3 rounded-b-lg">
          <span className="text-xs md:text-sm font-medium text-muted-foreground">Net Revenue</span>
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-bold text-emerald-500 tabular-nums">{formatCurrency(netRevenue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
