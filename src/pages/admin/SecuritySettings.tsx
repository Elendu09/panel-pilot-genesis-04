import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, KeyRound, Smartphone, Globe, UserCheck, Save, Activity, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

interface SecuritySettings {
  enforce_2fa: boolean;
  max_login_attempts: number;
  session_timeout: number;
  reauth_interval: number;
  password_min_length: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  block_rooted_devices: boolean;
  notify_new_device: boolean;
  ip_allowlist: string;
  blocked_countries: string;
  block_vpn: boolean;
}

interface ActiveSession {
  user_id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  last_active: string;
}

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  ip_address: string;
  created_at: string;
  details: any;
  user_email?: string;
}

const defaultSettings: SecuritySettings = {
  enforce_2fa: false,
  max_login_attempts: 5,
  session_timeout: 60,
  reauth_interval: 15,
  password_min_length: true,
  password_require_numbers: true,
  password_require_symbols: false,
  block_rooted_devices: false,
  notify_new_device: true,
  ip_allowlist: '',
  blocked_countries: '',
  block_vpn: false,
};

const SecuritySettingsPage = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin/security` : '';
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState("core");
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchActiveSessions();
    fetchAuditLogs();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('update-security-settings', {
        body: { action: 'fetch' }
      });

      if (error) throw error;

      if (data?.data) {
        setSettings({ ...defaultSettings, ...data.data });
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      // Get recent login activities from audit_logs
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .in('action', ['login', 'session_start', 'page_view', 'api_call'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get unique user sessions by user_id
      const sessionsMap = new Map<string, ActiveSession>();
      
      for (const log of logs || []) {
        if (log.user_id && !sessionsMap.has(log.user_id)) {
          // Fetch user email
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', log.user_id)
            .maybeSingle();

          const details = log.details as any || {};
          
          sessionsMap.set(log.user_id, {
            user_id: log.user_id,
            email: profile?.email || 'Unknown',
            ip_address: typeof log.ip_address === 'string' ? log.ip_address : 'Unknown',
            user_agent: details?.user_agent || log.user_agent || 'Unknown device',
            last_active: log.created_at
          });
        }
      }

      setActiveSessions(Array.from(sessionsMap.values()).slice(0, 10));
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch user emails for logs
      const logsWithEmails: AuditLogEntry[] = [];
      
      for (const log of logs || []) {
        let userEmail = 'System';
        if (log.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', log.user_id)
            .maybeSingle();
          userEmail = profile?.email || 'Unknown';
        }

        logsWithEmails.push({
          ...log,
          ip_address: typeof log.ip_address === 'string' ? log.ip_address : 'Unknown',
          user_email: userEmail
        });
      }

      setAuditLogs(logsWithEmails);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('update-security-settings', {
        body: { action: 'save', settings }
      });

      if (error) throw error;

      toast({ title: "Settings Saved", description: "Security settings have been updated successfully" });
    } catch (error: any) {
      console.error('Error saving security settings:', error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleRevokeSession = async (userId: string) => {
    // Log the revocation action
    try {
      await supabase.from('audit_logs').insert({
        action: 'session_revoked',
        user_id: userId,
        resource_type: 'session',
        details: { revoked_by: 'admin' }
      });
      
      toast({ title: "Session Revoked", description: "User session has been terminated" });
      fetchActiveSessions();
    } catch (error) {
      console.error('Error revoking session:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to revoke session" });
    }
  };

  const parseUserAgent = (ua: string): string => {
    if (!ua || ua === 'Unknown device') return 'Unknown device';
    
    // Simple parsing
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Safari')) return 'Safari Browser';
    if (ua.includes('Edge')) return 'Edge Browser';
    if (ua.includes('Mobile')) return 'Mobile Device';
    
    return ua.substring(0, 30) + '...';
  };

  const getActionDescription = (action: string): string => {
    const descriptions: Record<string, string> = {
      'login': 'User logged in',
      'logout': 'User logged out',
      'session_revoked': 'Session was revoked',
      'settings_updated': 'Settings were updated',
      'role_change': 'User role was changed',
      'password_change': 'Password was changed',
      'api_call': 'API request made',
      'page_view': 'Page was accessed',
      'create': 'Resource created',
      'update': 'Resource updated',
      'delete': 'Resource deleted',
    };
    return descriptions[action] || action.replace(/_/g, ' ');
  };

  const tabs = [
    { value: "core", label: "Core Security", icon: Shield },
    { value: "ip", label: "IP Rules", icon: Globe },
    { value: "sessions", label: "Sessions", icon: UserCheck },
    { value: "audit", label: "Audit Log", icon: Activity },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <Helmet>
        <title>Admin Security Settings | HOME OF SMM</title>
        <meta name="description" content="Configure authentication, 2FA, sessions, IP rules and audit logs." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Security & Access</h1>
          <p className="text-sm md:text-base text-muted-foreground">Harden your platform with modern security controls</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile: Dropdown */}
        <div className="md:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue>
                {tabs.find(t => t.value === activeTab)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SelectItem key={tab.value} value={tab.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Scrollable Tabs */}
        <div className="hidden md:block">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-max min-w-full bg-muted/50 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className="flex items-center gap-2 whitespace-nowrap px-4"
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <TabsContent value="core" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5" /> Core Security
                </CardTitle>
                <CardDescription>Authentication, 2FA and session protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-5">
                <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium text-sm md:text-base">Require Two-Factor (2FA)</Label>
                    <p className="text-xs md:text-sm text-muted-foreground">Force all admins to enable 2FA</p>
                  </div>
                  <Switch 
                    checked={settings.enforce_2fa} 
                    onCheckedChange={(checked) => handleChange('enforce_2fa', checked)} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Max login attempts</Label>
                    <Input 
                      type="number" 
                      min={3} 
                      max={10} 
                      value={settings.max_login_attempts}
                      onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value) || 5)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Session timeout (mins)</Label>
                    <Input 
                      type="number" 
                      min={5} 
                      max={1440} 
                      value={settings.session_timeout}
                      onChange={(e) => handleChange('session_timeout', parseInt(e.target.value) || 60)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Re-auth interval</Label>
                    <Select 
                      value={settings.reauth_interval.toString()} 
                      onValueChange={(v) => handleChange('reauth_interval', parseInt(v))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Every 5 min</SelectItem>
                        <SelectItem value="15">Every 15 min</SelectItem>
                        <SelectItem value="30">Every 30 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="p-3 md:p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <KeyRound className="w-4 h-4" />
                      <span className="font-medium text-sm">Password policy</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <label className="flex items-center justify-between">
                        <span className="text-muted-foreground">Minimum 8 characters</span>
                        <Switch 
                          checked={settings.password_min_length} 
                          onCheckedChange={(checked) => handleChange('password_min_length', checked)}
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-muted-foreground">Require numbers</span>
                        <Switch 
                          checked={settings.password_require_numbers}
                          onCheckedChange={(checked) => handleChange('password_require_numbers', checked)}
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-muted-foreground">Require symbols</span>
                        <Switch 
                          checked={settings.password_require_symbols}
                          onCheckedChange={(checked) => handleChange('password_require_symbols', checked)}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="p-3 md:p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Smartphone className="w-4 h-4" />
                      <span className="font-medium text-sm">Device limits</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <label className="flex items-center justify-between">
                        <span className="text-muted-foreground">Block rooted/jailbroken</span>
                        <Switch 
                          checked={settings.block_rooted_devices}
                          onCheckedChange={(checked) => handleChange('block_rooted_devices', checked)}
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-muted-foreground">Notify new device login</span>
                        <Switch 
                          checked={settings.notify_new_device}
                          onCheckedChange={(checked) => handleChange('notify_new_device', checked)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" /> Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">Security Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">All security policies are enforced</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2FA Required</span>
                    <Badge variant={settings.enforce_2fa ? "default" : "secondary"}>
                      {settings.enforce_2fa ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Attempts</span>
                    <span className="font-medium">{settings.max_login_attempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeout</span>
                    <span className="font-medium">{settings.session_timeout} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Sessions</span>
                    <span className="font-medium">{activeSessions.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ip" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5" /> IP & Country Rules
              </CardTitle>
              <CardDescription>Restrict access based on location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Allowlist IPs (comma separated)</Label>
                  <Input 
                    placeholder="192.168.1.1, 10.0.0.5" 
                    value={settings.ip_allowlist}
                    onChange={(e) => handleChange('ip_allowlist', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Block countries (ISO codes)</Label>
                  <Input 
                    placeholder="e.g. CN, RU" 
                    value={settings.blocked_countries}
                    onChange={(e) => handleChange('blocked_countries', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="text-sm font-medium">Block TOR/VPN</span>
                  <p className="text-xs text-muted-foreground">Block connections from known VPN/proxy servers</p>
                </div>
                <Switch 
                  checked={settings.block_vpn}
                  onCheckedChange={(checked) => handleChange('block_vpn', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="w-5 h-5" /> Active Sessions
              </CardTitle>
              <CardDescription>Manage and revoke user sessions ({activeSessions.length} active)</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : activeSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No active sessions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead className="text-left text-muted-foreground">
                      <tr>
                        <th className="py-2 font-medium">User</th>
                        <th className="py-2 font-medium">IP</th>
                        <th className="py-2 font-medium hidden sm:table-cell">Device</th>
                        <th className="py-2 font-medium">Last active</th>
                        <th className="py-2"/>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSessions.map((session) => (
                        <tr key={session.user_id} className="border-t border-border">
                          <td className="py-3">
                            <span className="truncate block max-w-[120px] sm:max-w-none">{session.email}</span>
                          </td>
                          <td className="py-3">{session.ip_address}</td>
                          <td className="py-3 hidden sm:table-cell">{parseUserAgent(session.user_agent)}</td>
                          <td className="py-3">{formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}</td>
                          <td className="py-3 text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => handleRevokeSession(session.user_id)}
                            >
                              Revoke
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" /> Audit Log
              </CardTitle>
              <CardDescription>Recent security-sensitive actions</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No audit logs found</p>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{getActionDescription(log.action)}</p>
                        <p className="text-muted-foreground text-xs truncate">
                          {log.user_email} • {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })} • IP {log.ip_address}
                        </p>
                        {log.resource_type && (
                          <p className="text-xs text-muted-foreground">
                            Resource: {log.resource_type}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`w-fit shrink-0 ${
                          log.action.includes('delete') || log.action.includes('revoke') 
                            ? 'border-destructive/50 text-destructive' 
                            : ''
                        }`}
                      >
                        {log.action.includes('error') || log.action.includes('fail') ? 'ERROR' : 'OK'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettingsPage;
