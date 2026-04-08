import { Card, CardContent } from '@/components/ui/card';
import { Instagram, Youtube, Twitter, Facebook, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlatformData {
  name: string;
  orders: number;
  revenue: number;
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
}

interface PlatformServiceCardsProps {
  orders: { service_name: string | null; price: number; services?: { category?: string } | null }[];
}

function detectPlatform(name: string): string {
  const lower = (name || '').toLowerCase();
  if (lower.includes('instagram') || lower.includes('ig ')) return 'Instagram';
  if (lower.includes('youtube') || lower.includes('yt ')) return 'YouTube';
  if (lower.includes('twitter') || lower.includes('x ') || lower.includes('tweet')) return 'Twitter/X';
  if (lower.includes('facebook') || lower.includes('fb ')) return 'Facebook';
  return 'Other';
}

const PLATFORM_CONFIG: Record<string, { icon: React.ReactNode; gradient: string; textColor: string }> = {
  Instagram: { icon: <Instagram className="w-6 h-6" />, gradient: 'from-pink-500/20 to-purple-500/20', textColor: 'text-pink-500' },
  YouTube: { icon: <Youtube className="w-6 h-6" />, gradient: 'from-red-500/20 to-red-600/20', textColor: 'text-red-500' },
  'Twitter/X': { icon: <Twitter className="w-6 h-6" />, gradient: 'from-blue-400/20 to-blue-500/20', textColor: 'text-blue-400' },
  Facebook: { icon: <Facebook className="w-6 h-6" />, gradient: 'from-blue-600/20 to-blue-700/20', textColor: 'text-blue-600' },
};

export function PlatformServiceCards({ orders }: PlatformServiceCardsProps) {
  const platformMap = new Map<string, { orders: number; revenue: number }>();

  orders.forEach(o => {
    const platform = detectPlatform(o.service_name || (o.services as any)?.category || '');
    if (platform === 'Other') return;
    const existing = platformMap.get(platform) || { orders: 0, revenue: 0 };
    existing.orders += 1;
    existing.revenue += o.price || 0;
    platformMap.set(platform, existing);
  });

  const platforms: PlatformData[] = ['Instagram', 'YouTube', 'Twitter/X', 'Facebook'].map(name => {
    const data = platformMap.get(name) || { orders: 0, revenue: 0 };
    const config = PLATFORM_CONFIG[name];
    return { name, orders: data.orders, revenue: data.revenue, ...config };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {platforms.map((p, i) => (
        <motion.div key={p.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}>
          <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 group cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${p.gradient} ${p.textColor}`}>
                  {p.icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-semibold text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-1 tabular-nums">{p.orders} orders</p>
              <p className="text-lg font-bold mt-1 tabular-nums">${p.revenue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
