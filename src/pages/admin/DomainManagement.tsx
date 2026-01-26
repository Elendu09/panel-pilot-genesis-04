import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
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
  Loader2,
  Activity,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SSLMonitoringDashboard } from "@/components/domain/SSLMonitoringDashboard";
import { DomainTroubleshootingGuide } from "@/components/domain/DomainTroubleshootingGuide";
import { ResponsiveTabs } from "@/components/admin/ResponsiveTabs";
import { LOVABLE_IP, PLATFORM_DOMAIN } from "@/lib/hosting-config";

interface PanelData {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  owner_id: string;
  created_at: string;
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
}

const DomainManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [panels, setPanels] = useState<PanelData[]>([]);
  const [domains, setDomains] = useState<DomainData[]>([]);
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
      const { data } = await supabase.functions.invoke("domain-health-check", { 
        body: { domain: domainName, expectedTarget: LOVABLE_IP } 
      });
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

      <ResponsiveTabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        tabs={[
          { value: "overview", label: "Overview", icon: Activity },
          { value: "subdomains", label: "Subdomains", icon: Server },
          { value: "custom", label: "Custom Domains", icon: Globe },
          { value: "monitoring", label: "Monitoring", icon: Eye },
        ]}
      >

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
                  <Badge variant="outline"><Server className="w-3 h-3 mr-1" /> Lovable</Badge>
                  <Badge variant="outline"><Shield className="w-3 h-3 mr-1" /> SSL Active</Badge>
                </div>
                <Alert className="border-primary/20 bg-primary/5">
                  <AlertDescription className="text-sm">
                    <strong>DNS Target:</strong> A record pointing to <code className="bg-muted px-1 rounded">{LOVABLE_IP}</code>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('subdomains')}><Server className="w-4 h-4 mr-2" /> View {totalPanels} Panel Subdomains</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('custom')}><Globe className="w-4 h-4 mr-2" /> Manage {totalDomains} Custom Domains</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('monitoring')}><Eye className="w-4 h-4 mr-2" /> SSL Monitoring</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subdomains" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Panel Subdomains
              </CardTitle>
              <CardDescription>All panel subdomains on {PLATFORM_DOMAIN}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Panel</TableHead>
                    <TableHead>Subdomain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {panels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No panels found
                      </TableCell>
                    </TableRow>
                  ) : panels.map(panel => (
                    <TableRow key={panel.id}>
                      <TableCell className="font-medium">{panel.name}</TableCell>
                      <TableCell>
                        <code className="text-sm">{panel.subdomain}.{PLATFORM_DOMAIN}</code>
                      </TableCell>
                      <TableCell>{getStatusBadge(panel.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(`https://${panel.subdomain}.${PLATFORM_DOMAIN}`)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`https://${panel.subdomain}.${PLATFORM_DOMAIN}`} target="_blank">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>SSL</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No custom domains found
                      </TableCell>
                    </TableRow>
                  ) : domains.map(domain => (
                    <TableRow key={domain.id}>
                      <TableCell><code className="font-mono">{domain.domain}</code></TableCell>
                      <TableCell>{getStatusBadge(domain.verification_status)}</TableCell>
                      <TableCell>{getStatusBadge(domain.ssl_status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => verifyDomain(domain.id, domain.domain)} 
                          disabled={verifyingDomains.has(domain.id)}
                        >
                          {verifyingDomains.has(domain.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
      </ResponsiveTabs>
    </div>
  );
};

export default DomainManagement;
