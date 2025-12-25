import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { TrendingUp, DollarSign, CreditCard, Globe, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock analytics data
const revenueByGateway = [
  { name: "Stripe", revenue: 24500, transactions: 450, successRate: 98.5, color: "#635BFF" },
  { name: "PayPal", revenue: 18200, transactions: 320, successRate: 97.2, color: "#003087" },
  { name: "Coinbase", revenue: 8500, transactions: 85, successRate: 99.1, color: "#0052FF" },
  { name: "Razorpay", revenue: 5200, transactions: 120, successRate: 96.8, color: "#072654" },
  { name: "Paystack", revenue: 3100, transactions: 78, successRate: 97.5, color: "#00C3F7" },
];

const dailyTrends = [
  { date: "Mon", stripe: 3200, paypal: 2400, crypto: 1200 },
  { date: "Tue", stripe: 2800, paypal: 2100, crypto: 1400 },
  { date: "Wed", stripe: 3500, paypal: 2800, crypto: 1100 },
  { date: "Thu", stripe: 4200, paypal: 3100, crypto: 1600 },
  { date: "Fri", stripe: 3800, paypal: 2600, crypto: 1800 },
  { date: "Sat", stripe: 4500, paypal: 3400, crypto: 2100 },
  { date: "Sun", stripe: 3900, paypal: 2900, crypto: 1500 },
];

const topCountries = [
  { country: "United States", amount: 18500, transactions: 342, flag: "🇺🇸" },
  { country: "United Kingdom", amount: 12400, transactions: 215, flag: "🇬🇧" },
  { country: "Germany", amount: 8200, transactions: 156, flag: "🇩🇪" },
  { country: "France", amount: 6100, transactions: 118, flag: "🇫🇷" },
  { country: "India", amount: 5800, transactions: 189, flag: "🇮🇳" },
];

const transactionsByHour = [
  { hour: "00:00", count: 12 },
  { hour: "04:00", count: 8 },
  { hour: "08:00", count: 45 },
  { hour: "12:00", count: 78 },
  { hour: "16:00", count: 92 },
  { hour: "20:00", count: 65 },
  { hour: "23:00", count: 34 },
];

const PaymentAnalyticsChart = () => {
  const totalRevenue = revenueByGateway.reduce((sum, g) => sum + g.revenue, 0);
  const totalTransactions = revenueByGateway.reduce((sum, g) => sum + g.transactions, 0);
  const avgSuccessRate = revenueByGateway.reduce((sum, g) => sum + g.successRate, 0) / revenueByGateway.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: "Total Revenue", 
            value: `$${(totalRevenue / 1000).toFixed(1)}K`, 
            change: "+12.5%", 
            trend: "up",
            icon: DollarSign,
            color: "text-green-500"
          },
          { 
            label: "Transactions", 
            value: totalTransactions.toLocaleString(), 
            change: "+8.2%", 
            trend: "up",
            icon: CreditCard,
            color: "text-blue-500"
          },
          { 
            label: "Success Rate", 
            value: `${avgSuccessRate.toFixed(1)}%`, 
            change: "+0.3%", 
            trend: "up",
            icon: TrendingUp,
            color: "text-emerald-500"
          },
          { 
            label: "Countries", 
            value: topCountries.length.toString(), 
            change: "+2", 
            trend: "up",
            icon: Globe,
            color: "text-purple-500"
          },
        ].map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-stat-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("p-2 rounded-lg bg-opacity-20", 
                    stat.color === "text-green-500" && "bg-green-500/20",
                    stat.color === "text-blue-500" && "bg-blue-500/20",
                    stat.color === "text-emerald-500" && "bg-emerald-500/20",
                    stat.color === "text-purple-500" && "bg-purple-500/20"
                  )}>
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  <Badge variant="secondary" className={cn(
                    "text-xs",
                    stat.trend === "up" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="glass-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Revenue by Gateway (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyTrends}>
                <defs>
                  <linearGradient id="stripeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#635BFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#635BFF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="paypalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003087" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#003087" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="cryptoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F7931A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F7931A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Area type="monotone" dataKey="stripe" stroke="#635BFF" fill="url(#stripeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="paypal" stroke="#003087" fill="url(#paypalGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="crypto" stroke="#F7931A" fill="url(#cryptoGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gateway Distribution */}
        <Card className="glass-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={revenueByGateway}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="revenue"
                  >
                    {revenueByGateway.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {revenueByGateway.map((gateway) => (
                  <div key={gateway.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: gateway.color }} 
                    />
                    <span className="text-sm flex-1">{gateway.name}</span>
                    <span className="text-sm font-medium">
                      {((gateway.revenue / totalRevenue) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions by Hour */}
        <Card className="glass-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Transaction Volume by Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={transactionsByHour}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="hour" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card className="glass-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center gap-3">
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{country.country}</span>
                      <span className="text-sm font-bold">${country.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(country.amount / topCountries[0].amount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gateway Performance Table */}
      <Card className="glass-chart">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Gateway Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Gateway</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Transactions</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Avg. Value</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {revenueByGateway.map((gateway) => (
                  <tr key={gateway.name} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: gateway.color }}
                        />
                        <span className="font-medium">{gateway.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-medium">${gateway.revenue.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{gateway.transactions}</td>
                    <td className="text-right py-3 px-4">${(gateway.revenue / gateway.transactions).toFixed(2)}</td>
                    <td className="text-right py-3 px-4">
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                        {gateway.successRate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentAnalyticsChart;
