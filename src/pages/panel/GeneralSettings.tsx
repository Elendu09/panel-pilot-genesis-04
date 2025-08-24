import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const GeneralSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    panelName: "MyAwesomePanel",
    description: "Premium SMM services for social media growth",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    defaultCurrency: "USD",
    minOrderAmount: "1.00",
    maxOrderAmount: "100000.00",
    supportEmail: "support@myawesomepanel.com",
    termsOfService: "",
    privacyPolicy: ""
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your panel settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">General Settings</h1>
        <p className="text-muted-foreground">Configure your panel's basic settings and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Panel Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="panelName">Panel Name</Label>
                <Input
                  id="panelName"
                  value={settings.panelName}
                  onChange={(e) => setSettings({...settings, panelName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Panel Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings({...settings, description: e.target.value})}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Panel Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable panel access for maintenance
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register on your panel
                </p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => setSettings({...settings, allowRegistration: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify their email before placing orders
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Order Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Input
                  id="defaultCurrency"
                  value={settings.defaultCurrency}
                  onChange={(e) => setSettings({...settings, defaultCurrency: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Minimum Order Amount</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  step="0.01"
                  value={settings.minOrderAmount}
                  onChange={(e) => setSettings({...settings, minOrderAmount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOrderAmount">Maximum Order Amount</Label>
                <Input
                  id="maxOrderAmount"
                  type="number"
                  step="0.01"
                  value={settings.maxOrderAmount}
                  onChange={(e) => setSettings({...settings, maxOrderAmount: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Legal Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="termsOfService">Terms of Service</Label>
              <Textarea
                id="termsOfService"
                value={settings.termsOfService}
                onChange={(e) => setSettings({...settings, termsOfService: e.target.value})}
                rows={4}
                placeholder="Enter your terms of service content..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacyPolicy">Privacy Policy</Label>
              <Textarea
                id="privacyPolicy"
                value={settings.privacyPolicy}
                onChange={(e) => setSettings({...settings, privacyPolicy: e.target.value})}
                rows={4}
                placeholder="Enter your privacy policy content..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-gradient-primary hover:shadow-glow">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;