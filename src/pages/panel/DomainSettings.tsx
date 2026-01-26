import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Info,
  Loader2,
  ExternalLink,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PanelURLsCard } from "@/components/domain/PanelURLsCard";
import { AddDomainCard } from "@/components/domain/AddDomainCard";
import { DomainStatusCard } from "@/components/domain/DomainStatusCard";
import { DomainDiagnostics } from "@/components/domain/DomainDiagnostics";
import { DomainTroubleshootingGuide } from "@/components/domain/DomainTroubleshootingGuide";
import { LOVABLE_IP, PLATFORM_DOMAIN } from "@/lib/hosting-config";

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
  const [customDomain, setCustomDomain] = useState<PanelDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  // Auto-verify pending domain every 30 seconds
  useEffect(() => {
    if (!customDomain || customDomain.verification_status === 'verified') return;

    const interval = setInterval(() => {
      verifyDomainSilently();
    }, 30000);

    return () => clearInterval(interval);
  }, [customDomain]);

  const fetchData = async () => {
    if (!profile?.id) return;
    
    try {
      // Fetch panel
      const { data: panelData, error: panelError } = await supabase
        .from('panels')
        .select('*')
        .eq('owner_id', profile.id)
        .maybeSingle();

      if (panelError) throw panelError;
      setPanel(panelData);

      if (panelData) {
        // Fetch custom domain (one per panel)
        const { data: domainsData, error: domainsError } = await supabase
          .from('panel_domains')
          .select('*')
          .eq('panel_id', panelData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (domainsError && domainsError.code !== 'PGRST116') throw domainsError;
        setCustomDomain(domainsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyDomainSilently = async () => {
    if (!customDomain || !panel?.id) return;

    try {
      const { data } = await supabase.functions.invoke("domain-health-check", {
        body: { 
          domain: customDomain.domain,
          expectedTarget: LOVABLE_IP
        }
      });

      if (data?.dns_ok) {
        await supabase
          .from('panel_domains')
          .update({
            verification_status: 'verified',
            ssl_status: data.https_ok ? 'active' : 'pending',
            dns_configured: true,
            verified_at: new Date().toISOString()
          })
          .eq('id', customDomain.id);

        await supabase
          .from('panels')
          .update({
            domain_verification_status: 'verified',
            ssl_status: data.https_ok ? 'active' : 'pending'
          })
          .eq('id', panel.id);

        toast({
          title: "Domain Verified!",
          description: `${customDomain.domain} is now ${data.https_ok ? 'fully active' : 'verified (SSL pending)'}.`
        });

        await fetchData();
      }
    } catch (error) {
      // Silent failure - will retry
    }
  };

  const handleDomainAdded = () => {
    fetchData();
  };

  const handleDomainRemoved = () => {
    setCustomDomain(null);
    fetchData();
  };

  const handleDomainVerified = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-48 bg-muted rounded-xl"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    );
  }

  if (!panel) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Panel Found</h3>
          <p className="text-muted-foreground text-sm">
            You need to create a panel first before configuring domains.
          </p>
        </div>
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
        <p className="text-muted-foreground text-sm md:text-base">
          Configure your panel's domain and branding
        </p>
      </motion.div>

      {/* Section 1: Your Panel URLs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <PanelURLsCard
          subdomain={panel.subdomain}
          customDomain={customDomain?.domain}
          customDomainStatus={customDomain?.verification_status}
          sslStatus={customDomain?.ssl_status}
        />
      </motion.div>

      {/* Section 2: Add/Manage Custom Domain */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {!customDomain ? (
          <AddDomainCard 
            panelId={panel.id}
            onDomainAdded={handleDomainAdded}
          />
        ) : (
          <DomainStatusCard
            domainId={customDomain.id}
            domain={customDomain.domain}
            panelId={panel.id}
            verificationStatus={customDomain.verification_status}
            sslStatus={customDomain.ssl_status}
            onRemove={handleDomainRemoved}
            onVerified={handleDomainVerified}
          />
        )}
      </motion.div>

      {/* Collapsible: Diagnostics */}
      <Collapsible open={showDiagnostics} onOpenChange={setShowDiagnostics}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Domain Diagnostics
            </span>
            <Badge variant="outline" className="ml-2">
              {showDiagnostics ? 'Hide' : 'Show'}
            </Badge>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <DomainDiagnostics
            panelSubdomain={panel.subdomain}
            customDomains={customDomain ? [{ domain: customDomain.domain, verification_status: customDomain.verification_status }] : []}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Collapsible: Help Section */}
      <Collapsible open={showHelp} onOpenChange={setShowHelp}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Need Help?
            </span>
            <Badge variant="outline" className="ml-2">
              {showHelp ? 'Hide' : 'Show'}
            </Badge>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <DomainTroubleshootingGuide domain={customDomain?.domain} />
        </CollapsibleContent>
      </Collapsible>

      {/* Quick Info */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="w-4 h-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>DNS Target:</strong> All domains should point to{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{LOVABLE_IP}</code>{' '}
          using an A record. DNS changes can take 24-48 hours to propagate.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DomainSettings;
