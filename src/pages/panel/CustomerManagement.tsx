import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical,
  Mail,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Ban,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  UserCheck,
  Plus,
  Minus,
  History,
  Download,
  ArrowUpDown,
  Percent,
  Copy,
  Circle,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { calculateChange, getPreviousPeriodRange } from "@/lib/analytics-utils";

// Import components
import { ExportDialog } from "@/components/customers/ExportDialog";
import { AddCustomerDialog, NewCustomer } from "@/components/customers/AddCustomerDialog";
import { CustomerOverview } from "@/components/customers/CustomerOverview";
import { CustomerMobileCard } from "@/components/customers/CustomerMobileCard";
import { CustomerPricingDialog } from "@/components/customers/CustomerPricingDialog";
import { CustomerStatusTabs } from "@/components/customers/CustomerStatusTabs";
import { ReferralSection } from "@/components/customers/ReferralSection";
import { BulkActionToolbar } from "@/components/customers/BulkActionToolbar";
import { BulkEmailDialog } from "@/components/customers/BulkEmailDialog";
import { BulkDiscountDialog } from "@/components/customers/BulkDiscountDialog";
import { BulkBalanceDialog } from "@/components/customers/BulkBalanceDialog";
import { BulkEditDialog } from "@/components/customers/BulkEditDialog";

interface Customer {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
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
}

const CustomerManagement = () => {
  const { toast } = useToast();
  const { panel, loading: panelLoading } = usePanel();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);
  const [showBulkDiscountDialog, setShowBulkDiscountDialog] = useState(false);
  const [showBulkBalanceDialog, setShowBulkBalanceDialog] = useState(false);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [balanceAction, setBalanceAction] = useState<"add" | "subtract">("add");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Customer>("totalSpent");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "banned">("all");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statsChanges, setStatsChanges] = useState<{
    total: { value: string; trend: 'up' | 'down' | 'neutral' };
    online: { value: string; trend: 'up' | 'down' | 'neutral' };
    active: { value: string; trend: 'up' | 'down' | 'neutral' };
    vip: { value: string; trend: 'up' | 'down' | 'neutral' };
  }>({
    total: { value: '+0', trend: 'neutral' },
    online: { value: '0', trend: 'neutral' },
    active: { value: '+0%', trend: 'neutral' },
    vip: { value: '+0', trend: 'neutral' },
  });

  useEffect(() => {
    if (panel?.id) {
      fetchCustomers();
    }
  }, [panel?.id]);

  const fetchCustomers = async () => {
    if (!panel?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_users')
        .select('*')
        .eq('panel_id', panel.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCustomers: Customer[] = (data || []).map(c => ({
        id: c.id,
        name: c.full_name || c.email.split('@')[0],
        email: c.email,
        username: c.username || undefined,
        status: c.is_active ? 'active' : 'suspended',
        segment: (c.total_spent || 0) >= 1000 ? 'vip' : (c.total_spent || 0) >= 100 ? 'regular' : 'new',
        balance: c.balance || 0,
        totalSpent: c.total_spent || 0,
        totalOrders: 0, // Would need to join with orders table
        joinedAt: c.created_at,
        lastActive: c.last_login_at || c.created_at,
        isOnline: c.last_login_at ? new Date(c.last_login_at).getTime() > Date.now() - 15 * 60 * 1000 : false,
        referralCode: c.referral_code || undefined,
        referralCount: c.referral_count || 0,
        customDiscount: c.custom_discount || 0,
      }));

      // Calculate changes - count customers added in last 30 days vs previous 30 days
      const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodRange(30);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentCustomers = formattedCustomers.filter(c => 
        new Date(c.joinedAt) >= thirtyDaysAgo
      ).length;
      
      const prevCustomers = (data || []).filter(c => 
        new Date(c.created_at) >= prevStart && new Date(c.created_at) < prevEnd
      ).length;

      const customerChange = calculateChange(recentCustomers, prevCustomers);
      
      setStatsChanges({
        total: { value: `+${recentCustomers}`, trend: recentCustomers > 0 ? 'up' : 'neutral' },
        online: { value: `${formattedCustomers.filter(c => c.isOnline).length}`, trend: 'neutral' },
        active: { value: customerChange.value, trend: customerChange.trend },
        vip: { value: `+${formattedCustomers.filter(c => c.segment === 'vip').length}`, trend: 'up' },
      });

      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load customers' });
    } finally {
      setLoading(false);
    }
  };

  const onlineCount = customers.filter(c => c.isOnline).length;
  const bannedCount = customers.filter(c => c.status === "suspended").length;

  const statsArr = [
    { title: "Total Customers", value: customers.length, change: statsChanges.total.value, trend: statsChanges.total.trend, icon: Users },
    { title: "Online Now", value: onlineCount, change: statsChanges.online.value, trend: "neutral", icon: Circle },
    { title: "Active Users", value: customers.filter(c => c.status === "active").length, change: statsChanges.active.value, trend: statsChanges.active.trend, icon: UserCheck },
    { title: "VIP Members", value: customers.filter(c => c.segment === "vip").length, change: statsChanges.vip.value, trend: statsChanges.vip.trend, icon: Crown },
  ];

  const filteredCustomers = useMemo(() => {
    let result = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.id.includes(searchTerm) ||
        (customer.username && customer.username.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (statusFilter === "online") return matchesSearch && customer.isOnline;
      if (statusFilter === "banned") return matchesSearch && customer.status === "suspended";
      return matchesSearch;
    });
    
    result.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === "asc" 
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    
    return result;
  }, [customers, searchTerm, sortColumn, sortDirection, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const toggleSelectCustomer = (id: string) => {
    setSelectedCustomers(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleBulkEmail = (subject: string, message: string) => {
    console.log("Sending email to", selectedCustomers.length, "customers:", { subject, message });
    setSelectedCustomers([]);
  };

  const handleBulkDiscount = async (discount: number, expiresAt: Date | null) => {
    try {
      const { error } = await supabase
        .from('client_users')
        .update({ custom_discount: discount })
        .in('id', selectedCustomers);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        selectedCustomers.includes(c.id) ? { ...c, customDiscount: discount } : c
      ));
      setSelectedCustomers([]);
      toast({ title: 'Discount Applied', description: `${discount}% discount applied to ${selectedCustomers.length} customers` });
    } catch (error) {
      console.error('Error applying discount:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to apply discount' });
    }
  };

  const handleBulkSuspend = async () => {
    try {
      const { error } = await supabase
        .from('client_users')
        .update({ is_active: false })
        .in('id', selectedCustomers);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        selectedCustomers.includes(c.id) ? { ...c, status: "suspended" as const } : c
      ));
      toast({ title: "Customers Suspended", description: `${selectedCustomers.length} customers have been suspended` });
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error suspending customers:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to suspend customers' });
    }
  };

  const handleBulkActivate = async () => {
    try {
      const { error } = await supabase
        .from('client_users')
        .update({ is_active: true })
        .in('id', selectedCustomers);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        selectedCustomers.includes(c.id) ? { ...c, status: "active" as const } : c
      ));
      toast({ title: "Customers Activated", description: `${selectedCustomers.length} customers have been activated` });
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error activating customers:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to activate customers' });
    }
  };

  const handleBulkBalance = async (action: "add" | "subtract", amount: number, reason: string) => {
    try {
      for (const customerId of selectedCustomers) {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) continue;

        const newBalance = action === "add" 
          ? customer.balance + amount 
          : Math.max(0, customer.balance - amount);

        await supabase
          .from('client_users')
          .update({ balance: newBalance })
          .eq('id', customerId);
      }

      setCustomers(prev => prev.map(c => 
        selectedCustomers.includes(c.id) 
          ? { ...c, balance: action === "add" ? c.balance + amount : Math.max(0, c.balance - amount) } 
          : c
      ));

      const actionText = action === "add" ? "added to" : "deducted from";
      toast({ 
        title: "Balances Updated", 
        description: `$${amount.toFixed(2)} ${actionText} ${selectedCustomers.length} customers` 
      });
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error adjusting balances:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to adjust balances' });
    }
  };

  const handleSetPricing = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowPricingDialog(true);
  };

  const handleSaveCustomPricing = async (customerId: string, discount: number) => {
    try {
      const { error } = await supabase
        .from('client_users')
        .update({ custom_discount: discount })
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, customDiscount: discount } : c
      ));
      toast({ title: 'Pricing Updated', description: `Custom discount set to ${discount}%` });
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update pricing' });
    }
  };

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `Referral code ${code} copied to clipboard` });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "inactive": return "bg-muted text-muted-foreground";
      case "suspended": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted";
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "vip": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "new": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleSort = (column: keyof Customer) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const handleBalanceAdjust = async () => {
    if (!balanceAmount || !selectedCustomer) return;
    
    const amount = parseFloat(balanceAmount);
    const newBalance = balanceAction === "add" 
      ? selectedCustomer.balance + amount 
      : selectedCustomer.balance - amount;

    try {
      const { error } = await supabase
        .from('client_users')
        .update({ balance: newBalance })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      // Log the transaction
      await supabase.from('transactions').insert({
        user_id: selectedCustomer.id,
        amount: balanceAction === 'add' ? amount : -amount,
        type: balanceAction === 'add' ? 'deposit' : 'withdrawal',
        description: balanceReason || `Balance ${balanceAction}`,
        status: 'completed'
      });

      setCustomers(prev => prev.map(c => 
        c.id === selectedCustomer.id ? { ...c, balance: newBalance } : c
      ));

      const action = balanceAction === "add" ? "added to" : "subtracted from";
      toast({ title: "Balance Updated", description: `$${amount.toFixed(2)} ${action} ${selectedCustomer.name}'s account.` });
      setShowBalanceModal(false);
      setBalanceAmount("");
      setBalanceReason("");
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to adjust balance' });
    }
  };

  const handleCustomerAction = (action: string, customer: Customer) => {
    toast({ title: `${action} - ${customer.name}`, description: `Action "${action}" performed successfully.` });
  };

  const handleAddCustomer = async (newCustomer: NewCustomer) => {
    if (!panel?.id) return;

    try {
      const { data, error } = await supabase
        .from('client_users')
        .insert({
          panel_id: panel.id,
          email: newCustomer.email,
          full_name: newCustomer.fullName,
          username: newCustomer.username,
          is_active: newCustomer.status === 'active',
          balance: newCustomer.balance,
          password_temp: 'temp123', // Would need proper password handling
        })
        .select()
        .single();

      if (error) throw error;

      const customer: Customer = {
        id: data.id,
        name: data.full_name || data.email.split('@')[0],
        email: data.email,
        username: data.username || undefined,
        status: data.is_active ? 'active' : 'suspended',
        segment: 'new',
        balance: data.balance || 0,
        totalSpent: 0,
        totalOrders: 0,
        joinedAt: data.created_at,
        lastActive: data.created_at,
      };

      setCustomers(prev => [customer, ...prev]);
      toast({ 
        title: "Customer Created", 
        description: `${newCustomer.fullName} has been added successfully.` 
      });
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add customer' });
    }
  };

  const selectedCustomersForExport = selectedCustomers.length > 0
    ? filteredCustomers.filter(c => selectedCustomers.includes(c.id))
    : filteredCustomers;

  if (panelLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your panel's customers and their accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCustomers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80"
            onClick={() => setShowAddCustomerDialog(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsArr.map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="bg-card/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-xl md:text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-1" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-destructive mr-1" />}
                      <span className={`text-xs md:text-sm font-medium ${stat.trend === "up" ? "text-green-500" : "text-destructive"}`}>{stat.change}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Kanban-style Status Tabs */}
      <CustomerStatusTabs
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        counts={{
          all: customers.length,
          online: onlineCount,
          banned: bannedCount,
        }}
      />

      {/* Customer Overview */}
      <CustomerOverview 
        customers={customers} 
        onSelectCustomer={setSelectedCustomer}
      />

      {/* Search & Table View */}
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Customers</CardTitle>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/60"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions */}
          {selectedCustomers.length > 0 && (
            <BulkActionToolbar
              selectedCount={selectedCustomers.length}
              onSendEmail={() => setShowBulkEmailDialog(true)}
              onApplyDiscount={() => setShowBulkDiscountDialog(true)}
              onExport={() => setShowExportDialog(true)}
              onSuspend={handleBulkSuspend}
              onActivate={handleBulkActivate}
              onClearSelection={() => setSelectedCustomers([])}
              onAdjustBalance={() => setShowBulkBalanceDialog(true)}
              onBulkEdit={() => setShowBulkEditDialog(true)}
            />
          )}

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('balance')}>
                    <div className="flex items-center gap-1">
                      Balance
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('totalSpent')}>
                    <div className="flex items-center gap-1">
                      Spent
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/30">
                      <TableCell>
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={() => toggleSelectCustomer(customer.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {customer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {customer.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {customer.name}
                              {customer.segment === 'vip' && <Crown className="w-4 h-4 text-amber-500" />}
                            </p>
                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${customer.balance.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">${customer.totalSpent.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        {customer.customDiscount ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            {customer.customDiscount}% off
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass">
                            <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetPricing(customer)}>
                              <Percent className="w-4 h-4 mr-2" /> Set Pricing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedCustomer(customer); setShowBalanceModal(true); }}>
                              <Wallet className="w-4 h-4 mr-2" /> Adjust Balance
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCustomerAction('Email', customer)}>
                              <Mail className="w-4 h-4 mr-2" /> Send Email
                            </DropdownMenuItem>
                            {customer.referralCode && (
                              <DropdownMenuItem onClick={() => copyReferralCode(customer.referralCode!)}>
                                <Copy className="w-4 h-4 mr-2" /> Copy Referral Code
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => customer.status === 'suspended' ? handleBulkActivate() : handleBulkSuspend()}
                            >
                              <Ban className="w-4 h-4 mr-2" /> 
                              {customer.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredCustomers.map((customer) => (
              <CustomerMobileCard
                key={customer.id}
                customer={customer as any}
                onView={() => setSelectedCustomer(customer)}
                onEdit={() => setSelectedCustomer(customer)}
                onAdjustBalance={() => { setSelectedCustomer(customer); setShowBalanceModal(true); }}
                onSuspend={async () => { setSelectedCustomers([customer.id]); await handleBulkSuspend(); }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        customers={selectedCustomersForExport}
      />

      <AddCustomerDialog
        open={showAddCustomerDialog}
        onOpenChange={setShowAddCustomerDialog}
        onAdd={handleAddCustomer}
      />

      {selectedCustomer && (
        <CustomerPricingDialog
          open={showPricingDialog}
          onOpenChange={setShowPricingDialog}
          customer={selectedCustomer}
          onSave={handleSaveCustomPricing}
        />
      )}

      <BulkEmailDialog
        open={showBulkEmailDialog}
        onOpenChange={setShowBulkEmailDialog}
        selectedCount={selectedCustomers.length}
        onSend={handleBulkEmail}
      />

      <BulkDiscountDialog
        open={showBulkDiscountDialog}
        onOpenChange={setShowBulkDiscountDialog}
        selectedCount={selectedCustomers.length}
        onApply={handleBulkDiscount}
      />

      <BulkBalanceDialog
        open={showBulkBalanceDialog}
        onOpenChange={setShowBulkBalanceDialog}
        selectedCount={selectedCustomers.length}
        onApply={handleBulkBalance}
      />

      <BulkEditDialog
        open={showBulkEditDialog}
        onOpenChange={setShowBulkEditDialog}
        selectedCount={selectedCustomers.length}
        onApplyDiscount={handleBulkDiscount}
        onActivate={handleBulkActivate}
        onSuspend={handleBulkSuspend}
        onAdjustBalance={handleBulkBalance}
      />

      {/* Balance Adjustment Modal */}
      <Dialog open={showBalanceModal} onOpenChange={setShowBalanceModal}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Adjust Balance</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.name} - Current Balance: ${selectedCustomer?.balance.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={balanceAction === "add" ? "default" : "outline"}
                onClick={() => setBalanceAction("add")}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
              <Button
                variant={balanceAction === "subtract" ? "default" : "outline"}
                onClick={() => setBalanceAction("subtract")}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-2" /> Subtract
              </Button>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <Label>Reason (Optional)</Label>
              <Input
                value={balanceReason}
                onChange={(e) => setBalanceReason(e.target.value)}
                placeholder="Manual adjustment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBalanceModal(false)}>Cancel</Button>
            <Button onClick={handleBalanceAdjust}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
