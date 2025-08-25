import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CreditCard, Landmark, Coins, Save, CheckCircle2, AlertTriangle } from "lucide-react";

const PaymentManagement = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin/payments` : '';

  return (
    <div className="space-y-6 animate-fade-in">
      <Helmet>
        <title>Payment Management | SMMPilot</title>
        <meta name="description" content="Configure gateways, fees, test mode, and payouts for your platform." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Gateways, processing fees and payout settings</p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-glow"><Save className="w-4 h-4 mr-2" /> Save</Button>
      </header>

      <Tabs defaultValue="gateways" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
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
