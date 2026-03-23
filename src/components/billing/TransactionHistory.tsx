import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Receipt,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Crown,
  Megaphone,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet
} from "lucide-react";
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

  // Poll pending transactions every 10s as realtime fallback (faster for status updates)
  useEffect(() => {
    if (!panelId) return;
    const hasPending = transactions.some(tx => tx.status === 'pending');
    if (!hasPending) return;

    const interval = setInterval(async () => {
      const pendingIds = transactions.filter(tx => tx.status === 'pending').map(tx => tx.id);
      if (pendingIds.length === 0) return;

      const { data } = await supabase
        .from('transactions')
        .select('*')
        .in('id', pendingIds);

      if (data) {
        setTransactions(prev => prev.map(tx => {
          const updated = data.find(d => d.id === tx.id);
          if (updated && updated.status !== tx.status) {
            if (updated.status === 'completed') {
              toast.success('Payment Completed', { description: `$${Math.abs(updated.amount).toFixed(2)} has been processed` });
            } else if (updated.status === 'failed') {
              toast.error('Payment Failed', { description: `$${Math.abs(updated.amount).toFixed(2)} payment failed` });
            }
            return updated as Transaction;
          }
          return tx;
        }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [panelId, transactions]);

  useEffect(() => {
    fetchTransactions();

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
        if (updatedTx.status === 'completed' && payload.old?.status !== 'completed') {
          toast.success('Payment Completed', {
            description: `$${Math.abs(updatedTx.amount).toFixed(2)} has been processed`
          });
        } else if (updatedTx.status === 'failed' && payload.old?.status !== 'failed') {
          toast.error('Payment Failed', {
            description: `$${Math.abs(updatedTx.amount).toFixed(2)} payment failed`
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [panelId]);

  const fetchTransactions = async () => {
    if (!panelId) { setLoading(false); return; }
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

  // Summary stats
  const summary = useMemo(() => {
    const total = transactions.length;
    const completed = transactions.filter(tx => tx.status === 'completed').length;
    const failed = transactions.filter(tx => tx.status === 'failed' || tx.status === 'cancelled').length;
    const pending = transactions.filter(tx => tx.status === 'pending' || tx.status === 'processing' || tx.status === 'pending_verification').length;
    return { total, completed, failed, pending };
  }, [transactions]);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "all") return true;
    if (tx.type === 'admin_credit' || tx.type === 'admin_debit') return filter === 'deposit';
    if (tx.type === 'debit' || tx.type === 'ad_purchase') return filter === 'ads';
    return tx.type === filter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / perPage);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * perPage, page * perPage);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit": case "admin_credit": return "bg-green-500/10 text-green-500 border-green-500/30";
      case "withdrawal": case "admin_debit": return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "commission": return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "subscription": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "debit": case "ad_purchase": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      default: return "bg-muted text-muted-foreground";
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
      case "ad_purchase": case "debit": return "Ads";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit": case "admin_credit": return <ArrowDownRight className="w-4 h-4" />;
      case "withdrawal": case "admin_debit": return <ArrowUpRight className="w-4 h-4" />;
      case "subscription": return <Crown className="w-4 h-4" />;
      case "commission": return <DollarSign className="w-4 h-4" />;
      case "debit": case "ad_purchase": return <Megaphone className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusIndicatorColor = (status: string | null) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "failed": return "bg-red-500";
      default: return "bg-green-500";
    }
  };

  // Timeline-style mobile card
  const TransactionCard = ({ tx }: { tx: Transaction }) => (
    <div className="relative flex gap-3 pl-4">
      {/* Timeline indicator line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full">
        <div className={cn("w-full h-full rounded-full", getStatusIndicatorColor(tx.status))} />
      </div>
      <div className="flex-1 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn(
              "p-2 rounded-xl shrink-0 shadow-sm",
              tx.amount >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-destructive"
            )}>
              {getTypeIcon(tx.type)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{tx.description || getTypeLabel(tx.type)}</p>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <Badge variant="outline" className={cn("text-[10px] capitalize", getTypeColor(tx.type))}>
                  {getTypeLabel(tx.type)}
                </Badge>
                <Badge variant="outline" className={cn("text-[10px] capitalize", getStatusColor(tx.status))}>
                  {tx.status || 'completed'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {tx.payment_method && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{tx.payment_method.replace('_', ' ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <p className={cn(
            "text-sm sm:text-lg font-bold font-mono shrink-0",
            tx.amount >= 0 ? "text-green-500" : "text-destructive"
          )}>
            {tx.amount >= 0 ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );

  // Shimmer loading state
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-card/50">
            <Skeleton themed className="h-4 w-16 mb-2" />
            <Skeleton themed className="h-7 w-24" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 pl-4">
            <Skeleton themed className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton themed className="h-4 w-40" />
              <Skeleton themed className="h-3 w-28" />
            </div>
            <Skeleton themed className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-0 shadow-lg shadow-primary/5 w-full max-w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Transaction History
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={fetchTransactions} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>

          {/* Summary Stats */}
          {!loading && transactions.length > 0 && (
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Receipt className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] text-primary font-medium uppercase tracking-wider">Total</span>
                </div>
                <p className="text-lg font-bold text-primary font-mono">{summary.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-medium uppercase tracking-wider">Completed</span>
                </div>
                <p className="text-lg font-bold text-green-500 font-mono">{summary.completed}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-medium uppercase tracking-wider">Failed</span>
                </div>
                <p className="text-lg font-bold text-destructive font-mono">{summary.failed}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {[
              { value: 'all', label: 'All', dotColor: '' },
              { value: 'deposit', label: 'Deposits', dotColor: 'bg-green-500' },
              { value: 'subscription', label: 'Subs', dotColor: 'bg-blue-500' },
              { value: 'commission', label: 'Commission', dotColor: 'bg-purple-500' },
              { value: 'ads', label: 'Ads', dotColor: 'bg-amber-500' },
            ].map((tab) => (
              <Button
                key={tab.value}
                variant={filter === tab.value ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-7 text-xs rounded-full px-3 gap-1.5",
                  filter === tab.value ? "shadow-sm" : "bg-background/60"
                )}
                onClick={() => { setFilter(tab.value as typeof filter); setPage(1); }}
              >
                {tab.dotColor && (
                  <span className={cn("w-2 h-2 rounded-full", tab.dotColor)} />
                )}
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : paginatedTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/30 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">No transactions found</p>
            <p className="text-xs text-muted-foreground mt-1">Transactions will appear here once processed</p>
          </div>
        ) : (
          <>
            {/* Mobile Timeline View */}
            <div className="block md:hidden space-y-1 divide-y divide-border/30">
              {paginatedTransactions.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/30">
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((tx, idx) => (
                    <TableRow 
                      key={tx.id} 
                      className={cn(
                        "group transition-colors border-b border-border/20",
                        idx % 2 === 0 ? "bg-transparent" : "bg-muted/10",
                        "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent"
                      )}
                    >
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
                          "font-mono font-bold"
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
