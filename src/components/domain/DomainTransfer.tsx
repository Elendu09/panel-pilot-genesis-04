import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowRightLeft, 
  Copy, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileJson,
  Globe,
  Server
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VERCEL_A_RECORDS, VERCEL_CNAME, VERCEL_NAMESERVERS } from "@/lib/hosting-config";

interface DomainTransferProps {
  domain: {
    id: string;
    domain: string;
    panel_id: string;
    verification_status: string;
    ssl_status: string;
    hosting_provider?: string;
  };
  currentPanelId: string;
  onTransferComplete?: () => void;
}

interface Panel {
  id: string;
  name: string;
  subdomain: string;
}

export const DomainTransfer = ({ domain, currentPanelId, onTransferComplete }: DomainTransferProps) => {
  const { toast } = useToast();
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [targetPanelId, setTargetPanelId] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPanels = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('panels')
        .select('id, name, subdomain')
        .neq('id', currentPanelId)
        .eq('status', 'active');
      setPanels(data || []);
    } catch (error) {
      console.error('Error fetching panels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!targetPanelId) {
      toast({ variant: "destructive", title: "Please select a target panel" });
      return;
    }

    setTransferring(true);
    try {
      const { error } = await supabase
        .from('panel_domains')
        .update({ 
          panel_id: targetPanelId,
          verification_status: 'pending', // Reset verification after transfer
          verified_at: null
        })
        .eq('id', domain.id);

      if (error) throw error;

      toast({ 
        title: "Domain Transferred!", 
        description: `${domain.domain} has been moved to the new panel. Re-verification may be required.` 
      });
      setShowTransferDialog(false);
      onTransferComplete?.();
    } catch (error) {
      console.error('Transfer error:', error);
      toast({ variant: "destructive", title: "Transfer failed" });
    } finally {
      setTransferring(false);
    }
  };

  const generateDnsConfig = () => {
    const config = {
      domain: domain.domain,
      exportedAt: new Date().toISOString(),
      hostingProvider: domain.hosting_provider || 'vercel',
      records: {
        nameservers: VERCEL_NAMESERVERS,
        aRecords: [
          { host: "@", value: VERCEL_A_RECORDS[0], ttl: 3600 },
          { host: "www", value: VERCEL_A_RECORDS[0], ttl: 3600 }
        ],
        cnameRecords: [
          { host: "www", value: VERCEL_CNAME, ttl: 3600 }
        ]
      },
      status: {
        verification: domain.verification_status,
        ssl: domain.ssl_status
      }
    };
    return config;
  };

  const copyDnsConfig = () => {
    const config = generateDnsConfig();
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast({ title: "DNS configuration copied to clipboard" });
  };

  const downloadDnsConfig = () => {
    const config = generateDnsConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dns-config-${domain.domain.replace(/\./g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "DNS configuration downloaded" });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { setShowTransferDialog(true); fetchPanels(); }}
        >
          <ArrowRightLeft className="w-4 h-4 mr-1" /> Transfer
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowExportDialog(true)}
        >
          <Download className="w-4 h-4 mr-1" /> Export DNS
        </Button>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Transfer Domain
            </DialogTitle>
            <DialogDescription>
              Move <strong>{domain.domain}</strong> to a different panel
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                After transfer, the domain will need to be re-verified on the new panel.
                Make sure DNS is already pointing to the correct target.
              </AlertDescription>
            </Alert>

            <div>
              <Label>Select Target Panel</Label>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : panels.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  No other panels available for transfer
                </p>
              ) : (
                <Select value={targetPanelId} onValueChange={setTargetPanelId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a panel" />
                  </SelectTrigger>
                  <SelectContent>
                    {panels.map(panel => (
                      <SelectItem key={panel.id} value={panel.id}>
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4" />
                          {panel.name}
                          <span className="text-muted-foreground">({panel.subdomain})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={!targetPanelId || transferring}>
              {transferring ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Transfer Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export DNS Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-primary" />
              Export DNS Configuration
            </DialogTitle>
            <DialogDescription>
              Download or copy DNS settings for <strong>{domain.domain}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" /> DNS Records for Vercel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="font-medium">Type</div>
                  <div className="font-medium">Host</div>
                  <div className="font-medium">Value</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm bg-background p-2 rounded">
                  <Badge variant="outline">NS</Badge>
                  <code>@</code>
                  <code className="text-xs">{VERCEL_NAMESERVERS[0]}</code>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm bg-background p-2 rounded">
                  <Badge variant="outline">NS</Badge>
                  <code>@</code>
                  <code className="text-xs">{VERCEL_NAMESERVERS[1]}</code>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm bg-background p-2 rounded">
                  <Badge variant="outline">A</Badge>
                  <code>@</code>
                  <code>{VERCEL_A_RECORDS[0]}</code>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm bg-background p-2 rounded">
                  <Badge variant="outline">CNAME</Badge>
                  <code>www</code>
                  <code className="text-xs">{VERCEL_CNAME}</code>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">Current Status</p>
                <div className="flex gap-2 mt-1">
                  <Badge className={domain.verification_status === 'verified' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                    {domain.verification_status}
                  </Badge>
                  <Badge className={domain.ssl_status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                    SSL: {domain.ssl_status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={copyDnsConfig}>
              <Copy className="w-4 h-4 mr-2" /> Copy JSON
            </Button>
            <Button onClick={downloadDnsConfig}>
              <Download className="w-4 h-4 mr-2" /> Download JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DomainTransfer;
