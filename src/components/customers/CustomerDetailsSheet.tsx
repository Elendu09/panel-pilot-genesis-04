import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
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
  ExternalLink,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended" | "banned";
  segment: "vip" | "regular" | "new";
  balance: number;
  totalSpent: number;
  totalOrders: number;
  joinedAt: string;
  lastActive: string;
  isOnline?: boolean;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  customDiscount?: number;
  isBanned?: boolean;
  bannedAt?: string;
  banReason?: string;
}

interface CustomerDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onEdit: () => void;
  onAdjustBalance: () => void;
  onSetPricing: () => void;
  onSuspend: () => Promise<void>;
  onActivate: () => Promise<void>;
  onBan: (reason: string) => Promise<void>;
  onUnban: () => Promise<void>;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  price: number;
  quantity: number;
  created_at: string;
}

export function CustomerDetailsSheet({
  open,
  onOpenChange,
  customer,
  onEdit,
  onAdjustBalance,
  onSetPricing,
  onSuspend,
  onActivate,
  onBan,
  onUnban,
}: CustomerDetailsSheetProps) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [showBanInput, setShowBanInput] = useState(false);

  useEffect(() => {
    if (open && customer) {
      fetchOrders();
    }
  }, [open, customer?.id]);

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

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "banned": return "bg-red-600/10 text-red-600 border-red-600/20";
      case "suspended": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "vip": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "new": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleBan = async () => {
    await onBan(banReason);
    setShowBanInput(false);
    setBanReason("");
  };

  if (!customer) return null;

  const displayStatus = customer.isBanned ? "banned" : customer.status;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {customer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {customer.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="flex items-center gap-2 text-left">
                {customer.name}
                {customer.segment === 'vip' && <Crown className="w-5 h-5 text-amber-500" />}
              </SheetTitle>
              <SheetDescription className="text-left">{customer.email}</SheetDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className={getStatusColor(displayStatus)}>
                  {displayStatus}
                </Badge>
                <Badge variant="outline" className={getSegmentColor(customer.segment)}>
                  {customer.segment}
                </Badge>
                {customer.customDiscount && customer.customDiscount > 0 && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    {customer.customDiscount}% discount
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Ban Warning */}
        {customer.isBanned && (
          <Card className="mb-4 border-red-500/20 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-500">Account Banned</p>
                  {customer.banReason && (
                    <p className="text-sm text-muted-foreground mt-1">Reason: {customer.banReason}</p>
                  )}
                  {customer.bannedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Banned on: {format(new Date(customer.bannedAt), 'PPp')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Wallet className="w-4 h-4" />
                Balance
              </div>
              <p className="text-2xl font-bold mt-1">${customer.balance.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingUp className="w-4 h-4" />
                Total Spent
              </div>
              <p className="text-2xl font-bold mt-1">${customer.totalSpent.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={onAdjustBalance}>
            <DollarSign className="w-4 h-4 mr-1" />
            Balance
          </Button>
          <Button variant="outline" size="sm" onClick={onSetPricing}>
            <Percent className="w-4 h-4 mr-1" />
            Pricing
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <ExternalLink className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>

        {/* Status Actions */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {customer.isBanned ? (
              <Button 
                variant="outline" 
                className="w-full justify-start text-green-500 hover:text-green-600"
                onClick={onUnban}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Unban Account
              </Button>
            ) : (
              <>
                {customer.status === 'suspended' ? (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-green-500 hover:text-green-600"
                    onClick={onActivate}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate Account
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-amber-500 hover:text-amber-600"
                    onClick={onSuspend}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Suspend Account
                  </Button>
                )}
                
                {showBanInput ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Ban reason (optional)"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                        onClick={handleBan}
                      >
                        Confirm Ban
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowBanInput(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-500 hover:text-red-600"
                    onClick={() => setShowBanInput(true)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Ban Account
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Username</span>
                <div className="flex items-center gap-2">
                  <span>{customer.username || '-'}</span>
                  {customer.username && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(customer.username!, 'Username')}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[180px]">{customer.email}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(customer.email, 'Email')}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Referral Code</span>
                <div className="flex items-center gap-2">
                  <span>{customer.referralCode || '-'}</span>
                  {customer.referralCode && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(customer.referralCode!, 'Referral code')}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Referrals</span>
                <span>{customer.referralCount || 0}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined
                </span>
                <span>{format(new Date(customer.joinedAt), 'PP')}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last Active
                </span>
                <span>{format(new Date(customer.lastActive), 'PP')}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            {loadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), 'PP')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.price.toFixed(2)}</p>
                      <Badge variant="outline" className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
