import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/panel/ImageUpload";

interface InvoiceSettingsProps {
  panelId: string;
}

interface InvoiceSettingsData {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_logo_url: string;
  company_vat_id: string;
  tax_enabled: boolean;
  tax_rate: number;
  tax_label: string;
  invoice_prefix: string;
  invoice_language: string;
  invoice_footer_text: string;
  auto_generate_on_payment: boolean;
}

const defaultSettings: InvoiceSettingsData = {
  company_name: "",
  company_address: "",
  company_email: "",
  company_phone: "",
  company_logo_url: "",
  company_vat_id: "",
  tax_enabled: false,
  tax_rate: 0,
  tax_label: "TAX",
  invoice_prefix: "INV",
  invoice_language: "en",
  invoice_footer_text: "",
  auto_generate_on_payment: true,
};

export const InvoiceSettings = ({ panelId }: InvoiceSettingsProps) => {
  const [settings, setSettings] = useState<InvoiceSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [panelId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("invoice_settings")
        .select("*")
        .eq("panel_id", panelId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSettings({
          company_name: data.company_name || "",
          company_address: data.company_address || "",
          company_email: data.company_email || "",
          company_phone: data.company_phone || "",
          company_logo_url: data.company_logo_url || "",
          company_vat_id: data.company_vat_id || "",
          tax_enabled: data.tax_enabled || false,
          tax_rate: data.tax_rate || 0,
          tax_label: data.tax_label || "TAX",
          invoice_prefix: data.invoice_prefix || "INV",
          invoice_language: data.invoice_language || "en",
          invoice_footer_text: data.invoice_footer_text || "",
          auto_generate_on_payment: data.auto_generate_on_payment ?? true,
        });
      }
    } catch (error) {
      console.error("Error fetching invoice settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("invoice_settings")
        .upsert({
          panel_id: panelId,
          ...settings,
          updated_at: new Date().toISOString(),
        }, { onConflict: "panel_id" });

      if (error) throw error;

      toast({ title: "Saved", description: "Invoice settings updated successfully" });
    } catch (error) {
      console.error("Error saving invoice settings:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Invoice Settings
        </CardTitle>
        <CardDescription>Configure your company details for invoices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={settings.company_name}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              placeholder="Your Company Name"
            />
          </div>
          <div className="space-y-2">
            <Label>Company Email</Label>
            <Input
              type="email"
              value={settings.company_email}
              onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
              placeholder="billing@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Company Phone</Label>
            <Input
              value={settings.company_phone}
              onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
              placeholder="+1 234 567 890"
            />
          </div>
          <div className="space-y-2">
            <Label>VAT/Tax ID</Label>
            <Input
              value={settings.company_vat_id}
              onChange={(e) => setSettings({ ...settings, company_vat_id: e.target.value })}
              placeholder="VAT123456789"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Company Address</Label>
          <Textarea
            value={settings.company_address}
            onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
            placeholder="123 Business Street, City, Country"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <ImageUpload
            label="Company Logo"
            value={settings.company_logo_url}
            onChange={(url) => setSettings({ ...settings, company_logo_url: url })}
            panelId={panelId}
            folder="logos"
          />
        </div>

        {/* Tax Settings */}
        <div className="border-t border-border/50 pt-4">
          <h3 className="font-semibold mb-4">Tax Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between md:col-span-1">
              <Label>Enable Tax</Label>
              <Switch
                checked={settings.tax_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, tax_enabled: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                value={settings.tax_rate}
                onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
                disabled={!settings.tax_enabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Tax Label</Label>
              <Input
                value={settings.tax_label}
                onChange={(e) => setSettings({ ...settings, tax_label: e.target.value })}
                placeholder="TAX / VAT / GST"
                disabled={!settings.tax_enabled}
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="border-t border-border/50 pt-4">
          <h3 className="font-semibold mb-4">Invoice Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Prefix</Label>
              <Input
                value={settings.invoice_prefix}
                onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
                placeholder="INV"
              />
            </div>
            <div className="space-y-2">
              <Label>Invoice Language</Label>
              <Select
                value={settings.invoice_language}
                onValueChange={(value) => setSettings({ ...settings, invoice_language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Invoice Footer Text</Label>
            <Textarea
              value={settings.invoice_footer_text}
              onChange={(e) => setSettings({ ...settings, invoice_footer_text: e.target.value })}
              placeholder="Thank you for your business!"
              rows={2}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <Label>Auto-generate on Payment</Label>
              <p className="text-xs text-muted-foreground">Automatically create invoice when payment is completed</p>
            </div>
            <Switch
              checked={settings.auto_generate_on_payment}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_generate_on_payment: checked })}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Invoice Settings
        </Button>
      </CardContent>
    </Card>
  );
};
