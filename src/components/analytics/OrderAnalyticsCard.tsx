import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OrderAnalyticsCardProps {
  orderTrends: { date: string; orders: number; revenue: number }[];
  ordersByStatus: { completed: number; processing: number; pending: number; cancelled: number };
}

const STATUS_COLORS = [
  'hsl(142, 76%, 36%)',  // completed - green
  'hsl(217, 91%, 60%)',  // processing - blue
  'hsl(38, 92%, 50%)',   // pending - amber
  'hsl(0, 84%, 60%)',    // cancelled - red
];

const FILTERS = ['All', 'Completed', 'Processing', 'Pending', 'Cancelled'] as const;

export function OrderAnalyticsCard({ orderTrends, ordersByStatus }: OrderAnalyticsCardProps) {
  const [filter, setFilter] = useState<typeof FILTERS[number]>('All');

  const pieData = useMemo(() => [
    { name: 'Completed', value: ordersByStatus.completed },
    { name: 'Processing', value: ordersByStatus.processing },
    { name: 'Pending', value: ordersByStatus.pending },
    { name: 'Cancelled', value: ordersByStatus.cancelled },
  ].filter(d => d.value > 0), [ordersByStatus]);

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="lg:col-span-3"
    >
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              Order Analytics
            </CardTitle>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
              {FILTERS.map(f => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'ghost'}
                  size="sm"
                  className={cn('h-7 text-xs px-3', filter === f && 'bg-primary shadow-sm')}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Area Chart - 3/5 */}
            <div className="lg:col-span-3">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={orderTrends}>
                  <defs>
                    <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" fill="url(#orderGrad)" strokeWidth={2} name="Orders" />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(142, 76%, 36%)" fill="url(#revenueGrad)" strokeWidth={2} name="Revenue ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart - 2/5 */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[['Completed','Processing','Pending','Cancelled'].indexOf(pieData[i]?.name) % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[['Completed','Processing','Pending','Cancelled'].indexOf(d.name)] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-semibold tabular-nums">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
