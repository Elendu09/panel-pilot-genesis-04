import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Globe, 
  Mail, 
  Shield, 
  DollarSign,
  Palette,
  Bell,
  Database,
  Save
} from "lucide-react";

const PlatformSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    platformName: "SMMPilot",
    platformDescription: "The ultimate SMM panel management platform",
    supportEmail: "support@smmpilot.online",
    maintenanceMode: false,
    
    // Registration Settings
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: "buyer",
    
    // Commission Settings
    platformCommission: 5,
    paymentGatewayFees: 2.9,
    minimumWithdrawal: 10,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security Settings
    maxLoginAttempts: 5,
    sessionTimeout: 60,
    requireTwoFactor: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    // Implementation for saving settings
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure global platform settings and preferences</p>
        </div>
        <Button onClick={saveSettings} className="bg-gradient-primary hover:shadow-glow">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Platform Settings
              </CardTitle>
              <CardDescription>Configure basic platform information and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => handleSettingChange('platformName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="platformDescription">Platform Description</Label>
                <Textarea
                  id="platformDescription"
                  value={settings.platformDescription}
                  onChange={(e) => handleSettingChange('platformDescription', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable platform access for maintenance</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                User Registration Settings
              </CardTitle>
              <CardDescription>Control how new users can register and access the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="allowRegistration">Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable new user registrations</p>
                </div>
                <Switch
                  id="allowRegistration"
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => handleSettingChange('allowRegistration', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Users must verify their email before accessing the platform</p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
                />
              </div>
              <div>
                <Label htmlFor="defaultUserRole">Default User Role</Label>
                <Select
                  value={settings.defaultUserRole}
                  onValueChange={(value) => handleSettingChange('defaultUserRole', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="panel_owner">Panel Owner</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">Default role assigned to new users</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment & Commission Settings
              </CardTitle>
              <CardDescription>Configure platform fees, commissions, and payment rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="platformCommission">Platform Commission (%)</Label>
                  <Input
                    id="platformCommission"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.platformCommission}
                    onChange={(e) => handleSettingChange('platformCommission', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Commission taken from each transaction</p>
                </div>
                <div>
                  <Label htmlFor="paymentGatewayFees">Payment Gateway Fees (%)</Label>
                  <Input
                    id="paymentGatewayFees"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.paymentGatewayFees}
                    onChange={(e) => handleSettingChange('paymentGatewayFees', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Additional payment processing fees</p>
                </div>
                <div>
                  <Label htmlFor="minimumWithdrawal">Minimum Withdrawal ($)</Label>
                  <Input
                    id="minimumWithdrawal"
                    type="number"
                    min="1"
                    value={settings.minimumWithdrawal}
                    onChange={(e) => handleSettingChange('minimumWithdrawal', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Minimum amount users can withdraw</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how the platform sends notifications to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications via SMS (requires configuration)</p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure platform security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Number of failed attempts before account lockout</p>
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Automatic logout after inactivity</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="requireTwoFactor">Require Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Force all users to enable 2FA</p>
                </div>
                <Switch
                  id="requireTwoFactor"
                  checked={settings.requireTwoFactor}
                  onCheckedChange={(checked) => handleSettingChange('requireTwoFactor', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformSettings;