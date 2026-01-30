import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, calculateChange } from '@/lib/analytics-utils';
import { MoreHorizontal, TrendingUp, TrendingDown, DollarSign, ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Gross Volume
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Value */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {formatCurrency(grossVolume)}
          </span>
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full",
            change.trend === 'up' 
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' 
              : change.trend === 'down'
              ? 'text-red-600 dark:text-red-400 bg-red-500/10'
              : 'text-muted-foreground bg-muted'
          )}>
            {change.trend === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : change.trend === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : null}
            {change.value}
          </div>
        </div>
        
        {/* Breakdown */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          {breakdownItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.label}
                className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-6 h-6 rounded flex items-center justify-center", item.bgColor)}>
                    <Icon className={cn("w-3.5 h-3.5", item.color)} />
                  </div>
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span className={cn(
                  "font-medium tabular-nums",
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
          <span className="text-sm font-medium text-muted-foreground">Net Revenue</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-emerald-500">{formatCurrency(netRevenue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
