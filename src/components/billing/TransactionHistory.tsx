import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Receipt,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  payment_method: string | null;
  status: string | null;
  created_at: string;
  description: string | null;
}

interface TransactionHistoryProps {
  panelId?: string;
}

export const TransactionHistory = ({ panelId }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal" | "commission" | "subscription">("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchTransactions();

    // Set up real-time subscription for transaction updates
    const channel = supabase
      .channel('transaction-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: panelId ? `panel_id=eq.${panelId}` : undefined
      }, (payload) => {
        const newTx = payload.new as Transaction;
        setTransactions(prev => [newTx, ...prev]);
        
        // Show toast for new transactions
        if (newTx.status === 'completed') {
          toast.success('New Transaction', {
            description: `${newTx.type}: $${Math.abs(newTx.amount).toFixed(2)}`,
            icon: <Bell className="w-4 h-4" />
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions',
        filter: panelId ? `panel_id=eq.${panelId}` : undefined
      }, (payload) => {
        const updatedTx = payload.new as Transaction;
        setTransactions(prev => 
          prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx)
        );
        
        // Notify on status change to completed
        if (updatedTx.status === 'completed' && payload.old?.status !== 'completed') {
          toast.success('Payment Completed', {
            description: `$${Math.abs(updatedTx.amount).toFixed(2)} has been processed`
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [panelId]);

  const fetchTransactions = async () => {
    if (!panelId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('panel_id', panelId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "all") return true;
    // Handle admin adjustments
    if (tx.type === 'admin_credit' || tx.type === 'admin_debit') {
      return filter === 'deposit';
    }
    return tx.type === filter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / perPage);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * perPage, page * perPage);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit": 
      case "admin_credit": 
        return "bg-green-500/10 text-green-500";
      case "withdrawal": 
      case "admin_debit": 
        return "bg-orange-500/10 text-orange-500";
      case "commission": 
        return "bg-purple-500/10 text-purple-500";
      case "subscription": 
        return "bg-blue-500/10 text-blue-500";
      default: 
        return "bg-muted";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "admin_credit": return "Credit";
      case "admin_debit": return "Debit";
      default: return type;
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Transaction History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={filter} onValueChange={(v) => { setFilter(v as any); setPage(1); }}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="deposit" className="text-xs">Deposits</TabsTrigger>
                <TabsTrigger value="subscription" className="text-xs">Subscriptions</TabsTrigger>
                <TabsTrigger value="commission" className="text-xs">Commissions</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="icon" onClick={fetchTransactions} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((tx) => (
                  <TableRow key={tx.id} className="group">
                    <TableCell className="text-sm text-muted-foreground">
                      <div>
                        <p>{new Date(tx.created_at).toLocaleDateString()}</p>
                        <p className="text-xs">{new Date(tx.created_at).toLocaleTimeString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", getTypeColor(tx.type))}>
                        {getTypeLabel(tx.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {tx.description || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">
                      {tx.payment_method?.replace('_', ' ') || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("capitalize text-xs", getStatusColor(tx.status))}>
                        {tx.status || 'completed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={cn(
                        tx.amount >= 0 ? "text-green-500" : "text-destructive",
                        "font-mono"
                      )}>
                        {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm min-w-[80px] text-center">
              Page {page} of {totalPages || 1}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
