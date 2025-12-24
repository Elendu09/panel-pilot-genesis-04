import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, ArrowRight, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDnsRecordsForProvider, type HostingProvider, type DnsRecord } from "@/lib/hosting-config";

interface DnsRecordsDisplayProps {
  provider: HostingProvider;
  domain: string;
  customTarget?: string;
}

export const DnsRecordsDisplay = ({ provider, domain, customTarget }: DnsRecordsDisplayProps) => {
  const { toast } = useToast();
  const records = getDnsRecordsForProvider(provider, domain, customTarget);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  if (records.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">
            {provider === 'custom' 
              ? "Enter your custom server IP or hostname to see required DNS records."
              : "No DNS records configured for this provider."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Server className="w-5 h-5 text-primary" />
          Required DNS Records
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {records.map((record, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
          >
            <div className="flex items-center gap-4 flex-wrap">
              <Badge 
                variant="outline" 
                className={
                  record.type === 'A' 
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                    : record.type === 'CNAME'
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                }
              >
                {record.type}
              </Badge>
              <code className="text-sm font-mono bg-background px-2 py-1 rounded">{record.host}</code>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <code className="text-sm font-mono bg-background px-2 py-1 rounded max-w-[200px] truncate">
                {record.value}
              </code>
              {record.required && (
                <Badge variant="outline" className="text-xs">Required</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(record.value)}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        <p className="text-xs text-muted-foreground pt-2">
          <strong>For domain:</strong> {domain || 'yourdomain.com'}
        </p>
      </CardContent>
    </Card>
  );
};

export default DnsRecordsDisplay;
