import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Kanban, GripVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface KanbanOrder {
  id: string;
  order_number: string;
  service_name: string | null;
  status: string | null;
  quantity: number;
  created_at: string;
  buyer_id?: string | null;
}

interface OrderPipelineKanbanProps {
  orders: KanbanOrder[];
}

const COLUMNS = [
  { key: 'pending', label: 'Pending', dotColor: 'bg-amber-500', borderColor: 'border-t-amber-500' },
  { key: 'processing', label: 'Processing', dotColor: 'bg-blue-500', borderColor: 'border-t-blue-500' },
  { key: 'completed', label: 'Completed', dotColor: 'bg-emerald-500', borderColor: 'border-t-emerald-500' },
  { key: 'cancelled', label: 'Failed', dotColor: 'bg-red-500', borderColor: 'border-t-red-500' },
];

export function OrderPipelineKanban({ orders }: OrderPipelineKanbanProps) {
  const groupedOrders = COLUMNS.map(col => ({
    ...col,
    orders: orders
      .filter(o => {
        if (col.key === 'processing') return o.status === 'processing' || o.status === 'in_progress';
        if (col.key === 'cancelled') return o.status === 'cancelled' || o.status === 'partial';
        return o.status === col.key;
      })
      .slice(0, 5),
    count: orders.filter(o => {
      if (col.key === 'processing') return o.status === 'processing' || o.status === 'in_progress';
      if (col.key === 'cancelled') return o.status === 'cancelled' || o.status === 'partial';
      return o.status === col.key;
    }).length,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Kanban className="w-5 h-5 text-primary" />
            Order Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {groupedOrders.map((col) => (
              <div key={col.key} className={`rounded-xl border border-border/50 border-t-2 ${col.borderColor} bg-muted/20 p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <span className="text-xs font-semibold uppercase tracking-wider">{col.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-5">{col.count}</Badge>
                </div>
                <div className="space-y-2">
                  {col.orders.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No orders</p>
                  ) : (
                    col.orders.map((order) => (
                      <div key={order.id} className="bg-card/60 rounded-lg p-2.5 border border-border/30 hover:border-border/60 transition-colors">
                        <div className="flex items-start gap-1.5">
                          <GripVertical className="w-3 h-3 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">{order.service_name || 'Service'}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">#{order.order_number} · {order.quantity} qty</p>
                            <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
