import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Globe, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  Shield, 
  Search,
  RefreshCw,
  Server
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface PanelSubdomain {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'pending' | 'suspended';
  owner_email?: string;
  created_at: string;
}

interface SubdomainManagerProps {
  panels: PanelSubdomain[];
  platformDomain: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export const SubdomainManager = ({ 
  panels, 
  platformDomain = "smmpilot.online",
  onRefresh,
  loading = false
}: SubdomainManagerProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const filteredPanels = panels.filter(panel => 
    panel.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    panel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = panels.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Wildcard Info Card */}
      <Card className="glass-card border-green-500/20 bg-green-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-400 mb-1">Wildcard SSL Active</h3>
              <p className="text-sm text-muted-foreground">
                All <code className="text-primary">*.{platformDomain}</code> subdomains are automatically 
                SSL-enabled via Vercel's nameservers. No manual DNS configuration needed per subdomain.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" /> Auto SSL
                </Badge>
                <Badge variant="outline">
                  <Server className="w-3 h-3 mr-1" /> Vercel DNS
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{panels.length}</p>
            <p className="text-sm text-muted-foreground">Total Panels</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{activeCount}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">∞</p>
            <p className="text-sm text-muted-foreground">SSL Certs</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">100%</p>
            <p className="text-sm text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Subdomains Table */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Panel Subdomains
              </CardTitle>
              <CardDescription>
                All panels hosted on {platformDomain}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search subdomains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {onRefresh && (
                <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Panel Name</TableHead>
                  <TableHead>Subdomain URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SSL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPanels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No subdomains match your search" : "No panels found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPanels.map((panel, index) => (
                    <motion.tr
                      key={panel.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{panel.name}</p>
                          {panel.owner_email && (
                            <p className="text-xs text-muted-foreground">{panel.owner_email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {panel.subdomain}.{platformDomain}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            panel.status === 'active' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : panel.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }
                        >
                          {panel.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <Shield className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(`https://${panel.subdomain}.${platformDomain}`)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a 
                              href={`https://${panel.subdomain}.${platformDomain}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubdomainManager;
