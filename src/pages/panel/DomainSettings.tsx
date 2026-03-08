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
import { cn } from "@/lib/utils";
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
  const [activePlan, setActivePlan] = useState<string | null>(null);
  
  // Add domain dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  
  // Verification state
  const [verifyingDomains, setVerifyingDomains] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  // Auto-verify pending domains every 30 seconds (only DNS-pending, not txt_pending)
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
      // Resolve active panel
      const { data: profileFull } = await supabase
        .from('profiles')
        .select('active_panel_id')
        .eq('id', profile.id)
        .maybeSingle();

      let panelQuery = supabase
        .from('panels')
        .select('*')
        .eq('owner_id', profile.id);
      if (profileFull?.active_panel_id) {
        panelQuery = panelQuery.eq('id', profileFull.active_panel_id);
      }
      const { data: panels, error: panelError } = await panelQuery.order('created_at', { ascending: true }).limit(1);
      const panelData = panels?.[0] || null;

      if (panelError) throw panelError;
      setPanel(panelData);

      if (panelData) {
        // Fetch active subscription to determine real plan
        const { data: subData } = await supabase
          .from('panel_subscriptions')
          .select('plan_type')
          .eq('panel_id', panelData.id)
          .eq('status', 'active')
          .maybeSingle();
        
        setActivePlan(subData?.plan_type || panelData.subscription_tier || 'free');

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

  // Verify TXT record only (Step 1)
  const verifyTxtRecord = async (domainId: string, domainName: string) => {
    setVerifyingDomains(prev => new Set(prev).add(domainId));
    try {
      // Get the verification token for this domain
      const domainRecord = domains.find(d => d.id === domainId);
      const verificationToken = domainRecord?.verification_token;
      
      const { data: health, error: healthError } = await supabase.functions.invoke("domain-health-check", {
        body: { domain: domainName, check_type: 'txt', verification_token: verificationToken },
      });

      if (healthError) throw healthError;

      const txtOk = !!health?.txt_ok;

      if (txtOk) {
        await supabase
          .from("panel_domains")
          .update({
            verification_status: 'pending', // TXT verified, now DNS pending
            txt_verified_at: new Date().toISOString(),
          })
          .eq("id", domainId);

        toast({ title: "TXT Verified!", description: "Now configure your A and CNAME records." });
      } else {
        toast({ variant: "destructive", title: "TXT Not Found", description: "Add the TXT record at your registrar and try again." });
      }

      await fetchData();
    } catch (error) {
      console.error("TXT verification error:", error);
      toast({ variant: "destructive", title: "Verification Failed" });
    } finally {
      setVerifyingDomains(prev => {
        const newSet = new Set(prev);
        newSet.delete(domainId);
        return newSet;
      });
    }
  };

  // Verify DNS records (Step 2)
  const verifyDomain = async (domainId: string, domainName: string, showToasts = true) => {
    setVerifyingDomains(prev => new Set(prev).add(domainId));

    try {
      const { data: health, error: healthError } = await supabase.functions.invoke("domain-health-check", {
        body: { domain: domainName },
      });

      if (healthError) throw healthError;

      const dnsOk = !!health?.dns_ok;
      const httpsOk = !!health?.https_ok;

      if (dnsOk) {
        await supabase
          .from("panel_domains")
          .update({
            verification_status: "verified",
            verified_at: new Date().toISOString(),
            dns_configured: true,
            ssl_status: httpsOk ? "active" : "pending",
          })
          .eq("id", domainId);

        // Only set custom_domain after full verification
        await supabase
          .from('panels')
          .update({ custom_domain: domainName })
          .eq('id', panel.id);

        if (showToasts) {
          toast({ title: "Domain Verified!", description: `${domainName} is active.` });
        }
      } else {
        await supabase
          .from("panel_domains")
          .update({
            verification_status: "pending",
            dns_configured: false,
          })
          .eq("id", domainId);

        if (showToasts) {
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
    const effectivePlan = activePlan || panel?.subscription_tier || 'free';
    if (effectivePlan === 'free') {
      toast({ 
        variant: "destructive", 
        title: "Upgrade Required", 
        description: "Custom domains require a Basic or Pro plan." 
      });
      return;
    }
    
    setAdding(true);
    try {
      const domainLower = newDomain.trim().toLowerCase();
      
      // Check if domain is already used by another panel
      const { data: existingDomain } = await supabase
        .from('panel_domains')
        .select('panel_id')
        .eq('domain', domainLower)
        .maybeSingle();

      if (existingDomain && existingDomain.panel_id !== panel.id) {
        toast({ variant: "destructive", title: "Domain Unavailable", description: "This domain is already connected to another panel." });
        setAdding(false);
        return;
      }

      const verificationToken = crypto.randomUUID().substring(0, 16);
      const txtRecord = `smmpilot-verify=${verificationToken}`;
      
      const { error } = await supabase
        .from('panel_domains')
        .insert({
          panel_id: panel.id,
          domain: domainLower,
          is_primary: true,
          verification_status: 'txt_pending',
          ssl_status: 'pending',
          verification_token: verificationToken,
          txt_verification_record: txtRecord,
        });

      if (error) throw error;

      // Do NOT set panels.custom_domain yet — wait for full verification

      toast({ title: "Domain added!", description: "Verify TXT record ownership before configuring DNS." });
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
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> DNS Pending</Badge>;
      case "txt_pending":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20"><AlertCircle className="w-3 h-3 mr-1" /> TXT Pending</Badge>;
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
          {(activePlan === 'free' || activePlan === null) && (
            <UpgradePrompt
              feature="Custom Domain"
              currentPlan="free"
              requiredPlan="basic"
            />
          )}
          
          {activePlan && activePlan !== 'free' && domains.length === 0 && (
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
          
          {activePlan && activePlan !== 'free' && domains.length > 0 && currentDomain && (
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
                  {/* Step 1: TXT Verification */}
                  {currentDomain.verification_status === 'txt_pending' && (
                    <>
                      <Alert className="border-orange-500/20 bg-orange-500/5">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <AlertDescription>
                          <strong>Step 1:</strong> Add the TXT record below at your domain registrar to prove ownership. DNS records will be shown after verification.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">TXT</Badge>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentDomain.verification_token ? `smmpilot-verify=${currentDomain.verification_token}` : '')}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Host:</span>
                            <code className="ml-2 bg-background px-1 rounded">_smmpilot</code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Value:</span>
                            <code className="ml-2 bg-background px-1 rounded text-xs break-all">smmpilot-verify={currentDomain.verification_token}</code>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Add this TXT record to verify domain ownership</p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => verifyTxtRecord(currentDomain.id, currentDomain.domain)} 
                          disabled={verifyingDomains.has(currentDomain.id)}
                        >
                          {verifyingDomains.has(currentDomain.id) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Verify TXT Record
                        </Button>
                        <Button variant="outline" onClick={() => deleteDomain(currentDomain.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Step 2: DNS Configuration (shown after TXT verified) */}
                  {currentDomain.verification_status === 'pending' && (
                    <>
                      <Alert className="border-amber-500/20 bg-amber-500/5">
                        <Info className="w-4 h-4 text-amber-500" />
                        <AlertDescription>
                          <strong>Step 2:</strong> TXT verified ✓ — Now add the following DNS records to point your domain.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-3">
                        {dnsRecords.filter(r => r.type !== 'TXT').map((record, idx) => (
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
                          Verify DNS
                        </Button>
                        <Button variant="outline" onClick={() => deleteDomain(currentDomain.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Verified state */}
                  {currentDomain.verification_status === 'verified' && (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => deleteDomain(currentDomain.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Domain
                      </Button>
                    </div>
                  )}
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

      {/* Add Domain Dialog - Enhanced with validation */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Connect Custom Domain
            </DialogTitle>
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
                onChange={(e) => setNewDomain(e.target.value.toLowerCase().replace(/^(https?:\/\/)?/, '').replace(/^www\./, '').trim())}
                className={cn(
                  newDomain && !isValidCustomDomain(newDomain).valid && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {newDomain && (
                <div className="text-xs">
                  {isValidCustomDomain(newDomain).valid ? (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Valid domain format
                    </span>
                  ) : (
                    <span className="text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {isValidCustomDomain(newDomain).error}
                    </span>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Enter your domain without "www" or "https://"
              </p>
            </div>
            
            {/* TXT Preview */}
            {newDomain && isValidCustomDomain(newDomain).valid && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Verification Flow
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-background rounded">
                    <Badge variant="outline" className="text-[10px]">Step 1</Badge>
                    <span className="text-muted-foreground">Add TXT record to verify ownership</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background rounded">
                    <Badge variant="outline" className="text-[10px]">Step 2</Badge>
                    <span className="text-muted-foreground">Configure A & CNAME records</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  🔒 Domain ownership must be verified before DNS configuration
                </p>
              </div>
            )}
            
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm">
                After adding, you'll first verify ownership with a TXT record, then configure DNS records.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddDomain} 
              disabled={adding || !newDomain.trim() || (newDomain && !isValidCustomDomain(newDomain).valid)}
            >
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
