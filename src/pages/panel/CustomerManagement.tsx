import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Clock,
  Crown,
  Star,
  UserCheck,
  UserX,
  Plus,
  Minus,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
  segment: "vip" | "regular" | "new";
  balance: number;
  totalSpent: number;
  totalOrders: number;
  joinedAt: string;
  lastActive: string;
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
  const [activeSegment, setActiveSegment] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAction, setBalanceAction] = useState<"add" | "subtract">("add");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");

  // Mock customer data
  const customers: Customer[] = [
    {
      id: "1",
      name: "John Anderson",
      email: "john@example.com",
      status: "active",
      segment: "vip",
      balance: 245.50,
      totalSpent: 2450.00,
      totalOrders: 47,
      joinedAt: "2024-01-15",
      lastActive: "2 hours ago"
    },
    {
      id: "2",
      name: "Sarah Miller",
      email: "sarah@example.com",
      status: "active",
      segment: "regular",
      balance: 89.25,
      totalSpent: 890.00,
      totalOrders: 23,
      joinedAt: "2024-03-20",
      lastActive: "5 hours ago"
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      status: "active",
      segment: "new",
      balance: 50.00,
      totalSpent: 50.00,
      totalOrders: 2,
      joinedAt: "2024-11-01",
      lastActive: "1 day ago"
    },
    {
      id: "4",
      name: "Emma Wilson",
      email: "emma@example.com",
      status: "inactive",
      segment: "regular",
      balance: 0,
      totalSpent: 340.00,
      totalOrders: 8,
      joinedAt: "2024-06-10",
      lastActive: "2 weeks ago"
    },
    {
      id: "5",
      name: "Chris Davis",
      email: "chris@example.com",
      status: "suspended",
      segment: "regular",
      balance: 15.00,
      totalSpent: 120.00,
      totalOrders: 5,
      joinedAt: "2024-08-05",
      lastActive: "1 month ago"
    },
  ];

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

  const stats = [
    { title: "Total Customers", value: 1234, change: "+156", trend: "up", icon: Users },
    { title: "New This Month", value: 89, change: "+23%", trend: "up", icon: UserPlus },
    { title: "Active Users", value: 892, change: "+12%", trend: "up", icon: UserCheck },
    { title: "VIP Members", value: 45, change: "+5", trend: "up", icon: Crown },
  ];

  const segments = [
    { value: "all", label: "All", count: customers.length },
    { value: "vip", label: "VIP", count: customers.filter(c => c.segment === "vip").length },
    { value: "regular", label: "Regular", count: customers.filter(c => c.segment === "regular").length },
    { value: "new", label: "New", count: customers.filter(c => c.segment === "new").length },
    { value: "inactive", label: "Inactive", count: customers.filter(c => c.status === "inactive").length },
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = activeSegment === "all" || 
                          customer.segment === activeSegment ||
                          (activeSegment === "inactive" && customer.status === "inactive");
    return matchesSearch && matchesSegment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success border-success/20";
      case "inactive": return "bg-muted text-muted-foreground";
      case "suspended": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted";
    }
  };

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case "vip": return <Crown className="w-3 h-3" />;
      case "new": return <Star className="w-3 h-3" />;
      default: return null;
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "vip": return "bg-warning/10 text-warning border-warning/20";
      case "new": return "bg-info/10 text-info border-info/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleBalanceAdjust = () => {
    if (!balanceAmount || !selectedCustomer) return;
    
    const amount = parseFloat(balanceAmount);
    const action = balanceAction === "add" ? "added to" : "subtracted from";
    
    toast({
      title: "Balance Updated",
      description: `$${amount.toFixed(2)} ${action} ${selectedCustomer.name}'s account.`,
    });
    
    setShowBalanceModal(false);
    setBalanceAmount("");
    setBalanceReason("");
  };

  const handleCustomerAction = (action: string, customer: Customer) => {
    toast({
      title: `${action} - ${customer.name}`,
      description: `Action "${action}" performed successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">Manage your panel's customers and their accounts</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary/80">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-success mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.trend === "up" ? "text-success" : "text-destructive"
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/60 backdrop-blur-sm border-border/50"
          />
        </div>
        <Tabs value={activeSegment} onValueChange={setActiveSegment}>
          <TabsList className="bg-background/60 backdrop-blur-sm border border-border/50">
            {segments.map((segment) => (
              <TabsTrigger 
                key={segment.value} 
                value={segment.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {segment.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {segment.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                          <AvatarImage src={customer.avatar} alt={customer.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                          customer.status === "active" ? "bg-success" : 
                          customer.status === "inactive" ? "bg-muted-foreground" : "bg-destructive"
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{customer.name}</h3>
                          {customer.segment === "vip" && (
                            <Crown className="w-4 h-4 text-warning" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCustomerAction("Edit", customer)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCustomerAction("Email", customer)}>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setSelectedCustomer(customer);
                          setShowBalanceModal(true);
                        }}>
                          <Wallet className="w-4 h-4 mr-2" />
                          Adjust Balance
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleCustomerAction("Suspend", customer)}
                          className="text-destructive"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                    <Badge className={getSegmentColor(customer.segment)}>
                      {getSegmentIcon(customer.segment)}
                      <span className="ml-1 capitalize">{customer.segment}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">${customer.balance.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Balance</p>
                    </div>
                    <div className="text-center border-x border-border/50">
                      <p className="text-lg font-bold">{customer.totalOrders}</p>
                      <p className="text-xs text-muted-foreground">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">${customer.totalSpent.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">Spent</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {customer.lastActive}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Customer Profile Sheet */}
      <Sheet open={!!selectedCustomer && !showBalanceModal} onOpenChange={() => setSelectedCustomer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedCustomer && (
            <>
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                    <AvatarImage src={selectedCustomer.avatar} alt={selectedCustomer.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                      {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="flex items-center gap-2">
                      {selectedCustomer.name}
                      {selectedCustomer.segment === "vip" && <Crown className="w-5 h-5 text-warning" />}
                    </SheetTitle>
                    <SheetDescription>{selectedCustomer.email}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">${selectedCustomer.balance.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">${selectedCustomer.totalSpent.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => setShowBalanceModal(true)}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Adjust Balance
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>

                {/* Recent Orders */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Recent Orders
                  </h4>
                  <div className="space-y-2">
                    {mockOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{order.service}</p>
                          <p className="text-xs text-muted-foreground">#{order.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.amount}</p>
                          <Badge variant="secondary" className="text-xs">
                            {order.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction History */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Transaction History
                  </h4>
                  <div className="space-y-2">
                    {mockTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === "credit" ? "bg-success/10" :
                            tx.type === "refund" ? "bg-info/10" : "bg-destructive/10"
                          }`}>
                            {tx.type === "credit" ? (
                              <ArrowUpRight className="w-4 h-4 text-success" />
                            ) : tx.type === "refund" ? (
                              <ArrowUpRight className="w-4 h-4 text-info" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <span className={`font-medium ${
                          tx.type === "credit" || tx.type === "refund" ? "text-success" : "text-destructive"
                        }`}>
                          {tx.type === "debit" ? "-" : "+"}${tx.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Info */}
                <div className="pt-4 border-t border-border/50">
                  <h4 className="font-semibold mb-3">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member Since</span>
                      <span>{new Date(selectedCustomer.joinedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Active</span>
                      <span>{selectedCustomer.lastActive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span>{selectedCustomer.totalOrders}</span>
                    </div>
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
            <DialogDescription>
              {selectedCustomer && `Modify ${selectedCustomer.name}'s account balance`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Button
                variant={balanceAction === "add" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setBalanceAction("add")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
              <Button
                variant={balanceAction === "subtract" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setBalanceAction("subtract")}
              >
                <Minus className="w-4 h-4 mr-2" />
                Subtract
              </Button>
            </div>
            
            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="Enter reason for adjustment"
                value={balanceReason}
                onChange={(e) => setBalanceReason(e.target.value)}
                className="mt-1"
              />
            </div>

            {selectedCustomer && balanceAmount && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Preview</p>
                <div className="flex items-center justify-between">
                  <span>Current Balance:</span>
                  <span className="font-medium">${selectedCustomer.balance.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>New Balance:</span>
                  <span className={`font-bold ${balanceAction === "add" ? "text-success" : "text-destructive"}`}>
                    ${(balanceAction === "add" 
                      ? selectedCustomer.balance + parseFloat(balanceAmount || "0")
                      : selectedCustomer.balance - parseFloat(balanceAmount || "0")
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBalanceModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBalanceAdjust}
              className={balanceAction === "add" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}
            >
              {balanceAction === "add" ? "Add Funds" : "Subtract Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
