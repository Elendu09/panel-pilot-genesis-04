import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  Loader2, 
  AlertCircle,
  Globe,
  Shield,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { VERCEL_IP, VERCEL_CNAME } from "@/lib/hosting-config";

interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT';
  status: 'pending' | 'checking' | 'verified' | 'error';
  expected: string;
  found?: string;
}

interface DNSVerificationProgressProps {
  domain: string;
  verificationToken?: string;
  onVerified?: () => void;
  autoCheck?: boolean;
  checkIntervalMs?: number;
}

export function DNSVerificationProgress({
  domain,
  verificationToken,
  onVerified,
  autoCheck = true,
  checkIntervalMs = 30000
}: DNSVerificationProgressProps) {
  const [records, setRecords] = useState<DNSRecord[]>([
    { type: 'A', status: 'pending', expected: VERCEL_IP },
    { type: 'CNAME', status: 'pending', expected: VERCEL_CNAME },
    { type: 'TXT', status: 'pending', expected: verificationToken ? `smmpilot-verify=${verificationToken}` : '' }
  ]);
  const [sslStatus, setSslStatus] = useState<'pending' | 'provisioning' | 'active' | 'error'>('pending');
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const verifiedCount = records.filter(r => r.status === 'verified').length;
  const totalRecords = records.length;
  const progress = (verifiedCount / totalRecords) * 100;
  const allVerified = verifiedCount === totalRecords && sslStatus === 'active';

  const checkDNS = async () => {
    if (!domain) return;
    
    setChecking(true);
    setRecords(prev => prev.map(r => ({ ...r, status: 'checking' as const })));

    try {
      const { data, error } = await supabase.functions.invoke('domain-health-check', {
        body: { domain }
      });

      if (error) throw error;

      const dnsOk = !!data?.dns_ok;
      const httpsOk = !!data?.https_ok;
      const txtOk = !!data?.txt_ok;

      // Update record statuses — TXT is verified independently from A/CNAME
      setRecords(prev => prev.map(r => {
        if (r.type === 'TXT') {
          return { ...r, status: txtOk ? 'verified' : 'pending', found: txtOk ? r.expected : undefined };
        }
        return { ...r, status: dnsOk ? 'verified' : 'pending', found: dnsOk ? r.expected : undefined };
      }));

      setSslStatus(httpsOk ? 'active' : dnsOk ? 'provisioning' : 'pending');
      setLastCheck(new Date());

      if (dnsOk && httpsOk && onVerified) {
        onVerified();
      }
    } catch (err) {
      console.error('DNS check error:', err);
      setRecords(prev => prev.map(r => ({ ...r, status: 'error' as const })));
    } finally {
      setChecking(false);
    }
  };

  // Auto-check on mount and interval
  useEffect(() => {
    if (!autoCheck || !domain) return;

    checkDNS();
    const interval = setInterval(checkDNS, checkIntervalMs);
    return () => clearInterval(interval);
  }, [domain, autoCheck, checkIntervalMs]);

  const getStatusIcon = (status: DNSRecord['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'checking':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: DNSRecord['status']) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'checking': return 'Checking...';
      case 'error': return 'Error';
      default: return 'Pending';
    }
  };

  const getSSLStatusConfig = () => {
    switch (sslStatus) {
      case 'active':
        return { icon: Shield, label: 'SSL Active', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'provisioning':
        return { icon: Loader2, label: 'Provisioning SSL...', color: 'text-blue-500', bg: 'bg-blue-500/10', animate: true };
      case 'error':
        return { icon: AlertCircle, label: 'SSL Error', color: 'text-red-500', bg: 'bg-red-500/10' };
      default:
        return { icon: Clock, label: 'Waiting for DNS', color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  const sslConfig = getSSLStatusConfig();
  const SSLIcon = sslConfig.icon;

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              allVerified ? "bg-emerald-500/20" : "bg-primary/20"
            )}>
              <Globe className={cn(
                "w-5 h-5",
                allVerified ? "text-emerald-500" : "text-primary"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">{domain}</CardTitle>
              <CardDescription>
                {allVerified ? 'Domain is live!' : 'Verifying DNS configuration...'}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkDNS}
            disabled={checking}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", checking && "animate-spin")} />
            {checking ? 'Checking...' : 'Verify Now'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Verification Progress</span>
            <span className="font-medium">{verifiedCount}/{totalRecords} records</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* DNS Records Status */}
        <div className="space-y-2">
          {records.map((record, idx) => (
            <div 
              key={idx}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all",
                record.status === 'verified' 
                  ? "bg-emerald-500/5 border-emerald-500/30" 
                  : "bg-muted/30 border-border/50"
              )}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(record.status)}
                <div>
                  <span className="font-medium text-sm">{record.type} Record</span>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                    {record.expected}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  record.status === 'verified' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                )}
              >
                {getStatusLabel(record.status)}
              </Badge>
            </div>
          ))}

          {/* SSL Status */}
          <div 
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-all",
              sslStatus === 'active' 
                ? "bg-emerald-500/5 border-emerald-500/30" 
                : "bg-muted/30 border-border/50"
            )}
          >
            <div className="flex items-center gap-3">
              <SSLIcon className={cn(
                "w-4 h-4",
                sslConfig.color,
                sslConfig.animate && "animate-spin"
              )} />
              <div>
                <span className="font-medium text-sm">SSL Certificate</span>
                <p className="text-xs text-muted-foreground">HTTPS encryption</p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                sslStatus === 'active' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
              )}
            >
              {sslConfig.label}
            </Badge>
          </div>
        </div>

        {/* Live Status */}
        {allVerified && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-emerald-600">Domain is live!</span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => window.open(`https://${domain}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Visit Site
            </Button>
          </div>
        )}

        {/* Last Check Time */}
        {lastCheck && (
          <p className="text-xs text-muted-foreground text-center">
            Last checked: {lastCheck.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
