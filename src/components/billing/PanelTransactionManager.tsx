import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, XCircle, Loader2, DollarSign, User, AlertTriangle, Banknote } from 'lucide-react';
import { format } from 'date-fns';

interface PendingTransaction {
  id: string;
  amount: number;
  payment_method: string;
  created_at: string;
  buyer_id: string | null;
  user_id: string | null;
  status: string;
  buyer_name?: string;
  buyer_email?: string;
}

interface PanelTransactionManagerProps {
  panelId: string;
}

export const PanelTransactionManager = ({ panelId }: PanelTransactionManagerProps) => {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; tx: PendingTransaction | null; action: 'approve' | 'reject' }>({
    open: false,
    tx: null,
    action: 'approve'
  });

  useEffect(() => {
    fetchPendingTransactions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`panel-transactions-${panelId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, () => {
        fetchPendingTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [panelId]);

  const fetchPendingTransactions = async () => {
    try {
      // Fetch pending manual transfer transactions for this panel's buyers
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (txError) throw txError;

      // Get buyer details for each transaction
      const buyerIds = [...new Set((txData || []).map(tx => tx.buyer_id || tx.user_id).filter(Boolean))];
      
      let buyerMap: Record<string, { full_name: string; email: string }> = {};
      if (buyerIds.length > 0) {
        const { data: buyers } = await supabase
          .from('client_users')
          .select('id, full_name, email')
          .eq('panel_id', panelId)
          .in('id', buyerIds);
        
        (buyers || []).forEach(b => {
          buyerMap[b.id] = { full_name: b.full_name || '', email: b.email };
        });
      }

      // Filter transactions that belong to this panel's buyers and map buyer names
      const panelTransactions = (txData || [])
        .filter(tx => {
          const buyerId = tx.buyer_id || tx.user_id;
          return buyerId && buyerMap[buyerId];
        })
        .map(tx => ({
          ...tx,
          buyer_name: buyerMap[tx.buyer_id || tx.user_id || '']?.full_name,
          buyer_email: buyerMap[tx.buyer_id || tx.user_id || '']?.email
        }));

      setTransactions(panelTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
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
          ? `$${tx.amount.toFixed(2)} has been credited to the buyer's account.`
          : 'The transaction has been marked as failed.'
      });

      fetchPendingTransactions();
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Pending Transfers
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

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Pending Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No pending transfers to review</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Pending Transfers
            <Badge variant="secondary" className="ml-2">{transactions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactions.map(tx => (
            <div 
              key={tx.id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">${tx.amount.toFixed(2)}</span>
                    <Badge variant="outline" className="text-xs">{tx.payment_method || 'Manual Transfer'}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{tx.buyer_name || tx.buyer_email || 'Unknown Buyer'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">
                    ID: {tx.id.substring(0, 8)}...
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  disabled={processing === tx.id}
                  onClick={() => setConfirmDialog({ open: true, tx, action: 'reject' })}
                >
                  {processing === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={processing === tx.id}
                  onClick={() => setConfirmDialog({ open: true, tx, action: 'approve' })}
                >
                  {processing === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                  Approve
                </Button>
              </div>
            </div>
          ))}
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
            <DialogDescription>
              {confirmDialog.action === 'approve' ? (
                <>
                  This will credit <strong>${confirmDialog.tx?.amount.toFixed(2)}</strong> to the buyer's balance. 
                  This action cannot be undone.
                </>
              ) : (
                <>
                  This will mark the transaction as failed. The buyer will not be credited. 
                  Are you sure?
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
              {confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PanelTransactionManager;
