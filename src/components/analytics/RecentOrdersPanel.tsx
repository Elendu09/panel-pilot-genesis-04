import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface RecentOrder {
  id: string;
  order_number: string;
  service_name: string | null;
  status: string | null;
  quantity: number;
  price: number;
  created_at: string;
}

interface RecentOrdersPanelProps {
  orders: RecentOrder[];
}

const statusColor: Record<string, string> = {
  completed: 'bg-emerald-500',
  processing: 'bg-blue-500 animate-pulse',
  pending: 'bg-amber-500',
  cancelled: 'bg-red-500',
  partial: 'bg-orange-500',
  in_progress: 'bg-blue-500 animate-pulse',
};

export function RecentOrdersPanel({ orders }: RecentOrdersPanelProps) {
  const recent = orders.slice(0, 8);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Recent Orders
            </CardTitle>
            <a href="/panel/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto space-y-1">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            recent.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor[order.status || 'pending'] || 'bg-muted'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{order.service_name || 'Unknown Service'}</p>
                    <p className="text-xs text-muted-foreground">#{order.order_number} · {order.quantity} qty · {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums flex-shrink-0 ml-2">${order.price.toFixed(2)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
