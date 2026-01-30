import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Package, 
  FolderOpen, 
  Clock, 
  DollarSign, 
  Undo2, 
  ShoppingCart, 
  Server,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatCompactNumber } from '@/lib/analytics-utils';

interface MetricData {
  label: string;
  value: string | number;
  change?: { value: string; trend: 'up' | 'down' | 'neutral' };
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  tooltip: string;
}

interface TenantMetricsGridProps {
  topServices: { name: string; orders: number }[];
  categoryDistribution: { name: string; count: number; percent: number }[];
  peakHour: number;
  avgOrderValue: number;
  refundRate: number;
  customerLifetimeValue: number;
  providerSuccessRate: number;
}

export function TenantMetricsGrid({
  topServices,
  categoryDistribution,
  peakHour,
  avgOrderValue,
  refundRate,
  customerLifetimeValue,
  providerSuccessRate
}: TenantMetricsGridProps) {
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const metrics: MetricData[] = [
    {
      label: 'Avg Order Value',
      value: formatCurrency(avgOrderValue),
      icon: ShoppingCart,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      tooltip: 'Average revenue per order in the selected period'
    },
    {
      label: 'Customer LTV',
      value: formatCurrency(customerLifetimeValue),
      icon: DollarSign,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      tooltip: 'Average total spending per customer over their lifetime'
    },
    {
      label: 'Refund Rate',
      value: `${refundRate.toFixed(1)}%`,
      change: refundRate > 5 ? { value: 'High', trend: 'down' } : { value: 'Good', trend: 'up' },
      icon: Undo2,
      iconBg: refundRate > 5 ? 'bg-red-500/10' : 'bg-emerald-500/10',
      iconColor: refundRate > 5 ? 'text-red-500' : 'text-emerald-500',
      tooltip: 'Percentage of orders that were refunded'
    },
    {
      label: 'Peak Activity',
      value: formatHour(peakHour),
      icon: Clock,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      tooltip: 'Hour with the highest order volume'
    },
    {
      label: 'Provider Success',
      value: `${providerSuccessRate.toFixed(0)}%`,
      change: providerSuccessRate >= 90 ? { value: 'Excellent', trend: 'up' } : { value: 'Check providers', trend: 'neutral' },
      icon: Server,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      tooltip: 'Success rate of orders processed by external providers'
    },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Tenant Performance</CardTitle>
            <p className="text-xs text-muted-foreground">Key business metrics and insights</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div 
                key={metric.label}
                className="p-3 rounded-xl bg-gradient-to-b from-muted/30 to-muted/10 border border-border/30 hover:border-border/50 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-1.5 rounded-lg", metric.iconBg)}>
                    <Icon className={cn("w-3.5 h-3.5", metric.iconColor)} />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-muted-foreground/50 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{metric.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-lg md:text-xl font-bold text-foreground truncate">
                  {metric.value}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate">{metric.label}</p>
                  {metric.change && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] px-1 py-0",
                        metric.change.trend === 'up' ? 'text-emerald-500 border-emerald-500/20' :
                        metric.change.trend === 'down' ? 'text-red-500 border-red-500/20' :
                        'text-muted-foreground'
                      )}
                    >
                      {metric.change.value}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Services & Categories Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Services */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-medium">Top Services</h4>
            </div>
            <div className="space-y-2">
              {topServices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                topServices.slice(0, 5).map((service, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                      <span className="text-sm truncate">{service.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {formatCompactNumber(service.orders)} orders
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-medium">Category Distribution</h4>
            </div>
            <div className="space-y-2">
              {categoryDistribution.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
              ) : (
                categoryDistribution.slice(0, 5).map((category, i) => {
                  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="truncate">{category.name}</span>
                        <span className="font-medium shrink-0">{category.percent.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all", colors[i % colors.length])}
                          style={{ width: `${category.percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
