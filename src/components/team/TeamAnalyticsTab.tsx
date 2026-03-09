import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Loader2, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeamData } from '@/hooks/useTeamData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TeamAnalyticsTab() {
  const { callTeamApi, loading } = useTeamData();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const fetchAnalytics = useCallback(async () => {
    const res = await callTeamApi('get-analytics', { days: 30 });
    if (res) {
      setAnalytics(res.data || []);
      setSummary(res.summary || null);
    }
  }, [callTeamApi]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: 'Total Revenue', value: `$${Number(summary?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Total Orders', value: summary?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-500' },
    { label: 'Customers', value: summary?.totalCustomers || 0, icon: Users, color: 'text-purple-500' },
    { label: 'Active Services', value: summary?.activeServices || 0, icon: Package, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Revenue & Orders (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No analytics data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="total_revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Revenue" />
                <Area type="monotone" dataKey="total_orders" stroke="hsl(var(--chart-2, 210 80% 60%))" fill="hsl(var(--chart-2, 210 80% 60%) / 0.2)" name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
