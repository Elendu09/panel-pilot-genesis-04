import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RetentionDataPoint {
  month: string;
  rate: number;
}

interface RetentionCardProps {
  currentRate: number;
  data: RetentionDataPoint[];
}

export function RetentionCard({ currentRate, data }: RetentionCardProps) {
  const [halfYear, setHalfYear] = useState<'H1' | 'H2'>('H1');
  
  // Split data into two halves (Jan-Jun and Jul-Dec)
  const h1Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const h2Months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const displayData = data.filter(d => 
    halfYear === 'H1' 
      ? h1Months.includes(d.month)
      : h2Months.includes(d.month)
  );
  
  // If no data for current half, show empty state
  const hasData = displayData.length > 0 && displayData.some(d => d.rate > 0);

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
            <TooltipProvider delayDuration={0}>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>
                  <p className="text-xs max-w-[220px]">Percentage of customers who made repeat orders within the selected period.</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </CardTitle>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Half-Year Navigation */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-6 w-6 rounded-md transition-colors",
                halfYear === 'H1' ? "bg-primary/20 text-primary" : "hover:bg-muted"
              )}
              onClick={() => setHalfYear('H1')}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] md:text-xs font-medium w-14 text-center text-muted-foreground">
              {halfYear === 'H1' ? 'Jan-Jun' : 'Jul-Dec'}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-6 w-6 rounded-md transition-colors",
                halfYear === 'H2' ? "bg-primary/20 text-primary" : "hover:bg-muted"
              )}
              onClick={() => setHalfYear('H2')}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <span className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{currentRate.toFixed(0)}%</span>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[100px] md:h-[120px] w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
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
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <p>No retention data for {halfYear === 'H1' ? 'Jan-Jun' : 'Jul-Dec'}</p>
                <p className="text-xs mt-1">Retention is calculated from repeat orders</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
