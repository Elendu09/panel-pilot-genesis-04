import { useState } from "react";
import { 
  Search, 
  CheckSquare, 
  Square, 
  Download, 
  Loader2, 
  Percent,
  Info,
  TrendingUp,
  AlertCircle,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MarkupEducation } from "./MarkupEducation";
import { supabase } from "@/integrations/supabase/client";
import { detectPlatformEnhanced, getServiceIcon } from "@/lib/service-icon-detection";

interface FetchedService {
  id: number;
  name: string;
  category: string;
  price: number;
  minQty: number;
  maxQty: number;
  description: string;
  iconUrl?: string; // Pre-computed icon URL from AI detection
}

interface Provider {
  id: string;
  name: string;
  api_endpoint?: string;
  api_key?: string;
  is_platform_provider?: boolean;
}

interface ServiceImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: Provider[];
  getCategoryIcon: (category: string) => React.ComponentType<{ className?: string }>;
  onImport: (services: FetchedService[], markups: Record<number, number>, providerId: string, providerName: string) => void;
  currentServiceCount?: number;
  maxServiceLimit?: number;
}

export const ServiceImportDialog = ({
  open,
  onOpenChange,
  providers,
  getCategoryIcon,
  onImport,
  currentServiceCount = 0,
  maxServiceLimit = 10000,
}: ServiceImportDialogProps) => {
  // Service limit calculations
  const remainingSlots = Math.max(0, maxServiceLimit - currentServiceCount);
  const isAtLimit = currentServiceCount >= maxServiceLimit;
  const isNearLimit = currentServiceCount >= maxServiceLimit * 0.9;
  const [step, setStep] = useState<"select" | "services">("select");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [globalMarkup, setGlobalMarkup] = useState(25);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedServices, setFetchedServices] = useState<FetchedService[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [serviceMarkups, setServiceMarkups] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showEducation, setShowEducation] = useState(true);
  const [hideAlreadyImported, setHideAlreadyImported] = useState(true);
  const [existingServiceIds, setExistingServiceIds] = useState<Set<number>>(new Set());
  
  // Import progress state
  const [importProgress, setImportProgress] = useState<{
    importing: boolean;
    current: number;
    total: number;
  }>({ importing: false, current: 0, total: 0 });
  
  // Provider balance state
  const [providerBalance, setProviderBalance] = useState<number | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter services - optionally hide already imported
  const filteredServices = fetchedServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    const isAlreadyImported = existingServiceIds.has(service.id);
    return matchesSearch && (!hideAlreadyImported || !isAlreadyImported);
  });

  const alreadyImportedCount = fetchedServices.filter(s => existingServiceIds.has(s.id)).length;
  const newServicesCount = fetchedServices.length - alreadyImportedCount;

  // Check provider balance when provider is selected
  const checkProviderBalance = async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider?.api_endpoint || !provider?.api_key) {
      setProviderBalance(null);
      return;
    }

    setIsCheckingBalance(true);
    try {
      const { data, error } = await supabase.functions.invoke('provider-balance', {
        body: { 
          api_endpoint: provider.api_endpoint, 
          api_key: provider.api_key 
        }
      });

      if (error) throw error;
      setProviderBalance(data?.balance ?? null);
    } catch (error) {
      console.error('Error checking balance:', error);
      setProviderBalance(null);
    } finally {
      setIsCheckingBalance(false);
    }
  };

  // Check balance when provider changes
  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    setFetchError(null);
    checkProviderBalance(providerId);
  };

  const handleFetchServices = async () => {
    if (!selectedProvider) {
      toast({ title: "Please select a provider", variant: "destructive" });
      return;
    }
    
    setIsFetching(true);
    setFetchError(null);
    
    try {
      const provider = providers.find(p => p.id === selectedProvider);
      
      if (!provider?.api_endpoint || !provider?.api_key) {
        setFetchError("Provider missing API credentials. Please update the provider settings first.");
        toast({ variant: "destructive", title: "Provider missing API credentials" });
        return;
      }

      // Call the provider-services edge function to fetch real services
      const { data, error } = await supabase.functions.invoke('provider-services', {
        body: { 
          apiEndpoint: provider.api_endpoint, 
          apiKey: provider.api_key 
        }
      });

      if (error) {
        const errorMsg = error.message || 'Unknown error';
        setFetchError(`API Error: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      if (!data?.services || data.services.length === 0) {
        setFetchError("No services returned from provider. Check API credentials or provider status.");
        toast({ title: "No services found from this provider", variant: "destructive" });
        setFetchedServices([]);
        return;
      }
      
      // Map the API response to our format
      // NOTE: Provider rate is already "per 1K" - DO NOT divide by 1000!
      // Use AI detection on service NAME (not provider category) for accurate classification
      const mappedServices: FetchedService[] = data.services.map((s: any, index: number) => {
        const serviceName = s.name || `Service ${s.service || s.id}`;
        // Try provider category first, then fall back to service name detection
        const providerCategory = s.category || s.network || '';
        const { platform: nameDetected, confidence: nameConfidence } = detectPlatformEnhanced(serviceName);
        const { platform: catDetected, confidence: catConfidence } = detectPlatformEnhanced(providerCategory);
        
        // Use whichever has higher confidence, prioritizing name detection
        const detectedPlatform = nameConfidence >= catConfidence ? nameDetected : catDetected;
        const iconUrl = `icon:${detectedPlatform}`;
        
        return {
          id: s.service || s.id || index + 1,
          name: serviceName,
          category: detectedPlatform, // AI-detected from service name + category (50+ platforms)
          price: parseFloat(s.rate || s.price || 0), // Provider rate per 1K - no division
          minQty: parseInt(s.min || s.min_quantity || 100),
          maxQty: parseInt(s.max || s.max_quantity || 10000),
          description: s.description || s.name || '',
          iconUrl, // Pre-computed icon URL for import
        };
      });
      
      // Log detection results for debugging
      console.log(`[Import] Detected platforms from ${mappedServices.length} services:`);
      const platformCounts: Record<string, number> = {};
      mappedServices.forEach(s => {
        platformCounts[s.category] = (platformCounts[s.category] || 0) + 1;
      });
      console.log(platformCounts);
      
      // Check which services are already imported by matching provider_id
      const providerIds = mappedServices.map(s => String(s.id));
      const { data: existingServices } = await supabase
        .from('services')
        .select('provider_id')
        .in('provider_id', providerIds);
      
      const existingIds = new Set<number>(
        (existingServices || [])
          .map(s => parseInt(s.provider_id || '0'))
          .filter(id => id > 0)
      );
      setExistingServiceIds(existingIds);
      
      setFetchedServices(mappedServices);
      
      const importedCount = mappedServices.filter(s => existingIds.has(s.id)).length;
      toast({ 
        title: `${mappedServices.length} services loaded!`,
        description: importedCount > 0 ? `${importedCount} already imported` : undefined
      });
      
      setSelectedServices([]);
      setServiceMarkups({});
      setStep("services");
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({ 
        variant: "destructive", 
        title: "Failed to fetch services", 
        description: error.message || "Check provider API credentials" 
      });
    } finally {
      setIsFetching(false);
    }
  };

  // NOTE: mapCategory is now replaced by detectPlatformEnhanced() which supports 50+ platforms
  // Detection is done directly from service NAME (not provider category) for accuracy

  const toggleService = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      // Limit selection to remaining slots
      const availableToSelect = filteredServices.slice(0, remainingSlots);
      setSelectedServices(availableToSelect.map(s => s.id));
      
      if (filteredServices.length > remainingSlots) {
        toast({ 
          title: `Selected ${availableToSelect.length} services`, 
          description: `Limited to ${remainingSlots.toLocaleString()} remaining slots.`,
        });
      }
    }
  };

  const getServiceFinalPrice = (service: FetchedService) => {
    const markup = serviceMarkups[service.id] ?? globalMarkup;
    return service.price * (1 + markup / 100);
  };

  const handleImport = async () => {
    // For selected services import, we still use the old flow via onImport
    // But for "Import All" we use the new edge function
    let selectedServiceData = fetchedServices.filter(s => selectedServices.includes(s.id));
    
    // Enforce limit
    if (selectedServiceData.length > remainingSlots) {
      selectedServiceData = selectedServiceData.slice(0, remainingSlots);
      toast({ 
        title: `Importing ${selectedServiceData.length} services`, 
        description: `Limited to ${remainingSlots.toLocaleString()} remaining slots.`,
      });
    }
    
    const total = selectedServiceData.length;
    
    if (total === 0) {
      toast({ title: "No services selected", variant: "destructive" });
      return;
    }
    
    setImportProgress({ importing: true, current: 0, total });
    
    try {
      // Get provider info for storing with services
      const provider = providers.find(p => p.id === selectedProvider);
      const providerId = selectedProvider;
      const providerName = provider?.name || 'Unknown';
      
      // Import in chunks with progress
      const chunkSize = 50;
      for (let i = 0; i < total; i += chunkSize) {
        const chunk = selectedServiceData.slice(i, i + chunkSize);
        const chunkMarkups: Record<number, number> = {};
        chunk.forEach(s => {
          chunkMarkups[s.id] = serviceMarkups[s.id] ?? globalMarkup;
        });
        
        await onImport(chunk, chunkMarkups, providerId, providerName);
        setImportProgress({ importing: true, current: Math.min(i + chunkSize, total), total });
      }
      
      toast({ title: `${total} services imported successfully!` });
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: "Import failed", variant: "destructive" });
    } finally {
      setImportProgress({ importing: false, current: 0, total: 0 });
      reset();
    }
  };

  const reset = () => {
    onOpenChange(false);
    setStep("select");
    setSelectedProvider("");
    setGlobalMarkup(25);
    setFetchedServices([]);
    setSelectedServices([]);
    setServiceMarkups({});
    setSearchQuery("");
    setProviderBalance(null);
    setFetchError(null);
    setExistingServiceIds(new Set());
    setHideAlreadyImported(true);
    setImportProgress({ importing: false, current: 0, total: 0 });
  };

  // Calculate import percentage
  const importPercentage = importProgress.total > 0 
    ? Math.round((importProgress.current / importProgress.total) * 100) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && reset()}>
      <DialogContent className={cn(
        "glass-card border-border/50 w-[95vw] max-w-[95vw] sm:w-full",
        step === "select" ? "sm:max-w-lg" : "sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl"
      )}>
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "Import Services from Provider" : "Select Services to Import"}
          </DialogTitle>
          <DialogDescription>
            {step === "select" 
              ? "Fetch and import services from your connected API providers"
              : `${fetchedServices.length} services found. ${alreadyImportedCount > 0 ? `${alreadyImportedCount} already imported.` : ''} Select which ones to import.`
            }
          </DialogDescription>
        </DialogHeader>

        {step === "select" ? (
          <div className="space-y-4 py-4">
            {/* Service Limit Warning */}
            {isAtLimit && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-2 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Maximum Service Limit Reached</p>
                    <p className="text-xs mt-1">You have {currentServiceCount.toLocaleString()} / {maxServiceLimit.toLocaleString()} services. Delete some services to import more.</p>
                  </div>
                </div>
              </div>
            )}
            
            {isNearLimit && !isAtLimit && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-2 text-sm text-amber-500">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Approaching Service Limit</p>
                    <p className="text-xs mt-1">You can import up to {remainingSlots.toLocaleString()} more services ({currentServiceCount.toLocaleString()} / {maxServiceLimit.toLocaleString()}).</p>
                  </div>
                </div>
              </div>
            )}

            {/* Provider Selection */}
            <div className="space-y-2">
              <Label>Select Provider</Label>
              <Select value={selectedProvider} onValueChange={handleProviderChange} disabled={isAtLimit}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={isAtLimit ? "Service limit reached" : "Choose a provider"} />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider Balance Display */}
            {selectedProvider && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Provider Status</span>
                  </div>
                  {isCheckingBalance ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : providerBalance !== null ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Balance: ${providerBalance.toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                      Unable to check balance
                    </Badge>
                  )}
                </div>
                {providerBalance !== null && providerBalance < 10 && (
                  <div className="flex items-start gap-2 mt-2 text-xs text-amber-500">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Low balance! You may need to add funds to this provider.</span>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {fetchError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-2 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{fetchError}</span>
                </div>
              </div>
            )}

            {/* Markup Education Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  Default Price Markup
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <div className="space-y-2 text-xs">
                          <p className="font-medium">What is Markup?</p>
                          <p className="text-muted-foreground">
                            Markup is the percentage you add to the provider's price to make your profit. 
                            A 25% markup on a $2.00 service means you sell it for $2.50.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Badge variant="outline" className={cn(
                  globalMarkup >= 25 ? "text-emerald-500 border-emerald-500/30" :
                  globalMarkup >= 10 ? "text-amber-500 border-amber-500/30" :
                  "text-red-500 border-red-500/30"
                )}>
                  {globalMarkup >= 25 ? "Good margin" : globalMarkup >= 10 ? "Standard" : "Low margin"}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <Slider
                  value={[globalMarkup]}
                  onValueChange={([value]) => setGlobalMarkup(value)}
                  max={100}
                  min={0}
                  step={5}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 w-20">
                  <Input 
                    type="number" 
                    value={globalMarkup}
                    onChange={(e) => setGlobalMarkup(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="bg-background/50 h-9 text-center"
                  />
                  <Percent className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </div>

              {/* Example Preview */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Preview Example</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Provider Price</p>
                    <p className="font-medium">$2.00</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Your Markup</p>
                    <p className="font-medium text-amber-500">+{globalMarkup}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Your Price</p>
                    <p className="font-medium text-primary">${(2 * (1 + globalMarkup/100)).toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-500 mt-2">
                  Your profit: ${(2 * globalMarkup/100).toFixed(2)} per 1000 units
                </p>
              </div>

              {globalMarkup < 10 && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-500">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Low markup may result in minimal profit. Consider increasing to at least 20-25% for sustainable business.</p>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={reset}>Cancel</Button>
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
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 pb-2">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">Select</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">Configure</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">Import</span>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAll} className="flex-1 sm:flex-none">
                  {selectedServices.length === filteredServices.length ? (
                    <><Square className="w-4 h-4 mr-2" /> Deselect All</>
                  ) : (
                    <><CheckSquare className="w-4 h-4 mr-2" /> Select All</>
                  )}
                </Button>
                <Badge variant="secondary" className="px-3 py-1 whitespace-nowrap">
                  {selectedServices.length} selected
                </Badge>
                {alreadyImportedCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setHideAlreadyImported(!hideAlreadyImported)}
                    className="text-xs"
                  >
                    {hideAlreadyImported ? `Show ${alreadyImportedCount} imported` : 'Hide imported'}
                  </Button>
                )}
              </div>
            </div>

            {/* Global Markup Control */}
            <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg border border-border/50 bg-background/30">
              <Percent className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Global Markup</p>
                <p className="text-xs text-muted-foreground truncate">Applied to services without custom markup</p>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  value={[globalMarkup]}
                  onValueChange={([value]) => setGlobalMarkup(value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-24 hidden sm:flex"
                />
                <Input
                  type="number"
                  value={globalMarkup}
                  onChange={(e) => setGlobalMarkup(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-16 bg-background/50 text-center"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            {/* Services List - Kanban Style Cards with Scroll */}
            <ScrollArea className="h-[40vh] sm:h-[50vh] max-h-[400px] rounded-lg border border-border/50">
              <div className="p-2 sm:p-3">
                {/* Empty state */}
                {filteredServices.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No services found matching your search</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                )}
                
                {/* Mobile: Vertical cards, Desktop: Grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredServices.map((service) => {
                    const isSelected = selectedServices.includes(service.id);
                    const finalPrice = getServiceFinalPrice(service);
                    const markup = serviceMarkups[service.id] ?? globalMarkup;
                    const CategoryIcon = getCategoryIcon(service.category);
                    
                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "p-3 rounded-xl border transition-all cursor-pointer relative group",
                          existingServiceIds.has(service.id) && "opacity-60",
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" 
                            : "border-border/30 hover:border-border/60 bg-background/30 hover:bg-background/50"
                        )}
                        onClick={() => toggleService(service.id)}
                      >
                        {existingServiceIds.has(service.id) && (
                          <Badge className="absolute -top-2 -right-2 text-[9px] bg-amber-500/80 shadow-sm">
                            Already Imported
                          </Badge>
                        )}
                        {/* Card Header */}
                        <div className="flex items-start gap-2 mb-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleService(service.id)}
                            className="mt-0.5 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <CategoryIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                              <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0 truncate max-w-[80px]">
                                {service.category}
                              </Badge>
                              <Badge variant="secondary" className="text-[9px] px-1 py-0 opacity-60">
                                ID: {service.id}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm leading-tight line-clamp-2" title={service.name}>
                              {service.name}
                            </p>
                          </div>
                        </div>

                        {/* Service Details */}
                        <div className="space-y-2 pl-6">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Min: {service.minQty.toLocaleString()}</span>
                            <span>•</span>
                            <span>Max: {service.maxQty.toLocaleString()}</span>
                          </div>
                          
                          {/* Pricing Row */}
                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/30">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground line-through">
                                ${service.price < 1 ? service.price.toFixed(4) : service.price.toFixed(2)}
                              </span>
                              <span className="text-sm font-semibold text-primary">
                                ${finalPrice < 1 ? finalPrice.toFixed(4) : finalPrice.toFixed(2)}
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
                                className="w-12 h-6 text-[10px] bg-background/50 px-1 text-center"
                              />
                              <span className="text-[10px] text-muted-foreground">%</span>
                            </div>
                          </div>
                          
                          {/* Profit Badge */}
                          <Badge variant="outline" className={cn(
                            "text-[10px] w-full justify-center",
                            markup >= 25 ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5" : 
                            markup >= 10 ? "text-amber-500 border-amber-500/30 bg-amber-500/5" : 
                            "text-red-500 border-red-500/30 bg-red-500/5"
                          )}>
                            Profit: +${(service.price * markup / 100).toFixed(4)}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="flex-col gap-3">
              {/* Import Progress */}
              {importProgress.importing && (
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Importing services...</span>
                    <span className="font-medium">{importProgress.current} / {importProgress.total}</span>
                  </div>
                  <Progress value={importPercentage} className="h-2" />
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("select")} 
                  className="w-full sm:w-auto"
                  disabled={importProgress.importing}
                >
                  Back
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={selectedServices.length === 0 || importProgress.importing}
                  className="bg-gradient-to-r from-primary to-primary/80 w-full sm:w-auto"
                >
                  {importProgress.importing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {importProgress.importing 
                    ? `Importing ${importPercentage}%...` 
                    : `Import ${selectedServices.length} Services`
                  }
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceImportDialog;