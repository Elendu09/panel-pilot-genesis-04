import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Loader2,
  ExternalLink,
  RefreshCw,
  Shield,
  Save,
  Lock
} from "lucide-react";

interface VercelConfig {
  vercel_token: string;
  vercel_project_id: string;
  vercel_team_id: string;
}

export const VercelIntegrationSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [projectName, setProjectName] = useState<string | null>(null);
  const [tokenConfigured, setTokenConfigured] = useState(false);
  
  const [config, setConfig] = useState<VercelConfig>({
    vercel_token: '',
    vercel_project_id: '',
    vercel_team_id: '',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      // Use edge function to fetch config securely
      const { data, error } = await supabase.functions.invoke('save-platform-config', {
        body: { 
          action: 'fetch',
          configs: ['vercel_token', 'vercel_project_id', 'vercel_team_id']
        }
      });

      if (error) throw error;

      if (data?.data) {
        const tokenData = data.data.find((c: any) => c.key === 'vercel_token');
        const projectData = data.data.find((c: any) => c.key === 'vercel_project_id');
        const teamData = data.data.find((c: any) => c.key === 'vercel_team_id');
        
        setConfig({
          vercel_token: '', // Never show the actual token
          vercel_project_id: projectData?.value || '',
          vercel_team_id: teamData?.value || '',
        });
        
        setTokenConfigured(!!tokenData?.is_configured);
        if (tokenData?.is_configured) {
          setConnectionStatus('connected');
        }
      }
    } catch (error) {
      console.error('Error fetching Vercel config:', error);
      toast({ variant: "destructive", title: "Error loading configuration" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof VercelConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    if (key === 'vercel_token') {
      setConnectionStatus('unknown');
    }
  };

  const testConnection = async () => {
    const tokenToTest = config.vercel_token || '';
    if (!tokenToTest || !config.vercel_project_id) {
      toast({ variant: "destructive", title: "Missing credentials", description: "Please enter API Token and Project ID" });
      return;
    }

    setTesting(true);
    try {
      let url = `https://api.vercel.com/v9/projects/${config.vercel_project_id}`;
      if (config.vercel_team_id) {
        url += `?teamId=${config.vercel_team_id}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenToTest}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjectName(data.name);
        setConnectionStatus('connected');
        toast({ 
          title: "Connection Successful!", 
          description: `Connected to project: ${data.name}` 
        });
      } else {
        const error = await response.json();
        setConnectionStatus('error');
        toast({ 
          variant: "destructive", 
          title: "Connection Failed", 
          description: error.error?.message || "Invalid credentials or project not found" 
        });
      }
    } catch (error) {
      console.error('Test connection error:', error);
      setConnectionStatus('error');
      toast({ variant: "destructive", title: "Connection Error", description: "Could not connect to Vercel API" });
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const configs = [];
      
      // Only include token if user entered a new one
      if (config.vercel_token) {
        configs.push({ 
          key: 'vercel_token', 
          value: config.vercel_token, 
          description: 'Vercel API Token for domain management', 
          is_sensitive: true 
        });
      }
      
      configs.push(
        { key: 'vercel_project_id', value: config.vercel_project_id, description: 'Vercel Project ID', is_sensitive: false },
        { key: 'vercel_team_id', value: config.vercel_team_id, description: 'Vercel Team ID (optional)', is_sensitive: false }
      );

      const { data, error } = await supabase.functions.invoke('save-platform-config', {
        body: { action: 'save', configs }
      });

      if (error) throw error;

      toast({ title: "Configuration Saved", description: "Vercel integration settings have been updated securely" });
      
      // Clear the token field and mark as configured
      if (config.vercel_token) {
        setConfig(prev => ({ ...prev, vercel_token: '' }));
        setTokenConfigured(true);
      }
      
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save configuration" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Status Card */}
      <Card className={`border-2 ${
        connectionStatus === 'connected' ? 'border-green-500/30 bg-green-500/5' :
        connectionStatus === 'error' ? 'border-red-500/30 bg-red-500/5' :
        'border-border bg-card'
      }`}>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {connectionStatus === 'connected' ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              ) : connectionStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {connectionStatus === 'connected' ? 'Connected to Vercel' :
                   connectionStatus === 'error' ? 'Connection Failed' :
                   'Not Configured'}
                </p>
                {projectName && connectionStatus === 'connected' && (
                  <p className="text-sm text-muted-foreground truncate">Project: {projectName}</p>
                )}
              </div>
            </div>
            {connectionStatus === 'connected' && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 shrink-0">
                <CheckCircle className="w-3 h-3 mr-1" /> Active
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Shield className="w-5 h-5" /> 
            Vercel API Configuration
          </CardTitle>
          <CardDescription className="text-sm">
            Configure your Vercel API credentials to enable automatic domain registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          {/* Info Alert */}
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <Globe className="w-4 h-4 text-blue-500" />
            <AlertDescription className="text-xs sm:text-sm">
              <strong>How it works:</strong> Panel owners add custom domains, and the system automatically 
              registers them with your Vercel project. They only need to add DNS records—no nameserver changes required.
            </AlertDescription>
          </Alert>

          {/* Token Configured Badge */}
          {tokenConfigured && !config.vercel_token && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Lock className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">API Token is securely configured</span>
              <Badge variant="outline" className="ml-auto text-xs">••••••••</Badge>
            </div>
          )}

          {/* API Token */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <Label htmlFor="vercel_token" className="text-sm">
                {tokenConfigured ? 'Update API Token (optional)' : 'Vercel API Token'}
              </Label>
              <a 
                href="https://vercel.com/account/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get token <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <Input
                id="vercel_token"
                type={showToken ? "text" : "password"}
                value={config.vercel_token}
                onChange={(e) => handleChange('vercel_token', e.target.value)}
                placeholder={tokenConfigured ? "Enter new token to update" : "Enter your Vercel API token"}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Create a token at Vercel Dashboard → Settings → Tokens. Use "Full Access" scope.
            </p>
          </div>

          {/* Project ID */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <Label htmlFor="vercel_project_id" className="text-sm">Project ID</Label>
              <a 
                href="https://vercel.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View projects <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <Input
              id="vercel_project_id"
              value={config.vercel_project_id}
              onChange={(e) => handleChange('vercel_project_id', e.target.value)}
              placeholder="prj_xxxxxxxxxxxx"
            />
            <p className="text-xs text-muted-foreground">
              Find in Project Settings → General → Project ID
            </p>
          </div>

          {/* Team ID (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="vercel_team_id" className="text-sm">Team ID (Optional)</Label>
            <Input
              id="vercel_team_id"
              value={config.vercel_team_id}
              onChange={(e) => handleChange('vercel_team_id', e.target.value)}
              placeholder="team_xxxxxxxxxxxx"
            />
            <p className="text-xs text-muted-foreground">
              Only required if your project belongs to a team.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={testing || (!config.vercel_token && !tokenConfigured) || !config.vercel_project_id}
              className="flex-1"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>
            <Button
              onClick={saveConfig}
              disabled={saving || !config.vercel_project_id}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* What Panel Owners See */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">What Panel Owners See</CardTitle>
          <CardDescription className="text-sm">
            Panel owners will see these DNS instructions when adding custom domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-3 md:p-4 space-y-2 md:space-y-3">
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm">
              <Badge variant="outline" className="shrink-0">A</Badge>
              <code className="text-xs">@</code>
              <span className="text-muted-foreground">→</span>
              <code className="text-xs break-all">76.76.21.21</code>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm">
              <Badge variant="outline" className="shrink-0">CNAME</Badge>
              <code className="text-xs">www</code>
              <span className="text-muted-foreground">→</span>
              <code className="text-xs break-all">cname.vercel-dns.com</code>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm">
              <Badge variant="outline" className="shrink-0">TXT</Badge>
              <code className="text-xs">_smmpilot</code>
              <span className="text-muted-foreground">→</span>
              <code className="text-xs break-all">smmpilot-verify=xxxxx</code>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ⚠️ They are instructed NOT to change nameservers—only add these records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
