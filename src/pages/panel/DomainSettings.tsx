import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Network
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PanelDomain {
  id: string;
  domain: string;
  is_primary: boolean;
  verification_status: string;
  ssl_status: string;
  dns_configured: boolean;
  verified_at: string | null;
  created_at: string;
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

  const LOVABLE_IP = "185.158.133.1";

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
            description: `Your domain must have an A record pointing to ${LOVABLE_IP}. Detected: ${(health?.a_records || []).join(", ") || "none"}`,
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
            <TabsTrigger value="dns" className="text-xs md:text-sm"><Network className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> DNS <span className="hidden sm:inline">Checker</span></TabsTrigger>
            <TabsTrigger value="ssl" className="text-xs md:text-sm"><Shield className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> SSL</TabsTrigger>
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
                        <div className="flex gap-2">
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
                        <Alert className="mt-4">
                          <Info className="w-4 h-4" />
                          <AlertDescription>
                            <strong>DNS Configuration Required:</strong> Add an A record pointing to <code className="bg-muted px-1 rounded">{LOVABLE_IP}</code>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* DNS Configuration Guide */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                DNS Configuration Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To connect a custom domain, add these DNS records at your domain registrar:
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">A</Badge>
                    <code className="text-sm">@</code>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <code className="text-sm">{LOVABLE_IP}</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(LOVABLE_IP)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">A</Badge>
                    <code className="text-sm">www</code>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <code className="text-sm">{LOVABLE_IP}</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(LOVABLE_IP)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                DNS changes can take up to 48 hours to propagate. We'll automatically verify your domain once the records are detected.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DNS Checker Tab */}
        <TabsContent value="dns" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                DNS Propagation Checker
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
                <Button onClick={checkDnsPropagation} disabled={isCheckingPropagation}>
                  {isCheckingPropagation ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Check DNS
                </Button>
              </div>

              {propagationResults.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="font-medium">Results from global DNS servers:</h4>
                  {propagationResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        result.status === 'resolved' ? "bg-green-500/10" : "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span>{result.flag}</span>
                        <span className="font-medium">{result.server}</span>
                        <span className="text-muted-foreground text-sm">{result.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === 'resolved' ? (
                          <>
                            <code className="text-sm text-green-500">{result.value}</code>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </>
                        ) : result.status === 'not_found' ? (
                          <>
                            <span className="text-sm text-muted-foreground">Not found</span>
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-muted-foreground">Checking...</span>
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                SSL Certificate Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subdomain SSL */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{panel?.subdomain}.smmpilot.online</p>
                  <p className="text-sm text-muted-foreground">Managed by SMMPilot</p>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  <Lock className="w-3 h-3 mr-1" /> SSL Active
                </Badge>
              </div>

              {/* Custom Domain SSL */}
              {domains.filter(d => d.verification_status === 'verified').map((domain) => (
                <div key={domain.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{domain.domain}</p>
                    <p className="text-sm text-muted-foreground">Let's Encrypt Certificate</p>
                  </div>
                  {domain.ssl_status === 'active' ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <Lock className="w-3 h-3 mr-1" /> SSL Active
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      <Clock className="w-3 h-3 mr-1" /> Provisioning
                    </Badge>
                  )}
                </div>
              ))}

              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  SSL certificates are automatically provisioned and renewed for all verified domains.
                  This process may take a few minutes after DNS verification.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
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
                    <code>{LOVABLE_IP}</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(LOVABLE_IP)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">A</Badge>
                    <code>www</code>
                    <ArrowRight className="w-4 h-4" />
                    <code>{LOVABLE_IP}</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(LOVABLE_IP)}>
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
    </div>
  );
};

export default DomainSettings;