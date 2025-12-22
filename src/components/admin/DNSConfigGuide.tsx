import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Globe, 
  Copy, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Server,
  Shield,
  Wifi
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface DNSConfigGuideProps {
  subdomain?: string;
}

const LOVABLE_IP = "185.158.133.1";

export const DNSConfigGuide = ({ subdomain }: DNSConfigGuideProps) => {
  const [checkingDNS, setCheckingDNS] = useState(false);
  const [dnsResults, setDnsResults] = useState<{
    subdomain: string;
    aRecord: boolean;
    https: boolean;
    http: boolean;
    aRecords: string[];
  } | null>(null);
  const [testSubdomain, setTestSubdomain] = useState(subdomain || "");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const checkSubdomainDNS = async (sub: string) => {
    if (!sub) {
      toast({ variant: "destructive", title: "Enter a subdomain to check" });
      return;
    }

    setCheckingDNS(true);
    try {
      const domain = `${sub}.smmpilot.online`;
      const { data, error } = await supabase.functions.invoke('domain-health-check', {
        body: { domain }
      });

      if (error) throw error;

      setDnsResults({
        subdomain: sub,
        aRecord: data.dns_ok,
        https: data.https_ok,
        http: data.http_ok,
        aRecords: data.a_records || []
      });
    } catch (error) {
      console.error('DNS check failed:', error);
      toast({ variant: "destructive", title: "DNS check failed" });
    } finally {
      setCheckingDNS(false);
    }
  };

  const dnsRecords = [
    { type: "A", name: "@", value: LOVABLE_IP, description: "Root domain" },
    { type: "A", name: "*", value: LOVABLE_IP, description: "Wildcard for subdomains (CRITICAL)" },
    { type: "A", name: "www", value: LOVABLE_IP, description: "WWW subdomain" },
  ];

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          DNS Configuration for smmpilot.online
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required DNS Records */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Server className="w-4 h-4" />
            Required DNS Records
          </h3>
          <div className="bg-muted/50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/70">
                <tr>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Value</th>
                  <th className="text-left p-3">Purpose</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {dnsRecords.map((record, i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="p-3">
                      <Badge variant="outline">{record.type}</Badge>
                    </td>
                    <td className="p-3 font-mono text-xs">{record.name}</td>
                    <td className="p-3 font-mono text-xs">{record.value}</td>
                    <td className="p-3 text-muted-foreground text-xs">{record.description}</td>
                    <td className="p-3">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(record.value)}
                        className="h-7 w-7 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ The wildcard (*) record is essential for all panel subdomains to work.
          </p>
        </div>

        {/* Subdomain Tester */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Test Subdomain Reachability
          </h3>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3">
              <Input 
                value={testSubdomain}
                onChange={(e) => setTestSubdomain(e.target.value)}
                placeholder="subdomain"
                className="border-0 bg-transparent focus-visible:ring-0"
              />
              <span className="text-muted-foreground text-sm">.smmpilot.online</span>
            </div>
            <Button 
              onClick={() => checkSubdomainDNS(testSubdomain)}
              disabled={checkingDNS}
              className="gap-2"
            >
              {checkingDNS ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              Check
            </Button>
          </div>

          {/* Results */}
          {dnsResults && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-muted/30 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{dnsResults.subdomain}.smmpilot.online</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`https://${dnsResults.subdomain}.smmpilot.online`, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg ${dnsResults.aRecord ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {dnsResults.aRecord ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs font-medium">A Record</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dnsResults.aRecords.length > 0 ? dnsResults.aRecords.join(', ') : 'Not found'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${dnsResults.https ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {dnsResults.https ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-xs font-medium">HTTPS</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dnsResults.https ? 'Active' : 'Pending'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${dnsResults.http ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {dnsResults.http ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-xs font-medium">HTTP</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dnsResults.http ? 'Reachable' : 'Not reachable'}
                  </p>
                </div>
              </div>
              
              {!dnsResults.aRecord && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  <strong>Action required:</strong> Add wildcard A record (*.smmpilot.online) pointing to {LOVABLE_IP}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open('https://dnschecker.org/#A/smmpilot.online', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-3 h-3" />
            DNS Checker
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open('https://docs.lovable.dev/features/custom-domain', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-3 h-3" />
            Documentation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DNSConfigGuide;
