import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  Globe, 
  Mail, 
  Shield, 
  DollarSign,
  Bell,
  Save,
  RefreshCw,
  Loader2
} from "lucide-react";

interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  category: string;
  description?: string;
}

const PlatformSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    platformName: "SMMPilot",
    platformDescription: "The ultimate SMM panel management platform",
    supportEmail: "support@smmpilot.online",
    maintenanceMode: false,
    
    // Registration Settings
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: "panel_owner",
    maxPanelsPerUser: 5,
    
    // Commission Settings
    platformCommission: 5,
    paymentGatewayFees: 2.9,
    minimumDeposit: 10,
    maximumDeposit: 10000,
    currency: "USD",
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security Settings
    maxLoginAttempts: 5,
    sessionTimeout: 1440,
    requireTwoFactor: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedSettings = { ...settings };
        
        data.forEach((setting: PlatformSetting) => {
          const value = setting.setting_value;
          
          switch (setting.setting_key) {
            case 'general':
              loadedSettings.platformName = value.platform_name || loadedSettings.platformName;
              loadedSettings.platformDescription = value.platform_description || loadedSettings.platformDescription;
              loadedSettings.supportEmail = value.contact_email || loadedSettings.supportEmail;
              loadedSettings.maintenanceMode = value.maintenance_mode || false;
              break;
            case 'users':
              loadedSettings.allowRegistration = value.allow_registration ?? true;
              loadedSettings.requireEmailVerification = value.email_verification ?? true;
              loadedSettings.maxPanelsPerUser = value.max_panels_per_user || 5;
              break;
            case 'payments':
              loadedSettings.platformCommission = value.commission_rate || 5;
              loadedSettings.minimumDeposit = value.min_deposit || 10;
              loadedSettings.maximumDeposit = value.max_deposit || 10000;
              loadedSettings.currency = value.currency || 'USD';
              break;
            case 'notifications':
              loadedSettings.emailNotifications = value.email_notifications ?? true;
              loadedSettings.smsNotifications = value.sms_notifications ?? false;
              loadedSettings.pushNotifications = value.push_notifications ?? false;
              break;
            case 'security':
              loadedSettings.maxLoginAttempts = value.max_login_attempts || 5;
              loadedSettings.sessionTimeout = value.session_timeout || 1440;
              loadedSettings.requireTwoFactor = value.enforce_2fa ?? false;
              break;
          }
        });

        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save general settings
      await supabase.from('platform_settings').upsert({
        setting_key: 'general',
        setting_value: {
          platform_name: settings.platformName,
          platform_description: settings.platformDescription,
          contact_email: settings.supportEmail,
          maintenance_mode: settings.maintenanceMode
        },
        category: 'general'
      }, { onConflict: 'setting_key' });

      // Save user settings
      await supabase.from('platform_settings').upsert({
        setting_key: 'users',
        setting_value: {
          allow_registration: settings.allowRegistration,
          email_verification: settings.requireEmailVerification,
          max_panels_per_user: settings.maxPanelsPerUser
        },
        category: 'users'
      }, { onConflict: 'setting_key' });

      // Save payment settings
      await supabase.from('platform_settings').upsert({
        setting_key: 'payments',
        setting_value: {
          commission_rate: settings.platformCommission,
          min_deposit: settings.minimumDeposit,
          max_deposit: settings.maximumDeposit,
          currency: settings.currency
        },
        category: 'payments'
      }, { onConflict: 'setting_key' });

      // Save notification settings
      await supabase.from('platform_settings').upsert({
        setting_key: 'notifications',
        setting_value: {
          email_notifications: settings.emailNotifications,
          sms_notifications: settings.smsNotifications,
          push_notifications: settings.pushNotifications
        },
        category: 'notifications'
      }, { onConflict: 'setting_key' });

      // Save security settings
      await supabase.from('platform_settings').upsert({
        setting_key: 'security',
        setting_value: {
          max_login_attempts: settings.maxLoginAttempts,
          session_timeout: settings.sessionTimeout,
          enforce_2fa: settings.requireTwoFactor
        },
        category: 'security'
      }, { onConflict: 'setting_key' });

      toast({
        title: "Settings Saved",
        description: "Platform settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure global platform settings and preferences</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="bg-gradient-primary hover:shadow-glow">
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
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
                <Label htmlFor="maxPanelsPerUser">Max Panels Per User</Label>
                <Input
                  id="maxPanelsPerUser"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxPanelsPerUser}
                  onChange={(e) => handleSettingChange('maxPanelsPerUser', parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground mt-1">Maximum number of panels a user can create</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => handleSettingChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimumDeposit">Minimum Deposit ($)</Label>
                  <Input
                    id="minimumDeposit"
                    type="number"
                    min="1"
                    value={settings.minimumDeposit}
                    onChange={(e) => handleSettingChange('minimumDeposit', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maximumDeposit">Maximum Deposit ($)</Label>
                  <Input
                    id="maximumDeposit"
                    type="number"
                    min="1"
                    value={settings.maximumDeposit}
                    onChange={(e) => handleSettingChange('maximumDeposit', parseFloat(e.target.value))}
                  />
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
                    max="10080"
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
