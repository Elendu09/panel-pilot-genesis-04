import { useState, useMemo, useEffect } from "react";
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
  Settings2,
  Palette,
  ChevronLeft,
  ChevronRight,
  Sparkles
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
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { detectPlatform, getServiceIcon, autoAssignIconsAndCategories } from "@/lib/service-icon-detection";

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

const categories = [
  { id: "all", name: "All Services", icon: Layers },
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "facebook", name: "Facebook", icon: Facebook },
  { id: "twitter", name: "Twitter/X", icon: Twitter },
  { id: "youtube", name: "YouTube", icon: Youtube },
  { id: "tiktok", name: "TikTok", icon: Hash },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
  { id: "telegram", name: "Telegram", icon: MessageCircle },
  { id: "spotify", name: "Spotify", icon: Globe },
  { id: "soundcloud", name: "SoundCloud", icon: Globe },
  { id: "audiomack", name: "Audiomack", icon: Globe },
  { id: "twitch", name: "Twitch", icon: Globe },
  { id: "discord", name: "Discord", icon: Globe },
  { id: "pinterest", name: "Pinterest", icon: Globe },
  { id: "snapchat", name: "Snapchat", icon: Globe },
  { id: "threads", name: "Threads", icon: Globe },
  { id: "other", name: "Other", icon: Globe },
];

type SortOption = "default" | "price-high" | "price-low" | "orders-high" | "orders-low" | "name";

const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100, 200];

const ServicesManagement = () => {
  const isMobile = useIsMobile();
  const { panel, loading: panelLoading } = usePanel();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [providers, setProviders] = useState<Array<{ id: string; name: string; api_endpoint?: string; api_key?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkIconDialogOpen, setIsBulkIconDialogOpen] = useState(false);
  const [isBulkCategoryDialogOpen, setIsBulkCategoryDialogOpen] = useState(false);
  const [isAutoFixingIcons, setIsAutoFixingIcons] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [bulkMarkup, setBulkMarkup] = useState(25);
  const [selectedBulkIcon, setSelectedBulkIcon] = useState<string>("");
  const [selectedBulkCategory, setSelectedBulkCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // New service form
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category: 'instagram',
    price: '',
    minQty: '100',
    maxQty: '10000',
    imageUrl: '',
  });
  
  // Edit service state
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortOption, itemsPerPage]);

  // Fetch services with server-side pagination
  useEffect(() => {
    if (!panel?.id) return;
    fetchServices();
  }, [panel?.id, currentPage, itemsPerPage, selectedCategory, debouncedSearch, sortOption]);

  // Fetch providers
  useEffect(() => {
    if (!panel?.id) return;
    fetchProviders();
  }, [panel?.id]);

  const fetchProviders = async () => {
    if (!panel?.id) return;
    const { data } = await supabase
      .from('providers')
      .select('id, name, api_endpoint, api_key')
      .eq('panel_id', panel.id)
      .eq('is_active', true);
    setProviders(data || []);
  };

  const fetchServices = async () => {
    if (!panel?.id) return;
    
    setLoading(true);
    try {
      // Build query with server-side filtering
      let query = supabase
        .from('services')
        .select('*', { count: 'exact' })
        .eq('panel_id', panel.id);

      // Category filter (cast to any for dynamic category values)
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory as any);
      }

      // Search filter
      if (debouncedSearch) {
        query = query.ilike('name', `%${debouncedSearch}%`);
      }

      // Sorting
      switch (sortOption) {
        case "price-high":
          query = query.order('price', { ascending: false });
          break;
        case "price-low":
          query = query.order('price', { ascending: true });
          break;
        case "name":
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('display_order', { ascending: true });
      }

      // Pagination with range
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setTotalCount(count || 0);

      const mappedServices: ServiceItem[] = (data || []).map((s, index) => ({
        id: s.id,
        displayId: from + index + 1,
        name: s.name,
        category: s.category,
        provider: s.provider_id || 'Direct',
        minQty: s.min_quantity || 100,
        maxQty: s.max_quantity || 10000,
        price: Number(s.price),
        originalPrice: Number(s.price) * 0.8,
        status: s.is_active ?? true,
        orders: 0,
        providerId: s.provider_id || '',
        displayOrder: s.display_order || index + 1,
        description: s.description,
        imageUrl: s.image_url,
      }));

      setServices(mappedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({ title: 'Error loading services', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch category counts separately for sidebar
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({ all: 0 });
  
  useEffect(() => {
    if (!panel?.id) return;
    fetchCategoryCounts();
  }, [panel?.id]);

  const fetchCategoryCounts = async () => {
    if (!panel?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('category')
        .eq('panel_id', panel.id);

      if (error) throw error;

      const counts: Record<string, number> = { all: data?.length || 0 };
      data?.forEach((s) => {
        counts[s.category] = (counts[s.category] || 0) + 1;
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

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

  // Pagination (server-side - services are already paginated)
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Stats
  const totalServices = totalCount;
  const activeServices = categoryCounts.all || 0;
  const totalOrders = 0; // Server-side would need separate query
  const avgPrice = services.length > 0 ? (services.reduce((acc, s) => acc + s.price, 0) / services.length).toFixed(2) : '0.00';

  // Category icon getter
  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Globe;
  };

  // Drag end handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = services.findIndex((item) => item.id === active.id);
      const newIndex = services.findIndex((item) => item.id === over.id);
      
      const newOrder = arrayMove(services, oldIndex, newIndex);
      const updatedOrder = newOrder.map((item, index) => ({
        ...item,
        displayOrder: index + 1,
      }));
      
      setServices(updatedOrder);
      
      // Update in Supabase
      try {
        await Promise.all(updatedOrder.map(s => 
          supabase.from('services').update({ display_order: s.displayOrder }).eq('id', s.id)
        ));
        toast({ title: "Service order updated" });
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }
  };

  // Toggle service status
  const toggleServiceStatus = async (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;

    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.status })
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.map(s => 
        s.id === id ? { ...s, status: !s.status } : s
      ));
      toast({ title: "Service status updated" });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Select all (current page only for server-side pagination)
  const selectAll = () => {
    if (selectedServices.length === services.length && services.length > 0) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map(s => s.id));
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

  const executeBulkAction = async () => {
    try {
      switch (bulkAction) {
        case "enable":
          await supabase.from('services').update({ is_active: true }).in('id', selectedServices);
          setServices(prev => prev.map(s => 
            selectedServices.includes(s.id) ? { ...s, status: true } : s
          ));
          toast({ title: `${selectedServices.length} services enabled` });
          break;
        case "disable":
          await supabase.from('services').update({ is_active: false }).in('id', selectedServices);
          setServices(prev => prev.map(s => 
            selectedServices.includes(s.id) ? { ...s, status: false } : s
          ));
          toast({ title: `${selectedServices.length} services disabled` });
          break;
        case "delete":
          await supabase.from('services').delete().in('id', selectedServices);
          setServices(prev => prev.filter(s => !selectedServices.includes(s.id)));
          toast({ title: `${selectedServices.length} services deleted` });
          break;
        case "export-csv":
          const exportData = services.filter(s => selectedServices.includes(s.id));
          exportToCSV(exportData, serviceColumns, `services-export-${Date.now()}`);
          toast({ title: `${selectedServices.length} services exported to CSV` });
          break;
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({ title: 'Action failed', variant: 'destructive' });
    }
    setSelectedServices([]);
    setIsBulkDialogOpen(false);
  };

  // Bulk icon assignment
  const executeBulkIconAssignment = async () => {
    if (!selectedBulkIcon) {
      toast({ title: "Please select an icon", variant: "destructive" });
      return;
    }
    
    try {
      await supabase
        .from('services')
        .update({ image_url: `icon:${selectedBulkIcon}` })
        .in('id', selectedServices);
      
      setServices(prev => prev.map(s => 
        selectedServices.includes(s.id) ? { ...s, imageUrl: `icon:${selectedBulkIcon}` } : s
      ));
      
      toast({ title: `Icon applied to ${selectedServices.length} services` });
      setSelectedServices([]);
      setIsBulkIconDialogOpen(false);
      setSelectedBulkIcon("");
    } catch (error) {
      console.error('Bulk icon error:', error);
      toast({ title: 'Failed to assign icons', variant: 'destructive' });
    }
  };

  // Bulk category assignment
  const executeBulkCategoryAssignment = async () => {
    if (!selectedBulkCategory) {
      toast({ title: "Please select a category", variant: "destructive" });
      return;
    }
    
    try {
      await supabase
        .from('services')
        .update({ 
          category: selectedBulkCategory as any,
          image_url: `icon:${selectedBulkCategory}` 
        })
        .in('id', selectedServices);
      
      setServices(prev => prev.map(s => 
        selectedServices.includes(s.id) 
          ? { ...s, category: selectedBulkCategory, imageUrl: `icon:${selectedBulkCategory}` } 
          : s
      ));
      
      toast({ title: `Category changed for ${selectedServices.length} services` });
      setSelectedServices([]);
      setIsBulkCategoryDialogOpen(false);
      setSelectedBulkCategory("");
      fetchCategoryCounts(); // Refresh counts
    } catch (error) {
      console.error('Bulk category error:', error);
      toast({ title: 'Failed to change category', variant: 'destructive' });
    }
  };
  // Auto-fix icons for all services
  const handleAutoFixIcons = async () => {
    if (services.length === 0) {
      toast({ title: "No services to fix", variant: "destructive" });
      return;
    }

    setIsAutoFixingIcons(true);
    
    try {
      const updates = services.map((service) => {
        const detectedCategory = detectPlatform(service.name);
        const iconUrl = `icon:${detectedCategory}`;
        return {
          id: service.id,
          category: detectedCategory,
          image_url: iconUrl,
        };
      });

      // Batch update in chunks of 100
      const chunkSize = 100;
      for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map((update) =>
            supabase
              .from('services')
              .update({ category: update.category as any, image_url: update.image_url })
              .eq('id', update.id)
          )
        );
      }

      // Update local state
      setServices((prev) =>
        prev.map((s) => {
          const update = updates.find((u) => u.id === s.id);
          if (update) {
            return { ...s, category: update.category, imageUrl: update.image_url };
          }
          return s;
        })
      );

      toast({ title: `Auto-fixed icons for ${services.length} services` });
    } catch (error) {
      console.error('Auto-fix error:', error);
      toast({ title: 'Failed to auto-fix icons', variant: 'destructive' });
    } finally {
      setIsAutoFixingIcons(false);
    }
  };

  // Delete service
  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      
      setServices(prev => prev.filter(s => s.id !== id));
      toast({ title: "Service deleted" });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  // Create service
  const handleCreateService = async () => {
    if (!panel?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          panel_id: panel.id,
          name: newService.name,
          description: newService.description,
          category: newService.category as any,
          price: parseFloat(newService.price) || 0,
          min_quantity: parseInt(newService.minQty) || 100,
          max_quantity: parseInt(newService.maxQty) || 10000,
          image_url: newService.imageUrl || null,
          is_active: true,
          display_order: services.length + 1,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Service created successfully" });
      setIsAddDialogOpen(false);
      setNewService({ name: '', description: '', category: 'instagram', price: '', minQty: '100', maxQty: '10000', imageUrl: '' });
      fetchServices();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({ title: 'Failed to create service', variant: 'destructive' });
    }
  };

  // Edit service
  const openEditDialog = (service: ServiceItem) => {
    setEditingService(service);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (updatedService: any) => {
    if (!editingService) return;
    
    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: updatedService.name,
          description: updatedService.description,
          price: updatedService.price,
          category: updatedService.category,
          min_quantity: updatedService.minQty,
          max_quantity: updatedService.maxQty,
          image_url: updatedService.imageUrl,
        })
        .eq('id', editingService.id);

      if (error) throw error;

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
    } catch (error) {
      console.error('Error updating:', error);
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  // Import handler
  const handleImport = async (importedServices: any[], markups: Record<number, number>) => {
    if (!panel?.id) return;
    
    try {
      const newServices = importedServices.map((service, index) => ({
        panel_id: panel.id,
        name: service.name,
        category: service.category || 'other',
        price: service.price * (1 + (markups[service.id] || 25) / 100),
        min_quantity: service.minQty || 100,
        max_quantity: service.maxQty || 10000,
        is_active: true,
        display_order: services.length + index + 1,
      }));

      const { error } = await supabase.from('services').insert(newServices);
      if (error) throw error;

      toast({ title: `${importedServices.length} services imported successfully` });
      fetchServices();
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: 'Import failed', variant: 'destructive' });
    }
  };

  if (loading || panelLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl"></div>)}
        </div>
      </div>
    );
  }

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

          <Button 
            variant="outline" 
            size="sm" 
            className="glass-card border-border/50"
            onClick={handleAutoFixIcons}
            disabled={isAutoFixingIcons || services.length === 0}
          >
            {isAutoFixingIcons ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Auto-Fix Icons
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
                  <Input 
                    placeholder="e.g., Instagram Followers - Premium" 
                    className="bg-background/50"
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe your service..." 
                    className="bg-background/50"
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={newService.category} 
                      onValueChange={(v) => setNewService(prev => ({ ...prev, category: v }))}
                    >
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
                    <Label>Price (per 1k)</Label>
                    <Input 
                      type="number" 
                      placeholder="2.50" 
                      step="0.01" 
                      className="bg-background/50"
                      value={newService.price}
                      onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Qty</Label>
                    <Input 
                      type="number" 
                      placeholder="100" 
                      className="bg-background/50"
                      value={newService.minQty}
                      onChange={(e) => setNewService(prev => ({ ...prev, minQty: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Qty</Label>
                    <Input 
                      type="number" 
                      placeholder="10000" 
                      className="bg-background/50"
                      value={newService.maxQty}
                      onChange={(e) => setNewService(prev => ({ ...prev, maxQty: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Service Image URL (optional)
                  </Label>
                  <Input 
                    placeholder="https://..." 
                    className="bg-background/50"
                    value={newService.imageUrl}
                    onChange={(e) => setNewService(prev => ({ ...prev, imageUrl: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateService} 
                  className="bg-gradient-to-r from-primary to-primary/80"
                  disabled={!newService.name || !newService.price}
                >
                  Create Service
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Total Services", value: totalServices, icon: Package, color: "primary" },
          { label: "Active", value: activeServices, icon: Power, color: "green-500" },
          { label: "Total Orders", value: totalOrders.toLocaleString(), icon: TrendingUp, color: "blue-500" },
          { label: "Avg Price", value: `$${avgPrice}`, icon: DollarSign, color: "amber-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card-hover overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl", stat.color === "primary" ? "bg-primary/10" : `bg-${stat.color}/10`)}>
                    <stat.icon className={cn("w-5 h-5", stat.color === "primary" ? "text-primary" : `text-${stat.color}`)} />
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-3 flex flex-wrap items-center justify-between gap-3"
          >
            <span className="text-sm font-medium">{selectedServices.length} selected</span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("enable")}>
                <Power className="w-3 h-3 mr-1" /> Enable
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("disable")}>
                <Power className="w-3 h-3 mr-1" /> Disable
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("export-csv")}>
                <Download className="w-3 h-3 mr-1" /> Export
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsBulkIconDialogOpen(true)}>
                <Palette className="w-3 h-3 mr-1" /> Set Icon
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsBulkCategoryDialogOpen(true)}>
                <Layers className="w-3 h-3 mr-1" /> Change Category
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Category Sidebar - Desktop */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block w-56 shrink-0 space-y-2"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "glass-card hover:bg-accent/50"
              )}
            >
              <cat.icon className="w-4 h-4" />
              <span className="flex-1 text-left text-sm font-medium">{cat.name}</span>
              <Badge variant="secondary" className="text-xs">
                {categoryCounts[cat.id] || 0}
              </Badge>
            </button>
          ))}
        </motion.div>

        {/* Services List */}
        <div className="flex-1 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-9 bg-card/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Mobile Category Select */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40 lg:hidden bg-card/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-40 bg-card/50">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="orders-high">Orders: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Services */}
          {services.length === 0 && !loading ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No services found</h3>
                <p className="text-muted-foreground mb-4">
                  {totalCount === 0 
                    ? "Get started by adding your first service" 
                    : "Try adjusting your search or filters"}
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={services.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Card className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border/50 bg-muted/30">
                            <th className="text-left p-4 w-8">
                              <button onClick={selectAll}>
                                {selectedServices.length === services.length && services.length > 0 ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </th>
                            <th className="text-left p-4">Service</th>
                            <th className="text-left p-4 hidden md:table-cell">Category</th>
                            <th className="text-left p-4 hidden lg:table-cell">Qty Range</th>
                            <th className="text-left p-4">Price</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((service) => (
                            <DraggableServiceItem
                              key={service.id}
                              service={service}
                              isSelected={selectedServices.includes(service.id)}
                              onToggleSelect={() => toggleSelection(service.id)}
                              onToggleStatus={() => toggleServiceStatus(service.id)}
                              onEdit={() => openEditDialog(service)}
                              onDelete={() => deleteService(service.id)}
                              onView={() => openEditDialog(service)}
                              getCategoryIcon={getCategoryIcon}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </SortableContext>
              </DndContext>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(parseInt(v))}>
                      <SelectTrigger className="w-20 h-8 bg-card/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt.toString()}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>per page</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="hidden sm:flex"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages: (number | string)[] = [];
                        const showPages = 5;
                        let start = Math.max(1, currentPage - Math.floor(showPages / 2));
                        let end = Math.min(totalPages, start + showPages - 1);
                        
                        if (end - start + 1 < showPages) {
                          start = Math.max(1, end - showPages + 1);
                        }

                        if (start > 1) {
                          pages.push(1);
                          if (start > 2) pages.push('...');
                        }

                        for (let i = start; i <= end; i++) {
                          pages.push(i);
                        }

                        if (end < totalPages) {
                          if (end < totalPages - 1) pages.push('...');
                          pages.push(totalPages);
                        }

                        return pages.map((page, idx) => (
                          typeof page === 'number' ? (
                            <Button
                              key={idx}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className={cn("h-8 w-8", currentPage === page && "bg-primary")}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          ) : (
                            <span key={idx} className="px-1 text-muted-foreground">...</span>
                          )
                        ));
                      })()}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="hidden sm:flex"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
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
            <Button onClick={executeBulkAction} variant={bulkAction === "delete" ? "destructive" : "default"}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog - Connected to Real Providers */}
      <ServiceImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
        providers={providers.length > 0 ? providers : [{ id: 'direct', name: 'Direct (No providers configured)' }]}
        getCategoryIcon={getCategoryIcon}
      />

      {/* Edit Dialog */}
      {editingService && (
        <ServiceEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          service={editingService}
          onSave={handleSaveEdit}
        />
      )}

      {/* Bulk Icon Assignment Dialog */}
      <Dialog open={isBulkIconDialogOpen} onOpenChange={setIsBulkIconDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Assign Icon to {selectedServices.length} Services
            </DialogTitle>
            <DialogDescription>
              Select an icon to apply to all selected services
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-6 gap-2 p-3 bg-muted/30 rounded-lg border border-border/50 max-h-[300px] overflow-y-auto">
            {Object.entries(SOCIAL_ICONS_MAP).map(([key, { icon: IconComponent, label, bgColor }]) => {
              const isSelected = selectedBulkIcon === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedBulkIcon(key)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:scale-105",
                    isSelected 
                      ? "ring-2 ring-primary bg-primary/10" 
                      : "hover:bg-muted/50"
                  )}
                  title={label}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgColor)}>
                    <IconComponent className="text-white" size={16} />
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedBulkIcon && (
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
              <span className="text-sm">Selected:</span>
              {(() => {
                const iconData = SOCIAL_ICONS_MAP[selectedBulkIcon];
                if (iconData) {
                  const IconComponent = iconData.icon;
                  return (
                    <div className={cn("w-6 h-6 rounded flex items-center justify-center", iconData.bgColor)}>
                      <IconComponent className="text-white" size={14} />
                    </div>
                  );
                }
                return null;
              })()}
              <span className="text-sm font-medium">{SOCIAL_ICONS_MAP[selectedBulkIcon]?.label}</span>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsBulkIconDialogOpen(false); setSelectedBulkIcon(""); }}>
              Cancel
            </Button>
            <Button onClick={executeBulkIconAssignment} disabled={!selectedBulkIcon}>
              Apply to {selectedServices.length} Services
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Category Assignment Dialog */}
      <Dialog open={isBulkCategoryDialogOpen} onOpenChange={setIsBulkCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Change Category for {selectedServices.length} Services
            </DialogTitle>
            <DialogDescription>
              Select a category to move all selected services
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto p-1">
            {categories.filter(c => c.id !== 'all').map((cat) => {
              const isSelected = selectedBulkCategory === cat.id;
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedBulkCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    isSelected 
                      ? "ring-2 ring-primary bg-primary/10 border-primary" 
                      : "border-border/50 hover:bg-muted/50"
                  )}
                >
                  <div className="p-2 rounded-lg bg-muted">
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {selectedBulkCategory && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <span className="text-sm">Moving to:</span>
              {(() => {
                const cat = categories.find(c => c.id === selectedBulkCategory);
                if (cat) {
                  const CatIcon = cat.icon;
                  return (
                    <>
                      <div className="p-1.5 rounded bg-muted">
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </>
                  );
                }
                return null;
              })()}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsBulkCategoryDialogOpen(false); setSelectedBulkCategory(""); }}>
              Cancel
            </Button>
            <Button onClick={executeBulkCategoryAssignment} disabled={!selectedBulkCategory}>
              Move {selectedServices.length} Services
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManagement;