import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Mail, 
  DollarSign, 
  Percent, 
  Shield, 
  Key,
  Copy,
  History,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  balance: number;
  total_spent: number;
  is_active: boolean;
  custom_discount: number;
  referral_code: string | null;
  created_at: string;
}

interface CustomerEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSave: () => void;
}

export const CustomerEditDialog = ({
  open,
  onOpenChange,
  customer,
  onSave,
}: CustomerEditDialogProps) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
    is_active: true,
    custom_discount: 0,
  });
  
  // Balance adjustment
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || "",
        email: customer.email,
        username: customer.username || "",
        is_active: customer.is_active,
        custom_discount: customer.custom_discount || 0,
      });
    }
  }, [customer]);

  const handleSave = async () => {
    if (!customer) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('client_users')
        .update({
          full_name: formData.full_name || null,
          email: formData.email,
          username: formData.username || null,
          is_active: formData.is_active,
          custom_discount: formData.custom_discount,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id);

      if (error) throw error;

      toast({ title: "Customer Updated", description: "Changes saved successfully" });
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update customer" });
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceAdjustment = async () => {
    if (!customer || !adjustmentAmount || parseFloat(adjustmentAmount) <= 0) {
      toast({ variant: "destructive", title: "Please enter a valid amount" });
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(adjustmentAmount);
      const newBalance = adjustmentType === 'add' 
        ? customer.balance + amount 
        : Math.max(0, customer.balance - amount);

      // Update customer balance
      const { error: updateError } = await supabase
        .from('client_users')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id);

      if (updateError) throw updateError;

      // Log transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: customer.id,
          amount: adjustmentType === 'add' ? amount : -amount,
          type: adjustmentType === 'add' ? 'credit' : 'debit',
          status: 'completed',
          description: adjustmentReason || `Balance ${adjustmentType === 'add' ? 'added' : 'deducted'} by admin`
        });

      toast({ 
        title: "Balance Updated", 
        description: `New balance: $${newBalance.toFixed(2)}` 
      });
      
      setAdjustmentAmount("");
      setAdjustmentReason("");
      onSave();
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to adjust balance" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!customer) return;
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('client_users')
        .update({ 
          password_temp: tempPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id);

      if (error) throw error;

      // Copy to clipboard
      await navigator.clipboard.writeText(tempPassword);
      
      toast({ 
        title: "Password Reset", 
        description: `Temporary password copied: ${tempPassword}` 
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to reset password" });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (customer?.referral_code) {
      await navigator.clipboard.writeText(customer.referral_code);
      toast({ title: "Referral code copied" });
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>{customer.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3 bg-muted/50">
            <TabsTrigger value="profile" className="text-xs gap-1.5">
              <User className="w-3.5 h-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="balance" className="text-xs gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Balance
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Profile Tab */}
            <TabsContent value="profile" className="m-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Customer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-muted/50">
                  <CardContent className="p-3 text-center">
                    <DollarSign className="w-4 h-4 mx-auto text-green-500 mb-1" />
                    <p className="text-lg font-bold">${customer.total_spent?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-3 text-center">
                    <History className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                    <p className="text-lg font-bold">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Joined</p>
                  </CardContent>
                </Card>
              </div>

              {/* Referral Code */}
              {customer.referral_code && (
                <div className="space-y-2">
                  <Label>Referral Code</Label>
                  <div className="flex gap-2">
                    <Input value={customer.referral_code} readOnly className="font-mono" />
                    <Button variant="outline" size="icon" onClick={copyReferralCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Balance Tab */}
            <TabsContent value="balance" className="m-0 space-y-4">
              {/* Current Balance */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-3xl font-bold">${customer.balance?.toFixed(2) || '0.00'}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Adjustment Type */}
              <div className="flex gap-2">
                <Button
                  variant={adjustmentType === 'add' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setAdjustmentType('add')}
                >
                  <TrendingUp className="w-4 h-4" />
                  Add Funds
                </Button>
                <Button
                  variant={adjustmentType === 'subtract' ? 'destructive' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setAdjustmentType('subtract')}
                >
                  <TrendingDown className="w-4 h-4" />
                  Deduct Funds
                </Button>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className="pl-9"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>Reason (optional)</Label>
                <Input
                  placeholder="Reason for adjustment"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleBalanceAdjustment} 
                disabled={loading || !adjustmentAmount}
                className={cn(
                  "w-full",
                  adjustmentType === 'subtract' && "bg-destructive hover:bg-destructive/90"
                )}
              >
                {adjustmentType === 'add' ? 'Add' : 'Deduct'} ${adjustmentAmount || '0.00'}
              </Button>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="m-0 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-xl border">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Account Status</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.is_active ? 'Active account' : 'Suspended account'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
              </div>

              {/* Custom Discount */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Custom Discount
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={formData.custom_discount}
                    onChange={(e) => setFormData({...formData, custom_discount: parseFloat(e.target.value) || 0})}
                    min="0"
                    max="100"
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This customer will receive {formData.custom_discount}% off all services
                </p>
              </div>

              <Separator />

              {/* Password Reset */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Password Management
                </Label>
                <Button 
                  variant="outline" 
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate Temporary Password
                </Button>
                <p className="text-xs text-muted-foreground">
                  A new temporary password will be generated and copied to clipboard
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
