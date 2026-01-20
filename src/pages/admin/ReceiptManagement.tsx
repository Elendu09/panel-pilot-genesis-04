import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Settings, 
  Download, 
  Eye, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Receipt,
  Save,
  Loader2,
  Search,
  Calendar
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ReceiptSettings {
  id: string;
  company_name: string;
  company_address: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_logo_url: string | null;
  company_website: string | null;
  company_vat_id: string | null;
  footer_text: string | null;
  receipt_prefix: string;
  include_tax: boolean;
  tax_rate: number;
  tax_label: string | null;
}

interface PlatformReceipt {
  id: string;
  invoice_number: string;
  invoice_type: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number | null;
  currency: string;
  status: string;
  issued_at: string;
  company_snapshot: any;
  customer_snapshot: any;
  line_items: any;
  payment_method: string | null;
}

const ReceiptManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ReceiptSettings | null>(null);
  const [receipts, setReceipts] = useState<PlatformReceipt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PlatformReceipt | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch receipt settings
      const { data: settingsData } = await supabase
        .from('platform_receipt_settings')
        .select('*')
        .single();

      if (settingsData) {
        setSettings(settingsData as ReceiptSettings);
      }

      // Fetch platform receipts (invoices with type 'platform_receipt' or 'subscription')
      const { data: receiptsData } = await supabase
        .from('invoices')
        .select('*')
        .in('invoice_type', ['platform_receipt', 'subscription', 'deposit'])
        .is('panel_id', null)
        .order('issued_at', { ascending: false })
        .limit(100);

      if (receiptsData) {
        setReceipts(receiptsData as PlatformReceipt[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_receipt_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Receipt settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleViewReceipt = (receipt: PlatformReceipt) => {
    setSelectedReceipt(receipt);
    setViewDialogOpen(true);
  };

  const handleDownloadReceipt = (receipt: PlatformReceipt) => {
    // Generate PDF-like HTML receipt
    const html = generateReceiptHTML(receipt);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.invoice_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded', description: `Receipt ${receipt.invoice_number} downloaded` });
  };

  const generateReceiptHTML = (receipt: PlatformReceipt) => {
    const company = receipt.company_snapshot || settings || {};
    const customer = receipt.customer_snapshot || {};
    const lineItems = Array.isArray(receipt.line_items) ? receipt.line_items : [];

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt ${receipt.invoice_number}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
    .company-info h1 { color: #3b82f6; margin: 0 0 10px 0; }
    .company-info p { margin: 3px 0; color: #666; font-size: 14px; }
    .receipt-info { text-align: right; }
    .receipt-info h2 { color: #333; margin: 0 0 10px 0; }
    .receipt-info p { margin: 3px 0; font-size: 14px; }
    .customer-section { margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
    .customer-section h3 { margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase; }
    .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    .items-table th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
    .items-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .totals { text-align: right; margin-top: 20px; }
    .totals .row { display: flex; justify-content: flex-end; margin: 8px 0; }
    .totals .label { width: 150px; text-align: right; margin-right: 20px; color: #64748b; }
    .totals .value { width: 100px; text-align: right; font-weight: 500; }
    .totals .total { font-size: 18px; font-weight: 700; color: #3b82f6; border-top: 2px solid #3b82f6; padding-top: 10px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-completed { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef9c3; color: #854d0e; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>${company.company_name || 'HOME OF SMM'}</h1>
      ${company.company_address ? `<p>${company.company_address}</p>` : ''}
      ${company.company_email ? `<p>Email: ${company.company_email}</p>` : ''}
      ${company.company_phone ? `<p>Phone: ${company.company_phone}</p>` : ''}
      ${company.company_website ? `<p>Website: ${company.company_website}</p>` : ''}
      ${company.company_vat_id ? `<p>VAT ID: ${company.company_vat_id}</p>` : ''}
    </div>
    <div class="receipt-info">
      <h2>RECEIPT</h2>
      <p><strong>${receipt.invoice_number}</strong></p>
      <p>Date: ${format(new Date(receipt.issued_at), 'MMMM dd, yyyy')}</p>
      <p><span class="status-badge status-${receipt.status}">${receipt.status.toUpperCase()}</span></p>
    </div>
  </div>

  <div class="customer-section">
    <h3>Bill To</h3>
    <p><strong>${customer.name || customer.full_name || customer.email || 'Customer'}</strong></p>
    ${customer.email ? `<p>${customer.email}</p>` : ''}
    ${customer.address ? `<p>${customer.address}</p>` : ''}
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems.length > 0 ? lineItems.map((item: any) => `
        <tr>
          <td>${item.description || item.name || 'Service'}</td>
          <td>${item.quantity || 1}</td>
          <td>${receipt.currency} ${(item.unit_price || item.price || 0).toFixed(2)}</td>
          <td>${receipt.currency} ${(item.amount || item.total || 0).toFixed(2)}</td>
        </tr>
      `).join('') : `
        <tr>
          <td>${receipt.invoice_type === 'subscription' ? 'Subscription Payment' : 'Deposit'}</td>
          <td>1</td>
          <td>${receipt.currency} ${receipt.subtotal.toFixed(2)}</td>
          <td>${receipt.currency} ${receipt.subtotal.toFixed(2)}</td>
        </tr>
      `}
    </tbody>
  </table>

  <div class="totals">
    <div class="row">
      <span class="label">Subtotal:</span>
      <span class="value">${receipt.currency} ${receipt.subtotal.toFixed(2)}</span>
    </div>
    ${receipt.tax_amount ? `
    <div class="row">
      <span class="label">Tax:</span>
      <span class="value">${receipt.currency} ${receipt.tax_amount.toFixed(2)}</span>
    </div>
    ` : ''}
    <div class="row total">
      <span class="label">Total:</span>
      <span class="value">${receipt.currency} ${receipt.total_amount.toFixed(2)}</span>
    </div>
  </div>

  ${receipt.payment_method ? `
  <p style="margin-top: 30px; color: #64748b;">
    <strong>Payment Method:</strong> ${receipt.payment_method}
  </p>
  ` : ''}

  <div class="footer">
    <p>${company.footer_text || 'Thank you for choosing HOME OF SMM - The #1 SMM Panel Platform'}</p>
    <p>This is an electronically generated receipt and does not require a signature.</p>
  </div>
</body>
</html>
    `;
  };

  const filteredReceipts = receipts.filter(r => 
    r.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.customer_snapshot?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Receipt Management</h1>
        <p className="text-muted-foreground">Configure platform receipts and view transaction history</p>
      </div>

      <Tabs defaultValue="receipts" className="w-full">
        <TabsList>
          <TabsTrigger value="receipts" className="gap-2">
            <Receipt className="w-4 h-4" />
            Receipts
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Platform Receipts</CardTitle>
                  <CardDescription>View and download receipts for subscriptions and deposits</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search receipts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No receipts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReceipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-medium">{receipt.invoice_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {receipt.invoice_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {receipt.customer_snapshot?.email || receipt.customer_snapshot?.name || 'N/A'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {receipt.currency} {receipt.total_amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(receipt.issued_at), 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={receipt.status === 'completed' ? 'default' : 'secondary'}
                              className={receipt.status === 'completed' ? 'bg-emerald-500/20 text-emerald-600' : ''}
                            >
                              {receipt.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewReceipt(receipt)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadReceipt(receipt)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {settings && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Information
                  </CardTitle>
                  <CardDescription>
                    This information appears on all platform receipts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={settings.company_name}
                      onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_address">Address</Label>
                    <Textarea
                      id="company_address"
                      value={settings.company_address || ''}
                      onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_email" className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </Label>
                      <Input
                        id="company_email"
                        type="email"
                        value={settings.company_email || ''}
                        onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_phone" className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </Label>
                      <Input
                        id="company_phone"
                        value={settings.company_phone || ''}
                        onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_website" className="flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Website
                      </Label>
                      <Input
                        id="company_website"
                        value={settings.company_website || ''}
                        onChange={(e) => setSettings({ ...settings, company_website: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_vat_id">VAT/Tax ID</Label>
                      <Input
                        id="company_vat_id"
                        value={settings.company_vat_id || ''}
                        onChange={(e) => setSettings({ ...settings, company_vat_id: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_logo_url">Logo URL</Label>
                    <Input
                      id="company_logo_url"
                      value={settings.company_logo_url || ''}
                      onChange={(e) => setSettings({ ...settings, company_logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Receipt Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Receipt Settings
                  </CardTitle>
                  <CardDescription>
                    Configure receipt numbering and tax settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="receipt_prefix">Receipt Number Prefix</Label>
                    <Input
                      id="receipt_prefix"
                      value={settings.receipt_prefix}
                      onChange={(e) => setSettings({ ...settings, receipt_prefix: e.target.value })}
                      placeholder="REC"
                    />
                    <p className="text-xs text-muted-foreground">
                      Example: {settings.receipt_prefix}-202501-0001
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <Label htmlFor="include_tax" className="font-medium">Include Tax</Label>
                      <p className="text-sm text-muted-foreground">Add tax calculation to receipts</p>
                    </div>
                    <Switch
                      id="include_tax"
                      checked={settings.include_tax}
                      onCheckedChange={(checked) => setSettings({ ...settings, include_tax: checked })}
                    />
                  </div>

                  {settings.include_tax && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tax_label">Tax Label</Label>
                        <Input
                          id="tax_label"
                          value={settings.tax_label || ''}
                          onChange={(e) => setSettings({ ...settings, tax_label: e.target.value })}
                          placeholder="VAT"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                        <Input
                          id="tax_rate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={settings.tax_rate}
                          onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="footer_text">Receipt Footer Text</Label>
                    <Textarea
                      id="footer_text"
                      value={settings.footer_text || ''}
                      onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                      rows={3}
                      placeholder="Thank you for your business!"
                    />
                  </div>

                  <Button 
                    onClick={handleSaveSettings} 
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Receipt Preview Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
            <DialogDescription>
              {selectedReceipt?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          {selectedReceipt && (
            <div 
              className="mt-4 p-4 bg-white text-black rounded-lg"
              dangerouslySetInnerHTML={{ __html: generateReceiptHTML(selectedReceipt) }}
            />
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedReceipt && (
              <Button onClick={() => handleDownloadReceipt(selectedReceipt)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptManagement;
