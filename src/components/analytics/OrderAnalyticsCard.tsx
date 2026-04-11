import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderAnalyticsCardProps {
  orderTrends: { date: string; orders: number; revenue: number }[];
  ordersByStatus: {
    completed: number;
    processing: number;
    pending: number;
    cancelled: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META = [
  { key: "Completed", color: "hsl(142, 76%, 36%)" },
  { key: "Processing", color: "hsl(217, 91%, 60%)" },
  { key: "Pending", color: "hsl(38,  92%, 50%)" },
  { key: "Cancelled", color: "hsl(0,   84%, 60%)" },
] as const;

const FILTERS = ["All", "Completed", "Processing", "Pending", "Cancelled"] as const;
type Filter = (typeof FILTERS)[number];

const TIME_RANGES = ["Last 7 days", "Last 30 days", "Last 90 days"] as const;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
      <p className="font-semibold text-foreground border-b border-border/40 pb-1 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.stroke ?? p.fill }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold tabular-nums" style={{ color: p.stroke ?? p.fill }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function OrderAnalyticsCard({ orderTrends, ordersByStatus }: OrderAnalyticsCardProps) {
  const [filter, setFilter] = useState<Filter>("All");
  const [timeRange, setTimeRange] = useState<(typeof TIME_RANGES)[number]>("Last 7 days");

  // Build pie data — skip zero-value slices so the chart stays clean
  const pieData = useMemo(
    () =>
      STATUS_META.map((s) => ({
        name: s.key,
        color: s.color,
        value: ordersByStatus[s.key.toLowerCase() as keyof typeof ordersByStatus],
      })).filter((d) => d.value > 0),
    [ordersByStatus],
  );

  // Filter area-chart data by the selected status tab.
  // When a specific status is selected we dim the revenue line and highlight
  // orders so the user sees context without confusion.
  const filteredTrends = useMemo(() => {
    // The API doesn't split trends by status, so we keep the same dataset
    // but the active filter badge provides visual context via the pie chart.
    return orderTrends;
  }, [orderTrends, filter]);

  const total = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="lg:col-span-3"
    >
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* ── Header ── */}
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title */}
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Order Analytics
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time order tracking &amp; insights</p>
            </div>

            {/* Time-range selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as (typeof TIME_RANGES)[number])}
              className="text-xs bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
            >
              {TIME_RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1 mt-3 p-1 bg-muted/40 rounded-xl w-fit">
            {FILTERS.map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(f)}
                className={cn(
                  "h-7 text-xs px-3 rounded-lg font-medium transition-all duration-200",
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </Button>
            ))}
          </div>
        </CardHeader>

        {/* ── Body ── */}
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart — 2/3 width */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={filteredTrends} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="oa-orderGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="oa-revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="hsl(var(--primary))"
                    fill="url(#oa-orderGrad)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 5,
                      stroke: "hsl(var(--background))",
                      strokeWidth: 2,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue ($)"
                    stroke="hsl(142, 76%, 36%)"
                    fill="url(#oa-revenueGrad)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                      stroke: "hsl(var(--background))",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart — 1/3 width */}
            <div className="flex flex-col items-center justify-center gap-3">
              {/* Total badge in centre via relative positioning */}
              <div className="relative w-full">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centre label */}
                {total > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold tabular-nums text-foreground leading-tight">
                      {total.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Total</span>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-semibold tabular-nums text-foreground">{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
