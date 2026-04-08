import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server } from 'lucide-react';
import { motion } from 'framer-motion';

interface Provider {
  name: string;
  orders: number;
  status: 'active' | 'slow' | 'down';
}

interface TopProvidersCardProps {
  providers: Provider[];
}

const statusConfig = {
  active: { color: 'bg-emerald-500', label: 'Active', textColor: 'text-emerald-500' },
  slow: { color: 'bg-amber-500', label: 'Slow', textColor: 'text-amber-500' },
  down: { color: 'bg-red-500', label: 'Down', textColor: 'text-red-500' },
};

export function TopProvidersCard({ providers }: TopProvidersCardProps) {
  const maxOrders = Math.max(...providers.map(p => p.orders), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Server className="w-5 h-5 text-primary" />
            Top Providers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {providers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No providers connected</p>
          ) : (
            providers.slice(0, 6).map((p) => {
              const config = statusConfig[p.status];
              return (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${config.color}`} />
                      <span className="text-sm font-medium truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums text-muted-foreground">{p.orders} orders</span>
                      <Badge variant="outline" className={`text-[10px] h-5 ${config.textColor} border-current/20`}>{config.label}</Badge>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 rounded-full transition-all" style={{ width: `${(p.orders / maxOrders) * 100}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
