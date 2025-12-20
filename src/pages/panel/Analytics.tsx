import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Activity,
  Info,
  ArrowRight,
  Calendar,
  LayoutGrid,
  List,
  Table,
  Plus,
  MoreVertical,
  Clock,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

// Animated counter component
const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

// Heatmap Calendar Component
const HeatmapCalendar = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Generate random activity data
  const generateData = () => {
    const data: number[][] = [];
    for (let week = 0; week < 24; week++) {
      const weekData: number[] = [];
      for (let day = 0; day < 7; day++) {
        weekData.push(Math.floor(Math.random() * 5));
      }
      data.push(weekData);
    }
    return data;
  };
  
  const [activityData] = useState(generateData());
  
  const getColor = (level: number) => {
    const colors = [
      "bg-muted",
      "bg-primary/20",
      "bg-primary/40",
      "bg-primary/60",
      "bg-primary/80",
      "bg-primary"
    ];
    return colors[level] || colors[0];
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Order Activity</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getColor(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
            {days.map((day, i) => (
              <div key={i} className="h-3 flex items-center">{i % 2 === 0 ? day : ""}</div>
            ))}
          </div>
          {activityData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                  className={`w-3 h-3 rounded-sm ${getColor(day)} cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all`}
                  title={`${day} orders`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Kanban Column Component
const KanbanColumn = ({ 
  title, 
  count, 
  color, 
  orders 
}: { 
  title: string; 
  count: number; 
  color: string; 
  orders: any[];
}) => (
  <div className="flex-1 min-w-[280px]">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Badge variant="secondary" className="rounded-full text-xs">
          {count}
        </Badge>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
    <div className="space-y-3">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-sm text-foreground">{order.service}</p>
                  <p className="text-xs text-muted-foreground mt-1">{order.id}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Clock className="w-3 h-3" />
                <span>{order.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">{order.customer}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  ${order.amount}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

const Analytics = () => {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState("30d");
  const [orderView, setOrderView] = useState("kanban");
  
  const dateRanges = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "1y", label: "1 Year" },
  ];
  
  const monthlyData = [
    { month: "Jan", revenue: 4500, orders: 120, users: 45 },
    { month: "Feb", revenue: 5200, orders: 140, users: 52 },
    { month: "Mar", revenue: 4800, orders: 130, users: 48 },
    { month: "Apr", revenue: 6100, orders: 165, users: 63 },
    { month: "May", revenue: 7200, orders: 190, users: 71 },
    { month: "Jun", revenue: 6800, orders: 175, users: 68 },
  ];

  const serviceData = [
    { name: "Instagram Followers", value: 35, color: "hsl(var(--primary))" },
    { name: "YouTube Views", value: 25, color: "hsl(var(--info))" },
    { name: "TikTok Likes", value: 20, color: "hsl(var(--warning))" },
    { name: "Facebook Likes", value: 12, color: "hsl(var(--destructive))" },
    { name: "Twitter Followers", value: 8, color: "hsl(var(--success))" },
  ];

  const stats = [
    {
      title: "Total Revenue",
      value: 45789,
      prefix: "$",
      change: "+28%",
      changeValue: "+$8,234",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: 2847,
      change: "+23%",
      changeValue: "+532 orders",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Active Users",
      value: 1234,
      change: "+15%",
      changeValue: "+156 users",
      trend: "up",
      icon: Users,
    },
    {
      title: "Conversion Rate",
      value: 12.4,
      suffix: "%",
      change: "-2.1%",
      changeValue: "-0.3% from avg",
      trend: "down",
      icon: Activity,
    }
  ];
  
  const kanbanOrders = {
    pending: [
      { id: "#ORD-2847", service: "Instagram Followers 1K", customer: "John D.", amount: 12.99, time: "2 min ago" },
      { id: "#ORD-2846", service: "YouTube Views 5K", customer: "Sarah M.", amount: 24.99, time: "5 min ago" },
      { id: "#ORD-2845", service: "TikTok Likes 2K", customer: "Mike R.", amount: 8.99, time: "12 min ago" },
    ],
    inProgress: [
      { id: "#ORD-2844", service: "Twitter Followers 500", customer: "Emma W.", amount: 15.99, time: "1 hour ago" },
      { id: "#ORD-2843", service: "Facebook Page Likes", customer: "Chris L.", amount: 19.99, time: "2 hours ago" },
    ],
    completed: [
      { id: "#ORD-2842", service: "Instagram Followers 5K", customer: "Lisa K.", amount: 49.99, time: "3 hours ago" },
      { id: "#ORD-2841", service: "YouTube Subscribers", customer: "David P.", amount: 34.99, time: "4 hours ago" },
      { id: "#ORD-2840", service: "TikTok Views 10K", customer: "Anna S.", amount: 18.99, time: "5 hours ago" },
      { id: "#ORD-2839", service: "Instagram Likes 1K", customer: "Tom H.", amount: 6.99, time: "6 hours ago" },
    ],
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-foreground"
          >
            Hello, {firstName} 👋
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your panel today
          </p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg p-1">
          {dateRanges.map((range) => (
            <Button
              key={range.value}
              variant={dateRange === range.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setDateRange(range.value)}
              className={dateRange === range.value ? "bg-primary shadow-sm" : ""}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Efficio-style Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                    <Info className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stat.trend === "up" ? "bg-success/10" : "bg-destructive/10"
                  }`}>
                    <stat.icon className={`w-5 h-5 ${
                      stat.trend === "up" ? "text-success" : "text-destructive"
                    }`} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-4xl font-bold text-foreground tracking-tight">
                    <AnimatedCounter 
                      value={stat.value} 
                      prefix={stat.prefix || ""} 
                      suffix={stat.suffix || ""}
                    />
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        stat.trend === "up" 
                          ? "bg-success/10 text-success border-success/20" 
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{stat.changeValue}</span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="mt-4 p-0 h-auto text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Details <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Heatmap Calendar */}
      <Card className="bg-background/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-6">
          <HeatmapCalendar />
        </CardContent>
      </Card>

      {/* Orders Section with View Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent Orders</h2>
          <Tabs value={orderView} onValueChange={setOrderView}>
            <TabsList className="bg-background/60 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="kanban" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="table" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Table className="w-4 h-4 mr-2" />
                Table
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <List className="w-4 h-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <AnimatePresence mode="wait">
          {orderView === "kanban" && (
            <motion.div
              key="kanban"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-6 overflow-x-auto pb-4"
            >
              <KanbanColumn 
                title="Pending" 
                count={kanbanOrders.pending.length} 
                color="bg-warning" 
                orders={kanbanOrders.pending} 
              />
              <KanbanColumn 
                title="In Progress" 
                count={kanbanOrders.inProgress.length} 
                color="bg-info" 
                orders={kanbanOrders.inProgress} 
              />
              <KanbanColumn 
                title="Completed" 
                count={kanbanOrders.completed.length} 
                color="bg-success" 
                orders={kanbanOrders.completed} 
              />
            </motion.div>
          )}
          
          {orderView === "table" && (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order ID</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Service</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...kanbanOrders.pending, ...kanbanOrders.inProgress, ...kanbanOrders.completed].map((order, i) => (
                          <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                            <td className="p-4 text-sm font-medium">{order.id}</td>
                            <td className="p-4 text-sm">{order.service}</td>
                            <td className="p-4 text-sm text-muted-foreground">{order.customer}</td>
                            <td className="p-4 text-sm font-medium">${order.amount}</td>
                            <td className="p-4">
                              <Badge variant="secondary" className={
                                kanbanOrders.pending.includes(order) ? "bg-warning/10 text-warning" :
                                kanbanOrders.inProgress.includes(order) ? "bg-info/10 text-info" :
                                "bg-success/10 text-success"
                              }>
                                {kanbanOrders.pending.includes(order) ? "Pending" :
                                 kanbanOrders.inProgress.includes(order) ? "In Progress" : "Completed"}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{order.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {orderView === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {[...kanbanOrders.pending, ...kanbanOrders.inProgress, ...kanbanOrders.completed].map((order, i) => (
                <Card key={i} className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{order.service}</p>
                        <p className="text-sm text-muted-foreground">{order.id} • {order.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">${order.amount}</span>
                      <Badge variant="secondary" className={
                        kanbanOrders.pending.includes(order) ? "bg-warning/10 text-warning" :
                        kanbanOrders.inProgress.includes(order) ? "bg-info/10 text-info" :
                        "bg-success/10 text-success"
                      }>
                        {kanbanOrders.pending.includes(order) ? "Pending" :
                         kanbanOrders.inProgress.includes(order) ? "In Progress" : "Completed"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              Details <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Orders by Month</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              Details <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)"
                  }}
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Service Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceData.map((service, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: service.color }}
                    />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{service.value}%</div>
                    <div className="text-xs text-muted-foreground">of total orders</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
