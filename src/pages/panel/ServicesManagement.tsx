import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Package, 
  Plus, 
  Search,
  X,
  Filter, 
  Edit, 
  Trash2,
  Upload,
  Download,
  CheckSquare,
  Square,
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
  Sparkles,
  Hand,
  Wand2,
  Copy,
  SlidersHorizontal,
  Clock,
  CopyPlus,
  BarChart2,
  Tag,
  Star,
  Info,
  Zap
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { detectPlatform, getServiceIcon, autoAssignIconsAndCategories, detectServiceType, detectPlatformEnhanced } from "@/lib/service-icon-detection";

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
import { ServiceResyncDialog } from "@/components/services/ServiceResyncDialog";
import { ServiceEditSheet } from "@/components/services/ServiceEditSheet";
import { ServiceViewDialog } from "@/components/services/ServiceViewDialog";
import { MobileServiceView } from "@/components/services/MobileServiceView";
import { FloatingUndoButton } from "@/components/services/FloatingUndoButton";
import { useUndoRedoHistory } from "@/hooks/use-undo-redo-history";
import { ServiceTips } from "@/components/services/ServiceTips";
import { SmartOrganizeDialog } from "@/components/services/SmartOrganizeDialog";
import { ServiceAnalytics } from "@/components/services/ServiceAnalytics";
import { ServiceKanbanCard } from "@/components/services/ServiceKanbanCard";
import { ServiceToolsCards } from "@/components/services/ServiceToolsCards";

import { BulkProgressModal } from "@/components/services/BulkProgressModal";
import { AutoFixProgressDialog, AutoFixProgress } from "@/components/services/AutoFixProgressDialog";
import { BulkOperationHistory } from "@/components/services/BulkOperationHistory";
import { CategoryManagementDialog, CategoryPreset } from "@/components/services/CategoryManagementDialog";
import { AdvancedFiltersSheet, ServiceFilters, countActiveFilters } from "@/components/services/AdvancedFiltersSheet";
import { IconPickerWithSearch } from "@/components/services/IconPickerWithSearch";
import { 
  bulkUpdateStatus, 
  bulkDeleteServices, 
  bulkUpdateIcons, 
  bulkUpdateCategories,
  bulkUpdateDisplayOrder,
  BulkOperationProgress,
  BulkOperationJob,
} from "@/lib/bulk-ops";
import { LayoutGrid, List, Stethoscope } from "lucide-react";


// Helper function to get category icon from SOCIAL_ICONS_MAP
const getCategoryIconComponent = (categoryId: string) => {
  const iconData = SOCIAL_ICONS_MAP[categoryId];
  if (iconData) {
    return iconData.icon;
  }
  return SOCIAL_ICONS_MAP.other.icon;
};

const getCategoryColor = (categoryId: string) => {
  const iconData = SOCIAL_ICONS_MAP[categoryId];
  return iconData?.color || SOCIAL_ICONS_MAP.other.color;
};

const categories = [
  { id: "all", name: "All Services", color: "#6B7280" },
  // Major Social Platforms
  { id: "instagram", name: "Instagram", color: SOCIAL_ICONS_MAP.instagram.color },
  { id: "facebook", name: "Facebook", color: SOCIAL_ICONS_MAP.facebook.color },
  { id: "twitter", name: "Twitter/X", color: SOCIAL_ICONS_MAP.twitter.color },
  { id: "youtube", name: "YouTube", color: SOCIAL_ICONS_MAP.youtube.color },
  { id: "tiktok", name: "TikTok", color: SOCIAL_ICONS_MAP.tiktok.color },
  { id: "linkedin", name: "LinkedIn", color: SOCIAL_ICONS_MAP.linkedin.color },
  { id: "telegram", name: "Telegram", color: SOCIAL_ICONS_MAP.telegram.color },
  { id: "threads", name: "Threads", color: SOCIAL_ICONS_MAP.threads.color },
  { id: "snapchat", name: "Snapchat", color: SOCIAL_ICONS_MAP.snapchat.color },
  { id: "pinterest", name: "Pinterest", color: SOCIAL_ICONS_MAP.pinterest.color },
  { id: "whatsapp", name: "WhatsApp", color: SOCIAL_ICONS_MAP.whatsapp.color },
  // Streaming & Video
  { id: "twitch", name: "Twitch", color: SOCIAL_ICONS_MAP.twitch.color },
  { id: "discord", name: "Discord", color: SOCIAL_ICONS_MAP.discord.color },
  { id: "kick", name: "Kick", color: SOCIAL_ICONS_MAP.kick.color },
  { id: "trovo", name: "Trovo", color: SOCIAL_ICONS_MAP.trovo.color },
  { id: "rumble", name: "Rumble", color: SOCIAL_ICONS_MAP.rumble.color },
  { id: "dailymotion", name: "Dailymotion", color: SOCIAL_ICONS_MAP.dailymotion.color },
  // Music Platforms
  { id: "spotify", name: "Spotify", color: SOCIAL_ICONS_MAP.spotify.color },
  { id: "soundcloud", name: "SoundCloud", color: SOCIAL_ICONS_MAP.soundcloud.color },
  { id: "audiomack", name: "Audiomack", color: SOCIAL_ICONS_MAP.audiomack.color },
  { id: "deezer", name: "Deezer", color: SOCIAL_ICONS_MAP.deezer.color },
  { id: "shazam", name: "Shazam", color: SOCIAL_ICONS_MAP.shazam.color },
  { id: "tidal", name: "Tidal", color: SOCIAL_ICONS_MAP.tidal.color },
  { id: "reverbnation", name: "ReverbNation", color: SOCIAL_ICONS_MAP.reverbnation.color },
  { id: "mixcloud", name: "Mixcloud", color: SOCIAL_ICONS_MAP.mixcloud.color },
  // Other Social
  { id: "reddit", name: "Reddit", color: SOCIAL_ICONS_MAP.reddit.color },
  { id: "quora", name: "Quora", color: SOCIAL_ICONS_MAP.quora.color },
  { id: "tumblr", name: "Tumblr", color: SOCIAL_ICONS_MAP.tumblr.color },
  { id: "vk", name: "VKontakte", color: SOCIAL_ICONS_MAP.vk.color },
  { id: "clubhouse", name: "Clubhouse", color: SOCIAL_ICONS_MAP.clubhouse.color },
  // Short Video
  { id: "likee", name: "Likee", color: SOCIAL_ICONS_MAP.likee.color },
  { id: "kwai", name: "Kwai", color: SOCIAL_ICONS_MAP.kwai.color },
  // Other
  { id: "other", name: "Other", color: SOCIAL_ICONS_MAP.other.color },
];

type SortOption = "default" | "price-high" | "price-low" | "orders-high" | "orders-low" | "name";

const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100, 200];

const ServicesManagement = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { panel, resolvedTier, loading: panelLoading } = usePanel();

  const SERVICE_LIMITS: Record<string, number> = {
    free: 100,
    basic: 5000,
    pro: 10000,
  };
  const serviceLimit = SERVICE_LIMITS[resolvedTier] || 100;
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<ServiceItem[]>([]);
  
  // Undo/Redo history for bulk operations with keyboard shortcuts
  const { pushUndo, undoStack, redoStack, undoOperation, redo, canRedo } = useUndoRedoHistory(() => fetchServices());
  
  // Drag and drop toggle
  const [isDragEnabled, setIsDragEnabled] = useState(() => {
    const saved = localStorage.getItem('services-dnd-enabled');
    return saved !== null ? saved === 'true' : !isMobile;
  });
  
  // Persist drag preference
  useEffect(() => {
    localStorage.setItem('services-dnd-enabled', String(isDragEnabled));
  }, [isDragEnabled]);
  const [providers, setProviders] = useState<Array<{ id: string; name: string; api_endpoint?: string; api_key?: string; currency?: string; currency_rate_to_usd?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingService, setViewingService] = useState<ServiceItem | null>(null);
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
  
  // Select All on All Pages
  const [selectAllPages, setSelectAllPages] = useState(false);
  const [allFilteredIds, setAllFilteredIds] = useState<string[]>([]);
  const [isLoadingAllIds, setIsLoadingAllIds] = useState(false);
  
  // Auto-Fix Preview
  const [isAutoFixPreviewOpen, setIsAutoFixPreviewOpen] = useState(false);
  const [autoFixPreviewData, setAutoFixPreviewData] = useState<Array<{
    id: string;
    name: string;
    currentCategory: string;
    newCategory: string;
    currentIcon: string;
    newIcon: string;
    willChange: boolean;
  }>>([]);
  
  // Auto-Fix Progress Dialog
  const [showAutoFixProgress, setShowAutoFixProgress] = useState(false);
  const [autoFixProgress, setAutoFixProgress] = useState<AutoFixProgress>({
    phase: 'idle',
    current: 0,
    total: 0,
  });
  
  // Smart Organize Dialog (combined Auto-Fix + Smart Categorize)
  const [isSmartOrganizeOpen, setIsSmartOrganizeOpen] = useState(false);
  
  // Service Tips dismissible state
  const [showTips, setShowTips] = useState(() => {
    return localStorage.getItem('services-tips-dismissed') !== 'true';
  });
  
  // Analytics panel
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Bulk Delete Confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pendingDeleteCount, setPendingDeleteCount] = useState(0);
  
  // Bulk Operation Loading State
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
  
  // Bulk Progress Modal State
  const [showBulkProgress, setShowBulkProgress] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<BulkOperationProgress>({
    processed: 0,
    total: 0,
    currentChunk: 0,
    totalChunks: 0,
    status: 'idle',
  });
  const [bulkProgressTitle, setBulkProgressTitle] = useState("");
  
  // Category Management
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<CategoryPreset[]>([]);
  
  // Advanced Filters
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<ServiceFilters>({});
  
  // Bulk Operation History
  const [isBulkHistoryOpen, setIsBulkHistoryOpen] = useState(false);
  
  // Re-sync Dialog
  const [isResyncDialogOpen, setIsResyncDialogOpen] = useState(false);
  // Drag-and-drop order save state
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [pendingOrderUpdates, setPendingOrderUpdates] = useState<Array<{ id: string; display_order: number }> | null>(null);
  
  // Category sync state
  const [isSyncingCategories, setIsSyncingCategories] = useState(false);
  
  // View mode: list or kanban
  const [viewMode, setViewMode] = useState<"list" | "kanban">(() => {
    return (localStorage.getItem('services-view-mode') as "list" | "kanban") || "list";
  });
  
  // Service limit - plan-aware limits
  const SERVICE_LIMIT = serviceLimit;
  const WARNING_THRESHOLD = Math.floor(serviceLimit * 0.9);
  const isNearLimit = totalCount >= WARNING_THRESHOLD;
  const isAtLimit = totalCount >= SERVICE_LIMIT;
  
  // Active filter count for badge
  const activeFilterCount = countActiveFilters(advancedFilters);

  // Provider name lookup - checks providers list and features JSON
  const getProviderName = (providerId: string, features?: string | null) => {
    // First try to get from features JSON (stored during import)
    if (features) {
      try {
        const parsed = JSON.parse(features);
        if (parsed.provider_name && parsed.provider_name !== 'Unknown') {
          return parsed.provider_name;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
    
    // Then check provider list
    if (!providerId || providerId === 'Direct' || providerId === 'direct') return 'Direct';
    const provider = providers.find(p => p.id === providerId);
    return provider?.name || 'Direct';
  };

  // Persist view mode
  useEffect(() => {
    localStorage.setItem('services-view-mode', viewMode);
  }, [viewMode]);
  
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
  
  // Edit service state - using a more flexible type for ServiceEditDialog compatibility
  const [editingService, setEditingService] = useState<any>(null);
  
  // Quick Edit Service ID input
  const [quickEditServiceId, setQuickEditServiceId] = useState("");
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);

  // URL param loading state
  const [urlParamLoading, setUrlParamLoading] = useState(false);

  // Handle URL params for direct service editing (?edit=serviceId or ?view=serviceId)
  // Directly fetch service by ID from Supabase instead of relying on local array
  useEffect(() => {
    const editId = searchParams.get('edit');
    const viewId = searchParams.get('view');
    
    if ((editId || viewId) && panel?.id) {
      const targetId = editId || viewId;
      
      const fetchAndOpenService = async () => {
        setUrlParamLoading(true);
        try {
          const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', targetId)
            .single();
            
          if (error || !data) {
            console.error('Service not found for URL param:', targetId);
            toast({ title: "Service not found", description: "The requested service could not be found.", variant: "destructive" });
            setUrlParamLoading(false);
            setSearchParams({}, { replace: true });
            return;
          }
          
          // Map to ServiceItem format
          const serviceItem: ServiceItem = {
            id: data.id,
            displayId: 0,
            providerServiceId: data.provider_service_id || '',
            name: data.name,
            category: data.category,
            provider: getProviderName(data.provider_id || ''),
            minQty: data.min_quantity || 100,
            maxQty: data.max_quantity || 10000,
            price: Number(data.price),
            originalPrice: Number(data.price) * 0.8,
            status: data.is_active ?? true,
            orders: 0,
            providerId: data.provider_id || '',
            displayOrder: data.display_order || 0,
            description: data.description,
            imageUrl: data.image_url,
          };
          
          if (editId) {
            // Directly set the editing service and open dialog
            const dialogService = {
              id: serviceItem.id,
              name: serviceItem.name,
              category: serviceItem.category,
              provider: serviceItem.provider,
              provider_id: serviceItem.providerId,
              price: serviceItem.price,
              originalPrice: serviceItem.originalPrice,
              minQty: serviceItem.minQty,
              min_quantity: serviceItem.minQty,
              maxQty: serviceItem.maxQty,
              max_quantity: serviceItem.maxQty,
              description: serviceItem.description || '',
              imageUrl: serviceItem.imageUrl,
              image_url: serviceItem.imageUrl,
              orders: serviceItem.orders,
            };
            setEditingService(dialogService);
            setIsEditDialogOpen(true);
          } else if (viewId) {
            setViewingService(serviceItem);
            setIsViewDialogOpen(true);
          }
        } catch (err) {
          console.error('Error fetching service by ID:', err);
          toast({ title: "Error loading service", variant: "destructive" });
        } finally {
          setUrlParamLoading(false);
          // Clear the URL param after handling
          setSearchParams({}, { replace: true });
        }
      };
      
      fetchAndOpenService();
    }
  }, [searchParams, panel?.id]);

  // Quick edit handler - fetch service by ID and open edit dialog
  const handleQuickEdit = async () => {
    if (!quickEditServiceId.trim()) {
      toast({ title: "Please enter a service ID", variant: "destructive" });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', quickEditServiceId.trim())
        .single();
        
      if (error || !data) {
        toast({ title: "Service not found", description: "Check the ID and try again", variant: "destructive" });
        return;
      }
      
      // Map to ServiceItem format
      const serviceItem: ServiceItem = {
        id: data.id,
        displayId: 0,
        providerServiceId: data.provider_service_id || '',
        name: data.name,
        category: data.category,
        provider: getProviderName(data.provider_id || ''),
        minQty: data.min_quantity || 100,
        maxQty: data.max_quantity || 10000,
        price: Number(data.price),
        originalPrice: Number(data.price) * 0.8,
        status: data.is_active ?? true,
        orders: 0,
        providerId: data.provider_id || '',
        displayOrder: data.display_order || 0,
        description: data.description,
        imageUrl: data.image_url,
      };
      
      openEditDialog(serviceItem);
      setIsQuickEditOpen(false);
      setQuickEditServiceId("");
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({ title: "Error loading service", variant: "destructive" });
    }
  };

  // Manual search handler - triggers search immediately
  const handleSearchSubmit = useCallback(() => {
    setDebouncedSearch(searchQuery);
    setCurrentPage(1);
    // Immediately trigger fetchServices for responsive feedback
    if (panel?.id) {
      fetchServices();
    }
  }, [searchQuery, panel?.id]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortOption, itemsPerPage]);

  // Fetch services with server-side pagination - depends on providers being loaded
  useEffect(() => {
    if (!panel?.id) return;
    // Wait for providers to be loaded before fetching services
    // This ensures getProviderName works correctly
    fetchServices();
  }, [panel?.id, currentPage, itemsPerPage, selectedCategory, debouncedSearch, sortOption, providers]);

  // Fetch providers FIRST
  useEffect(() => {
    if (!panel?.id) return;
    fetchProviders();
  }, [panel?.id]);

  const fetchProviders = async () => {
    if (!panel?.id) return;
    const { data } = await supabase
      .from('providers')
      .select('id, name, api_endpoint, api_key, currency, currency_rate_to_usd')
      .eq('panel_id', panel.id)
      .eq('is_active', true);
    setProviders(data || []);
  };

  const fetchServices = async () => {
    if (!panel?.id) return;
    
    // Only show full shimmer on initial load, use subtle indicator for updates
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setIsUpdating(true);
    }
    
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

      // Search filter - search in both name and description
      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
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

      const mappedServices: ServiceItem[] = (data || []).map((s, index) => {
        // Extract provider rate from features if available
        let originalPrice = Number(s.price) * 0.8;
        if (s.features) {
          try {
            const features = JSON.parse(s.features as string);
            if (features.provider_rate) {
              originalPrice = Number(features.provider_rate);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        return {
          id: s.id,
          displayId: from + index + 1,
          providerServiceId: s.provider_service_id || '', // Actual provider service ID
          name: s.name,
          category: s.category,
          provider: getProviderName(s.provider_id || '', s.features as string | null),
          minQty: s.min_quantity || 100,
          maxQty: s.max_quantity || 10000,
          price: Number(s.price),
          originalPrice,
          status: s.is_active ?? true,
          orders: 0,
          providerId: s.provider_id || '',
          displayOrder: s.display_order || index + 1,
          description: s.description,
          imageUrl: s.image_url,
        };
      });

      setServices(mappedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      // Silently handle - empty state will show instead of toast
    } finally {
      setLoading(false);
      setIsUpdating(false);
      setIsInitialLoad(false);
    }
  };

  // Fetch category counts separately for sidebar - ACCURATE COUNTS
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({ all: 0 });
  
  useEffect(() => {
    if (!panel?.id) return;
    fetchCategoryCounts();
  }, [panel?.id]);

  const fetchCategoryCounts = async () => {
    if (!panel?.id) return;
    
    try {
      // Use accurate count queries per category
      const categoryIds = categories.map(c => c.id).filter(id => id !== 'all');
      
      // Total count
      const { count: totalCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panel.id);
      
      const counts: Record<string, number> = { all: totalCount || 0 };
      
      // Fetch per-category counts in parallel
      const categoryPromises = categoryIds.map(async (catId) => {
        const { count } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('panel_id', panel.id)
          .eq('category', catId as any);
        return { catId, count: count || 0 };
      });
      
      const results = await Promise.all(categoryPromises);
      results.forEach(({ catId, count }) => {
        counts[catId] = count;
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

  // Stats with accurate counts from DB
  const totalServices = totalCount;
  const [activeServicesCount, setActiveServicesCount] = useState(0);
  const [totalAvgPrice, setTotalAvgPrice] = useState('0.00');
  const [totalServiceOrders, setTotalServiceOrders] = useState(0);
  
  // Fetch accurate stats (average price, active count, total orders) from all services
  useEffect(() => {
    const fetchAccurateStats = async () => {
      if (!panel?.id) return;
      
      // Get accurate active services count
      const { count: activeCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panel.id)
        .eq('is_active', true);
      
      // Get all prices to calculate accurate average
      const { data: priceData } = await supabase
        .from('services')
        .select('price')
        .eq('panel_id', panel.id);
      
      // Get total orders count for this panel
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panel.id);
      
      setActiveServicesCount(activeCount || 0);
      setTotalServiceOrders(ordersCount || 0);
      
      if (priceData && priceData.length > 0) {
        const avg = priceData.reduce((acc, s) => acc + Number(s.price), 0) / priceData.length;
        setTotalAvgPrice(avg.toFixed(2));
      }
    };
    
    fetchAccurateStats();
  }, [panel?.id, totalCount]);
  
  const activeServices = activeServicesCount;
  const totalOrders = totalServiceOrders;
  const avgPrice = totalAvgPrice;

  // Category icon getter - now uses SOCIAL_ICONS_MAP
  const getCategoryIcon = (category: string) => {
    return getCategoryIconComponent(category);
  };

  // Debounced save for drag-and-drop order
  useEffect(() => {
    if (!pendingOrderUpdates || pendingOrderUpdates.length === 0) return;
    
    const timer = setTimeout(async () => {
      setIsSavingOrder(true);
      try {
        const { success, error } = await bulkUpdateDisplayOrder(pendingOrderUpdates);
        if (success) {
          toast({ title: "Service order saved" });
        } else {
          toast({ title: "Failed to save order", variant: "destructive", description: error });
        }
      } catch (err) {
        console.error('Error saving order:', err);
        toast({ title: "Failed to save order", variant: "destructive" });
      } finally {
        setIsSavingOrder(false);
        setPendingOrderUpdates(null);
      }
    }, 800); // Debounce 800ms
    
    return () => clearTimeout(timer);
  }, [pendingOrderUpdates]);

  // Drag end handler with debounced persistence
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
      
      // Optimistic update
      setServices(updatedOrder);
      
      // Queue the database update (debounced)
      const updates = updatedOrder.map((s, idx) => ({
        id: s.id,
        display_order: idx + 1,
      }));
      setPendingOrderUpdates(updates);
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
      setSelectAllPages(false);
    } else {
      setSelectedServices(services.map(s => s.id));
      // If there are more services on other pages, don't auto-select all pages
      if (services.length === totalCount) {
        setSelectAllPages(true);
      }
    }
  };

  // Fetch all filtered service IDs for "Select All on All Pages" - PAGINATED up to 10,000
  const fetchAllFilteredIds = async () => {
    if (!panel?.id) return;
    
    setIsLoadingAllIds(true);
    try {
      const pageSize = 1000;
      const allIds: string[] = [];
      let page = 0;
      let hasMore = true;
      
      while (hasMore && allIds.length < SERVICE_LIMIT) {
        let query = supabase
          .from('services')
          .select('id')
          .eq('panel_id', panel.id)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory as any);
        }

        if (debouncedSearch) {
          query = query.ilike('name', `%${debouncedSearch}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allIds.push(...data.map(s => s.id));
          page++;
          if (data.length < pageSize) hasMore = false;
        }
      }

      const ids = allIds.slice(0, SERVICE_LIMIT);
      setAllFilteredIds(ids);
      setSelectedServices(ids);
      setSelectAllPages(true);
      
      if (allIds.length >= SERVICE_LIMIT) {
        toast({ title: `Selected ${ids.length} services (max limit)`, variant: "default" });
      } else {
        toast({ title: `Selected all ${ids.length} services matching filters` });
      }
    } catch (error) {
      console.error('Error fetching all IDs:', error);
      toast({ title: 'Failed to select all', variant: 'destructive' });
    } finally {
      setIsLoadingAllIds(false);
    }
  };

  // Clear Select All on All Pages when filters change
  const clearSelectAllPages = () => {
    if (selectAllPages) {
      setSelectAllPages(false);
      setSelectedServices([]);
    }
  };

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedServices.length === 0) {
      toast({ title: "No services selected", variant: "destructive" });
      return;
    }
    
    // For delete, show special confirmation dialog
    if (action === "delete") {
      setPendingDeleteCount(selectedServices.length);
      setIsDeleteConfirmOpen(true);
      return;
    }
    
    setBulkAction(action);
    setIsBulkDialogOpen(true);
  };

  // Execute bulk delete with confirmation and progress
  const executeBulkDelete = async () => {
    setIsDeleteConfirmOpen(false);
    setBulkOperationLoading(true);
    
    try {
      const { data: fullServices } = await supabase
        .from('services')
        .select('*')
        .in('id', selectedServices);
      
      const previousState = (fullServices || []).reduce((acc, s) => ({
        ...acc,
        [s.id]: s
      }), {});
      
      setBulkProgressTitle("Deleting Services");
      setShowBulkProgress(true);
      
      await bulkDeleteServices(selectedServices, setBulkProgress, panel?.id);
      
      setServices(prev => prev.filter(s => !selectedServices.includes(s.id)));
      
      const deletedCount = selectedServices.length;
      const deletedIds = [...selectedServices];
      
      pushUndo({
        type: 'delete',
        affectedIds: deletedIds,
        previousState,
        description: `Deleted ${deletedCount} services`,
      });
      
      toast({ 
        title: `${deletedCount} services deleted`,
        description: "Use the Undo button at the bottom to restore",
      });
      
      setSelectedServices([]);
      setSelectAllPages(false);
      fetchCategoryCounts();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({ title: 'Failed to delete services', variant: 'destructive' });
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const executeBulkAction = async () => {
    setBulkOperationLoading(true);
    setIsBulkDialogOpen(false);
    
    try {
      const affectedServices = services.filter(s => selectedServices.includes(s.id));
      
      switch (bulkAction) {
        case "enable": {
          const previousState = affectedServices.reduce((acc, s) => ({
            ...acc,
            [s.id]: { status: s.status }
          }), {});
          
          setBulkProgressTitle("Enabling Services");
          setShowBulkProgress(true);
          
          await bulkUpdateStatus(selectedServices, true, setBulkProgress, panel?.id);
          
          setServices(prev => prev.map(s => 
            selectedServices.includes(s.id) ? { ...s, status: true } : s
          ));
          
          pushUndo({
            type: 'status',
            affectedIds: selectedServices,
            previousState,
            description: `Enabled ${selectedServices.length} services`,
          });
          toast({ title: `${selectedServices.length} services enabled` });
          break;
        }
        case "disable": {
          const previousState = affectedServices.reduce((acc, s) => ({
            ...acc,
            [s.id]: { status: s.status }
          }), {});
          
          setBulkProgressTitle("Disabling Services");
          setShowBulkProgress(true);
          
          await bulkUpdateStatus(selectedServices, false, setBulkProgress, panel?.id);
          
          setServices(prev => prev.map(s => 
            selectedServices.includes(s.id) ? { ...s, status: false } : s
          ));
          
          pushUndo({
            type: 'status',
            affectedIds: selectedServices,
            previousState,
            description: `Disabled ${selectedServices.length} services`,
          });
          toast({ title: `${selectedServices.length} services disabled` });
          break;
        }
        case "export-csv":
          const exportData = services.filter(s => selectedServices.includes(s.id));
          exportToCSV(exportData, serviceColumns, `services-export-${Date.now()}`);
          toast({ title: `${selectedServices.length} services exported to CSV` });
          break;
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({ title: 'Action failed', variant: 'destructive' });
    } finally {
      setBulkOperationLoading(false);
    }
    setSelectedServices([]);
  };

  // Bulk icon assignment
  const executeBulkIconAssignment = async () => {
    if (!selectedBulkIcon) {
      toast({ title: "Please select an icon", variant: "destructive" });
      return;
    }
    
    try {
      // Store previous icons for undo
      const affectedServices = services.filter(s => selectedServices.includes(s.id));
      const previousState = affectedServices.reduce((acc, s) => ({
        ...acc,
        [s.id]: { image_url: s.imageUrl || '' }
      }), {});
      
      await supabase
        .from('services')
        .update({ image_url: `icon:${selectedBulkIcon}` })
        .in('id', selectedServices);
      
      setServices(prev => prev.map(s => 
        selectedServices.includes(s.id) ? { ...s, imageUrl: `icon:${selectedBulkIcon}` } : s
      ));
      
      pushUndo({
        type: 'icon',
        affectedIds: selectedServices,
        previousState,
        description: `Set icon for ${selectedServices.length} services`,
      });
      
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
      // Store previous categories for undo
      const affectedServices = services.filter(s => selectedServices.includes(s.id));
      const previousState = affectedServices.reduce((acc, s) => ({
        ...acc,
        [s.id]: { category: s.category, image_url: s.imageUrl || '' }
      }), {});
      
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
      
      pushUndo({
        type: 'category',
        affectedIds: selectedServices,
        previousState,
        description: `Changed category for ${selectedServices.length} services`,
      });
      
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
  // Generate Auto-Fix Preview with progress tracking for ALL services
  const generateAutoFixPreview = async () => {
    if (!panel?.id) return;
    
    setIsAutoFixingIcons(true);
    setShowAutoFixProgress(true);
    setAutoFixProgress({ phase: 'fetching', current: 0, total: 0, message: 'Starting...' });
    
    try {
      // First get total count
      const { count } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panel.id);
      
      const totalServices = count || 0;
      setAutoFixProgress({ phase: 'fetching', current: 0, total: totalServices, message: 'Fetching services...' });
      
      // Paginated fetch ALL services (up to 10,000)
      const pageSize = 1000;
      const allServices: Array<{ id: string; name: string; category: string; image_url: string | null }> = [];
      let page = 0;
      let hasMore = true;
      
      while (hasMore && allServices.length < SERVICE_LIMIT) {
        const { data, error } = await supabase
          .from('services')
          .select('id, name, category, image_url')
          .eq('panel_id', panel.id)
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allServices.push(...data);
          page++;
          setAutoFixProgress({ 
            phase: 'fetching', 
            current: allServices.length, 
            total: totalServices,
            message: `Fetched ${allServices.length.toLocaleString()} services...`
          });
          if (data.length < pageSize) hasMore = false;
        }
      }
      
      // Analysis phase with progress
      setAutoFixProgress({ phase: 'analyzing', current: 0, total: allServices.length, message: 'Analyzing services...' });
      
      const previewData = allServices.map((service, index) => {
        // Update progress every 100 items
        if (index % 100 === 0) {
          setAutoFixProgress({ 
            phase: 'analyzing', 
            current: index, 
            total: allServices.length,
            message: `Analyzing ${index.toLocaleString()} of ${allServices.length.toLocaleString()}...`
          });
        }
        
        const detectedCategory = detectPlatform(service.name);
        const newIcon = `icon:${detectedCategory}`;
        const currentIcon = service.image_url || '';
        const willChange = service.category !== detectedCategory || currentIcon !== newIcon;
        
        return {
          id: service.id,
          name: service.name,
          currentCategory: service.category,
          newCategory: detectedCategory,
          currentIcon: currentIcon,
          newIcon: newIcon,
          willChange,
        };
      });
      
      setAutoFixProgress({ phase: 'completed', current: allServices.length, total: allServices.length, message: 'Analysis complete!' });
      
      // Close progress dialog after a brief delay
      setTimeout(() => {
        setShowAutoFixProgress(false);
        setAutoFixProgress({ phase: 'idle', current: 0, total: 0 });
        setAutoFixPreviewData(previewData);
        setIsAutoFixPreviewOpen(true);
      }, 500);
      
    } catch (error) {
      console.error('Error generating preview:', error);
      setAutoFixProgress({ phase: 'error', current: 0, total: 0, message: 'Failed to analyze services' });
      toast({ title: 'Failed to generate preview', variant: 'destructive' });
    } finally {
      setIsAutoFixingIcons(false);
    }
  };

  // Apply Auto-Fix from Preview with progress tracking
  const applyAutoFix = async () => {
    const changesToApply = autoFixPreviewData.filter(p => p.willChange);
    
    if (changesToApply.length === 0) {
      toast({ title: "No changes to apply" });
      setIsAutoFixPreviewOpen(false);
      return;
    }

    setIsAutoFixPreviewOpen(false);
    setIsAutoFixingIcons(true);
    setShowAutoFixProgress(true);
    setAutoFixProgress({ phase: 'applying', current: 0, total: changesToApply.length, message: 'Applying changes...' });
    
    try {
      // Store previous state for undo
      const previousState = changesToApply.reduce((acc, item) => ({
        ...acc,
        [item.id]: { category: item.currentCategory, image_url: item.currentIcon }
      }), {});
      
      // Batch update in chunks of 100 with progress
      const chunkSize = 100;
      for (let i = 0; i < changesToApply.length; i += chunkSize) {
        const chunk = changesToApply.slice(i, i + chunkSize);
        
        setAutoFixProgress({ 
          phase: 'applying', 
          current: i, 
          total: changesToApply.length,
          message: `Updating ${i.toLocaleString()} of ${changesToApply.length.toLocaleString()} services...`
        });
        
        await Promise.all(
          chunk.map((update) =>
            supabase
              .from('services')
              .update({ category: update.newCategory as any, image_url: update.newIcon })
              .eq('id', update.id)
          )
        );
      }
      
      setAutoFixProgress({ phase: 'completed', current: changesToApply.length, total: changesToApply.length, message: 'All changes applied!' });

      // Update local state for current page
      setServices((prev) =>
        prev.map((s) => {
          const update = changesToApply.find((u) => u.id === s.id);
          if (update) {
            return { ...s, category: update.newCategory, imageUrl: update.newIcon };
          }
          return s;
        })
      );

      pushUndo({
        type: 'category',
        affectedIds: changesToApply.map(c => c.id),
        previousState,
        description: `Auto-fixed ${changesToApply.length} services`,
      });

      toast({ title: `Auto-fixed icons for ${changesToApply.length} services` });
      fetchCategoryCounts();
      
      // Close progress dialog after a brief delay
      setTimeout(() => {
        setShowAutoFixProgress(false);
        setAutoFixProgress({ phase: 'idle', current: 0, total: 0 });
      }, 1500);
      
    } catch (error) {
      console.error('Auto-fix error:', error);
      setAutoFixProgress({ phase: 'error', current: 0, total: 0, message: 'Failed to apply changes' });
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
  const checkServiceLimit = async (): Promise<boolean> => {
    if (serviceLimit === Infinity) return true;
    const { count } = await supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('panel_id', panel!.id)
      .eq('is_active', true);
    if ((count || 0) >= serviceLimit) {
      toast({
        variant: 'destructive',
        title: 'Service Limit Reached',
        description: `Your ${resolvedTier} plan allows up to ${serviceLimit} active service${serviceLimit !== 1 ? 's' : ''}. Upgrade your plan to add more.`
      });
      return false;
    }
    return true;
  };

  const handleCreateService = async () => {
    if (!panel?.id) return;

    if (!(await checkServiceLimit())) return;
    
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

  // Edit service - map ServiceItem properties to ServiceEditDialog format
  const openEditDialog = (service: ServiceItem) => {
    // Validate service exists before opening dialog
    if (!service || !service.id) {
      toast({ title: "Error loading service", variant: "destructive" });
      return;
    }
    
    // Map properties to match ServiceEditDialog expectations
    const dialogService = {
      id: service.id,
      name: service.name,
      category: service.category,
      provider: service.provider,
      provider_id: service.providerId,
      price: service.price,
      originalPrice: service.originalPrice,
      minQty: service.minQty,
      min_quantity: service.minQty,
      maxQty: service.maxQty,
      max_quantity: service.maxQty,
      description: service.description || '',
      imageUrl: service.imageUrl,
      image_url: service.imageUrl,
      orders: service.orders,
    };
    setEditingService(dialogService);
    setIsEditDialogOpen(true);
  };

  // Duplicate service handler
  const handleDuplicateService = async (service: ServiceItem) => {
    if (!panel?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          panel_id: panel.id,
          name: `${service.name} (Copy)`,
          description: service.description || '',
          category: service.category as any,
          price: service.price,
          min_quantity: service.minQty,
          max_quantity: service.maxQty,
          image_url: service.imageUrl || null,
          is_active: true,
          display_order: services.length + 1,
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: "Service duplicated", description: "A copy has been created" });
      fetchServices();
    } catch (error) {
      console.error('Error duplicating service:', error);
      toast({ title: 'Failed to duplicate', variant: 'destructive' });
    }
  };

  const handleSaveEdit = async (updatedService: any) => {
    if (!editingService?.id) return;
    
    try {
      // Handle both property naming conventions from ServiceEditDialog
      const minQty = updatedService.minQty ?? updatedService.min_quantity ?? 100;
      const maxQty = updatedService.maxQty ?? updatedService.max_quantity ?? 10000;
      const imageUrl = updatedService.imageUrl ?? updatedService.image_url ?? null;
      const providerId = updatedService.provider_id ?? null;
      
      const { error } = await supabase
        .from('services')
        .update({
          name: updatedService.name,
          description: updatedService.description || null,
          price: updatedService.price,
          category: updatedService.category,
          provider_id: providerId,
          min_quantity: minQty,
          max_quantity: maxQty,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingService.id);

      if (error) throw error;

      // Update local state
      setServices(prev => prev.map(s =>
        s.id === editingService.id
          ? { 
              ...s, 
              name: updatedService.name,
              description: updatedService.description,
              price: updatedService.price,
              category: updatedService.category,
              providerId: providerId,
              minQty: minQty,
              maxQty: maxQty,
              imageUrl: imageUrl,
            }
          : s
      ));
      
      // Show success toast
      toast({ 
        title: "Service updated successfully",
        description: `${updatedService.name} has been saved.`
      });
      
      // Close dialog and reset state
      setIsEditDialogOpen(false);
      setEditingService(null);
      
      // Clear URL params if present
      if (searchParams.get('edit')) {
        setSearchParams({}, { replace: true });
      }
    } catch (error) {
      console.error('Error updating service:', error);
      toast({ 
        title: 'Failed to update service', 
        description: 'Please try again.',
        variant: 'destructive' 
      });
    }
  };

  // Sync categories from services to service_categories table
  // This ensures all 70+ categories are properly stored with icons and positions
  const handleSyncCategories = async () => {
    if (!panel?.id) return;
    
    setIsSyncingCategories(true);
    try {
      // Build unique categories from services
      const categoryMap = new Map<string, number>();
      services.forEach(svc => {
        const cat = (svc.category || 'other').toLowerCase();
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });
      
      // Get existing categories for position preservation
      const { data: existingCats } = await supabase
        .from('service_categories')
        .select('slug, position')
        .eq('panel_id', panel.id);
      
      const existingPositions = new Map(existingCats?.map(c => [c.slug, c.position]) || []);
      let nextPosition = Math.max(0, ...Array.from(existingPositions.values())) + 1;
      
      // Upsert categories
      const categoriesToUpsert = Array.from(categoryMap.entries()).map(([slug, count]) => {
        const iconData = SOCIAL_ICONS_MAP[slug] || SOCIAL_ICONS_MAP.other;
        return {
          panel_id: panel.id,
          slug,
          name: iconData.label || slug.charAt(0).toUpperCase() + slug.slice(1),
          icon_key: slug,
          color: iconData.color || '#6B7280',
          position: existingPositions.get(slug) ?? nextPosition++,
          is_active: true,
          service_count: count,
        };
      });
      
      // Batch upsert
      const { error } = await supabase
        .from('service_categories')
        .upsert(categoriesToUpsert, { onConflict: 'panel_id,slug' });
      
      if (error) throw error;
      
      toast({ 
        title: `${categoriesToUpsert.length} categories synced`,
        description: 'Category order will now persist on tenant storefront.'
      });
      
      // Refresh data
      fetchCategoryCounts();
    } catch (error) {
      console.error('Error syncing categories:', error);
      toast({ 
        title: 'Failed to sync categories', 
        variant: 'destructive' 
      });
    } finally {
      setIsSyncingCategories(false);
    }
  };

  // Import handler - stores to provider_services, normalized_services, and services tables
  const handleImport = async (importedServices: any[], markups: Record<number, number>, providerId?: string, providerName?: string) => {
    if (!panel?.id) return;

    let servicesToImport = importedServices;
    if (serviceLimit !== Infinity) {
      const { count } = await supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('panel_id', panel.id)
        .eq('is_active', true);
      const activeCount = count || 0;
      const remaining = serviceLimit - activeCount;
      if (remaining <= 0) {
        toast({
          variant: 'destructive',
          title: 'Service Limit Reached',
          description: `Your ${resolvedTier} plan allows up to ${serviceLimit} active service${serviceLimit !== 1 ? 's' : ''}. Upgrade your plan to import more.`
        });
        return;
      }
      servicesToImport = importedServices.slice(0, remaining);
      if (servicesToImport.length < importedServices.length) {
        toast({
          title: 'Import Limited',
          description: `Only importing ${servicesToImport.length} of ${importedServices.length} services due to your ${resolvedTier} plan limit.`
        });
      }
    }
    
    try {
      const rawInserts = servicesToImport.map(service => ({
        panel_id: panel.id,
        provider_id: providerId || null,
        external_service_id: String(service.id),
        raw_name: service.name,
        raw_category: service.category || 'other',
        provider_rate: Number(service.price) || 0,
        min_quantity: service.minQty || 100,
        max_quantity: service.maxQty || 10000,
        description: service.description || null,
        is_active: true,
        raw_data: service as any
      }));

      const { error: rawError } = await supabase
        .from('provider_services')
        .upsert(rawInserts, {
          onConflict: 'panel_id,provider_id,external_service_id',
          ignoreDuplicates: false
        });

      if (rawError) {
        console.error('Batch raw service upsert error:', rawError);
      }

      const extIds = servicesToImport.map(s => String(s.id));
      const refMap = new Map<string, string>();
      const lookupQuery = supabase
        .from('provider_services')
        .select('id, external_service_id')
        .eq('panel_id', panel.id)
        .in('external_service_id', extIds);
      if (providerId) {
        lookupQuery.eq('provider_id', providerId);
      } else {
        lookupQuery.is('provider_id', null);
      }
      const { data: provServiceRows } = await lookupQuery;
      (provServiceRows || []).forEach(r => refMap.set(r.external_service_id, r.id));

      const normalizedInserts = servicesToImport
        .filter(s => refMap.has(String(s.id)))
        .map(s => ({
          provider_service_id: refMap.get(String(s.id))!,
          normalized_name: s.name,
          detected_platform: s.category || 'other',
          detected_service_type: 'other',
          detected_delivery_type: 'instant',
          buyer_friendly_category: s.category || 'other',
          confidence_score: 0.8,
          is_ai_processed: false
        }));

      if (normalizedInserts.length > 0) {
        const { error: normError } = await supabase
          .from('normalized_services')
          .upsert(normalizedInserts, { onConflict: 'provider_service_id', ignoreDuplicates: false });
        if (normError) console.error('Batch normalized upsert error:', normError);
      }

      const buyerInserts = servicesToImport.map((service, idx) => {
        const markupPercent = markups[service.id] ?? 25;
        const providerRate = Number(service.price) || 0;
        const finalPrice = providerRate * (1 + markupPercent / 100);
        const detectedCategory = service.category || 'other';
        const iconUrl = service.iconUrl || `icon:${detectedCategory}`;
        const provServiceRef = refMap.get(String(service.id)) || null;

        const data: Record<string, any> = {
          panel_id: panel.id,
          provider_id: providerId || null,
          provider_service_id: String(service.id),
          name: service.name,
          category: detectedCategory,
          image_url: iconUrl,
          price: finalPrice,
          provider_price: providerRate,
          provider_cost: providerRate,
          markup_percent: markupPercent,
          min_quantity: service.minQty || 100,
          max_quantity: service.maxQty || 10000,
          is_active: true,
          display_order: services.length + idx + 1,
          features: JSON.stringify({ 
            original_service_id: service.id, 
            provider_name: providerName || 'Direct',
            provider_rate: providerRate,
          }),
        };
        if (provServiceRef) data.provider_service_ref = provServiceRef;
        return data;
      });

      const { error: buyerError } = await supabase
        .from('services')
        .upsert(buyerInserts as any[], {
          onConflict: 'panel_id,provider_service_id,provider_id',
          ignoreDuplicates: false
        });

      if (buyerError) {
        console.error('Batch service upsert error:', buyerError);
        toast({ title: 'Some services may not have imported correctly', variant: 'destructive' });
      } else {
        toast({ title: `${servicesToImport.length} services imported successfully` });
      }

      fetchServices();
      fetchCategoryCounts();
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: 'Import failed', variant: 'destructive' });
    }
  };

  // Only show full shimmer on initial load
  if ((loading && isInitialLoad) || panelLoading || urlParamLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl"></div>)}
        </div>
        {urlParamLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading service...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "space-y-4 sm:space-y-6 overflow-x-hidden transition-opacity duration-200",
      isUpdating && "opacity-60"
    )}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Services Management
            </h1>
            <p className="text-sm text-muted-foreground">Manage your SMM services, pricing, and providers</p>
          </div>
          
          {/* Service Limit Counter */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border",
            isAtLimit ? "bg-destructive/10 border-destructive/50 text-destructive" :
            isNearLimit ? "bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400" :
            "bg-muted/50 border-border/50"
          )}>
            <Package className="w-4 h-4" />
            <span className="text-sm font-medium">
              {totalCount.toLocaleString()} / {SERVICE_LIMIT.toLocaleString()}
            </span>
            {isAtLimit && (
              <Badge variant="destructive" className="text-xs">Limit Reached</Badge>
            )}
            {isNearLimit && !isAtLimit && (
              <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600 dark:text-amber-400">
                Near Limit
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Quick Edit by ID */}
          <Dialog open={isQuickEditOpen} onOpenChange={setIsQuickEditOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="glass-card border-border/50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Quick Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Service by ID</DialogTitle>
                <DialogDescription>Enter a service ID to directly open its editor</DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter service ID..."
                  value={quickEditServiceId}
                  onChange={(e) => setQuickEditServiceId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickEdit()}
                />
                <Button onClick={handleQuickEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Import from Provider Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="glass-card border-border/50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Import from Provider
              </div>
              <DropdownMenuSeparator />
              {providers.length > 0 ? (
                providers.map(provider => (
                  <DropdownMenuItem 
                    key={provider.id} 
                    onClick={() => setIsImportDialogOpen(true)}
                  >
                    <Package className="w-4 h-4 mr-2" /> {provider.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-3 py-3 text-center text-sm text-muted-foreground">
                  No providers added yet.
                  <br />
                  <span className="text-xs">Go to Provider Management to add one.</span>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/50">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>

          {/* Drag & Drop Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
            <Hand className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground hidden sm:inline">Drag & Drop</span>
            <Switch 
              checked={isDragEnabled}
              onCheckedChange={setIsDragEnabled}
              className="scale-90"
            />
            {isSavingOrder && (
              <Loader2 className="w-3 h-3 animate-spin text-primary ml-1" />
            )}
          </div>
          
          {/* Bulk History Button */}
          <Button
            variant="outline"
            size="sm"
            className="glass-card border-border/50"
            onClick={() => setIsBulkHistoryOpen(true)}
          >
            <Clock className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">History</span>
          </Button>
          
          {/* Re-sync from Provider Button */}
          <Button
            variant="outline"
            size="sm"
            className="glass-card border-border/50"
            onClick={() => setIsResyncDialogOpen(true)}
            disabled={providers.length === 0}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Re-sync</span>
          </Button>
          
          {/* Sync Categories Button - Creates/updates service_categories table */}
          <Button
            variant="outline"
            size="sm"
            className="glass-card border-border/50"
            onClick={handleSyncCategories}
            disabled={isSyncingCategories || services.length === 0}
          >
            {isSyncingCategories ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Layers className="w-4 h-4 mr-2" />
            )}
            <span className="hidden sm:inline">Sync Categories</span>
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
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Service Icon
                    </Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="add-custom-url" className="text-xs text-muted-foreground">Custom URL</Label>
                      <Switch
                        id="add-custom-url"
                        checked={!newService.imageUrl.startsWith('icon:') && newService.imageUrl.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewService(prev => ({ ...prev, imageUrl: '' }));
                          } else {
                            setNewService(prev => ({ ...prev, imageUrl: 'icon:instagram' }));
                          }
                        }}
                      />
                    </div>
                  </div>
                  {(!newService.imageUrl || newService.imageUrl.startsWith('icon:')) ? (
                    <div className="grid grid-cols-8 gap-1.5 p-3 bg-muted/30 rounded-lg border max-h-40 overflow-y-auto">
                      {Object.entries(SOCIAL_ICONS_MAP).map(([key, { icon: IconComponent, label, bgColor }]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setNewService(prev => ({ ...prev, imageUrl: `icon:${key}` }))}
                          className={cn(
                            "p-1.5 rounded-lg transition-all hover:scale-105",
                            newService.imageUrl === `icon:${key}`
                              ? "ring-2 ring-primary bg-primary/10"
                              : "hover:bg-muted/50"
                          )}
                          title={label}
                        >
                          <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", bgColor)}>
                            <IconComponent className="text-white" size={12} />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input 
                        placeholder="Enter custom image URL (https://...)" 
                        className="bg-background/50"
                        value={newService.imageUrl}
                        onChange={(e) => setNewService(prev => ({ ...prev, imageUrl: e.target.value }))}
                      />
                      {newService.imageUrl && (
                        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                          <img 
                            src={newService.imageUrl} 
                            alt="Preview" 
                            className="w-8 h-8 rounded-md object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                          <span className="text-xs text-muted-foreground">Image preview</span>
                        </div>
                      )}
                    </div>
                  )}
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

      {/* Stats Cards with Tooltips */}
      <TooltipProvider>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { 
              label: "Total Services", 
              value: totalServices.toLocaleString(), 
              icon: Package, 
              color: "primary",
              tooltip: `Total number of services in your panel (${totalServices} services)`
            },
            { 
              label: "Active", 
              value: activeServices.toLocaleString(), 
              icon: Power, 
              color: "green-500",
              tooltip: `Services currently enabled and visible to customers (${activeServices} active)`
            },
            { 
              label: "Total Orders", 
              value: totalOrders.toLocaleString(), 
              icon: TrendingUp, 
              color: "blue-500",
              tooltip: `Total orders placed across all services (${totalOrders} orders)`
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="glass-card-hover overflow-hidden cursor-help">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl", stat.color === "primary" ? "bg-primary/10" : `bg-${stat.color}/10`)}>
                          <stat.icon className={cn("w-5 h-5", stat.color === "primary" ? "text-primary" : `text-${stat.color}`)} />
                        </div>
                        <div className="flex-1">
                        <div className="flex items-center gap-1">
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <Info className="w-3 h-3 text-muted-foreground/50 hidden md:block" />
                          </div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">{stat.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </div>
      </TooltipProvider>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card 
          className="cursor-pointer border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Add Service</h3>
              <p className="text-xs text-muted-foreground">Create a new service manually</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group"
          onClick={() => setIsImportDialogOpen(true)}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Import Services</h3>
              <p className="text-xs text-muted-foreground">Import from a provider API</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group"
          onClick={() => navigate('/panel/providers?tab=marketplace')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Direct Providers</h3>
              <p className="text-xs text-muted-foreground">Connect to marketplace panels</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Tools Cards */}
      <ServiceToolsCards
        onSmartOrganize={() => setIsSmartOrganizeOpen(true)}
        onAutoArrange={(option) => {
          switch (option) {
            case "name-asc":
              setSortOption("name");
              toast({ title: "Services arranged alphabetically (A-Z)" });
              break;
            case "name-desc":
              setServices(prev => [...prev].sort((a, b) => b.name.localeCompare(a.name)));
              toast({ title: "Services arranged alphabetically (Z-A)" });
              break;
            case "price-high":
              setSortOption("price-high");
              toast({ title: "Services arranged by price (high to low)" });
              break;
            case "price-low":
              setSortOption("price-low");
              toast({ title: "Services arranged by price (low to high)" });
              break;
            case "popularity":
              setSortOption("orders-high");
              toast({ title: "Services arranged by popularity" });
              break;
            case "recent":
              setServices(prev => [...prev].sort((a, b) => (b.displayOrder || 0) - (a.displayOrder || 0)));
              toast({ title: "Services arranged by newest first" });
              break;
          }
        }}
        isOrganizing={isAutoFixingIcons}
        totalServices={totalCount}
      />

      {/* Service Tips */}
      {showTips && (
        <ServiceTips 
          variant="panel-owner" 
          onDismiss={() => {
            setShowTips(false);
            localStorage.setItem('services-tips-dismissed', 'true');
          }}
        />
      )}

      {/* Service Analytics */}
      <ServiceAnalytics isOpen={showAnalytics} onToggle={() => setShowAnalytics(!showAnalytics)} />


      {/* Bulk Action Bar - Fixed Position on Mobile */}
      <AnimatePresence>
        {selectedServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card px-4 md:px-6 py-3 md:py-4 rounded-2xl shadow-2xl border border-primary/20 max-w-[95vw] md:max-w-none"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Badge variant="default" className="text-sm font-bold bg-primary/20 text-primary border-primary/30">
                  {selectAllPages ? totalCount : selectedServices.length} selected
                </Badge>
                {selectAllPages && (
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">All pages</Badge>
                )}
                {!selectAllPages && totalCount > services.length && (
                  <Button 
                    size="sm" 
                    variant="link" 
                    className="text-xs h-auto p-0 text-primary underline-offset-2"
                    onClick={fetchAllFilteredIds}
                    disabled={isLoadingAllIds}
                  >
                    {isLoadingAllIds ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                    Select all {totalCount}
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs h-6 px-2 text-muted-foreground"
                  onClick={() => { setSelectedServices([]); setSelectAllPages(false); }}
                >
                  Clear
                </Button>
              </div>
              <div className="hidden sm:block h-6 w-px bg-border" />
              <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
                <Button 
                  size="sm" 
                  variant="default" 
                  onClick={() => handleBulkAction("enable")} 
                  className="h-8 text-xs"
                  disabled={bulkOperationLoading}
                >
                  {bulkOperationLoading && bulkAction === "enable" ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Power className="w-3 h-3 mr-1" />
                  )}
                  Enable
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => handleBulkAction("disable")} 
                  className="h-8 text-xs"
                  disabled={bulkOperationLoading}
                >
                  {bulkOperationLoading && bulkAction === "disable" ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Power className="w-3 h-3 mr-1" />
                  )}
                  Disable
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleBulkAction("delete")} 
                  className="h-8 text-xs"
                  disabled={bulkOperationLoading}
                >
                  {bulkOperationLoading && bulkAction === "delete" ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3 mr-1" />
                  )}
                  Delete
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("export-csv")} className="h-8 text-xs hidden md:flex" disabled={bulkOperationLoading}>
                  <Download className="w-3 h-3 mr-1" /> Export
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsBulkIconDialogOpen(true)} className="h-8 text-xs hidden md:flex" disabled={bulkOperationLoading}>
                  <Palette className="w-3 h-3 mr-1" /> Icon
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsBulkCategoryDialogOpen(true)} className="h-8 text-xs hidden md:flex" disabled={bulkOperationLoading}>
                  <Layers className="w-3 h-3 mr-1" /> Category
                </Button>
              </div>
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
          {/* Category Management & Advanced Filters */}
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs"
              onClick={() => setIsCategoryManagementOpen(true)}
            >
              <Settings2 className="w-3.5 h-3.5 mr-1.5" />
              Manage
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 h-9 text-xs relative",
                activeFilterCount > 0 && "border-primary/50 bg-primary/5"
              )}
              onClick={() => setIsAdvancedFiltersOpen(true)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

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
              {(() => { const CatIcon = getCategoryIconComponent(cat.id); return <CatIcon className="w-4 h-4" size={16} />; })()}
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
            <div className="relative flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-9 pr-9 bg-card/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={handleClearSearch}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button onClick={handleSearchSubmit} size="sm" className="h-10 px-4">
                <Search className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
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

            {/* Mobile Advanced Filters Button */}
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "lg:hidden h-10 w-10 shrink-0",
                activeFilterCount > 0 && "border-primary/50 bg-primary/5"
              )}
              onClick={() => setIsAdvancedFiltersOpen(true)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Services */}
          {services.length === 0 && !loading ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-medium mb-2">
                  {totalCount === 0 
                    ? "No Services Available" 
                    : selectedCategory !== 'all'
                      ? `No ${categories.find(c => c.id === selectedCategory)?.name || selectedCategory} services found`
                      : debouncedSearch 
                        ? `No services matching "${debouncedSearch}"`
                        : "No services found"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {totalCount === 0 
                    ? "Services have not been imported yet. Import services from a provider or add them manually to get started." 
                    : selectedCategory !== 'all'
                      ? `You don't have any services in the ${categories.find(c => c.id === selectedCategory)?.name || selectedCategory} category yet. Add one or import from a provider.`
                      : "Try adjusting your search or category filters to find what you're looking for."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {(totalCount === 0 || selectedCategory !== 'all') && (
                    <Button onClick={() => setIsImportDialogOpen(true)} className="bg-gradient-to-r from-primary to-primary/80">
                      <Upload className="w-4 h-4 mr-2" /> Import Services
                    </Button>
                  )}
                  <Button variant={totalCount === 0 ? "outline" : "default"} onClick={() => {
                    if (selectedCategory !== 'all') {
                      setNewService(prev => ({ ...prev, category: selectedCategory }));
                    }
                    setIsAddDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Service Manually
                  </Button>
                  {selectedCategory !== 'all' && (
                    <Button variant="outline" onClick={() => setSelectedCategory('all')}>
                      View All Services
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === "kanban" ? (
                /* Kanban Card View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {services.map((service) => (
                    <ServiceKanbanCard
                      key={service.id}
                      service={service}
                      providerName={getProviderName(service.providerId)}
                      isSelected={selectedServices.includes(service.id)}
                      onToggleSelect={() => toggleSelection(service.id)}
                      onToggleStatus={() => toggleServiceStatus(service.id)}
                      onEdit={() => openEditDialog(service)}
                      onDelete={() => deleteService(service.id)}
                      onView={() => {
                        setViewingService(service);
                        setIsViewDialogOpen(true);
                      }}
                      showDragHandle={false}
                    />
                  ))}
                </div>
              ) : isDragEnabled ? (
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
                                onView={() => {
                                  setViewingService(service);
                                  setIsViewDialogOpen(true);
                                }}
                                onDuplicate={handleDuplicateService}
                                onBulkEnable={() => handleBulkAction('enable')}
                                onBulkDisable={() => handleBulkAction('disable')}
                                onChangeCategory={() => {
                                  setSelectedServices([service.id]);
                                  setIsBulkCategoryDialogOpen(true);
                                }}
                                onChangeIcon={() => {
                                  setSelectedServices([service.id]);
                                  setIsBulkIconDialogOpen(true);
                                }}
                                getCategoryIcon={getCategoryIcon}
                                showDragHandle={isDragEnabled}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </SortableContext>
                </DndContext>
              ) : (
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
                            onView={() => {
                              setViewingService(service);
                              setIsViewDialogOpen(true);
                            }}
                            onDuplicate={handleDuplicateService}
                            onBulkEnable={() => handleBulkAction('enable')}
                            onBulkDisable={() => handleBulkAction('disable')}
                            onChangeCategory={() => {
                              setSelectedServices([service.id]);
                              setIsBulkCategoryDialogOpen(true);
                            }}
                            onChangeIcon={() => {
                              setSelectedServices([service.id]);
                              setIsBulkIconDialogOpen(true);
                            }}
                            getCategoryIcon={getCategoryIcon}
                            showDragHandle={false}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

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
            <Button onClick={executeBulkAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation AlertDialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete {pendingDeleteCount} Services?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This will permanently delete <strong>{pendingDeleteCount}</strong> service{pendingDeleteCount !== 1 ? 's' : ''} from your panel.
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
                <RefreshCw className="w-4 h-4 text-primary" />
                <span className="text-foreground">
                  You can restore them using the <strong>Undo</strong> button that will appear after deletion.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {pendingDeleteCount} Services
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog - Connected to Real Providers */}
      <ServiceImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
        providers={providers.length > 0 ? providers : [{ id: 'direct', name: 'Direct (No providers configured)' }]}
        getCategoryIcon={getCategoryIcon}
        currentServiceCount={totalCount}
        maxServiceLimit={SERVICE_LIMIT}
      />

      {/* Edit Sheet */}
      {editingService && editingService.id && (
        <ServiceEditSheet
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setEditingService(null);
          }}
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
              const CatIcon = getCategoryIconComponent(cat.id);
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
                    <CatIcon className="w-4 h-4" size={16} />
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
                  const CatIcon = getCategoryIconComponent(cat.id);
                  return (
                    <>
                      <div className="p-1.5 rounded bg-muted">
                        <CatIcon className="w-4 h-4" size={16} />
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

      {/* Auto-Fix Icons Preview Dialog */}
      <Dialog open={isAutoFixPreviewOpen} onOpenChange={setIsAutoFixPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Auto-Fix Icons Preview
            </DialogTitle>
            <DialogDescription>
              Review the changes before applying. Only services with detected changes are shown.
            </DialogDescription>
          </DialogHeader>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold">{autoFixPreviewData.length}</p>
              <p className="text-xs text-muted-foreground">Total Services</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
              <p className="text-2xl font-bold text-emerald-500">{autoFixPreviewData.filter(p => p.willChange).length}</p>
              <p className="text-xs text-muted-foreground">Will Change</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-bold">{autoFixPreviewData.filter(p => !p.willChange).length}</p>
              <p className="text-xs text-muted-foreground">Already Correct</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="flex flex-wrap gap-2 py-2 border-t border-b border-border/50">
            {(() => {
              const categoryChanges: Record<string, number> = {};
              autoFixPreviewData.filter(p => p.willChange).forEach(p => {
                categoryChanges[p.newCategory] = (categoryChanges[p.newCategory] || 0) + 1;
              });
              return Object.entries(categoryChanges).map(([cat, count]) => (
                <Badge key={cat} variant="secondary" className="capitalize">
                  {cat}: {count}
                </Badge>
              ));
            })()}
          </div>

          {/* Changes List */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[300px]">
            {autoFixPreviewData.filter(p => p.willChange).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>All services already have correct icons!</p>
              </div>
            ) : (
              autoFixPreviewData.filter(p => p.willChange).slice(0, 100).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="capitalize text-xs">
                      {item.currentCategory}
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge className="capitalize text-xs bg-primary/20 text-primary border-primary/30">
                      {item.newCategory}
                    </Badge>
                  </div>
                </div>
              ))
            )}
            {autoFixPreviewData.filter(p => p.willChange).length > 100 && (
              <p className="text-center text-sm text-muted-foreground py-2">
                ... and {autoFixPreviewData.filter(p => p.willChange).length - 100} more
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-border/50">
            <Button variant="outline" onClick={() => setIsAutoFixPreviewOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={applyAutoFix} 
              disabled={isAutoFixingIcons || autoFixPreviewData.filter(p => p.willChange).length === 0}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {isAutoFixingIcons ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Apply {autoFixPreviewData.filter(p => p.willChange).length} Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Floating Undo/Redo Button */}
      <FloatingUndoButton 
        undoStack={undoStack}
        redoStack={redoStack}
        onUndo={undoOperation}
        onRedo={redo}
        maxVisible={5}
      />

      {/* Smart Organize Dialog */}
      {panel?.id && (
        <SmartOrganizeDialog
          open={isSmartOrganizeOpen}
          onOpenChange={setIsSmartOrganizeOpen}
          panelId={panel.id}
          onComplete={() => fetchServices()}
          onRefreshCounts={fetchCategoryCounts}
        />
      )}

      {/* Service View Dialog */}
      <ServiceViewDialog
        service={viewingService}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onEdit={() => {
          setIsViewDialogOpen(false);
          if (viewingService) openEditDialog(viewingService);
        }}
        onToggleStatus={() => {
          if (viewingService) toggleServiceStatus(viewingService.id);
          setIsViewDialogOpen(false);
        }}
        onDuplicate={() => {
          // Duplicate logic
          if (viewingService) {
            const newService = { ...viewingService, id: '', name: `${viewingService.name} (Copy)` };
            setEditingService(newService);
            setIsViewDialogOpen(false);
            setIsEditDialogOpen(true);
          }
        }}
      />

      {/* Bulk Progress Modal */}
      <BulkProgressModal
        open={showBulkProgress}
        onOpenChange={setShowBulkProgress}
        progress={bulkProgress}
        title={bulkProgressTitle}
        description={`Processing ${bulkProgress.total.toLocaleString()} services...`}
        onComplete={() => {
          fetchServices();
          fetchCategoryCounts();
        }}
      />

      {/* Category Management Dialog */}
      {panel?.id && (
        <CategoryManagementDialog
          open={isCategoryManagementOpen}
          onOpenChange={setIsCategoryManagementOpen}
          panelId={panel.id}
          currentCategories={customCategories}
          onCategoriesChange={setCustomCategories}
        />
      )}

      {/* Advanced Filters Sheet */}
      <AdvancedFiltersSheet
        open={isAdvancedFiltersOpen}
        onOpenChange={setIsAdvancedFiltersOpen}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        providers={providers}
        onApply={() => {
          setCurrentPage(1);
          fetchServices();
        }}
      />
      
      {/* Bulk Operation History */}
      <BulkOperationHistory
        open={isBulkHistoryOpen}
        onOpenChange={setIsBulkHistoryOpen}
        onRetry={(job) => {
          // TODO: Implement retry logic
          console.log('Retry job:', job);
          toast({ title: "Retry functionality coming soon" });
        }}
      />

      {/* Auto-Fix Progress Dialog */}
      <AutoFixProgressDialog
        open={showAutoFixProgress}
        onOpenChange={setShowAutoFixProgress}
        progress={autoFixProgress}
        title="Auto-Fix Icons"
      />
      
      {/* Service Re-sync Dialog */}
      {panel?.id && (
        <ServiceResyncDialog
          open={isResyncDialogOpen}
          onOpenChange={setIsResyncDialogOpen}
          providers={providers}
          panelId={panel.id}
          onComplete={() => {
            fetchServices();
            fetchCategoryCounts();
          }}
          onOpenSmartOrganize={() => setIsSmartOrganizeOpen(true)}
        />
      )}
    </div>
  );
};

export default ServicesManagement;