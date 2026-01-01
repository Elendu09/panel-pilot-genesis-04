import { useState } from "react";
import { 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Server,
  Sparkles,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { detectPlatformEnhanced, getServiceIcon } from "@/lib/service-icon-detection";

interface Provider {
  id: string;
  name: string;
  api_endpoint?: string;
  api_key?: string;
}

interface ResyncProgress {
  phase: 'idle' | 'fetching' | 'comparing' | 'updating' | 'complete';
  current: number;
  total: number;
  updated: number;
  skipped: number;
  newDetected: number;
  priceAdjusted: number;
}

interface ServiceResyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: Provider[];
  panelId: string;
  onComplete: () => void;
  onOpenSmartOrganize: () => void;
}

export const ServiceResyncDialog = ({
  open,
  onOpenChange,
  providers,
  panelId,
  onComplete,
  onOpenSmartOrganize,
}: ServiceResyncDialogProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [progress, setProgress] = useState<ResyncProgress>({
    phase: 'idle',
    current: 0,
    total: 0,
    updated: 0,
    skipped: 0,
    newDetected: 0,
    priceAdjusted: 0,
  });
  const [isResyncing, setIsResyncing] = useState(false);
  const [providerBalance, setProviderBalance] = useState<number | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

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

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    setProgress({ phase: 'idle', current: 0, total: 0, updated: 0, skipped: 0, newDetected: 0, priceAdjusted: 0 });
    checkProviderBalance(providerId);
  };

  const handleResync = async () => {
    if (!selectedProvider) {
      toast({ title: "Please select a provider", variant: "destructive" });
      return;
    }

    const provider = providers.find(p => p.id === selectedProvider);
    if (!provider?.api_endpoint || !provider?.api_key) {
      toast({ title: "Provider missing API credentials", variant: "destructive" });
      return;
    }

    setIsResyncing(true);
    setProgress({ phase: 'fetching', current: 0, total: 0, updated: 0, skipped: 0, newDetected: 0, priceAdjusted: 0 });

    try {
      // Step 1: Fetch services from provider
      const { data: providerData, error: fetchError } = await supabase.functions.invoke('provider-services', {
        body: { 
          apiEndpoint: provider.api_endpoint, 
          apiKey: provider.api_key 
        }
      });

      if (fetchError || !providerData?.services) {
        throw new Error(fetchError?.message || 'Failed to fetch services from provider');
      }

      const providerServices = providerData.services;
      setProgress(prev => ({ ...prev, phase: 'comparing', total: providerServices.length }));

      // Step 2: Get existing services from this provider in the database
      const { data: existingServices, error: dbError } = await supabase
        .from('services')
        .select('id, name, category, image_url, provider_id, provider_service_id, features, price, provider_price, markup_percent')
        .eq('panel_id', panelId);

      if (dbError) throw dbError;

      // Build lookup map: provider_service_id -> existing service
      const existingMap = new Map<string, typeof existingServices[0]>();
      (existingServices || []).forEach(s => {
        // Check provider_service_id first, then fall back to features.original_service_id
        if (s.provider_service_id) {
          existingMap.set(s.provider_service_id, s);
        } else if (s.features) {
          try {
            const features = JSON.parse(s.features as string);
            if (features.original_service_id) {
              existingMap.set(String(features.original_service_id), s);
            }
          } catch (e) {
            // ignore
          }
        }
      });

      setProgress(prev => ({ ...prev, phase: 'updating' }));

      // Step 3: Process each provider service
      let updated = 0;
      let skipped = 0;
      let newDetected = 0;
      let priceAdjusted = 0;
      const updates: Array<{ 
        id: string; 
        category: string; 
        image_url: string; 
        provider_service_id: string;
        price?: number;
        provider_price?: number;
      }> = [];

      for (let i = 0; i < providerServices.length; i++) {
        const ps = providerServices[i];
        const providerServiceId = String(ps.service || ps.id);
        const serviceName = ps.name || `Service ${providerServiceId}`;
        
        // Detect platform using enhanced detection
        const { platform: detectedPlatform } = detectPlatformEnhanced(serviceName);
        const newIconUrl = `icon:${detectedPlatform}`;

        const existing = existingMap.get(providerServiceId);
        
        if (existing) {
          const categoryChanged = existing.category !== detectedPlatform;
          const iconChanged = existing.image_url !== newIconUrl;
          
          // Check if provider price changed - auto-adjust selling price
          const newProviderPrice = ps.rate;
          const storedProviderPrice = existing.provider_price;
          const markupPercent = existing.markup_percent ?? 0;
          
          let priceChanged = false;
          let newPrice = existing.price;
          
          if (newProviderPrice !== undefined && newProviderPrice !== storedProviderPrice) {
            // Recalculate price with stored markup
            newPrice = newProviderPrice * (1 + markupPercent / 100);
            priceChanged = true;
          }
          
          // Check if anything needs updating
          if (categoryChanged || iconChanged || priceChanged) {
            const updateData: any = {
              id: existing.id,
              category: detectedPlatform as any,
              image_url: newIconUrl,
              provider_service_id: providerServiceId,
            };
            
            if (priceChanged) {
              updateData.price = newPrice;
              updateData.provider_price = newProviderPrice;
              priceAdjusted++;
            }
            
            updates.push(updateData);
            updated++;
          } else {
            skipped++;
          }
        } else {
          // Service doesn't exist in our DB - count as new (but don't import)
          newDetected++;
        }

        setProgress(prev => ({ 
          ...prev, 
          current: i + 1, 
          updated, 
          skipped, 
          newDetected,
          priceAdjusted
        }));
      }

      // Step 4: Apply updates in batches
      const batchSize = 50;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        // Update each service in the batch
        for (const update of batch) {
          const updatePayload: any = {
            category: update.category as any,
            image_url: update.image_url,
            provider_service_id: update.provider_service_id,
          };
          
          // Include price updates if provider price changed
          if (update.price !== undefined) {
            updatePayload.price = update.price;
            updatePayload.provider_price = update.provider_price;
          }
          
          await supabase
            .from('services')
            .update(updatePayload)
            .eq('id', update.id);
        }
      }

      setProgress(prev => ({ ...prev, phase: 'complete' }));
      
      const priceMsg = priceAdjusted > 0 ? `, ${priceAdjusted} prices adjusted` : '';
      toast({ 
        title: "Re-sync Complete!", 
        description: `Updated ${updated} services${priceMsg}, ${skipped} unchanged, ${newDetected} new available`,
      });

    } catch (error: any) {
      console.error('Resync error:', error);
      toast({ 
        title: "Re-sync Failed", 
        description: error.message || "Failed to re-sync services",
        variant: "destructive" 
      });
      setProgress(prev => ({ ...prev, phase: 'idle' }));
    } finally {
      setIsResyncing(false);
    }
  };

  const handleClose = () => {
    if (!isResyncing) {
      setSelectedProvider("");
      setProgress({ phase: 'idle', current: 0, total: 0, updated: 0, skipped: 0, newDetected: 0, priceAdjusted: 0 });
      setProviderBalance(null);
      onOpenChange(false);
      if (progress.phase === 'complete') {
        onComplete();
      }
    }
  };

  const handleOpenSmartOrganize = () => {
    handleClose();
    onOpenSmartOrganize();
  };

  const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Re-sync Services from Provider
          </DialogTitle>
          <DialogDescription>
            Update categories and icons for existing services using enhanced detection (50+ platforms)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Provider</label>
            <Select 
              value={selectedProvider} 
              onValueChange={handleProviderChange}
              disabled={isResyncing}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Choose a provider to re-sync" />
              </SelectTrigger>
              <SelectContent>
                {providers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider Balance */}
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
            </div>
          )}

          {/* Progress Display */}
          {progress.phase !== 'idle' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {progress.phase === 'fetching' && 'Fetching services from provider...'}
                  {progress.phase === 'comparing' && 'Comparing with existing services...'}
                  {progress.phase === 'updating' && `Processing ${progress.current} of ${progress.total}...`}
                  {progress.phase === 'complete' && 'Re-sync complete!'}
                </span>
                {progress.phase === 'complete' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="font-medium">{progressPercent}%</span>
                )}
              </div>
              
              <Progress value={progressPercent} className="h-2" />

              {/* Results Summary */}
              {(progress.phase === 'updating' || progress.phase === 'complete') && (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-lg font-bold text-green-500">{progress.updated}</div>
                    <div className="text-xs text-muted-foreground">Updated</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="text-lg font-bold text-orange-500">{progress.priceAdjusted}</div>
                    <div className="text-xs text-muted-foreground">Prices Adjusted</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50 border border-border/50">
                    <div className="text-lg font-bold">{progress.skipped}</div>
                    <div className="text-xs text-muted-foreground">Unchanged</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-lg font-bold text-blue-500">{progress.newDetected}</div>
                    <div className="text-xs text-muted-foreground">New Available</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* What this does info */}
          {progress.phase === 'idle' && selectedProvider && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2 text-sm">
                <Package className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-primary">What this does:</p>
                  <ul className="mt-1 text-muted-foreground text-xs space-y-1">
                    <li>• Re-fetches service list from provider API</li>
                    <li>• Updates categories & icons using enhanced detection</li>
                    <li>• <span className="text-orange-500 font-medium">Auto-adjusts prices</span> when provider rates change</li>
                    <li>• Does NOT duplicate or re-import existing services</li>
                    <li>• Shows count of new services available to import</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {progress.phase === 'complete' ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button 
                onClick={handleOpenSmartOrganize}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Run SmartOrganize
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={isResyncing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleResync}
                disabled={!selectedProvider || isResyncing}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {isResyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Re-syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Start Re-sync
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
