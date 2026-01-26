import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
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
  ArrowRight,
  ArrowLeft,
  Shield,
  Server,
  Check,
  Clock,
  Info,
  Lock,
  Loader2,
  Network,
  ShoppingCart,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DomainDiagnostics } from "@/components/domain/DomainDiagnostics";
import { DomainConfigWizard } from "@/components/domain/DomainConfigWizard";
import { DomainPurchaseLinks } from "@/components/domain/DomainPurchaseLinks";
import { DomainTransfer } from "@/components/domain/DomainTransfer";
import { DNSPropagationTracker } from "@/components/domain/DNSPropagationTracker";
import { DomainTroubleshootingGuide } from "@/components/domain/DomainTroubleshootingGuide";
import { SSLMonitoringDashboard } from "@/components/domain/SSLMonitoringDashboard";

interface PanelDomain {
  id: string;
  domain: string;
  is_primary: boolean;
  verification_status: string;
  ssl_status: string;
  dns_configured: boolean;
  verified_at: string | null;
  created_at: string;
  hosting_provider?: string;
  expected_target?: string;
  txt_verification_record?: string;
  txt_verified_at?: string | null;
  verification_token?: string;
}

const DomainSettings = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [panel, setPanel] = useState<any>(null);
  const [domains, setDomains] = useState<PanelDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("domains");
  
  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newDomain, setNewDomain] = useState("");
  const [domainType, setDomainType] = useState<"primary" | "secondary">("primary");
  const [verifying, setVerifying] = useState(false);
  
  // Verification state
  const [verifyingDomains, setVerifyingDomains] = useState<Set<string>>(new Set());
  const [autoVerifyEnabled, setAutoVerifyEnabled] = useState(true);

  // DNS Check state
  const [propagationDomain, setPropagationDomain] = useState("");
  const [isCheckingPropagation, setIsCheckingPropagation] = useState(false);
  const [propagationResults, setPropagationResults] = useState<any[]>([]);
  
  // TXT Verification state
  const [verifyingTxt, setVerifyingTxt] = useState<Set<string>>(new Set());

  const VERCEL_IP = "76.76.21.21";
  const VERCEL_CNAME = "cname.vercel-dns.com";

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  // Auto-verify pending domains every 30 seconds
  useEffect(() => {
    if (!autoVerifyEnabled || !panel?.id || domains.length === 0) return;

    const verifyPendingDomains = async () => {
      const pendingDomains = domains.filter(d => d.verification_status === 'pending');
      if (pendingDomains.length === 0) return;

      for (const domain of pendingDomains) {
        await verifyDomainWithChecks(domain.id, domain.domain, false);
      }
    };

    // Initial check
    verifyPendingDomains();

    // Set up interval
    const interval = setInterval(verifyPendingDomains, 30000);
    return () => clearInterval(interval);
  }, [autoVerifyEnabled, panel?.id, domains]);

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

  // Complete domain verification with DNS + real HTTPS reachability (SSL) checks
  const verifyDomainWithChecks = async (domainId: string, domainName: string, showToasts = true) => {
    setVerifyingDomains(prev => new Set(prev).add(domainId));

    try {
      const { data: health, error: healthError } = await supabase.functions.invoke("domain-health-check", {
        body: { domain: domainName },
      });

      if (healthError) throw healthError;

      const dnsOk = !!health?.dns_ok;
      const httpsOk = !!health?.https_ok;

      if (!dnsOk) {
        if (showToasts) {
          toast({
            variant: "destructive",
            title: "DNS Not Configured",
            description: `Your domain must have an A record pointing to ${VERCEL_IP}. Detected: ${(health?.a_records || []).join(", ") || "none"}`,
          });
        }
        return false;
      }

      if (!httpsOk && showToasts) {
        toast({
          variant: "destructive",
          title: "SSL Not Ready Yet",
          description: "DNS is correct, but HTTPS is still failing. This usually means SSL is still provisioning or a proxy/CAA record is blocking issuance.",
        });
      }

      // Update domain row
      await supabase
        .from("panel_domains")
        .update({
          verification_status: "verified",
          verified_at: new Date().toISOString(),
          dns_configured: true,
          ssl_status: httpsOk ? "active" : "pending",
        })
        .eq("id", domainId);

      // Update panel summary status
      if (panel?.id) {
        await supabase
          .from("panels")
          .update({
            domain_verification_status: "verified",
            ssl_status: httpsOk ? "active" : "pending",
          })
          .eq("id", panel.id);
      }

      if (showToasts && httpsOk) {
        toast({
          title: "Domain Verified!",
          description: `${domainName} is verified and HTTPS is active.`,
        });
      }

      await fetchData();
      return true;
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

  const checkDnsPropagation = async () => {
    if (!propagationDomain.trim()) {
      toast({ variant: "destructive", title: "Domain required" });
      return;
    }

    setIsCheckingPropagation(true);
    setPropagationResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("dns-lookup", {
        body: { domain: propagationDomain.trim(), recordType: "A" },
      });

      if (error) throw error;

      if (data?.results) {
        setPropagationResults(data.results);
      }
    } catch (error) {
      console.error('Propagation check error:', error);
      toast({ variant: "destructive", title: "Failed to check DNS propagation" });
    } finally {
      setIsCheckingPropagation(false);
    }
  };

  // TXT Record Verification
  const verifyDomainWithTxt = async (domainId: string, domainName: string) => {
    if (!panel?.id) return;
    
    setVerifyingTxt(prev => new Set(prev).add(domainId));
    
    try {
      const { data, error } = await supabase.functions.invoke("verify-domain-txt", {
        body: { domain: domainName, panel_id: panel.id },
      });

      if (error) throw error;

      if (data?.verified) {
        toast({
          title: "TXT Verification Successful!",
          description: `Domain ownership for ${domainName} has been verified.`,
        });
        await fetchData();
      } else {
        toast({
          variant: "destructive",
          title: "TXT Record Not Found",
          description: data?.message || `Add a TXT record for _smmpilot.${domainName}`,
        });
      }
    } catch (error) {
      console.error("TXT verification error:", error);
      toast({ variant: "destructive", title: "TXT Verification Failed" });
    } finally {
      setVerifyingTxt(prev => {
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

  const handleStartWizard = () => {
    setShowWizard(true);
    setWizardStep(1);
    setNewDomain("");
    setDomainType("primary");
  };

  const handleNextStep = () => {
    if (wizardStep === 1 && !newDomain.trim()) {
      toast({ variant: "destructive", title: "Domain required" });
      return;
    }
    setWizardStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => setWizardStep(prev => Math.max(prev - 1, 1));

  const handleAddDomain = async () => {
    if (!newDomain.trim() || !panel?.id) return;
    
    setVerifying(true);
    try {
      const { error } = await supabase
        .from('panel_domains')
        .insert({
          panel_id: panel.id,
          domain: newDomain.trim(),
          is_primary: domainType === "primary",
          verification_status: 'pending',
          ssl_status: 'pending'
        });

      if (error) throw error;

      toast({ title: "Domain added!", description: "Configure your DNS records to complete setup." });
      setShowWizard(false);
      setNewDomain("");
      await fetchData();
    } catch (error) {
      console.error('Error adding domain:', error);
      toast({ variant: "destructive", title: "Failed to add domain" });
    } finally {
      setVerifying(false);
    }
  };

  const deleteDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('panel_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;
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

  const wizardSteps = [
    { number: 1, title: "Domain Name", description: "Enter your domain" },
    { number: 2, title: "Domain Type", description: "Choose configuration" },
    { number: 3, title: "DNS Setup", description: "Configure records" },
    { number: 4, title: "Verification", description: "Verify connection" },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Domain Settings
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage your panel's domains and DNS configuration</p>
      </motion.div>

      {/* Default Subdomain Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Globe className="w-5 h-5 text-primary" />
              Your Panel Subdomain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex-1 overflow-x-auto">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-sm md:text-lg font-mono bg-muted px-2 md:px-3 py-1 md:py-2 rounded-lg whitespace-nowrap">
                    {panel?.subdomain}.smmpilot.online
                  </code>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 whitespace-nowrap">
                    <CheckCircle className="w-3 h-3 mr-1" /> Live
                  </Badge>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  This is your default panel URL. It's always active and requires no DNS configuration.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(`https://${panel?.subdomain}.smmpilot.online`)}>
                  <Copy className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Copy URL</span><span className="sm:hidden">Copy</span>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://${panel?.subdomain}.smmpilot.online`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1 md:mr-2" /> Visit
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
            <TabsTrigger value="domains" className="text-xs md:text-sm"><Globe className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Custom</span> Domains</TabsTrigger>
            <TabsTrigger value="setup" className="text-xs md:text-sm"><Server className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Setup</TabsTrigger>
            <TabsTrigger value="diagnostics" className="text-xs md:text-sm"><Network className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Diagnostics</TabsTrigger>
            <TabsTrigger value="dns" className="text-xs md:text-sm"><RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Propagation</TabsTrigger>
            <TabsTrigger value="ssl" className="text-xs md:text-sm"><Shield className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> SSL</TabsTrigger>
            <TabsTrigger value="troubleshoot" className="text-xs md:text-sm"><HelpCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Help</TabsTrigger>
            <TabsTrigger value="buy" className="text-xs md:text-sm"><ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Buy</TabsTrigger>
          </TabsList>
        </div>

        {/* Custom Domains Tab */}
        <TabsContent value="domains" className="space-y-6">
          {/* Add Domain Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Custom Domains</h3>
              <p className="text-sm text-muted-foreground">Connect your own domain to your panel</p>
            </div>
            <Button onClick={handleStartWizard}>
              <Plus className="w-4 h-4 mr-2" /> Add Domain
            </Button>
          </div>

          {/* Domains List */}
          {domains.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Custom Domains</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add a custom domain to use your own branding
                </p>
                <Button onClick={handleStartWizard}>
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Domain
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => (
                <motion.div
                  key={domain.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="font-mono text-lg">{domain.domain}</code>
                            {domain.is_primary && (
                              <Badge variant="outline">Primary</Badge>
                            )}
                            {getStatusBadge(domain.verification_status)}
                            {domain.ssl_status === 'active' && (
                              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                <Lock className="w-3 h-3 mr-1" /> SSL Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Added {new Date(domain.created_at).toLocaleDateString()}
                            {domain.verified_at && ` • Verified ${new Date(domain.verified_at).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {domain.verification_status === 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => verifyDomainWithChecks(domain.id, domain.domain)}
                              disabled={verifyingDomains.has(domain.id)}
                            >
                              {verifyingDomains.has(domain.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                              <span className="ml-2">Verify</span>
                            </Button>
                          )}
                          {domain.verification_status === 'verified' && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`https://${domain.domain}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" /> Visit
                              </a>
                            </Button>
                          )}
                          {/* Domain Transfer & Export */}
                          {panel?.id && (
                            <DomainTransfer 
                              domain={{
                                id: domain.id,
                                domain: domain.domain,
                                panel_id: panel.id,
                                verification_status: domain.verification_status,
                                ssl_status: domain.ssl_status,
                                hosting_provider: domain.hosting_provider
                              }}
                              currentPanelId={panel.id}
                              onTransferComplete={fetchData}
                            />
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteDomain(domain.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* DNS Instructions for pending domains */}
                      {domain.verification_status === 'pending' && (
                        <div className="mt-4 space-y-3">
                          <Alert className="border-amber-500/30 bg-amber-500/5">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <AlertDescription className="text-sm">
                              <strong>Action Required:</strong> Add these DNS records at your domain registrar to verify ownership.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge variant="outline">A</Badge>
                              <code className="text-xs">@</code>
                              <ArrowRight className="w-3 h-3" />
                              <code className="text-xs bg-muted px-2 py-0.5 rounded">{VERCEL_IP}</code>
                              <Button variant="ghost" size="sm" className="h-6" onClick={() => copyToClipboard(VERCEL_IP)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge variant="outline">CNAME</Badge>
                              <code className="text-xs">www</code>
                              <ArrowRight className="w-3 h-3" />
                              <code className="text-xs bg-muted px-2 py-0.5 rounded">{VERCEL_CNAME}</code>
                              <Button variant="ghost" size="sm" className="h-6" onClick={() => copyToClipboard(VERCEL_CNAME)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge variant="outline">TXT</Badge>
                              <code className="text-xs">_homeofsmm</code>
                              <ArrowRight className="w-3 h-3" />
                              <code className="text-xs bg-muted px-2 py-0.5 rounded break-all">homeofsmm-verify={domain.verification_token || panel?.id?.substring(0, 8)}</code>
                              <Button variant="ghost" size="sm" className="h-6" onClick={() => copyToClipboard(`homeofsmm-verify=${domain.verification_token || panel?.id?.substring(0, 8)}`)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            ⚠️ <strong>Do NOT change your nameservers.</strong> Only add these records.
                          </p>
                        </div>
                      )}
                      
                      {/* Show TXT verified badge if applicable */}
                      {domain.txt_verified_at && (
                        <Badge className="mt-2 bg-blue-500/10 text-blue-500 border-blue-500/20">
                          <Check className="w-3 h-3 mr-1" /> TXT Verified
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* DNS Configuration Guide - Simplified */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                DNS Configuration Guide
              </CardTitle>
              <CardDescription>
                Add these records at your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warning */}
              <Alert className="border-amber-500/30 bg-amber-500/5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <AlertDescription className="text-sm">
                  <strong>⚠️ Important:</strong> Only add the records below. Do NOT change your nameservers!
                </AlertDescription>
              </Alert>

              {/* DNS Records Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Value</th>
                      <th className="p-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3"><Badge variant="outline">A</Badge></td>
                      <td className="p-3"><code className="text-xs bg-muted px-2 py-1 rounded">@</code></td>
                      <td className="p-3"><code className="text-xs bg-muted px-2 py-1 rounded">{VERCEL_IP}</code></td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(VERCEL_IP)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3"><Badge variant="outline">CNAME</Badge></td>
                      <td className="p-3"><code className="text-xs bg-muted px-2 py-1 rounded">www</code></td>
                      <td className="p-3"><code className="text-xs bg-muted px-2 py-1 rounded">{VERCEL_CNAME}</code></td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(VERCEL_CNAME)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3"><Badge variant="outline">TXT</Badge></td>
                      <td className="p-3"><code className="text-xs bg-muted px-2 py-1 rounded">_homeofsmm</code></td>
                      <td className="p-3"><code className="text-xs bg-muted px-2 py-1 rounded break-all">homeofsmm-verify={panel?.id?.substring(0, 8) || 'xxxxx'}</code></td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`homeofsmm-verify=${panel?.id?.substring(0, 8) || 'xxxxx'}`)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>📝 Quick Guide:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Log into your domain registrar (where you bought your domain)</li>
                  <li>Find the DNS settings or DNS management section</li>
                  <li>Add each record from the table above</li>
                  <li>Save changes and wait up to 48 hours for propagation</li>
                  <li>Come back here and click "Verify" on your domain</li>
                </ol>
              </div>
              
              <p className="text-xs text-muted-foreground border-t pt-4">
                💡 <strong>Tip:</strong> DNS changes typically take 15 minutes to 48 hours to propagate. We'll automatically detect when your domain is ready.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setup Guide Tab */}
        <TabsContent value="setup" className="space-y-6">
          <DomainConfigWizard 
            domain={domains.length > 0 ? domains[0].domain : undefined}
          />
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" className="space-y-6">
          <DomainDiagnostics 
            panelSubdomain={panel?.subdomain}
            customDomains={domains.map(d => ({ domain: d.domain, verification_status: d.verification_status }))}
          />
        </TabsContent>

        {/* DNS Propagation Tab */}
        <TabsContent value="dns" className="space-y-6">
          {/* Domain selector for propagation tracking */}
          {domains.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {domains.map((domain) => (
                  <Button
                    key={domain.id}
                    variant={propagationDomain === domain.domain ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPropagationDomain(domain.domain)}
                  >
                    {domain.domain}
                  </Button>
                ))}
              </div>
              {propagationDomain && (
                <DNSPropagationTracker 
                  domain={propagationDomain}
                  autoRefresh={true}
                  refreshInterval={30000}
                />
              )}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Network className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Domains to Track</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add a custom domain first to track its DNS propagation
                </p>
                <Button onClick={handleStartWizard}>
                  <Plus className="w-4 h-4 mr-2" /> Add Domain
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Manual domain check */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <RefreshCw className="w-4 h-4 text-primary" />
                Check Any Domain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Enter domain to check (e.g., example.com)"
                  value={propagationDomain}
                  onChange={(e) => setPropagationDomain(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={checkDnsPropagation} disabled={isCheckingPropagation || !propagationDomain}>
                  {isCheckingPropagation ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Check DNS
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Auto-verify toggle */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-Verify Domains</h4>
                  <p className="text-sm text-muted-foreground">Automatically check pending domains every 30 seconds</p>
                </div>
                <Switch checked={autoVerifyEnabled} onCheckedChange={setAutoVerifyEnabled} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SSL & Security Tab */}
        <TabsContent value="ssl" className="space-y-6">
          <SSLMonitoringDashboard 
            panelId={panel?.id}
            subdomain={panel?.subdomain}
            domains={domains.map(d => ({
              domain: d.domain,
              ssl_status: d.ssl_status,
              verification_status: d.verification_status,
              verified_at: d.verified_at
            }))}
            onRefresh={fetchData}
          />
        </TabsContent>

        {/* Troubleshooting Tab */}
        <TabsContent value="troubleshoot" className="space-y-6">
          <DomainTroubleshootingGuide 
            domain={domains.length > 0 ? domains[0].domain : undefined}
            panelId={panel?.id}
          />
        </TabsContent>

        {/* Buy Domain Tab */}
        <TabsContent value="buy" className="space-y-6">
          <DomainPurchaseLinks />
        </TabsContent>
      </Tabs>

      {/* Add Domain Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Custom Domain</DialogTitle>
            <DialogDescription>
              Step {wizardStep} of 4: {wizardSteps[wizardStep - 1]?.title}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex justify-between mb-6">
            {wizardSteps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  wizardStep >= step.number 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {wizardStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span className="text-xs mt-1 text-muted-foreground hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Domain Name</Label>
                <Input
                  placeholder="yourdomain.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Enter your domain without http:// or www</p>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4">
              <RadioGroup value={domainType} onValueChange={(v) => setDomainType(v as any)}>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="primary" id="primary" />
                  <div>
                    <Label htmlFor="primary" className="font-medium">Primary Domain</Label>
                    <p className="text-sm text-muted-foreground">Use as your main panel URL</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="secondary" id="secondary" />
                  <div>
                    <Label htmlFor="secondary" className="font-medium">Secondary Domain</Label>
                    <p className="text-sm text-muted-foreground">Additional domain that redirects to primary</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Add these DNS records at your domain registrar for <strong>{newDomain}</strong>
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">A</Badge>
                    <code>@</code>
                    <ArrowRight className="w-4 h-4" />
                    <code>{VERCEL_IP}</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(VERCEL_IP)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">CNAME</Badge>
                    <code>www</code>
                    <ArrowRight className="w-4 h-4" />
                    <code>{VERCEL_CNAME}</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(VERCEL_CNAME)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Ready to Add Domain</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Add Domain" to save. We'll automatically verify once DNS propagates.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <code className="text-lg">{newDomain}</code>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={wizardStep === 1 ? () => setShowWizard(false) : handlePrevStep}>
              {wizardStep === 1 ? "Cancel" : <><ArrowLeft className="w-4 h-4 mr-2" /> Back</>}
            </Button>
            {wizardStep < 4 ? (
              <Button onClick={handleNextStep}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleAddDomain} disabled={verifying}>
                {verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Domain
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buy Domain Tab Content - add before closing div */}
      {activeTab === 'buy' && (
        <TabsContent value="buy" forceMount className="space-y-6">
          <DomainPurchaseLinks />
        </TabsContent>
      )}
    </div>
  );
};

export default DomainSettings;