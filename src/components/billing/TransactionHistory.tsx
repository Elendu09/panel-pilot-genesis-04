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
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Crown,
  Megaphone,
  DollarSign
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
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal" | "commission" | "subscription" | "ads">("all");
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
    // Handle admin adjustments and ads
    if (tx.type === 'admin_credit' || tx.type === 'admin_debit') {
      return filter === 'deposit';
    }
    if (tx.type === 'debit' || tx.type === 'ad_purchase') {
      return filter === 'ads';
    }
    return tx.type === filter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / perPage);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * perPage, page * perPage);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit": 
      case "admin_credit": 
        return "bg-green-500/10 text-green-500 border-green-500/30";
      case "withdrawal": 
      case "admin_debit": 
        return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "commission": 
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "subscription": 
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "debit":
      case "ad_purchase":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      default: 
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "admin_credit": return "Credit";
      case "admin_debit": return "Debit";
      case "ad_purchase": 
      case "debit": return "Ads";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
      case "admin_credit":
        return <ArrowDownRight className="w-3.5 h-3.5" />;
      case "withdrawal":
      case "admin_debit":
        return <ArrowUpRight className="w-3.5 h-3.5" />;
      case "subscription":
        return <Crown className="w-3.5 h-3.5" />;
      case "commission":
        return <DollarSign className="w-3.5 h-3.5" />;
      case "debit":
      case "ad_purchase":
        return <Megaphone className="w-3.5 h-3.5" />;
      default:
        return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  // Mobile card component for each transaction
  const TransactionCard = ({ tx }: { tx: Transaction }) => (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn(
              "p-2 rounded-lg shrink-0",
              tx.amount >= 0 ? "bg-green-500/10" : "bg-red-500/10"
            )}>
              {getTypeIcon(tx.type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="outline" className={cn("text-xs capitalize", getTypeColor(tx.type))}>
                  {getTypeLabel(tx.type)}
                </Badge>
                <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(tx.status))}>
                  {tx.status || 'completed'}
                </Badge>
              </div>
              <p className="text-sm truncate">{tx.description || 'Transaction'}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {tx.payment_method && (
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  via {tx.payment_method.replace('_', ' ')}
                </p>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={cn(
              "text-lg font-bold font-mono",
              tx.amount >= 0 ? "text-green-500" : "text-destructive"
            )}>
              {tx.amount >= 0 ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Transaction History
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={fetchTransactions} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 pb-1">
            <Tabs value={filter} onValueChange={(v) => { setFilter(v as typeof filter); setPage(1); }}>
              <TabsList className="bg-muted/50 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs px-2 sm:px-3">All</TabsTrigger>
                <TabsTrigger value="deposit" className="text-xs px-2 sm:px-3">Deposits</TabsTrigger>
                <TabsTrigger value="subscription" className="text-xs px-2 sm:px-3">Subs</TabsTrigger>
                <TabsTrigger value="commission" className="text-xs px-2 sm:px-3">Commission</TabsTrigger>
                <TabsTrigger value="ads" className="text-xs px-2 sm:px-3">Ads</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : paginatedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {paginatedTransactions.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border border-border/50 overflow-hidden">
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
                  {paginatedTransactions.map((tx) => (
                    <TableRow key={tx.id} className="group">
                      <TableCell className="text-sm text-muted-foreground">
                        <div>
                          <p>{new Date(tx.created_at).toLocaleDateString()}</p>
                          <p className="text-xs">{new Date(tx.created_at).toLocaleTimeString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("capitalize gap-1", getTypeColor(tx.type))}>
                          {getTypeIcon(tx.type)}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && paginatedTransactions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
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
        )}
      </CardContent>
    </Card>
  );
};