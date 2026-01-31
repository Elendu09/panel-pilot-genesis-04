import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, Wallet, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/analytics-utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface DepositStatusBannerProps {
  panelId: string;
}

interface DepositStats {
  completedCount: number;
  completedAmount: number;
  pendingCount: number;
  pendingAmount: number;
  failedCount: number;
  failedAmount: number;
  totalCount: number;
  totalAmount: number;
}

export function DepositStatusBanner({ panelId }: DepositStatusBannerProps) {
  const [stats, setStats] = useState<DepositStats>({
    completedCount: 0,
    completedAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    failedCount: 0,
    failedAmount: 0,
    totalCount: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!panelId) return;
    
    try {
      // First get buyers for this panel (tenant-specific filtering)
      const { data: panelBuyers, error: buyersError } = await supabase
        .from('client_users')
        .select('id')
        .eq('panel_id', panelId);

      if (buyersError) throw buyersError;

      const buyerIds = panelBuyers?.map(b => b.id) || [];
      
      if (buyerIds.length === 0) {
        // No buyers = no deposits for this panel
        setStats({
          completedCount: 0,
          completedAmount: 0,
          pendingCount: 0,
          pendingAmount: 0,
          failedCount: 0,
          failedAmount: 0,
          totalCount: 0,
          totalAmount: 0,
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch deposits only for this panel's buyers (tenant-specific)
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, status, type, buyer_id')
        .eq('type', 'deposit')
        .in('buyer_id', buyerIds);

      if (error) throw error;

      const deposits = transactions || [];
      const completed = deposits.filter(t => t.status === 'completed');
      const pending = deposits.filter(t => t.status === 'pending');
      const failed = deposits.filter(t => t.status === 'failed');

      setStats({
        completedCount: completed.length,
        completedAmount: completed.reduce((acc, t) => acc + (t.amount || 0), 0),
        pendingCount: pending.length,
        pendingAmount: pending.reduce((acc, t) => acc + (t.amount || 0), 0),
        failedCount: failed.length,
        failedAmount: failed.reduce((acc, t) => acc + (t.amount || 0), 0),
        totalCount: deposits.length,
        totalAmount: deposits.reduce((acc, t) => acc + (t.amount || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching deposit stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [panelId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  useEffect(() => {
    fetchStats();

    // Real-time subscription for deposit updates AND balance changes
    const channel = supabase
      .channel('deposit-status-banner')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
      }, () => {
        fetchStats();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'client_users',
      }, () => {
        // Refetch when customer balances are updated (e.g., via Customer Management)
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [panelId, fetchStats]);

  const statusCards = [
    {
      label: 'Completed',
      count: stats.completedCount,
      amount: stats.completedAmount,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    },
    {
      label: 'Pending',
      count: stats.pendingCount,
      amount: stats.pendingAmount,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    {
      label: 'Failed',
      count: stats.failedCount,
      amount: stats.failedAmount,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      label: 'Total',
      count: stats.totalCount,
      amount: stats.totalAmount,
      icon: Wallet,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
    },
  ];

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-card via-card/95 to-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading deposit stats...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-card via-card/95 to-card border-border/50 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Deposit Analytics</h3>
              <p className="text-xs text-muted-foreground">Real-time tenant deposit tracking</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statusCards.map((card) => {
            const Icon = card.icon;
            const percent = stats.totalAmount > 0 
              ? ((card.amount / stats.totalAmount) * 100).toFixed(0) 
              : '0';

            return (
              <div
                key={card.label}
                className={cn(
                  "rounded-xl border p-3 transition-all hover:shadow-md hover:-translate-y-0.5",
                  card.bgColor,
                  card.borderColor
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("w-4 h-4", card.color)} />
                  <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                </div>
                <p className={cn("text-lg md:text-xl font-bold tabular-nums", card.color)}>
                  {formatCurrency(card.amount)}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">
                    {card.count} transactions
                  </span>
                  {card.label !== 'Total' && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-[10px] px-1.5 py-0", card.color, card.borderColor)}
                    >
                      {percent}%
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
