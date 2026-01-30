import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Info, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RetentionDataPoint {
  month: string;
  rate: number;
}

interface RetentionCardProps {
  currentRate: number;
  data: RetentionDataPoint[];
}

export function RetentionCard({ currentRate, data }: RetentionCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-xl border-border/50 hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/10">
            <Users className="w-4 h-4 text-pink-500" />
          </div>
          <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-1.5">
            Retention
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help hover:text-muted-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">Percentage of customers who made repeat orders within the selected period.</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{currentRate.toFixed(0)}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[100px] md:h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(330, 80%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(330, 80%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retention']}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="hsl(330, 80%, 60%)"
                strokeWidth={2}
                fill="url(#retentionGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
