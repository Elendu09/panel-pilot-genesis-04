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
  Plus,
  Minus,
  History,
  Download,
  Zap,
  Trophy,
  ArrowUpDown,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAction, setBalanceAction] = useState<"add" | "subtract">("add");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Customer>("totalSpent");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Mock customer data - extended
  const customers: Customer[] = [
    { id: "1", name: "John Anderson", email: "john@example.com", status: "active", segment: "vip", balance: 245.50, totalSpent: 2450.00, totalOrders: 47, joinedAt: "2024-01-15", lastActive: "2 hours ago" },
    { id: "2", name: "Sarah Miller", email: "sarah@example.com", status: "active", segment: "regular", balance: 89.25, totalSpent: 890.00, totalOrders: 23, joinedAt: "2024-03-20", lastActive: "5 hours ago" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", status: "active", segment: "new", balance: 50.00, totalSpent: 50.00, totalOrders: 2, joinedAt: "2024-11-01", lastActive: "1 day ago" },
    { id: "4", name: "Emma Wilson", email: "emma@example.com", status: "inactive", segment: "regular", balance: 0, totalSpent: 340.00, totalOrders: 8, joinedAt: "2024-06-10", lastActive: "2 weeks ago" },
    { id: "5", name: "Chris Davis", email: "chris@example.com", status: "suspended", segment: "regular", balance: 15.00, totalSpent: 120.00, totalOrders: 5, joinedAt: "2024-08-05", lastActive: "1 month ago" },
    { id: "6", name: "Alex Thompson", email: "alex@example.com", status: "active", segment: "vip", balance: 500.00, totalSpent: 5200.00, totalOrders: 89, joinedAt: "2023-06-15", lastActive: "30 min ago" },
    { id: "7", name: "Lisa Chen", email: "lisa@example.com", status: "active", segment: "regular", balance: 125.00, totalSpent: 780.00, totalOrders: 18, joinedAt: "2024-04-22", lastActive: "3 hours ago" },
    { id: "8", name: "David Brown", email: "david@example.com", status: "active", segment: "new", balance: 25.00, totalSpent: 25.00, totalOrders: 1, joinedAt: "2024-11-15", lastActive: "Just now" },
    { id: "9", name: "Maria Garcia", email: "maria@example.com", status: "active", segment: "vip", balance: 320.00, totalSpent: 3100.00, totalOrders: 62, joinedAt: "2023-09-10", lastActive: "1 hour ago" },
    { id: "10", name: "James Wilson", email: "james@example.com", status: "active", segment: "regular", balance: 45.00, totalSpent: 420.00, totalOrders: 12, joinedAt: "2024-07-18", lastActive: "6 hours ago" },
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
    { title: "Total Customers", value: customers.length, change: "+156", trend: "up", icon: Users },
    { title: "New This Month", value: customers.filter(c => c.segment === "new").length, change: "+23%", trend: "up", icon: UserPlus },
    { title: "Active Users", value: customers.filter(c => c.status === "active").length, change: "+12%", trend: "up", icon: UserCheck },
    { title: "VIP Members", value: customers.filter(c => c.segment === "vip").length, change: "+5", trend: "up", icon: Crown },
  ];

  // Kanban column definitions
  const kanbanColumns = useMemo(() => [
    {
      id: "top-spenders",
      title: "Top Spenders",
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      customers: [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3),
    },
    {
      id: "vip",
      title: "VIP Members",
      icon: Crown,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      customers: customers.filter(c => c.segment === "vip"),
    },
    {
      id: "most-active",
      title: "Most Active",
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      customers: [...customers].sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 3),
    },
    {
      id: "regular",
      title: "Regular Users",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      customers: customers.filter(c => c.segment === "regular" && c.status === "active"),
    },
    {
      id: "new",
      title: "New Users",
      icon: Star,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      customers: customers.filter(c => c.segment === "new"),
    },
  ], [customers]);

  const filteredCustomers = useMemo(() => {
    let result = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
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
  }, [customers, searchTerm, sortColumn, sortDirection]);

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

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Status", "Segment", "Balance", "Total Spent", "Orders", "Joined"];
    const rows = filteredCustomers.map(c => [c.name, c.email, c.status, c.segment, c.balance, c.totalSpent, c.totalOrders, c.joinedAt]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    toast({ title: "Exported", description: "Customer data exported to CSV" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">Manage your panel's customers and their accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="bg-card/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> : <TrendingDown className="w-4 h-4 text-destructive mr-1" />}
                      <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-500" : "text-destructive"}`}>{stat.change}</span>
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

      {/* Kanban View */}
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Customer Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4 min-w-max">
              {kanbanColumns.map((column) => (
                <div key={column.id} className={cn("w-64 flex-shrink-0 rounded-xl border-2 p-4", column.borderColor, column.bgColor)}>
                  <div className="flex items-center gap-2 mb-4">
                    <column.icon className={cn("w-5 h-5", column.color)} />
                    <h3 className="font-semibold">{column.title}</h3>
                    <Badge variant="secondary" className="ml-auto">{column.customers.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {column.customers.slice(0, 4).map((customer) => (
                      <motion.div
                        key={customer.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border/50 cursor-pointer hover:border-primary/30 transition-all"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={customer.avatar} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{customer.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Balance</span>
                          <span className="font-medium text-primary">${customer.balance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-muted-foreground">Spent</span>
                          <span className="font-medium">${customer.totalSpent.toFixed(0)}</span>
                        </div>
                      </motion.div>
                    ))}
                    {column.customers.length > 4 && (
                      <p className="text-xs text-center text-muted-foreground">+{column.customers.length - 4} more</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Search & Table View */}
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Customers</CardTitle>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/60"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
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
    </div>
  );
};

export default CustomerManagement;
