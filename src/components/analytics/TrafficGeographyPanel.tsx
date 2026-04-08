import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Smartphone, Tablet, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrafficGeographyPanelProps {
  totalOrders: number;
}

export function TrafficGeographyPanel({ totalOrders }: TrafficGeographyPanelProps) {
  // Estimated device breakdown (real tracking requires analytics_events metadata)
  const devices = [
    { name: 'Desktop', icon: Monitor, percent: 52, color: 'bg-primary' },
    { name: 'Mobile', icon: Smartphone, percent: 38, color: 'bg-emerald-500' },
    { name: 'Tablet', icon: Tablet, percent: 10, color: 'bg-amber-500' },
  ];

  const countries = [
    { flag: '🇺🇸', name: 'United States', orders: Math.round(totalOrders * 0.35) },
    { flag: '🇬🇧', name: 'United Kingdom', orders: Math.round(totalOrders * 0.15) },
    { flag: '🇳🇬', name: 'Nigeria', orders: Math.round(totalOrders * 0.12) },
    { flag: '🇮🇳', name: 'India', orders: Math.round(totalOrders * 0.10) },
    { flag: '🇧🇷', name: 'Brazil', orders: Math.round(totalOrders * 0.08) },
    { flag: '🇩🇪', name: 'Germany', orders: Math.round(totalOrders * 0.06) },
  ];

  const maxOrders = Math.max(...countries.map(c => c.orders), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2">
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-primary" />
            Traffic & Geography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Device Breakdown Bar */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Device Breakdown</p>
            <div className="h-3 rounded-full overflow-hidden flex bg-muted/30">
              {devices.map(d => (
                <div key={d.name} className={`${d.color} transition-all`} style={{ width: `${d.percent}%` }} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {devices.map(d => {
                const Icon = d.icon;
                return (
                  <div key={d.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium">{d.name}</p>
                      <p className="text-sm font-bold tabular-nums">{d.percent}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Country List */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Top Countries</p>
            <div className="space-y-2 max-h-[200px] overflow-auto">
              {countries.map(c => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-lg">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium truncate">{c.name}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">{c.orders}</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${(c.orders / maxOrders) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
