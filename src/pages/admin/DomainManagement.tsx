import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  XCircle,
  Shield,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Server,
  Rocket
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  HOSTING_PROVIDERS, 
  getExpectedTargetForProvider,
  getExpectedCnamesForProvider,
  type HostingProvider 
} from "@/lib/hosting-config";
import VercelDeploymentGuide from "@/components/domain/VercelDeploymentGuide";

interface DomainRecord {
  id: string;
  domain: string;
  panel_id: string;
  verification_status: string;
  ssl_status: string;
  dns_configured: boolean;
  is_primary: boolean;
  hosting_provider?: string;
  created_at: string;
  verified_at: string | null;
  panel?: {
    name: string;
    subdomain: string;
    status: string;
    hosting_provider?: string;
    settings?: {
      hosting_provider?: string;
    };
  };
}

interface PanelWithDomain {
  id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  status: string;
  ssl_status: string;
  domain_verification_status: string;
  hosting_provider?: string;
  settings?: {
    hosting_provider?: string;
  };
  created_at: string;
}

interface HealthCheckResult {
  dns_ok: boolean;
  dns_match_type: string;
  https_ok: boolean;
  using_vercel_nameservers?: boolean;
  wildcard_enabled?: boolean;
  ns_records?: string[];
  a_records?: string[];
  cname_records?: string[];
}

const DomainManagement = () => {
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [panels, setPanels] = useState<PanelWithDomain[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      // Fetch panel_domains with panel info
      const { data: domainData, error: domainError } = await supabase
        .from('panel_domains')
        .select(`
          *,
          panel:panels(name, subdomain, status, hosting_provider, settings)
        `)
        .order('created_at', { ascending: false });

      if (domainError) throw domainError;
      setDomains((domainData || []) as DomainRecord[]);

      // Also fetch all panels to show subdomains
      const { data: panelData, error: panelError } = await supabase
        .from('panels')
        .select('id, name, subdomain, custom_domain, status, ssl_status, domain_verification_status, hosting_provider, settings, created_at')
        .order('created_at', { ascending: false });

      if (panelError) throw panelError;
      setPanels((panelData || []) as PanelWithDomain[]);

    } catch (error: any) {
      console.error('Error fetching domains:', error);
      toast({
        variant: "destructive",
        title: "Failed to load domains",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyDomain = async (domain: DomainRecord) => {
    setVerifying(domain.id);
    try {
      // Get hosting provider from domain or panel
      const hostingProvider = (
        domain.hosting_provider || 
        domain.panel?.hosting_provider || 
        domain.panel?.settings?.hosting_provider || 
        'vercel'
      ) as HostingProvider;
      
      const expectedTargets = getExpectedTargetForProvider(hostingProvider);
      const expectedCnames = getExpectedCnamesForProvider(hostingProvider);

      // Call domain-health-check edge function with provider info
      const { data, error } = await supabase.functions.invoke('domain-health-check', {
        body: { 
          domain: domain.domain, 
          hostingProvider 
        }
      });

      if (error) throw error;

      const result = data as HealthCheckResult;
      const isVerified = result?.dns_ok === true;

      if (isVerified) {
        // Update domain record
        await supabase.from('panel_domains').update({
          verification_status: 'verified',
          dns_configured: true,
          verified_at: new Date().toISOString(),
          ssl_status: result?.https_ok ? 'active' : 'pending'
        }).eq('id', domain.id);

        const verificationMethod = result?.using_vercel_nameservers 
          ? 'Vercel Nameservers' 
          : result?.dns_match_type;

        toast({
          title: "Domain Verified!",
          description: `${domain.domain} verified via ${verificationMethod}. SSL: ${result?.https_ok ? 'Active' : 'Pending'}${result?.wildcard_enabled ? ' | Wildcard: Enabled' : ''}`
        });
      } else {
        const expectedInfo = expectedTargets.length > 0 
          ? expectedTargets.join(' or ') 
          : expectedCnames.join(' or ');
        
        toast({
          variant: "destructive",
          title: "DNS Not Configured",
          description: `Expected: ${expectedInfo}. Found A: ${result?.a_records?.join(', ') || 'none'}`
        });
      }

      fetchDomains();
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message
      });
    } finally {
      setVerifying(null);
    }
  };

  const verifyAllPending = async () => {
    const pendingDomains = domains.filter(d => d.verification_status === 'pending');
    for (const domain of pendingDomains) {
      await verifyDomain(domain);
    }
  };

  const getHostingProviderBadge = (panel?: DomainRecord['panel'], domainProvider?: string) => {
    const providerKey = (
      domainProvider || 
      panel?.hosting_provider || 
      panel?.settings?.hosting_provider || 
      'vercel'
    ) as HostingProvider;
    const config = HOSTING_PROVIDERS[providerKey];
    if (!config) return null;
    
    return (
      <Badge variant="outline" className="text-xs">
        <Server className="w-3 h-3 mr-1" />
        {config.name}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSSLBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30"><Shield className="w-3 h-3 mr-1" />SSL Active</Badge>;
    }
    return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30"><AlertTriangle className="w-3 h-3 mr-1" />SSL Pending</Badge>;
  };

  const filteredPanels = panels.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.custom_domain && p.custom_domain.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    totalSubdomains: panels.length,
    activeSubdomains: panels.filter(p => p.status === 'active').length,
    customDomains: domains.length,
    verifiedDomains: domains.filter(d => d.verification_status === 'verified').length,
    pendingDomains: domains.filter(d => d.verification_status === 'pending').length,
    vercelPanels: panels.filter(p => 
      (p.hosting_provider || p.settings?.hosting_provider || 'vercel') === 'vercel'
    ).length
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Helmet>
        <title>Domain Management - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Globe className="w-7 h-7 text-primary" />
            Domain Management
          </h1>
          <p className="text-muted-foreground">Manage all panel domains and SSL certificates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDomains} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={verifyAllPending} disabled={loading || domains.filter(d => d.verification_status === 'pending').length === 0}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify All Pending
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total Subdomains', value: stats.totalSubdomains, color: 'bg-blue-500/10 text-blue-500' },
          { label: 'Active Panels', value: stats.activeSubdomains, color: 'bg-emerald-500/10 text-emerald-500' },
          { label: 'Custom Domains', value: stats.customDomains, color: 'bg-violet-500/10 text-violet-500' },
          { label: 'Verified', value: stats.verifiedDomains, color: 'bg-emerald-500/10 text-emerald-500' },
          { label: 'Pending DNS', value: stats.pendingDomains, color: 'bg-amber-500/10 text-amber-500' },
          { label: 'Vercel Hosted', value: stats.vercelPanels, color: 'bg-primary/10 text-primary' }
        ].map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-4 text-center">
              <p className={cn("text-2xl font-bold", stat.color.split(' ')[1])}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vercel">Vercel Setup</TabsTrigger>
          <TabsTrigger value="guide">DNS Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search domains or panels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Custom Domains Section */}
          {domains.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Custom Domains
                </CardTitle>
                <CardDescription>Domains requiring DNS configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {domains.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{domain.domain}</p>
                            {domain.is_primary && <Badge variant="outline" className="text-xs">Primary</Badge>}
                            {getHostingProviderBadge(domain.panel, domain.hosting_provider)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Panel: {domain.panel?.name || 'Unknown'} ({domain.panel?.subdomain}.smmpilot.online)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(domain.verification_status)}
                        {getSSLBadge(domain.ssl_status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verifyDomain(domain)}
                          disabled={verifying === domain.id}
                        >
                          {verifying === domain.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`https://${domain.domain}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Subdomains Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Panel Subdomains
              </CardTitle>
              <CardDescription>All panel subdomains (auto-configured via Vercel wildcard DNS)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredPanels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No panels found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPanels.map((panel) => (
                    <div key={panel.id} className="flex items-center justify-between p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          panel.status === 'active' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                        )}>
                          {panel.status === 'active' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{panel.name}</p>
                            {getHostingProviderBadge(
                              { name: '', subdomain: '', status: '', hosting_provider: panel.hosting_provider, settings: panel.settings },
                              panel.hosting_provider
                            )}
                          </div>
                          <p className="text-sm text-primary">{panel.subdomain}.smmpilot.online</p>
                          {panel.custom_domain && (
                            <p className="text-xs text-muted-foreground">+ {panel.custom_domain}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn(
                          panel.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                        )}>
                          {panel.status}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`https://${panel.subdomain}.smmpilot.online`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vercel" className="space-y-6">
          <VercelDeploymentGuide 
            domain="smmpilot.online"
            currentStatus="pending"
          />
        </TabsContent>

        <TabsContent value="guide" className="space-y-6">
          {/* DNS Instructions */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                DNS Configuration Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <span className="text-lg">▲</span> Vercel (Recommended for Wildcard)
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Change nameservers</strong> to ns1.vercel-dns.com and ns2.vercel-dns.com</li>
                  <li>• In Vercel: Add <code className="px-2 py-0.5 bg-muted rounded">smmpilot.online</code></li>
                  <li>• In Vercel: Add <code className="px-2 py-0.5 bg-muted rounded">*.smmpilot.online</code></li>
                  <li>• Automatic SSL for all subdomains!</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                <h4 className="font-medium mb-2 text-violet-500">💜 Lovable / Manual DNS</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Add A record: <code className="px-2 py-0.5 bg-muted rounded">@ → 185.158.133.1</code></li>
                  <li>• Add A record: <code className="px-2 py-0.5 bg-muted rounded">www → 185.158.133.1</code></li>
                  <li>• Wait 24-72 hours for propagation</li>
                  <li>• SSL is auto-provisioned after verification</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="font-medium mb-2 text-emerald-500">Subdomains (Auto-configured):</h4>
                <p className="text-sm text-muted-foreground">
                  With Vercel nameservers, all <code className="px-2 py-0.5 bg-muted rounded">*.smmpilot.online</code> subdomains 
                  are automatically routed and SSL-enabled. No manual configuration needed!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default DomainManagement;
