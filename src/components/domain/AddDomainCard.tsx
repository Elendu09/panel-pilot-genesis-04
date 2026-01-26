import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Copy, ArrowRight, Info, Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDnsRecordsForDomain, LOVABLE_IP } from "@/lib/hosting-config";

interface AddDomainCardProps {
  panelId: string;
  onDomainAdded: () => void;
}

export const AddDomainCard = ({ panelId, onDomainAdded }: AddDomainCardProps) => {
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [step, setStep] = useState<'input' | 'dns'>('input');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cleanDomain = (input: string) => {
    return input
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .trim();
  };

  const isValidDomain = (d: string) => {
    const pattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;
    return pattern.test(d);
  };

  const handleContinue = () => {
    const cleaned = cleanDomain(domain);
    if (!isValidDomain(cleaned)) {
      toast({ variant: "destructive", title: "Invalid domain format" });
      return;
    }
    setDomain(cleaned);
    setStep('dns');
  };

  const handleAddDomain = async () => {
    if (!domain || !panelId) return;
    
    setIsSubmitting(true);
    try {
      // Insert into panel_domains
      const { error: domainError } = await supabase
        .from('panel_domains')
        .insert({
          panel_id: panelId,
          domain: domain,
          is_primary: true,
          verification_status: 'pending',
          ssl_status: 'pending',
          hosting_provider: 'lovable',
          expected_target: LOVABLE_IP
        });

      if (domainError) throw domainError;

      // Also update panels.custom_domain
      const { error: panelError } = await supabase
        .from('panels')
        .update({
          custom_domain: domain,
          domain_verification_status: 'pending'
        })
        .eq('id', panelId);

      if (panelError) throw panelError;

      toast({ 
        title: "Domain added!", 
        description: "Configure your DNS records, then verification will happen automatically." 
      });
      
      setDomain("");
      setStep('input');
      onDomainAdded();
    } catch (error: any) {
      console.error('Error adding domain:', error);
      toast({ 
        variant: "destructive", 
        title: "Failed to add domain",
        description: error.message || "Please try again"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const dnsRecords = getDnsRecordsForDomain(domain || 'yourdomain.com', panelId);

  if (step === 'dns') {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            DNS Configuration
          </CardTitle>
          <CardDescription>
            Add these records at your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Domain being configured */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm">
              <strong>Configuring:</strong>{' '}
              <code className="bg-muted px-2 py-0.5 rounded">{domain}</code>
            </p>
          </div>

          {/* DNS Records */}
          <div className="space-y-3">
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
                    <code className="text-sm bg-background px-2 py-1 rounded">{record.name}</code>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <code className="text-sm bg-background px-2 py-1 rounded truncate max-w-[200px]">
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
                <p className="text-xs text-muted-foreground mt-2">{record.description}</p>
              </div>
            ))}
          </div>

          {/* Info Alert */}
          <Alert className="border-blue-500/20 bg-blue-500/5">
            <Info className="w-4 h-4 text-blue-500" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> DNS changes can take 24-48 hours to propagate. 
              Your domain will be automatically verified once DNS is configured correctly.
            </AlertDescription>
          </Alert>

          {/* Warning about nameservers */}
          <Alert className="border-amber-500/20 bg-amber-500/5">
            <Info className="w-4 h-4 text-amber-500" />
            <AlertDescription className="text-sm">
              <strong>Do NOT change your nameservers</strong> - this can break your email. 
              Only add the A and TXT records shown above.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setStep('input')}
            >
              Back
            </Button>
            <Button 
              onClick={handleAddDomain}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Domain & Start Verification
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Add Custom Domain
        </CardTitle>
        <CardDescription>
          Connect your own domain to use custom branding for your panel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="domain">Domain Name</Label>
          <Input
            id="domain"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="bg-background/50"
          />
          <p className="text-xs text-muted-foreground">
            Enter your domain without http:// or www (e.g., mysmmpanel.com)
          </p>
        </div>

        <Button 
          onClick={handleContinue}
          disabled={!domain.trim()}
          className="w-full"
        >
          Continue to DNS Setup
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddDomainCard;
