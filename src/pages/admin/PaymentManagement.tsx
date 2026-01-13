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
import { DollarSign, CreditCard, Landmark, Coins, Save, CheckCircle2, Search, Filter, Loader2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionProviderManager } from "@/components/admin/SubscriptionProviderManager";
import { ResponsiveTabs } from "@/components/admin/ResponsiveTabs";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Platform settings from DB
  const [platformCommission, setPlatformCommission] = useState(5);
  const [gatewayFee, setGatewayFee] = useState(2.9);
  const [fixedFee, setFixedFee] = useState(0.30);
  const [minPayout, setMinPayout] = useState(25);
  const [payoutSchedule, setPayoutSchedule] = useState("weekly");
  
  // Gateway configurations with credentials
  const [gatewayConfigs, setGatewayConfigs] = useState<Record<string, { enabled: boolean; publicKey: string; secretKey: string; testMode: boolean }>>({
    stripe: { enabled: false, publicKey: '', secretKey: '', testMode: true },
    paypal: { enabled: false, publicKey: '', secretKey: '', testMode: true },
    crypto: { enabled: false, publicKey: '', secretKey: '', testMode: false },
  });

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (txData) setTransactions(txData);

      // Fetch platform fees
      const { data: feeData } = await supabase
        .from('platform_fees')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (feeData) setPlatformFees(feeData);

      // Fetch platform settings
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
          if (s.setting_key === 'gateway_configs' && typeof val === 'object') {
            setGatewayConfigs(prev => ({ ...prev, ...(val as any) }));
          }
        });
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        { setting_key: 'gateway_configs', setting_value: gatewayConfigs, category: 'payments' },
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
  
  const updateGatewayConfig = (gateway: string, field: string, value: any) => {
    setGatewayConfigs(prev => ({
      ...prev,
      [gateway]: { ...prev[gateway], [field]: value }
    }));
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
          { value: "subscription-providers", label: "Subscription Providers", icon: CreditCard },
          { value: "gateways", label: "Gateways", icon: Landmark },
          { value: "methods", label: "Methods", icon: Coins },
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

        <TabsContent value="gateways" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { id: 'stripe', name: 'Stripe', icon: CreditCard, description: 'Accept cards, Apple Pay, Google Pay' },
              { id: 'paypal', name: 'PayPal', icon: DollarSign, description: 'Global payments with PayPal' },
              { id: 'crypto', name: 'Coinbase Commerce', icon: Coins, description: 'Accept BTC, ETH, USDT' }
            ].map((gw) => (
              <Card key={gw.id} className="bg-gradient-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><gw.icon className="w-5 h-5" /> {gw.name}</CardTitle>
                  <CardDescription>{gw.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Enable {gw.name}</span>
                    <Switch 
                      checked={gatewayConfigs[gw.id]?.enabled || false}
                      onCheckedChange={(checked) => updateGatewayConfig(gw.id, 'enabled', checked)}
                    />
                  </label>
                  <div>
                    <Label>Public Key / API Key</Label>
                    <Input 
                      placeholder={`${gw.id}_pub_...`}
                      value={gatewayConfigs[gw.id]?.publicKey || ''}
                      onChange={(e) => updateGatewayConfig(gw.id, 'publicKey', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Secret Key</Label>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      value={gatewayConfigs[gw.id]?.secretKey || ''}
                      onChange={(e) => updateGatewayConfig(gw.id, 'secretKey', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Stored securely for subscription payments</p>
                  </div>
                  <label className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Test mode (sandbox)</span>
                    <Switch 
                      checked={gatewayConfigs[gw.id]?.testMode ?? true}
                      onCheckedChange={(checked) => updateGatewayConfig(gw.id, 'testMode', checked)}
                    />
                  </label>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-muted/30 border-primary/20">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Important:</strong> These gateway configurations are used for platform subscription payments. 
                Panel owners can configure their own gateways for buyer deposits.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader className="gap-3">
              <CardTitle className="flex items-center justify-between">
                <span>Global Payment Methods</span>
                <Badge variant="secondary" className="ml-2">{enabled.size} enabled</Badge>
              </CardTitle>
              <CardDescription>Toggle up to 120+ global methods. Enabled methods can be used by panels if Expose to Panels is on.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search payment methods..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-52">
                  <Select value={catFilter} onValueChange={(v) => setCatFilter(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem value="card">Cards</SelectItem>
                      <SelectItem value="wallet">Wallets</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={enableAll}>Enable all</Button>
                  <Button variant="outline" onClick={disableAll}>Disable all</Button>
                </div>
              </div>

              <label className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Expose to Panels</div>
                    <div className="text-xs text-muted-foreground">When enabled, panels can add these methods in their Payment Methods.</div>
                  </div>
                </div>
                <Switch checked={exposeToPanels} onCheckedChange={setExposeToPanels} />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-3 rounded-lg border bg-card/50 ${enabled.has(m.id) ? 'ring-1 ring-primary/40' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center text-primary font-semibold">
                        {m.name.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{m.category}</div>
                      </div>
                    </div>
                    <Switch checked={enabled.has(m.id)} onCheckedChange={() => toggleOne(m.id)} />
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">Showing {filtered.length} of {ALL_METHODS.length}+ methods</p>
            </CardContent>
          </Card>
        </TabsContent>

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
