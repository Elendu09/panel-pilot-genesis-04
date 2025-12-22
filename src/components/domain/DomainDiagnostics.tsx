import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Globe, 
  Shield, 
  Server,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DiagnosticResult {
  domain: string;
  dnsOk: boolean;
  httpsOk: boolean;
  httpOk: boolean;
  aRecords: string[];
  checkedAt: string;
  durationMs: number;
}

interface DomainDiagnosticsProps {
  panelSubdomain?: string;
  customDomains?: Array<{ domain: string; verification_status: string }>;
}

export const DomainDiagnostics = ({ panelSubdomain, customDomains = [] }: DomainDiagnosticsProps) => {
  const [results, setResults] = useState<Record<string, DiagnosticResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [customDomain, setCustomDomain] = useState("");
  const [isCheckingCustom, setIsCheckingCustom] = useState(false);

  const LOVABLE_IP = "185.158.133.1";

  const checkDomain = async (domain: string) => {
    setLoading(prev => ({ ...prev, [domain]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke("domain-health-check", {
        body: { domain }
      });

      if (error) throw error;

      setResults(prev => ({
        ...prev,
        [domain]: {
          domain,
          dnsOk: data.dns_ok,
          httpsOk: data.https_ok,
          httpOk: data.http_ok,
          aRecords: data.a_records || [],
          checkedAt: data.checked_at,
          durationMs: data.duration_ms
        }
      }));
    } catch (error) {
      console.error('Diagnostics error:', error);
      setResults(prev => ({
        ...prev,
        [domain]: {
          domain,
          dnsOk: false,
          httpsOk: false,
          httpOk: false,
          aRecords: [],
          checkedAt: new Date().toISOString(),
          durationMs: 0
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [domain]: false }));
    }
  };

  const checkAllDomains = async () => {
    const allDomains = [
      panelSubdomain ? `${panelSubdomain}.smmpilot.online` : null,
      ...customDomains.map(d => d.domain)
    ].filter(Boolean) as string[];

    for (const domain of allDomains) {
      await checkDomain(domain);
    }
  };

  const checkCustomDomain = async () => {
    if (!customDomain.trim()) return;
    setIsCheckingCustom(true);
    await checkDomain(customDomain.trim());
    setIsCheckingCustom(false);
  };

  const getStatusIcon = (ok: boolean) => {
    return ok 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const allDomains = [
    panelSubdomain ? { domain: `${panelSubdomain}.smmpilot.online`, type: 'subdomain' } : null,
    ...customDomains.map(d => ({ domain: d.domain, type: 'custom' }))
  ].filter(Boolean) as Array<{ domain: string; type: string }>;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          Domain Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Check All Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Check DNS and SSL status for all your domains
          </p>
          <Button onClick={checkAllDomains} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Check All
          </Button>
        </div>

        {/* Domain List */}
        <div className="space-y-3">
          {allDomains.map(({ domain, type }) => {
            const result = results[domain];
            const isLoading = loading[domain];

            return (
              <motion.div
                key={domain}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-border/50 bg-background/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <code className="font-mono text-sm truncate">{domain}</code>
                      <Badge variant="outline" className="text-xs">
                        {type === 'subdomain' ? 'Subdomain' : 'Custom'}
                      </Badge>
                    </div>

                    {result && (
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.dnsOk)}
                          <div>
                            <p className="text-xs font-medium">DNS</p>
                            <p className="text-xs text-muted-foreground">
                              {result.dnsOk ? `Points to ${LOVABLE_IP}` : 'Not configured'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.httpsOk)}
                          <div>
                            <p className="text-xs font-medium">HTTPS</p>
                            <p className="text-xs text-muted-foreground">
                              {result.httpsOk ? 'SSL Active' : 'Not active'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.httpOk)}
                          <div>
                            <p className="text-xs font-medium">HTTP</p>
                            <p className="text-xs text-muted-foreground">
                              {result.httpOk ? 'Reachable' : 'Not reachable'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {result && result.aRecords.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        A Records: {result.aRecords.join(', ')}
                        {!result.aRecords.includes(LOVABLE_IP) && (
                          <span className="text-amber-500 ml-2">
                            (Should be {LOVABLE_IP})
                          </span>
                        )}
                      </div>
                    )}

                    {result && !result.dnsOk && (
                      <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                          <div className="text-xs">
                            <p className="font-medium text-amber-500">DNS Not Configured</p>
                            <p className="text-muted-foreground mt-1">
                              Add an A record pointing to <code className="bg-muted px-1 rounded">{LOVABLE_IP}</code>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => checkDomain(domain)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Custom Domain Check */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-sm font-medium mb-2">Check Any Domain</p>
          <div className="flex gap-2">
            <Input
              placeholder="example.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="flex-1 bg-background/50"
            />
            <Button 
              onClick={checkCustomDomain}
              disabled={isCheckingCustom || !customDomain.trim()}
            >
              {isCheckingCustom ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Check"
              )}
            </Button>
          </div>

          {results[customDomain] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 rounded-lg border border-border/50 bg-background/30"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(results[customDomain].dnsOk)}
                  <span className="text-sm">DNS: {results[customDomain].dnsOk ? 'OK' : 'Failed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(results[customDomain].httpsOk)}
                  <span className="text-sm">HTTPS: {results[customDomain].httpsOk ? 'OK' : 'Failed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(results[customDomain].httpOk)}
                  <span className="text-sm">HTTP: {results[customDomain].httpOk ? 'OK' : 'Failed'}</span>
                </div>
              </div>
              {results[customDomain].aRecords.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  A Records: {results[customDomain].aRecords.join(', ')}
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Help Text */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong>Required DNS Setup:</strong> All domains must have an A record pointing to{' '}
            <code className="bg-background px-1 rounded">{LOVABLE_IP}</code>. 
            For subdomains like <code>yourpanel.smmpilot.online</code>, you need a wildcard DNS record.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainDiagnostics;
