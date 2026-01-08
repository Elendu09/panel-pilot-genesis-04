import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  total_amount: number;
  tax_amount: number | null;
  currency: string | null;
  status: string | null;
  issued_at: string | null;
  pdf_url: string | null;
  payment_method: string | null;
}

interface InvoiceListProps {
  panelId?: string;
  userId?: string;
  buyerId?: string;
  title?: string;
  compact?: boolean;
}

export const InvoiceList = ({ 
  panelId, 
  userId, 
  buyerId, 
  title = "Invoices",
  compact = false 
}: InvoiceListProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = compact ? 5 : 10;

  useEffect(() => {
    fetchInvoices();
  }, [panelId, userId, buyerId]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("invoices")
        .select("id, invoice_number, invoice_type, total_amount, tax_amount, currency, status, issued_at, pdf_url, payment_method")
        .order("issued_at", { ascending: false });

      if (panelId) query = query.eq("panel_id", panelId);
      if (userId) query = query.eq("user_id", userId);
      if (buyerId) query = query.eq("buyer_id", buyerId);

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, "_blank");
    } else {
      // Generate PDF on demand
      try {
        toast({ title: "Generating PDF...", description: "Please wait" });
        
        const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
          body: { invoiceId: invoice.id }
        });

        if (error) throw error;

        if (data?.pdfUrl) {
          window.open(data.pdfUrl, "_blank");
          // Refresh to show updated PDF URL
          fetchInvoices();
        }
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to generate PDF" });
      }
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "issued":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "refunded":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "bg-muted";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "panel_funding":
        return "Deposit";
      case "buyer_funding":
        return "Deposit";
      case "order":
        return "Order";
      default:
        return type;
    }
  };

  const totalPages = Math.ceil(invoices.length / perPage);
  const paginatedInvoices = invoices.slice((page - 1) * perPage, page * perPage);

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                {!compact && <TableHead>Type</TableHead>}
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={compact ? 6 : 7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={compact ? 6 : 7} className="text-center py-8 text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {invoice.issued_at
                        ? new Date(invoice.issued_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    {!compact && (
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(invoice.invoice_type)}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell className="text-sm text-muted-foreground capitalize">
                      {invoice.payment_method || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("capitalize text-xs", getStatusColor(invoice.status))}
                      >
                        {invoice.status || "issued"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className="text-foreground">
                        ${invoice.total_amount.toFixed(2)}
                      </span>
                      {invoice.tax_amount && invoice.tax_amount > 0 && (
                        <span className="text-xs text-muted-foreground block">
                          (incl. ${invoice.tax_amount.toFixed(2)} tax)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(invoice)}
                        className="gap-1"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden md:inline">PDF</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedInvoices.length} of {invoices.length} invoices
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
