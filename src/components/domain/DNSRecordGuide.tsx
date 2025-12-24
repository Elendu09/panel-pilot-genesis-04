import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Globe,
  Server,
  Mail,
  Shield,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl: string;
  required: boolean;
  description: string;
}

interface DNSRecordGuideProps {
  domain: string;
  verificationToken?: string;
}

export const DNSRecordGuide = ({ domain, verificationToken }: DNSRecordGuideProps) => {
  const { toast } = useToast();
  const [activeRecordType, setActiveRecordType] = useState("a");
  
  const LOVABLE_IP = "185.158.133.1";
  
  const dnsRecords: Record<string, DNSRecord[]> = {
    a: [
      {
        type: "A",
        name: "@",
        value: LOVABLE_IP,
        ttl: "3600",
        required: true,
        description: "Points your root domain to our servers"
      },
      {
        type: "A",
        name: "www",
        value: LOVABLE_IP,
        ttl: "3600",
        required: true,
        description: "Points www subdomain to our servers"
      }
    ],
    cname: [
      {
        type: "CNAME",
        name: "www",
        value: `${domain.replace('www.', '')}.`,
        ttl: "3600",
        required: false,
        description: "Alternative to A record for www (if your provider doesn't support A for subdomains)"
      }
    ],
    txt: [
      {
        type: "TXT",
        name: "_lovable",
        value: verificationToken ? `lovable_verify=${verificationToken}` : "lovable_verify=YOUR_TOKEN",
        ttl: "3600",
        required: true,
        description: "Verifies domain ownership"
      }
    ],
    mx: [
      {
        type: "MX",
        name: "@",
        value: "Your email provider's MX record",
        ttl: "3600",
        required: false,
        description: "For email delivery (if using email with this domain)"
      }
    ]
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  const recordTypeIcons: Record<string, React.ReactNode> = {
    a: <Server className="w-4 h-4" />,
    cname: <Globe className="w-4 h-4" />,
    txt: <Shield className="w-4 h-4" />,
    mx: <Mail className="w-4 h-4" />
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="border-blue-500/20 bg-blue-500/10">
        <Info className="w-4 h-4 text-blue-500" />
        <AlertDescription className="text-sm">
          Configure these DNS records at your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.). 
          Changes may take up to 48 hours to propagate globally.
        </AlertDescription>
      </Alert>

      {/* Domain Display */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Configuring DNS for</p>
              <p className="text-lg font-mono font-semibold">{domain}</p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Globe className="w-3 h-3" />
              Custom Domain
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Record Type Tabs */}
      <Tabs value={activeRecordType} onValueChange={setActiveRecordType}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="a" className="gap-2">
            <Server className="w-4 h-4" />
            A Record
          </TabsTrigger>
          <TabsTrigger value="cname" className="gap-2">
            <Globe className="w-4 h-4" />
            CNAME
          </TabsTrigger>
          <TabsTrigger value="txt" className="gap-2">
            <Shield className="w-4 h-4" />
            TXT
          </TabsTrigger>
          <TabsTrigger value="mx" className="gap-2">
            <Mail className="w-4 h-4" />
            MX
          </TabsTrigger>
        </TabsList>

        {Object.entries(dnsRecords).map(([type, records]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {records.map((record, index) => (
              <Card key={index} className={cn(
                "transition-all",
                record.required ? "border-primary/30" : "border-border/50"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {recordTypeIcons[type]}
                      {record.type} Record
                      {record.required && (
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">Required</Badge>
                      )}
                    </CardTitle>
                  </div>
                  <CardDescription>{record.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {/* Name/Host */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Name / Host</p>
                        <code className="text-sm font-mono">{record.name}</code>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(record.name, "Name")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Value/Points To */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Value / Points To</p>
                        <code className="text-sm font-mono break-all">{record.value}</code>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(record.value, "Value")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* TTL */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">TTL</p>
                        <code className="text-sm font-mono">{record.ttl}</code>
                        <span className="text-xs text-muted-foreground ml-2">(1 hour)</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(record.ttl, "TTL")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Setup Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Quick Setup Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">1</div>
              <span>Add A record for <code className="bg-muted px-1 rounded">@</code> pointing to <code className="bg-muted px-1 rounded">{LOVABLE_IP}</code></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">2</div>
              <span>Add A record for <code className="bg-muted px-1 rounded">www</code> pointing to <code className="bg-muted px-1 rounded">{LOVABLE_IP}</code></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">3</div>
              <span>Add TXT record for verification (if required)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">4</div>
              <span>Wait for DNS propagation (up to 48 hours)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">5</div>
              <span>Click "Verify" to check your configuration</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Links */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href="https://docs.lovable.dev/features/custom-domain" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Documentation
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            DNS Checker
          </a>
        </Button>
      </div>
    </div>
  );
};
