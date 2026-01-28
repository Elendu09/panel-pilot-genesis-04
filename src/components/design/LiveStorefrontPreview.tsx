import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  RefreshCw, 
  Monitor, 
  Tablet, 
  Smartphone,
  Globe,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface LiveStorefrontPreviewProps {
  panelId?: string;
  subdomain?: string;
  customDomain?: string;
}

export const LiveStorefrontPreview = ({ panelId, subdomain, customDomain }: LiveStorefrontPreviewProps) => {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [loading, setLoading] = useState(false);
  const [isReachable, setIsReachable] = useState<boolean | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  // Detect actual mobile viewport
  useEffect(() => {
    const checkViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Prioritize custom domain over subdomain
  const storefrontUrl = customDomain 
    ? `https://${customDomain}` 
    : subdomain 
      ? `https://${subdomain}.smmpilot.online` 
      : null;
  
  const displayDomain = customDomain || (subdomain ? `${subdomain}.smmpilot.online` : null);

  // Device sizes - use responsive widths on mobile viewport
  const getDeviceWidth = () => {
    if (isMobileViewport) {
      return "100%"; // Use full width on mobile viewports
    }
    switch (device) {
      case "desktop": return "100%";
      case "tablet": return "768px";
      case "mobile": return "375px";
      default: return "100%";
    }
  };

  const checkReachability = async (retryCount = 0) => {
    if (!displayDomain) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('domain-health-check', {
        body: { domain: displayDomain }
      });

      if (error) throw error;
      const isOnline = data.https_ok || data.http_ok;
      setIsReachable(isOnline);
      
      // Auto-retry up to 3 times if not reachable
      if (!isOnline && retryCount < 3) {
        setTimeout(() => checkReachability(retryCount + 1), 2000);
      }
    } catch (err) {
      console.error('Reachability check failed:', err);
      // Auto-retry on error
      if (retryCount < 3) {
        setTimeout(() => checkReachability(retryCount + 1), 2000);
      } else {
        setIsReachable(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkReachability();
  }, [subdomain, customDomain]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    checkReachability();
  };

  if (!subdomain && !customDomain) {
    return (
      <Card className="flex-1 flex items-center justify-center bg-muted/30 border-dashed">
        <div className="text-center p-8">
          <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-medium mb-2">No Domain Configured</h3>
          <p className="text-sm text-muted-foreground">
            Configure your panel subdomain or custom domain to see the live preview.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-card/30 rounded-2xl border border-border/50 overflow-hidden">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-card/50">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">Live Storefront</span>
          {isReachable !== null && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs gap-1",
                isReachable ? "text-green-500 border-green-500/20" : "text-amber-500 border-amber-500/20"
              )}
            >
              {isReachable ? (
                <><CheckCircle className="w-3 h-3" /> Online</>
              ) : (
                <><AlertCircle className="w-3 h-3" /> Offline</>
              )}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {[
              { device: "desktop" as const, icon: Monitor },
              { device: "tablet" as const, icon: Tablet },
              { device: "mobile" as const, icon: Smartphone },
            ].map(({ device: d, icon: Icon }) => (
              <Button
                key={d}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  device === d && "bg-background shadow-sm"
                )}
                onClick={() => setDevice(d)}
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(storefrontUrl, '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open
          </Button>
        </div>
      </div>

      {/* URL Bar */}
      <div className="px-3 py-2 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-1.5">
          <Globe className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground truncate">
            {storefrontUrl}
          </span>
        </div>
      </div>

      {/* Mobile viewport notice */}
      {isMobileViewport && (
        <div className="px-3 py-2 bg-muted/30 border-b text-center">
          <p className="text-xs text-muted-foreground">
            Preview at {device} size. 
            <button 
              className="text-primary underline ml-1" 
              onClick={() => window.open(storefrontUrl || '', '_blank')}
            >
              Open full preview
            </button>
          </p>
        </div>
      )}

      {/* Preview Content - fixed heights for proper mobile display */}
      <div 
        className={cn(
          "flex-1 p-2 md:p-4 overflow-auto flex items-start justify-center bg-[#1a1a2e]",
          isMobileViewport ? "min-h-[350px]" : "min-h-[500px]"
        )}
      >
        <motion.div
          layout
          className="bg-background rounded-lg overflow-hidden shadow-2xl transition-all duration-300"
          style={{
            width: "100%",
            maxWidth: isMobileViewport ? "100%" : getDeviceWidth(),
            height: isMobileViewport ? "320px" : "calc(100% - 1rem)",
            minHeight: isMobileViewport ? "320px" : "500px",
          }}
        >
          {isReachable === false ? (
            <div className="flex items-center justify-center h-full bg-muted/50">
              <div className="text-center p-6">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                <h3 className="font-medium mb-2">Storefront Not Reachable</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The subdomain may not be configured correctly.
                </p>
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg mb-4">
                  <p>Ensure your DNS has:</p>
                  <p className="font-mono mt-1">*.smmpilot.online → 185.158.133.1</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                  Retry Connection
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              key={refreshKey}
              src={storefrontUrl || undefined}
              className="w-full h-full border-0"
              title="Storefront Preview"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LiveStorefrontPreview;
