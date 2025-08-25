
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GLOBAL_STORAGE_KEY = "globalPaymentEnabled";

const PaymentMethods = () => {
  const { toast } = useToast();
  const [globalEnabledCount, setGlobalEnabledCount] = useState(0);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      name: "PayPal",
      type: "paypal",
      enabled: true,
      config: {
        clientId: "your-paypal-client-id",
        clientSecret: "hidden"
      }
    },
    {
      id: 2,
      name: "Stripe",
      type: "stripe",
      enabled: false,
      config: {
        publicKey: "pk_test_...",
        secretKey: "hidden"
      }
    },
    {
      id: 3,
      name: "Coinbase",
      type: "crypto",
      enabled: true,
      config: {
        apiKey: "your-coinbase-api-key",
        webhookSecret: "hidden"
      }
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({
    name: "",
    type: "paypal",
    config: {}
  });

  useEffect(() => {
    // Read globally enabled methods from Admin Payment Management
    try {
      const raw = localStorage.getItem(GLOBAL_STORAGE_KEY);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        setGlobalEnabledCount(arr.length);
      }
    } catch {
      setGlobalEnabledCount(0);
    }
  }, []);

  const toggleMethod = (id: number) => {
    setPaymentMethods(methods =>
      methods.map(method =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
    toast({
      title: "Payment method updated",
      description: "The payment method status has been changed.",
    });
  };

  const deleteMethod = (id: number) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
    toast({
      title: "Payment method removed",
      description: "The payment method has been deleted.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Configure how customers can pay for services</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-primary hover:shadow-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">
            Global methods available from platform: <span className="font-semibold">{globalEnabledCount}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You can add any of the enabled global methods to your panel. Contact the platform admin if you need another provider enabled globally.
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={method.enabled ? "default" : "secondary"}>
                        {method.enabled ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-muted-foreground capitalize">
                        {method.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => toggleMethod(method.id)}
                  />
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMethod(method.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(method.config).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input
                      type={key.toLowerCase().includes('secret') ? "password" : "text"}
                      value={value as string}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {showAddForm && (
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Add New Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="methodName">Method Name</Label>
                  <Input
                    id="methodName"
                    placeholder="e.g., PayPal, Stripe"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="methodType">Type</Label>
                  <select
                    id="methodType"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={newMethod.type}
                    onChange={(e) => setNewMethod({...newMethod, type: e.target.value})}
                  >
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button className="bg-gradient-primary hover:shadow-glow">
                  Add Method
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;
