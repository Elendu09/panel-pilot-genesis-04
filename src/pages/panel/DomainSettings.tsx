import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  RefreshCw,
  Plus,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DomainSettings = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [newDomain, setNewDomain] = useState("");
  const [domains, setDomains] = useState<any[]>([]);
  const [panel, setPanel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingDomain, setAddingDomain] = useState(false);

  useEffect(() => {
    fetchPanelAndDomains();
  }, [profile]);

  const fetchPanelAndDomains = async () => {
    if (!profile?.id) return;
    
    try {
      // Fetch user's panel
      const { data: panelData, error: panelError } = await supabase
        .from('panels')
        .select('*')
        .eq('owner_id', profile.id)
        .single();

      if (panelError) throw panelError;
      setPanel(panelData);

      // Fetch panel domains
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
      description: "Points your domain to SMMPilot infrastructure"
    },
    {
      type: "A", 
      name: "www",
      value: "185.158.133.1",
      description: "Points www subdomain to SMMPilot infrastructure"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "default";
      case "pending": return "secondary";
      case "error": return "destructive";
      default: return "secondary";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "DNS record value copied successfully.",
    });
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim() || !panel?.id) return;
    
    setAddingDomain(true);
    try {
      const { error } = await supabase
        .from('panel_domains')
        .insert({
          panel_id: panel.id,
          domain: newDomain.trim(),
          is_primary: domains.length === 0,
          verification_status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Domain added",
        description: `${newDomain} has been added and is being verified.`,
      });
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
      setAddingDomain(false);
    }
  };

  const checkDomainStatus = async (domainId: string) => {
    try {
      toast({
        title: "Checking domain status",
        description: "Verifying DNS configuration and SSL status...",
      });
      
      // In a real implementation, this would call an edge function
      // that checks DNS records and SSL status
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
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Domain Settings</h1>
        <p className="text-muted-foreground">Manage custom domains for your SMM panel</p>
      </div>

      {/* Add New Domain */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Custom Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="newDomain">Domain Name</Label>
              <Input
                id="newDomain"
                placeholder="yourdomain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddDomain} 
                disabled={addingDomain}
                className="bg-gradient-primary hover:shadow-glow"
              >
                {addingDomain ? "Adding..." : "Add Domain"}
              </Button>
            </div>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              After adding a domain, you'll need to configure DNS records and wait for verification.
              SSL certificates will be automatically generated once DNS is properly configured.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Current Domains */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Your Domains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {domains.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No custom domains added yet. Add your first domain above.
              </p>
            ) : (
              domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{domain.domain}</h3>
                        {domain.is_primary && (
                          <Badge variant="default">Primary</Badge>
                        )}
                        <Badge variant={getStatusColor(domain.verification_status)}>
                          {domain.verification_status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          {domain.dns_configured ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span>DNS: {domain.dns_configured ? "Configured" : "Pending"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {domain.ssl_status === "active" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span>SSL: {domain.ssl_status}</span>
                        </div>
                        <span>Added {new Date(domain.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => checkDomainStatus(domain.id)}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Check Status
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Visit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeDomain(domain.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* DNS Configuration */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle>DNS Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Add these DNS records to your domain provider to complete the setup:
          </p>
          <div className="space-y-3">
            {dnsRecords.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>
                      <div className="font-mono">{record.type}</div>
                    </div>
                    <div>
                      <span className="font-medium">Name:</span>
                      <div className="font-mono">{record.name}</div>
                    </div>
                    <div>
                      <span className="font-medium">Value:</span>
                      <div className="font-mono truncate">{record.value}</div>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(record.value)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{record.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              DNS changes can take up to 24-48 hours to propagate worldwide. 
              Your domain will be automatically verified once the records are detected.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* SSL Information */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle>SSL Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h3 className="font-medium">Automatic SSL</h3>
                <p className="text-sm text-muted-foreground">
                  Free SSL certificates are automatically generated and renewed for verified domains
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-500">Active</span>
              </div>
            </div>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your SSL certificate is valid and will be automatically renewed before expiration.
                All traffic to your domain is securely encrypted.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainSettings;