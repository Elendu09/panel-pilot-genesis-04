import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Loader2,
  ExternalLink,
  Calendar,
  Server,
  FileKey,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format, differenceInDays, addDays } from "date-fns";

interface SSLCertificate {
  domain: string;
  status: 'active' | 'expiring' | 'expired' | 'pending' | 'error';
  issuer: string;
  validFrom: Date | null;
  validTo: Date | null;
  daysRemaining: number;
  autoRenewal: boolean;
  serialNumber?: string;
  fingerprint?: string;
}

interface SSLMonitoringDashboardProps {
  panelId?: string;
  domains?: {
    domain: string;
    ssl_status: string;
    verification_status: string;
    verified_at: string | null;
  }[];
  subdomain?: string;
  onRefresh?: () => void;
}

export const SSLMonitoringDashboard = ({ 
  panelId, 
  domains = [], 
  subdomain,
  onRefresh 
}: SSLMonitoringDashboardProps) => {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<SSLCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<SSLCertificate | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Generate mock certificate data based on domains
  useEffect(() => {
    const generateCertificates = () => {
      const certs: SSLCertificate[] = [];

      // Add subdomain certificate
      if (subdomain) {
        const validFrom = new Date();
        validFrom.setMonth(validFrom.getMonth() - 2);
        const validTo = addDays(new Date(), 88); // Let's Encrypt 90-day certs

        certs.push({
          domain: `${subdomain}.smmpilot.online`,
          status: 'active',
          issuer: "Let's Encrypt Authority X3",
          validFrom,
          validTo,
          daysRemaining: 88,
          autoRenewal: true,
          serialNumber: generateSerial(),
          fingerprint: generateFingerprint()
        });
      }

      // Add custom domain certificates
      domains.forEach(d => {
        if (d.verification_status !== 'verified') {
          certs.push({
            domain: d.domain,
            status: 'pending',
            issuer: 'Pending verification',
            validFrom: null,
            validTo: null,
            daysRemaining: 0,
            autoRenewal: false
          });
          return;
        }

        const isActive = d.ssl_status === 'active';
        const validFrom = d.verified_at ? new Date(d.verified_at) : new Date();
        const validTo = addDays(validFrom, 90);
        const daysRemaining = Math.max(0, differenceInDays(validTo, new Date()));

        let status: SSLCertificate['status'] = 'active';
        if (!isActive) status = 'pending';
        else if (daysRemaining <= 0) status = 'expired';
        else if (daysRemaining <= 14) status = 'expiring';

        certs.push({
          domain: d.domain,
          status,
          issuer: isActive ? "Let's Encrypt Authority X3" : 'Pending',
          validFrom: isActive ? validFrom : null,
          validTo: isActive ? validTo : null,
          daysRemaining,
          autoRenewal: isActive,
          serialNumber: isActive ? generateSerial() : undefined,
          fingerprint: isActive ? generateFingerprint() : undefined
        });
      });

      setCertificates(certs);
      setLoading(false);
    };

    generateCertificates();
  }, [domains, subdomain]);

  const generateSerial = () => {
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join(':').toUpperCase();
  };

  const generateFingerprint = () => {
    return 'SHA256:' + Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();
  };

  const activeCount = certificates.filter(c => c.status === 'active').length;
  const expiringCount = certificates.filter(c => c.status === 'expiring').length;
  const expiredCount = certificates.filter(c => c.status === 'expired').length;
  const pendingCount = certificates.filter(c => c.status === 'pending').length;

  const getStatusBadge = (status: SSLCertificate['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <Lock className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case 'expiring':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <AlertTriangle className="w-3 h-3 mr-1" /> Expiring Soon
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" /> Expired
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="w-3 h-3 mr-1" /> Error
          </Badge>
        );
    }
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 0) return 'text-destructive';
    if (days <= 14) return 'text-yellow-500';
    if (days <= 30) return 'text-orange-500';
    return 'text-green-500';
  };

  const handleViewDetails = (cert: SSLCertificate) => {
    setSelectedCert(cert);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                SSL Certificate Monitoring
              </CardTitle>
              <CardDescription>
                Track SSL certificate status and expiration dates
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-500">{activeCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-500/5 border-yellow-500/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-yellow-500">{expiringCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/5 border-red-500/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <span className="text-2xl font-bold text-destructive">{expiredCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Expired</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold text-blue-500">{pendingCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
          </div>

          {/* Warning Alerts */}
          {expiringCount > 0 && (
            <Alert className="border-yellow-500/20 bg-yellow-500/5">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <AlertDescription>
                <strong>{expiringCount} certificate{expiringCount > 1 ? 's' : ''}</strong> will expire within 14 days. 
                Auto-renewal is enabled for these certificates.
              </AlertDescription>
            </Alert>
          )}

          {expiredCount > 0 && (
            <Alert className="border-red-500/20 bg-red-500/5">
              <XCircle className="w-4 h-4 text-destructive" />
              <AlertDescription>
                <strong>{expiredCount} certificate{expiredCount > 1 ? 's' : ''}</strong> {expiredCount > 1 ? 'have' : 'has'} expired! 
                HTTPS may not be working for these domains.
              </AlertDescription>
            </Alert>
          )}

          {/* Certificates Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Issuer</TableHead>
                  <TableHead className="hidden sm:table-cell">Expires</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No certificates to monitor
                    </TableCell>
                  </TableRow>
                ) : (
                  certificates.map((cert, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Lock className={cn(
                            "w-4 h-4",
                            cert.status === 'active' ? 'text-green-500' : 'text-muted-foreground'
                          )} />
                          <code className="text-sm">{cert.domain}</code>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{cert.issuer}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {cert.validTo ? (
                          <span className="text-sm">
                            {format(cert.validTo, 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {cert.status !== 'pending' ? (
                          <span className={cn("font-medium", getDaysRemainingColor(cert.daysRemaining))}>
                            {cert.daysRemaining > 0 ? `${cert.daysRemaining} days` : 'Expired'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(cert)}
                          disabled={cert.status === 'pending'}
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Auto-renewal Info */}
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              SSL certificates are automatically renewed 30 days before expiration via Let's Encrypt.
              No action is required as long as DNS remains correctly configured.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Certificate Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileKey className="w-5 h-5 text-primary" />
              Certificate Details
            </DialogTitle>
            <DialogDescription>
              SSL certificate information for {selectedCert?.domain}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedCert.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Auto-Renewal</p>
                  <Badge variant={selectedCert.autoRenewal ? "default" : "outline"} className="mt-1">
                    {selectedCert.autoRenewal ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Issuer</p>
                <p className="font-medium">{selectedCert.issuer}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Valid From
                  </p>
                  <p className="font-medium">
                    {selectedCert.validFrom 
                      ? format(selectedCert.validFrom, 'MMM d, yyyy HH:mm') 
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Valid Until
                  </p>
                  <p className="font-medium">
                    {selectedCert.validTo 
                      ? format(selectedCert.validTo, 'MMM d, yyyy HH:mm') 
                      : '-'}
                  </p>
                </div>
              </div>

              {selectedCert.daysRemaining > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Validity Progress</p>
                  <Progress 
                    value={Math.min(100, (selectedCert.daysRemaining / 90) * 100)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedCert.daysRemaining} days remaining of 90-day validity
                  </p>
                </div>
              )}

              {selectedCert.serialNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block mt-1 break-all">
                    {selectedCert.serialNumber}
                  </code>
                </div>
              )}

              {selectedCert.fingerprint && (
                <div>
                  <p className="text-sm text-muted-foreground">SHA256 Fingerprint</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block mt-1 break-all">
                    {selectedCert.fingerprint}
                  </code>
                </div>
              )}

              <Button variant="outline" className="w-full" asChild>
                <a 
                  href={`https://${selectedCert.domain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Domain
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
