import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
  UserX,
  Plus,
  Minus,
  History,
  Download,
  ArrowUpDown,
  Percent,
  Copy,
  Circle,
  RefreshCw,
  Loader2,
  Trash2
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
import { CustomerDetailPage } from "@/components/customers/CustomerDetailPage";

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
  isBanned?: boolean;
  bannedAt?: string;
  banReason?: string;
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
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [balanceAction, setBalanceAction] = useState<"add" | "subtract">("add");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Customer>("totalSpent");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "banned" | "active" | "suspended" | "vip">("all");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Customer overview toggle - default to hidden, persisted in Supabase
  const [showOverview, setShowOverview] = useState(false);
  
  // Sync overview toggle state from panel settings
  useEffect(() => {
    const settings = panel?.settings as any;
    setShowOverview(settings?.ui?.customerOverviewVisible === true);
  }, [panel?.settings]);
  
  const handleToggleOverview = async (value: boolean) => {
    setShowOverview(value);
    
    if (!panel?.id) return;
    
    try {
      const currentSettings = (panel.settings as any) || {};
      const updatedSettings = {
        ...currentSettings,
        ui: {
          ...(currentSettings.ui || {}),
          customerOverviewVisible: value
        }
      };
      
      await supabase
        .from('panels')
        .update({ settings: updatedSettings })
        .eq('id', panel.id);
    } catch (error) {
      console.error('Error saving overview preference:', error);
    }
  };
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

  // Real-time subscription for customer updates
  useEffect(() => {
    if (!panel?.id) return;

    const channel = supabase
      .channel('customer-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_users',
          filter: `panel_id=eq.${panel.id}`
        },
        (payload) => {
          // Helper for realtime segment calculation
          const getRealtimeSegment = (c: any): "vip" | "regular" | "new" => {
            const daysSinceJoined = Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceJoined <= 3) return 'new';
            if ((c.total_spent || 0) >= 500 || (c.referral_count || 0) >= 5) return 'vip';
            if ((c.total_spent || 0) > 0 || (c.last_login_at && c.last_login_at !== c.created_at)) return 'regular';
            return 'regular';
          };

          if (payload.eventType === 'INSERT') {
            const newCustomer = payload.new as any;
            setCustomers(prev => [{
              id: newCustomer.id,
              name: newCustomer.full_name || newCustomer.email.split('@')[0],
              email: newCustomer.email,
              username: newCustomer.username,
              status: newCustomer.is_banned ? 'suspended' : 'active',
              segment: getRealtimeSegment(newCustomer),
              balance: newCustomer.balance || 0,
              totalSpent: newCustomer.total_spent || 0,
              totalOrders: 0,
              joinedAt: newCustomer.created_at,
              lastActive: newCustomer.last_login_at || newCustomer.created_at,
              isOnline: false,
              referralCode: newCustomer.referral_code,
              referralCount: newCustomer.referral_count || 0,
              customDiscount: newCustomer.custom_discount || 0,
            }, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            setCustomers(prev => prev.map(c => 
              c.id === updated.id ? {
                ...c,
                name: updated.full_name || updated.email.split('@')[0],
                email: updated.email,
                status: updated.is_banned ? 'suspended' : 'active',
                segment: getRealtimeSegment(updated),
                balance: updated.balance || 0,
                totalSpent: updated.total_spent || 0,
                lastActive: updated.last_login_at || updated.created_at,
                isOnline: updated.last_login_at ? new Date(updated.last_login_at).getTime() > Date.now() - 15 * 60 * 1000 : false,
                customDiscount: updated.custom_discount || 0,
              } : c
            ));
          } else if (payload.eventType === 'DELETE') {
            setCustomers(prev => prev.filter(c => c.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

      // Helper function to calculate customer segment based on real rules
      const calculateSegment = (customer: any): "vip" | "regular" | "new" => {
        const joinedDate = new Date(customer.created_at);
        const now = new Date();
        const daysSinceJoined = Math.floor((now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Users joined within 3 days are "new"
        if (daysSinceJoined <= 3) {
          return 'new';
        }
        
        // VIP: High spenders (>= $500) OR high referral count (>= 5)
        if ((customer.total_spent || 0) >= 500 || (customer.referral_count || 0) >= 5) {
          return 'vip';
        }
        
        // Regular: Users who have logged in multiple times OR have placed orders
        const hasActivity = (customer.total_spent || 0) > 0 || 
                            (customer.last_login_at && customer.last_login_at !== customer.created_at);
        if (hasActivity) {
          return 'regular';
        }
        
        // Default to regular (since they're past 3 days)
        return 'regular';
      };

      const formattedCustomers: Customer[] = (data || []).map(c => ({
        id: c.id,
        name: c.full_name || c.email.split('@')[0],
        email: c.email,
        username: c.username || undefined,
        // All users are "active" by default, unless banned
        status: c.is_banned ? 'suspended' : 'active',
        // Use real segment calculation
        segment: calculateSegment(c),
        balance: c.balance || 0,
        totalSpent: c.total_spent || 0,
        totalOrders: 0, // Would need to join with orders table
        joinedAt: c.created_at,
        lastActive: c.last_login_at || c.created_at,
        isOnline: c.last_login_at ? new Date(c.last_login_at).getTime() > Date.now() - 15 * 60 * 1000 : false,
        referralCode: c.referral_code || undefined,
        referralCount: c.referral_count || 0,
        customDiscount: c.custom_discount || 0,
        isBanned: c.is_banned || false,
        bannedAt: c.banned_at || undefined,
        banReason: c.ban_reason || undefined,
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
  const suspendedCount = customers.filter(c => c.status === "suspended" && !c.isBanned).length;
  const bannedCount = customers.filter(c => c.isBanned === true).length;

  const statsArr = [
    { title: "Total Customers", value: customers.length, change: statsChanges.total.value, trend: statsChanges.total.trend, icon: Users },
    { title: "Online Now", value: onlineCount, change: statsChanges.online.value, trend: "neutral", icon: Circle },
    { title: "Active", value: customers.filter(c => c.status === "active" && !c.isBanned).length, change: statsChanges.active.value, trend: statsChanges.active.trend, icon: UserCheck },
    { title: "Suspended", value: suspendedCount, change: "+0", trend: "neutral" as const, icon: UserX },
    { title: "Banned", value: bannedCount, change: "+0", trend: "neutral" as const, icon: Ban },
    { title: "VIP Members", value: customers.filter(c => c.segment === "vip").length, change: statsChanges.vip.value, trend: statsChanges.vip.trend, icon: Crown },
  ];

  const filteredCustomers = useMemo(() => {
    let result = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.id.includes(searchTerm) ||
        (customer.username && customer.username.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (statusFilter === "online") return matchesSearch && customer.isOnline;
      if (statusFilter === "banned") return matchesSearch && customer.isBanned;
      if (statusFilter === "active") return matchesSearch && customer.status === "active" && !customer.isBanned;
      if (statusFilter === "suspended") return matchesSearch && customer.status === "suspended" && !customer.isBanned;
      if (statusFilter === "vip") return matchesSearch && customer.segment === "vip";
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

      // Log the transaction with panel_id and buyer_id for proper RLS and real-time updates
      await supabase.from('transactions').insert({
        panel_id: panel?.id,
        buyer_id: selectedCustomer.id,
        user_id: selectedCustomer.id,
        amount: balanceAction === 'add' ? amount : -amount,
        type: balanceAction === 'add' ? 'deposit' : 'withdrawal',
        description: balanceReason || `Balance ${balanceAction} by panel owner`,
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

  // Single customer actions
  const handleSingleSuspend = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('client_users')
        .update({ is_active: false })
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, status: "suspended" as const } : c
      ));
      toast({ title: "Customer Suspended", description: "Customer has been suspended" });
    } catch (error) {
      console.error('Error suspending customer:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to suspend customer' });
    }
  };

  const handleSingleActivate = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('client_users')
        .update({ is_active: true, is_banned: false, ban_reason: null, banned_at: null })
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, status: "active" as const } : c
      ));
      toast({ title: "Customer Activated", description: "Customer has been activated" });
    } catch (error) {
      console.error('Error activating customer:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to activate customer' });
    }
  };

  const handleSingleBan = async (customerId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('client_users')
        .update({ 
          is_banned: true, 
          is_active: false, 
          ban_reason: reason || 'Banned by admin',
          banned_at: new Date().toISOString()
        })
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, status: "suspended" as const } : c
      ));
      toast({ title: "Customer Banned", description: "Customer has been banned" });
    } catch (error) {
      console.error('Error banning customer:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to ban customer' });
    }
  };

  const handleSingleUnban = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('client_users')
        .update({ 
          is_banned: false, 
          is_active: true, 
          ban_reason: null,
          banned_at: null
        })
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, status: "active" as const } : c
      ));
      toast({ title: "Customer Unbanned", description: "Customer has been unbanned" });
    } catch (error) {
      console.error('Error unbanning customer:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to unban customer' });
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('client_users')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(prev => prev.filter(c => c.id !== customerId));
      toast({ title: "Customer Deleted", description: "Customer has been permanently deleted" });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete customer' });
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsSheet(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditDialog(true);
  };

  const handleCustomerSaved = () => {
    fetchCustomers();
    setShowEditDialog(false);
    setShowDetailsSheet(false);
  };

  const handleAddCustomer = async (newCustomer: NewCustomer) => {
    if (!panel?.id) return;

    try {
      // Use edge function to bypass RLS
      const { data, error } = await supabase.functions.invoke('panel-customers', {
        body: {
          action: 'create',
          panelId: panel.id,
          customer: {
            email: newCustomer.email,
            fullName: newCustomer.fullName,
            username: newCustomer.username,
            password: newCustomer.password,
            balance: newCustomer.balance,
            status: newCustomer.status,
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to connect to server. Please try again.' });
        return;
      }

      if (data?.error) {
        console.error('Customer creation error:', data.error);
        toast({ variant: 'destructive', title: 'Error', description: data.error });
        return;
      }

      if (!data?.customer) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to create customer' });
        return;
      }

      const customerData = data.customer;
      const customer: Customer = {
        id: customerData.id,
        name: customerData.full_name || customerData.email.split('@')[0],
        email: customerData.email,
        username: customerData.username || undefined,
        status: customerData.is_active ? 'active' : 'suspended',
        segment: 'new',
        balance: customerData.balance || 0,
        totalSpent: 0,
        totalOrders: 0,
        joinedAt: customerData.created_at,
        lastActive: customerData.created_at,
      };

      setCustomers(prev => [customer, ...prev]);
      toast({ 
        title: "Customer Created", 
        description: `${newCustomer.fullName || newCustomer.email} has been added successfully.` 
      });
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add customer. Please try again.' });
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

      {/* Stats Grid - 2 columns on mobile, 3 on tablet, 6 on desktop - clickable filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { title: "All Customers", value: customers.length, icon: Users, filter: "all" as const, bgColor: "bg-blue-100 dark:bg-blue-950/50", iconBg: "bg-blue-500", iconColor: "text-white", ringColor: "ring-blue-500" },
          { title: "Online Now", value: onlineCount, icon: Circle, filter: "online" as const, bgColor: "bg-emerald-100 dark:bg-emerald-950/50", iconBg: "bg-emerald-500", iconColor: "text-white", ringColor: "ring-emerald-500" },
          { title: "Active", value: customers.filter(c => c.status === "active" && !c.isBanned).length, icon: UserCheck, filter: "active" as const, bgColor: "bg-green-100 dark:bg-green-950/50", iconBg: "bg-green-500", iconColor: "text-white", ringColor: "ring-green-500" },
          { title: "Suspended", value: suspendedCount, icon: UserX, filter: "suspended" as const, bgColor: "bg-amber-100 dark:bg-amber-950/50", iconBg: "bg-amber-500", iconColor: "text-white", ringColor: "ring-amber-500" },
          { title: "Banned", value: bannedCount, icon: Ban, filter: "banned" as const, bgColor: "bg-red-100 dark:bg-red-950/50", iconBg: "bg-red-500", iconColor: "text-white", ringColor: "ring-red-500" },
          { title: "VIP Members", value: customers.filter(c => c.segment === "vip").length, icon: Crown, filter: "vip" as const, bgColor: "bg-purple-100 dark:bg-purple-950/50", iconBg: "bg-purple-500", iconColor: "text-white", ringColor: "ring-purple-500" },
        ].map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card 
              className={cn(
                "border-0 shadow-sm h-full cursor-pointer transition-all duration-200 hover:scale-[1.02]", 
                stat.bgColor,
                statusFilter === stat.filter && `ring-2 ring-offset-2 ${stat.ringColor}`
              )}
              onClick={() => setStatusFilter(stat.filter)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0", stat.iconBg)}>
                    <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", stat.iconColor)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-lg sm:text-xl font-bold">{stat.value.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Search - Mobile Visible */}
      <div className="block md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/60"
          />
        </div>
      </div>

      {/* Status Tabs removed - now using clickable stat cards above */}

      {/* Customer Overview Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch 
            checked={showOverview} 
            onCheckedChange={handleToggleOverview} 
            id="show-overview"
          />
          <Label htmlFor="show-overview" className="text-sm cursor-pointer">
            Show Customer Overview
          </Label>
        </div>
      </div>

      {/* Customer Overview - conditionally rendered */}
      {showOverview && (
        <CustomerOverview 
          customers={customers} 
          onSelectCustomer={setSelectedCustomer}
        />
      )}

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
                  filteredCustomers.map((customer, index) => (
                    <TableRow 
                      key={customer.id} 
                      className={cn(
                        "group transition-all duration-200 cursor-pointer",
                        "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent",
                        "hover:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]",
                        index % 2 === 0 ? "bg-muted/20" : "bg-transparent"
                      )}
                    >
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
                            <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                              <Edit className="w-4 h-4 mr-2" /> Edit Customer
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
                              className={customer.status === 'suspended' ? "text-green-500" : "text-amber-500"}
                              onClick={() => customer.status === 'suspended' ? handleSingleActivate(customer.id) : handleSingleSuspend(customer.id)}
                            >
                              {customer.status === 'suspended' ? (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" /> 
                                  Unsuspend
                                </>
                              ) : (
                                <>
                                  <Ban className="w-4 h-4 mr-2" /> 
                                  Suspend (Temporary)
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> 
                              Delete Customer
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
                onView={() => handleViewDetails(customer)}
                onEdit={() => handleEditCustomer(customer)}
                onAdjustBalance={() => { setSelectedCustomer(customer); setShowBalanceModal(true); }}
                onSuspend={async () => { await handleSingleSuspend(customer.id); }}
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

      {/* Unified Customer Detail Page (combines View + Edit) */}
      {selectedCustomer && (
        <CustomerDetailPage
          open={showDetailsSheet || showEditDialog}
          onOpenChange={(open) => {
            setShowDetailsSheet(open);
            setShowEditDialog(open);
          }}
          customer={{
            id: selectedCustomer.id,
            name: selectedCustomer.name,
            email: selectedCustomer.email,
            username: selectedCustomer.username,
            status: selectedCustomer.isBanned ? 'banned' : selectedCustomer.status,
            segment: selectedCustomer.segment,
            balance: selectedCustomer.balance,
            totalSpent: selectedCustomer.totalSpent,
            totalOrders: selectedCustomer.totalOrders,
            joinedAt: selectedCustomer.joinedAt,
            lastActive: selectedCustomer.lastActive,
            isOnline: selectedCustomer.isOnline,
            referralCode: selectedCustomer.referralCode,
            customDiscount: selectedCustomer.customDiscount,
            isBanned: selectedCustomer.isBanned || false,
            bannedAt: selectedCustomer.bannedAt,
            banReason: selectedCustomer.banReason,
          }}
          onSave={handleCustomerSaved}
        />
      )}

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
