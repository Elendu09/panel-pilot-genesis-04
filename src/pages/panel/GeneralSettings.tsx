import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Save } from "lucide-react";

const GeneralSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panelId, setPanelId] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    panelName: "",
    description: "",
    maintenanceMode: false,
    maintenanceMessage: "",
    allowRegistration: true,
    requireEmailVerification: false,
    defaultCurrency: "USD",
    minOrderAmount: "1.00",
    maxOrderAmount: "100000.00",
    supportEmail: "",
    termsOfService: "",
    privacyPolicy: ""
  });

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;

        // Load panel data
        const { data: panel, error: panelError } = await supabase
          .from('panels')
          .select('id, name, description, settings')
          .eq('owner_id', profile.id)
          .single();

        if (panelError) throw panelError;
        if (!panel) return;

        setPanelId(panel.id);

        // Load panel_settings
        const { data: panelSettings } = await supabase
          .from('panel_settings')
          .select('*')
          .eq('panel_id', panel.id)
          .single();

        const panelSettingsData = panel.settings as Record<string, any> || {};
        const generalSettings = panelSettingsData.general || {};
        const contactInfo = panelSettings?.contact_info as Record<string, any> || {};

        setSettings({
          panelName: panel.name || "",
          description: panel.description || "",
          maintenanceMode: panelSettings?.maintenance_mode ?? false,
          maintenanceMessage: panelSettings?.maintenance_message || "",
          allowRegistration: generalSettings.allowRegistration ?? true,
          requireEmailVerification: generalSettings.requireEmailVerification ?? false,
          defaultCurrency: generalSettings.defaultCurrency || "USD",
          minOrderAmount: generalSettings.minOrderAmount || "1.00",
          maxOrderAmount: generalSettings.maxOrderAmount || "100000.00",
          supportEmail: contactInfo.email || "",
          termsOfService: generalSettings.termsOfService || "",
          privacyPolicy: generalSettings.privacyPolicy || ""
        });

      } catch (err) {
        console.error('Error loading settings:', err);
        toast({
          variant: "destructive",
          title: "Failed to load settings",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSave = async () => {
    if (!panelId) {
      toast({ variant: "destructive", title: "No panel found" });
      return;
    }

    setSaving(true);
    try {
      // Update panel name and description
      const { error: panelError } = await supabase
        .from('panels')
        .update({
          name: settings.panelName,
          description: settings.description,
          settings: {
            general: {
              allowRegistration: settings.allowRegistration,
              requireEmailVerification: settings.requireEmailVerification,
              defaultCurrency: settings.defaultCurrency,
              minOrderAmount: settings.minOrderAmount,
              maxOrderAmount: settings.maxOrderAmount,
              termsOfService: settings.termsOfService,
              privacyPolicy: settings.privacyPolicy,
              updatedAt: new Date().toISOString()
            }
          }
        })
        .eq('id', panelId);

      if (panelError) throw panelError;

      // Upsert panel_settings
      const { error: settingsError } = await supabase
        .from('panel_settings')
        .upsert({
          panel_id: panelId,
          maintenance_mode: settings.maintenanceMode,
          maintenance_message: settings.maintenanceMessage,
          contact_info: { email: settings.supportEmail }
        }, {
          onConflict: 'panel_id'
        });

      if (settingsError) throw settingsError;

      toast({
        title: "Settings saved",
        description: "Your panel settings have been updated successfully.",
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">General Settings</h1>
          <p className="text-muted-foreground">Configure your panel's basic settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary hover:shadow-glow">
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Settings
        </Button>
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
            {settings.maintenanceMode && (
              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
                  placeholder="We're currently performing scheduled maintenance. Please check back later."
                  rows={2}
                />
              </div>
            )}
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
      </div>
    </div>
  );
};

export default GeneralSettings;