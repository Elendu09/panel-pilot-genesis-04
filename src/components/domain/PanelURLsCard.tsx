import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, ExternalLink, Copy, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PLATFORM_DOMAIN } from "@/lib/hosting-config";

interface PanelURLsCardProps {
  subdomain: string;
  customDomain?: string | null;
  customDomainStatus?: string;
  sslStatus?: string;
}

export const PanelURLsCard = ({ 
  subdomain, 
  customDomain, 
  customDomainStatus = 'pending',
  sslStatus = 'pending'
}: PanelURLsCardProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <AlertCircle className="w-3 h-3 mr-1" /> Error
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const subdomainUrl = `https://${subdomain}.${PLATFORM_DOMAIN}`;

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="w-5 h-5 text-primary" />
          Your Panel URLs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Default Subdomain - Always Active */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Default Subdomain</span>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" /> Live
                </Badge>
              </div>
              <code className="text-sm md:text-base font-mono mt-1 block truncate">
                {subdomain}.{PLATFORM_DOMAIN}
              </code>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(subdomainUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                asChild
              >
                <a href={subdomainUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Domain - If configured */}
        {customDomain && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">Custom Domain</span>
                  {getStatusBadge(customDomainStatus)}
                  {sslStatus === 'active' && (
                    <Badge variant="outline" className="text-xs">SSL Active</Badge>
                  )}
                </div>
                <code className="text-sm md:text-base font-mono mt-1 block truncate">
                  {customDomain}
                </code>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(`https://${customDomain}`)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                {customDomainStatus === 'verified' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    asChild
                  >
                    <a href={`https://${customDomain}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {!customDomain && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No custom domain configured. Add one below to use your own branding.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PanelURLsCard;
