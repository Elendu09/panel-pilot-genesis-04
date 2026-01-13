import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Globe, 
  Copy, 
  CheckCircle, 
  ArrowRight,
  Loader2,
  AlertTriangle,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleDomainSetupProps {
  panelId: string;
  onDomainAdded?: () => void;
}

interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT';
  name: string;
  value: string;
  description: string;
}

export const SimpleDomainSetup = ({ panelId, onDomainAdded }: SimpleDomainSetupProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [verificationToken, setVerificationToken] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'error'>('pending');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const handleAddDomain = async () => {
    if (!domain.trim()) {
      toast({ variant: "destructive", title: "Please enter a domain" });
      return;
    }

    // Basic domain validation
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    const cleanDomain = domain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    
    if (!domainPattern.test(cleanDomain) && !cleanDomain.includes('.')) {
      toast({ variant: "destructive", title: "Invalid domain format", description: "Enter a domain like: example.com" });
      return;
    }

    setIsAdding(true);
    try {
      // Call edge function to add domain
      const { data, error } = await supabase.functions.invoke('add-vercel-domain', {
        body: { domain: cleanDomain, panel_id: panelId }
      });

      if (error) throw error;

      // Set DNS records from response
      const records: DnsRecord[] = [
        { type: 'A', name: '@', value: '76.76.21.21', description: 'Root domain' },
        { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', description: 'www subdomain' },
        { type: 'TXT', name: '_homeofsmm', value: data.dns_records?.find((r: any) => r.type === 'TXT')?.value || `homeofsmm-verify=${data.verification_token}`, description: 'Ownership verification' },
      ];
      
      setDnsRecords(records);
      setVerificationToken(data.verification_token);
      setDomain(cleanDomain);
      setStep(2);
      
      toast({ 
        title: "Domain added!", 
        description: "Now add the DNS records at your domain registrar." 
      });
    } catch (error: any) {
      console.error('Error adding domain:', error);
      toast({ variant: "destructive", title: "Failed to add domain", description: error.message });
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async () => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain-dns', {
        body: { domain, panel_id: panelId }
      });

      if (error) throw error;

      if (data.verified || data.dns_ok) {
        setVerificationStatus('verified');
        setStep(3);
        toast({ title: "Domain Verified!", description: "Your domain is now connected." });
        onDomainAdded?.();
      } else {
        setVerificationStatus('pending');
        toast({ 
          variant: "destructive", 
          title: "DNS not configured yet", 
          description: "Records not found. DNS changes can take up to 48 hours to propagate." 
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      toast({ variant: "destructive", title: "Verification failed", description: error.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const steps = [
    { number: 1, label: "Enter Domain" },
    { number: 2, label: "Add DNS Records" },
    { number: 3, label: "Done!" },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Connect Your Domain
        </CardTitle>
        <CardDescription>
          Use your own domain for your SMM panel in 3 simple steps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step >= s.number 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {step > s.number ? <CheckCircle className="w-4 h-4" /> : s.number}
              </div>
              <span className={cn(
                "text-xs ml-2 hidden sm:block",
                step >= s.number ? "text-foreground" : "text-muted-foreground"
              )}>
                {s.label}
              </span>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 md:w-24 h-0.5 mx-2",
                  step > s.number ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Enter Domain */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Domain</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, ''))}
                  className="flex-1"
                />
                <Button onClick={handleAddDomain} disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your domain without http:// or www (e.g., mysmmpanel.com)
              </p>
            </div>

            <Alert className="border-blue-500/30 bg-blue-500/5">
              <Globe className="w-4 h-4 text-blue-500" />
              <AlertDescription className="text-sm">
                <strong>Don't have a domain?</strong> You can purchase one from{" "}
                <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Namecheap
                </a>,{" "}
                <a href="https://www.porkbun.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Porkbun
                </a>, or{" "}
                <a href="https://domains.google" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google Domains
                </a>.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step 2: DNS Records */}
        {step === 2 && (
          <div className="space-y-4">
            <Alert className="border-amber-500/30 bg-amber-500/5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <AlertDescription className="text-sm">
                <strong>Important:</strong> Only add the records below. Do NOT change your nameservers!
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add these DNS records at your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):
              </p>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Value</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dnsRecords.map((record, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">
                          <Badge variant="outline">{record.type}</Badge>
                        </td>
                        <td className="p-3">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{record.name}</code>
                        </td>
                        <td className="p-3">
                          <code className="text-xs bg-muted px-2 py-1 rounded break-all">{record.value}</code>
                        </td>
                        <td className="p-3">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(record.value, record.type + ' record')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleVerifyDomain} disabled={isVerifying}>
                {isVerifying ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Verify DNS
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              DNS changes can take up to 48 hours to propagate. You can verify later from Domain Settings.
            </p>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Domain Connected!</h3>
              <p className="text-muted-foreground">
                Your domain <code className="bg-muted px-2 py-1 rounded">{domain}</code> is now active.
              </p>
            </div>
            <Button asChild>
              <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> Visit Your Panel
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
