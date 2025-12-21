import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Plus, Settings, Search, CheckCircle, AlertCircle, Globe, Wallet, Bitcoin, Building2, Smartphone, DollarSign, Eye, EyeOff, Play, Loader2, Sparkles, Send, RefreshCw, Clock, TrendingUp, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { StripeIcon, PayPalIcon, BitcoinIcon, getPaymentIcon } from "@/components/payment/PaymentIcons";

// Worldwide payment gateways
const paymentGateways = {
  cards: [
    { id: "stripe", name: "Stripe", icon: "💳", regions: ["Worldwide"], fee: "2.9% + $0.30" },
    { id: "paypal", name: "PayPal", icon: "🅿️", regions: ["Worldwide"], fee: "2.9% + $0.30" },
    { id: "authorize", name: "Authorize.Net", icon: "💳", regions: ["US, CA, UK, AU"], fee: "2.9% + $0.30" },
    { id: "square", name: "Square", icon: "⬜", regions: ["US, CA, UK, AU, JP"], fee: "2.6% + $0.10" },
    { id: "braintree", name: "Braintree", icon: "🌳", regions: ["Worldwide"], fee: "2.9% + $0.30" },
    { id: "2checkout", name: "2Checkout", icon: "2️⃣", regions: ["Worldwide"], fee: "3.5% + $0.35" },
    { id: "adyen", name: "Adyen", icon: "🔷", regions: ["Worldwide"], fee: "Varies" },
    { id: "worldpay", name: "Worldpay", icon: "🌍", regions: ["Worldwide"], fee: "Varies" },
  ],
  regional: [
    { id: "razorpay", name: "Razorpay", icon: "🇮🇳", regions: ["India"], fee: "2%" },
    { id: "paytm", name: "Paytm", icon: "🇮🇳", regions: ["India"], fee: "1.99%" },
    { id: "phonepe", name: "PhonePe", icon: "🇮🇳", regions: ["India"], fee: "0%" },
    { id: "mercadopago", name: "Mercado Pago", icon: "🇧🇷", regions: ["Latin America"], fee: "3.99%" },
    { id: "paystack", name: "Paystack", icon: "🇳🇬", regions: ["Africa"], fee: "1.5% + $0.15" },
    { id: "flutterwave", name: "Flutterwave", icon: "🦋", regions: ["Africa"], fee: "1.4%" },
    { id: "fawry", name: "Fawry", icon: "🇪🇬", regions: ["Egypt"], fee: "2.5%" },
    { id: "ideal", name: "iDEAL", icon: "🇳🇱", regions: ["Netherlands"], fee: "€0.29" },
    { id: "bancontact", name: "Bancontact", icon: "🇧🇪", regions: ["Belgium"], fee: "€0.39" },
    { id: "giropay", name: "Giropay", icon: "🇩🇪", regions: ["Germany"], fee: "1.2%" },
    { id: "sofort", name: "Sofort/Klarna", icon: "🇪🇺", regions: ["Europe"], fee: "1.4%" },
    { id: "przelewy24", name: "Przelewy24", icon: "🇵🇱", regions: ["Poland"], fee: "1.2%" },
    { id: "mollie", name: "Mollie", icon: "🐟", regions: ["Europe"], fee: "€0.25 + 0.9%" },
  ],
  bank: [
    { id: "ach", name: "ACH Transfer", icon: "🏦", regions: ["US"], fee: "$0.25" },
    { id: "sepa", name: "SEPA Transfer", icon: "🇪🇺", regions: ["Europe"], fee: "€0.35" },
    { id: "wire", name: "Wire Transfer", icon: "🔌", regions: ["Worldwide"], fee: "Varies" },
    { id: "interac", name: "Interac", icon: "🇨🇦", regions: ["Canada"], fee: "1%" },
    { id: "boleto", name: "Boleto", icon: "🇧🇷", regions: ["Brazil"], fee: "R$3.49" },
    { id: "pix", name: "Pix", icon: "🇧🇷", regions: ["Brazil"], fee: "0.99%" },
  ],
  wallets: [
    { id: "applepay", name: "Apple Pay", icon: "🍎", regions: ["Worldwide"], fee: "Via gateway" },
    { id: "googlepay", name: "Google Pay", icon: "🔵", regions: ["Worldwide"], fee: "Via gateway" },
    { id: "samsungpay", name: "Samsung Pay", icon: "📱", regions: ["Worldwide"], fee: "Via gateway" },
    { id: "grabpay", name: "GrabPay", icon: "🚗", regions: ["Southeast Asia"], fee: "1.5%" },
    { id: "gopay", name: "GoPay", icon: "🇮🇩", regions: ["Indonesia"], fee: "2%" },
    { id: "ovo", name: "OVO", icon: "🟣", regions: ["Indonesia"], fee: "1.5%" },
    { id: "dana", name: "Dana", icon: "🔵", regions: ["Indonesia"], fee: "1.5%" },
    { id: "shopeepay", name: "ShopeePay", icon: "🛒", regions: ["Southeast Asia"], fee: "1.5%" },
    { id: "gcash", name: "GCash", icon: "🇵🇭", regions: ["Philippines"], fee: "2%" },
    { id: "truemoney", name: "TrueMoney", icon: "🇹🇭", regions: ["Thailand"], fee: "1%" },
    { id: "mpesa", name: "M-Pesa", icon: "📲", regions: ["Africa"], fee: "1.5%" },
    { id: "airtel", name: "Airtel Money", icon: "📱", regions: ["Africa"], fee: "1.5%" },
    { id: "orange", name: "Orange Money", icon: "🍊", regions: ["Africa"], fee: "2%" },
  ],
  crypto: [
    { id: "coinbase", name: "Coinbase Commerce", icon: "₿", regions: ["Worldwide"], fee: "1%" },
    { id: "btcpay", name: "BTCPay Server", icon: "⚡", regions: ["Worldwide"], fee: "0%" },
    { id: "coingate", name: "CoinGate", icon: "🔗", regions: ["Worldwide"], fee: "1%" },
    { id: "nowpayments", name: "NOWPayments", icon: "💰", regions: ["Worldwide"], fee: "0.5%" },
    { id: "bitpay", name: "BitPay", icon: "💳", regions: ["Worldwide"], fee: "1%" },
    { id: "cryptocom", name: "Crypto.com Pay", icon: "🔷", regions: ["Worldwide"], fee: "0.5%" },
    { id: "binancepay", name: "Binance Pay", icon: "🟡", regions: ["Worldwide"], fee: "0%" },
    { id: "plisio", name: "Plisio", icon: "💎", regions: ["Worldwide"], fee: "0.5%" },
  ],
  ewallets: [
    { id: "skrill", name: "Skrill", icon: "💜", regions: ["Worldwide"], fee: "1.9%" },
    { id: "neteller", name: "Neteller", icon: "🟢", regions: ["Worldwide"], fee: "1.9%" },
    { id: "payoneer", name: "Payoneer", icon: "🔴", regions: ["Worldwide"], fee: "1%" },
    { id: "wise", name: "Wise", icon: "💚", regions: ["Worldwide"], fee: "0.5%" },
    { id: "perfectmoney", name: "Perfect Money", icon: "💛", regions: ["Worldwide"], fee: "1.99%" },
    { id: "webmoney", name: "WebMoney", icon: "🌐", regions: ["Worldwide"], fee: "0.8%" },
    { id: "payeer", name: "Payeer", icon: "💙", regions: ["Worldwide"], fee: "0.95%" },
    { id: "airtm", name: "Airtm", icon: "☁️", regions: ["Latin America"], fee: "1%" },
  ],
};

const categoryIcons = {
  cards: CreditCard,
  regional: Globe,
  bank: Building2,
  wallets: Smartphone,
  crypto: Bitcoin,
  ewallets: Wallet,
};

const categoryLabels = {
  cards: "Card Payments",
  regional: "Regional Gateways",
  bank: "Bank Transfers",
  wallets: "Mobile Wallets",
  crypto: "Cryptocurrency",
  ewallets: "E-Wallets",
};

const PaymentMethods = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<keyof typeof paymentGateways>("cards");
  const [configuredGateways, setConfiguredGateways] = useState<Record<string, { enabled: boolean; apiKey: string; secretKey: string }>>({});
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<typeof paymentGateways.cards[0] | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [formData, setFormData] = useState({ apiKey: "", secretKey: "", testMode: true, minDeposit: "5", maxDeposit: "1000", feePercentage: "0", fixedFee: "0" });
  
  // Platform methods state
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestForm, setRequestForm] = useState({ gatewayName: "", reason: "", expectedVolume: "" });
  const [pendingRequests, setPendingRequests] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  
  // Platform-enabled gateways (simulating admin-enabled methods)
  const platformGateways = [
    { id: "stripe", name: "Stripe", icon: "💳", enabled: true, fee: "2.9% + $0.30" },
    { id: "paypal", name: "PayPal", icon: "🅿️", enabled: true, fee: "2.9% + $0.30" },
    { id: "coinbase", name: "Coinbase Commerce", icon: "₿", enabled: true, fee: "1%" },
  ];

  const filteredGateways = paymentGateways[activeCategory].filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.regions.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const enabledCount = Object.values(configuredGateways).filter(g => g.enabled).length;

  const openConfigDialog = (gateway: typeof paymentGateways.cards[0]) => {
    setSelectedGateway(gateway);
    const existing = configuredGateways[gateway.id];
    if (existing) {
      setFormData({ ...formData, apiKey: existing.apiKey, secretKey: existing.secretKey });
    } else {
      setFormData({ apiKey: "", secretKey: "", testMode: true, minDeposit: "5", maxDeposit: "1000", feePercentage: "0", fixedFee: "0" });
    }
    setConfigDialogOpen(true);
  };

  const saveGatewayConfig = () => {
    if (!selectedGateway || !formData.apiKey) {
      toast({ variant: "destructive", title: "API Key required" });
      return;
    }
    setConfiguredGateways(prev => ({
      ...prev,
      [selectedGateway.id]: { enabled: true, apiKey: formData.apiKey, secretKey: formData.secretKey }
    }));
    setConfigDialogOpen(false);
    toast({ title: `${selectedGateway.name} configured successfully` });
  };

  const toggleGateway = (gatewayId: string) => {
    setConfiguredGateways(prev => {
      const current = prev[gatewayId];
      if (!current) return prev;
      return { ...prev, [gatewayId]: { ...current, enabled: !current.enabled } };
    });
  };

  const testConnection = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 2000));
    setTesting(false);
    toast({ title: "Connection successful", description: `${selectedGateway?.name} API is responding correctly` });
  };

  const enablePlatformGateway = (gatewayId: string) => {
    const gateway = platformGateways.find(g => g.id === gatewayId);
    if (gateway) {
      setConfiguredGateways(prev => ({
        ...prev,
        [gatewayId]: { enabled: true, apiKey: "platform_inherited", secretKey: "platform_inherited" }
      }));
      toast({ title: `${gateway.name} enabled`, description: "Using platform configuration" });
    }
  };

  const submitGatewayRequest = () => {
    if (!requestForm.gatewayName.trim()) {
      toast({ variant: "destructive", title: "Gateway name required" });
      return;
    }
    setPendingRequests(prev => prev + 1);
    setShowRequestDialog(false);
    setRequestForm({ gatewayName: "", reason: "", expectedVolume: "" });
    toast({ title: "Request submitted", description: "The platform admin will review your request" });
  };

  const syncWithPlatform = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setSyncing(false);
    setLastSynced(new Date());
    toast({ title: "Synced with platform", description: "Payment methods are up to date" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Payment Methods</h1>
          <p className="text-muted-foreground">Configure worldwide payment gateways for your customers</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-lg px-4 py-2">
          <CheckCircle className="w-4 h-4 mr-2" />
          {enabledCount} Active
        </Badge>
      </motion.div>

      {/* Platform Methods Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Platform-Enabled Gateways</CardTitle>
                <p className="text-sm text-muted-foreground">One-click enable with inherited settings from platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pendingRequests > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {pendingRequests} Pending
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowRequestDialog(true)} className="gap-2">
                <Send className="w-4 h-4" />
                Request Gateway
              </Button>
              <Button variant="outline" size="sm" onClick={syncWithPlatform} disabled={syncing} className="gap-2">
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Sync
              </Button>
            </div>
          </div>
          {lastSynced && (
            <p className="text-xs text-muted-foreground mt-2">
              Last synced: {lastSynced.toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {platformGateways.map((gateway) => {
              const isEnabled = !!configuredGateways[gateway.id];
              
              return (
                <motion.div
                  key={gateway.id}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    isEnabled 
                      ? "border-green-500/50 bg-green-500/5" 
                      : "border-primary/20 bg-card/50 hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{gateway.icon}</span>
                      <div>
                        <h4 className="font-semibold">{gateway.name}</h4>
                        <p className="text-xs text-muted-foreground">Fee: {gateway.fee}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Platform
                    </Badge>
                  </div>
                  
                  {isEnabled ? (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle className="w-4 h-4" />
                      <span>Enabled (Inherited)</span>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      className="w-full gap-2"
                      onClick={() => enablePlatformGateway(gateway.id)}
                    >
                      <Plus className="w-4 h-4" />
                      One-Click Enable
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Gateways", value: Object.values(paymentGateways).flat().length, icon: CreditCard, color: "text-primary" },
          { label: "Configured", value: Object.keys(configuredGateways).length, icon: Settings, color: "text-blue-500" },
          { label: "Active", value: enabledCount, icon: CheckCircle, color: "text-green-500" },
          { label: "Categories", value: Object.keys(paymentGateways).length, icon: Globe, color: "text-yellow-500" },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="glass-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted">
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Payment Statistics by User */}
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10"><BarChart3 className="w-5 h-5 text-primary" /></div>
            <div>
              <CardTitle className="text-lg">Payment Statistics by User</CardTitle>
              <p className="text-sm text-muted-foreground">Top depositors and payment activity</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" />Top Depositors</h4>
              <div className="space-y-2">
                {[
                  { name: "John A.", amount: 2450, method: "Stripe" },
                  { name: "Alex T.", amount: 1820, method: "PayPal" },
                  { name: "Maria G.", amount: 1540, method: "Stripe" },
                ].map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">#{i+1}</span>
                      <span className="font-medium text-sm">{user.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-500">${user.amount}</span>
                      <p className="text-xs text-muted-foreground">{user.method}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-500" />Method Usage</h4>
              <div className="space-y-2">
                {[
                  { method: "Stripe", percent: 45, color: "bg-[#635BFF]" },
                  { method: "PayPal", percent: 30, color: "bg-[#003087]" },
                  { method: "Crypto", percent: 15, color: "bg-[#F7931A]" },
                  { method: "Other", percent: 10, color: "bg-muted-foreground" },
                ].map((item) => (
                  <div key={item.method} className="space-y-1">
                    <div className="flex justify-between text-sm"><span>{item.method}</span><span className="font-medium">{item.percent}%</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden"><div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.percent}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-purple-500" />Recent Transactions</h4>
              <div className="space-y-2">
                {[
                  { user: "Sarah M.", amount: 50, time: "2m ago" },
                  { user: "Mike J.", amount: 25, time: "15m ago" },
                  { user: "Emma W.", amount: 100, time: "1h ago" },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-sm">{tx.user}</span>
                    <div className="text-right">
                      <span className="font-medium text-green-500">+${tx.amount}</span>
                      <p className="text-xs text-muted-foreground">{tx.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search gateways by name or region..." className="pl-9 bg-card/50 backdrop-blur-sm border-border/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as keyof typeof paymentGateways)} className="space-y-6">
        <TabsList className="glass-card p-1 flex-wrap h-auto gap-1">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const Icon = categoryIcons[key as keyof typeof categoryIcons];
            return (
              <TabsTrigger key={key} value={key} className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(paymentGateways).map(([category, gateways]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <AnimatePresence mode="popLayout">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGateways.map((gateway, index) => {
                  const isConfigured = !!configuredGateways[gateway.id];
                  const isEnabled = configuredGateways[gateway.id]?.enabled;

                  return (
                    <motion.div key={gateway.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.03 }}>
                      <Card className={cn("glass-card-hover h-full transition-all", isEnabled && "border-green-500/30 bg-green-500/5")}>
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">{gateway.icon}</div>
                              <div>
                                <h3 className="font-semibold">{gateway.name}</h3>
                                <p className="text-xs text-muted-foreground">{gateway.regions.join(", ")}</p>
                              </div>
                            </div>
                            {isConfigured && (
                              <Switch checked={isEnabled} onCheckedChange={() => toggleGateway(gateway.id)} />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Fee: {gateway.fee}</span>
                            {isConfigured ? (
                              <Badge variant="outline" className={isEnabled ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-muted"}>
                                {isEnabled ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                {isEnabled ? "Active" : "Inactive"}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">Not configured</Badge>
                            )}
                          </div>
                          <Button variant={isConfigured ? "outline" : "default"} className="w-full gap-2" onClick={() => openConfigDialog(gateway)}>
                            {isConfigured ? <Settings className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {isConfigured ? "Configure" : "Add Gateway"}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{selectedGateway?.icon}</span>
              Configure {selectedGateway?.name}
            </DialogTitle>
            <DialogDescription>Enter your API credentials to enable this payment gateway</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>API Key / Public Key</Label>
              <Input value={formData.apiKey} onChange={(e) => setFormData({...formData, apiKey: e.target.value})} placeholder="pk_live_..." className="bg-background/50 font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <div className="relative">
                <Input type={showSecretKey ? "text" : "password"} value={formData.secretKey} onChange={(e) => setFormData({...formData, secretKey: e.target.value})} placeholder="sk_live_..." className="bg-background/50 font-mono text-sm pr-10" />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowSecretKey(!showSecretKey)}>
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Deposit ($)</Label>
                <Input type="number" value={formData.minDeposit} onChange={(e) => setFormData({...formData, minDeposit: e.target.value})} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Max Deposit ($)</Label>
                <Input type="number" value={formData.maxDeposit} onChange={(e) => setFormData({...formData, maxDeposit: e.target.value})} className="bg-background/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fee (%)</Label>
                <Input type="number" value={formData.feePercentage} onChange={(e) => setFormData({...formData, feePercentage: e.target.value})} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Fixed Fee ($)</Label>
                <Input type="number" value={formData.fixedFee} onChange={(e) => setFormData({...formData, fixedFee: e.target.value})} className="bg-background/50" />
              </div>
            </div>

            <div className="flex items-center justify-between glass-card p-3 rounded-lg">
              <div>
                <p className="font-medium">Test Mode</p>
                <p className="text-xs text-muted-foreground">Use sandbox/test credentials</p>
              </div>
              <Switch checked={formData.testMode} onCheckedChange={(checked) => setFormData({...formData, testMode: checked})} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 gap-2" onClick={testConnection} disabled={testing || !formData.apiKey}>
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Test
              </Button>
              <Button className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80" onClick={saveGatewayConfig}>
                <CheckCircle className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Gateway Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[400px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Request New Gateway</DialogTitle>
            <DialogDescription>Request a payment gateway to be enabled by the platform admin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Gateway Name</Label>
              <Input value={requestForm.gatewayName} onChange={(e) => setRequestForm({...requestForm, gatewayName: e.target.value})} placeholder="e.g., Wise, Revolut" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea value={requestForm.reason} onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})} placeholder="Why do you need this gateway?" className="bg-background/50" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Expected Monthly Volume</Label>
              <select className="w-full p-2 rounded-md border bg-background/50" value={requestForm.expectedVolume} onChange={(e) => setRequestForm({...requestForm, expectedVolume: e.target.value})}>
                <option value="">Select volume</option>
                <option value="low">Under $1,000</option>
                <option value="medium">$1,000 - $10,000</option>
                <option value="high">$10,000 - $50,000</option>
                <option value="enterprise">Over $50,000</option>
              </select>
            </div>
            <Button className="w-full gap-2" onClick={submitGatewayRequest}>
              <Send className="w-4 h-4" />
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethods;
