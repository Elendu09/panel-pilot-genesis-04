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
  Power
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Services Management</h1>
          <p className="text-muted-foreground">Manage your SMM services, pricing, and providers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                    <SelectTrigger>
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
                  <Input type="number" placeholder="20" defaultValue="20" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({ title: "Services imported successfully" });
                  setIsImportDialogOpen(false);
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Fetch & Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Create a new service for your panel
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input placeholder="e.g., Instagram Followers - Premium" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe your service..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                    <Input type="number" placeholder="2.50" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Quantity</Label>
                    <Input type="number" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Quantity</Label>
                    <Input type="number" placeholder="10000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Estimated Delivery</Label>
                  <Input placeholder="e.g., 0-24 hours" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({ title: "Service created successfully" });
                  setIsAddDialogOpen(false);
                }}>Create Service</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Services</p>
                <p className="text-2xl font-bold">{totalServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Power className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <DollarSign className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Price</p>
                <p className="text-2xl font-bold">${avgPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat.id 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{cat.name}</span>
                  </span>
                  <Badge variant={selectedCategory === cat.id ? "secondary" : "outline"} className="text-xs">
                    {cat.count}
                  </Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Services List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search services..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
            </div>
          </div>

          {/* Services Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      <button 
                        onClick={selectAll}
                        className="flex items-center gap-2 hover:text-foreground"
                      >
                        {selectedServices.length === filteredServices.length && filteredServices.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Service</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Provider</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Quantity</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((service) => {
                    const CategoryIcon = getCategoryIcon(service.category);
                    return (
                      <tr key={service.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="p-4">
                          <button onClick={() => toggleSelection(service.id)}>
                            {selectedServices.includes(service.id) ? (
                              <CheckSquare className="w-4 h-4 text-primary" />
                            ) : (
                              <Square className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent">
                              <CategoryIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{service.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">{service.provider}</span>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className="text-sm">{service.minQty.toLocaleString()} - {service.maxQty.toLocaleString()}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">${service.price.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">/1k</span>
                        </td>
                        <td className="p-4">
                          <Switch 
                            checked={service.status} 
                            onCheckedChange={() => toggleServiceStatus(service.id)}
                          />
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => deleteService(service.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredServices.length === 0 && (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No services found</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} {selectedServices.length} service(s)?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={executeBulkAction}
              variant={bulkAction === "delete" ? "destructive" : "default"}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManagement;
