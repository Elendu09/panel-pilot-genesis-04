import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle,
  Globe,
  AlertTriangle,
  Loader2,
  ImageOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface SubdomainPreviewProps {
  subdomain: string;
  panelName: string;
  primaryColor?: string;
  secondaryColor?: string;
  panelStatus?: 'active' | 'pending' | 'suspended';
  status?: 'active' | 'pending' | 'checking';
  onRefresh?: () => void;
  customDomain?: string | null;
}

const SubdomainPreview = ({
  subdomain,
  panelName,
  primaryColor = '#3b82f6',
  secondaryColor = '#1e40af',
  panelStatus,
  status = 'checking',
  onRefresh,
  customDomain
}: SubdomainPreviewProps) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [checking, setChecking] = useState(false);
  const [isReachable, setIsReachable] = useState<boolean | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const storefrontUrl = customDomain ? `https://${customDomain}` : `https://${subdomain}.smmpilot.online`;

  useEffect(() => {
    if (subdomain) {
      checkReachability();
    }
  }, [subdomain]);

  const checkReachability = async () => {
    // If panel is active, assume it's reachable - don't show pending DNS
    if (panelStatus === 'active') {
      setIsReachable(true);
      return;
    }

    setChecking(true);
    try {
      // Try to call the domain health check function
      const { data, error } = await supabase.functions.invoke('domain-health-check', {
        body: { domain: `${subdomain}.smmpilot.online` }
      });

      if (!error && data) {
        setIsReachable(data.https?.reachable || data.http?.reachable || false);
      } else {
        // Fallback: assume reachable
        setIsReachable(true);
      }
    } catch (err) {
      // If the function doesn't exist or fails, assume reachable
      setIsReachable(true);
    } finally {
      setChecking(false);
    }
  };

  // Determine the actual display status based on panel status and reachability
  const getDisplayStatus = () => {
    // If panel is active in the database, show as Live
    if (panelStatus === 'active') {
      return 'live';
    }
    // If panel is suspended
    if (panelStatus === 'suspended') {
      return 'suspended';
    }
    // If still checking
    if (checking) {
      return 'checking';
    }
    // If panel is pending or reachability check failed
    return 'pending';
  };

  const displayStatus = getDisplayStatus();

  const deviceSizes = {
    desktop: { width: '100%', height: '400px' },
    tablet: { width: '768px', height: '400px' },
    mobile: { width: '375px', height: '400px' }
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Website Live Preview</CardTitle>
              <p className="text-sm text-muted-foreground">{storefrontUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            {displayStatus === 'checking' ? (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Checking
              </Badge>
            ) : displayStatus === 'live' ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Live
              </Badge>
            ) : displayStatus === 'suspended' ? (
              <Badge variant="outline" className="bg-red-500/10 text-red-500">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Suspended
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Pending Setup
              </Badge>
            )}
            
            {/* Device Selector */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
              {[
                { id: 'desktop', icon: Monitor },
                { id: 'tablet', icon: Tablet },
                { id: 'mobile', icon: Smartphone }
              ].map(({ id, icon: Icon }) => (
                <Button
                  key={id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    device === id && "bg-background shadow-sm"
                  )}
                  onClick={() => setDevice(id as any)}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIframeLoading(true);
                setIframeError(false);
                setRefreshKey(prev => prev + 1);
                checkReachability();
                onRefresh?.();
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(storefrontUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* URL Bar */}
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg mb-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-background rounded-md">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate">{storefrontUrl}</span>
          </div>
        </div>

        {/* Preview Frame */}
        <motion.div
          className="mx-auto border border-border rounded-lg overflow-hidden bg-background relative"
          style={{ 
            maxWidth: deviceSizes[device].width,
            height: deviceSizes[device].height 
          }}
          layout
        >
          {/* Loading Skeleton */}
          {iframeLoading && !iframeError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading preview...</span>
            </div>
          )}

          {/* Error Fallback */}
          {iframeError ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 bg-muted/20">
              <div className="p-4 rounded-full bg-muted">
                <ImageOff className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h4 className="font-medium text-foreground">Preview not available</h4>
                <p className="text-sm text-muted-foreground max-w-xs">
                  The preview cannot be displayed here due to security restrictions. Open in a new tab to view your storefront.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(storefrontUrl, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </Button>
            </div>
          ) : (
            <iframe
              key={`${subdomain}-${device}-${refreshKey}`}
              src={storefrontUrl}
              className={cn(
                "w-full h-full border-0 transition-opacity duration-300 bg-white",
                iframeLoading ? "opacity-0" : "opacity-100"
              )}
              title="Website Live Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onLoad={() => setIframeLoading(false)}
            />
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default SubdomainPreview;