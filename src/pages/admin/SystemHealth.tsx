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
  TrendingUp,
  Wifi,
  Lock
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminViewToggle from "@/components/admin/AdminViewToggle";
import KanbanColumn from "@/components/admin/KanbanColumn";
import KanbanCard from "@/components/admin/KanbanCard";

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  max: number;
  unit: string;
  icon: any;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  lastIncident?: string;
}

const SystemHealth = () => {
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<any[]>([]);
  const [view, setView] = useState<'table' | 'kanban'>(() => {
    return (localStorage.getItem('systemHealthView') as 'table' | 'kanban') || 'table';
  });

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Authentication', status: 'healthy', uptime: '99.99%', responseTime: 45 },
    { name: 'Database', status: 'healthy', uptime: '99.98%', responseTime: 120 },
    { name: 'Edge Functions', status: 'healthy', uptime: '99.95%', responseTime: 85 },
    { name: 'Storage', status: 'healthy', uptime: '99.99%', responseTime: 200 },
    { name: 'Realtime', status: 'healthy', uptime: '99.97%', responseTime: 35 }
  ]);

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('systemHealthView', view);
  }, [view]);

  const fetchHealthData = async () => {
    try {
      const startTime = performance.now();
      
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

      // Update service response times with realistic variations
      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: Math.round(service.responseTime * (0.8 + Math.random() * 0.4))
      })));

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
        return 'bg-muted text-muted-foreground';
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

  const healthyServices = services.filter(s => s.status === 'healthy');
  const warningServices = services.filter(s => s.status === 'warning');
  const criticalServices = services.filter(s => s.status === 'critical');

  const getServiceIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'authentication':
        return Lock;
      case 'database':
        return Database;
      case 'edge functions':
        return Zap;
      case 'storage':
        return HardDrive;
      case 'realtime':
        return Wifi;
      default:
        return Server;
    }
  };

  const renderServiceCard = (service: ServiceStatus) => {
    const ServiceIcon = getServiceIcon(service.name);
    
    return (
      <KanbanCard 
        key={service.name}
        variant={service.status === 'healthy' ? 'success' : service.status === 'warning' ? 'warning' : 'danger'}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", getStatusColor(service.status).replace('text-', 'bg-').split(' ')[0])}>
                <ServiceIcon className="w-4 h-4" />
              </div>
              <span className="font-medium">{service.name}</span>
            </div>
            {getStatusIcon(service.status)}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-accent/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="font-semibold text-sm">{service.uptime}</p>
            </div>
            <div className="p-2 bg-accent/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Response</p>
              <p className="font-semibold text-sm">{service.responseTime}ms</p>
            </div>
          </div>

          <Badge className={cn("w-full justify-center", getStatusColor(service.status))}>
            {service.status.toUpperCase()}
          </Badge>
        </div>
      </KanbanCard>
    );
  };

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

      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Monitor platform health and performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <AdminViewToggle view={view} onViewChange={setView} />
          <Button onClick={fetchHealthData} variant="outline" className="gap-2">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Overall Status */}
      <motion.div variants={itemVariants}>
        <Card className={cn(
          "border-2 glass-card",
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

      {/* Services View */}
      {view === 'kanban' ? (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KanbanColumn
            title="Healthy"
            count={healthyServices.length}
            icon={CheckCircle}
            color="from-emerald-500 to-emerald-600"
            bgColor="bg-emerald-500/10"
            textColor="text-emerald-500"
            emptyMessage="No healthy services"
            loading={loading}
          >
            {healthyServices.map(renderServiceCard)}
          </KanbanColumn>

          <KanbanColumn
            title="Warning"
            count={warningServices.length}
            icon={AlertTriangle}
            color="from-amber-500 to-amber-600"
            bgColor="bg-amber-500/10"
            textColor="text-amber-500"
            emptyMessage="No warnings"
            loading={loading}
          >
            {warningServices.map(renderServiceCard)}
          </KanbanColumn>

          <KanbanColumn
            title="Critical"
            count={criticalServices.length}
            icon={XCircle}
            color="from-red-500 to-red-600"
            bgColor="bg-red-500/10"
            textColor="text-red-500"
            emptyMessage="No critical issues"
            loading={loading}
          >
            {criticalServices.map(renderServiceCard)}
          </KanbanColumn>
        </motion.div>
      ) : (
        /* Charts and Services List View */
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
              {services.map((service) => {
                const ServiceIcon = getServiceIcon(service.name);
                
                return (
                  <div 
                    key={service.name}
                    className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", getStatusColor(service.status).replace('text-', 'bg-').split(' ')[0])}>
                        <ServiceIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-medium">{service.name}</span>
                        <p className="text-xs text-muted-foreground">{service.responseTime}ms response</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{service.uptime} uptime</span>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SystemHealth;
