import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  Check, 
  AlertCircle, 
  Download, 
  Sparkles, 
  Search,
  ChevronDown,
  ChevronRight,
  Layers,
  Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { detectPlatformWithConfidence, detectServiceType, SERVICE_TYPE_PRIORITY } from "@/lib/service-icon-detection";
import { toast } from "@/hooks/use-toast";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export type OrganizePhase = 
  | 'idle' 
  | 'fetching' 
  | 'analyzing' 
  | 'previewing'
  | 'applying' 
  | 'organizing'
  | 'categorizing'
  | 'completed' 
  | 'error';

export interface OrganizeProgress {
  phase: OrganizePhase;
  current: number;
  total: number;
  message?: string;
}

interface ServicePreview {
  id: string;
  name: string;
  currentCategory: string;
  newCategory: string;
  currentIcon: string;
  newIcon: string;
  confidence: number;
  serviceType: string;
  willChange: boolean;
}

interface SmartOrganizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelId: string;
  onComplete: () => void;
  onRefreshCounts: () => void;
}

const SERVICE_LIMIT = 10000;

export const SmartOrganizeDialog = ({
  open,
  onOpenChange,
  panelId,
  onComplete,
  onRefreshCounts,
}: SmartOrganizeDialogProps) => {
  const [progress, setProgress] = useState<OrganizeProgress>({
    phase: 'idle',
    current: 0,
    total: 0,
  });
  
  const [previewData, setPreviewData] = useState<ServicePreview[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Group preview data by platform
  const groupedData = useMemo(() => {
    const groups: Record<string, ServicePreview[]> = {};
    previewData.forEach(item => {
      const platform = item.newCategory;
      if (!groups[platform]) groups[platform] = [];
      groups[platform].push(item);
    });
    
    // Sort groups by size (most services first)
    return Object.entries(groups)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([platform, services]) => ({
        platform,
        services,
        changeCount: services.filter(s => s.willChange).length,
        totalCount: services.length,
      }));
  }, [previewData]);

  // Stats
  const stats = useMemo(() => {
    const totalServices = previewData.length;
    const willChange = previewData.filter(s => s.willChange).length;
    const highConfidence = previewData.filter(s => s.confidence >= 0.9).length;
    const platformCount = new Set(previewData.map(s => s.newCategory)).size;
    return { totalServices, willChange, highConfidence, platformCount };
  }, [previewData]);

  // Calculate overall percentage
  const overallPercentage = useMemo(() => {
    if (progress.total === 0) return 0;
    
    const phaseWeights: Record<OrganizePhase, { start: number; weight: number }> = {
      idle: { start: 0, weight: 0 },
      fetching: { start: 0, weight: 15 },
      analyzing: { start: 15, weight: 25 },
      previewing: { start: 40, weight: 5 },
      applying: { start: 45, weight: 30 },
      organizing: { start: 75, weight: 15 },
      categorizing: { start: 90, weight: 10 },
      completed: { start: 100, weight: 0 },
      error: { start: 0, weight: 0 },
    };
    
    const { start, weight } = phaseWeights[progress.phase];
    const phaseProgress = progress.total > 0 ? (progress.current / progress.total) : 0;
    return Math.min(100, Math.round(start + (phaseProgress * weight)));
  }, [progress]);

  // Start the organize process when dialog opens
  useEffect(() => {
    if (open && progress.phase === 'idle') {
      startOrganize();
    }
  }, [open]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setProgress({ phase: 'idle', current: 0, total: 0 });
      setPreviewData([]);
      setSelectedIds(new Set());
      setExpandedPlatforms(new Set());
      setIsProcessing(false);
    }
  }, [open]);

  const startOrganize = async () => {
    if (!panelId) return;
    
    setIsProcessing(true);
    setProgress({ phase: 'fetching', current: 0, total: 0, message: 'Starting...' });
    
    try {
      // Phase 1: Fetch total count
      const { count } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panelId);
      
      const totalServices = count || 0;
      setProgress({ phase: 'fetching', current: 0, total: totalServices, message: 'Fetching services...' });
      
      // Paginated fetch ALL services (up to 10,000)
      const pageSize = 1000;
      const allServices: Array<{ id: string; name: string; category: string; image_url: string | null }> = [];
      let page = 0;
      let hasMore = true;
      
      while (hasMore && allServices.length < SERVICE_LIMIT) {
        const { data, error } = await supabase
          .from('services')
          .select('id, name, category, image_url')
          .eq('panel_id', panelId)
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allServices.push(...data);
          page++;
          setProgress({ 
            phase: 'fetching', 
            current: allServices.length, 
            total: totalServices,
            message: `Fetched ${allServices.length.toLocaleString()} services...`
          });
          if (data.length < pageSize) hasMore = false;
        }
      }
      
      // Phase 2: Analysis with progress
      setProgress({ phase: 'analyzing', current: 0, total: allServices.length, message: 'Analyzing services...' });
      
      const analyzed: ServicePreview[] = [];
      const batchSize = 100;
      
      for (let i = 0; i < allServices.length; i += batchSize) {
        const batch = allServices.slice(i, i + batchSize);
        
        batch.forEach(service => {
          const { platform, confidence } = detectPlatformWithConfidence(service.name);
          const serviceType = detectServiceType(service.name);
          const newIcon = `icon:${platform}`;
          const currentIcon = service.image_url || '';
          const willChange = service.category !== platform || currentIcon !== newIcon;
          
          analyzed.push({
            id: service.id,
            name: service.name,
            currentCategory: service.category,
            newCategory: platform,
            currentIcon,
            newIcon,
            confidence,
            serviceType,
            willChange,
          });
        });
        
        setProgress({ 
          phase: 'analyzing', 
          current: Math.min(i + batchSize, allServices.length), 
          total: allServices.length,
          message: `Analyzed ${Math.min(i + batchSize, allServices.length).toLocaleString()} of ${allServices.length.toLocaleString()}...`
        });
        
        // Small delay to allow UI updates
        if (i % 500 === 0) {
          await new Promise(r => setTimeout(r, 10));
        }
      }
      
      // Phase 3: Preview
      setProgress({ phase: 'previewing', current: analyzed.length, total: analyzed.length, message: 'Generating preview...' });
      setPreviewData(analyzed);
      
      // Pre-select all services that will change
      const changeIds = new Set(analyzed.filter(s => s.willChange).map(s => s.id));
      setSelectedIds(changeIds);
      
      // Expand platforms with changes
      const platformsWithChanges = new Set(
        analyzed.filter(s => s.willChange).map(s => s.newCategory)
      );
      setExpandedPlatforms(platformsWithChanges);
      
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Error in Smart Organize:', error);
      setProgress({ phase: 'error', current: 0, total: 0, message: 'Failed to analyze services' });
      toast({ title: 'Failed to analyze services', variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setExpandedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  };

  const toggleService = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePlatformServices = (platform: string, services: ServicePreview[]) => {
    const changeableServices = services.filter(s => s.willChange);
    const allSelected = changeableServices.every(s => selectedIds.has(s.id));
    
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        changeableServices.forEach(s => next.delete(s.id));
      } else {
        changeableServices.forEach(s => next.add(s.id));
      }
      return next;
    });
  };

  const selectAll = () => {
    const changeableIds = previewData.filter(s => s.willChange).map(s => s.id);
    setSelectedIds(new Set(changeableIds));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const applyChanges = async () => {
    const changesToApply = previewData.filter(s => selectedIds.has(s.id) && s.willChange);
    
    if (changesToApply.length === 0) {
      toast({ title: "No changes selected" });
      return;
    }

    setIsProcessing(true);
    setProgress({ phase: 'applying', current: 0, total: changesToApply.length, message: 'Applying changes...' });
    
    try {
      // Batch update in chunks
      const chunkSize = 100;
      
      for (let i = 0; i < changesToApply.length; i += chunkSize) {
        const chunk = changesToApply.slice(i, i + chunkSize);
        
        setProgress({ 
          phase: 'applying', 
          current: i, 
          total: changesToApply.length,
          message: `Updating ${i.toLocaleString()} of ${changesToApply.length.toLocaleString()} services...`
        });
        
        await Promise.all(
          chunk.map(update =>
            supabase
              .from('services')
              .update({ category: update.newCategory as any, image_url: update.newIcon })
              .eq('id', update.id)
          )
        );
      }
      
      // Phase: Organizing - sort by category then service type
      setProgress({ phase: 'organizing', current: 0, total: previewData.length, message: 'Organizing services by category and type...' });
      
      // Sort all services by category, then by service type priority
      const sortedServices = [...previewData].sort((a, b) => {
        // First by category (platform)
        const catCompare = a.newCategory.localeCompare(b.newCategory);
        if (catCompare !== 0) return catCompare;
        
        // Then by service type priority
        const aTypeIndex = SERVICE_TYPE_PRIORITY.indexOf(a.serviceType) !== -1 
          ? SERVICE_TYPE_PRIORITY.indexOf(a.serviceType) 
          : SERVICE_TYPE_PRIORITY.length;
        const bTypeIndex = SERVICE_TYPE_PRIORITY.indexOf(b.serviceType) !== -1 
          ? SERVICE_TYPE_PRIORITY.indexOf(b.serviceType) 
          : SERVICE_TYPE_PRIORITY.length;
        return aTypeIndex - bTypeIndex;
      });
      
      // Update display_order for all services
      const orderUpdates = sortedServices.map((s, index) => ({
        id: s.id,
        display_order: index + 1,
      }));
      
      // Apply display order updates in chunks
      for (let i = 0; i < orderUpdates.length; i += chunkSize) {
        const chunk = orderUpdates.slice(i, i + chunkSize);
        
        setProgress({ 
          phase: 'organizing', 
          current: i, 
          total: orderUpdates.length,
          message: `Organizing ${i.toLocaleString()} of ${orderUpdates.length.toLocaleString()} services...`
        });
        
        await Promise.all(
          chunk.map(update =>
            supabase
              .from('services')
              .update({ display_order: update.display_order })
              .eq('id', update.id)
          )
        );
      }
      
      // Phase: Categorizing - refresh counts
      setProgress({ phase: 'categorizing', current: 0, total: 1, message: 'Updating category counts...' });
      await onRefreshCounts();
      setProgress({ phase: 'categorizing', current: 1, total: 1, message: 'Category counts updated!' });
      
      // Complete
      setProgress({ phase: 'completed', current: changesToApply.length, total: changesToApply.length, message: 'All changes applied and organized!' });
      
      toast({ title: `AutoFixed & Organized ${changesToApply.length} services` });
      
      // Brief delay then close
      setTimeout(() => {
        onComplete();
        onOpenChange(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error applying changes:', error);
      setProgress({ phase: 'error', current: 0, total: 0, message: 'Failed to apply changes' });
      toast({ title: 'Failed to apply changes', variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.95) {
      return <Badge variant="default" className="bg-green-500/20 text-green-600 text-xs">High</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge variant="default" className="bg-amber-500/20 text-amber-600 text-xs">Medium</Badge>;
    }
    return <Badge variant="default" className="bg-red-500/20 text-red-600 text-xs">Low</Badge>;
  };

  const getPlatformIcon = (platform: string) => {
    const iconData = SOCIAL_ICONS_MAP[platform] || SOCIAL_ICONS_MAP.other;
    const IconComponent = iconData.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const phaseLabels: Record<OrganizePhase, string> = {
    idle: 'Preparing...',
    fetching: 'Fetching services...',
    analyzing: 'Analyzing services...',
    previewing: 'Generating preview...',
    applying: 'Applying changes...',
    organizing: 'Organizing by category & type...',
    categorizing: 'Updating categories...',
    completed: 'Completed!',
    error: 'Error occurred',
  };

  const showPreview = progress.phase === 'previewing' && !isProcessing;
  const showProgress = ['fetching', 'analyzing', 'applying', 'organizing', 'categorizing'].includes(progress.phase) || 
                       (progress.phase === 'completed' && isProcessing);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "transition-all duration-300",
        showPreview ? "sm:max-w-4xl max-h-[90vh]" : "sm:max-w-md"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {progress.phase === 'completed' ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : progress.phase === 'error' ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : (
              <Wand2 className={cn("w-5 h-5 text-primary", isProcessing && "animate-pulse")} />
            )}
            AutoFix Icon + Smart Organize
          </DialogTitle>
          <DialogDescription>
            {showPreview 
              ? `Found ${stats.willChange} services to update across ${stats.platformCount} platforms`
              : progress.message || phaseLabels[progress.phase]
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress View */}
        {showProgress && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-primary">
                {phaseLabels[progress.phase]}
              </span>
              <span className="text-muted-foreground">
                {progress.current.toLocaleString()} / {progress.total.toLocaleString()}
              </span>
            </div>
            
            <Progress value={overallPercentage} className="h-3" />
            
            <div className="text-center text-2xl font-bold">
              {overallPercentage}%
            </div>
            
            {/* Phase steps */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              {(['fetching', 'analyzing', 'applying', 'categorizing', 'completed'] as OrganizePhase[]).map((phase, idx, arr) => {
                const isActive = progress.phase === phase;
                const isPast = arr.indexOf(progress.phase) > idx || progress.phase === 'completed';
                const labels = ['Fetch', 'Analyze', 'Apply', 'Categorize', 'Done'];
                
                return (
                  <div key={phase} className="flex items-center">
                    <div className={cn(
                      "flex items-center gap-1",
                      isPast && "text-green-500",
                      isActive && "text-primary font-medium"
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isPast ? "bg-green-500" : isActive ? "bg-primary" : "bg-muted"
                      )} />
                      {labels[idx]}
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="flex-1 h-px bg-border mx-2 w-8" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Preview View */}
        {showPreview && (
          <div className="space-y-4">
            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-lg font-bold">{stats.totalServices.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-lg font-bold text-amber-500">{stats.willChange.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">To Update</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-lg font-bold text-green-500">{stats.highConfidence.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">High Confidence</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-lg font-bold text-primary">{selectedIds.size.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Selected</div>
              </div>
            </div>
            
            {/* Select/Deselect buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All Changes
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
            
            {/* Platform groups */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {groupedData.map(({ platform, services, changeCount, totalCount }) => {
                  const isExpanded = expandedPlatforms.has(platform);
                  const changeableServices = services.filter(s => s.willChange);
                  const allSelected = changeableServices.length > 0 && 
                                     changeableServices.every(s => selectedIds.has(s.id));
                  const someSelected = changeableServices.some(s => selectedIds.has(s.id));
                  
                  return (
                    <Collapsible key={platform} open={isExpanded}>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => togglePlatformServices(platform, services)}
                          className={cn(!allSelected && someSelected && "data-[state=checked]:bg-primary/50")}
                          disabled={changeCount === 0}
                        />
                        <CollapsibleTrigger 
                          className="flex-1 flex items-center gap-2 cursor-pointer"
                          onClick={() => togglePlatform(platform)}
                        >
                          {getPlatformIcon(platform)}
                          <span className="font-medium capitalize">{platform}</span>
                          <Badge variant="secondary" className="text-xs">
                            {totalCount} services
                          </Badge>
                          {changeCount > 0 && (
                            <Badge variant="default" className="text-xs bg-amber-500/20 text-amber-600">
                              {changeCount} changes
                            </Badge>
                          )}
                          <div className="flex-1" />
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </CollapsibleTrigger>
                      </div>
                      
                      <CollapsibleContent className="pl-8 space-y-1 mt-1">
                        {services.slice(0, 50).map(service => (
                          <div 
                            key={service.id}
                            className={cn(
                              "flex items-center gap-2 p-1.5 rounded text-sm",
                              service.willChange ? "bg-amber-500/5" : "opacity-60"
                            )}
                          >
                            <Checkbox
                              checked={selectedIds.has(service.id)}
                              onCheckedChange={() => toggleService(service.id)}
                              disabled={!service.willChange}
                            />
                            <span className="flex-1 truncate" title={service.name}>
                              {service.name}
                            </span>
                            {service.willChange && (
                              <>
                                <span className="text-xs text-muted-foreground">
                                  {service.currentCategory} → {service.newCategory}
                                </span>
                                {getConfidenceBadge(service.confidence)}
                              </>
                            )}
                          </div>
                        ))}
                        {services.length > 50 && (
                          <div className="text-xs text-muted-foreground py-1">
                            + {services.length - 50} more services...
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
            
            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={applyChanges} 
                disabled={selectedIds.size === 0}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Apply {selectedIds.size} Changes
              </Button>
            </div>
          </div>
        )}
        
        {/* Completed state with close button */}
        {progress.phase === 'completed' && !isProcessing && (
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        )}
        
        {/* Error state */}
        {progress.phase === 'error' && (
          <div className="space-y-4">
            <div className="text-center text-destructive">
              {progress.message}
            </div>
            <Button variant="destructive" onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SmartOrganizeDialog;
