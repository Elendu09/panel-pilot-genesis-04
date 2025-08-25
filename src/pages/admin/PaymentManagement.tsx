
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Landmark, Coins, Save, CheckCircle2, Search, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Generate a broad catalog of payment methods (60+)
// In production these would come from your backend or a config table.
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

const STORAGE_KEY = "globalPaymentEnabled";

const PaymentManagement = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin/payments` : '';

  const [enabled, setEnabled] = useState<Set<string>>(new Set());
  const [exposeToPanels, setExposeToPanels] = useState(true);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<Method["category"] | "all">("all");

  // Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: string[] = JSON.parse(raw);
        setEnabled(new Set(parsed));
      } catch {}
    }
  }, []);

  // Persist to localStorage whenever enabled set changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(enabled)));
  }, [enabled]);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <Helmet>
        <title>Payment Management | SMMPilot</title>
        <meta name="description" content="Configure gateways, global payment methods, fees, test mode, and payouts." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Gateways, global methods, fees and payout settings</p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-glow"><Save className="w-4 h-4 mr-2" /> Save</Button>
      </header>

      <Tabs defaultValue="gateways" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="methods">Methods</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[{name:'Stripe',icon:CreditCard},{name:'PayPal',icon:DollarSign},{name:'Crypto',icon:Coins}].map((gw) => (
              <Card key={gw.name} className="bg-gradient-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><gw.icon className="w-5 h-5" /> {gw.name}</CardTitle>
                  <CardDescription>Enable and configure {gw.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center justify-between p-3 border rounded-lg"><span>Enable {gw.name}</span><Switch defaultChecked={gw.name!=='Crypto'} /></label>
                  <div>
                    <Label>Public Key</Label>
                    <Input placeholder={`${gw.name.toLowerCase()}_pub_...`} />
                  </div>
                  <div>
                    <Label>Secret Key</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <label className="flex items-center justify-between p-3 border rounded-lg"><span>Test mode (sandbox)</span><Switch defaultChecked /></label>
                </CardContent>
              </Card>
            ))}
          </div>
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
                <Input type="number" min={0} max={20} defaultValue={5} />
              </div>
              <div>
                <Label>Gateway fee (%)</Label>
                <Input type="number" min={0} max={10} step={0.1} defaultValue={2.9} />
              </div>
              <div>
                <Label>Fixed fee ($)</Label>
                <Input type="number" min={0} step={0.01} defaultValue={0.30} />
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
                  <Input type="number" min={1} defaultValue={25} />
                </div>
                <div>
                  <Label>Schedule</Label>
                  <Select defaultValue="weekly">
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
                <CardTitle>Recent payouts</CardTitle>
                <CardDescription>Latest payout operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr>
                        <th className="py-2">ID</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Method</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1,2,3,4].map((i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-3">#P{i}203</td>
                          <td className="py-3">$ {(100+i*23).toFixed(2)}</td>
                          <td className="py-3">Stripe</td>
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-accent">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentManagement;
