import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
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
  RefreshCw,
  Trash2,
  CheckCircle,
  Gauge,
  Bot,
  History,
  Key,
  Bell,
  Download,
  Copy,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Zap,
  Mail,
  Webhook,
  Filter,
  LogOut,
  RotateCcw,
  FileDown,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";

interface Session {
  id: string;
  email: string;
  ip: string;
  device: string;
  lastActive: string;
  current: boolean;
  location?: string;
}

interface AuditLog {
  id?: string;
  action: string;
  user: string;
  time: string;
  ip: string;
  status: "success" | "failed" | "warning";
  details?: Record<string, any>;
}

interface LoginHistoryEntry {
  id: string;
  email: string;
  ip: string;
  device: string;
  location: string;
  time: string;
  status: "success" | "failed";
  suspicious: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  lastUsed: string | null;
  createdAt: string;
  expiresAt: string | null;
}

interface SecurityAlert {
  id: string;
  type: "failed_login" | "new_device" | "suspicious_activity" | "settings_change";
  message: string;
  time: string;
  severity: "low" | "medium" | "high";
  acknowledged: boolean;
}

const SecuritySettings = () => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [panelId, setPanelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("core");
  
  // Core Security settings
  const [enforce2FA, setEnforce2FA] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState("5");
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [passwordMinLength, setPasswordMinLength] = useState(true);
  const [passwordNumbers, setPasswordNumbers] = useState(true);
  const [passwordSymbols, setPasswordSymbols] = useState(false);
  const [notifyNewDevice, setNotifyNewDevice] = useState(true);
  const [blockTorVpn, setBlockTorVpn] = useState(false);
  const [ipAllowlist, setIpAllowlist] = useState("");
  const [countryBlocklist, setCountryBlocklist] = useState("");
  const [maxSessions, setMaxSessions] = useState("3");
  const [reauthFrequency, setReauthFrequency] = useState("15");

  // Rate Limiting settings (NEW)
  const [rateLimit, setRateLimit] = useState(60);
  const [lockoutDuration, setLockoutDuration] = useState("15");
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);

  // CAPTCHA settings (NEW)
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [captchaThreshold, setCaptchaThreshold] = useState(3);
  const [captchaProvider, setCaptchaProvider] = useState("hcaptcha");

  // Alert settings (NEW)
  const [alertOnFailedLogin, setAlertOnFailedLogin] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(5);
  const [alertEmail, setAlertEmail] = useState(true);
  const [alertInApp, setAlertInApp] = useState(true);
  const [alertWebhook, setAlertWebhook] = useState("");

  // Recovery settings (NEW)
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Real data state
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  
  // Filters
  const [auditFilter, setAuditFilter] = useState("all");
  const [historyFilter, setHistoryFilter] = useState("all");

  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/panel/security` : '';

  // Calculate Security Score
  const securityScore = useMemo(() => {
    let score = 10; // Base score for using Supabase Auth
    
    // 2FA: +20 points
    if (enforce2FA) score += 20;
    
    // Password policy: up to 15 points
    if (passwordMinLength) score += 5;
    if (passwordNumbers) score += 5;
    if (passwordSymbols) score += 5;
    
    // Session security: up to 15 points
    if (parseInt(maxSessions) <= 3) score += 5;
    if (parseInt(sessionTimeout) <= 60) score += 5;
    if (notifyNewDevice) score += 5;
    
    // Network security: up to 20 points
    if (blockTorVpn) score += 10;
    if (ipAllowlist.trim()) score += 5;
    if (countryBlocklist.trim()) score += 5;
    
    // Rate limiting: up to 10 points
    if (rateLimitEnabled) score += 10;
    
    // CAPTCHA: +5 points
    if (captchaEnabled) score += 5;
    
    // Alerts: +5 points
    if (alertOnFailedLogin) score += 5;
    
    return Math.min(score, 100);
  }, [enforce2FA, passwordMinLength, passwordNumbers, passwordSymbols, maxSessions, sessionTimeout, notifyNewDevice, blockTorVpn, ipAllowlist, countryBlocklist, rateLimitEnabled, captchaEnabled, alertOnFailedLogin]);

  const scoreColor = securityScore >= 75 ? "text-green-500" : securityScore >= 50 ? "text-yellow-500" : "text-red-500";
  const scoreLabel = securityScore >= 75 ? "Excellent" : securityScore >= 50 ? "Good" : "Needs Improvement";
  const ScoreIcon = securityScore >= 75 ? ShieldCheck : securityScore >= 50 ? Shield : ShieldAlert;

  // Get improvement suggestions
  const improvements = useMemo(() => {
    const suggestions: string[] = [];
    if (!enforce2FA) suggestions.push("Enable Two-Factor Authentication");
    if (!passwordSymbols) suggestions.push("Require symbols in passwords");
    if (!blockTorVpn) suggestions.push("Block TOR/VPN access");
    if (!rateLimitEnabled) suggestions.push("Enable rate limiting");
    if (!captchaEnabled) suggestions.push("Enable CAPTCHA protection");
    if (!alertOnFailedLogin) suggestions.push("Enable failed login alerts");
    if (!ipAllowlist.trim()) suggestions.push("Set up IP allowlist");
    return suggestions.slice(0, 3);
  }, [enforce2FA, passwordSymbols, blockTorVpn, rateLimitEnabled, captchaEnabled, alertOnFailedLogin, ipAllowlist]);

  // Load security settings from database
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;

        const { data: profileFull } = await supabase
          .from('profiles')
          .select('active_panel_id')
          .eq('id', profile.id)
          .maybeSingle();

        let panelQuery = supabase
          .from('panels')
          .select('id, settings')
          .eq('owner_id', profile.id);
        if (profileFull?.active_panel_id) {
          panelQuery = panelQuery.eq('id', profileFull.active_panel_id);
        }
        const { data: panels } = await panelQuery.order('created_at', { ascending: true }).limit(1);
        const panel = panels?.[0];

        if (panel) {
          setPanelId(panel.id);
          
          const settings = panel.settings as Record<string, any> || {};
          const security = settings.security || {};
          
          // Core settings
          setEnforce2FA(security.enforce2FA ?? false);
          setMaxAttempts(security.maxAttempts ?? "5");
          setSessionTimeout(security.sessionTimeout ?? "60");
          setPasswordMinLength(security.passwordMinLength ?? true);
          setPasswordNumbers(security.passwordNumbers ?? true);
          setPasswordSymbols(security.passwordSymbols ?? false);
          setNotifyNewDevice(security.notifyNewDevice ?? true);
          setBlockTorVpn(security.blockTorVpn ?? false);
          setIpAllowlist(security.ipAllowlist ?? "");
          setCountryBlocklist(security.countryBlocklist ?? "");
          setMaxSessions(security.maxSessions ?? "3");
          setReauthFrequency(security.reauthFrequency ?? "15");
          
          // Rate limiting
          setRateLimit(security.rateLimit ?? 60);
          setLockoutDuration(security.lockoutDuration ?? "15");
          setRateLimitEnabled(security.rateLimitEnabled ?? true);
          
          // CAPTCHA
          setCaptchaEnabled(security.captchaEnabled ?? false);
          setCaptchaThreshold(security.captchaThreshold ?? 3);
          setCaptchaProvider(security.captchaProvider ?? "hcaptcha");
          
          // Alerts
          setAlertOnFailedLogin(security.alertOnFailedLogin ?? true);
          setAlertThreshold(security.alertThreshold ?? 5);
          setAlertEmail(security.alertEmail ?? true);
          setAlertInApp(security.alertInApp ?? true);
          setAlertWebhook(security.alertWebhook ?? "");
          
          // Recovery
          setRecoveryEmail(security.recoveryEmail ?? "");
          setBackupCodes(security.backupCodes ?? []);
        }

        // Load audit logs
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('panel_id', panel?.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (logs && logs.length > 0) {
          const formattedLogs = logs.map(log => {
            const now = new Date();
            const logTime = new Date(log.created_at);
            const diffMs = now.getTime() - logTime.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            let timeStr = '';
            if (diffMins < 60) timeStr = `${diffMins} min ago`;
            else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)} hours ago`;
            else timeStr = `${Math.floor(diffMins / 1440)} days ago`;

            const details = log.details as Record<string, any> || {};
            return {
              id: log.id,
              action: log.action,
              user: details.email || 'Unknown',
              time: timeStr,
              ip: 'IP masked',
              status: (details.status as "success" | "failed" | "warning") || "success",
              details
            };
          });
          setAuditLogs(formattedLogs);
          
          // Generate login history from audit logs
          const loginLogs = logs.filter(log => 
            log.action.toLowerCase().includes('login') || 
            log.action.toLowerCase().includes('auth')
          ).slice(0, 20);
          
          const history: LoginHistoryEntry[] = loginLogs.map((log, idx) => {
            const details = log.details as Record<string, any> || {};
            const now = new Date();
            const logTime = new Date(log.created_at);
            const diffMs = now.getTime() - logTime.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            let timeStr = '';
            if (diffMins < 60) timeStr = `${diffMins} min ago`;
            else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)} hours ago`;
            else timeStr = `${Math.floor(diffMins / 1440)} days ago`;
            
            return {
              id: log.id,
              email: details.email || 'Unknown',
              ip: 'IP masked',
              device: details.userAgent?.split(' ')[0] || 'Unknown Device',
              location: details.location || 'Unknown',
              time: timeStr,
              status: details.status === 'failed' ? 'failed' : 'success',
              suspicious: details.suspicious || false
            };
          });
          setLoginHistory(history);
        }

        // Load active sessions — use real user-agent from audit_logs where available
        const { data: clients } = await supabase
          .from('client_users')
          .select('id, email, last_login_at')
          .eq('panel_id', panel?.id)
          .not('last_login_at', 'is', null)
          .order('last_login_at', { ascending: false })
          .limit(5);

        if (clients && clients.length > 0) {
          // Get recent login audit logs to extract real device/location info
          const clientIds = clients.map(c => c.id);
          const { data: loginLogs } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('panel_id', panel?.id)
            .in('resource_id', clientIds)
            .order('created_at', { ascending: false })
            .limit(20);

          const logsByUser: Record<string, any> = {};
          if (loginLogs) {
            for (const log of loginLogs) {
              if (log.resource_id && !logsByUser[log.resource_id]) {
                logsByUser[log.resource_id] = log;
              }
            }
          }

          const sessions = clients.map((client, index) => {
            const now = new Date();
            const loginTime = new Date(client.last_login_at!);
            const diffMs = now.getTime() - loginTime.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            let timeStr = '';
            if (diffMins < 60) timeStr = `${diffMins} min ago`;
            else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)} hours ago`;
            else timeStr = `${Math.floor(diffMins / 1440)} days ago`;

            const relatedLog = logsByUser[client.id];
            const logDetails = (relatedLog?.details as Record<string, any>) || {};
            const userAgent = relatedLog?.user_agent || logDetails.userAgent || '';

            // Parse user-agent for device info
            let device = 'Unknown Device';
            if (userAgent) {
              if (userAgent.includes('Chrome') && userAgent.includes('Windows')) device = 'Chrome on Windows';
              else if (userAgent.includes('Chrome') && userAgent.includes('Mac')) device = 'Chrome on macOS';
              else if (userAgent.includes('Chrome') && userAgent.includes('Android')) device = 'Chrome on Android';
              else if (userAgent.includes('Safari') && userAgent.includes('Mac')) device = 'Safari on macOS';
              else if (userAgent.includes('Firefox')) device = 'Firefox on ' + (userAgent.includes('Windows') ? 'Windows' : userAgent.includes('Linux') ? 'Linux' : 'Unknown');
              else if (userAgent.includes('Edge')) device = 'Edge on Windows';
              else device = userAgent.substring(0, 30);
            }

            return {
              id: client.id,
              email: client.email,
              ip: logDetails.ip || 'IP not tracked',
              device,
              lastActive: timeStr,
              current: index === 0,
              location: logDetails.location || 'Location not tracked'
            };
          });
          setActiveSessions(sessions);
        }
        
        // Derive security alerts from audit_logs (real data, not hardcoded)
        const { data: alertLogs } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('panel_id', panel?.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (alertLogs && alertLogs.length > 0) {
          const alerts: SecurityAlert[] = [];
          
          // Count failed logins
          const failedLogins = alertLogs.filter(l => {
            const d = l.details as Record<string, any> || {};
            return d.status === 'failed' || l.action.toLowerCase().includes('failed');
          });
          if (failedLogins.length > 0) {
            const now = new Date();
            const logTime = new Date(failedLogins[0].created_at);
            const diffMins = Math.floor((now.getTime() - logTime.getTime()) / 60000);
            let timeStr = diffMins < 60 ? `${diffMins} min ago` : diffMins < 1440 ? `${Math.floor(diffMins / 60)} hours ago` : `${Math.floor(diffMins / 1440)} days ago`;
            
            alerts.push({
              id: 'failed-logins',
              type: 'failed_login',
              message: `${failedLogins.length} failed login attempt${failedLogins.length > 1 ? 's' : ''} detected`,
              time: timeStr,
              severity: failedLogins.length >= 5 ? 'high' : failedLogins.length >= 2 ? 'medium' : 'low',
              acknowledged: false
            });
          }

          // Detect settings changes
          const settingsChanges = alertLogs.filter(l => l.action.toLowerCase().includes('settings'));
          if (settingsChanges.length > 0) {
            const now = new Date();
            const logTime = new Date(settingsChanges[0].created_at);
            const diffMins = Math.floor((now.getTime() - logTime.getTime()) / 60000);
            let timeStr = diffMins < 60 ? `${diffMins} min ago` : diffMins < 1440 ? `${Math.floor(diffMins / 60)} hours ago` : `${Math.floor(diffMins / 1440)} days ago`;
            
            alerts.push({
              id: 'settings-change',
              type: 'settings_change',
              message: `Security settings modified`,
              time: timeStr,
              severity: 'low',
              acknowledged: true
            });
          }

          setSecurityAlerts(alerts.length > 0 ? alerts : []);
        } else {
          setSecurityAlerts([]);
        }

      } catch (err) {
        console.error('Error loading security settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSecuritySettings();
  }, []);

  const handleSave = async () => {
    if (!panelId) {
      toast({ variant: "destructive", title: "No panel found" });
      return;
    }

    setSaving(true);
    try {
      const { data: panel } = await supabase
        .from('panels')
        .select('settings')
        .eq('id', panelId)
        .single();

      const currentSettings = panel?.settings as Record<string, any> || {};
      
      const updatedSettings = {
        ...currentSettings,
        security: {
          // Core
          enforce2FA,
          maxAttempts,
          sessionTimeout,
          passwordMinLength,
          passwordNumbers,
          passwordSymbols,
          notifyNewDevice,
          blockTorVpn,
          ipAllowlist,
          countryBlocklist,
          maxSessions,
          reauthFrequency,
          // Rate limiting
          rateLimit,
          lockoutDuration,
          rateLimitEnabled,
          // CAPTCHA
          captchaEnabled,
          captchaThreshold,
          captchaProvider,
          // Alerts
          alertOnFailedLogin,
          alertThreshold,
          alertEmail,
          alertInApp,
          alertWebhook,
          // Recovery
          recoveryEmail,
          backupCodes,
          updatedAt: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('panels')
        .update({ settings: updatedSettings })
        .eq('id', panelId);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          await supabase.from('audit_logs').insert({
            user_id: profile.id,
            panel_id: panelId,
            action: 'Security settings updated',
            resource_type: 'settings',
            details: { email: user.email, status: 'success' }
          });
        }
      }

      toast({ title: "Security settings saved successfully" });
    } catch (err) {
      console.error('Error saving security settings:', err);
      toast({ variant: "destructive", title: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const revokeSession = async (id: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    toast({ title: "Session revoked", description: "User has been logged out" });

    if (panelId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          await supabase.from('audit_logs').insert({
            user_id: profile.id,
            panel_id: panelId,
            action: 'Session revoked',
            resource_type: 'session',
            resource_id: id,
            details: { email: user.email, status: 'warning' }
          });
        }
      }
    }
  };

  const revokeAllSessions = async () => {
    const nonCurrentSessions = activeSessions.filter(s => !s.current);
    setActiveSessions(prev => prev.filter(s => s.current));
    toast({ 
      title: "All sessions revoked", 
      description: `${nonCurrentSessions.length} sessions terminated` 
    });
  };

  const generateBackupCodes = async () => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase()
    );
    setBackupCodes(codes);
    setShowBackupCodes(true);

    // Persist backup codes to panel settings immediately
    if (panelId) {
      try {
        const { data: panel } = await supabase
          .from('panels')
          .select('settings')
          .eq('id', panelId)
          .maybeSingle();

        const currentSettings = (panel?.settings as Record<string, any>) || {};
        const updatedSettings = {
          ...currentSettings,
          security: {
            ...(currentSettings.security || {}),
            backupCodes: codes,
          }
        };

        await supabase.from('panels').update({ settings: updatedSettings }).eq('id', panelId);
      } catch (err) {
        console.error('Failed to persist backup codes:', err);
      }
    }

    toast({ title: "Backup codes generated & saved", description: "Save these codes securely!" });
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const acknowledgeAlert = (id: string) => {
    setSecurityAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, acknowledged: true } : a
    ));
  };

  const filteredAuditLogs = auditFilter === "all" 
    ? auditLogs 
    : auditLogs.filter(log => log.status === auditFilter);

  const filteredLoginHistory = historyFilter === "all"
    ? loginHistory
    : loginHistory.filter(entry => entry.status === historyFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Security Settings | Home of SMM</title>
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
          <p className="text-muted-foreground">Protect your panel with enterprise-grade security controls</p>
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

      {/* Security Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="glass-card overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
          <CardContent className="relative p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Score Circle */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/30"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(securityScore / 100) * 352} 352`}
                    className={cn(
                      "transition-all duration-1000",
                      securityScore >= 75 ? "text-green-500" : securityScore >= 50 ? "text-yellow-500" : "text-red-500"
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-3xl font-bold", scoreColor)}>{securityScore}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              
              {/* Score Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <ScoreIcon className={cn("w-6 h-6", scoreColor)} />
                  <h2 className="text-xl font-semibold">Security Score: {scoreLabel}</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  {securityScore >= 75 
                    ? "Your panel has excellent security. Keep monitoring for new threats."
                    : securityScore >= 50 
                    ? "Good security posture, but there's room for improvement."
                    : "Your security needs attention. Enable more protections below."}
                </p>
                
                {improvements.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Quick improvements:</p>
                    <div className="flex flex-wrap gap-2">
                      {improvements.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="bg-primary/5">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{activeSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Active Sessions</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{auditLogs.filter(l => l.status === 'failed').length}</p>
                  <p className="text-xs text-muted-foreground">Failed Logins</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{securityAlerts.filter(a => !a.acknowledged).length}</p>
                  <p className="text-xs text-muted-foreground">Active Alerts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
          <TabsTrigger value="core" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Core Security</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">IP & Network</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Login History</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Alerts</span>
            {securityAlerts.filter(a => !a.acknowledged).length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {securityAlerts.filter(a => !a.acknowledged).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recovery" className="gap-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">Recovery</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Audit Log</span>
          </TabsTrigger>
        </TabsList>

        {/* Core Security Tab */}
        <TabsContent value="core" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Authentication Settings */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Authentication
                </CardTitle>
                <CardDescription>Configure login and session security</CardDescription>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label>Re-auth for sensitive actions</Label>
                  <Select value={reauthFrequency} onValueChange={setReauthFrequency}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Rate Limiting */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary" />
                  Rate Limiting
                  <Badge variant="outline" className="ml-auto">Recommended</Badge>
                </CardTitle>
                <CardDescription>Protect against brute force attacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div>
                    <Label className="font-medium">Enable Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">Limit requests per minute</p>
                  </div>
                  <Switch checked={rateLimitEnabled} onCheckedChange={setRateLimitEnabled} />
                </div>

                <AnimatePresence>
                  {rateLimitEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Max requests per minute</Label>
                          <span className="text-sm font-medium text-primary">{rateLimit} req/min</span>
                        </div>
                        <Slider 
                          value={[rateLimit]} 
                          onValueChange={([v]) => setRateLimit(v)} 
                          min={10} 
                          max={100} 
                          step={5}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>10 (strict)</span>
                          <span>100 (lenient)</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Lockout duration after limit</Label>
                        <Select value={lockoutDuration} onValueChange={setLockoutDuration}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Password Policy */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Password Policy
                </CardTitle>
                <CardDescription>Set password requirements for users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Minimum 8 characters</span>
                  <Switch checked={passwordMinLength} onCheckedChange={setPasswordMinLength} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Require numbers (0-9)</span>
                  <Switch checked={passwordNumbers} onCheckedChange={setPasswordNumbers} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Require symbols (!@#$)</span>
                  <Switch checked={passwordSymbols} onCheckedChange={setPasswordSymbols} />
                </div>
              </CardContent>
            </Card>

            {/* CAPTCHA Protection */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  CAPTCHA Protection
                </CardTitle>
                <CardDescription>Block automated attacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div>
                    <Label className="font-medium">Enable CAPTCHA</Label>
                    <p className="text-sm text-muted-foreground">Show after failed login attempts</p>
                  </div>
                  <Switch checked={captchaEnabled} onCheckedChange={setCaptchaEnabled} />
                </div>

                <AnimatePresence>
                  {captchaEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label>CAPTCHA Provider</Label>
                        <Select value={captchaProvider} onValueChange={setCaptchaProvider}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hcaptcha">hCaptcha (Privacy-focused)</SelectItem>
                            <SelectItem value="recaptcha">reCAPTCHA (Google)</SelectItem>
                            <SelectItem value="turnstile">Cloudflare Turnstile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Show after failed attempts</Label>
                          <span className="text-sm font-medium text-primary">{captchaThreshold}</span>
                        </div>
                        <Slider 
                          value={[captchaThreshold]} 
                          onValueChange={([v]) => setCaptchaThreshold(v)} 
                          min={1} 
                          max={10} 
                          step={1}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Device Limits */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Device & Session Management
                </CardTitle>
                <CardDescription>Control concurrent sessions and device access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                    <Label>Max concurrent sessions</Label>
                    <Select value={maxSessions} onValueChange={setMaxSessions}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 session only</SelectItem>
                        <SelectItem value="3">3 sessions</SelectItem>
                        <SelectItem value="5">5 sessions</SelectItem>
                        <SelectItem value="10">10 sessions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
                    <div>
                      <Label className="font-medium">New device notifications</Label>
                      <p className="text-xs text-muted-foreground">Email on new device login</p>
                    </div>
                    <Switch checked={notifyNewDevice} onCheckedChange={setNotifyNewDevice} />
                  </div>
                  
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between">
                    <div>
                      <Label className="font-medium text-destructive">Kill All Sessions</Label>
                      <p className="text-xs text-muted-foreground">Log out all devices now</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={revokeAllSessions}
                      disabled={activeSessions.filter(s => !s.current).length === 0}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <Label>IP Allowlist (comma separated)</Label>
                  <Input 
                    placeholder="192.168.1.1, 10.0.0.5" 
                    className="bg-background/50 font-mono text-sm"
                    value={ipAllowlist}
                    onChange={(e) => setIpAllowlist(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to allow all IPs</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Block Countries (ISO codes)</Label>
                  <Input 
                    placeholder="CN, RU, KP" 
                    className="bg-background/50 font-mono text-sm"
                    value={countryBlocklist}
                    onChange={(e) => setCountryBlocklist(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated ISO 3166-1 alpha-2 codes</p>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="font-medium">Block TOR & VPN</Label>
                      <p className="text-xs text-muted-foreground">Prevent anonymous access</p>
                    </div>
                  </div>
                  <Switch checked={blockTorVpn} onCheckedChange={setBlockTorVpn} />
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Active Sessions
                </CardTitle>
                <CardDescription>Manage and revoke user sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {activeSessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No active sessions found</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {activeSessions.map((session) => (
                      <div 
                        key={session.id} 
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            session.current ? "bg-green-500" : "bg-muted-foreground"
                          )} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{session.email}</span>
                              {session.current && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs shrink-0">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {session.device} • {session.location} • {session.lastActive}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => revokeSession(session.id)}
                          disabled={session.current}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Login History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Login History
                  </CardTitle>
                  <CardDescription>Recent authentication attempts</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={historyFilter} onValueChange={setHistoryFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="success">Successful</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <FileDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredLoginHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No login history found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground border-b border-border/50">
                      <tr>
                        <th className="py-3 pr-4">User</th>
                        <th className="py-3 pr-4 hidden md:table-cell">IP Address</th>
                        <th className="py-3 pr-4 hidden lg:table-cell">Device</th>
                        <th className="py-3 pr-4 hidden lg:table-cell">Location</th>
                        <th className="py-3 pr-4">Time</th>
                        <th className="py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoginHistory.map((entry) => (
                        <tr key={entry.id} className="border-b border-border/30">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[150px]">{entry.email}</span>
                              {entry.suspicious && (
                                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-4 font-mono text-xs hidden md:table-cell">{entry.ip}</td>
                          <td className="py-3 pr-4 text-muted-foreground hidden lg:table-cell">{entry.device}</td>
                          <td className="py-3 pr-4 hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span>{entry.location}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{entry.time}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                entry.status === "success" 
                                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                              )}
                            >
                              {entry.status === "success" ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <ShieldX className="w-3 h-3 mr-1" />
                              )}
                              {entry.status}
                            </Badge>
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

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Configuration */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Alert Configuration
                </CardTitle>
                <CardDescription>Configure security notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Failed Login Alerts</Label>
                      <p className="text-xs text-muted-foreground">Notify after threshold reached</p>
                    </div>
                    <Switch checked={alertOnFailedLogin} onCheckedChange={setAlertOnFailedLogin} />
                  </div>
                  
                  <AnimatePresence>
                    {alertOnFailedLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Alert after attempts</Label>
                          <span className="text-sm font-medium">{alertThreshold}</span>
                        </div>
                        <Slider 
                          value={[alertThreshold]} 
                          onValueChange={([v]) => setAlertThreshold(v)} 
                          min={3} 
                          max={10} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-3">
                  <Label className="font-medium">Notification Channels</Label>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Email notifications</span>
                    </div>
                    <Switch checked={alertEmail} onCheckedChange={setAlertEmail} />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">In-app notifications</span>
                    </div>
                    <Switch checked={alertInApp} onCheckedChange={setAlertInApp} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Webhook className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm">Webhook URL (optional)</Label>
                    </div>
                    <Input 
                      placeholder="https://your-webhook.com/security" 
                      className="bg-background/50 font-mono text-xs"
                      value={alertWebhook}
                      onChange={(e) => setAlertWebhook(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Recent Security Alerts
                </CardTitle>
                <CardDescription>Alerts requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                {securityAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">No security alerts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {securityAlerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className={cn(
                          "p-4 rounded-xl border",
                          alert.acknowledged 
                            ? "bg-muted/20 border-border/30" 
                            : alert.severity === "high"
                            ? "bg-destructive/10 border-destructive/30"
                            : alert.severity === "medium"
                            ? "bg-yellow-500/10 border-yellow-500/30"
                            : "bg-blue-500/10 border-blue-500/30"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {alert.severity === "high" ? (
                              <ShieldX className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            ) : alert.severity === "medium" ? (
                              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                            </div>
                          </div>
                          {!alert.acknowledged && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recovery Tab */}
        <TabsContent value="recovery" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 2FA Setup for Panel Owner */}
            <div className="lg:col-span-2">
              <TwoFactorSetup onStatusChange={(enabled) => {
                setEnforce2FA(enabled);
              }} />
            </div>

            {/* Backup Codes */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Panel Backup Codes
                </CardTitle>
               <CardDescription>Additional recovery codes for your panel (separate from 2FA backup codes)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!enforce2FA ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/40">
                    <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">2FA Required</p>
                      <p className="text-xs text-muted-foreground">Enable Two-Factor Authentication above first to generate backup codes.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      These are panel-level recovery codes for emergency access.
                      2FA backup codes are managed in the 2FA section above.
                    </p>
                    
                    {backupCodes.length === 0 ? (
                      <Button onClick={generateBackupCodes} className="w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Backup Codes
                      </Button>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowBackupCodes(!showBackupCodes)}
                          >
                            {showBackupCodes ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {showBackupCodes ? "Hide" : "Show"} Codes
                          </Button>
                          <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={generateBackupCodes}
                            className="ml-auto"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Regenerate
                          </Button>
                        </div>
                        
                        <AnimatePresence>
                          {showBackupCodes && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-x-auto"
                            >
                              {backupCodes.map((code, idx) => (
                                <div 
                                  key={idx}
                                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 font-mono text-xs sm:text-sm min-w-0"
                                >
                                  <span className="truncate">{code}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => copyToClipboard(code)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recovery Email */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Recovery Email
                </CardTitle>
                <CardDescription>Secondary email for account recovery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add a backup email address to recover your account if you lose access 
                  to your primary email.
                </p>
                
                <div className="space-y-2">
                  <Label>Recovery Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="backup@example.com" 
                    className="bg-background/50"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                  />
                </div>
                
                {recoveryEmail && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      Verification email will be sent after saving
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Audit Log
                  </CardTitle>
                  <CardDescription>Complete security event history</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={auditFilter} onValueChange={setAuditFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="warning">Warnings</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <FileDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAuditLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No security events found</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredAuditLogs.map((log, index) => (
                    <div 
                      key={log.id || index} 
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {log.user} • {log.time} • {log.ip}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs ml-4 shrink-0",
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;
