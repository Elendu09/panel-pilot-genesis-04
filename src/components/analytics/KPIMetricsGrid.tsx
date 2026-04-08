import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, DollarSign, Percent, Clock, Server, Headphones, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KPIMetricsGridProps {
  avgOrderValue: number;
  profitMargin: number;
  refundRate: number;
  avgDeliveryTime: string;
  apiUptime: number;
  supportTickets: number;
}

export function KPIMetricsGrid({ avgOrderValue, profitMargin, refundRate, avgDeliveryTime, apiUptime, supportTickets }: KPIMetricsGridProps) {
  const metrics = [
    { label: 'Avg Order Value', value: `$${avgOrderValue.toFixed(2)}`, icon: DollarSign, color: 'text-blue-500', trend: 'up' as const },
    { label: 'Profit Margin', value: `${profitMargin.toFixed(1)}%`, icon: Percent, color: 'text-emerald-500', trend: profitMargin > 15 ? 'up' as const : 'down' as const },
    { label: 'Refund Rate', value: `${refundRate.toFixed(1)}%`, icon: RotateCcw, color: 'text-amber-500', trend: refundRate < 5 ? 'up' as const : 'down' as const },
    { label: 'Avg Delivery', value: avgDeliveryTime, icon: Clock, color: 'text-purple-500', trend: 'neutral' as const },
    { label: 'API Uptime', value: `${apiUptime.toFixed(1)}%`, icon: Server, color: 'text-emerald-500', trend: apiUptime > 99 ? 'up' as const : 'down' as const },
    { label: 'Support Tickets', value: supportTickets.toString(), icon: Headphones, color: 'text-orange-500', trend: 'neutral' as const },
  ];

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Icon className={cn('w-4 h-4', m.color)} />
                  <TrendIcon trend={m.trend} />
                </div>
                <p className="text-2xl font-bold tabular-nums">{m.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
