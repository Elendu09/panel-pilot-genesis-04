import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  total_amount: number;
  currency: string | null;
  status: string | null;
  issued_at: string | null;
  pdf_url: string | null;
  payment_method: string | null;
}

interface BuyerInvoiceHistoryProps {
  buyerId: string;
}

export const BuyerInvoiceHistory = ({ buyerId }: BuyerInvoiceHistoryProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [buyerId]);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_type, total_amount, currency, status, issued_at, pdf_url, payment_method")
        .eq("buyer_id", buyerId)
        .order("issued_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      if (invoice.pdf_url) {
        window.open(invoice.pdf_url, "_blank");
      } else {
        const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
          body: { invoiceId: invoice.id }
        });

        if (error) throw error;

        if (data?.pdfUrl) {
          window.open(data.pdfUrl, "_blank");
          fetchInvoices();
        }
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to download invoice" });
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500";
      case "issued":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-muted";
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return null; // Don't show section if no invoices
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Invoice History
      </h2>
      <Card className="glass-card">
        <CardContent className="p-0">
          <ScrollArea className="max-h-[300px]">
            <div className="divide-y divide-border/50">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-3 md:p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 shrink-0">
                      <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-xs md:text-sm truncate">
                        {invoice.invoice_number}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {invoice.issued_at
                          ? new Date(invoice.issued_at).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <Badge
                      className={cn("capitalize text-[10px] md:text-xs", getStatusColor(invoice.status))}
                    >
                      {invoice.status || "issued"}
                    </Badge>
                    <span className="font-semibold text-sm md:text-base">
                      ${invoice.total_amount.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 md:h-8 md:w-8"
                      onClick={() => handleDownload(invoice)}
                      disabled={downloadingId === invoice.id}
                    >
                      {downloadingId === invoice.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
