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
  Eye,
  RefreshCw,
  Check,
  Loader2,
  Percent,
  Target,
  FileText,
  FileSpreadsheet
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportToCSV, exportToPDF, serviceColumns } from "@/lib/export-utils";
import { PricingOptimizer } from "@/components/panel/PricingOptimizer";
import { supabase } from "@/integrations/supabase/client";

// Mock data for services
const mockServices = [
  { id: 1, name: "Instagram Followers", category: "instagram", provider: "Provider A", minQty: 100, maxQty: 10000, price: 2.50, originalPrice: 2.00, status: true, orders: 1250, providerId: "p1" },
  { id: 2, name: "Instagram Likes", category: "instagram", provider: "Provider A", minQty: 50, maxQty: 5000, price: 1.20, originalPrice: 0.96, status: true, orders: 3420, providerId: "p1" },
  { id: 3, name: "Facebook Page Likes", category: "facebook", provider: "Provider B", minQty: 100, maxQty: 50000, price: 3.00, originalPrice: 2.40, status: true, orders: 890, providerId: "p2" },
  { id: 4, name: "Twitter Followers", category: "twitter", provider: "Provider A", minQty: 100, maxQty: 20000, price: 2.80, originalPrice: 2.24, status: false, orders: 456, providerId: "p1" },
  { id: 5, name: "YouTube Views", category: "youtube", provider: "Provider C", minQty: 500, maxQty: 100000, price: 0.80, originalPrice: 0.64, status: true, orders: 2340, providerId: "p3" },
  { id: 6, name: "TikTok Likes", category: "tiktok", provider: "Provider B", minQty: 100, maxQty: 50000, price: 1.50, originalPrice: 1.20, status: true, orders: 5670, providerId: "p2" },
  { id: 7, name: "LinkedIn Connections", category: "linkedin", provider: "Provider A", minQty: 50, maxQty: 5000, price: 5.00, originalPrice: 4.00, status: true, orders: 234, providerId: "p1" },
  { id: 8, name: "Telegram Members", category: "telegram", provider: "Provider C", minQty: 100, maxQty: 10000, price: 4.00, originalPrice: 3.20, status: false, orders: 567, providerId: "p3" },
];

// Mock fetched services from provider
const mockFetchedServices = [
  { id: 101, name: "Instagram Followers - Premium", category: "instagram", price: 2.50, minQty: 100, maxQty: 50000, description: "High quality followers with profile pictures" },
  { id: 102, name: "Instagram Followers - Regular", category: "instagram", price: 1.80, minQty: 100, maxQty: 100000, description: "Standard quality followers" },
  { id: 103, name: "Instagram Likes - Real", category: "instagram", price: 1.20, minQty: 50, maxQty: 10000, description: "Real and active users" },
  { id: 104, name: "Instagram Views - Story", category: "instagram", price: 0.50, minQty: 100, maxQty: 50000, description: "Story views from real accounts" },
  { id: 105, name: "YouTube Views - High Retention", category: "youtube", price: 3.00, minQty: 500, maxQty: 100000, description: "80%+ watch time retention" },
  { id: 106, name: "YouTube Subscribers", category: "youtube", price: 5.00, minQty: 100, maxQty: 10000, description: "Real subscribers with notifications" },
  { id: 107, name: "TikTok Followers", category: "tiktok", price: 2.00, minQty: 100, maxQty: 50000, description: "Active TikTok followers" },
  { id: 108, name: "TikTok Likes - Fast", category: "tiktok", price: 0.80, minQty: 100, maxQty: 100000, description: "Fast delivery within 1 hour" },
  { id: 109, name: "Twitter Followers - USA", category: "twitter", price: 4.00, minQty: 100, maxQty: 20000, description: "USA-based followers" },
  { id: 110, name: "Facebook Page Likes", category: "facebook", price: 2.50, minQty: 100, maxQty: 50000, description: "Worldwide page likes" },
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

interface FetchedService {
  id: number;
  name: string;
  category: string;
  price: number;
  minQty: number;
  maxQty: number;
  description: string;
}

const ServicesManagement = () => {
  const [services, setServices] = useState(mockServices);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  
  // Import dialog state
  const [importStep, setImportStep] = useState<"select" | "services">("select");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [globalMarkup, setGlobalMarkup] = useState(25);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedServices, setFetchedServices] = useState<FetchedService[]>([]);
  const [selectedImportServices, setSelectedImportServices] = useState<number[]>([]);
  const [serviceMarkups, setServiceMarkups] = useState<Record<number, number>>({});
  const [importSearchQuery, setImportSearchQuery] = useState("");
  
  // Edit service state
  const [editingService, setEditingService] = useState<typeof mockServices[0] | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    minQty: 0,
    maxQty: 0
  });

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter fetched services for import
  const filteredFetchedServices = fetchedServices.filter(service =>
    service.name.toLowerCase().includes(importSearchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(importSearchQuery.toLowerCase())
  );

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

  // Import functions
  const handleFetchServices = async () => {
    if (!selectedProvider) {
      toast({ title: "Please select a provider", variant: "destructive" });
      return;
    }
    setIsFetching(true);
    // Simulate API fetch
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFetchedServices(mockFetchedServices);
    setSelectedImportServices([]);
    setServiceMarkups({});
    setImportStep("services");
    setIsFetching(false);
  };

  const toggleImportService = (id: number) => {
    setSelectedImportServices(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllImportServices = () => {
    if (selectedImportServices.length === filteredFetchedServices.length) {
      setSelectedImportServices([]);
    } else {
      setSelectedImportServices(filteredFetchedServices.map(s => s.id));
    }
  };

  const getServiceFinalPrice = (service: FetchedService) => {
    const markup = serviceMarkups[service.id] ?? globalMarkup;
    return service.price * (1 + markup / 100);
  };

  const handleImportSelected = () => {
    const newServices = selectedImportServices.map(id => {
      const service = fetchedServices.find(s => s.id === id)!;
      const markup = serviceMarkups[service.id] ?? globalMarkup;
      const finalPrice = service.price * (1 + markup / 100);
      return {
        id: Date.now() + service.id,
        name: service.name,
        category: service.category,
        provider: providers.find(p => p.id === selectedProvider)?.name || "Unknown",
        minQty: service.minQty,
        maxQty: service.maxQty,
        price: parseFloat(finalPrice.toFixed(2)),
        originalPrice: service.price,
        status: true,
        orders: 0,
        providerId: selectedProvider
      };
    });
    
    setServices(prev => [...prev, ...newServices]);
    toast({ title: `${selectedImportServices.length} services imported successfully` });
    resetImportDialog();
  };

  const resetImportDialog = () => {
    setIsImportDialogOpen(false);
    setImportStep("select");
    setSelectedProvider("");
    setGlobalMarkup(25);
    setFetchedServices([]);
    setSelectedImportServices([]);
    setServiceMarkups({});
    setImportSearchQuery("");
  };

  // Edit service functions
  const openEditDialog = (service: typeof mockServices[0]) => {
    setEditingService(service);
    setEditFormData({
      name: service.name,
      description: "",
      price: service.price,
      category: service.category,
      minQty: service.minQty,
      maxQty: service.maxQty
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingService) return;
    
    setServices(prev => prev.map(s =>
      s.id === editingService.id
        ? { ...s, ...editFormData }
        : s
    ));
    toast({ title: "Service updated successfully" });
    setIsEditDialogOpen(false);
    setEditingService(null);
  };

  const handleSyncFromProvider = () => {
    toast({ title: "Syncing from provider...", description: "Service details will be updated shortly" });
    // In real app, would fetch latest data from provider API
    setTimeout(() => {
      toast({ title: "Service synced successfully" });
    }, 1500);
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
          <Dialog open={isImportDialogOpen} onOpenChange={(open) => {
            if (!open) resetImportDialog();
            else setIsImportDialogOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="glass-card border-border/50">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className={cn(
              "glass-card border-border/50",
              importStep === "services" && "max-w-4xl"
            )}>
              <DialogHeader>
                <DialogTitle>
                  {importStep === "select" ? "Import Services from Provider" : "Select Services to Import"}
                </DialogTitle>
                <DialogDescription>
                  {importStep === "select" 
                    ? "Fetch and import services from your connected API providers"
                    : `${fetchedServices.length} services found. Select which ones to import.`
                  }
                </DialogDescription>
              </DialogHeader>
              
              {importStep === "select" ? (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Provider</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
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
                    <Label>Default Price Markup (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={globalMarkup}
                        onChange={(e) => setGlobalMarkup(Number(e.target.value))}
                        className="bg-background/50" 
                      />
                      <Percent className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This markup will be applied to all imported services by default
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetImportDialog}>Cancel</Button>
                    <Button 
                      onClick={handleFetchServices}
                      disabled={isFetching || !selectedProvider}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      {isFetching ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Fetch Services
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {/* Search and Select All */}
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search services..."
                        value={importSearchQuery}
                        onChange={(e) => setImportSearchQuery(e.target.value)}
                        className="pl-9 bg-background/50"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllImportServices}
                      >
                        {selectedImportServices.length === filteredFetchedServices.length ? (
                          <><Square className="w-4 h-4 mr-2" /> Deselect All</>
                        ) : (
                          <><CheckSquare className="w-4 h-4 mr-2" /> Select All</>
                        )}
                      </Button>
                      <Badge variant="secondary" className="px-3 py-1">
                        {selectedImportServices.length} selected
                      </Badge>
                    </div>
                  </div>

                  {/* Global Markup */}
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-background/30">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Global Markup</p>
                      <p className="text-xs text-muted-foreground">Applied to services without custom markup</p>
                    </div>
                    <Input
                      type="number"
                      value={globalMarkup}
                      onChange={(e) => setGlobalMarkup(Number(e.target.value))}
                      className="w-20 bg-background/50"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>

                  {/* Services List */}
                  <ScrollArea className="h-[400px] rounded-lg border border-border/50">
                    <div className="space-y-2 p-2">
                      {filteredFetchedServices.map((service) => {
                        const isSelected = selectedImportServices.includes(service.id);
                        const finalPrice = getServiceFinalPrice(service);
                        const CategoryIcon = getCategoryIcon(service.category);
                        
                        return (
                          <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "p-4 rounded-lg border transition-all cursor-pointer",
                              isSelected 
                                ? "border-primary bg-primary/5" 
                                : "border-border/30 hover:border-border/60 bg-background/30"
                            )}
                            onClick={() => toggleImportService(service.id)}
                          >
                            <div className="flex items-start gap-4">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleImportService(service.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <CategoryIcon className="w-4 h-4 text-primary" />
                                  <span className="font-medium truncate">{service.name}</span>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {service.category}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{service.description}</p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                  <span>Min: {service.minQty.toLocaleString()}</span>
                                  <span>Max: {service.maxQty.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="text-right space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground line-through">
                                    ${service.price.toFixed(2)}
                                  </span>
                                  <span className="text-sm font-semibold text-primary">
                                    ${finalPrice.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    type="number"
                                    placeholder={`${globalMarkup}%`}
                                    value={serviceMarkups[service.id] ?? ""}
                                    onChange={(e) => setServiceMarkups(prev => ({
                                      ...prev,
                                      [service.id]: e.target.value ? Number(e.target.value) : globalMarkup
                                    }))}
                                    className="w-16 h-7 text-xs bg-background/50"
                                  />
                                  <span className="text-xs text-muted-foreground">%</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setImportStep("select")}>
                      Back
                    </Button>
                    <Button
                      onClick={handleImportSelected}
                      disabled={selectedImportServices.length === 0}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Import {selectedImportServices.length} Services
                    </Button>
                  </DialogFooter>
                </div>
              )}
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
                            <div>
                              <span className="font-semibold text-primary">${service.price.toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground ml-1">/1k</span>
                              {service.originalPrice && (
                                <p className="text-xs text-muted-foreground line-through">
                                  ${service.originalPrice.toFixed(2)}
                                </p>
                              )}
                            </div>
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
                                <DropdownMenuItem onClick={() => openEditDialog(service)}>
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

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service details. Changes will affect how this service appears to customers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingService?.provider && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Imported from {editingService.provider}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handleSyncFromProvider}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync from Provider
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your service..."
                className="bg-background/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.id !== "all").map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (per 1000)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="bg-background/50"
                />
                {editingService?.originalPrice && (
                  <p className="text-xs text-muted-foreground">
                    Original: ${editingService.originalPrice.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Quantity</Label>
                <Input
                  type="number"
                  value={editFormData.minQty}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, minQty: Number(e.target.value) }))}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Quantity</Label>
                <Input
                  type="number"
                  value={editFormData.maxQty}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, maxQty: Number(e.target.value) }))}
                  className="bg-background/50"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-primary to-primary/80">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManagement;
