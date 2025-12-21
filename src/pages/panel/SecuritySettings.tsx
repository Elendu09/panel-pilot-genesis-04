import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  KeyRound, 
  Smartphone, 
  Globe, 
  UserCheck, 
  Save, 
  Activity, 
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  CheckCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SecuritySettings = () => {
  const [saving, setSaving] = useState(false);
  const [enforce2FA, setEnforce2FA] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState("5");
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [passwordMinLength, setPasswordMinLength] = useState(true);
  const [passwordNumbers, setPasswordNumbers] = useState(true);
  const [passwordSymbols, setPasswordSymbols] = useState(false);
  const [notifyNewDevice, setNotifyNewDevice] = useState(true);
  const [blockTorVpn, setBlockTorVpn] = useState(false);

  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/panel/security` : '';

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast({ title: "Security settings saved successfully" });
  };

  const activeSessions = [
    { id: 1, email: "customer1@email.com", ip: "192.168.1.10", device: "Chrome on Windows", lastActive: "2 min ago", current: true },
    { id: 2, email: "customer2@email.com", ip: "10.0.0.25", device: "Safari on macOS", lastActive: "15 min ago", current: false },
    { id: 3, email: "customer3@email.com", ip: "172.16.0.50", device: "Firefox on Linux", lastActive: "1 hour ago", current: false },
  ];

  const auditLogs = [
    { action: "Password changed", user: "customer1@email.com", time: "2 min ago", ip: "192.168.1.10", status: "success" },
    { action: "Login attempt failed", user: "unknown@email.com", time: "15 min ago", ip: "203.0.113.42", status: "failed" },
    { action: "2FA enabled", user: "customer2@email.com", time: "1 hour ago", ip: "10.0.0.25", status: "success" },
    { action: "API key regenerated", user: "admin@panel.com", time: "3 hours ago", ip: "192.168.1.1", status: "success" },
    { action: "User suspended", user: "customer5@email.com", time: "5 hours ago", ip: "192.168.1.1", status: "warning" },
  ];

  const revokeSession = (id: number) => {
    toast({ title: "Session revoked", description: "User has been logged out" });
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Security Settings | SMMPilot Panel</title>
        <meta name="description" content="Configure authentication, 2FA, sessions, IP rules and audit logs for your panel." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Security & Access
          </h1>
          <p className="text-muted-foreground">Protect your panel with security controls</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </motion.header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Core Security
              </CardTitle>
              <CardDescription>Authentication, 2FA and session protection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div>
                  <Label className="font-medium">Require Two-Factor (2FA)</Label>
                  <p className="text-sm text-muted-foreground">Force all users to enable 2FA</p>
                </div>
                <Switch checked={enforce2FA} onCheckedChange={setEnforce2FA} />
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Max login attempts</Label>
                  <Input 
                    type="number" 
                    min={3} 
                    max={10} 
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Session timeout (mins)</Label>
                  <Input 
                    type="number" 
                    min={5} 
                    max={1440} 
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Re-auth for sensitive actions</Label>
                  <Select defaultValue="15">
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Every 5 min</SelectItem>
                      <SelectItem value="15">Every 15 min</SelectItem>
                      <SelectItem value="30">Every 30 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Policy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-primary" />
                    <span className="font-medium">Password Policy</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center justify-between">
                      <span>Minimum 8 characters</span>
                      <Switch checked={passwordMinLength} onCheckedChange={setPasswordMinLength} />
                    </label>
                    <label className="flex items-center justify-between">
                      <span>Require numbers</span>
                      <Switch checked={passwordNumbers} onCheckedChange={setPasswordNumbers} />
                    </label>
                    <label className="flex items-center justify-between">
                      <span>Require symbols</span>
                      <Switch checked={passwordSymbols} onCheckedChange={setPasswordSymbols} />
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span className="font-medium">Device Limits</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center justify-between">
                      <span>Max concurrent sessions</span>
                      <Select defaultValue="3">
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="flex items-center justify-between">
                      <span>Notify new device login</span>
                      <Switch checked={notifyNewDevice} onCheckedChange={setNotifyNewDevice} />
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* IP & Country Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                IP & Country Rules
              </CardTitle>
              <CardDescription>Restrict access based on location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Allowlist IPs (comma separated)</Label>
                <Input placeholder="192.168.1.1, 10.0.0.5" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Block countries (ISO codes)</Label>
                <Input placeholder="e.g. CN, RU" className="bg-background/50" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Block TOR/VPN</span>
                </div>
                <Switch checked={blockTorVpn} onCheckedChange={setBlockTorVpn} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sessions & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage and revoke user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="py-2 pr-4">User</th>
                      <th className="py-2 pr-4 hidden md:table-cell">IP</th>
                      <th className="py-2 pr-4 hidden lg:table-cell">Device</th>
                      <th className="py-2 pr-4">Last Active</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSessions.map((session) => (
                      <tr key={session.id} className="border-b border-border/30">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[120px]">{session.email}</span>
                            {session.current && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs hidden md:table-cell">{session.ip}</td>
                        <td className="py-3 pr-4 text-muted-foreground hidden lg:table-cell">{session.device}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{session.lastActive}</td>
                        <td className="py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => revokeSession(session.id)}
                            disabled={session.current}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Audit Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Audit Log
              </CardTitle>
              <CardDescription>Recent security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{log.action}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {log.user} • {log.time} • {log.ip}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs ml-2 shrink-0",
                        log.status === "success" && "bg-green-500/10 text-green-500 border-green-500/20",
                        log.status === "failed" && "bg-destructive/10 text-destructive border-destructive/20",
                        log.status === "warning" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      )}
                    >
                      {log.status === "success" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {log.status === "failed" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {log.status === "warning" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {log.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SecuritySettings;
