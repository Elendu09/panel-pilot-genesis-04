import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, CreditCard, Landmark, Coins, Save, CheckCircle2, Search, Filter, Loader2, XCircle, Clock, ArrowUpRight, ArrowDownRight, Wallet, Download, Eye, Plus, Building2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionProviderManager } from "@/components/admin/SubscriptionProviderManager";
import { ResponsiveTabs } from "@/components/admin/ResponsiveTabs";
import { TransactionDetailModal } from "@/components/admin/TransactionDetailModal";

// Payment method types
type Method = {
  id: string;
  name: string;
  category: "card" | "wallet" | "bank" | "crypto" | "local";
  region?: string;
};

const baseMethods = [
  "Stripe Card","PayPal","Skrill","Neteller","Payoneer","Wise","Revolut","Authorize.Net","2Checkout","Checkout.com","BlueSnap","PayU","Mollie","Klarna","iDEAL","Bancontact","Giropay","Sofort","Przelewy24","SEPA","Interac","ACH","Wire","MercadoPago","Boleto","Pix","Paystack","Flutterwave","Fawry","YooMoney","Qiwi","Paysera","Paysafe","Payone","Alipay","WeChat Pay","UnionPay","Apple Pay","Google Pay","GrabPay","GoPay","OVO","Dana","ShopeePay","GCash","TrueMoney","M-Pesa","Airtel Money","Orange Money","MTN MoMo","Tigo Pesa","Line Pay","KakaoPay","Toss","Naver Pay","N26","Coinbase Commerce","BTCPay","Crypto - BTC","Crypto - ETH","Crypto - USDT","Crypto - TRX","Crypto - BNB"
];

const categorize = (name: string): Method["category"] => {
  if (name.includes("Crypto")) return "crypto";
  if (["ACH","SEPA","Wire","Interac","Boleto","Pix"].some(k => name.includes(k))) return "bank";
  if (["Apple Pay","Google Pay","GrabPay","GoPay","OVO","Dana","ShopeePay","GCash","TrueMoney","Line Pay","KakaoPay","Toss","Naver Pay"].some(k => name.includes(k))) return "wallet";
  if (["Stripe","Authorize.Net","2Checkout","Checkout.com","BlueSnap"].some(k => name.includes(k))) return "card";
  if (["PayPal","Skrill","Neteller","Payoneer","Wise","Revolut","Mollie","Klarna","iDEAL","Bancontact","Giropay","Sofort","Przelewy24","PayU","Paystack","Flutterwave","Fawry","YooMoney","Qiwi","Paysera","Paysafe","Payone","MercadoPago","UnionPay","Alipay","WeChat"].some(k => name.includes(k))) return "local";
  return "local";
};

const ALL_METHODS: Method[] = baseMethods.map((name, idx) => ({
  id: `m-${idx}`,
  name,
  category: categorize(name),
  region: undefined,
}));

interface Transaction {
  id: string;
  type: string;
  amount: number;
  payment_method: string | null;
  status: string | null;
  created_at: string;
  description: string | null;
  panel_id: string | null;
  user_id: string | null;
  panel?: {
    id: string;
    name: string;
    subdomain: string;
    owner?: {
      email: string;
      full_name: string;
    } | null;
  } | null;
}

interface Panel {
  id: string;
  name: string;
  balance: number | null;
}

interface PlatformFee {
  id: string;
  fee_amount: number;
  order_amount: number;
  fee_percentage: number;
  created_at: string;
  description: string | null;
}

const PaymentManagement = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin/payments` : '';
  const { toast } = useToast();

  const [enabled, setEnabled] = useState<Set<string>>(new Set());
  const [exposeToPanels, setExposeToPanels] = useState(true);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<Method["category"] | "all">("all");
  const [activeTab, setActiveTab] = useState("subscription-providers");
  
  // Real data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [platformFees, setPlatformFees] = useState<PlatformFee[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Transaction filters
  const [txTypeFilter, setTxTypeFilter] = useState<string>("all");
  const [txStatusFilter, setTxStatusFilter] = useState<string>("all");
  const [txSearchQuery, setTxSearchQuery] = useState("");
  
  // Transaction detail modal
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [txDetailOpen, setTxDetailOpen] = useState(false);
  // Panel funding dialog
  const [fundingDialogOpen, setFundingDialogOpen] = useState(false);
  const [selectedPanelId, setSelectedPanelId] = useState<string>("");
  const [fundingAmount, setFundingAmount] = useState("");
  const [fundingType, setFundingType] = useState<"credit" | "debit">("credit");
  const [fundingReason, setFundingReason] = useState("");
  const [fundingProcessing, setFundingProcessing] = useState(false);

  // Platform settings from DB
  const [platformCommission, setPlatformCommission] = useState(5);
  const [gatewayFee, setGatewayFee] = useState(2.9);
  const [fixedFee, setFixedFee] = useState(0.30);
  const [minPayout, setMinPayout] = useState(25);
  const [payoutSchedule, setPayoutSchedule] = useState("weekly");
  

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token) {
        const response = await fetch('/functions/v1/admin-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'get_transactions' }),
        });
        const result = await response.json();
        if (result.success && result.data) {
          setTransactions(result.data.transactions || []);
          setPanels(result.data.panels || []);
          setPlatformFees(result.data.platformFees || []);
        }
      }

      const { data: settings } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('category', 'payments');

      if (settings) {
        settings.forEach(s => {
          const val = s.setting_value;
          if (s.setting_key === 'platform_commission' && typeof val === 'number') setPlatformCommission(val);
          if (s.setting_key === 'gateway_fee' && typeof val === 'number') setGatewayFee(val);
          if (s.setting_key === 'fixed_fee' && typeof val === 'number') setFixedFee(val);
          if (s.setting_key === 'min_payout' && typeof val === 'number') setMinPayout(val);
          if (s.setting_key === 'payout_schedule' && typeof val === 'string') setPayoutSchedule(val);
          if (s.setting_key === 'enabled_methods' && Array.isArray(val)) setEnabled(new Set(val as string[]));
        });
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle panel funding
  const handlePanelFunding = async () => {
    if (!selectedPanelId || !fundingAmount || parseFloat(fundingAmount) <= 0) {
      toast({ variant: "destructive", title: "Please select a panel and enter a valid amount" });
      return;
    }

    setFundingProcessing(true);
    try {
      const response = await supabase.functions.invoke('admin-panel-ops', {
        body: {
          action: 'add_funds',
          panelId: selectedPanelId,
          amount: parseFloat(fundingAmount),
          type: fundingType,
          reason: fundingReason || `Admin ${fundingType} - Manual adjustment`
        }
      });

      if (response.error) throw new Error(response.error.message);

      const result = response.data;
      if (!result.success) throw new Error(result.error || 'Failed to update panel balance');

      toast({ 
        title: "Balance Updated", 
        description: `Panel balance ${fundingType === 'credit' ? 'increased' : 'decreased'} by $${fundingAmount}. New balance: $${result.newBalance?.toFixed(2)}` 
      });
      
      // Reset form and close dialog
      setFundingDialogOpen(false);
      setSelectedPanelId("");
      setFundingAmount("");
      setFundingReason("");
      
      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error('Panel funding error:', error);
      toast({ variant: "destructive", title: "Failed to update balance", description: error.message });
    } finally {
      setFundingProcessing(false);
    }
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchType = txTypeFilter === "all" || tx.type === txTypeFilter;
      const matchStatus = txStatusFilter === "all" || tx.status === txStatusFilter;
      const matchSearch = !txSearchQuery || 
        tx.id.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
        (tx.description?.toLowerCase().includes(txSearchQuery.toLowerCase()));
      return matchType && matchStatus && matchSearch;
    });
  }, [transactions, txTypeFilter, txStatusFilter, txSearchQuery]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToUpsert = [
        { setting_key: 'platform_commission', setting_value: platformCommission, category: 'payments' },
        { setting_key: 'gateway_fee', setting_value: gatewayFee, category: 'payments' },
        { setting_key: 'fixed_fee', setting_value: fixedFee, category: 'payments' },
        { setting_key: 'min_payout', setting_value: minPayout, category: 'payments' },
        { setting_key: 'payout_schedule', setting_value: payoutSchedule, category: 'payments' },
        { setting_key: 'enabled_methods', setting_value: Array.from(enabled), category: 'payments' },
      ];

      for (const setting of settingsToUpsert) {
        await supabase
          .from('platform_settings')
          .upsert(setting, { onConflict: 'setting_key' });
      }

      toast({ title: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ variant: 'destructive', title: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };
  

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_METHODS.filter(m => {
      const matchQ = !q || m.name.toLowerCase().includes(q);
      const matchCat = catFilter === "all" || m.category === catFilter;
      return matchQ && matchCat;
    });
  }, [query, catFilter]);

  const toggleOne = (id: string) => {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enableAll = () => setEnabled(new Set(ALL_METHODS.map(m => m.id)));
  const disableAll = () => setEnabled(new Set());

  // Calculate analytics
  const totalRevenue = transactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalFees = platformFees.reduce((sum, f) => sum + f.fee_amount, 0);
  
  const pendingPayouts = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'pending')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Helmet>
        <title>Payment Management | HOME OF SMM</title>
        <meta name="description" content="Configure gateways, global payment methods, fees, test mode, and payouts." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Gateways, global methods, fees and payout settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary hover:shadow-glow">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save
        </Button>
      </header>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-green-500">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">Platform Fees</span>
            </div>
            <p className="text-2xl font-bold text-primary">${totalFees.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Landmark className="w-4 h-4" />
              <span className="text-sm">Pending Payouts</span>
            </div>
            <p className="text-2xl font-bold text-amber-500">${pendingPayouts.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Coins className="w-4 h-4" />
              <span className="text-sm">Transactions</span>
            </div>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>
      </div>

      <ResponsiveTabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        tabs={[
          { value: "subscription-providers", label: "Payment Providers", icon: CreditCard },
          { value: "transactions", label: "Transactions", icon: ArrowUpRight },
          { value: "panel-funding", label: "Panel Funding", icon: Building2 },
          { value: "fees", label: "Fees", icon: DollarSign },
          { value: "payouts", label: "Payouts", icon: DollarSign },
        ]}
      >

        {/* NEW: Subscription Payment Providers Tab */}
        <TabsContent value="subscription-providers" className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Subscription Payment Providers</CardTitle>
              <CardDescription>
                Configure payment gateways for panel owner subscriptions. These providers will be available during onboarding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SubscriptionProviderManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>All Transactions</CardTitle>
                  <CardDescription>Platform-wide transaction history and management</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={fetchData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search transactions..."
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="admin_credit">Admin Credit</SelectItem>
                    <SelectItem value="admin_debit">Admin Debit</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={txStatusFilter} onValueChange={setTxStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">Completed</div>
                  <div className="text-lg font-bold text-green-500">
                    {transactions.filter(t => t.status === 'completed').length}
                  </div>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">Pending</div>
                  <div className="text-lg font-bold text-yellow-500">
                    {transactions.filter(t => t.status === 'pending').length}
                  </div>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">Failed</div>
                  <div className="text-lg font-bold text-red-500">
                    {transactions.filter(t => t.status === 'failed').length}
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">Total Volume</div>
                  <div className="text-lg font-bold text-primary">
                    ${transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Transaction Table */}
              <ScrollArea className="h-[400px]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground sticky top-0 bg-card">
                      <tr>
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">Panel</th>
                        <th className="py-3 px-2">Owner</th>
                        <th className="py-3 px-2">Type</th>
                        <th className="py-3 px-2">Amount</th>
                        <th className="py-3 px-2">Method</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.length === 0 ? (
                        <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No transactions found</td></tr>
                      ) : (
                        filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="border-t border-border hover:bg-muted/50">
                            <td className="py-3 px-2 whitespace-nowrap">
                              {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3 px-2 whitespace-nowrap">
                              {tx.panel?.name || (tx.panel_id ? tx.panel_id.slice(0, 8) + '…' : '-')}
                            </td>
                            <td className="py-3 px-2 whitespace-nowrap text-muted-foreground">
                              {tx.panel?.owner?.email || '-'}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                {tx.type === 'deposit' ? (
                                  <ArrowDownRight className="w-4 h-4 text-green-500" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                                )}
                                <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 font-medium">
                              <span className={tx.type === 'deposit' || tx.type === 'admin_credit' ? 'text-green-500' : 'text-red-500'}>
                                {tx.type === 'deposit' || tx.type === 'admin_credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3 px-2 capitalize">{tx.payment_method || '-'}</td>
                            <td className="py-3 px-2">{getStatusBadge(tx.status)}</td>
                            <td className="py-3 px-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(tx);
                                  setTxDetailOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
            </CardContent>
          </Card>
          
          {/* Transaction Detail Modal */}
          <TransactionDetailModal
            open={txDetailOpen}
            onOpenChange={setTxDetailOpen}
            transaction={selectedTransaction}
            onStatusUpdate={fetchData}
          />
        </TabsContent>

        {/* Panel Funding Tab */}
        <TabsContent value="panel-funding" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Fund Panel */}
            <Card className="bg-gradient-card border-border shadow-card lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Quick Fund Panel
                </CardTitle>
                <CardDescription>Add or remove funds from any panel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Panel</Label>
                  <Select value={selectedPanelId} onValueChange={setSelectedPanelId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a panel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {panels.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} (${(p.balance || 0).toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Operation</Label>
                  <Select value={fundingType} onValueChange={(v) => setFundingType(v as "credit" | "debit")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit (Add Funds)</SelectItem>
                      <SelectItem value="debit">Debit (Remove Funds)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Amount ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      placeholder="0.00"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Reason (Optional)</Label>
                  <Textarea
                    placeholder="e.g., Promotional credit, Refund, etc."
                    value={fundingReason}
                    onChange={(e) => setFundingReason(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handlePanelFunding}
                  disabled={fundingProcessing || !selectedPanelId || !fundingAmount}
                >
                  {fundingProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : fundingType === 'credit' ? (
                    <Plus className="w-4 h-4 mr-2" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                  )}
                  {fundingType === 'credit' ? 'Add Funds' : 'Remove Funds'}
                </Button>
              </CardContent>
            </Card>

            {/* Panel Balances */}
            <Card className="bg-gradient-card border-border shadow-card lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Panel Balances</CardTitle>
                    <CardDescription>Overview of all panel balances</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    Total: ${panels.reduce((s, p) => s + (p.balance || 0), 0).toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3">
                    {panels.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">No panels found</div>
                    ) : (
                      panels.map(panel => (
                        <div key={panel.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{panel.name}</p>
                              <p className="text-xs text-muted-foreground">ID: {panel.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-lg font-bold ${(panel.balance || 0) > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                              ${(panel.balance || 0).toFixed(2)}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedPanelId(panel.id);
                                setFundingType('credit');
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Recent Admin Operations */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Recent Admin Fund Operations</CardTitle>
              <CardDescription>Admin-initiated balance adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2">Date</th>
                      <th className="py-2">Panel</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Reason</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.filter(t => t.type === 'admin_credit' || t.type === 'admin_debit').length === 0 ? (
                      <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No admin operations yet</td></tr>
                    ) : (
                      transactions
                        .filter(t => t.type === 'admin_credit' || t.type === 'admin_debit')
                        .slice(0, 10)
                        .map((tx) => {
                          const panel = panels.find(p => p.id === tx.panel_id);
                          return (
                            <tr key={tx.id} className="border-t border-border">
                              <td className="py-3">{new Date(tx.created_at).toLocaleDateString()}</td>
                              <td className="py-3">{panel?.name || 'Unknown'}</td>
                              <td className="py-3 capitalize">{tx.type.replace('_', ' ')}</td>
                              <td className={`py-3 font-medium ${tx.type === 'admin_credit' ? 'text-green-500' : 'text-red-500'}`}>
                                {tx.type === 'admin_credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                              </td>
                              <td className="py-3 text-muted-foreground">{tx.description || '-'}</td>
                              <td className="py-3">{getStatusBadge(tx.status)}</td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Methods tab removed - use Payment Providers tab for gateway configuration */}

        <TabsContent value="fees" className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Processing & platform fees</CardTitle>
              <CardDescription>Set how fees are calculated per transaction</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Platform commission (%)</Label>
                <Input 
                  type="number" 
                  min={0} 
                  max={20} 
                  value={platformCommission}
                  onChange={(e) => setPlatformCommission(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Gateway fee (%)</Label>
                <Input 
                  type="number" 
                  min={0} 
                  max={10} 
                  step={0.1} 
                  value={gatewayFee}
                  onChange={(e) => setGatewayFee(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Fixed fee ($)</Label>
                <Input 
                  type="number" 
                  min={0} 
                  step={0.01} 
                  value={fixedFee}
                  onChange={(e) => setFixedFee(parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Fees from Database */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Recent Platform Fees</CardTitle>
              <CardDescription>Fees collected from panel transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2">Date</th>
                      <th className="py-2">Order Amount</th>
                      <th className="py-2">Fee %</th>
                      <th className="py-2">Fee Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformFees.length === 0 ? (
                      <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No fees collected yet</td></tr>
                    ) : (
                      platformFees.slice(0, 5).map((fee) => (
                        <tr key={fee.id} className="border-t border-border">
                          <td className="py-3">{new Date(fee.created_at).toLocaleDateString()}</td>
                          <td className="py-3">${fee.order_amount.toFixed(2)}</td>
                          <td className="py-3">{fee.fee_percentage}%</td>
                          <td className="py-3 font-medium text-green-500">${fee.fee_amount.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Landmark className="w-5 h-5" /> Payout configuration</CardTitle>
                <CardDescription>Thresholds and schedules</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Minimum payout ($)</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    value={minPayout}
                    onChange={(e) => setMinPayout(parseFloat(e.target.value) || 25)}
                  />
                </div>
                <div>
                  <Label>Schedule</Label>
                  <Select value={payoutSchedule} onValueChange={setPayoutSchedule}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center justify-between p-3 border rounded-lg md:col-span-2"><span>Require KYC for payouts</span><Switch defaultChecked /></label>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment operations from database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr>
                        <th className="py-2">Date</th>
                        <th className="py-2">Type</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No transactions yet</td></tr>
                      ) : (
                        transactions.slice(0, 5).map((tx) => (
                          <tr key={tx.id} className="border-t border-border">
                            <td className="py-3">{new Date(tx.created_at).toLocaleDateString()}</td>
                            <td className="py-3 capitalize">{tx.type}</td>
                            <td className="py-3">${Math.abs(tx.amount).toFixed(2)}</td>
                            <td className="py-3">{getStatusBadge(tx.status)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </ResponsiveTabs>
    </div>
  );
};

export default PaymentManagement;
