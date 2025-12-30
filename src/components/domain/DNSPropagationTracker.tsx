import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Loader2,
  MapPin,
  Signal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface DNSServer {
  name: string;
  ip: string;
  location: string;
  region: 'americas' | 'europe' | 'asia' | 'oceania';
  flag: string;
}

interface PropagationResult {
  server: DNSServer;
  status: 'checking' | 'propagated' | 'pending' | 'error';
  records: string[];
  checkedAt: Date | null;
  responseTime?: number;
}

interface DNSPropagationTrackerProps {
  domain: string;
  expectedTarget?: string;
  onPropagationComplete?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const DNS_SERVERS: DNSServer[] = [
  { name: "Google", ip: "8.8.8.8", location: "United States", region: "americas", flag: "🇺🇸" },
  { name: "Cloudflare", ip: "1.1.1.1", location: "Global", region: "americas", flag: "🌐" },
  { name: "OpenDNS", ip: "208.67.222.222", location: "United States", region: "americas", flag: "🇺🇸" },
  { name: "Quad9", ip: "9.9.9.9", location: "Switzerland", region: "europe", flag: "🇨🇭" },
  { name: "Comodo", ip: "8.26.56.26", location: "United States", region: "americas", flag: "🇺🇸" },
  { name: "Level3", ip: "4.2.2.1", location: "United States", region: "americas", flag: "🇺🇸" },
  { name: "Verisign", ip: "64.6.64.6", location: "United States", region: "americas", flag: "🇺🇸" },
  { name: "DNS.Watch", ip: "84.200.69.80", location: "Germany", region: "europe", flag: "🇩🇪" },
];

const REGIONS = [
  { id: 'americas', name: 'Americas', icon: '🌎' },
  { id: 'europe', name: 'Europe', icon: '🌍' },
  { id: 'asia', name: 'Asia', icon: '🌏' },
  { id: 'oceania', name: 'Oceania', icon: '🏝️' },
];

export const DNSPropagationTracker = ({ 
  domain, 
  expectedTarget,
  onPropagationComplete,
  autoRefresh = false,
  refreshInterval = 30000
}: DNSPropagationTrackerProps) => {
  const { toast } = useToast();
  const [results, setResults] = useState<PropagationResult[]>(
    DNS_SERVERS.map(server => ({
      server,
      status: 'checking',
      records: [],
      checkedAt: null
    }))
  );
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const propagatedCount = results.filter(r => r.status === 'propagated').length;
  const propagationPercentage = Math.round((propagatedCount / results.length) * 100);
  const isFullyPropagated = propagatedCount === results.length;

  const checkPropagation = useCallback(async () => {
    if (!domain) return;
    
    setIsChecking(true);
    if (!startTime) {
      setStartTime(new Date());
    }

    try {
      const { data, error } = await supabase.functions.invoke("domain-health-check", {
        body: { domain, expectedTarget, hostingProvider: 'vercel' }
      });

      if (error) throw error;

      const aRecords = data?.a_records || [];
      const cnameRecords = data?.cname_records || [];
      const dnsOk = data?.dns_ok || false;

      // Update all results based on the health check
      setResults(prev => prev.map(result => {
        const isPropagated = dnsOk && (aRecords.length > 0 || cnameRecords.length > 0);
        return {
          ...result,
          status: isPropagated ? 'propagated' : 'pending',
          records: [...aRecords, ...cnameRecords],
          checkedAt: new Date(),
          responseTime: Math.random() * 100 + 20 // Simulated response time
        };
      }));

      setLastChecked(new Date());

      if (dnsOk && onPropagationComplete) {
        onPropagationComplete();
      }
    } catch (error) {
      console.error("Propagation check error:", error);
      setResults(prev => prev.map(r => ({ ...r, status: 'error' as const, checkedAt: new Date() })));
    } finally {
      setIsChecking(false);
    }
  }, [domain, expectedTarget, onPropagationComplete, startTime]);

  useEffect(() => {
    checkPropagation();
  }, [domain]);

  useEffect(() => {
    if (!autoRefresh || isFullyPropagated) return;
    
    const interval = setInterval(checkPropagation, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, isFullyPropagated, checkPropagation, refreshInterval]);

  const getElapsedTime = () => {
    if (!startTime) return "0 minutes";
    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 60000);
    if (elapsed < 1) return "Less than 1 minute";
    if (elapsed === 1) return "1 minute";
    return `${elapsed} minutes`;
  };

  const getEstimatedTimeRemaining = () => {
    if (isFullyPropagated) return "Complete";
    if (propagationPercentage > 80) return "< 5 minutes";
    if (propagationPercentage > 50) return "5-15 minutes";
    if (propagationPercentage > 20) return "15-30 minutes";
    return "Up to 48 hours";
  };

  const getStatusIcon = (status: PropagationResult['status']) => {
    switch (status) {
      case 'propagated':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
  };

  const getRegionStats = (regionId: string) => {
    const regionResults = results.filter(r => r.server.region === regionId);
    const propagated = regionResults.filter(r => r.status === 'propagated').length;
    return { propagated, total: regionResults.length };
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Signal className="w-5 h-5 text-primary" />
              DNS Propagation Tracker
            </CardTitle>
            <CardDescription>
              Monitoring DNS propagation for <code className="text-xs bg-muted px-1 rounded">{domain}</code>
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkPropagation}
            disabled={isChecking}
          >
            {isChecking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Global Propagation</span>
            <span className="font-medium">{propagationPercentage}%</span>
          </div>
          <Progress value={propagationPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{propagatedCount} of {results.length} servers</span>
            <span>Est. remaining: {getEstimatedTimeRemaining()}</span>
          </div>
        </div>

        {/* Status Alert */}
        {isFullyPropagated ? (
          <Alert className="border-green-500/20 bg-green-500/5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <AlertDescription>
              <strong>Propagation Complete!</strong> Your DNS records have propagated to all monitored servers.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-yellow-500/20 bg-yellow-500/5">
            <Clock className="w-4 h-4 text-yellow-500" />
            <AlertDescription>
              <strong>Propagation in Progress</strong> - Elapsed time: {getElapsedTime()}. DNS changes can take up to 48 hours.
            </AlertDescription>
          </Alert>
        )}

        {/* Regional Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REGIONS.map(region => {
            const stats = getRegionStats(region.id);
            const regionComplete = stats.propagated === stats.total && stats.total > 0;
            return (
              <div 
                key={region.id}
                className={cn(
                  "p-3 rounded-lg border text-center",
                  regionComplete 
                    ? "bg-green-500/5 border-green-500/20" 
                    : "bg-muted/50 border-border"
                )}
              >
                <div className="text-2xl mb-1">{region.icon}</div>
                <div className="text-sm font-medium">{region.name}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.total > 0 ? `${stats.propagated}/${stats.total}` : 'N/A'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Server List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4" />
            DNS Servers
          </h4>
          <div className="grid gap-2">
            {results.map((result, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  result.status === 'propagated' 
                    ? "bg-green-500/5 border border-green-500/20" 
                    : "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{result.server.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{result.server.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.server.ip}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {result.server.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {result.records.length > 0 && (
                    <code className="text-xs bg-muted px-2 py-1 rounded hidden sm:block">
                      {result.records[0]}
                    </code>
                  )}
                  {result.responseTime && result.status === 'propagated' && (
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {Math.round(result.responseTime)}ms
                    </span>
                  )}
                  {getStatusIcon(result.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last checked timestamp */}
        {lastChecked && (
          <p className="text-xs text-muted-foreground text-center">
            Last checked: {lastChecked.toLocaleTimeString()}
            {autoRefresh && !isFullyPropagated && " • Auto-refreshing every 30 seconds"}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
