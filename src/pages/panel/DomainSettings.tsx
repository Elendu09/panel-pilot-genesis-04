import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  Clock,
  Loader2,
  Network,
  HelpCircle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { DomainDiagnostics } from "@/components/domain/DomainDiagnostics";
import { DomainPurchaseLinks } from "@/components/domain/DomainPurchaseLinks";
import { DomainTroubleshootingGuide } from "@/components/domain/DomainTroubleshootingGuide";
import { DNSVerificationProgress } from "@/components/domain/DNSVerificationProgress";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { VERCEL_IP, VERCEL_CNAME, getDnsRecordsForDomain, isValidCustomDomain, isPlatformSubdomain, PRIMARY_PLATFORM_DOMAIN } from "@/lib/hosting-config";

interface PanelDomain {
  id: string;
  domain: string;
  is_primary: boolean;
  verification_status: string;
  ssl_status: string;
  dns_configured: boolean;
  verified_at: string | null;
  created_at: string;
  verification_token?: string;
}

const DomainSettings = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [panel, setPanel] = useState<any>(null);
  const [domains, setDomains] = useState<PanelDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("domains");
  
  // Add domain dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  
  // Verification state
  const [verifyingDomains, setVerifyingDomains] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  // Auto-verify pending domains every 30 seconds
  useEffect(() => {
    if (!panel?.id || domains.length === 0) return;

    const verifyPendingDomains = async () => {
      const pendingDomains = domains.filter(d => d.verification_status === 'pending');
      for (const domain of pendingDomains) {
        await verifyDomain(domain.id, domain.domain, false);
      }
    };

    verifyPendingDomains();
    const interval = setInterval(verifyPendingDomains, 30000);
    return () => clearInterval(interval);
  }, [panel?.id, domains]);

  const fetchData = async () => {
    if (!profile?.id) return;
    
    try {
      const { data: panelData, error: panelError } = await supabase
        .from('panels')
        .select('*')
        .eq('owner_id', profile.id)
        .maybeSingle();

      if (panelError) throw panelError;
      setPanel(panelData);

      if (panelData) {
        const { data: domainsData, error: domainsError } = await supabase
          .from('panel_domains')
          .select('*')
          .eq('panel_id', panelData.id)
          .order('created_at', { ascending: false });

        if (domainsError) throw domainsError;
        setDomains(domainsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyDomain = async (domainId: string, domainName: string, showToasts = true) => {
    setVerifyingDomains(prev => new Set(prev).add(domainId));

    try {
      const { data: health, error: healthError } = await supabase.functions.invoke("domain-health-check", {
        body: { domain: domainName },
      });

      if (healthError) throw healthError;

      const dnsOk = !!health?.dns_ok;
      const httpsOk = !!health?.https_ok;

      await supabase
        .from("panel_domains")
        .update({
          verification_status: dnsOk ? "verified" : "pending",
          verified_at: dnsOk ? new Date().toISOString() : null,
          dns_configured: dnsOk,
          ssl_status: httpsOk ? "active" : "pending",
        })
        .eq("id", domainId);

      if (showToasts) {
        if (dnsOk && httpsOk) {
          toast({ title: "Domain Verified!", description: `${domainName} is verified and HTTPS is active.` });
        } else if (dnsOk) {
          toast({ title: "DNS Verified", description: "DNS is correct, SSL is still provisioning." });
        } else {
          toast({ variant: "destructive", title: "DNS Not Configured", description: `Point your A record to ${VERCEL_IP}` });
        }
      }

      await fetchData();
      return dnsOk;
    } catch (error) {
      console.error("Verification error:", error);
      if (showToasts) {
        toast({ variant: "destructive", title: "Verification Failed" });
      }
      return false;
    } finally {
      setVerifyingDomains(prev => {
        const newSet = new Set(prev);
        newSet.delete(domainId);
        return newSet;
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim() || !panel?.id) return;
    
    // Only allow one custom domain per panel
    if (domains.length > 0) {
      toast({ variant: "destructive", title: "Limit Reached", description: "Only one custom domain is allowed per panel." });
      return;
    }
    
    // Validate domain - check for platform subdomains
    const validation = isValidCustomDomain(newDomain.trim());
    if (!validation.valid) {
      toast({ variant: "destructive", title: "Invalid Domain", description: validation.error });
      return;
    }
    
    // Check subscription tier - custom domains require paid plan
    const subscriptionTier = panel?.subscription_tier || 'free';
    if (subscriptionTier === 'free') {
      toast({ 
        variant: "destructive", 
        title: "Upgrade Required", 
        description: "Custom domains require a Basic or Pro plan." 
      });
      return;
    }
    
    setAdding(true);
    try {
      const verificationToken = crypto.randomUUID().substring(0, 16);
      
      const { error } = await supabase
        .from('panel_domains')
        .insert({
          panel_id: panel.id,
          domain: newDomain.trim().toLowerCase(),
          is_primary: true,
          verification_status: 'pending',
          ssl_status: 'pending',
          verification_token: verificationToken,
        });

      if (error) throw error;

      // Also update the panel's custom_domain field
      await supabase
        .from('panels')
        .update({ custom_domain: newDomain.trim().toLowerCase() })
        .eq('id', panel.id);

      toast({ title: "Domain added!", description: "Configure your DNS records to complete setup." });
      setShowAddDialog(false);
      setNewDomain("");
      await fetchData();
    } catch (error) {
      console.error('Error adding domain:', error);
      toast({ variant: "destructive", title: "Failed to add domain" });
    } finally {
      setAdding(false);
    }
  };

  const deleteDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('panel_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;
      
      // Clear custom_domain from panel
      await supabase
        .from('panels')
        .update({ custom_domain: null })
        .eq('id', panel.id);
        
      toast({ title: "Domain removed" });
      await fetchData();
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast({ variant: "destructive", title: "Failed to remove domain" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "error":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    );
  }

  const currentDomain = domains[0];
  const dnsRecords = currentDomain?.verification_token 
    ? getDnsRecordsForDomain(currentDomain.domain, currentDomain.verification_token)
    : [];

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Domain Settings
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage your panel's domain configuration</p>
      </motion.div>

      {/* Default Subdomain Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Globe className="w-5 h-5 text-primary" />
              Your Panel URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-sm md:text-lg font-mono bg-muted px-2 md:px-3 py-1 md:py-2 rounded-lg">
                    {panel?.subdomain}.{PRIMARY_PLATFORM_DOMAIN}
                  </code>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" /> Live
                  </Badge>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  This is your default panel URL. It's always active and requires no DNS configuration.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(`https://${panel?.subdomain}.${PRIMARY_PLATFORM_DOMAIN}`)}>
                  <Copy className="w-4 h-4 mr-2" /> Copy URL
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://${panel?.subdomain}.${PRIMARY_PLATFORM_DOMAIN}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" /> Visit
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="glass-card p-1 min-w-max">
            <TabsTrigger value="domains" className="text-xs md:text-sm"><Globe className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Custom Domain</TabsTrigger>
            <TabsTrigger value="diagnostics" className="text-xs md:text-sm"><Network className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Diagnostics</TabsTrigger>
            <TabsTrigger value="help" className="text-xs md:text-sm"><HelpCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Help</TabsTrigger>
          </TabsList>
        </div>

        {/* Custom Domain Tab */}
        <TabsContent value="domains" className="space-y-6">
          {/* Upgrade prompt for free users */}
          {panel?.subscription_tier === 'free' && (
            <UpgradePrompt
              feature="Custom Domain"
              currentPlan="free"
              requiredPlan="basic"
            />
          )}
          
          {panel?.subscription_tier !== 'free' && domains.length === 0 && (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Custom Domain</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add a custom domain to use your own branding
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Connect Domain
                </Button>
              </CardContent>
            </Card>
          )}
          
          {panel?.subscription_tier !== 'free' && domains.length > 0 && currentDomain && (
            <>
              {/* DNS Verification Progress Component */}
              {currentDomain.verification_status !== 'verified' && (
                <DNSVerificationProgress
                  domain={currentDomain.domain}
                  verificationToken={currentDomain.verification_token}
                  onVerified={() => fetchData()}
                  autoCheck={true}
                  checkIntervalMs={30000}
                />
              )}
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      {currentDomain.domain}
                    </div>
                    {getStatusBadge(currentDomain.verification_status)}
                  </CardTitle>
                  <CardDescription>
                    {currentDomain.verification_status === 'verified' 
                      ? 'Your custom domain is active and serving your panel'
                      : 'Configure the DNS records below to activate your domain'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentDomain.verification_status !== 'verified' && (
                    <>
                      <Alert className="border-amber-500/20 bg-amber-500/5">
                        <Info className="w-4 h-4 text-amber-500" />
                        <AlertDescription>
                          Add the following DNS records at your domain registrar to verify ownership.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-3">
                        {dnsRecords.map((record, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{record.type}</Badge>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(record.value)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Host:</span>
                                <code className="ml-2 bg-background px-1 rounded">{record.host}</code>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Value:</span>
                                <code className="ml-2 bg-background px-1 rounded text-xs break-all">{record.value}</code>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{record.description}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => verifyDomain(currentDomain.id, currentDomain.domain)} 
                      disabled={verifyingDomains.has(currentDomain.id)}
                    >
                      {verifyingDomains.has(currentDomain.id) ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Verify Now
                    </Button>
                    <Button variant="outline" onClick={() => deleteDomain(currentDomain.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics">
          <DomainDiagnostics 
            panelSubdomain={panel?.subdomain}
            customDomains={domains.map(d => ({ domain: d.domain, verification_status: d.verification_status }))}
          />
        </TabsContent>

        {/* Help Tab */}
        <TabsContent value="help" className="space-y-6">
          <DomainTroubleshootingGuide domain={currentDomain?.domain} />
          <DomainPurchaseLinks />
        </TabsContent>
      </Tabs>

      {/* Add Domain Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Custom Domain</DialogTitle>
            <DialogDescription>
              Enter your domain name to connect it to your panel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your domain without "www" or "https://"
              </p>
            </div>
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm">
                After adding, you'll need to configure DNS records at your domain registrar:
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>A record pointing to <code className="bg-muted px-1 rounded">{VERCEL_IP}</code></li>
                  <li>CNAME for www pointing to <code className="bg-muted px-1 rounded">{VERCEL_CNAME}</code></li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddDomain} disabled={adding || !newDomain.trim()}>
              {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DomainSettings;
