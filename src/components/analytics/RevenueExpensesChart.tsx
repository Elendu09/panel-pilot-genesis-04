import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface RevenueExpensesChartProps {
  revenueData: { month: string; revenue: number }[];
  providerCosts: number;
}

export function RevenueExpensesChart({ revenueData, providerCosts }: RevenueExpensesChartProps) {
  const chartData = revenueData.map(d => ({
    month: d.month,
    revenue: d.revenue,
    expenses: d.revenue > 0 ? Math.round(d.revenue * (providerCosts > 0 ? providerCosts / Math.max(revenueData.reduce((s, r) => s + r.revenue, 0), 1) : 0.6) * 100) / 100 : 0,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-primary" />
            Revenue vs Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => [`$${v.toFixed(2)}`]} />
              <Bar dataKey="revenue" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="expenses" fill="hsl(270, 50%, 60%)" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
