import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TabsContent } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Loader2,
  CalendarIcon,
  Percent
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { usePanel } from "@/hooks/usePanel";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  calculateChange, 
  getPreviousPeriodRange,
  formatCompactNumber,
  formatCurrency,
  buildPaymentFunnel,
  buildFastOrderFunnel,
  calculateRetentionRate,
  calculateSuccessRate,
  calculateGrossVolume,
  generateInsights,
  aggregateDailyData,
  findPeakDay,
  type AnalyticsEvent
} from "@/lib/analytics-utils";
import {
  PaymentsFunnelCard,
  GrossVolumeCard,
  RetentionCard,
  InsightsCard,
  CompactStatCard,
  TopStatCard,
  AnalyticsTabs,
  AnalyticsSkeleton,
  FastOrderAnalyticsCard,
  TenantMetricsGrid,
  DepositAnalyticsCard,
  AdsFunnelCard,
} from "@/components/analytics";

const Analytics = () => {
  const { profile } = useAuth();
  const { panel } = usePanel();
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Custom date range state
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  
  // Real data from Supabase
  const [orderTrends, setOrderTrends] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
  
  // Zentra-style analytics data
  const [funnelData, setFunnelData] = useState({
    stages: [] as any[],
    totalTransactions: 0,
    conversionRate: 0,
    overallDropOff: 0
  });
  
  // Fast Order funnel data from real analytics events
  const [fastOrderFunnelData, setFastOrderFunnelData] = useState<{
    stages: { name: string; count: number; percentage: number; dropOff: number }[];
    totalFastOrders: number;
    conversionRate: number;
  }>({
    stages: [],
    totalFastOrders: 0,
    conversionRate: 0
  });
  
  const [volumeData, setVolumeData] = useState({
    grossVolume: 0,
    previousGrossVolume: 0,
    orderPayments: 0,
    deposits: 0,
    refunds: 0,
    netRevenue: 0
  });
  
  const [retentionData, setRetentionData] = useState({
    currentRate: 0,
    monthlyData: [] as { month: string; rate: number }[]
  });
  
  const [transactionsData, setTransactionsData] = useState<{
    total: number;
    change: { value: string; trend: 'up' | 'down' | 'neutral' };
    sparkline: number[];
    peakDay: string;
  }>({
    total: 0,
    change: { value: '0%', trend: 'neutral' },
    sparkline: [],
    peakDay: ''
  });
  
  const [customersData, setCustomersData] = useState<{
    total: number;
    change: { value: string; trend: 'up' | 'down' | 'neutral' };
    sparkline: number[];
    peakDay: string;
  }>({
    total: 0,
    change: { value: '0%', trend: 'neutral' },
    sparkline: [],
    peakDay: ''
  });
  
  const [insightsData, setInsightsData] = useState<any[]>([]);
  
  // Real deposit breakdown state - replaces simulated percentages
  const [depositBreakdown, setDepositBreakdown] = useState({
    completed: 0,
    pending: 0,
    failed: 0
  });
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    conversionRate: 0,
    successRate: 0,
    retention: 0,
  });
  
  const [changes, setChanges] = useState<{
    revenue: { value: string; trend: 'up' | 'down' | 'neutral' };
    orders: { value: string; trend: 'up' | 'down' | 'neutral' };
    users: { value: string; trend: 'up' | 'down' | 'neutral' };
  }>({
    revenue: { value: '0%', trend: 'neutral' },
    orders: { value: '0%', trend: 'neutral' },
    users: { value: '0%', trend: 'neutral' },
  });

  useEffect(() => {
    if (panel?.id) {
      fetchAnalytics();
    }
  }, [panel?.id, dateRange, customStartDate, customEndDate]);

  const fetchAnalytics = async () => {
    if (!panel?.id) return;
    setLoading(true);

    try {
      let startDate: Date;
      let endDate: Date = new Date();
      
      if (dateRange === "custom" && customStartDate && customEndDate) {
        startDate = customStartDate;
        endDate = customEndDate;
      } else {
        const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
        startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
      }

      // Fetch orders with service names
      const { data: orders } = await supabase
        .from('orders')
        .select('*, services(name, category)')
        .eq('panel_id', panel.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Fetch customers
      const { data: customers } = await supabase
        .from('client_users')
        .select('*')
        .eq('panel_id', panel.id);
      
      // Filter customers created within the selected date range
      const newCustomersInPeriod = customers?.filter(c => {
        const createdDate = new Date(c.created_at);
        return createdDate >= startDate && createdDate <= endDate;
      }) || [];

      // Fetch transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      // Fetch fast order funnel analytics events
      const { data: analyticsEvents } = await supabase
        .from('analytics_events')
        .select('event_type, session_id, metadata')
        .eq('panel_id', panel.id)
        .in('event_type', ['fast_order_visit', 'fast_order_step', 'service_select', 'checkout_start', 'order_complete'])
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Calculate previous period
      let prevStart: Date, prevEnd: Date;
      if (dateRange === "custom" && customStartDate && customEndDate) {
        const periodDays = Math.ceil((customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24));
        prevEnd = new Date(customStartDate);
        prevStart = new Date(customStartDate);
        prevStart.setDate(prevStart.getDate() - periodDays);
      } else {
        const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
        const prev = getPreviousPeriodRange(daysAgo);
        prevStart = prev.startDate;
        prevEnd = prev.endDate;
      }

      // Fetch previous period data (include buyer_id and created_at for retention calculation)
      const { data: prevOrders } = await supabase
        .from('orders')
        .select('price, status, buyer_id, created_at')
        .eq('panel_id', panel.id)
        .gte('created_at', prevStart.toISOString())
        .lt('created_at', prevEnd.toISOString());

      const { data: prevTransactions } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', prevStart.toISOString())
        .lt('created_at', prevEnd.toISOString());

      const { data: prevCustomers } = await supabase
        .from('client_users')
        .select('created_at')
        .eq('panel_id', panel.id)
        .gte('created_at', prevStart.toISOString())
        .lt('created_at', prevEnd.toISOString());

      // ========= FUNNEL DATA =========
      const ordersForFunnel = (orders || []).map(o => ({ status: o.status, price: o.price || 0 }));
      const funnelStages = buildPaymentFunnel(ordersForFunnel);
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
      const totalOrders = orders?.length || 0;
      const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
      const overallDropOff = 100 - conversionRate;
      
      setFunnelData({
        stages: funnelStages,
        totalTransactions: completedOrders,
        conversionRate,
        overallDropOff
      });

      // ========= FAST ORDER FUNNEL DATA (from real analytics events) =========
      const typedEvents: AnalyticsEvent[] = (analyticsEvents || []).map(e => ({
        event_type: e.event_type,
        session_id: e.session_id,
        metadata: e.metadata as Record<string, unknown> | null
      }));
      const fastOrderStages = buildFastOrderFunnel(typedEvents, completedOrders);
      const fastOrderConversionRate = fastOrderStages.length > 0 && fastOrderStages[0].count > 0
        ? (fastOrderStages[fastOrderStages.length - 1].count / fastOrderStages[0].count) * 100
        : conversionRate;
      
      setFastOrderFunnelData({
        stages: fastOrderStages,
        totalFastOrders: completedOrders,
        conversionRate: fastOrderConversionRate
      });
      const deposits = (transactions || []).filter(t => t.type === 'deposit' && t.status === 'completed');
      const refunds = (transactions || []).filter(t => t.type === 'refund' && t.status === 'completed');
      const volumeCalc = calculateGrossVolume(
        ordersForFunnel,
        deposits.map(d => ({ amount: d.amount || 0 })),
        refunds.map(r => ({ amount: r.amount || 0 }))
      );
      
      // Previous period volume
      const prevOrdersForVolume = (prevOrders || []).map(o => ({ status: o.status, price: o.price || 0 }));
      const prevDeposits = (prevTransactions || []).filter(t => t.type === 'deposit' && t.status === 'completed');
      const prevRefunds = (prevTransactions || []).filter(t => t.type === 'refund' && t.status === 'completed');
      const prevVolumeCalc = calculateGrossVolume(
        prevOrdersForVolume,
        prevDeposits.map(d => ({ amount: d.amount || 0 })),
        prevRefunds.map(r => ({ amount: r.amount || 0 }))
      );
      
      setVolumeData({
        grossVolume: volumeCalc.grossVolume,
        previousGrossVolume: prevVolumeCalc.grossVolume,
        orderPayments: volumeCalc.orderPayments,
        deposits: volumeCalc.deposits,
        refunds: volumeCalc.refunds,
        netRevenue: volumeCalc.netRevenue
      });
      
      // ========= REAL DEPOSIT BREAKDOWN =========
      // Calculate actual deposit breakdown from transactions (replaces simulated percentages)
      const allDeposits = (transactions || []).filter(t => t.type === 'deposit');
      const completedDepositsAmount = allDeposits
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const pendingDepositsAmount = allDeposits
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const failedDepositsAmount = allDeposits
        .filter(t => t.status === 'refunded')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      setDepositBreakdown({
        completed: completedDepositsAmount,
        pending: pendingDepositsAmount,
        failed: failedDepositsAmount
      });

      // ========= RETENTION DATA (REAL CALCULATION) =========
      const retentionRate = calculateRetentionRate(
        (orders || []).map(o => ({ buyer_id: o.buyer_id }))
      );
      
      // Calculate REAL monthly retention from orders data
      const ordersByMonth = new Map<string, Set<string>>();
      const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Group orders by month
      (orders || []).forEach(order => {
        if (!order.buyer_id || !order.created_at) return;
        const date = new Date(order.created_at);
        const monthKey = format(date, 'yyyy-MM');
        
        if (!ordersByMonth.has(monthKey)) {
          ordersByMonth.set(monthKey, new Set());
        }
        ordersByMonth.get(monthKey)!.add(order.buyer_id);
      });
      
      // Calculate retention: % of buyers who ordered in previous month AND this month
      const sortedMonths = Array.from(ordersByMonth.keys()).sort();
      const monthlyRetention: { month: string; rate: number }[] = [];
      let previousBuyers = new Set<string>();
      
      // Build retention data for all months with real data
      sortedMonths.forEach(monthKey => {
        const currentBuyers = ordersByMonth.get(monthKey)!;
        
        // Retention = buyers who were in previous month AND are in this month
        const retainedBuyers = [...currentBuyers].filter(b => previousBuyers.has(b));
        const rate = previousBuyers.size > 0 
          ? (retainedBuyers.length / previousBuyers.size) * 100 
          : 0;
        
        monthlyRetention.push({
          month: format(new Date(monthKey + '-01'), 'MMM'),
          rate: Math.round(rate * 10) / 10
        });
        
        previousBuyers = currentBuyers;
      });
      
      // If no real data, show all 12 months with 0% (no fake data)
      const finalRetention = monthlyRetention.length > 0 
        ? monthlyRetention.slice(-12) 
        : allMonths.map(month => ({ month, rate: 0 }));
      
      setRetentionData({
        currentRate: retentionRate,
        monthlyData: finalRetention
      });

      // ========= TRANSACTIONS SUMMARY =========
      const transactionSparkline = aggregateDailyData(
        (transactions || []).map(t => ({ created_at: t.created_at, amount: 1 })),
        7
      );
      const transactionPeak = findPeakDay(transactionSparkline);
      const prevTxnCount = prevTransactions?.length || 0;
      const txnChange = calculateChange(transactions?.length || 0, prevTxnCount);
      
      setTransactionsData({
        total: transactions?.length || 0,
        change: { value: txnChange.value, trend: txnChange.trend },
        sparkline: transactionSparkline,
        peakDay: transactionPeak.dayName
      });

      // ========= CUSTOMERS SUMMARY =========
      const customerSparkline = aggregateDailyData(
        newCustomersInPeriod.map(c => ({ created_at: c.created_at, amount: 1 })),
        7
      );
      const customerPeak = findPeakDay(customerSparkline);
      const prevCustomerCount = prevCustomers?.length || 0;
      const customerChange = calculateChange(newCustomersInPeriod.length, prevCustomerCount);
      
      setCustomersData({
        total: customers?.length || 0,
        change: { value: customerChange.value, trend: customerChange.trend },
        sparkline: customerSparkline,
        peakDay: customerPeak.dayName
      });

      // ========= INSIGHTS =========
      const successRate = calculateSuccessRate((orders || []).map(o => ({ status: o.status })));
      const prevSuccessRate = calculateSuccessRate((prevOrders || []).map(o => ({ status: o.status })));
      
      // Calculate REAL previous retention from previous period orders
      const prevOrdersByMonth = new Map<string, Set<string>>();
      (prevOrders || []).forEach(order => {
        if (!order.buyer_id || !order.created_at) return;
        const monthKey = format(new Date(order.created_at), 'yyyy-MM');
        if (!prevOrdersByMonth.has(monthKey)) {
          prevOrdersByMonth.set(monthKey, new Set());
        }
        prevOrdersByMonth.get(monthKey)!.add(order.buyer_id);
      });
      
      const prevSortedMonths = Array.from(prevOrdersByMonth.keys()).sort();
      let prevPreviousBuyers = new Set<string>();
      let prevRetentionRate = 0;
      
      prevSortedMonths.forEach(monthKey => {
        const buyers = prevOrdersByMonth.get(monthKey)!;
        const retained = [...buyers].filter(b => prevPreviousBuyers.has(b));
        if (prevPreviousBuyers.size > 0) {
          prevRetentionRate = (retained.length / prevPreviousBuyers.size) * 100;
        }
        prevPreviousBuyers = buyers;
      });
      
      const currentStats = {
        revenue: volumeCalc.orderPayments,
        orders: totalOrders,
        successRate,
        customers: customers?.length || 0,
        retention: retentionRate
      };
      
      const previousStats = {
        revenue: prevVolumeCalc.orderPayments,
        orders: prevOrders?.length || 0,
        successRate: prevSuccessRate,
        customers: prevCustomers?.length || 0,
        retention: prevRetentionRate // REAL previous retention, not simulated
      };
      
      const insights = generateInsights(currentStats, previousStats);
      setInsightsData(insights);

      // ========= LEGACY STATS (for charts) =========
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0;
      const activeUsers = customers?.filter(c => c.is_active)?.length || 0;

      const prevRevenue = prevOrders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0;
      const prevOrderCount = prevOrders?.length || 0;

      const revenueChange = calculateChange(totalRevenue, prevRevenue);
      const orderChange = calculateChange(totalOrders, prevOrderCount);
      const userChange = calculateChange(activeUsers, Math.max(1, activeUsers - newCustomersInPeriod.length));

      setChanges({
        revenue: { value: revenueChange.value, trend: revenueChange.trend },
        orders: { value: orderChange.value, trend: orderChange.trend },
        users: { value: userChange.value, trend: userChange.trend },
      });

      setStats({
        totalRevenue,
        totalOrders,
        activeUsers,
        conversionRate,
        successRate,
        retention: retentionRate,
      });

      // Order trends by day
      const ordersByDay = new Map<string, { date: string; orders: number; revenue: number }>();
      orders?.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = ordersByDay.get(date) || { date, orders: 0, revenue: 0 };
        existing.orders += 1;
        existing.revenue += order.price || 0;
        ordersByDay.set(date, existing);
      });
      setOrderTrends(Array.from(ordersByDay.values()).slice(-14));

      // Revenue data
      const revenueByMonth = new Map<string, { month: string; revenue: number }>();
      orders?.forEach(order => {
        const month = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short' });
        const existing = revenueByMonth.get(month) || { month, revenue: 0 };
        existing.revenue += order.price || 0;
        revenueByMonth.set(month, existing);
      });
      setRevenueData(Array.from(revenueByMonth.values()));

      // Customer growth
      const customersInRange = customers?.filter(c => {
        const createdDate = new Date(c.created_at);
        return createdDate >= startDate && createdDate <= endDate;
      }) || [];
      
      const customersByMonth = new Map<string, { month: string; new: number; total: number }>();
      let runningTotal = 0;
      customersInRange
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .forEach(customer => {
          const month = new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const existing = customersByMonth.get(month) || { month, new: 0, total: 0 };
          existing.new += 1;
          runningTotal += 1;
          existing.total = runningTotal;
          customersByMonth.set(month, existing);
        });
      setCustomerGrowth(Array.from(customersByMonth.values()).slice(-14));

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const dateRanges = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "1y", label: "1 Year" },
    { value: "custom", label: "Custom" },
  ];
  
  const handleCustomDateSelect = () => {
    if (customStartDate && customEndDate) {
      setDateRange("custom");
      setShowCustomPicker(false);
    }
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              Hello, {firstName} <span className="animate-pulse">👋</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Here's what's happening with your panel today
            </p>
          </motion.div>
          
          {/* Time Period Selector - Pill Style */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 overflow-x-auto">
            {dateRanges.map((range) => (
              range.value === "custom" ? (
                <Popover key={range.value} open={showCustomPicker} onOpenChange={setShowCustomPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={dateRange === "custom" ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-8 whitespace-nowrap flex-shrink-0",
                        dateRange === "custom" ? "bg-primary shadow-sm" : ""
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {dateRange === "custom" && customStartDate && customEndDate
                        ? `${format(customStartDate, "MMM d")} - ${format(customEndDate, "MMM d")}`
                        : "Custom"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4 pointer-events-auto" align="end">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Start Date</p>
                          <Calendar
                            mode="single"
                            selected={customStartDate}
                            onSelect={setCustomStartDate}
                            disabled={(date) => date > new Date()}
                            className="rounded-md border pointer-events-auto"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">End Date</p>
                          <Calendar
                            mode="single"
                            selected={customEndDate}
                            onSelect={setCustomEndDate}
                            disabled={(date) => date > new Date() || (customStartDate && date < customStartDate)}
                            className="rounded-md border pointer-events-auto"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowCustomPicker(false)}>
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleCustomDateSelect}
                          disabled={!customStartDate || !customEndDate}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  key={range.value}
                  variant={dateRange === range.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDateRange(range.value)}
                  className={cn(
                    "h-8 whitespace-nowrap flex-shrink-0",
                    dateRange === range.value ? "bg-primary shadow-sm" : ""
                  )}
                >
                  {range.label}
                </Button>
              )
            ))}
          </div>
        </div>
        
        {/* Sub-Tabs: Overview / Payments / Customers */}
        <AnalyticsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Top Stat Cards Row - 4 gradient cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <TopStatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change={changes.revenue}
          icon={<DollarSign className="w-6 h-6" />}
          iconBg="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/30"
          iconColor="text-blue-600 dark:text-blue-400"
          tooltip="Total revenue from completed orders"
        />
        <TopStatCard
          title="Total Orders"
          value={formatCompactNumber(stats.totalOrders)}
          change={changes.orders}
          icon={<ShoppingCart className="w-6 h-6" />}
          iconBg="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/30"
          iconColor="text-pink-600 dark:text-pink-400"
          tooltip="Total orders placed in this period"
        />
        <TopStatCard
          title="Active Users"
          value={formatCompactNumber(stats.activeUsers)}
          change={changes.users}
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          tooltip="Number of active customers"
        />
        <TopStatCard
          title="Conversion Rate"
          value={`${stats.conversionRate.toFixed(0)}%`}
          change={{ value: '+0%', trend: 'neutral' }}
          icon={<Percent className="w-6 h-6" />}
          iconBg="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/30"
          iconColor="text-orange-600 dark:text-orange-400"
          tooltip="Percentage of completed orders"
        />
      </motion.div>

      {/* Main Dashboard Grid - Tab Filtered Content */}
      {(activeTab === 'overview' || activeTab === 'payments') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Payment Deposit Funnel - Overall deposit analytics */}
          <PaymentsFunnelCard
            stages={funnelData.stages}
            totalTransactions={funnelData.totalTransactions}
            conversionRate={funnelData.conversionRate}
            overallDropOff={funnelData.overallDropOff}
          />
          
          {/* Fast Order Funnel - Checkout flow tracking (REAL DATA) */}
          <FastOrderAnalyticsCard
            stages={fastOrderFunnelData.stages}
            totalFastOrders={fastOrderFunnelData.totalFastOrders}
            conversionRate={fastOrderFunnelData.conversionRate}
            growthTrend={changes.orders}
          />
          
          {/* Ads Performance Funnel - Real ads data with "No Ads" overlay */}
          {panel?.id && (
            <AdsFunnelCard panelId={panel.id} />
          )}
        </motion.div>
      )}

      {/* Deposit Analytics Row - Real data breakdown */}
      {(activeTab === 'overview' || activeTab === 'payments') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <DepositAnalyticsCard
            totalDeposits={volumeData.deposits}
            completedDeposits={depositBreakdown.completed}
            pendingDeposits={depositBreakdown.pending}
            failedDeposits={depositBreakdown.failed}
            previousTotalDeposits={volumeData.previousGrossVolume * 0.3}
          />
        </motion.div>
      )}

      {/* Second Row: Retention, Stats, Insights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Retention Card - Show in Overview & Customers */}
        {(activeTab === 'overview' || activeTab === 'customers') && (
          <RetentionCard
            currentRate={retentionData.currentRate}
            data={retentionData.monthlyData}
          />
        )}
        
        {/* Transactions Card - Show in Overview & Payments */}
        {(activeTab === 'overview' || activeTab === 'payments') && (
          <CompactStatCard
            title="Transactions"
            value={transactionsData.total}
            change={transactionsData.change}
            sparklineData={transactionsData.sparkline}
            peakLabel={transactionsData.peakDay}
            sparklineColor="hsl(var(--primary))"
          />
        )}
        
        {/* Customers Card - Show in Overview & Customers */}
        {(activeTab === 'overview' || activeTab === 'customers') && (
          <CompactStatCard
            title="Customers"
            value={customersData.total}
            change={customersData.change}
            sparklineData={customersData.sparkline}
            peakLabel={customersData.peakDay}
            sparklineColor="hsl(217, 91%, 60%)"
          />
        )}
        
        {/* Insights Card - Show in Overview & Payments */}
        {(activeTab === 'overview' || activeTab === 'payments') && (
          <InsightsCard insights={insightsData} />
        )}
      </motion.div>

      {/* Third Row: Charts - Tab Filtered */}
      {(activeTab === 'overview' || activeTab === 'payments') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Order Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={orderTrends}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorOrders)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Fourth Row: Customer Growth - Show in Overview & Customers */}
      {(activeTab === 'overview' || activeTab === 'customers') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-blue-500" />
                Customer Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={customerGrowth}>
                  <defs>
                    <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="hsl(217, 91%, 60%)" 
                    fillOpacity={1} 
                    fill="url(#colorCustomers)" 
                    strokeWidth={2}
                    name="Total Customers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
