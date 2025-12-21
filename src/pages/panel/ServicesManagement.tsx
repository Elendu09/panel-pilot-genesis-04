import { useState, useMemo } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
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
  RefreshCw,
  Loader2,
  Percent,
  FileText,
  FileSpreadsheet,
  GripVertical,
  Image,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings2
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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportToCSV, exportToPDF, serviceColumns } from "@/lib/export-utils";
import { useIsMobile } from "@/hooks/use-mobile";

// DnD Kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { DraggableServiceItem, ServiceItem } from "@/components/services/DraggableServiceItem";
import { ServiceImportDialog } from "@/components/services/ServiceImportDialog";
import { ServiceEditDialog } from "@/components/services/ServiceEditDialog";

// Mock data
const createMockServices = (): ServiceItem[] => [
  { id: "s1", displayId: 1, name: "Instagram Followers", category: "instagram", provider: "Provider A", minQty: 100, maxQty: 10000, price: 2.50, originalPrice: 2.00, status: true, orders: 1250, providerId: "p1", displayOrder: 1 },
  { id: "s2", displayId: 2, name: "Instagram Likes", category: "instagram", provider: "Provider A", minQty: 50, maxQty: 5000, price: 1.20, originalPrice: 0.96, status: true, orders: 3420, providerId: "p1", displayOrder: 2 },
  { id: "s3", displayId: 3, name: "Facebook Page Likes", category: "facebook", provider: "Provider B", minQty: 100, maxQty: 50000, price: 3.00, originalPrice: 2.40, status: true, orders: 890, providerId: "p2", displayOrder: 3 },
  { id: "s4", displayId: 4, name: "Twitter Followers", category: "twitter", provider: "Provider A", minQty: 100, maxQty: 20000, price: 2.80, originalPrice: 2.24, status: false, orders: 456, providerId: "p1", displayOrder: 4 },
  { id: "s5", displayId: 5, name: "YouTube Views", category: "youtube", provider: "Provider C", minQty: 500, maxQty: 100000, price: 0.80, originalPrice: 0.64, status: true, orders: 2340, providerId: "p3", displayOrder: 5 },
  { id: "s6", displayId: 6, name: "TikTok Likes", category: "tiktok", provider: "Provider B", minQty: 100, maxQty: 50000, price: 1.50, originalPrice: 1.20, status: true, orders: 5670, providerId: "p2", displayOrder: 6 },
  { id: "s7", displayId: 7, name: "LinkedIn Connections", category: "linkedin", provider: "Provider A", minQty: 50, maxQty: 5000, price: 5.00, originalPrice: 4.00, status: true, orders: 234, providerId: "p1", displayOrder: 7 },
  { id: "s8", displayId: 8, name: "Telegram Members", category: "telegram", provider: "Provider C", minQty: 100, maxQty: 10000, price: 4.00, originalPrice: 3.20, status: false, orders: 567, providerId: "p3", displayOrder: 8 },
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

type SortOption = "default" | "price-high" | "price-low" | "orders-high" | "orders-low" | "name";

const ServicesManagement = () => {
  const isMobile = useIsMobile();
  const [services, setServices] = useState<ServiceItem[]>(createMockServices);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [bulkMarkup, setBulkMarkup] = useState(25);
  
  // Edit service state
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let result = services.filter(service => {
      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Apply sorting
    switch (sortOption) {
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "orders-high":
        result = [...result].sort((a, b) => b.orders - a.orders);
        break;
      case "orders-low":
        result = [...result].sort((a, b) => a.orders - b.orders);
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result = [...result].sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return result;
  }, [services, selectedCategory, searchQuery, sortOption]);

  // Stats
  const totalServices = services.length;
  const activeServices = services.filter(s => s.status).length;
  const totalOrders = services.reduce((acc, s) => acc + s.orders, 0);
  const avgPrice = (services.reduce((acc, s) => acc + s.price, 0) / services.length).toFixed(2);

  // Category icon getter
  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Globe;
  };

  // Drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setServices((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        // Update display order
        return newOrder.map((item, index) => ({
          ...item,
          displayOrder: index + 1,
        }));
      });
      toast({ title: "Service order updated" });
    }
  };

  // Toggle service status
  const toggleServiceStatus = (id: string) => {
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, status: !s.status } : s
    ));
    toast({ title: "Service status updated" });
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
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
      case "markup":
        setServices(prev => prev.map(s => {
          if (selectedServices.includes(s.id)) {
            const newPrice = s.originalPrice * (1 + bulkMarkup / 100);
            return { ...s, price: parseFloat(newPrice.toFixed(2)) };
          }
          return s;
        }));
        toast({ title: `${selectedServices.length} services updated with ${bulkMarkup}% markup` });
        break;
      case "export-csv":
        const exportData = services.filter(s => selectedServices.includes(s.id));
        exportToCSV(exportData, serviceColumns, `services-export-${Date.now()}`);
        toast({ title: `${selectedServices.length} services exported to CSV` });
        break;
      case "export-pdf":
        const pdfData = services.filter(s => selectedServices.includes(s.id));
        exportToPDF(pdfData, serviceColumns, "Services Export", `services-export-${Date.now()}`);
        toast({ title: `${selectedServices.length} services exported to PDF` });
        break;
    }
    setSelectedServices([]);
    setIsBulkDialogOpen(false);
  };

  // Delete service
  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    toast({ title: "Service deleted" });
  };

  // Edit service
  const openEditDialog = (service: ServiceItem) => {
    setEditingService(service);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedService: any) => {
    if (!editingService) return;
    
    setServices(prev => prev.map(s =>
      s.id === editingService.id
        ? { 
            ...s, 
            name: updatedService.name,
            description: updatedService.description,
            price: updatedService.price,
            category: updatedService.category,
            minQty: updatedService.minQty,
            maxQty: updatedService.maxQty,
            imageUrl: updatedService.imageUrl,
          }
        : s
    ));
    toast({ title: "Service updated successfully" });
    setIsEditDialogOpen(false);
    setEditingService(null);
  };

  // Import handler
  const handleImport = (importedServices: any[], markups: Record<number, number>) => {
    const newServices = importedServices.map((service, index) => ({
      id: `imported-${Date.now()}-${service.id}`,
      displayId: services.length + index + 1,
      name: service.name,
      category: service.category,
      provider: "Imported",
      minQty: service.minQty,
      maxQty: service.maxQty,
      price: parseFloat((service.price * (1 + (markups[service.id] || 25) / 100)).toFixed(2)),
      originalPrice: service.price,
      status: true,
      orders: 0,
      providerId: "imported",
      displayOrder: services.length + index + 1,
    }));
    
    setServices(prev => [...prev, ...newServices]);
    toast({ title: `${importedServices.length} services imported successfully` });
  };

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Services Management
          </h1>
          <p className="text-sm text-muted-foreground">Manage your SMM services, pricing, and providers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-card border-border/50"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>Create a new service for your panel</DialogDescription>
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
                    <Label>Price (per 1k)</Label>
                    <Input type="number" placeholder="2.50" step="0.01" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Qty</Label>
                    <Input type="number" placeholder="100" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Qty</Label>
                    <Input type="number" placeholder="10000" className="bg-background/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Service Image URL (optional)
                  </Label>
                  <Input placeholder="https://..." className="bg-background/50" />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Services", value: totalServices, icon: Package, color: "primary" },
          { label: "Active", value: activeServices, icon: Power, color: "emerald" },
          { label: "Total Orders", value: totalOrders.toLocaleString(), icon: TrendingUp, color: "blue" },
          { label: "Avg. Price", value: `$${avgPrice}`, icon: DollarSign, color: "amber" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card-hover overflow-hidden">
              <CardContent className="p-3 sm:p-4 relative">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={cn(
                    "p-2 sm:p-2.5 rounded-xl",
                    stat.color === "primary" ? "bg-primary/10" : 
                    stat.color === "emerald" ? "bg-emerald-500/10" :
                    stat.color === "blue" ? "bg-blue-500/10" : "bg-amber-500/10"
                  )}>
                    <stat.icon className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5",
                      stat.color === "primary" ? "text-primary" : 
                      stat.color === "emerald" ? "text-emerald-500" :
                      stat.color === "blue" ? "text-blue-500" : "text-amber-500"
                    )} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-bold truncate">{stat.value}</p>
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
            className="glass-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/30"
          >
            <span className="text-sm font-medium">
              <span className="text-primary">{selectedServices.length}</span> services selected
            </span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("enable")}>
                <Power className="w-4 h-4 mr-1" /> Enable
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("disable")}>
                <Power className="w-4 h-4 mr-1" /> Disable
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("markup")}>
                <Percent className="w-4 h-4 mr-1" /> Markup
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction("export-csv")}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("export-pdf")}>
                    <FileText className="w-4 h-4 mr-2" /> Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Categories Sidebar - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:block"
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
          {/* Search, Filter & Sort */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3"
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
            
            {/* Mobile Category Filter */}
            <div className="flex gap-2 lg:hidden">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1 bg-card/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                <SelectTrigger className="w-40 bg-card/50">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <span className="flex items-center gap-2"><GripVertical className="w-4 h-4" /> Custom Order</span>
                  </SelectItem>
                  <SelectItem value="price-high">
                    <span className="flex items-center gap-2"><ArrowUp className="w-4 h-4" /> Price: High to Low</span>
                  </SelectItem>
                  <SelectItem value="price-low">
                    <span className="flex items-center gap-2"><ArrowDown className="w-4 h-4" /> Price: Low to High</span>
                  </SelectItem>
                  <SelectItem value="orders-high">
                    <span className="flex items-center gap-2"><ArrowUp className="w-4 h-4" /> Orders: High to Low</span>
                  </SelectItem>
                  <SelectItem value="orders-low">
                    <span className="flex items-center gap-2"><ArrowDown className="w-4 h-4" /> Orders: Low to High</span>
                  </SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={selectAll} className="shrink-0">
                {selectedServices.length === filteredServices.length ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <CheckSquare className="w-4 h-4" />
                )}
              </Button>
            </div>
          </motion.div>

          {/* Services Table/Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card overflow-hidden">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredServices.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {isMobile ? (
                    // Mobile: Card Layout
                    <div className="p-3 space-y-3">
                      {filteredServices.map((service) => (
                        <DraggableServiceItem
                          key={service.id}
                          service={service}
                          isSelected={selectedServices.includes(service.id)}
                          onToggleSelect={toggleSelection}
                          onToggleStatus={toggleServiceStatus}
                          onEdit={openEditDialog}
                          onDelete={deleteService}
                          onView={openEditDialog}
                          getCategoryIcon={getCategoryIcon}
                          isMobile={true}
                        />
                      ))}
                    </div>
                  ) : (
                    // Desktop: Table Layout
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border/50">
                          <tr>
                            <th className="py-3 px-2 text-left text-xs font-medium text-muted-foreground w-16">
                              <GripVertical className="w-4 h-4 inline mr-1" />
                            </th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-muted-foreground">ID</th>
                            <th className="py-3 px-2 text-left text-xs font-medium text-muted-foreground">Service</th>
                            <th className="py-3 px-2 text-center text-xs font-medium text-muted-foreground">Quantity</th>
                            <th className="py-3 px-2 text-right text-xs font-medium text-muted-foreground">Price</th>
                            <th className="py-3 px-2 text-center text-xs font-medium text-muted-foreground">Orders</th>
                            <th className="py-3 px-2 text-center text-xs font-medium text-muted-foreground">Status</th>
                            <th className="py-3 px-2 text-center text-xs font-medium text-muted-foreground w-12">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredServices.map((service) => (
                            <DraggableServiceItem
                              key={service.id}
                              service={service}
                              isSelected={selectedServices.includes(service.id)}
                              onToggleSelect={toggleSelection}
                              onToggleStatus={toggleServiceStatus}
                              onEdit={openEditDialog}
                              onDelete={deleteService}
                              onView={openEditDialog}
                              getCategoryIcon={getCategoryIcon}
                              isMobile={false}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SortableContext>
              </DndContext>

              {filteredServices.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No services found</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Import Dialog */}
      <ServiceImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        providers={providers}
        getCategoryIcon={getCategoryIcon}
        onImport={handleImport}
      />

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "delete" ? "Confirm Delete" : 
               bulkAction === "markup" ? "Bulk Update Markup" :
               "Confirm Action"}
            </DialogTitle>
            <DialogDescription>
              {bulkAction === "delete" 
                ? `Are you sure you want to delete ${selectedServices.length} services?`
                : bulkAction === "markup"
                ? `Set markup percentage for ${selectedServices.length} selected services`
                : `This will ${bulkAction} ${selectedServices.length} services.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {bulkAction === "markup" && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Slider
                  value={[bulkMarkup]}
                  onValueChange={([v]) => setBulkMarkup(v)}
                  max={100}
                  min={0}
                  step={5}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 w-20">
                  <Input
                    type="number"
                    value={bulkMarkup}
                    onChange={(e) => setBulkMarkup(Number(e.target.value))}
                    className="text-center"
                  />
                  <Percent className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                All selected services will have their prices recalculated based on the original provider price.
              </p>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={executeBulkAction}
              variant={bulkAction === "delete" ? "destructive" : "default"}
              className={bulkAction !== "delete" ? "bg-gradient-to-r from-primary to-primary/80" : ""}
            >
              {bulkAction === "delete" ? "Delete" : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog - Using new tabbed ServiceEditDialog */}
      <ServiceEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        service={editingService ? {
          id: editingService.id,
          name: editingService.name,
          description: "",
          category: editingService.category,
          provider: editingService.provider,
          originalPrice: editingService.originalPrice,
          price: editingService.price,
          minQty: editingService.minQty,
          maxQty: editingService.maxQty,
          imageUrl: editingService.imageUrl,
          orders: editingService.orders,
        } : null}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default ServicesManagement;