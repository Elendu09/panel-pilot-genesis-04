import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Shield,
  Server
} from 'lucide-react';
import { toast } from 'sonner';
import { getDnsConfigForDomain, buildTenantUrl, isValidSubdomain, LOVABLE_IP } from '@/lib/tenant-domain-config';

interface TenantDomainSetupProps {
  panelId: string;
  currentSubdomain: string;
  currentCustomDomain?: string;
  verificationToken: string;
  onDomainUpdate?: (domain: string, type: 'subdomain' | 'custom') => void;
}

export function TenantDomainSetup({
  panelId,
  currentSubdomain,
  currentCustomDomain,
  verificationToken,
  onDomainUpdate
}: TenantDomainSetupProps) {
  const [customDomain, setCustomDomain] = useState(currentCustomDomain || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | null>(null);
  
  const dnsConfig = getDnsConfigForDomain(customDomain || 'yourdomain.com', verificationToken);
  const subdomainUrl = buildTenantUrl(currentSubdomain);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleVerifyDomain = async () => {
    if (!customDomain) {
      toast.error('Please enter a domain');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('pending');

    try {
      // Call the domain health check function
      const response = await fetch(`https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/domain-health-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: customDomain,
          hosting_provider: 'lovable',
          panel_id: panelId
        })
      });

      const result = await response.json();
      
      if (result.dns_ok) {
        setVerificationStatus('verified');
        toast.success('Domain DNS verified successfully!');
        onDomainUpdate?.(customDomain, 'custom');
      } else {
        setVerificationStatus('failed');
        toast.error('DNS not configured correctly. Please check your records.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('failed');
      toast.error('Failed to verify domain');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subdomain Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Your Panel Subdomain
          </CardTitle>
          <CardDescription>
            This subdomain is automatically configured and ready to use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <Globe className="h-5 w-5 text-primary" />
            <code className="flex-1 font-mono text-sm">{subdomainUrl}</code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(subdomainUrl, 'Subdomain URL')}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(subdomainUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Your Panel
          </Button>
        </CardContent>
      </Card>

      {/* Custom Domain Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Custom Domain (Optional)
          </CardTitle>
          <CardDescription>
            Connect your own domain to your SMM panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Your Custom Domain</Label>
            <div className="flex gap-2">
              <Input
                placeholder="mypanel.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
              />
              <Button
                onClick={handleVerifyDomain}
                disabled={isVerifying || !customDomain}
              >
                {isVerifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Verify'
                )}
              </Button>
            </div>
            {verificationStatus === 'verified' && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Domain Verified
              </Badge>
            )}
            {verificationStatus === 'failed' && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Verification Failed
              </Badge>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Add the DNS records below at your domain registrar before verifying.
              DNS changes can take up to 48 hours to propagate.
            </AlertDescription>
          </Alert>

          {/* DNS Records Table */}
          <div className="space-y-3">
            <h4 className="font-medium">Required DNS Records</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Host</th>
                    <th className="px-3 py-2 text-left">Value</th>
                    <th className="px-3 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dnsConfig.records.map((record, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">
                        <Badge variant="outline">{record.type}</Badge>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{record.host}</td>
                      <td className="px-3 py-2 font-mono text-xs truncate max-w-[200px]">
                        {record.value}
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(record.value, `${record.type} record`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registrar-Specific Instructions */}
          <Tabs defaultValue="namecheap" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="namecheap">Namecheap</TabsTrigger>
              <TabsTrigger value="godaddy">GoDaddy</TabsTrigger>
              <TabsTrigger value="cloudflare">Cloudflare</TabsTrigger>
            </TabsList>
            
            {Object.entries(dnsConfig.instructions).map(([provider, steps]) => (
              <TabsContent key={provider} value={provider} className="space-y-2">
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </TabsContent>
            ))}
          </Tabs>

          {/* Lovable Note */}
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <Globe className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm">
              <strong>Lovable Hosting:</strong> Your panel is hosted on Lovable's infrastructure.
              All domains must point A records to <code className="bg-blue-500/10 px-1 rounded">{LOVABLE_IP}</code>.
              <br />
              <span className="text-muted-foreground">
                Note: Wildcard domains via nameservers are not supported by Lovable.
                Each subdomain must be added individually.
              </span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
