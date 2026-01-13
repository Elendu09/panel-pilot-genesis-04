import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
  Server
} from "lucide-react";
import { VercelIntegrationSettings } from "@/components/admin/VercelIntegrationSettings";

interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  category: string;
  description?: string;
}

interface DomainRegistrar {
  name: string;
  url: string;
  description: string;
  startingPrice: string;
  featured: boolean;
}

const DEFAULT_REGISTRARS: DomainRegistrar[] = [
  { name: "Namecheap", url: "", description: "Affordable domains with free WhoisGuard", startingPrice: "$5.98/yr", featured: true },
  { name: "Cloudflare", url: "", description: "At-cost domains with free privacy", startingPrice: "$8.03/yr", featured: false },
  { name: "Porkbun", url: "", description: "Low prices with free SSL & privacy", startingPrice: "$5.99/yr", featured: false },
  { name: "GoDaddy", url: "", description: "World's largest domain registrar", startingPrice: "$9.99/yr", featured: false },
];

const PlatformSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    platformName: "SMMPilot",
    platformDescription: "The ultimate SMM panel management platform",
    supportEmail: "support@smmpilot.online",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: "panel_owner",
    maxPanelsPerUser: 5,
    platformCommission: 5,
    paymentGatewayFees: 2.9,
    minimumDeposit: 10,
    maximumDeposit: 10000,
    currency: "USD",
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maxLoginAttempts: 5,
    sessionTimeout: 1440,
    requireTwoFactor: false,
  });

  const [domainReferralEnabled, setDomainReferralEnabled] = useState(true);
  const [domainRegistrars, setDomainRegistrars] = useState<DomainRegistrar[]>(DEFAULT_REGISTRARS);

  const tabs = [
    { value: "general", label: "General", icon: Globe },
    { value: "users", label: "Users", icon: Settings },
    { value: "payments", label: "Payments", icon: DollarSign },
    { value: "notifications", label: "Notifications", icon: Bell },
    { value: "security", label: "Security", icon: Shield },
    { value: "domains", label: "Domains", icon: Globe },
    { value: "vercel", label: "Vercel", icon: Server },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('platform_settings').select('*');
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
            case 'domain_referrals':
              setDomainReferralEnabled(value.enabled ?? true);
              if (value.registrars && Array.isArray(value.registrars)) {
                setDomainRegistrars(value.registrars);
              }
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
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateRegistrar = (index: number, field: keyof DomainRegistrar, value: string | boolean) => {
    setDomainRegistrars(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const addRegistrar = () => {
    setDomainRegistrars(prev => [...prev, { name: "", url: "", description: "", startingPrice: "", featured: false }]);
  };

  const removeRegistrar = (index: number) => {
    setDomainRegistrars(prev => prev.filter((_, i) => i !== index));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error: generalError } = await supabase.from('platform_settings').upsert([{
        setting_key: 'general',
        setting_value: { platform_name: settings.platformName, platform_description: settings.platformDescription, contact_email: settings.supportEmail, maintenance_mode: settings.maintenanceMode },
        category: 'general'
      }], { onConflict: 'setting_key' });
      if (generalError) console.error('general error:', generalError);

      const { error: usersError } = await supabase.from('platform_settings').upsert([{
        setting_key: 'users',
        setting_value: { allow_registration: settings.allowRegistration, email_verification: settings.requireEmailVerification, max_panels_per_user: settings.maxPanelsPerUser },
        category: 'users'
      }], { onConflict: 'setting_key' });
      if (usersError) console.error('users error:', usersError);

      const { error: paymentsError } = await supabase.from('platform_settings').upsert([{
        setting_key: 'payments',
        setting_value: { commission_rate: settings.platformCommission, min_deposit: settings.minimumDeposit, max_deposit: settings.maximumDeposit, currency: settings.currency },
        category: 'payments'
      }], { onConflict: 'setting_key' });
      if (paymentsError) console.error('payments error:', paymentsError);

      const { error: notificationsError } = await supabase.from('platform_settings').upsert([{
        setting_key: 'notifications',
        setting_value: { email_notifications: settings.emailNotifications, sms_notifications: settings.smsNotifications, push_notifications: settings.pushNotifications },
        category: 'notifications'
      }], { onConflict: 'setting_key' });
      if (notificationsError) console.error('notifications error:', notificationsError);

      const { error: securityError } = await supabase.from('platform_settings').upsert([{
        setting_key: 'security',
        setting_value: { max_login_attempts: settings.maxLoginAttempts, session_timeout: settings.sessionTimeout, enforce_2fa: settings.requireTwoFactor },
        category: 'security'
      }], { onConflict: 'setting_key' });
      if (securityError) console.error('security error:', securityError);

      const registrarsData = domainRegistrars.filter(r => r.name && r.url).map(r => ({
        name: r.name, url: r.url, description: r.description, startingPrice: r.startingPrice, featured: r.featured
      }));
      const { error: domainsError } = await supabase.from('platform_settings').upsert([{
        setting_key: 'domain_referrals',
        setting_value: { enabled: domainReferralEnabled, registrars: registrarsData },
        category: 'domains'
      }], { onConflict: 'setting_key' });
      if (domainsError) console.error('domains error:', domainsError);

      toast({ title: "Settings Saved", description: "Platform settings have been updated successfully" });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Platform Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">Configure global platform settings and preferences</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile: Dropdown */}
        <div className="md:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue>
                {tabs.find(t => t.value === activeTab)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SelectItem key={tab.value} value={tab.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Scrollable Tabs */}
        <div className="hidden md:block">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-max min-w-full bg-muted/50 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className="flex items-center gap-2 whitespace-nowrap px-4"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{tab.label}</span>
                    <span className="lg:hidden">{tab.label.substring(0, 4)}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <TabsContent value="general" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5" /> General Platform Settings
              </CardTitle>
              <CardDescription>Configure basic platform information and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName" className="text-sm">Platform Name</Label>
                  <Input id="platformName" value={settings.platformName} onChange={(e) => handleSettingChange('platformName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail" className="text-sm">Support Email</Label>
                  <Input id="supportEmail" type="email" value={settings.supportEmail} onChange={(e) => handleSettingChange('supportEmail', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platformDescription" className="text-sm">Platform Description</Label>
                <Textarea id="platformDescription" value={settings.platformDescription} onChange={(e) => handleSettingChange('platformDescription', e.target.value)} rows={3} />
              </div>
              <div className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg">
                <div>
                  <Label htmlFor="maintenanceMode" className="text-sm font-medium">Maintenance Mode</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Temporarily disable platform access</p>
                </div>
                <Switch id="maintenanceMode" checked={settings.maintenanceMode} onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5" /> User Registration Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Allow New Registrations</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Enable or disable new user registrations</p>
                </div>
                <Switch checked={settings.allowRegistration} onCheckedChange={(checked) => handleSettingChange('allowRegistration', checked)} />
              </div>
              <div className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Require Email Verification</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Users must verify email before access</p>
                </div>
                <Switch checked={settings.requireEmailVerification} onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Max Panels Per User</Label>
                <Input type="number" min="1" max="100" value={settings.maxPanelsPerUser} onChange={(e) => handleSettingChange('maxPanelsPerUser', parseInt(e.target.value))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5" /> Payment & Commission Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Platform Commission (%)</Label>
                  <Input type="number" min="0" max="100" value={settings.platformCommission} onChange={(e) => handleSettingChange('platformCommission', parseFloat(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Minimum Deposit ($)</Label>
                  <Input type="number" min="1" value={settings.minimumDeposit} onChange={(e) => handleSettingChange('minimumDeposit', parseFloat(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Maximum Deposit ($)</Label>
                  <Input type="number" min="1" value={settings.maximumDeposit} onChange={(e) => handleSettingChange('maximumDeposit', parseFloat(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5" /> Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)} />
              </div>
              <div className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">SMS Notifications</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Send notifications via SMS</p>
                </div>
                <Switch checked={settings.smsNotifications} onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)} />
              </div>
              <div className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch checked={settings.pushNotifications} onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5" /> Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Max Login Attempts</Label>
                  <Input type="number" min="1" max="10" value={settings.maxLoginAttempts} onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Session Timeout (minutes)</Label>
                  <Input type="number" min="5" value={settings.sessionTimeout} onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Require Two-Factor Auth</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Enforce 2FA for all users</p>
                </div>
                <Switch checked={settings.requireTwoFactor} onCheckedChange={(checked) => handleSettingChange('requireTwoFactor', checked)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5" /> Domain Referral Settings
              </CardTitle>
              <CardDescription>Configure domain registrar referral/affiliate links for panel owners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Enable "Buy Domain" Feature</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">Show domain purchase links to panel owners</p>
                </div>
                <Switch checked={domainReferralEnabled} onCheckedChange={setDomainReferralEnabled} />
              </div>

              {domainReferralEnabled && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Label className="text-base font-semibold">Domain Registrars</Label>
                    <Button variant="outline" size="sm" onClick={addRegistrar}>
                      <Plus className="w-4 h-4 mr-2" /> Add Registrar
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {domainRegistrars.map((registrar, index) => (
                      <Card key={index} className="p-3 md:p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{registrar.name || `Registrar ${index + 1}`}</span>
                              {registrar.featured && <Badge className="bg-primary/10 text-primary text-xs">Featured</Badge>}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeRegistrar(index)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">Registrar Name</Label>
                              <Input value={registrar.name} onChange={(e) => updateRegistrar(index, 'name', e.target.value)} placeholder="Namecheap" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">Affiliate/Referral URL</Label>
                              <Input value={registrar.url} onChange={(e) => updateRegistrar(index, 'url', e.target.value)} placeholder="https://namecheap.com?aff=XXXXX" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">Description</Label>
                              <Input value={registrar.description} onChange={(e) => updateRegistrar(index, 'description', e.target.value)} placeholder="Affordable domains with free privacy" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">Starting Price</Label>
                              <Input value={registrar.startingPrice} onChange={(e) => updateRegistrar(index, 'startingPrice', e.target.value)} placeholder="$5.98/yr" />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch checked={registrar.featured} onCheckedChange={(checked) => updateRegistrar(index, 'featured', checked)} />
                            <Label className="text-sm">Mark as Featured</Label>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {domainRegistrars.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No registrars configured. Add your first registrar above.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vercel" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <VercelIntegrationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformSettings;
