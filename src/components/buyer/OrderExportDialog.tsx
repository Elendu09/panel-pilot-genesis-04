import { useState, useMemo } from "react";
import { Download, FileText, FileSpreadsheet, Loader2, Calendar, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "@/hooks/use-toast";
import { format, subDays, subMonths } from "date-fns";

interface Order {
  id: string;
  order_number: string;
  target_url: string;
  quantity: number;
  price: number;
  status: string;
  created_at: string;
  service?: { name: string; category: string } | null;
}

interface SpendingAnalytics {
  totalSpent: number;
  totalOrders: number;
  avgOrderValue: number;
  spendingByPlatform: Record<string, number>;
  spendingByMonth: Record<string, number>;
  topServices: { name: string; count: number; spent: number }[];
}

export const OrderExportDialog = () => {
  const { buyer } = useBuyerAuth();
  const { panel } = useTenant();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [format_, setFormat] = useState<"csv" | "pdf">("csv");
  const [dateRange, setDateRange] = useState("all");
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [columns, setColumns] = useState({
    order_number: true,
    service: true,
    quantity: true,
    price: true,
    status: true,
    date: true,
    target_url: false,
  });

  const calculateAnalytics = (orders: Order[]): SpendingAnalytics => {
    const totalSpent = orders.reduce((sum, o) => sum + o.price, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Spending by platform
    const spendingByPlatform: Record<string, number> = {};
    orders.forEach(order => {
      const platform = order.service?.category || 'Other';
      spendingByPlatform[platform] = (spendingByPlatform[platform] || 0) + order.price;
    });

    // Spending by month
    const spendingByMonth: Record<string, number> = {};
    orders.forEach(order => {
      const month = format(new Date(order.created_at), 'MMM yyyy');
      spendingByMonth[month] = (spendingByMonth[month] || 0) + order.price;
    });

    // Top services
    const serviceStats: Record<string, { count: number; spent: number }> = {};
    orders.forEach(order => {
      const serviceName = order.service?.name || 'Unknown';
      if (!serviceStats[serviceName]) {
        serviceStats[serviceName] = { count: 0, spent: 0 };
      }
      serviceStats[serviceName].count++;
      serviceStats[serviceName].spent += order.price;
    });

    const topServices = Object.entries(serviceStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);

    return {
      totalSpent,
      totalOrders,
      avgOrderValue,
      spendingByPlatform,
      spendingByMonth,
      topServices,
    };
  };

  const handleExport = async () => {
    if (!buyer?.id) return;

    setLoading(true);
    try {
      // Build date filter
      let fromDate: Date | null = null;
      switch (dateRange) {
        case "7days":
          fromDate = subDays(new Date(), 7);
          break;
        case "30days":
          fromDate = subDays(new Date(), 30);
          break;
        case "3months":
          fromDate = subMonths(new Date(), 3);
          break;
        case "6months":
          fromDate = subMonths(new Date(), 6);
          break;
      }

      // Fetch orders
      let query = supabase
        .from('orders')
        .select(`*, service:services(name, category)`)
        .eq('buyer_id', buyer.id)
        .order('created_at', { ascending: false });

      if (fromDate) {
        query = query.gte('created_at', fromDate.toISOString());
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      if (!orders || orders.length === 0) {
        toast({ title: "No orders to export", variant: "destructive" });
        return;
      }

      const analytics = includeAnalytics ? calculateAnalytics(orders) : null;

      if (format_ === "csv") {
        exportCSV(orders, analytics);
      } else {
        exportPDF(orders, analytics);
      }

      toast({ title: "Export successful!", description: `${orders.length} orders exported` });
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (orders: Order[], analytics: SpendingAnalytics | null) => {
    const lines: string[] = [];
    
    // Add analytics summary if enabled
    if (analytics) {
      lines.push('=== SPENDING ANALYTICS ===');
      lines.push(`Total Spent,$${analytics.totalSpent.toFixed(2)}`);
      lines.push(`Total Orders,${analytics.totalOrders}`);
      lines.push(`Average Order Value,$${analytics.avgOrderValue.toFixed(2)}`);
      lines.push('');
      lines.push('=== SPENDING BY PLATFORM ===');
      Object.entries(analytics.spendingByPlatform).forEach(([platform, spent]) => {
        lines.push(`${platform},$${spent.toFixed(2)}`);
      });
      lines.push('');
      lines.push('=== MONTHLY SPENDING ===');
      Object.entries(analytics.spendingByMonth).forEach(([month, spent]) => {
        lines.push(`${month},$${spent.toFixed(2)}`);
      });
      lines.push('');
      lines.push('=== TOP SERVICES ===');
      analytics.topServices.forEach((svc, i) => {
        lines.push(`${i + 1}. ${svc.name},${svc.count} orders,$${svc.spent.toFixed(2)}`);
      });
      lines.push('');
      lines.push('=== ORDER DETAILS ===');
    }

    // Headers
    const headers: string[] = [];
    if (columns.order_number) headers.push("Order Number");
    if (columns.service) headers.push("Service");
    if (columns.quantity) headers.push("Quantity");
    if (columns.price) headers.push("Price");
    if (columns.status) headers.push("Status");
    if (columns.date) headers.push("Date");
    if (columns.target_url) headers.push("Target URL");
    lines.push(headers.join(","));

    // Data rows
    orders.forEach((order) => {
      const row: string[] = [];
      if (columns.order_number) row.push(`"${order.order_number}"`);
      if (columns.service) row.push(`"${order.service?.name || 'Unknown'}"`);
      if (columns.quantity) row.push(order.quantity.toString());
      if (columns.price) row.push(`$${order.price.toFixed(2)}`);
      if (columns.status) row.push(order.status);
      if (columns.date) row.push(format(new Date(order.created_at), "yyyy-MM-dd HH:mm"));
      if (columns.target_url) row.push(`"${order.target_url}"`);
      lines.push(row.join(","));
    });

    const csv = lines.join("\n");
    downloadFile(csv, "order-history.csv", "text/csv");
  };

  const exportPDF = (orders: Order[], analytics: SpendingAnalytics | null) => {
    const panelName = panel?.name || 'SMM Panel';
    const buyerName = buyer?.full_name || buyer?.email || 'Customer';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            max-width: 900px; 
            margin: 0 auto;
            color: #1a1a1a;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 30px; 
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
          }
          .header h1 { 
            color: #1e40af; 
            margin: 0;
            font-size: 28px;
          }
          .header-info { text-align: right; color: #666; font-size: 14px; }
          .analytics-section { 
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 24px; 
            border-radius: 12px; 
            margin-bottom: 30px;
            border: 1px solid #bae6fd;
          }
          .analytics-title { 
            font-size: 18px; 
            font-weight: 600; 
            color: #0369a1;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .analytics-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 16px; 
            margin-bottom: 20px;
          }
          .stat-card { 
            background: white; 
            padding: 16px; 
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .stat-value { 
            font-size: 24px; 
            font-weight: 700; 
            color: #1e40af; 
          }
          .stat-label { 
            font-size: 12px; 
            color: #64748b; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .breakdown { margin-top: 16px; }
          .breakdown-title { 
            font-weight: 600; 
            font-size: 14px;
            color: #334155;
            margin-bottom: 8px;
          }
          .breakdown-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 4px 0;
            font-size: 13px;
            color: #475569;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            font-size: 13px;
          }
          th { 
            background: #1e40af; 
            color: white;
            padding: 12px 8px; 
            text-align: left;
            font-weight: 600;
          }
          td { 
            border-bottom: 1px solid #e2e8f0; 
            padding: 10px 8px;
          }
          tr:nth-child(even) { background: #f8fafc; }
          tr:hover { background: #f1f5f9; }
          .status { 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-completed { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-in_progress { background: #dbeafe; color: #1e40af; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center; 
            color: #94a3b8; 
            font-size: 12px; 
          }
          @media print {
            body { padding: 20px; }
            .analytics-section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>📊 Order History Report</h1>
            <p style="color: #64748b; margin: 8px 0 0;">${panelName}</p>
          </div>
          <div class="header-info">
            <p><strong>${buyerName}</strong></p>
            <p>Generated: ${format(new Date(), "MMMM d, yyyy")}</p>
            <p>Total Orders: ${orders.length}</p>
          </div>
        </div>
        
        ${analytics ? `
        <div class="analytics-section">
          <div class="analytics-title">
            📈 Spending Analytics
          </div>
          <div class="analytics-grid">
            <div class="stat-card">
              <div class="stat-value">$${analytics.totalSpent.toFixed(2)}</div>
              <div class="stat-label">Total Spent</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${analytics.totalOrders}</div>
              <div class="stat-label">Total Orders</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">$${analytics.avgOrderValue.toFixed(2)}</div>
              <div class="stat-label">Avg Order Value</div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div class="breakdown">
              <div class="breakdown-title">💰 Spending by Platform</div>
              ${Object.entries(analytics.spendingByPlatform)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([platform, spent]) => `
                  <div class="breakdown-item">
                    <span>${platform}</span>
                    <span>$${spent.toFixed(2)}</span>
                  </div>
                `).join('')}
            </div>
            <div class="breakdown">
              <div class="breakdown-title">⭐ Top Services</div>
              ${analytics.topServices.map((svc, i) => `
                <div class="breakdown-item">
                  <span>${i + 1}. ${svc.name.substring(0, 30)}${svc.name.length > 30 ? '...' : ''}</span>
                  <span>$${svc.spent.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        ` : ''}
        
        <h3 style="color: #334155; margin-bottom: 8px;">📋 Order Details</h3>
        <table>
          <thead>
            <tr>
              ${columns.order_number ? '<th>Order #</th>' : ''}
              ${columns.service ? '<th>Service</th>' : ''}
              ${columns.quantity ? '<th>Qty</th>' : ''}
              ${columns.price ? '<th>Price</th>' : ''}
              ${columns.status ? '<th>Status</th>' : ''}
              ${columns.date ? '<th>Date</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                ${columns.order_number ? `<td><code>${order.order_number}</code></td>` : ''}
                ${columns.service ? `<td>${order.service?.name || 'Unknown'}</td>` : ''}
                ${columns.quantity ? `<td>${order.quantity.toLocaleString()}</td>` : ''}
                ${columns.price ? `<td><strong>$${order.price.toFixed(2)}</strong></td>` : ''}
                ${columns.status ? `<td><span class="status status-${order.status}">${order.status.replace('_', ' ')}</span></td>` : ''}
                ${columns.date ? `<td>${format(new Date(order.created_at), "MMM d, yyyy")}</td>` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated by ${panelName} • ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Export Order History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  format_ === "csv" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <p className="font-medium text-sm">CSV</p>
                <p className="text-xs text-muted-foreground">Spreadsheet</p>
              </button>
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  format_ === "pdf" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="font-medium text-sm">PDF</p>
                <p className="text-xs text-muted-foreground">Print Ready</p>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analytics Toggle */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50 dark:border-blue-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="analytics"
                  checked={includeAnalytics}
                  onCheckedChange={(checked) => setIncludeAnalytics(!!checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="analytics" className="font-medium flex items-center gap-2 cursor-pointer">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    Include Spending Analytics
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total spent, spending by platform, monthly trends, top services
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Column Selection */}
          <div className="space-y-3">
            <Label>Include Columns</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(columns).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setColumns(prev => ({ ...prev, [key]: !!checked }))
                    }
                  />
                  <Label htmlFor={key} className="text-sm font-normal capitalize cursor-pointer">
                    {key.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleExport} disabled={loading} className="w-full gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export Orders
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderExportDialog;
