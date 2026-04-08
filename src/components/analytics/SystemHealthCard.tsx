import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Server, Zap, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface SystemHealthCardProps {
  serverLoad: number;
  apiQuota: number;
  balance: number;
  avgResponseTime: number;
  errorRate: number;
}

function RadialGauge({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const percent = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <circle
          cx="40" cy="40" r="36" fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <p className="text-lg font-bold tabular-nums mt-1">{percent.toFixed(0)}%</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

export function SystemHealthCard({ serverLoad, apiQuota, balance, avgResponseTime, errorRate }: SystemHealthCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-primary" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Radial Gauges */}
          <div className="grid grid-cols-3 gap-2">
            <RadialGauge value={100 - serverLoad} max={100} label="Server" color="hsl(142, 76%, 36%)" />
            <RadialGauge value={apiQuota} max={100} label="API Quota" color="hsl(217, 91%, 60%)" />
            <RadialGauge value={balance > 0 ? Math.min(balance, 100) : 0} max={100} label="Balance" color="hsl(38, 92%, 50%)" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
            <div className="text-center p-2 rounded-lg bg-muted/20">
              <p className="text-lg font-bold tabular-nums">{avgResponseTime}ms</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/20">
              <p className="text-lg font-bold tabular-nums">{errorRate.toFixed(1)}%</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Error Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
