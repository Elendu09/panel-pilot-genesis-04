import { useState } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy,
  Upload,
  Download,
  CheckSquare,
  Square,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  MessageCircle,
  Hash,
  Globe,
  TrendingUp,
  DollarSign,
  Layers,
  Power,
  Zap,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock data for services
const mockServices = [
  { id: 1, name: "Instagram Followers", category: "instagram", provider: "Provider A", minQty: 100, maxQty: 10000, price: 2.50, status: true, orders: 1250 },
  { id: 2, name: "Instagram Likes", category: "instagram", provider: "Provider A", minQty: 50, maxQty: 5000, price: 1.20, status: true, orders: 3420 },
  { id: 3, name: "Facebook Page Likes", category: "facebook", provider: "Provider B", minQty: 100, maxQty: 50000, price: 3.00, status: true, orders: 890 },
  { id: 4, name: "Twitter Followers", category: "twitter", provider: "Provider A", minQty: 100, maxQty: 20000, price: 2.80, status: false, orders: 456 },
  { id: 5, name: "YouTube Views", category: "youtube", provider: "Provider C", minQty: 500, maxQty: 100000, price: 0.80, status: true, orders: 2340 },
  { id: 6, name: "TikTok Likes", category: "tiktok", provider: "Provider B", minQty: 100, maxQty: 50000, price: 1.50, status: true, orders: 5670 },
  { id: 7, name: "LinkedIn Connections", category: "linkedin", provider: "Provider A", minQty: 50, maxQty: 5000, price: 5.00, status: true, orders: 234 },
  { id: 8, name: "Telegram Members", category: "telegram", provider: "Provider C", minQty: 100, maxQty: 10000, price: 4.00, status: false, orders: 567 },
];

const categories = [
  { id: "all", name: "All Services", icon: Layers, count: 8 },
  { id: "instagram", name: "Instagram", icon: Instagram, count: 2 },
  { id: "facebook", name: "Facebook", icon: Facebook, count: 1 },
  { id: "twitter", name: "Twitter", icon: Twitter, count: 1 },
  { id: "youtube", name: "YouTube", icon: Youtube, count: 1 },
  { id: "tiktok", name: "TikTok", icon: Hash, count: 1 },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, count: 1 },
  { id: "telegram", name: "Telegram", icon: MessageCircle, count: 1 },
];

const providers = [
  { id: "provider-a", name: "Provider A" },
  { id: "provider-b", name: "Provider B" },
  { id: "provider-c", name: "Provider C" },
];

const ServicesManagement = () => {
  const [services, setServices] = useState(mockServices);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState("");

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Stats
  const totalServices = services.length;
  const activeServices = services.filter(s => s.status).length;
  const totalOrders = services.reduce((acc, s) => acc + s.orders, 0);
  const avgPrice = (services.reduce((acc, s) => acc + s.price, 0) / services.length).toFixed(2);

  // Toggle service status
  const toggleServiceStatus = (id: number) => {
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, status: !s.status } : s
    ));
    toast({ title: "Service status updated" });
  };

  // Toggle selection
  const toggleSelection = (id: number) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Select all
  const selectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map(s => s.id));
    }
  };

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedServices.length === 0) {
      toast({ title: "No services selected", variant: "destructive" });
      return;
    }
    setBulkAction(action);
    setIsBulkDialogOpen(true);
  };

  const executeBulkAction = () => {
    switch (bulkAction) {
      case "enable":
        setServices(prev => prev.map(s => 
          selectedServices.includes(s.id) ? { ...s, status: true } : s
        ));
        toast({ title: `${selectedServices.length} services enabled` });
        break;
      case "disable":
        setServices(prev => prev.map(s => 
          selectedServices.includes(s.id) ? { ...s, status: false } : s
        ));
        toast({ title: `${selectedServices.length} services disabled` });
        break;
      case "delete":
        setServices(prev => prev.filter(s => !selectedServices.includes(s.id)));
        toast({ title: `${selectedServices.length} services deleted` });
        break;
    }
    setSelectedServices([]);
    setIsBulkDialogOpen(false);
  };

  // Delete service
  const deleteService = (id: number) => {
    setServices(prev => prev.filter(s => s.id !== id));
    toast({ title: "Service deleted" });
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Globe;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Services Management
          </h1>
          <p className="text-muted-foreground">Manage your SMM services, pricing, and providers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="glass-card border-border/50">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50">
              <DialogHeader>
                <DialogTitle>Import Services from Provider</DialogTitle>
                <DialogDescription>
                  Fetch and import services from your connected API providers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Provider</Label>
                  <Select>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Choose a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price Markup (%)</Label>
                  <Input type="number" placeholder="20" defaultValue="20" className="bg-background/50" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({ title: "Services imported successfully" });
                  setIsImportDialogOpen(false);
                }} className="bg-gradient-to-r from-primary to-primary/80">
                  <Download className="w-4 h-4 mr-2" />
                  Fetch & Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg glass-card border-border/50">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Create a new service for your panel
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input placeholder="e.g., Instagram Followers - Premium" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe your service..." className="bg-background/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.id !== "all").map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Price (per 1000)</Label>
                    <Input type="number" placeholder="2.50" step="0.01" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Quantity</Label>
                    <Input type="number" placeholder="100" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Quantity</Label>
                    <Input type="number" placeholder="10000" className="bg-background/50" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({ title: "Service created successfully" });
                  setIsAddDialogOpen(false);
                }} className="bg-gradient-to-r from-primary to-primary/80">
                  Create Service
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Services", value: totalServices, icon: Package, color: "primary" },
          { label: "Active", value: activeServices, icon: Power, color: "green-500" },
          { label: "Total Orders", value: totalOrders.toLocaleString(), icon: TrendingUp, color: "blue-500" },
          { label: "Avg. Price", value: `$${avgPrice}`, icon: DollarSign, color: "yellow-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card-hover overflow-hidden">
              <CardContent className="p-4 relative">
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <div className={cn(
                    "w-full h-full rounded-full blur-2xl",
                    stat.color === "primary" ? "bg-primary" : `bg-${stat.color}`
                  )} />
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    stat.color === "primary" ? "bg-primary/10" : `bg-${stat.color}/10`
                  )}>
                    <stat.icon className={cn(
                      "w-5 h-5",
                      stat.color === "primary" ? "text-primary" : `text-${stat.color}`
                    )} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card p-3 flex items-center justify-between rounded-xl border border-primary/30"
          >
            <span className="text-sm font-medium">
              <span className="text-primary">{selectedServices.length}</span> services selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("enable")}>
                <Power className="w-4 h-4 mr-1" /> Enable
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("disable")}>
                <Power className="w-4 h-4 mr-1" /> Disable
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card h-fit sticky top-4">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Categories
              </h3>
            </div>
            <div className="p-2 space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </span>
                    <Badge 
                      variant={isActive ? "secondary" : "outline"} 
                      className={cn(
                        "text-xs",
                        isActive && "bg-primary-foreground/20 text-primary-foreground border-0"
                      )}
                    >
                      {cat.count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Services List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search services..." 
                className="pl-9 bg-card/50 backdrop-blur-sm border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="glass-card border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card">
                <DropdownMenuItem onClick={() => handleBulkAction("enable")}>
                  <Power className="w-4 h-4 mr-2" /> Enable Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("disable")}>
                  <Power className="w-4 h-4 mr-2" /> Disable Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Services Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        <button onClick={selectAll} className="flex items-center gap-2 hover:text-foreground transition-colors">
                          {selectedServices.length === filteredServices.length && filteredServices.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                          Service
                        </button>
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Provider</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Quantity Range</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((service, index) => {
                      const CategoryIcon = getCategoryIcon(service.category);
                      const isSelected = selectedServices.includes(service.id);
                      return (
                        <motion.tr
                          key={service.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "border-b border-border/30 transition-all duration-200 group",
                            isSelected 
                              ? "bg-primary/5 border-l-2 border-l-primary" 
                              : "hover:bg-accent/30"
                          )}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <button onClick={() => toggleSelection(service.id)}>
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-primary" />
                                ) : (
                                  <Square className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                                )}
                              </button>
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                                "bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10"
                              )}>
                                <CategoryIcon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium group-hover:text-primary transition-colors">{service.name}</p>
                                <p className="text-xs text-muted-foreground">{service.orders.toLocaleString()} orders</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <Badge variant="outline" className="bg-background/50">{service.provider}</Badge>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {service.minQty.toLocaleString()} - {service.maxQty.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-primary">${service.price.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground ml-1">/1k</span>
                          </td>
                          <td className="p-4">
                            <Switch
                              checked={service.status}
                              onCheckedChange={() => toggleServiceStatus(service.id)}
                              className="data-[state=checked]:bg-primary"
                            />
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="glass-card">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => deleteService(service.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredServices.length === 0 && (
                <div className="p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium text-lg">No services found</h3>
                  <p className="text-muted-foreground text-sm">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Confirm {bulkAction}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} {selectedServices.length} selected services?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={executeBulkAction}
              variant={bulkAction === "delete" ? "destructive" : "default"}
              className={bulkAction !== "delete" ? "bg-gradient-to-r from-primary to-primary/80" : ""}
            >
              Confirm {bulkAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManagement;
