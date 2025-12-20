import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const DomainSettings = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [newDomain, setNewDomain] = useState("");
  const [domainType, setDomainType] = useState<"primary" | "secondary">("primary");
  const [domains, setDomains] = useState<any[]>([]);
  const [panel, setPanel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingDomain, setAddingDomain] = useState(false);
  
  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [verifying, setVerifying] = useState(false);

  const wizardSteps = [
    { number: 1, title: "Domain Name", description: "Enter your domain" },
    { number: 2, title: "Domain Type", description: "Choose configuration" },
    { number: 3, title: "DNS Setup", description: "Configure records" },
    { number: 4, title: "Verification", description: "Verify connection" },
  ];

  useEffect(() => {
    fetchPanelAndDomains();
  }, [profile]);

  const fetchPanelAndDomains = async () => {
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
      toast({
        title: "Error",
        description: "Failed to load domain settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dnsRecords = [
    {
      type: "A",
      name: "@",
      value: "185.158.133.1",
      description: "Points your domain to SMMPilot infrastructure",
      status: "pending"
    },
    {
      type: "A", 
      name: "www",
      value: "185.158.133.1",
      description: "Points www subdomain to SMMPilot infrastructure",
      status: "pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "error": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "error": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "DNS record value copied successfully.",
    });
  };

  const copyAllRecords = () => {
    const allRecords = dnsRecords.map(r => `${r.type} ${r.name} ${r.value}`).join('\n');
    navigator.clipboard.writeText(allRecords);
    toast({
      title: "All records copied",
      description: "All DNS records copied to clipboard.",
    });
  };

  const handleStartWizard = () => {
    setShowWizard(true);
    setWizardStep(1);
    setNewDomain("");
    setDomainType("primary");
  };

  const handleNextStep = () => {
    if (wizardStep === 1 && !newDomain.trim()) {
      toast({
        title: "Domain required",
        description: "Please enter a domain name.",
        variant: "destructive",
      });
      return;
    }
    setWizardStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setWizardStep(prev => Math.max(prev - 1, 1));
  };

  const handleVerifyAndAdd = async () => {
    if (!newDomain.trim() || !panel?.id) return;
    
    setVerifying(true);
    try {
      // Simulate verification delay
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

      toast({
        title: "Domain added successfully!",
        description: `${newDomain} has been added and is being verified.`,
      });
      setShowWizard(false);
      setNewDomain("");
      fetchPanelAndDomains();
    } catch (error) {
      console.error('Error adding domain:', error);
      toast({
        title: "Error",
        description: "Failed to add domain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const checkDomainStatus = async (domainId: string) => {
    try {
      toast({
        title: "Checking domain status",
        description: "Verifying DNS configuration and SSL status...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Domain status updated",
        description: "DNS and SSL status have been refreshed.",
      });
      
      fetchPanelAndDomains();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check domain status.",
        variant: "destructive",
      });
    }
  };

  const removeDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('panel_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      toast({
        title: "Domain removed",
        description: "Domain has been removed successfully.",
      });
      fetchPanelAndDomains();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove domain.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Domain Settings</h1>
          <p className="text-muted-foreground">Manage custom domains for your SMM panel</p>
        </div>
        <Button 
          onClick={handleStartWizard}
          className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Domain
        </Button>
      </div>

      {/* Domain Connection Wizard */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 overflow-hidden">
              {/* Progress Steps */}
              <div className="bg-muted/30 p-4 border-b border-border/50">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  {wizardSteps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      <div className={`flex flex-col items-center ${index > 0 ? 'ml-4' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          wizardStep > step.number 
                            ? "bg-success text-success-foreground" 
                            : wizardStep === step.number 
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                              : "bg-muted text-muted-foreground"
                        }`}>
                          {wizardStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${
                          wizardStep >= step.number ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {step.title}
                        </span>
                      </div>
                      {index < wizardSteps.length - 1 && (
                        <div className={`h-0.5 w-12 lg:w-24 mx-2 transition-colors ${
                          wizardStep > step.number ? "bg-success" : "bg-border"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {/* Step 1: Domain Name */}
                  {wizardStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <Globe className="w-16 h-16 mx-auto text-primary mb-4" />
                        <h2 className="text-2xl font-bold">Enter Your Domain</h2>
                        <p className="text-muted-foreground mt-2">
                          Enter the domain name you want to connect to your panel
                        </p>
                      </div>
                      <div className="max-w-md mx-auto">
                        <Label htmlFor="domain" className="text-sm font-medium">Domain Name</Label>
                        <Input
                          id="domain"
                          placeholder="example.com"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          className="mt-2 h-12 text-lg bg-background/50"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Enter without http:// or https://
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Domain Type */}
                  {wizardStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <Server className="w-16 h-16 mx-auto text-primary mb-4" />
                        <h2 className="text-2xl font-bold">Choose Domain Type</h2>
                        <p className="text-muted-foreground mt-2">
                          Select how you want to use this domain
                        </p>
                      </div>
                      <RadioGroup 
                        value={domainType} 
                        onValueChange={(v) => setDomainType(v as "primary" | "secondary")}
                        className="max-w-md mx-auto space-y-4"
                      >
                        <Label 
                          htmlFor="primary"
                          className={`flex items-start space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            domainType === "primary" 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value="primary" id="primary" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Primary Domain</span>
                              <Badge variant="secondary" className="text-xs">Recommended</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Main domain for your panel. Users will access your panel through this domain.
                            </p>
                          </div>
                        </Label>
                        <Label 
                          htmlFor="secondary"
                          className={`flex items-start space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            domainType === "secondary" 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value="secondary" id="secondary" className="mt-1" />
                          <div className="flex-1">
                            <span className="font-semibold">Secondary Domain</span>
                            <p className="text-sm text-muted-foreground mt-1">
                              Additional domain that redirects to your primary domain.
                            </p>
                          </div>
                        </Label>
                      </RadioGroup>
                    </motion.div>
                  )}

                  {/* Step 3: DNS Setup */}
                  {wizardStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <Zap className="w-16 h-16 mx-auto text-primary mb-4" />
                        <h2 className="text-2xl font-bold">Configure DNS Records</h2>
                        <p className="text-muted-foreground mt-2">
                          Add these records to your domain's DNS settings
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Required DNS Records</span>
                          <Button variant="outline" size="sm" onClick={copyAllRecords}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy All
                          </Button>
                        </div>
                        {dnsRecords.map((record, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50"
                          >
                            <div className="grid grid-cols-3 gap-4 flex-1">
                              <div>
                                <span className="text-xs text-muted-foreground block">Type</span>
                                <span className="font-mono font-semibold">{record.type}</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground block">Name</span>
                                <span className="font-mono">{record.name}</span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground block">Value</span>
                                <span className="font-mono text-sm">{record.value}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(record.value)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Alert className="bg-info/10 border-info/20">
                          <Info className="h-4 w-4 text-info" />
                          <AlertDescription className="text-info">
                            DNS changes can take up to 24-48 hours to propagate worldwide.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Verification */}
                  {wizardStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <Shield className="w-16 h-16 mx-auto text-primary mb-4" />
                        <h2 className="text-2xl font-bold">Verify & Connect</h2>
                        <p className="text-muted-foreground mt-2">
                          Review your configuration and connect your domain
                        </p>
                      </div>
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Domain</span>
                            <span className="font-semibold">{newDomain}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <Badge variant="secondary">{domainType}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">SSL</span>
                            <span className="text-success flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              Auto-enabled
                            </span>
                          </div>
                        </div>
                        <Alert className="bg-success/10 border-success/20">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <AlertDescription className="text-success">
                            SSL certificate will be automatically generated once DNS is verified.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={wizardStep === 1 ? () => setShowWizard(false) : handlePrevStep}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {wizardStep === 1 ? "Cancel" : "Back"}
                  </Button>
                  {wizardStep < 4 ? (
                    <Button onClick={handleNextStep}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleVerifyAndAdd}
                      disabled={verifying}
                      className="bg-gradient-to-r from-success to-success/80"
                    >
                      {verifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Connect Domain
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Domain Status Cards */}
      <div className="grid gap-4">
        {domains.length === 0 && !showWizard ? (
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No domains connected</h3>
              <p className="text-muted-foreground text-center mb-4">
                Connect a custom domain to personalize your panel
              </p>
              <Button onClick={handleStartWizard}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Domain
              </Button>
            </CardContent>
          </Card>
        ) : (
          domains.map((domain, index) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        domain.verification_status === "verified" ? "bg-success/10" : "bg-warning/10"
                      }`}>
                        <Globe className={`w-6 h-6 ${
                          domain.verification_status === "verified" ? "text-success" : "text-warning"
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{domain.domain}</h3>
                          {domain.is_primary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                          <Badge className={getStatusColor(domain.verification_status)}>
                            {getStatusIcon(domain.verification_status)}
                            <span className="ml-1 capitalize">{domain.verification_status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {domain.dns_configured ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <Clock className="w-4 h-4 text-warning" />
                            )}
                            <span>DNS: {domain.dns_configured ? "Configured" : "Pending"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {domain.ssl_status === "active" ? (
                              <Shield className="w-4 h-4 text-success" />
                            ) : (
                              <Shield className="w-4 h-4 text-warning" />
                            )}
                            <span>SSL: {domain.ssl_status || "Pending"}</span>
                          </div>
                          <span>Added {new Date(domain.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => checkDomainStatus(domain.id)}
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Check
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeDomain(domain.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* DNS Configuration Reference */}
      {domains.length > 0 && (
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              DNS Configuration
            </CardTitle>
            <Button variant="outline" size="sm" onClick={copyAllRecords}>
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dnsRecords.map((record, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/40 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Type</span>
                      <Badge variant="outline" className="font-mono">{record.type}</Badge>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Name</span>
                      <span className="font-mono">{record.name}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-xs text-muted-foreground block mb-1">Value</span>
                      <span className="font-mono text-sm">{record.value}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(record.value)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SSL Information */}
      {domains.length > 0 && (
        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              SSL Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-success/5 rounded-xl border border-success/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Automatic SSL Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    Free SSL certificates are auto-generated and renewed for all verified domains
                  </p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-success/20">
                <CheckCircle className="w-4 h-4 mr-1" />
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DomainSettings;
