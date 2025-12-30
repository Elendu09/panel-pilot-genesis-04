import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Globe, 
  Server, 
  Shield, 
  ExternalLink, 
  Copy, 
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  ShoppingCart,
  Loader2,
  Activity,
  Network,
  Lock,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { SubdomainManager } from "@/components/domain/SubdomainManager";
import { DomainPurchaseLinks } from "@/components/domain/DomainPurchaseLinks";
import { SSLMonitoringDashboard } from "@/components/domain/SSLMonitoringDashboard";
import { DomainTroubleshootingGuide } from "@/components/domain/DomainTroubleshootingGuide";
import { VERCEL_NAMESERVERS, VERCEL_A_RECORDS, VERCEL_CNAME } from "@/lib/hosting-config";

interface PanelData {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  owner_id: string;
  created_at: string;
  profiles?: { email: string } | null;
}

interface DomainData {
  id: string;
  domain: string;
  panel_id: string;
  verification_status: string;
  ssl_status: string;
  dns_configured: boolean;
  created_at: string;
  verified_at: string | null;
  hosting_provider: string;
  panels?: { name: string; subdomain: string } | null;
}

const PLATFORM_DOMAIN = "smmpilot.online";

const DomainManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [panels, setPanels] = useState<PanelData[]>([]);
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyingDomains, setVerifyingDomains] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: panelsData } = await supabase
        .from('panels')
        .select('id, name, subdomain, status, owner_id, created_at')
        .order('created_at', { ascending: false });
      setPanels(panelsData || []);

      const { data: domainsData } = await supabase
        .from('panel_domains')
        .select('id, domain, panel_id, verification_status, ssl_status, dns_configured, created_at, verified_at, hosting_provider')
        .order('created_at', { ascending: false });
      setDomains(domainsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyDomain = async (domainId: string, domainName: string) => {
    setVerifyingDomains(prev => new Set(prev).add(domainId));
    try {
      const { data } = await supabase.functions.invoke("domain-health-check", { body: { domain: domainName } });
      await supabase.from('panel_domains').update({
        verification_status: data?.dns_ok ? 'verified' : 'pending',
        ssl_status: data?.https_ok ? 'active' : 'pending',
        dns_configured: data?.dns_ok || false,
        verified_at: data?.dns_ok ? new Date().toISOString() : null
      }).eq('id', domainId);
      toast({ title: data?.dns_ok ? "Domain Verified!" : "Verification Pending" });
      await fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Verification failed" });
    } finally {
      setVerifyingDomains(prev => { const next = new Set(prev); next.delete(domainId); return next; });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const totalPanels = panels.length;
  const activePanels = panels.filter(p => p.status === 'active').length;
  const totalDomains = domains.length;
  const verifiedDomains = domains.filter(d => d.verification_status === 'verified').length;
  const pendingDomains = domains.filter(d => d.verification_status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified": case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Domain Management</h1>
          <p className="text-muted-foreground">Manage subdomains and custom domains for all panels</p>
        </div>
        <Button variant="outline" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Panels", value: totalPanels, color: "text-primary" },
          { label: "Active Panels", value: activePanels, color: "text-green-500" },
          { label: "Custom Domains", value: totalDomains, color: "text-blue-500" },
          { label: "Verified", value: verifiedDomains, color: "text-green-500" },
          { label: "Pending", value: pendingDomains, color: "text-yellow-500" }
        ].map(stat => (
          <Card key={stat.label} className="glass-card">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card p-1 flex-wrap">
          <TabsTrigger value="overview"><Activity className="w-4 h-4 mr-2" /> Overview</TabsTrigger>
          <TabsTrigger value="subdomains"><Server className="w-4 h-4 mr-2" /> Subdomains</TabsTrigger>
          <TabsTrigger value="custom"><Globe className="w-4 h-4 mr-2" /> Custom Domains</TabsTrigger>
          <TabsTrigger value="monitoring"><Eye className="w-4 h-4 mr-2" /> Monitoring</TabsTrigger>
          <TabsTrigger value="vercel"><Network className="w-4 h-4 mr-2" /> Vercel Setup</TabsTrigger>
          <TabsTrigger value="buy"><ShoppingCart className="w-4 h-4 mr-2" /> Buy Domains</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20">
              <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Platform Domain</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <code className="text-lg font-mono bg-muted px-3 py-2 rounded-lg">{PLATFORM_DOMAIN}</code>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline"><Server className="w-3 h-3 mr-1" /> Vercel</Badge>
                  <Badge variant="outline"><Shield className="w-3 h-3 mr-1" /> Wildcard SSL</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('vercel')}><Network className="w-4 h-4 mr-2" /> View Vercel Setup Guide</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('subdomains')}><Server className="w-4 h-4 mr-2" /> Manage {totalPanels} Subdomains</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('buy')}><ShoppingCart className="w-4 h-4 mr-2" /> Domain Referral Links</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subdomains">
          <SubdomainManager panels={panels.map(p => ({ id: p.id, name: p.name, subdomain: p.subdomain, status: p.status as 'active' | 'pending' | 'suspended', created_at: p.created_at }))} platformDomain={PLATFORM_DOMAIN} onRefresh={fetchData} loading={loading} />
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Domain</TableHead><TableHead>Verification</TableHead><TableHead>SSL</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {domains.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No custom domains found</TableCell></TableRow> : domains.map(domain => (
                    <TableRow key={domain.id}>
                      <TableCell><code className="font-mono">{domain.domain}</code></TableCell>
                      <TableCell>{getStatusBadge(domain.verification_status)}</TableCell>
                      <TableCell>{getStatusBadge(domain.ssl_status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => verifyDomain(domain.id, domain.domain)} disabled={verifyingDomains.has(domain.id)}>
                          {verifyingDomains.has(domain.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vercel" className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Network className="w-5 h-5 text-primary" /> Vercel Wildcard DNS Configuration</CardTitle>
              <CardDescription>Configure your domain with Vercel for automatic wildcard SSL certificates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-green-500/20 bg-green-500/5"><CheckCircle className="w-4 h-4 text-green-500" /><AlertDescription><strong>Recommended:</strong> Use Vercel nameservers for automatic wildcard SSL.</AlertDescription></Alert>
              <div className="space-y-3">
                <h3 className="font-semibold">Step 1: Change Nameservers</h3>
                {VERCEL_NAMESERVERS.map((ns, i) => (
                  <div key={ns} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <code className="font-mono">{ns}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ns)}><Copy className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Step 2: Add Domains in Vercel</h3>
                <div className="p-3 bg-muted rounded-lg"><code>{PLATFORM_DOMAIN}</code> and <code>*.{PLATFORM_DOMAIN}</code></div>
              </div>
              <Button variant="outline" asChild><a href="https://vercel.com/docs/projects/domains" target="_blank"><ExternalLink className="w-4 h-4 mr-2" /> Vercel Docs</a></Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <SSLMonitoringDashboard 
            domains={domains.map(d => ({
              domain: d.domain,
              ssl_status: d.ssl_status,
              verification_status: d.verification_status,
              verified_at: d.verified_at
            }))}
            onRefresh={fetchData}
          />
          <DomainTroubleshootingGuide 
            domain={domains.length > 0 ? domains[0].domain : undefined}
          />
        </TabsContent>

        <TabsContent value="buy"><DomainPurchaseLinks /></TabsContent>
      </Tabs>
    </div>
  );
};

export default DomainManagement;
