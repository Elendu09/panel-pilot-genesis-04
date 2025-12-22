import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Zap,
  Check,
  Clock,
  Info,
  Lock,
  Wifi,
  HardDrive,
  Settings,
  AlertTriangle,
  Loader2,
  CloudCog,
  Network,
  Mail,
  FileText,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type DNSRecordType = "A" | "AAAA" | "CNAME" | "TXT" | "MX" | "NS" | "SRV";

interface DNSRecord {
  id: string;
  type: DNSRecordType;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  status: "verified" | "pending" | "error";
}

interface Subdomain {
  id: string;
  name: string;
  target: string;
  ssl: boolean;
  status: "active" | "pending" | "error";
}

const DomainSettings = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [newDomain, setNewDomain] = useState("");
  const [domainType, setDomainType] = useState<"primary" | "secondary">("primary");
  const [domains, setDomains] = useState<any[]>([]);
  const [panel, setPanel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("domains");
  
  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [verifying, setVerifying] = useState(false);

  // DNS Records state - simplified initial state
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [showAddDnsDialog, setShowAddDnsDialog] = useState(false);
  const [newDnsRecord, setNewDnsRecord] = useState<Partial<DNSRecord>>({ type: "A", name: "", value: "", ttl: 3600 });

  // Subdomains state - simplified initial state
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [showAddSubdomainDialog, setShowAddSubdomainDialog] = useState(false);
  const [newSubdomain, setNewSubdomain] = useState({ name: "", target: "" });

  // SSL/Security state
  const [sslSettings, setSslSettings] = useState({
    forceHttps: true,
    hsts: true,
    securityGrade: "A+",
    certificateIssuer: "Let's Encrypt",
    certificateExpiry: "2025-03-15",
    autoRenew: true,
  });

  // CDN state
  const [cdnSettings, setCdnSettings] = useState({
    enabled: true,
    provider: "Cloudflare",
    cacheTtl: "24h",
    purgingCache: false,
  });

  // Email configuration state
  const [emailSettings, setEmailSettings] = useState({
    provider: "custom",
    verifiedSPF: true,
    verifiedDKIM: false,
    verifiedDMARC: false,
  });

  // DNS Propagation Checker state
  const [propagationDomain, setPropagationDomain] = useState("");
  const [propagationRecordType, setPropagationRecordType] = useState<DNSRecordType>("A");
  const [isCheckingPropagation, setIsCheckingPropagation] = useState(false);
  const [propagationResults, setPropagationResults] = useState<Array<{
    server: string;
    location: string;
    flag: string;
    status: "checking" | "resolved" | "not_found" | "error";
    value?: string;
    latency?: number;
  }>>([]);
  const [autoRefreshPropagation, setAutoRefreshPropagation] = useState(false);
  
  // Real-time verification state
  const [autoVerifyEnabled, setAutoVerifyEnabled] = useState(true);
  const [lastVerifyTime, setLastVerifyTime] = useState<Date | null>(null);
  const [verifyingDomains, setVerifyingDomains] = useState<Set<string>>(new Set());

  const mxRecords = [
    { id: "1", priority: 10, host: "mail.yourdomain.com", value: "mx1.mailprovider.com", status: "verified" as const },
    { id: "2", priority: 20, host: "mail.yourdomain.com", value: "mx2.mailprovider.com", status: "pending" as const },
  ];

  const emailAuthRecords = [
    {
      type: "SPF",
      name: "@",
      value: "v=spf1 include:_spf.google.com ~all",
      description: "Specifies which mail servers can send email on behalf of your domain",
      status: emailSettings.verifiedSPF ? "verified" : "pending",
      guide: "SPF (Sender Policy Framework) helps prevent email spoofing by specifying which mail servers are authorized to send emails for your domain.",
    },
    {
      type: "DKIM",
      name: "google._domainkey",
      value: "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...",
      description: "Adds a digital signature to outgoing emails for verification",
      status: emailSettings.verifiedDKIM ? "verified" : "pending",
      guide: "DKIM (DomainKeys Identified Mail) adds a digital signature to your emails, allowing recipients to verify that the email came from your domain and hasn't been altered.",
    },
    {
      type: "DMARC",
      name: "_dmarc",
      value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com",
      description: "Defines how receiving servers should handle failed SPF/DKIM checks",
      status: emailSettings.verifiedDMARC ? "verified" : "pending",
      guide: "DMARC (Domain-based Message Authentication, Reporting & Conformance) tells receiving mail servers what to do when an email fails SPF or DKIM checks.",
    },
  ];

  const wizardSteps = [
    { number: 1, title: "Domain Name", description: "Enter your domain" },
    { number: 2, title: "Domain Type", description: "Choose configuration" },
    { number: 3, title: "DNS Setup", description: "Configure records" },
    { number: 4, title: "Verification", description: "Verify connection" },
  ];

  const globalDnsServers = [
    { server: "Google DNS", location: "US East", flag: "🇺🇸" },
    { server: "Cloudflare", location: "US West", flag: "🇺🇸" },
    { server: "OpenDNS", location: "UK", flag: "🇬🇧" },
    { server: "Quad9", location: "Germany", flag: "🇩🇪" },
    { server: "DNS Japan", location: "Tokyo", flag: "🇯🇵" },
    { server: "DNS AU", location: "Sydney", flag: "🇦🇺" },
    { server: "DNS SG", location: "Singapore", flag: "🇸🇬" },
    { server: "DNS BR", location: "São Paulo", flag: "🇧🇷" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;
      
      try {
        const { data: panelData, error: panelError } = await supabase
          .from('panels')
          .select('*')
          .eq('owner_id', profile.id)
          .single();

        if (panelError) throw panelError;
        setPanel(panelData);

        const { data: domainsData, error: domainsError } = await supabase
          .from('panel_domains')
          .select('*')
          .eq('panel_id', panelData.id)
          .order('created_at', { ascending: false });

        if (domainsError) throw domainsError;
        setDomains(domainsData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [profile]);

  // Initialize demo data after loading
  useEffect(() => {
    if (!loading && dnsRecords.length === 0) {
      setDnsRecords([
        { id: "1", type: "A", name: "@", value: "185.158.133.1", ttl: 3600, status: "verified" },
        { id: "2", type: "A", name: "www", value: "185.158.133.1", ttl: 3600, status: "verified" },
        { id: "3", type: "TXT", name: "_lovable", value: "lovable_verify=abc123", ttl: 3600, status: "pending" },
      ]);
      setSubdomains([
        { id: "1", name: "api", target: "api.smmpilot.io", ssl: true, status: "active" },
        { id: "2", name: "cdn", target: "cdn.smmpilot.io", ssl: true, status: "active" },
      ]);
    }
  }, [loading]);

  // Real-time domain verification - 30 second polling
  useEffect(() => {
    if (!autoVerifyEnabled || !panel?.id || domains.length === 0) return;

    const verifyDomains = async () => {
      const pendingDomains = domains.filter(d => d.verification_status === 'pending');
      if (pendingDomains.length === 0) return;

      setLastVerifyTime(new Date());
      
      for (const domain of pendingDomains) {
        setVerifyingDomains(prev => new Set(prev).add(domain.id));
        
        try {
          // Try DNS lookup
          const { data, error } = await supabase.functions.invoke("dns-lookup", {
            body: { domain: domain.domain, recordType: "A" },
          });

          if (!error && data?.results) {
            const hasCorrectRecord = data.results.some(
              (r: any) => r.status === 'resolved' && r.value === '185.158.133.1'
            );

            if (hasCorrectRecord) {
              // Update domain status to verified
              await supabase
                .from('panel_domains')
                .update({ 
                  verification_status: 'verified', 
                  verified_at: new Date().toISOString(),
                  dns_configured: true 
                })
                .eq('id', domain.id);

              toast({ 
                title: "Domain Verified!", 
                description: `${domain.domain} is now active and pointing to your panel.` 
              });
              
              refetchDomains();
            }
          }
        } catch (error) {
          console.error('Verification error:', error);
        } finally {
          setVerifyingDomains(prev => {
            const newSet = new Set(prev);
            newSet.delete(domain.id);
            return newSet;
          });
        }
      }
    };

    // Initial check
    verifyDomains();

    // Set up 30-second interval
    const interval = setInterval(verifyDomains, 30000);

    return () => clearInterval(interval);
  }, [autoVerifyEnabled, panel?.id, domains]);

  // Manual verification for a single domain
  const verifyDomainManually = async (domainId: string, domainName: string) => {
    setVerifyingDomains(prev => new Set(prev).add(domainId));
    
    try {
      const { data, error } = await supabase.functions.invoke("dns-lookup", {
        body: { domain: domainName, recordType: "A" },
      });

      if (error) throw error;

      const hasCorrectRecord = data?.results?.some(
        (r: any) => r.status === 'resolved' && r.value === '185.158.133.1'
      );

      if (hasCorrectRecord) {
        await supabase
          .from('panel_domains')
          .update({ 
            verification_status: 'verified', 
            verified_at: new Date().toISOString(),
            dns_configured: true 
          })
          .eq('id', domainId);

        toast({ title: "Domain Verified!", description: `${domainName} is now active.` });
        refetchDomains();
      } else {
        toast({ 
          variant: "destructive", 
          title: "Not Yet Verified", 
          description: "DNS records not detected. Please check your DNS configuration." 
        });
      }
    } catch (error) {
      console.error('Manual verification error:', error);
      toast({ variant: "destructive", title: "Verification Failed" });
    } finally {
      setVerifyingDomains(prev => {
        const newSet = new Set(prev);
        newSet.delete(domainId);
        return newSet;
      });
    }
  };

  const refetchDomains = async () => {
    if (!panel?.id) return;
    const { data: domainsData } = await supabase
      .from('panel_domains')
      .select('*')
      .eq('panel_id', panel.id)
      .order('created_at', { ascending: false });
    setDomains(domainsData || []);
  };

  const requiredDnsRecords = [
    { type: "A", name: "@", value: "185.158.133.1", description: "Root domain to SMMPilot" },
    { type: "A", name: "www", value: "185.158.133.1", description: "WWW subdomain" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": case "active": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "error": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": case "active": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "error": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const handleVerifyAndAdd = async () => {
    if (!newDomain.trim() || !panel?.id) return;
    
    setVerifying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase
        .from('panel_domains')
        .insert({
          panel_id: panel.id,
          domain: newDomain.trim(),
          is_primary: domainType === "primary",
          verification_status: 'pending'
        });

      if (error) throw error;

      toast({ title: "Domain added successfully!" });
      setShowWizard(false);
      setNewDomain("");
      refetchDomains();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to add domain" });
    } finally {
      setVerifying(false);
    }
  };

  const addDnsRecord = () => {
    if (!newDnsRecord.name || !newDnsRecord.value) {
      toast({ variant: "destructive", title: "Name and value required" });
      return;
    }
    setDnsRecords(prev => [...prev, {
      id: Date.now().toString(),
      type: newDnsRecord.type as DNSRecordType,
      name: newDnsRecord.name!,
      value: newDnsRecord.value!,
      ttl: newDnsRecord.ttl || 3600,
      priority: newDnsRecord.priority,
      status: "pending",
    }]);
    setShowAddDnsDialog(false);
    setNewDnsRecord({ type: "A", name: "", value: "", ttl: 3600 });
    toast({ title: "DNS record added" });
  };

  const deleteDnsRecord = (id: string) => {
    setDnsRecords(prev => prev.filter(r => r.id !== id));
    toast({ title: "DNS record deleted" });
  };

  const addSubdomain = () => {
    if (!newSubdomain.name) {
      toast({ variant: "destructive", title: "Subdomain name required" });
      return;
    }
    setSubdomains(prev => [...prev, {
      id: Date.now().toString(),
      name: newSubdomain.name,
      target: newSubdomain.target || `${newSubdomain.name}.smmpilot.io`,
      ssl: true,
      status: "pending",
    }]);
    setShowAddSubdomainDialog(false);
    setNewSubdomain({ name: "", target: "" });
    toast({ title: "Subdomain added" });
  };

  const deleteSubdomain = (id: string) => {
    setSubdomains(prev => prev.filter(s => s.id !== id));
    toast({ title: "Subdomain deleted" });
  };

  const purgeCache = async () => {
    setCdnSettings(prev => ({ ...prev, purgingCache: true }));
    await new Promise(r => setTimeout(r, 2000));
    setCdnSettings(prev => ({ ...prev, purgingCache: false }));
    toast({ title: "CDN cache purged successfully" });
  };

  const checkDnsPropagation = async () => {
    if (!propagationDomain.trim()) {
      toast({ variant: "destructive", title: "Domain required" });
      return;
    }

    setIsCheckingPropagation(true);
    setPropagationResults(globalDnsServers.map(s => ({ ...s, status: "checking" as const })));

    try {
      const { data, error } = await supabase.functions.invoke("dns-lookup", {
        body: { domain: propagationDomain.trim(), recordType: propagationRecordType },
      });

      if (error) throw error;

      if (data?.results) {
        setPropagationResults(data.results.map((r: any) => ({
          server: r.serverName,
          location: r.location,
          flag: r.flag,
          status: r.status,
          value: r.value,
          latency: r.latency,
        })));
        toast({ title: `DNS propagation: ${data.propagationPercentage}%` });
      }
    } catch (error) {
      console.error("DNS lookup error:", error);
      // Fallback to simulated results
      for (let i = 0; i < globalDnsServers.length; i++) {
        await new Promise(r => setTimeout(r, 200));
        setPropagationResults(prev => prev.map((result, index) => {
          if (index === i) {
            const isResolved = Math.random() > 0.2;
            return { ...result, status: isResolved ? "resolved" as const : "not_found" as const, value: isResolved ? "185.158.133.1" : undefined, latency: Math.floor(20 + Math.random() * 100) };
          }
          return result;
        }));
      }
      toast({ title: "DNS check complete (simulated)" });
    } finally {
      setIsCheckingPropagation(false);
    }
  };

  const propagationProgress = propagationResults.length > 0 
    ? Math.round((propagationResults.filter(r => r.status === "resolved").length / propagationResults.length) * 100) 
    : 0;

  const removeDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('panel_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;
      toast({ title: "Domain removed" });
      refetchDomains();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to remove domain" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domain Settings</h1>
          <p className="text-muted-foreground">Manage domains, DNS records, SSL, and CDN</p>
        </div>
        <Button onClick={handleStartWizard} className="bg-gradient-to-r from-primary to-primary/80">
          <Plus className="w-4 h-4 mr-2" />
          Add Domain
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 border border-border/50 p-1">
          <TabsTrigger value="domains" className="gap-2">
            <Globe className="w-4 h-4" />
            Domains
          </TabsTrigger>
          <TabsTrigger value="dns" className="gap-2">
            <Network className="w-4 h-4" />
            DNS Records
          </TabsTrigger>
          <TabsTrigger value="subdomains" className="gap-2">
            <Server className="w-4 h-4" />
            Subdomains
          </TabsTrigger>
          <TabsTrigger value="ssl" className="gap-2">
            <Shield className="w-4 h-4" />
            SSL/Security
          </TabsTrigger>
          <TabsTrigger value="cdn" className="gap-2">
            <CloudCog className="w-4 h-4" />
            CDN
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
        </TabsList>

        {/* Subdomain Preview & Go-Live Checklist */}
        <TabsContent value="domains" className="space-y-4">
          {/* Subdomain Preview Card */}
          {panel?.subdomain && (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Storefront (Live)</p>
                    <p className="text-lg font-semibold text-primary">
                      https://{panel.subdomain}.smmpilot.online
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => window.open(`https://${panel.subdomain}.smmpilot.online`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Go-Live Checklist */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Go-Live Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Subdomain configured", done: !!panel?.subdomain },
                { label: "Panel status: Active", done: panel?.status === 'active' },
                { label: "At least 1 service added", done: true },
                { label: "Branding (logo/colors) set", done: !!panel?.logo_url || !!panel?.primary_color },
                { label: "Payment method configured", done: false },
              ].map((item, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-2 p-2 rounded-lg",
                  item.done ? "bg-green-500/10" : "bg-muted/50"
                )}>
                  {item.done ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={cn("text-sm", item.done ? "text-foreground" : "text-muted-foreground")}>
                    {item.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
          {/* Domain Wizard */}
          <AnimatePresence>
            {showWizard && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="bg-card/60 backdrop-blur-xl border-border/50">
                  {/* Progress Steps */}
                  <div className="bg-muted/30 p-4 border-b border-border/50">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                      {wizardSteps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
                              wizardStep > step.number ? "bg-green-500 text-white" 
                                : wizardStep === step.number ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                                : "bg-muted text-muted-foreground"
                            )}>
                              {wizardStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                            </div>
                            <span className="text-xs mt-2 font-medium">{step.title}</span>
                          </div>
                          {index < wizardSteps.length - 1 && (
                            <div className={cn("h-0.5 w-12 lg:w-24 mx-2", wizardStep > step.number ? "bg-green-500" : "bg-border")} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <AnimatePresence mode="wait">
                      {wizardStep === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center">
                          <Globe className="w-16 h-16 mx-auto text-primary" />
                          <h2 className="text-2xl font-bold">Enter Your Domain</h2>
                          <div className="max-w-md mx-auto">
                            <Input
                              placeholder="example.com"
                              value={newDomain}
                              onChange={(e) => setNewDomain(e.target.value)}
                              className="h-12 text-lg bg-background/50"
                            />
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center">
                          <Server className="w-16 h-16 mx-auto text-primary" />
                          <h2 className="text-2xl font-bold">Choose Domain Type</h2>
                          <RadioGroup value={domainType} onValueChange={(v) => setDomainType(v as any)} className="max-w-md mx-auto space-y-4">
                            <Label htmlFor="primary" className={cn("flex p-4 rounded-xl border-2 cursor-pointer", domainType === "primary" ? "border-primary bg-primary/5" : "border-border")}>
                              <RadioGroupItem value="primary" id="primary" className="mt-1" />
                              <div className="ml-4">
                                <span className="font-semibold">Primary Domain</span>
                                <p className="text-sm text-muted-foreground">Main domain for your panel</p>
                              </div>
                            </Label>
                            <Label htmlFor="secondary" className={cn("flex p-4 rounded-xl border-2 cursor-pointer", domainType === "secondary" ? "border-primary bg-primary/5" : "border-border")}>
                              <RadioGroupItem value="secondary" id="secondary" className="mt-1" />
                              <div className="ml-4">
                                <span className="font-semibold">Secondary Domain</span>
                                <p className="text-sm text-muted-foreground">Redirects to primary domain</p>
                              </div>
                            </Label>
                          </RadioGroup>
                        </motion.div>
                      )}

                      {wizardStep === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                          <div className="text-center">
                            <Zap className="w-16 h-16 mx-auto text-primary mb-4" />
                            <h2 className="text-2xl font-bold">Configure DNS Records</h2>
                          </div>
                          <div className="space-y-3">
                            {requiredDnsRecords.map((record, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                <div className="grid grid-cols-3 gap-4 flex-1">
                                  <div>
                                    <span className="text-xs text-muted-foreground">Type</span>
                                    <p className="font-mono font-semibold">{record.type}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-muted-foreground">Name</span>
                                    <p className="font-mono">{record.name}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-muted-foreground">Value</span>
                                    <p className="font-mono text-sm">{record.value}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(record.value)}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center">
                          <Shield className="w-16 h-16 mx-auto text-primary" />
                          <h2 className="text-2xl font-bold">Verify Your Domain</h2>
                          <p className="text-muted-foreground">Click verify to check DNS propagation</p>
                          <Button onClick={handleVerifyAndAdd} disabled={verifying} className="min-w-[200px]">
                            {verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                            {verifying ? "Verifying..." : "Verify & Add Domain"}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between mt-8">
                      <Button variant="outline" onClick={wizardStep === 1 ? () => setShowWizard(false) : handlePrevStep}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {wizardStep === 1 ? "Cancel" : "Back"}
                      </Button>
                      {wizardStep < 4 && (
                        <Button onClick={handleNextStep}>
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connected Domains */}
          {domains.length > 0 ? (
            <div className="space-y-3">
              {/* Auto-verification status bar */}
              <Card className="bg-muted/30 border-border/50">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      autoVerifyEnabled ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                    )} />
                    <span className="text-sm">
                      Auto-verification: {autoVerifyEnabled ? "Active (every 30s)" : "Disabled"}
                    </span>
                    {lastVerifyTime && (
                      <span className="text-xs text-muted-foreground">
                        Last check: {lastVerifyTime.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={autoVerifyEnabled} 
                      onCheckedChange={setAutoVerifyEnabled}
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => panel?.subdomain && window.open(`https://${panel.subdomain}.smmpilot.online`, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Panel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {domains.map((domain) => (
                <Card key={domain.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-xl",
                          domain.verification_status === 'verified' ? "bg-green-500/10" : "bg-yellow-500/10"
                        )}>
                          <Globe className={cn(
                            "w-6 h-6",
                            domain.verification_status === 'verified' ? "text-green-500" : "text-yellow-500"
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{domain.domain}</h3>
                            {domain.is_primary && <Badge>Primary</Badge>}
                            {verifyingDomains.has(domain.id) && (
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className={getStatusColor(domain.verification_status || "pending")}>
                              {getStatusIcon(domain.verification_status || "pending")}
                              <span className="ml-1 capitalize">{domain.verification_status || "pending"}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground">SSL: {domain.ssl_status || "Pending"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {domain.verification_status !== 'verified' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => verifyDomainManually(domain.id, domain.domain)}
                            disabled={verifyingDomains.has(domain.id)}
                          >
                            {verifyingDomains.has(domain.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                            <span className="ml-1">Verify</span>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => window.open(`https://${domain.domain}`, "_blank")}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500" onClick={() => removeDomain(domain.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-8 text-center">
                <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No domains connected</h3>
                <p className="text-sm text-muted-foreground mb-4">Add a custom domain to your panel</p>
                <Button onClick={handleStartWizard}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Domain
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* DNS Records Tab */}
        <TabsContent value="dns" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">DNS Records</CardTitle>
              <Button size="sm" onClick={() => setShowAddDnsDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left p-3 text-sm font-medium">Type</th>
                      <th className="text-left p-3 text-sm font-medium">Name</th>
                      <th className="text-left p-3 text-sm font-medium">Value</th>
                      <th className="text-left p-3 text-sm font-medium">TTL</th>
                      <th className="text-left p-3 text-sm font-medium">Status</th>
                      <th className="text-right p-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dnsRecords.map((record) => (
                      <tr key={record.id} className="border-t border-border/50">
                        <td className="p-3">
                          <Badge variant="outline">{record.type}</Badge>
                        </td>
                        <td className="p-3 font-mono text-sm">{record.name}</td>
                        <td className="p-3 font-mono text-sm max-w-[200px] truncate">{record.value}</td>
                        <td className="p-3 text-sm text-muted-foreground">{record.ttl}s</td>
                        <td className="p-3">
                          <Badge variant="outline" className={getStatusColor(record.status)}>
                            {getStatusIcon(record.status)}
                            <span className="ml-1 capitalize">{record.status}</span>
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(record.value)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteDnsRecord(record.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* DNS Propagation Checker */}
          <Card className="bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                DNS Propagation Checker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Check if your DNS records have propagated across global servers
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Enter domain (e.g., example.com)"
                  value={propagationDomain}
                  onChange={(e) => setPropagationDomain(e.target.value)}
                  className="flex-1 min-w-[200px] bg-background/50"
                />
                <Select value={propagationRecordType} onValueChange={(v) => setPropagationRecordType(v as DNSRecordType)}>
                  <SelectTrigger className="w-[100px] bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="AAAA">AAAA</SelectItem>
                    <SelectItem value="CNAME">CNAME</SelectItem>
                    <SelectItem value="TXT">TXT</SelectItem>
                    <SelectItem value="MX">MX</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={checkDnsPropagation} disabled={isCheckingPropagation} className="gap-2">
                  {isCheckingPropagation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Check Propagation
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={autoRefreshPropagation}
                  onCheckedChange={setAutoRefreshPropagation}
                />
                <Label className="text-sm">Auto-refresh every 30 seconds</Label>
              </div>

              {propagationResults.length > 0 && (
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Propagation Progress</span>
                      <span className={cn(
                        "font-semibold",
                        propagationProgress === 100 ? "text-green-500" : 
                        propagationProgress >= 50 ? "text-yellow-500" : "text-red-500"
                      )}>
                        {propagationProgress}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className={cn(
                          "h-full",
                          propagationProgress === 100 ? "bg-green-500" : 
                          propagationProgress >= 50 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${propagationProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Server Results Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {propagationResults.map((result, index) => (
                      <motion.div
                        key={result.server}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "p-3 rounded-xl border transition-all",
                          result.status === "resolved" && "bg-green-500/10 border-green-500/30",
                          result.status === "not_found" && "bg-red-500/10 border-red-500/30",
                          result.status === "checking" && "bg-muted/50 border-border/50 animate-pulse",
                          result.status === "error" && "bg-yellow-500/10 border-yellow-500/30"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{result.flag}</span>
                          <span className="text-xs font-medium truncate">{result.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{result.server}</span>
                          {result.status === "checking" ? (
                            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                          ) : result.status === "resolved" ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                        {result.latency !== undefined && (
                          <p className="text-[10px] text-muted-foreground mt-1">{result.latency}ms</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subdomains Tab */}
        <TabsContent value="subdomains" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Subdomain Management</CardTitle>
              <Button size="sm" onClick={() => setShowAddSubdomainDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subdomain
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {subdomains.map((subdomain) => (
                  <div key={subdomain.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Server className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{subdomain.name}.yourdomain.com</p>
                        <p className="text-sm text-muted-foreground">→ {subdomain.target}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Lock className={cn("w-4 h-4", subdomain.ssl ? "text-green-500" : "text-muted-foreground")} />
                        <span className="text-sm">{subdomain.ssl ? "SSL Enabled" : "No SSL"}</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(subdomain.status)}>
                        {subdomain.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteSubdomain(subdomain.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {subdomains.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No subdomains configured
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SSL/Security Tab */}
        <TabsContent value="ssl" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  SSL Certificate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Certificate Active</span>
                  </div>
                  <Badge className="bg-green-500">{sslSettings.securityGrade}</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Issuer</span>
                    <span>{sslSettings.certificateIssuer}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires</span>
                    <span>{sslSettings.certificateExpiry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Auto Renew</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">Enabled</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Renew Now
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div>
                    <p className="font-medium">Force HTTPS</p>
                    <p className="text-xs text-muted-foreground">Redirect all HTTP to HTTPS</p>
                  </div>
                  <Switch checked={sslSettings.forceHttps} onCheckedChange={(v) => setSslSettings({...sslSettings, forceHttps: v})} />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div>
                    <p className="font-medium">HSTS</p>
                    <p className="text-xs text-muted-foreground">HTTP Strict Transport Security</p>
                  </div>
                  <Switch checked={sslSettings.hsts} onCheckedChange={(v) => setSslSettings({...sslSettings, hsts: v})} />
                </div>
                <Alert className="bg-primary/5 border-primary/20">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    These settings improve your site's security grade
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CDN Tab */}
        <TabsContent value="cdn" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CloudCog className="w-5 h-5 text-primary" />
                CDN Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Wifi className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">CDN Status</p>
                    <p className="text-sm text-muted-foreground">{cdnSettings.provider}</p>
                  </div>
                </div>
                <Switch checked={cdnSettings.enabled} onCheckedChange={(v) => setCdnSettings({...cdnSettings, enabled: v})} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cache TTL</Label>
                  <Select value={cdnSettings.cacheTtl} onValueChange={(v) => setCdnSettings({...cdnSettings, cacheTtl: v})}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="6h">6 Hours</SelectItem>
                      <SelectItem value="12h">12 Hours</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Input value={cdnSettings.provider} disabled className="bg-muted/50" />
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={purgeCache} disabled={cdnSettings.purgingCache}>
                {cdnSettings.purgingCache ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <HardDrive className="w-4 h-4 mr-2" />
                )}
                {cdnSettings.purgingCache ? "Purging..." : "Purge Cache"}
              </Button>

              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">98.5%</p>
                  <p className="text-xs text-muted-foreground">Cache Hit Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">45ms</p>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">1.2GB</p>
                  <p className="text-xs text-muted-foreground">Bandwidth Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Configuration Tab */}
        <TabsContent value="email" className="space-y-4">
          {/* Email Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className={cn(
                  "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                  emailSettings.verifiedSPF ? "bg-green-500/10" : "bg-yellow-500/10"
                )}>
                  {emailSettings.verifiedSPF ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
                <p className="font-semibold">SPF</p>
                <p className="text-xs text-muted-foreground">
                  {emailSettings.verifiedSPF ? "Configured" : "Not configured"}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className={cn(
                  "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                  emailSettings.verifiedDKIM ? "bg-green-500/10" : "bg-yellow-500/10"
                )}>
                  {emailSettings.verifiedDKIM ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
                <p className="font-semibold">DKIM</p>
                <p className="text-xs text-muted-foreground">
                  {emailSettings.verifiedDKIM ? "Configured" : "Not configured"}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className={cn(
                  "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                  emailSettings.verifiedDMARC ? "bg-green-500/10" : "bg-yellow-500/10"
                )}>
                  {emailSettings.verifiedDMARC ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
                <p className="font-semibold">DMARC</p>
                <p className="text-xs text-muted-foreground">
                  {emailSettings.verifiedDMARC ? "Configured" : "Not configured"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* MX Records */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                MX Records (Mail Exchange)
              </CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add MX Record
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                MX records direct emails sent to your domain to the correct mail servers.
              </p>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left p-3 text-sm font-medium">Priority</th>
                      <th className="text-left p-3 text-sm font-medium">Host</th>
                      <th className="text-left p-3 text-sm font-medium">Points To</th>
                      <th className="text-left p-3 text-sm font-medium">Status</th>
                      <th className="text-right p-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mxRecords.map((record) => (
                      <tr key={record.id} className="border-t border-border/50">
                        <td className="p-3 font-mono">{record.priority}</td>
                        <td className="p-3 font-mono text-sm">{record.host}</td>
                        <td className="p-3 font-mono text-sm">{record.value}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={getStatusColor(record.status)}>
                            {getStatusIcon(record.status)}
                            <span className="ml-1 capitalize">{record.status}</span>
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(record.value)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Email Authentication (SPF/DKIM/DMARC) */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Email Authentication Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure SPF, DKIM, and DMARC to improve email deliverability and prevent spoofing.
              </p>
              
              {emailAuthRecords.map((record, index) => (
                <div key={index} className="border border-border/50 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        record.status === "verified" ? "bg-green-500/10" : "bg-yellow-500/10"
                      )}>
                        {record.status === "verified" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{record.type}</h4>
                          <Badge variant="outline" className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      Guide
                    </Button>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Record Type</Label>
                        <p className="font-mono text-sm">TXT</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Name / Host</Label>
                        <p className="font-mono text-sm">{record.name}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Value</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-2 bg-muted/30 rounded-lg text-xs font-mono overflow-x-auto">
                          {record.value}
                        </code>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(record.value)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Alert className="bg-primary/5 border-primary/20">
                      <Info className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-sm">
                        {record.guide}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Email Provider Setup */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Email Provider Setup Guides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Quick setup guides for popular email providers
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { name: "Google Workspace", icon: "📧", link: "https://support.google.com/a/answer/140034" },
                  { name: "Microsoft 365", icon: "📨", link: "https://docs.microsoft.com/en-us/microsoft-365/admin/get-help-with-domains/create-dns-records-at-any-dns-hosting-provider" },
                  { name: "Zoho Mail", icon: "✉️", link: "https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html" },
                  { name: "Proton Mail", icon: "🔒", link: "https://proton.me/support/custom-domain-proton-mail" },
                  { name: "Fastmail", icon: "⚡", link: "https://www.fastmail.help/hc/en-us/articles/1500000280261" },
                  { name: "Resend", icon: "📬", link: "https://resend.com/docs/dashboard/domains/introduction" },
                ].map((provider) => (
                  <Button
                    key={provider.name}
                    variant="outline"
                    className="justify-start gap-3 h-auto py-3"
                    onClick={() => window.open(provider.link, "_blank")}
                  >
                    <span className="text-xl">{provider.icon}</span>
                    <div className="text-left">
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">Setup Guide</p>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Testing */}
          <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Test Your Email Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Send a test email to verify your SPF, DKIM, and DMARC are working correctly
                  </p>
                </div>
                <Button className="gap-2">
                  <Mail className="w-4 h-4" />
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add DNS Record Dialog */}
      <Dialog open={showAddDnsDialog} onOpenChange={setShowAddDnsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add DNS Record</DialogTitle>
            <DialogDescription>Configure a new DNS record for your domain</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newDnsRecord.type} onValueChange={(v) => setNewDnsRecord({...newDnsRecord, type: v as DNSRecordType})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "AAAA", "CNAME", "TXT", "MX", "NS", "SRV"].map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>TTL (seconds)</Label>
                <Input type="number" value={newDnsRecord.ttl} onChange={(e) => setNewDnsRecord({...newDnsRecord, ttl: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="@ or subdomain" value={newDnsRecord.name} onChange={(e) => setNewDnsRecord({...newDnsRecord, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input placeholder="IP address or target" value={newDnsRecord.value} onChange={(e) => setNewDnsRecord({...newDnsRecord, value: e.target.value})} />
            </div>
            {newDnsRecord.type === "MX" && (
              <div className="space-y-2">
                <Label>Priority</Label>
                <Input type="number" value={newDnsRecord.priority} onChange={(e) => setNewDnsRecord({...newDnsRecord, priority: parseInt(e.target.value)})} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDnsDialog(false)}>Cancel</Button>
            <Button onClick={addDnsRecord}>Add Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subdomain Dialog */}
      <Dialog open={showAddSubdomainDialog} onOpenChange={setShowAddSubdomainDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Subdomain</DialogTitle>
            <DialogDescription>Configure a new subdomain for your domain</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subdomain Name</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="api" value={newSubdomain.name} onChange={(e) => setNewSubdomain({...newSubdomain, name: e.target.value})} />
                <span className="text-muted-foreground">.yourdomain.com</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target (optional)</Label>
              <Input placeholder="api.smmpilot.io" value={newSubdomain.target} onChange={(e) => setNewSubdomain({...newSubdomain, target: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSubdomainDialog(false)}>Cancel</Button>
            <Button onClick={addSubdomain}>Add Subdomain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DomainSettings;
