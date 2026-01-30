import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CreditCard,
  Wallet,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatCompactNumber } from '@/lib/analytics-utils';

interface PaymentOverviewBannerProps {
  totalDeposits: number;
  periodDeposits: number;
  pendingCount: number;
  avgDepositValue: number;
  depositChange: { value: string; trend: 'up' | 'down' | 'neutral' };
}

export function PaymentOverviewBanner({
  totalDeposits,
  periodDeposits,
  pendingCount,
  avgDepositValue,
  depositChange
}: PaymentOverviewBannerProps) {
  const stats = [
    {
      label: 'Total Deposits',
      value: formatCurrency(totalDeposits),
      icon: Wallet,
      iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'This Period',
      value: formatCurrency(periodDeposits),
      change: depositChange,
      icon: TrendingUp,
      iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Pending Approvals',
      value: pendingCount,
      highlight: pendingCount > 0,
      icon: Clock,
      iconBg: pendingCount > 0 
        ? 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/30'
        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-700/30',
      iconColor: pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
    },
    {
      label: 'Avg Deposit',
      value: formatCurrency(avgDepositValue),
      icon: CreditCard,
      iconBg: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.label}
            className={cn(
              "p-3 md:p-4 bg-card/80 backdrop-blur-xl border-border/50",
              "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
              "group relative overflow-hidden",
              stat.highlight && "ring-1 ring-amber-500/30 bg-amber-500/5"
            )}
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-start justify-between">
              <div className="flex-1 space-y-1 md:space-y-2 min-w-0">
                <span className="text-xs md:text-sm font-medium text-muted-foreground truncate block">
                  {stat.label}
                </span>
                
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight truncate">
                  {typeof stat.value === 'number' ? formatCompactNumber(stat.value) : stat.value}
                </p>
                
                {stat.change && (
                  <div className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                    stat.change.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 
                    stat.change.trend === 'down' ? 'text-red-600 dark:text-red-400 bg-red-500/10' : 
                    'text-muted-foreground bg-muted'
                  )}>
                    {stat.change.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : stat.change.trend === 'down' ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    <span>{stat.change.value}</span>
                  </div>
                )}
                
                {stat.highlight && (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                    Needs attention
                  </Badge>
                )}
              </div>
              
              <div className={cn(
                "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-sm shrink-0",
                "group-hover:scale-110 transition-transform duration-300",
                stat.iconBg
              )}>
                <Icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.iconColor)} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
