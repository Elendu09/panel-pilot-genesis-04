import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Check, 
  AlertCircle, 
  Download, 
  Sparkles, 
  Search,
  Layers,
  Wand2,
  Zap,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { detectPlatformEnhanced, detectServiceType, SERVICE_TYPE_PRIORITY, getSubCategory, getQualityOrder } from "@/lib/service-icon-detection";
import { toast } from "@/hooks/use-toast";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";

export type OrganizePhase = 
  | 'idle' 
  | 'health-check'
  | 'fetching' 
  | 'analyzing' 
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
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Live stats for automatic processing
  const [liveStats, setLiveStats] = useState({
    processed: 0,
    applied: 0,
    categories: new Set<string>(),
    healthIssues: 0,
  });

  // Calculate overall percentage
  const overallPercentage = useMemo(() => {
    if (progress.total === 0 && progress.phase !== 'health-check') return 0;
    
    const phaseWeights: Record<OrganizePhase, { start: number; weight: number }> = {
      idle: { start: 0, weight: 0 },
      'health-check': { start: 0, weight: 10 },
      fetching: { start: 10, weight: 10 },
      analyzing: { start: 20, weight: 25 },
      applying: { start: 45, weight: 25 },
      organizing: { start: 70, weight: 15 },
      categorizing: { start: 85, weight: 15 },
      completed: { start: 100, weight: 0 },
      error: { start: 0, weight: 0 },
    };
    
    const { start, weight } = phaseWeights[progress.phase];
    const phaseProgress = progress.total > 0 ? (progress.current / progress.total) : (progress.phase === 'health-check' ? 1 : 0);
    return Math.min(100, Math.round(start + (phaseProgress * weight)));
  }, [progress]);

  // Start the organize process when dialog opens
  useEffect(() => {
    if (open && progress.phase === 'idle') {
      startAutoOrganize();
    }
  }, [open]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setProgress({ phase: 'idle', current: 0, total: 0 });
      setIsProcessing(false);
      setLiveStats({ processed: 0, applied: 0, categories: new Set(), healthIssues: 0 });
    }
  }, [open]);

  const startAutoOrganize = async () => {
    if (!panelId) return;
    
    setIsProcessing(true);
    setProgress({ phase: 'health-check', current: 0, total: 0, message: 'Running health check scan...' });
    setLiveStats({ processed: 0, applied: 0, categories: new Set(), healthIssues: 0 });
    
    try {
      // Phase 0: Health Check - scan for issues
      let healthIssuesFound = 0;
      
      // Check for services with missing data
      const { count: missingIcons } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panelId)
        .or('image_url.is.null,image_url.eq.');
      
      const { count: missingCategories } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panelId)
        .or('category.is.null,category.eq.other');
      
      const { count: inactiveServices } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panelId)
        .eq('is_active', false);
      
      healthIssuesFound = (missingIcons || 0) + (missingCategories || 0);
      setLiveStats(prev => ({ ...prev, healthIssues: healthIssuesFound }));
      setProgress({ phase: 'health-check', current: 1, total: 1, message: `Found ${healthIssuesFound} issues to fix` });
      
      // Brief pause to show health check results
      await new Promise(r => setTimeout(r, 500));
      
      // Phase 1: Fetch total count
      const { count } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panelId);
      
      const totalServices = count || 0;
      setProgress({ phase: 'fetching', current: 0, total: totalServices, message: 'Fetching all services...' });
      
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
            message: `Fetched ${allServices.length.toLocaleString()} of ${totalServices.toLocaleString()} services...`
          });
          if (data.length < pageSize) hasMore = false;
        }
      }
      
      // Phase 2: AI Analysis with enhanced detection
      setProgress({ phase: 'analyzing', current: 0, total: allServices.length, message: 'AI analyzing services...' });
      
      interface AnalyzedService {
        id: string;
        name: string;
        currentCategory: string;
        newCategory: string;
        newIcon: string;
        serviceType: string;
        subCategory: string;
        willChange: boolean;
      }
      
      const analyzed: AnalyzedService[] = [];
      const categoriesFound = new Set<string>();
      const batchSize = 200;
      
      for (let i = 0; i < allServices.length; i += batchSize) {
        const batch = allServices.slice(i, i + batchSize);
        
        batch.forEach(service => {
          const { platform } = detectPlatformEnhanced(service.name);
          const serviceType = detectServiceType(service.name);
          const subCategory = getSubCategory(service.name);
          const newIcon = `icon:${platform}`;
          const currentIcon = service.image_url || '';
          const willChange = service.category !== platform || currentIcon !== newIcon;
          
          categoriesFound.add(platform);
          
          analyzed.push({
            id: service.id,
            name: service.name,
            currentCategory: service.category,
            newCategory: platform,
            newIcon,
            serviceType,
            subCategory,
            willChange,
          });
        });
        
        setLiveStats(prev => ({
          ...prev,
          processed: Math.min(i + batchSize, allServices.length),
          categories: categoriesFound,
        }));
        
        setProgress({ 
          phase: 'analyzing', 
          current: Math.min(i + batchSize, allServices.length), 
          total: allServices.length,
          message: `Analyzed ${Math.min(i + batchSize, allServices.length).toLocaleString()} services...`
        });
        
        // Yield to UI
        if (i % 400 === 0) {
          await new Promise(r => requestAnimationFrame(() => setTimeout(r, 5)));
        }
      }
      
      // Phase 3: Apply ALL changes automatically (no preview needed)
      const changesToApply = analyzed.filter(s => s.willChange);
      setProgress({ phase: 'applying', current: 0, total: changesToApply.length, message: 'Applying changes...' });
      
      const chunkSize = 100;
      let appliedCount = 0;
      
      for (let i = 0; i < changesToApply.length; i += chunkSize) {
        const chunk = changesToApply.slice(i, i + chunkSize);
        
        await Promise.all(
          chunk.map(update =>
            supabase
              .from('services')
              .update({ category: update.newCategory as any, image_url: update.newIcon })
              .eq('id', update.id)
          )
        );
        
        appliedCount += chunk.length;
        setLiveStats(prev => ({ ...prev, applied: appliedCount }));
        
        setProgress({ 
          phase: 'applying', 
          current: appliedCount, 
          total: changesToApply.length,
          message: `Updated ${appliedCount.toLocaleString()} of ${changesToApply.length.toLocaleString()} services...`
        });
      }
      
      // Phase 4: Organize - sort by category then service type
      setProgress({ phase: 'organizing', current: 0, total: analyzed.length, message: 'Organizing by category & type...' });
      
      const sortedServices = [...analyzed].sort((a, b) => {
        // 1. Sort by category (platform)
        const catCompare = a.newCategory.localeCompare(b.newCategory);
        if (catCompare !== 0) return catCompare;
        
        // 2. Sort by service type priority (followers, likes, views, etc.)
        const aTypeIndex = SERVICE_TYPE_PRIORITY.indexOf(a.serviceType) !== -1 
          ? SERVICE_TYPE_PRIORITY.indexOf(a.serviceType) 
          : SERVICE_TYPE_PRIORITY.length;
        const bTypeIndex = SERVICE_TYPE_PRIORITY.indexOf(b.serviceType) !== -1 
          ? SERVICE_TYPE_PRIORITY.indexOf(b.serviceType) 
          : SERVICE_TYPE_PRIORITY.length;
        if (aTypeIndex !== bTypeIndex) return aTypeIndex - bTypeIndex;
        
        // 3. Sort by quality (premium > fast > standard > cheap)
        const qualityCompare = getQualityOrder(a.name) - getQualityOrder(b.name);
        if (qualityCompare !== 0) return qualityCompare;
        
        // 4. Alphabetical fallback
        return a.name.localeCompare(b.name);
      });
      
      // Update display_order for all services
      const orderUpdates = sortedServices.map((s, index) => ({
        id: s.id,
        display_order: index + 1,
      }));
      
      for (let i = 0; i < orderUpdates.length; i += chunkSize) {
        const chunk = orderUpdates.slice(i, i + chunkSize);
        
        await Promise.all(
          chunk.map(update =>
            supabase
              .from('services')
              .update({ display_order: update.display_order })
              .eq('id', update.id)
          )
        );
        
        setProgress({ 
          phase: 'organizing', 
          current: Math.min(i + chunkSize, orderUpdates.length), 
          total: orderUpdates.length,
          message: `Organized ${Math.min(i + chunkSize, orderUpdates.length).toLocaleString()} services...`
        });
      }
      
      // Phase 5: Update category counts with delay to ensure DB propagation
      setProgress({ phase: 'categorizing', current: 0, total: 1, message: 'Updating category counts...' });
      
      // First refresh
      await onRefreshCounts();
      
      // Small delay to ensure Supabase has propagated all changes
      await new Promise(r => setTimeout(r, 800));
      
      // Second refresh for accuracy
      await onRefreshCounts();
      
      setProgress({ phase: 'categorizing', current: 1, total: 1, message: 'Category counts updated!' });
      
      // Complete
      setProgress({ 
        phase: 'completed', 
        current: changesToApply.length, 
        total: changesToApply.length, 
        message: `Successfully organized ${allServices.length.toLocaleString()} services!` 
      });
      
      toast({ 
        title: `AutoFix Complete!`,
        description: `Organized ${allServices.length.toLocaleString()} services into ${categoriesFound.size} categories. Updated ${changesToApply.length.toLocaleString()} services.`,
      });
      
      // Brief delay then close
      setTimeout(() => {
        onComplete();
        onOpenChange(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error in Smart Organize:', error);
      setProgress({ phase: 'error', current: 0, total: 0, message: 'Failed to organize services' });
      toast({ title: 'Failed to organize services', variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const iconData = SOCIAL_ICONS_MAP[platform] || SOCIAL_ICONS_MAP.other;
    const IconComponent = iconData.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const phaseLabels: Record<OrganizePhase, string> = {
    idle: 'Preparing...',
    'health-check': 'Running health check...',
    fetching: 'Fetching services...',
    analyzing: 'AI analyzing 50+ platforms...',
    applying: 'Applying icon & category fixes...',
    organizing: 'Organizing by category & type...',
    categorizing: 'Updating categories...',
    completed: 'Completed!',
    error: 'Error occurred',
  };

  const phaseIcons: Record<OrganizePhase, React.ReactNode> = {
    idle: <Loader2 className="w-5 h-5 animate-spin" />,
    'health-check': <Stethoscope className="w-5 h-5 animate-pulse" />,
    fetching: <Download className="w-5 h-5 animate-pulse" />,
    analyzing: <Search className="w-5 h-5 animate-pulse" />,
    applying: <Sparkles className="w-5 h-5 animate-pulse" />,
    organizing: <Layers className="w-5 h-5 animate-pulse" />,
    categorizing: <Wand2 className="w-5 h-5 animate-pulse" />,
    completed: <Check className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-destructive" />,
  };

  const showProgress = ['health-check', 'fetching', 'analyzing', 'applying', 'organizing', 'categorizing'].includes(progress.phase);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => {
          if (['completed', 'error'].includes(progress.phase)) {
            onOpenChange(false);
          } else {
            e.preventDefault(); // Prevent closing during processing
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {phaseIcons[progress.phase]}
            Smart Organize + Health Check
          </DialogTitle>
          <DialogDescription>
            {progress.message || phaseLabels[progress.phase]}
          </DialogDescription>
        </DialogHeader>
        
        {/* Enhanced Progress View */}
        {showProgress && (
          <div className="space-y-5 py-4">
            {/* Phase indicator with animated dots */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary animate-pulse" />
                <span className="font-medium text-primary">
                  {phaseLabels[progress.phase]}
                </span>
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
              <span className="text-muted-foreground font-mono text-xs">
                {progress.current.toLocaleString()} / {progress.total.toLocaleString()}
              </span>
            </div>
            
            {/* Enhanced gradient progress bar */}
            <div className="relative">
              <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
                <div 
                  className="h-full transition-all duration-300 ease-out rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
              {/* Shimmer effect */}
              <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </div>
            
            {/* Percentage with live stats */}
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {overallPercentage}%
              </div>
            </div>
            
            {/* Live Stats Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-lg font-bold text-primary">{liveStats.processed.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Scanned</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-lg font-bold text-green-500">{liveStats.applied.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Fixed</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-lg font-bold text-amber-500">{liveStats.categories.size}</div>
                <div className="text-[10px] text-muted-foreground">Platforms</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="text-lg font-bold text-blue-500">{liveStats.healthIssues}</div>
                <div className="text-[10px] text-muted-foreground">Issues</div>
              </div>
            </div>
            
            {/* Phase steps with connecting lines */}
            <div className="relative pt-4">
              <div className="flex items-center justify-between">
                {(['health-check', 'fetching', 'analyzing', 'applying', 'organizing', 'completed'] as OrganizePhase[]).map((phase, idx, arr) => {
                  const isActive = progress.phase === phase || (progress.phase === 'categorizing' && phase === 'organizing');
                  const currentIdx = arr.indexOf(progress.phase);
                  const isPast = currentIdx > idx || progress.phase === 'completed' || progress.phase === 'categorizing';
                  const labels = ['Health', 'Fetch', 'Analyze', 'Apply', 'Organize', 'Done'];
                  
                  return (
                    <div key={phase} className="flex flex-col items-center relative z-10">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-all duration-300",
                        isPast ? "bg-green-500 text-white" : 
                        isActive ? "bg-primary text-primary-foreground scale-110 ring-2 ring-primary/30" : 
                        "bg-muted text-muted-foreground"
                      )}>
                        {isPast ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <span className={cn(
                        "text-[9px] mt-1 font-medium whitespace-nowrap",
                        isPast && "text-green-500",
                        isActive && "text-primary"
                      )}>
                        {labels[idx]}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Connecting line */}
              <div className="absolute top-[22px] left-2.5 right-2.5 h-0.5 bg-muted -z-0">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ 
                    width: `${Math.max(0, ((['health-check', 'fetching', 'analyzing', 'applying', 'organizing', 'completed'] as OrganizePhase[]).indexOf(progress.phase === 'categorizing' ? 'organizing' : progress.phase) / 5) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Completed state */}
        {progress.phase === 'completed' && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">All Done!</h3>
                <p className="text-sm text-muted-foreground">{progress.message}</p>
              </div>
            </div>
            
            {/* Final Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-primary">{liveStats.processed.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Services</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-green-500">{liveStats.applied.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Fixed</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-amber-500">{liveStats.categories.size}</div>
                <div className="text-[10px] text-muted-foreground">Categories</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-lg font-bold text-blue-500">{liveStats.healthIssues}</div>
                <div className="text-[10px] text-muted-foreground">Issues</div>
              </div>
            </div>
            
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        )}
        
        {/* Error state */}
        {progress.phase === 'error' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div className="text-center text-destructive">
                {progress.message}
              </div>
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
