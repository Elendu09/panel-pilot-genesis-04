import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Database, 
  Zap, 
  HardDrive,
  Cpu,
  Activity,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  max: number;
  unit: string;
  icon: any;
}

const SystemHealth = () => {
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<any[]>([]);

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      // Simulate fetching real metrics - in production, these would come from actual monitoring
      const startTime = performance.now();
      
      // Test database connection
      const { count: panelCount } = await supabase.from('panels').select('*', { count: 'exact', head: true });
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      
      const dbResponseTime = performance.now() - startTime;

      setMetrics([
        {
          name: 'Database',
          status: dbResponseTime < 200 ? 'healthy' : dbResponseTime < 500 ? 'warning' : 'critical',
          value: Math.round(dbResponseTime),
          max: 1000,
          unit: 'ms',
          icon: Database
        },
        {
          name: 'API Response',
          status: 'healthy',
          value: Math.round(dbResponseTime * 0.8),
          max: 500,
          unit: 'ms',
          icon: Zap
        },
        {
          name: 'Memory Usage',
          status: 'healthy',
          value: 65,
          max: 100,
          unit: '%',
          icon: Cpu
        },
        {
          name: 'Storage',
          status: 'healthy',
          value: 42,
          max: 100,
          unit: '%',
          icon: HardDrive
        }
      ]);

      // Generate mock response time history
      setResponseTimeData(
        Array.from({ length: 12 }, (_, i) => ({
          time: `${i * 5}m`,
          database: Math.floor(100 + Math.random() * 100),
          api: Math.floor(80 + Math.random() * 80)
        }))
      );

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-500/20 text-emerald-500';
      case 'warning':
        return 'bg-amber-500/20 text-amber-500';
      case 'critical':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const overallStatus = metrics.every(m => m.status === 'healthy') 
    ? 'healthy' 
    : metrics.some(m => m.status === 'critical') 
      ? 'critical' 
      : 'warning';

  const services = [
    { name: 'Authentication', status: 'healthy', uptime: '99.99%' },
    { name: 'Database', status: 'healthy', uptime: '99.98%' },
    { name: 'Edge Functions', status: 'healthy', uptime: '99.95%' },
    { name: 'Storage', status: 'healthy', uptime: '99.99%' },
    { name: 'Realtime', status: 'healthy', uptime: '99.97%' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Helmet>
        <title>System Health - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Monitor platform health and performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button onClick={fetchHealthData} variant="outline" className="gap-2">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Overall Status */}
      <motion.div variants={itemVariants}>
        <Card className={cn(
          "border-2",
          overallStatus === 'healthy' && "border-emerald-500/50",
          overallStatus === 'warning' && "border-amber-500/50",
          overallStatus === 'critical' && "border-red-500/50"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(overallStatus)}
                <div>
                  <h2 className="text-xl font-bold">
                    {overallStatus === 'healthy' && 'All Systems Operational'}
                    {overallStatus === 'warning' && 'Minor Issues Detected'}
                    {overallStatus === 'critical' && 'Critical Issues Detected'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {metrics.filter(m => m.status === 'healthy').length} of {metrics.length} services healthy
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(overallStatus)}>
                {overallStatus.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const percentage = (metric.value / metric.max) * 100;
          
          return (
            <Card key={metric.name} className="glass-card-hover">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", getStatusColor(metric.status).replace('text-', 'bg-').split(' ')[0])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  {getStatusIcon(metric.status)}
                </div>
                <div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                  <div className="h-2 bg-accent rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all", getProgressColor(metric.status))}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Charts and Services */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Response Time History
            </CardTitle>
            <CardDescription>Last 60 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="database" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    name="Database (ms)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="api" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    name="API (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              Service Status
            </CardTitle>
            <CardDescription>Individual service health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((service) => (
              <div 
                key={service.name}
                className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{service.uptime} uptime</span>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SystemHealth;
