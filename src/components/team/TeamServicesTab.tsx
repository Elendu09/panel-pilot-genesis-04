import { useState, useEffect, useCallback } from 'react';
import { Package, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTeamData } from '@/hooks/useTeamData';

interface Props {
  canEdit: boolean;
}

export default function TeamServicesTab({ canEdit }: Props) {
  const { callTeamApi, loading } = useTeamData();
  const [services, setServices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const fetchServices = useCallback(async () => {
    const res = await callTeamApi('list-services', { search, page, limit: 50 });
    if (res) {
      setServices(res.data || []);
      setTotal(res.total || 0);
    }
  }, [callTeamApi, search, page]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const toggleActive = async (serviceId: string, current: boolean) => {
    const res = await callTeamApi('update-service', { serviceId, updates: { is_active: !current } });
    if (res?.success) fetchServices();
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" /> Services ({total})
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 w-56"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No services found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Price/1K</TableHead>
                    <TableHead className="text-right">Min</TableHead>
                    <TableHead className="text-right">Max</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map(svc => (
                    <TableRow key={svc.id}>
                      <TableCell className="max-w-[220px] truncate text-sm font-medium">{svc.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{svc.category || '—'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm capitalize">{svc.platform || '—'}</TableCell>
                      <TableCell className="text-right font-mono">${Number(svc.price_per_1000).toFixed(2)}</TableCell>
                      <TableCell className="text-right">{svc.min_quantity}</TableCell>
                      <TableCell className="text-right">{svc.max_quantity}</TableCell>
                      <TableCell>
                        {canEdit ? (
                          <Switch checked={svc.is_active} onCheckedChange={() => toggleActive(svc.id, svc.is_active)} />
                        ) : (
                          <Badge variant={svc.is_active ? 'default' : 'secondary'}>
                            {svc.is_active ? 'Yes' : 'No'}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {page + 1} of {Math.max(1, Math.ceil(total / 50))}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={(page + 1) * 50 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
