import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  User, 
  AlertTriangle, 
  Banknote,
  CreditCard,
  RefreshCw,
  Copy,
  Search,
  ExternalLink,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Transaction {
  id: string;
  amount: number;
  amount_usd?: number | null;
  currency?: string | null;
  payment_method: string;
  created_at: string;
  buyer_id: string | null;
  user_id: string | null;
  status: string;
  type: string;
  buyer_name?: string;
  buyer_email?: string;
  is_manual?: boolean;
}

interface TransactionKanbanProps {
  panelId: string;
}

export const TransactionKanban = ({ panelId }: TransactionKanbanProps) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; tx: Transaction | null; action: 'approve' | 'reject' | 'mark_completed' | 'mark_failed' }>({
    open: false,
    tx: null,
    action: 'approve'
  });

  useEffect(() => {
    fetchTransactions();
    
    const channel = supabase
      .channel(`panel-kanban-transactions-${panelId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [panelId]);

  const fetchTransactions = async () => {
    try {
      const { data: panelBuyers, error: buyerError } = await supabase
        .from('client_users')
        .select('id, full_name, email')
        .eq('panel_id', panelId);

      if (buyerError) throw buyerError;

      const buyerMap: Record<string, { full_name: string; email: string }> = {};
      const panelBuyerIds = (panelBuyers || []).map(b => {
        buyerMap[b.id] = { full_name: b.full_name || '', email: b.email };
        return b.id;
      });

      if (panelBuyerIds.length === 0) {
        setTransactions([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .or(`buyer_id.in.(${panelBuyerIds.join(',')}),user_id.in.(${panelBuyerIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (txError) throw txError;

      const panelTransactions = (txData || []).map(tx => ({
        ...tx,
        buyer_name: buyerMap[tx.buyer_id || tx.user_id || '']?.full_name,
        buyer_email: buyerMap[tx.buyer_id || tx.user_id || '']?.email,
        is_manual: tx.payment_method?.toLowerCase().includes('manual') || 
                   tx.payment_method?.toLowerCase().includes('bank') ||
                   tx.payment_method?.toLowerCase().includes('transfer')
      }));

      setTransactions(panelTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const handleAction = async (action: 'approve' | 'reject' | 'mark_completed' | 'mark_failed') => {
    const tx = confirmDialog.tx;
    if (!tx) return;

    setProcessing(tx.id);
    setConfirmDialog({ open: false, tx: null, action: 'approve' });

    try {
      const newStatus = (action === 'approve' || action === 'mark_completed') ? 'completed' : 'failed';
      
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', tx.id);

      if (updateError) throw updateError;

      if ((action === 'approve' || action === 'mark_completed') && (tx.buyer_id || tx.user_id)) {
        const buyerId = tx.buyer_id || tx.user_id;
        
        const { data: buyer, error: fetchError } = await supabase
          .from('client_users')
          .select('balance')
          .eq('id', buyerId)
          .single();

        if (fetchError) throw fetchError;

        // Credit USD amount (balance is always in USD)
        const creditAmount = (tx.currency && tx.currency !== 'USD' && tx.amount_usd) 
          ? Number(tx.amount_usd) 
          : tx.amount;
        const newBalance = (buyer?.balance || 0) + creditAmount;

        const { error: balanceError } = await supabase
          .from('client_users')
          .update({ balance: newBalance })
          .eq('id', buyerId);

        if (balanceError) throw balanceError;
      }

      const actionLabels = {
        approve: 'Payment Approved',
        reject: 'Payment Rejected',
        mark_completed: 'Marked as Completed',
        mark_failed: 'Marked as Failed'
      };

      toast({
        title: actionLabels[action],
        description: (action === 'approve' || action === 'mark_completed')
          ? `$${((tx.currency && tx.currency !== 'USD' && tx.amount_usd) ? Number(tx.amount_usd) : tx.amount).toFixed(2)} has been credited to ${tx.buyer_name || tx.buyer_email}'s account.${tx.currency && tx.currency !== 'USD' ? ` (Paid: ${tx.currency} ${tx.amount.toFixed(2)})` : ''}`
          : 'The transaction has been marked as failed.'
      });

      fetchTransactions();
    } catch (error) {
      console.error('Error processing transaction:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process the transaction. Please try again.'
      });
    } finally {
      setProcessing(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.id.toLowerCase().includes(query) ||
      tx.buyer_name?.toLowerCase().includes(query) ||
      tx.buyer_email?.toLowerCase().includes(query) ||
      tx.amount.toString().includes(query) ||
      tx.payment_method?.toLowerCase().includes(query)
    );
  });

  // Group transactions by status for Kanban
  const pendingTx = filteredTransactions.filter(tx => tx.status === 'pending' || tx.status === 'pending_verification');
  const completedTx = filteredTransactions.filter(tx => tx.status === 'completed').slice(0, 10);
  const failedTx = filteredTransactions.filter(tx => tx.status === 'failed').slice(0, 10);

  // Calculate stats
  const totalDeposits = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = pendingTx.length;
  const pendingAmount = pendingTx.reduce((sum, t) => sum + t.amount, 0);

  const TransactionCard = ({ tx, showActions = false }: { tx: Transaction; showActions?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "p-3 rounded-lg border bg-card transition-all hover:shadow-md",
        tx.status === 'pending' && "border-amber-500/30 bg-amber-500/5",
        tx.status === 'completed' && "border-emerald-500/20",
        tx.status === 'failed' && "border-red-500/20"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-bold text-lg">
              {tx.currency && tx.currency !== 'USD' 
                ? `${tx.currency} ${tx.amount.toFixed(2)}`
                : `$${tx.amount.toFixed(2)}`
              }
            </span>
            {tx.currency && tx.currency !== 'USD' && tx.amount_usd && (
              <span className="text-[10px] text-muted-foreground">≈ ${Number(tx.amount_usd).toFixed(2)} USD</span>
            )}
          </div>
          {tx.is_manual && (
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <Banknote className="w-3 h-3 mr-1" />
              Manual
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <User className="w-3 h-3" />
        <span className="truncate">{tx.buyer_name || tx.buyer_email || 'Unknown'}</span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <button 
          onClick={() => copyToClipboard(tx.id)}
          className="font-mono hover:text-primary flex items-center gap-1"
        >
          {tx.id.substring(0, 6).toUpperCase()}
          <Copy className="w-3 h-3" />
        </button>
        <span>{format(new Date(tx.created_at), 'MMM dd, HH:mm')}</span>
      </div>

      {showActions && tx.status === 'pending' && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            disabled={processing === tx.id}
            onClick={() => setConfirmDialog({ open: true, tx, action: 'reject' })}
          >
            {processing === tx.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />}
            Reject
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={processing === tx.id}
            onClick={() => setConfirmDialog({ open: true, tx, action: 'approve' })}
          >
            {processing === tx.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
            Approve
          </Button>
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Combined Stats Banner */}
      <Card className="bg-gradient-to-r from-card via-card to-primary/5 border-border/50 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Completed</p>
                  <p className="text-2xl font-bold text-emerald-500">${totalDeposits.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="h-12 w-px bg-border hidden md:block" />
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {pendingCount} <span className="text-sm font-normal">(${pendingAmount.toFixed(2)})</span>
                  </p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Search by user, amount, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold">Pending Approval</h3>
            <Badge variant="secondary" className="ml-auto bg-amber-500/10 text-amber-600">
              {pendingTx.length}
            </Badge>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-1">
              <AnimatePresence>
                {pendingTx.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No pending transactions
                  </div>
                ) : (
                  pendingTx.map(tx => (
                    <TransactionCard key={tx.id} tx={tx} showActions />
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Completed Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold">Recently Completed</h3>
            <Badge variant="secondary" className="ml-auto bg-emerald-500/10 text-emerald-600">
              {completedTx.length}
            </Badge>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-1">
              <AnimatePresence>
                {completedTx.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No completed transactions
                  </div>
                ) : (
                  completedTx.map(tx => (
                    <TransactionCard key={tx.id} tx={tx} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Failed Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <h3 className="font-semibold">Failed / Rejected</h3>
            <Badge variant="secondary" className="ml-auto bg-red-500/10 text-red-600">
              {failedTx.length}
            </Badge>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-1">
              <AnimatePresence>
                {failedTx.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No failed transactions
                  </div>
                ) : (
                  failedTx.map(tx => (
                    <TransactionCard key={tx.id} tx={tx} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, tx: null, action: 'approve' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(confirmDialog.action === 'approve' || confirmDialog.action === 'mark_completed') ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              {confirmDialog.action === 'approve' && 'Approve Payment'}
              {confirmDialog.action === 'reject' && 'Reject Payment'}
              {confirmDialog.action === 'mark_completed' && 'Mark as Completed'}
              {confirmDialog.action === 'mark_failed' && 'Mark as Failed'}
            </DialogTitle>
            <DialogDescription className="space-y-2">
              {(confirmDialog.action === 'approve' || confirmDialog.action === 'mark_completed') ? (
                <>
                  <p>This will credit <strong>{confirmDialog.tx?.currency && confirmDialog.tx.currency !== 'USD' ? `${confirmDialog.tx.currency} ${confirmDialog.tx.amount.toFixed(2)} (≈ $${Number(confirmDialog.tx.amount_usd || confirmDialog.tx.amount).toFixed(2)} USD)` : `$${confirmDialog.tx?.amount.toFixed(2)}`}</strong> to <strong>{confirmDialog.tx?.buyer_name || confirmDialog.tx?.buyer_email}</strong>'s balance.</p>
                  <p className="text-amber-600">This action cannot be undone.</p>
                </>
              ) : (
                <>
                  <p>This will mark the transaction as failed. The buyer will not be credited.</p>
                  <p className="text-red-600">Are you sure you want to proceed?</p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, tx: null, action: 'approve' })}>
              Cancel
            </Button>
            <Button 
              variant={(confirmDialog.action === 'approve' || confirmDialog.action === 'mark_completed') ? 'default' : 'destructive'}
              onClick={() => handleAction(confirmDialog.action)}
            >
              {confirmDialog.action === 'approve' && 'Approve Payment'}
              {confirmDialog.action === 'reject' && 'Reject Payment'}
              {confirmDialog.action === 'mark_completed' && 'Mark Completed'}
              {confirmDialog.action === 'mark_failed' && 'Mark Failed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionKanban;
