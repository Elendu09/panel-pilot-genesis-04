import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Users, UserPlus, UserCheck, UserX, Activity } from 'lucide-react';
import { formatDistanceToNow, subDays, isAfter } from 'date-fns';
import { useMemo } from 'react';

interface UserOrder {
  id: string;
  buyer_id?: string | null;
  status: string | null;
  created_at: string;
  price?: number;
  buyer?: { email: string; full_name: string | null } | null;
}

interface UserAnalyticsKanbanProps {
  orders: UserOrder[];
}

interface UserSegment {
  id: string;
  email: string;
  name: string | null;
  orderCount: number;
  totalSpent: number;
  lastActivity: string;
}

const COLUMNS = [
  { key: 'new', label: 'New Users', icon: UserPlus, dotColor: 'bg-emerald-500', borderColor: 'border-t-emerald-500' },
  { key: 'active', label: 'Active', icon: Activity, dotColor: 'bg-blue-500', borderColor: 'border-t-blue-500' },
  { key: 'returning', label: 'Returning', icon: UserCheck, dotColor: 'bg-violet-500', borderColor: 'border-t-violet-500' },
  { key: 'inactive', label: 'Inactive', icon: UserX, dotColor: 'bg-red-500', borderColor: 'border-t-red-500' },
];

export function UserAnalyticsKanban({ orders }: UserAnalyticsKanbanProps) {
  const segments = useMemo(() => {
    const buyerMap = new Map<string, UserSegment>();
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    orders.forEach(order => {
      if (!order.buyer_id) return;
      const existing = buyerMap.get(order.buyer_id);
      if (existing) {
        existing.orderCount++;
        existing.totalSpent += order.price || 0;
        if (new Date(order.created_at) > new Date(existing.lastActivity)) {
          existing.lastActivity = order.created_at;
        }
      } else {
        buyerMap.set(order.buyer_id, {
          id: order.buyer_id,
          email: order.buyer?.email || 'Unknown',
          name: order.buyer?.full_name || null,
          orderCount: 1,
          totalSpent: order.price || 0,
          lastActivity: order.created_at,
        });
      }
    });

    const allUsers = Array.from(buyerMap.values());

    const newUsers = allUsers.filter(u => u.orderCount === 1 && isAfter(new Date(u.lastActivity), sevenDaysAgo));
    const returning = allUsers.filter(u => u.orderCount > 1 && isAfter(new Date(u.lastActivity), thirtyDaysAgo));
    const inactive = allUsers.filter(u => !isAfter(new Date(u.lastActivity), thirtyDaysAgo));
    const activeIds = new Set([...newUsers.map(u => u.id), ...returning.map(u => u.id), ...inactive.map(u => u.id)]);
    const active = allUsers.filter(u => !activeIds.has(u.id));

    return { new: newUsers, active, returning, inactive };
  }, [orders]);

  const grouped = COLUMNS.map(col => ({
    ...col,
    users: (segments[col.key as keyof typeof segments] || []).slice(0, 5),
    count: (segments[col.key as keyof typeof segments] || []).length,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-primary" />
            User Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {grouped.map((col) => {
              const ColIcon = col.icon;
              return (
                <div key={col.key} className={`rounded-xl border border-border/50 border-t-2 ${col.borderColor} bg-muted/20 p-3`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                      <span className="text-xs font-semibold uppercase tracking-wider">{col.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5">{col.count}</Badge>
                  </div>
                  <div className="space-y-2">
                    {col.users.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No users</p>
                    ) : (
                      col.users.map((user) => (
                        <div key={user.id} className="bg-card/60 rounded-lg p-2.5 border border-border/30 hover:border-border/60 transition-colors">
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-primary">
                                {(user.name || user.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">{user.name || user.email.split('@')[0]}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-muted-foreground">{user.orderCount} orders</span>
                                <span className="text-[10px] font-medium">${user.totalSpent.toFixed(2)}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(user.lastActivity), { addSuffix: true })}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
