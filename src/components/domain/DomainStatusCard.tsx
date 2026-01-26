import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Trash2, 
  RefreshCw,
  Copy,
  ArrowRight,
  Loader2,
  Shield,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDnsRecordsForDomain, LOVABLE_IP } from "@/lib/hosting-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DomainStatusCardProps {
  domainId: string;
  domain: string;
  panelId: string;
  verificationStatus: string;
  sslStatus: string;
  onRemove: () => void;
  onVerified: () => void;
}

export const DomainStatusCard = ({
  domainId,
  domain,
  panelId,
  verificationStatus,
  sslStatus,
  onRemove,
  onVerified
}: DomainStatusCardProps) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showDnsRecords, setShowDnsRecords] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      // Check domain health
      const { data, error } = await supabase.functions.invoke("domain-health-check", {
        body: { 
          domain,
          expectedTarget: LOVABLE_IP
        }
      });

      if (error) throw error;

      const dnsOk = data?.dns_ok || false;
      const httpsOk = data?.https_ok || false;

      // Update domain status
      await supabase
        .from('panel_domains')
        .update({
          verification_status: dnsOk ? 'verified' : 'pending',
          ssl_status: httpsOk ? 'active' : 'pending',
          dns_configured: dnsOk,
          verified_at: dnsOk ? new Date().toISOString() : null
        })
        .eq('id', domainId);

      // Update panel
      await supabase
        .from('panels')
        .update({
          domain_verification_status: dnsOk ? 'verified' : 'pending',
          ssl_status: httpsOk ? 'active' : 'pending'
        })
        .eq('id', panelId);

      if (dnsOk && httpsOk) {
        toast({ title: "Domain Verified!", description: "Your domain is active with SSL." });
        onVerified();
      } else if (dnsOk) {
        toast({ 
          title: "DNS Verified", 
          description: "SSL is still provisioning. This may take a few minutes." 
        });
        onVerified();
      } else {
        toast({ 
          variant: "destructive",
          title: "DNS Not Configured", 
          description: `Expected A record pointing to ${LOVABLE_IP}. Found: ${data?.a_records?.join(', ') || 'none'}`
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({ variant: "destructive", title: "Verification failed" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      // Remove from panel_domains
      await supabase
        .from('panel_domains')
        .delete()
        .eq('id', domainId);

      // Clear from panels
      await supabase
        .from('panels')
        .update({
          custom_domain: null,
          domain_verification_status: null
        })
        .eq('id', panelId);

      toast({ title: "Domain removed" });
      onRemove();
    } catch (error) {
      console.error('Error removing domain:', error);
      toast({ variant: "destructive", title: "Failed to remove domain" });
    } finally {
      setIsRemoving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const isVerified = verificationStatus === 'verified';
  const isSslActive = sslStatus === 'active';
  const dnsRecords = getDnsRecordsForDomain(domain, panelId);

  return (
    <Card className={`glass-card ${isVerified ? 'border-green-500/20' : 'border-yellow-500/20'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Custom Domain Status
            </CardTitle>
            <CardDescription>
              <code className="text-foreground">{domain}</code>
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Domain?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove <strong>{domain}</strong> from your panel. 
                  Your panel will only be accessible via the default subdomain.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleRemove}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isRemoving}
                >
                  {isRemoving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Remove Domain
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              {isVerified ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Clock className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium">DNS Status</span>
            </div>
            <Badge 
              className={isVerified 
                ? "bg-green-500/10 text-green-500 border-green-500/20" 
                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
              }
            >
              {isVerified ? 'Verified' : 'Pending'}
            </Badge>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Shield className={`w-4 h-4 ${isSslActive ? 'text-green-500' : 'text-yellow-500'}`} />
              <span className="text-sm font-medium">SSL Status</span>
            </div>
            <Badge 
              className={isSslActive 
                ? "bg-green-500/10 text-green-500 border-green-500/20" 
                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
              }
            >
              {isSslActive ? 'Active' : 'Pending'}
            </Badge>
          </div>
        </div>

        {/* Pending Instructions */}
        {!isVerified && (
          <Alert className="border-yellow-500/20 bg-yellow-500/5">
            <Clock className="w-4 h-4 text-yellow-500" />
            <AlertDescription className="text-sm">
              Your domain is pending verification. Make sure you've added the required DNS records at your registrar.
              DNS changes can take up to 48 hours to propagate.
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {isVerified && isSslActive && (
          <Alert className="border-green-500/20 bg-green-500/5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <AlertDescription className="text-sm">
              Your domain is fully configured and SSL is active! 
              Your panel is now accessible at <strong>https://{domain}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* DNS Records Collapsible */}
        <Collapsible open={showDnsRecords} onOpenChange={setShowDnsRecords}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                View Required DNS Records
              </span>
              <ArrowRight className={`w-4 h-4 transition-transform ${showDnsRecords ? 'rotate-90' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-3">
            {dnsRecords.map((record, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
                    <Badge 
                      variant="outline" 
                      className={record.type === 'A' 
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }
                    >
                      {record.type}
                    </Badge>
                    <code className="text-xs bg-background px-2 py-1 rounded">{record.name}</code>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <code className="text-xs bg-background px-2 py-1 rounded truncate max-w-[150px]">
                      {record.value}
                    </code>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(record.value)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Verify Button */}
        <Button 
          onClick={handleVerify}
          disabled={isVerifying}
          variant={isVerified ? "outline" : "default"}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {isVerified ? 'Re-verify Domain' : 'Verify Domain Now'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DomainStatusCard;
