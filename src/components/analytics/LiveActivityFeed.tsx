import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'completed' | 'processing' | 'cancelled' | 'pending';
  service: string;
  user: string;
  amount: number;
  timestamp: Date;
}

interface LiveActivityFeedProps {
  orders: { id: string; status: string | null; service_name: string | null; buyer_id: string | null; price: number; created_at: string }[];
}

const typeConfig = {
  completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  processing: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  pending: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
};

export function LiveActivityFeed({ orders }: LiveActivityFeedProps) {
  const [visibleItems, setVisibleItems] = useState<ActivityItem[]>([]);
  const indexRef = useRef(0);

  const allItems: ActivityItem[] = orders.slice(0, 50).map(o => ({
    id: o.id,
    type: (o.status === 'completed' ? 'completed' : o.status === 'processing' || o.status === 'in_progress' ? 'processing' : o.status === 'cancelled' ? 'cancelled' : 'pending') as ActivityItem['type'],
    service: o.service_name || 'Service',
    user: o.buyer_id ? `User ${o.buyer_id.slice(0, 6)}` : 'Guest',
    amount: o.price,
    timestamp: new Date(o.created_at),
  }));

  useEffect(() => {
    setVisibleItems(allItems.slice(0, 6));
    indexRef.current = 6;
  }, [orders.length]);

  useEffect(() => {
    if (allItems.length <= 6) return;
    const interval = setInterval(() => {
      const nextIdx = indexRef.current % allItems.length;
      setVisibleItems(prev => {
        const next = [allItems[nextIdx], ...prev.slice(0, 5)];
        return next;
      });
      indexRef.current += 1;
    }, 4000);
    return () => clearInterval(interval);
  }, [allItems.length]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-3">
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Live Activity
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">LIVE</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item) => {
              const config = typeConfig[item.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={item.id + '-' + indexRef.current}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className={`p-1.5 rounded-lg ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.service}</p>
                    <p className="text-xs text-muted-foreground">{item.user}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold tabular-nums">${item.amount.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(item.timestamp, { addSuffix: true })}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {visibleItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
