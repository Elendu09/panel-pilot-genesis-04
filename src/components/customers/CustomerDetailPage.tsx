import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Wallet,
  Mail,
  Percent,
  ShoppingCart,
  Calendar,
  Clock,
  Crown,
  Ban,
  UserCheck,
  UserX,
  Copy,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Save,
  RefreshCw,
  Key,
  History,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  username?: string;
  status: "active" | "inactive" | "suspended" | "banned";
  segment: "vip" | "regular" | "new";
  balance: number;
  totalSpent: number;
  totalOrders: number;
  joinedAt: string;
  lastActive: string;
  isOnline?: boolean;
  referralCode?: string;
  customDiscount?: number;
  isBanned?: boolean;
  bannedAt?: string;
  banReason?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  price: number;
  quantity: number;
  created_at: string;
}

interface CustomerDetailPageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSave: () => void;
}

export function CustomerDetailPage({
  open,
  onOpenChange,
  customer,
  onSave,
}: CustomerDetailPageProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showBanWarning, setShowBanWarning] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
    custom_discount: 0,
    ban_reason: "",
  });

  // Account status
  const [accountStatus, setAccountStatus] = useState<'active' | 'suspended' | 'banned'>('active');

  // Balance adjustment
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  useEffect(() => {
    if (customer) {
      const status = customer.isBanned 
        ? 'banned' 
        : customer.status === 'active' 
          ? 'active' 
          : 'suspended';
      
      setFormData({
        full_name: customer.name || "",
        email: customer.email,
        username: customer.username || "",
        custom_discount: customer.customDiscount || 0,
        ban_reason: customer.banReason || "",
      });
      setAccountStatus(status);
      setHasChanges(false);
      fetchOrders();
    }
  }, [customer]);

  const fetchOrders = async () => {
    if (!customer) return;
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, price, quantity, created_at')
        .eq('buyer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleStatusChange = (newStatus: 'active' | 'suspended' | 'banned') => {
    if (newStatus === 'banned' && accountStatus !== 'banned') {
      setShowBanWarning(true);
    } else {
      setAccountStatus(newStatus);
      setHasChanges(true);
    }
  };

  const confirmBan = () => {
    setAccountStatus('banned');
    setHasChanges(true);
    setShowBanWarning(false);
  };

  const handleSave = async () => {
    if (!customer) return;
    
    setLoading(true);
    try {
      const updateData: Record<string, any> = {
        full_name: formData.full_name || null,
        email: formData.email.trim().toLowerCase(),
        username: formData.username || null,
        custom_discount: formData.custom_discount,
        updated_at: new Date().toISOString()
      };

      // Handle status changes
      if (accountStatus === 'banned') {
        updateData.is_banned = true;
        updateData.banned_at = new Date().toISOString();
        updateData.ban_reason = formData.ban_reason || null;
        updateData.is_active = false;
      } else if (accountStatus === 'suspended') {
        updateData.is_active = false;
        updateData.is_banned = false;
        updateData.banned_at = null;
        updateData.ban_reason = null;
      } else {
        updateData.is_active = true;
        updateData.is_banned = false;
        updateData.banned_at = null;
        updateData.ban_reason = null;
      }

      const { error } = await supabase
        .from('client_users')
        .update(updateData)
        .eq('id', customer.id);

      if (error) throw error;

      toast({ title: "Customer Updated", description: "All changes saved successfully" });
      setHasChanges(false);
      onSave();
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

      const { error: updateError } = await supabase
        .from('client_users')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id);

      if (updateError) throw updateError;

      // Log transaction with proper panel_id and buyer_id
      await supabase
        .from('transactions')
        .insert({
          user_id: customer.id,
          buyer_id: customer.id,
          amount: adjustmentType === 'add' ? amount : -amount,
          type: adjustmentType === 'add' ? 'admin_credit' : 'admin_debit',
          status: 'completed',
          payment_method: 'admin',
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
    if (customer?.referralCode) {
      await navigator.clipboard.writeText(customer.referralCode);
      toast({ title: "Referral code copied" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!customer) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl p-0 overflow-hidden">
          <SheetHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {customer.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span>{customer.name}</span>
                    {customer.segment === 'vip' && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm font-normal text-muted-foreground">{customer.email}</p>
                </div>
              </SheetTitle>
              <Badge 
                variant="outline" 
                className={cn(
                  customer.isBanned 
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : customer.status === 'active'
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}
              >
                {customer.isBanned ? 'Banned' : customer.status === 'active' ? 'Active' : 'Suspended'}
              </Badge>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)] px-6 py-4">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">Balance</span>
                    </div>
                    <p className="text-2xl font-bold">${customer.balance.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Total Spent</span>
                    </div>
                    <p className="text-2xl font-bold">${customer.totalSpent.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Orders</span>
                    </div>
                    <p className="text-2xl font-bold">{customer.totalOrders}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Joined</span>
                    </div>
                    <p className="text-sm font-medium">{format(new Date(customer.joinedAt), 'MMM d, yyyy')}</p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Profile Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Profile Information
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input 
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Optional username"
                    />
                  </div>
                  {customer.referralCode && (
                    <div className="space-y-2">
                      <Label>Referral Code</Label>
                      <div className="flex gap-2">
                        <Input value={customer.referralCode} readOnly className="font-mono" />
                        <Button variant="outline" size="icon" onClick={copyReferralCode}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Balance Management */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Balance Management
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant={adjustmentType === 'add' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setAdjustmentType('add')}
                  >
                    <TrendingUp className="w-3 h-3" />
                    Add
                  </Button>
                  <Button
                    variant={adjustmentType === 'subtract' ? 'destructive' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setAdjustmentType('subtract')}
                  >
                    <TrendingDown className="w-3 h-3" />
                    Deduct
                  </Button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
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
                  <Button 
                    onClick={handleBalanceAdjustment} 
                    disabled={loading || !adjustmentAmount}
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
                <Input
                  placeholder="Reason (optional)"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="text-sm"
                />
              </div>

              <Separator />

              {/* Custom Discount */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Percent className="w-4 h-4 text-primary" />
                  Custom Discount
                </h3>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={formData.custom_discount}
                    onChange={(e) => handleInputChange('custom_discount', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="flex-1"
                  />
                  <span className="text-muted-foreground font-medium">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This customer receives {formData.custom_discount}% off all services
                </p>
              </div>

              <Separator />

              {/* Account Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  Account Status
                </h3>
                <RadioGroup
                  value={accountStatus}
                  onValueChange={(v) => handleStatusChange(v as 'active' | 'suspended' | 'banned')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="active" id="status-active" />
                    <Label htmlFor="status-active" className="flex-1 cursor-pointer flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="font-medium">
                          Active {customer.status === 'suspended' && !customer.isBanned && <span className="text-green-500">(Unsuspend)</span>}
                          {customer.isBanned && <span className="text-green-500">(Unban)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">Full access to all features</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="suspended" id="status-suspended" />
                    <Label htmlFor="status-suspended" className="flex-1 cursor-pointer flex items-center gap-2">
                      <UserX className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="font-medium">Suspended (Temporary)</p>
                        <p className="text-xs text-muted-foreground">Can be reactivated anytime</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="banned" id="status-banned" />
                    <Label htmlFor="status-banned" className="flex-1 cursor-pointer flex items-center gap-2">
                      <Ban className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="font-medium">Banned (Permanent)</p>
                        <p className="text-xs text-muted-foreground">Permanent restriction</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {accountStatus === 'banned' && (
                  <div className="space-y-2">
                    <Label>Ban Reason</Label>
                    <Textarea
                      placeholder="Enter reason for banning..."
                      value={formData.ban_reason}
                      onChange={(e) => handleInputChange('ban_reason', e.target.value)}
                      rows={2}
                    />
                  </div>
                )}

                {customer.isBanned && customer.bannedAt && (
                  <Card className="border-red-500/20 bg-red-500/5">
                    <CardContent className="p-3 text-sm">
                      <p className="text-red-500 font-medium">Currently Banned</p>
                      <p className="text-muted-foreground text-xs">
                        Banned on: {format(new Date(customer.bannedAt), 'PPp')}
                      </p>
                      {customer.banReason && (
                        <p className="text-muted-foreground text-xs mt-1">
                          Reason: {customer.banReason}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <Separator />

              {/* Password Management */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  Password Management
                </h3>
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

              <Separator />

              {/* Recent Orders */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  Recent Orders
                </h3>
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <Card key={order.id} className="bg-muted/30">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-mono text-sm font-medium">{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), 'MMM d, yyyy')} • Qty: {order.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.price.toFixed(2)}</p>
                            <Badge variant="outline" className={cn("text-xs", getStatusColor(order.status))}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-muted/30">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No orders yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Floating Save Button */}
          {hasChanges && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="w-full gap-2 shadow-lg"
                size="lg"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save All Changes
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Ban Warning Dialog */}
      <AlertDialog open={showBanWarning} onOpenChange={setShowBanWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Permanent Ban Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will <strong>permanently ban</strong> this customer. 
              They will not be able to access your panel or place orders. 
              This is different from suspension which is temporary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={confirmBan}
            >
              Proceed to Ban
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
