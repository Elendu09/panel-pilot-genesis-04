import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, calculateChange } from '@/lib/analytics-utils';
import { MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
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
  
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Gross Volume</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Value */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl md:text-4xl font-bold text-foreground">
            {formatCurrency(grossVolume)}
          </span>
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded",
            change.trend === 'up' 
              ? 'text-emerald-500 bg-emerald-500/10' 
              : change.trend === 'down'
              ? 'text-red-500 bg-red-500/10'
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
        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Order Payments</span>
            <span className="font-medium text-foreground">{formatCurrency(orderPayments)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deposits</span>
            <span className="font-medium text-foreground">{formatCurrency(deposits)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Refunds</span>
            <span className="font-medium text-red-400">-{formatCurrency(refunds)}</span>
          </div>
        </div>
        
        {/* Net Revenue */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="text-sm font-medium text-muted-foreground">Net Revenue</span>
          <span className="text-lg font-bold text-emerald-500">{formatCurrency(netRevenue)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
