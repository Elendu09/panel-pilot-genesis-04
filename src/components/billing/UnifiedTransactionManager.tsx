import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Filter,
  RefreshCw,
  Copy,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  amount: number;
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

interface UnifiedTransactionManagerProps {
  panelId: string;
}

export const UnifiedTransactionManager = ({ panelId }: UnifiedTransactionManagerProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; tx: Transaction | null; action: 'approve' | 'reject' }>({
    open: false,
    tx: null,
    action: 'approve'
  });

  useEffect(() => {
    fetchTransactions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`panel-unified-transactions-${panelId}`)
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
      // First, get all buyers for THIS panel only
      const { data: panelBuyers, error: buyerError } = await supabase
        .from('client_users')
        .select('id, full_name, email')
        .eq('panel_id', panelId);

      if (buyerError) throw buyerError;

      // Create a lookup map of panel buyers
      const buyerMap: Record<string, { full_name: string; email: string }> = {};
      const panelBuyerIds = (panelBuyers || []).map(b => {
        buyerMap[b.id] = { full_name: b.full_name || '', email: b.email };
        return b.id;
      });

      // If no buyers for this panel, return empty
      if (panelBuyerIds.length === 0) {
        setTransactions([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch transactions only for this panel's buyers
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .or(`buyer_id.in.(${panelBuyerIds.join(',')}),user_id.in.(${panelBuyerIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (txError) throw txError;

      // Enrich transactions with user data
      const panelTransactions = (txData || []).map(tx => ({
        ...tx,
        buyer_name: buyerMap[tx.buyer_id || tx.user_id || '']?.full_name,
        buyer_email: buyerMap[tx.buyer_id || tx.user_id || '']?.email,
        is_manual: tx.payment_method?.toLowerCase().includes('manual') || 
                   tx.payment_method?.toLowerCase().includes('bank') ||
                   tx.payment_method?.toLowerCase().includes('transfer')
      }));

      // Sort: pending first, then manual methods, then by date
      panelTransactions.sort((a, b) => {
        // Pending always first
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        // Then manual methods
        if (a.is_manual && !b.is_manual) return -1;
        if (b.is_manual && !a.is_manual) return 1;
        // Then by date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

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

  const handleAction = async (action: 'approve' | 'reject') => {
    const tx = confirmDialog.tx;
    if (!tx) return;

    setProcessing(tx.id);
    setConfirmDialog({ open: false, tx: null, action: 'approve' });

    try {
      const newStatus = action === 'approve' ? 'completed' : 'failed';
      
      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', tx.id);

      if (updateError) throw updateError;

      // If approved, update buyer balance
      if (action === 'approve' && (tx.buyer_id || tx.user_id)) {
        const buyerId = tx.buyer_id || tx.user_id;
        
        // Get current balance
        const { data: buyer, error: fetchError } = await supabase
          .from('client_users')
          .select('balance')
          .eq('id', buyerId)
          .single();

        if (fetchError) throw fetchError;

        const newBalance = (buyer?.balance || 0) + tx.amount;

        // Update balance
        const { error: balanceError } = await supabase
          .from('client_users')
          .update({ balance: newBalance })
          .eq('id', buyerId);

        if (balanceError) throw balanceError;
      }

      toast({
        title: action === 'approve' ? 'Payment Approved' : 'Payment Rejected',
        description: action === 'approve' 
          ? `$${tx.amount.toFixed(2)} has been credited to ${tx.buyer_name || tx.buyer_email}'s account.`
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

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending');
  
  // Filter transactions based on search query
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

  const filteredPending = filteredTransactions.filter(tx => tx.status === 'pending');
  const displayTransactions = activeTab === 'pending' ? filteredPending : filteredTransactions;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string, isManual: boolean) => {
    if (isManual) {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          <Banknote className="w-3 h-3 mr-1" />
          {method || 'Bank Transfer'}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
        <CreditCard className="w-3 h-3 mr-1" />
        {method || 'Payment'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Deposit Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Deposit Management
              {pendingTransactions.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingTransactions.length} Pending
                </Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Analytics Summary Cards */}
          {(() => {
            const totalDeposits = transactions
              .filter(t => t.status === 'completed')
              .reduce((sum, t) => sum + t.amount, 0);
            
            const pendingCount = transactions.filter(t => 
              t.status === 'pending' || t.status === 'pending_verification'
            ).length;
            
            const manualPending = transactions.filter(t => 
              (t.status === 'pending' || t.status === 'pending_verification') && 
              t.is_manual
            ).length;
            
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                  <p className="text-xs text-muted-foreground">Total Deposits</p>
                  <p className="text-lg font-bold text-emerald-500">${totalDeposits.toFixed(2)}</p>
                </div>
                <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold text-amber-500">{pendingCount}</p>
                </div>
                <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                  <p className="text-xs text-muted-foreground">Manual Awaiting</p>
                  <p className="text-lg font-bold text-orange-500">{manualPending}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <p className="text-xs text-muted-foreground">Total Transactions</p>
                  <p className="text-lg font-bold">{transactions.length}</p>
                </div>
              </div>
            );
          })()}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search by user, amount, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'all')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="w-4 h-4" />
                Pending ({filteredPending.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <Filter className="w-4 h-4" />
                All Deposits ({filteredTransactions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {displayTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>{activeTab === 'pending' ? 'No pending transfers to review' : 'No transactions found'}</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {displayTransactions.map(tx => (
                      <div 
                        key={tx.id} 
                        className={cn(
                          "flex flex-col p-4 rounded-lg border bg-card gap-3",
                          tx.status === 'pending' && "border-amber-500/30 bg-amber-500/5"
                        )}
                      >
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                              tx.status === 'completed' && "bg-green-500/10",
                              tx.status === 'pending' && "bg-amber-500/10",
                              tx.status === 'failed' && "bg-red-500/10"
                            )}>
                              {tx.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : tx.status === 'pending' ? (
                                <Clock className="w-5 h-5 text-amber-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-lg">${tx.amount.toFixed(2)}</span>
                                {getStatusBadge(tx.status)}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {getMethodBadge(tx.payment_method, tx.is_manual || false)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Info Row */}
                        <div className="flex items-center gap-2 pl-13 text-sm text-muted-foreground border-t border-border/50 pt-3">
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">{tx.buyer_name || 'Unknown'}</span>
                          <span>•</span>
                          <span className="truncate">{tx.buyer_email}</span>
                        </div>

                        {/* Details Row */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => copyToClipboard(tx.id)}
                              className="font-mono hover:text-primary flex items-center gap-1 transition-colors"
                              title="Copy Transaction ID"
                            >
                              ID: {tx.id.substring(0, 8).toUpperCase()}
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <span>{format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        </div>

                        {/* Action Buttons for Pending */}
                        {tx.status === 'pending' && (
                          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                              disabled={processing === tx.id}
                              onClick={() => setConfirmDialog({ open: true, tx, action: 'reject' })}
                            >
                              {processing === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              disabled={processing === tx.id}
                              onClick={() => setConfirmDialog({ open: true, tx, action: 'approve' })}
                            >
                              {processing === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, tx: null, action: 'approve' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.action === 'approve' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              {confirmDialog.action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </DialogTitle>
            <DialogDescription className="space-y-2">
              {confirmDialog.action === 'approve' ? (
                <>
                  <p>This will credit <strong>${confirmDialog.tx?.amount.toFixed(2)}</strong> to <strong>{confirmDialog.tx?.buyer_name || confirmDialog.tx?.buyer_email}</strong>'s balance.</p>
                  <p className="text-amber-600">This action cannot be undone.</p>
                </>
              ) : (
                <>
                  <p>This will mark the transaction as failed. The buyer will not be credited.</p>
                  <p className="text-red-600">Are you sure you want to reject this payment?</p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, tx: null, action: 'approve' })}>
              Cancel
            </Button>
            <Button 
              variant={confirmDialog.action === 'approve' ? 'default' : 'destructive'}
              onClick={() => handleAction(confirmDialog.action)}
            >
              {confirmDialog.action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UnifiedTransactionManager;