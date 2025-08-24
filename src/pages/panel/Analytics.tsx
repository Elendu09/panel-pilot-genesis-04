import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Cell
} from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Activity } from "lucide-react";

const Analytics = () => {
  const monthlyData = [
    { month: "Jan", revenue: 4500, orders: 120, users: 45 },
    { month: "Feb", revenue: 5200, orders: 140, users: 52 },
    { month: "Mar", revenue: 4800, orders: 130, users: 48 },
    { month: "Apr", revenue: 6100, orders: 165, users: 63 },
    { month: "May", revenue: 7200, orders: 190, users: 71 },
    { month: "Jun", revenue: 6800, orders: 175, users: 68 },
  ];

  const serviceData = [
    { name: "Instagram Followers", value: 35, color: "#8B5CF6" },
    { name: "YouTube Views", value: 25, color: "#06B6D4" },
    { name: "TikTok Likes", value: 20, color: "#F59E0B" },
    { name: "Facebook Likes", value: 12, color: "#EF4444" },
    { name: "Twitter Followers", value: 8, color: "#10B981" },
  ];

  const stats = [
    {
      title: "Total Revenue",
      value: "$45,789",
      change: "+28%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      title: "Total Orders",
      value: "2,847",
      change: "+23%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-500"
    },
    {
      title: "Active Users",
      value: "1,234",
      change: "+15%",
      trend: "up",
      icon: Users,
      color: "text-purple-500"
    },
    {
      title: "Conversion Rate",
      value: "12.4%",
      change: "-2.1%",
      trend: "down",
      icon: Activity,
      color: "text-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your panel's performance and growth</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-card border-border shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.trend === "up" ? "text-green-500" : "text-red-500"
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Orders by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
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
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Top Performing Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceData.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: service.color }}
                    />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{service.value}%</div>
                    <div className="text-sm text-muted-foreground">of total orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;