import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Link2,
  Copy,
  UserX,
  Circle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Import new components
import { ExportDialog } from "@/components/customers/ExportDialog";
import { AddCustomerDialog, NewCustomer } from "@/components/customers/AddCustomerDialog";
import { CustomerOverview } from "@/components/customers/CustomerOverview";
import { CustomerMobileCard } from "@/components/customers/CustomerMobileCard";
import { CustomerPricingDialog } from "@/components/customers/CustomerPricingDialog";

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

interface Transaction {
  id: string;
  type: "credit" | "debit" | "refund";
  amount: number;
  description: string;
  date: string;
}

interface Order {
  id: string;
  service: string;
  amount: number;
  status: string;
  date: string;
}

const CustomerManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [balanceAction, setBalanceAction] = useState<"add" | "subtract">("add");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Customer>("totalSpent");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "banned">("all");

  // Mock customer data - extended with referrals and pricing
  const [customers, setCustomers] = useState<Customer[]>([
    { id: "1", name: "John Anderson", email: "john@example.com", username: "john_a2x4", status: "active", segment: "vip", balance: 245.50, totalSpent: 2450.00, totalOrders: 47, joinedAt: "2024-01-15", lastActive: "2 hours ago", isOnline: true, referralCode: "JOHN2024", referralCount: 5, customDiscount: 10 },
    { id: "2", name: "Sarah Miller", email: "sarah@example.com", username: "sarah_m9k2", status: "active", segment: "regular", balance: 89.25, totalSpent: 890.00, totalOrders: 23, joinedAt: "2024-03-20", lastActive: "5 hours ago", isOnline: true, referralCode: "SARAH2024", referralCount: 2 },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", username: "mike_j7b3", status: "active", segment: "new", balance: 50.00, totalSpent: 50.00, totalOrders: 2, joinedAt: "2024-11-01", lastActive: "1 day ago", isOnline: false, referralCode: "MIKE2024", referredBy: "JOHN2024" },
    { id: "4", name: "Emma Wilson", email: "emma@example.com", username: "emma_w4p1", status: "inactive", segment: "regular", balance: 0, totalSpent: 340.00, totalOrders: 8, joinedAt: "2024-06-10", lastActive: "2 weeks ago", isOnline: false },
    { id: "5", name: "Chris Davis", email: "chris@example.com", username: "chris_d8n5", status: "suspended", segment: "regular", balance: 15.00, totalSpent: 120.00, totalOrders: 5, joinedAt: "2024-08-05", lastActive: "1 month ago", isOnline: false },
    { id: "6", name: "Alex Thompson", email: "alex@example.com", username: "alex_t3c9", status: "active", segment: "vip", balance: 500.00, totalSpent: 5200.00, totalOrders: 89, joinedAt: "2023-06-15", lastActive: "30 min ago", isOnline: true, referralCode: "ALEX2024", referralCount: 12, customDiscount: 15 },
    { id: "7", name: "Lisa Chen", email: "lisa@example.com", username: "lisa_c6r7", status: "active", segment: "regular", balance: 125.00, totalSpent: 780.00, totalOrders: 18, joinedAt: "2024-04-22", lastActive: "3 hours ago", isOnline: true, referralCode: "LISA2024" },
    { id: "8", name: "David Brown", email: "david@example.com", username: "david_b1q8", status: "active", segment: "new", balance: 25.00, totalSpent: 25.00, totalOrders: 1, joinedAt: "2024-11-15", lastActive: "Just now", isOnline: true, referredBy: "ALEX2024" },
    { id: "9", name: "Maria Garcia", email: "maria@example.com", username: "maria_g5f2", status: "active", segment: "vip", balance: 320.00, totalSpent: 3100.00, totalOrders: 62, joinedAt: "2023-09-10", lastActive: "1 hour ago", isOnline: false, referralCode: "MARIA2024", referralCount: 8 },
    { id: "10", name: "James Wilson", email: "james@example.com", username: "james_w0h4", status: "active", segment: "regular", balance: 45.00, totalSpent: 420.00, totalOrders: 12, joinedAt: "2024-07-18", lastActive: "6 hours ago", isOnline: false },
  ]);

  const mockTransactions: Transaction[] = [
    { id: "t1", type: "credit", amount: 100.00, description: "Balance top-up via PayPal", date: "2024-11-15" },
    { id: "t2", type: "debit", amount: 24.99, description: "Order #ORD-2847", date: "2024-11-14" },
    { id: "t3", type: "debit", amount: 12.50, description: "Order #ORD-2845", date: "2024-11-12" },
    { id: "t4", type: "refund", amount: 5.00, description: "Partial refund - Order #ORD-2840", date: "2024-11-10" },
  ];

  const mockOrders: Order[] = [
    { id: "ORD-2847", service: "Instagram Followers 1K", amount: 24.99, status: "completed", date: "2024-11-14" },
    { id: "ORD-2845", service: "YouTube Views 5K", amount: 12.50, status: "in_progress", date: "2024-11-12" },
    { id: "ORD-2840", service: "TikTok Likes 500", amount: 8.99, status: "completed", date: "2024-11-10" },
  ];

  const onlineCount = customers.filter(c => c.isOnline).length;
  const bannedCount = customers.filter(c => c.status === "suspended").length;

  const stats = [
    { title: "Total Customers", value: customers.length, change: "+156", trend: "up", icon: Users },
    { title: "Online Now", value: onlineCount, change: `${onlineCount}`, trend: "up", icon: Circle },
    { title: "Active Users", value: customers.filter(c => c.status === "active").length, change: "+12%", trend: "up", icon: UserCheck },
    { title: "VIP Members", value: customers.filter(c => c.segment === "vip").length, change: "+5", trend: "up", icon: Crown },
  ];

  const filteredCustomers = useMemo(() => {
    let result = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.id.includes(searchTerm) ||
        (customer.username && customer.username.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
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

  const handleSetPricing = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowPricingDialog(true);
  };

  const handleSaveCustomPricing = (customerId: string, discount: number) => {
    setCustomers(prev => prev.map(c => 
      c.id === customerId ? { ...c, customDiscount: discount } : c
    ));
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

  const handleBalanceAdjust = () => {
    if (!balanceAmount || !selectedCustomer) return;
    const amount = parseFloat(balanceAmount);
    const action = balanceAction === "add" ? "added to" : "subtracted from";
    toast({ title: "Balance Updated", description: `$${amount.toFixed(2)} ${action} ${selectedCustomer.name}'s account.` });
    setShowBalanceModal(false);
    setBalanceAmount("");
    setBalanceReason("");
  };

  const handleCustomerAction = (action: string, customer: Customer) => {
    toast({ title: `${action} - ${customer.name}`, description: `Action "${action}" performed successfully.` });
  };

  const handleAddCustomer = (newCustomer: NewCustomer) => {
    const customer: Customer = {
      id: `${Date.now()}`,
      name: newCustomer.fullName,
      email: newCustomer.email,
      username: newCustomer.username,
      status: newCustomer.status,
      segment: newCustomer.segment,
      balance: newCustomer.balance,
      totalSpent: 0,
      totalOrders: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: "Just now",
    };
    setCustomers(prev => [customer, ...prev]);
    toast({ 
      title: "Customer Created", 
      description: `${newCustomer.fullName} has been added successfully.` 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your panel's customers and their accounts</p>
        </div>
        <div className="flex gap-2">
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
        {stats.map((stat, index) => (
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

      {/* Customer Overview with scroll arrows */}
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
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[250px]">Customer</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                    <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("segment")}>
                    <div className="flex items-center gap-1">Segment <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("balance")}>
                    <div className="flex items-center justify-end gap-1">Balance <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("totalSpent")}>
                    <div className="flex items-center justify-end gap-1">Spent <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort("totalOrders")}>
                    <div className="flex items-center justify-end gap-1">Orders <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={customer.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-medium">{customer.name}</p>
                            {customer.segment === "vip" && <Crown className="w-3 h-3 text-purple-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge className={getStatusColor(customer.status)}>{customer.status}</Badge></TableCell>
                    <TableCell><Badge className={getSegmentColor(customer.segment)} variant="outline">{customer.segment}</Badge></TableCell>
                    <TableCell className="text-right font-medium text-primary">${customer.balance.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">${customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{customer.totalOrders}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{customer.lastActive}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}><Eye className="w-4 h-4 mr-2" />View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCustomerAction("Edit", customer)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedCustomer(customer); setShowBalanceModal(true); }}><Wallet className="w-4 h-4 mr-2" />Adjust Balance</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleCustomerAction("Suspend", customer)} className="text-destructive"><Ban className="w-4 h-4 mr-2" />Suspend</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredCustomers.map((customer) => (
              <CustomerMobileCard
                key={customer.id}
                customer={customer}
                onView={setSelectedCustomer}
                onEdit={(c) => handleCustomerAction("Edit", c)}
                onAdjustBalance={(c) => { setSelectedCustomer(c); setShowBalanceModal(true); }}
                onSuspend={(c) => handleCustomerAction("Suspend", c)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>Showing {filteredCustomers.length} of {customers.length} customers</span>
          </div>
        </CardContent>
      </Card>

      {/* Customer Profile Sheet */}
      <Sheet open={!!selectedCustomer && !showBalanceModal} onOpenChange={() => setSelectedCustomer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedCustomer && (
            <>
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                    <AvatarImage src={selectedCustomer.avatar} alt={selectedCustomer.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">{selectedCustomer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="flex items-center gap-2">{selectedCustomer.name}{selectedCustomer.segment === "vip" && <Crown className="w-5 h-5 text-purple-500" />}</SheetTitle>
                    <SheetDescription>{selectedCustomer.email}</SheetDescription>
                    {selectedCustomer.username && (
                      <p className="text-sm text-muted-foreground mt-1">@{selectedCustomer.username}</p>
                    )}
                  </div>
                </div>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-muted/30"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">${selectedCustomer.balance.toFixed(2)}</p><p className="text-sm text-muted-foreground">Balance</p></CardContent></Card>
                  <Card className="bg-muted/30"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">${selectedCustomer.totalSpent.toFixed(2)}</p><p className="text-sm text-muted-foreground">Total Spent</p></CardContent></Card>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => setShowBalanceModal(true)}><Wallet className="w-4 h-4 mr-2" />Adjust Balance</Button>
                  <Button variant="outline" className="flex-1"><Mail className="w-4 h-4 mr-2" />Send Email</Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Recent Orders</h4>
                  <div className="space-y-2">
                    {mockOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div><p className="font-medium text-sm">{order.service}</p><p className="text-xs text-muted-foreground">#{order.id}</p></div>
                        <div className="text-right"><p className="font-medium">${order.amount}</p><Badge variant="secondary" className="text-xs">{order.status.replace("_", " ")}</Badge></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2"><History className="w-4 h-4" />Transaction History</h4>
                  <div className="space-y-2">
                    {mockTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "credit" ? "bg-green-500/10" : tx.type === "refund" ? "bg-blue-500/10" : "bg-destructive/10"}`}>
                            {tx.type === "credit" ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : tx.type === "refund" ? <ArrowUpRight className="w-4 h-4 text-blue-500" /> : <ArrowDownRight className="w-4 h-4 text-destructive" />}
                          </div>
                          <div><p className="text-sm">{tx.description}</p><p className="text-xs text-muted-foreground">{tx.date}</p></div>
                        </div>
                        <span className={`font-medium ${tx.type === "credit" || tx.type === "refund" ? "text-green-500" : "text-destructive"}`}>{tx.type === "debit" ? "-" : "+"}${tx.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Balance Adjustment Modal */}
      <Dialog open={showBalanceModal} onOpenChange={setShowBalanceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Balance</DialogTitle>
            <DialogDescription>{selectedCustomer && `Modify ${selectedCustomer.name}'s account balance`}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Button variant={balanceAction === "add" ? "default" : "outline"} className="flex-1" onClick={() => setBalanceAction("add")}><Plus className="w-4 h-4 mr-2" />Add Funds</Button>
              <Button variant={balanceAction === "subtract" ? "default" : "outline"} className="flex-1" onClick={() => setBalanceAction("subtract")}><Minus className="w-4 h-4 mr-2" />Subtract</Button>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="amount" type="number" placeholder="0.00" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input id="reason" placeholder="Enter reason for adjustment" value={balanceReason} onChange={(e) => setBalanceReason(e.target.value)} className="mt-1" />
            </div>
            {selectedCustomer && balanceAmount && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Preview</p>
                <div className="flex items-center justify-between"><span>Current:</span><span className="font-medium">${selectedCustomer.balance.toFixed(2)}</span></div>
                <div className="flex items-center justify-between mt-1"><span>New:</span><span className={`font-bold ${balanceAction === "add" ? "text-green-500" : "text-destructive"}`}>${(balanceAction === "add" ? selectedCustomer.balance + parseFloat(balanceAmount || "0") : selectedCustomer.balance - parseFloat(balanceAmount || "0")).toFixed(2)}</span></div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBalanceModal(false)}>Cancel</Button>
            <Button onClick={handleBalanceAdjust} className={balanceAction === "add" ? "bg-green-500 hover:bg-green-500/90" : "bg-destructive hover:bg-destructive/90"}>{balanceAction === "add" ? "Add Funds" : "Subtract Funds"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <ExportDialog 
        open={showExportDialog} 
        onOpenChange={setShowExportDialog}
        customers={filteredCustomers}
      />

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={showAddCustomerDialog}
        onOpenChange={setShowAddCustomerDialog}
        onAdd={handleAddCustomer}
      />
    </div>
  );
};

export default CustomerManagement;
