import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
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
  service?: { name: string } | null;
}

export const OrderExportDialog = () => {
  const { buyer } = useBuyerAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [format_, setFormat] = useState<"csv" | "pdf">("csv");
  const [dateRange, setDateRange] = useState("all");
  const [columns, setColumns] = useState({
    order_number: true,
    service: true,
    quantity: true,
    price: true,
    status: true,
    date: true,
    target_url: false,
  });

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
        .select(`*, service:services(name)`)
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

      if (format_ === "csv") {
        exportCSV(orders);
      } else {
        exportPDF(orders);
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

  const exportCSV = (orders: Order[]) => {
    const headers: string[] = [];
    if (columns.order_number) headers.push("Order Number");
    if (columns.service) headers.push("Service");
    if (columns.quantity) headers.push("Quantity");
    if (columns.price) headers.push("Price");
    if (columns.status) headers.push("Status");
    if (columns.date) headers.push("Date");
    if (columns.target_url) headers.push("Target URL");

    const rows = orders.map((order) => {
      const row: string[] = [];
      if (columns.order_number) row.push(order.order_number);
      if (columns.service) row.push(order.service?.name || "Unknown");
      if (columns.quantity) row.push(order.quantity.toString());
      if (columns.price) row.push(`$${order.price.toFixed(2)}`);
      if (columns.status) row.push(order.status);
      if (columns.date) row.push(format(new Date(order.created_at), "yyyy-MM-dd HH:mm"));
      if (columns.target_url) row.push(order.target_url);
      return row.map(cell => `"${cell}"`).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    downloadFile(csv, "orders.csv", "text/csv");
  };

  const exportPDF = (orders: Order[]) => {
    // Simple HTML-based PDF export
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Order History</h1>
        <p>Exported on ${format(new Date(), "MMMM d, yyyy")}</p>
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
                ${columns.order_number ? `<td>${order.order_number}</td>` : ''}
                ${columns.service ? `<td>${order.service?.name || 'Unknown'}</td>` : ''}
                ${columns.quantity ? `<td>${order.quantity.toLocaleString()}</td>` : ''}
                ${columns.price ? `<td>$${order.price.toFixed(2)}</td>` : ''}
                ${columns.status ? `<td>${order.status}</td>` : ''}
                ${columns.date ? `<td>${format(new Date(order.created_at), "yyyy-MM-dd")}</td>` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">Total Orders: ${orders.length}</div>
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Order History</DialogTitle>
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
                  <Label htmlFor={key} className="text-sm font-normal capitalize">
                    {key.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleExport} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Orders
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderExportDialog;
