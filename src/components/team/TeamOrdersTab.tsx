import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTeamData } from '@/hooks/useTeamData';
import { format } from 'date-fns';

interface Props {
  canEdit: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  in_progress: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-destructive/10 text-destructive',
  partial: 'bg-orange-500/10 text-orange-500',
  refunded: 'bg-purple-500/10 text-purple-500',
};

export default function TeamOrdersTab({ canEdit }: Props) {
  const { callTeamApi, loading } = useTeamData();
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = useCallback(async () => {
    const res = await callTeamApi('list-orders', { search, status: statusFilter, page, limit: 30 });
    if (res) {
      setOrders(res.data || []);
      setTotal(res.total || 0);
    }
  }, [callTeamApi, search, statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const res = await callTeamApi('update-order-status', { orderId, newStatus });
    if (res?.success) fetchOrders();
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Orders ({total})
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                className="pl-9 w-48"
              />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    {canEdit && <TableHead>Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-sm">{order.service_name}</TableCell>
                      <TableCell className="text-sm">{order.buyer_name}</TableCell>
                      <TableCell className="text-right">{order.quantity}</TableCell>
                      <TableCell className="text-right">${Number(order.price).toFixed(2)}</TableCell>
                      <TableCell>
                      <Badge className={statusColors[order.status] || 'bg-muted text-muted-foreground'}>
                          {(order.status || '').replace('_', ' ')}
                        </Badge>
                        {order.drip_feed_runs && order.drip_feed_runs >= 2 && (
                          <Badge variant="outline" className="ml-1 text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">
                            Drip: {order.drip_feed_runs}×{order.drip_feed_interval || 60}min
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={v => handleStatusChange(order.id, v)}
                          >
                            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {page + 1} of {Math.max(1, Math.ceil(total / 30))}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={(page + 1) * 30 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
