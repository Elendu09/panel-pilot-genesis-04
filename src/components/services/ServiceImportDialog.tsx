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

interface FetchedService {
  id: number;
  name: string;
  category: string;
  price: number;
  minQty: number;
  maxQty: number;
  description: string;
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
  onImport: (services: FetchedService[], markups: Record<number, number>) => void;
}

export const ServiceImportDialog = ({
  open,
  onOpenChange,
  providers,
  getCategoryIcon,
  onImport,
}: ServiceImportDialogProps) => {
  const [step, setStep] = useState<"select" | "services">("select");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [globalMarkup, setGlobalMarkup] = useState(25);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedServices, setFetchedServices] = useState<FetchedService[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [serviceMarkups, setServiceMarkups] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showEducation, setShowEducation] = useState(true);
  
  // Provider balance state
  const [providerBalance, setProviderBalance] = useState<number | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const filteredServices = fetchedServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      const mappedServices: FetchedService[] = data.services.map((s: any, index: number) => ({
        id: s.service || s.id || index + 1,
        name: s.name || `Service ${s.service || s.id}`,
        category: mapCategory(s.category || 'other'),
        price: parseFloat(s.rate || s.price || 0) / 1000,
        minQty: parseInt(s.min || s.min_quantity || 100),
        maxQty: parseInt(s.max || s.max_quantity || 10000),
        description: s.description || s.name || '',
      }));
      
      setFetchedServices(mappedServices);
      toast({ title: `${mappedServices.length} services loaded successfully!` });
      
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

  // Helper to map provider categories to our enum
  const mapCategory = (category: string): string => {
    const lower = category.toLowerCase();
    if (lower.includes('instagram') || lower.includes('ig')) return 'instagram';
    if (lower.includes('facebook') || lower.includes('fb')) return 'facebook';
    if (lower.includes('twitter') || lower.includes('x')) return 'twitter';
    if (lower.includes('youtube') || lower.includes('yt')) return 'youtube';
    if (lower.includes('tiktok') || lower.includes('tik')) return 'tiktok';
    if (lower.includes('linkedin')) return 'linkedin';
    if (lower.includes('telegram')) return 'telegram';
    return 'other';
  };

  const toggleService = (id: number) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map(s => s.id));
    }
  };

  const getServiceFinalPrice = (service: FetchedService) => {
    const markup = serviceMarkups[service.id] ?? globalMarkup;
    return service.price * (1 + markup / 100);
  };

  const handleImport = () => {
    const selectedServiceData = fetchedServices.filter(s => selectedServices.includes(s.id));
    onImport(selectedServiceData, { ...serviceMarkups });
    reset();
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
  };
    setSelectedProvider("");
    setGlobalMarkup(25);
    setFetchedServices([]);
    setSelectedServices([]);
    setServiceMarkups({});
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && reset()}>
      <DialogContent className={cn(
        "glass-card border-border/50",
        step === "services" && "max-w-4xl"
      )}>
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "Import Services from Provider" : "Select Services to Import"}
          </DialogTitle>
          <DialogDescription>
            {step === "select" 
              ? "Fetch and import services from your connected API providers"
              : `${fetchedServices.length} services found. Select which ones to import.`
            }
          </DialogDescription>
        </DialogHeader>

        {step === "select" ? (
          <div className="space-y-4 py-4">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label>Select Provider</Label>
              <Select value={selectedProvider} onValueChange={handleProviderChange}>
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
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
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

            {/* Services List */}
            <ScrollArea className="h-[350px] sm:h-[400px] rounded-lg border border-border/50">
              <div className="space-y-2 p-2">
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
                      className={cn(
                        "p-3 sm:p-4 rounded-lg border transition-all cursor-pointer",
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border/30 hover:border-border/60 bg-background/30"
                      )}
                      onClick={() => toggleService(service.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleService(service.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <CategoryIcon className="w-4 h-4 text-primary shrink-0" />
                              <span className="font-medium truncate text-sm">{service.name}</span>
                              <Badge variant="outline" className="text-xs capitalize shrink-0">
                                {service.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{service.description}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span>Min: {service.minQty.toLocaleString()}</span>
                              <span>Max: {service.maxQty.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Pricing */}
                        <div className="text-left sm:text-right space-y-1 pl-7 sm:pl-0">
                          <div className="flex items-center gap-2 sm:justify-end">
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
                            <Badge variant="outline" className={cn(
                              "text-xs ml-1",
                              markup >= 25 ? "text-emerald-500" : markup >= 10 ? "text-amber-500" : "text-red-500"
                            )}>
                              +${(service.price * markup / 100).toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setStep("select")} className="w-full sm:w-auto">
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={selectedServices.length === 0}
                className="bg-gradient-to-r from-primary to-primary/80 w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Import {selectedServices.length} Services
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceImportDialog;