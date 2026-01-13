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
  Save
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
      const { data, error } = await supabase
        .from('platform_config')
        .select('key, value')
        .in('key', ['vercel_token', 'vercel_project_id', 'vercel_team_id']);

      if (error) throw error;

      if (data) {
        setConfig({
          vercel_token: data.find(c => c.key === 'vercel_token')?.value || '',
          vercel_project_id: data.find(c => c.key === 'vercel_project_id')?.value || '',
          vercel_team_id: data.find(c => c.key === 'vercel_team_id')?.value || '',
        });
        
        // If we have credentials, check if they're valid
        if (data.find(c => c.key === 'vercel_token')?.value) {
          setConnectionStatus('connected');
        }
      }
    } catch (error) {
      console.error('Error fetching Vercel config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof VercelConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setConnectionStatus('unknown');
  };

  const testConnection = async () => {
    if (!config.vercel_token || !config.vercel_project_id) {
      toast({ variant: "destructive", title: "Missing credentials", description: "Please enter API Token and Project ID" });
      return;
    }

    setTesting(true);
    try {
      // Test connection by fetching project details
      let url = `https://api.vercel.com/v9/projects/${config.vercel_project_id}`;
      if (config.vercel_team_id) {
        url += `?teamId=${config.vercel_team_id}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${config.vercel_token}`,
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
      // Save each config value
      const configs = [
        { key: 'vercel_token', value: config.vercel_token, description: 'Vercel API Token for domain management', is_sensitive: true },
        { key: 'vercel_project_id', value: config.vercel_project_id, description: 'Vercel Project ID', is_sensitive: false },
        { key: 'vercel_team_id', value: config.vercel_team_id, description: 'Vercel Team ID (optional)', is_sensitive: false },
      ];

      for (const conf of configs) {
        const { error } = await supabase
          .from('platform_config')
          .upsert({
            key: conf.key,
            value: conf.value,
            description: conf.description,
            is_sensitive: conf.is_sensitive,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });

        if (error) throw error;
      }

      toast({ title: "Configuration Saved", description: "Vercel integration settings have been updated" });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save configuration" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border shadow-card">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`border-2 ${
        connectionStatus === 'connected' ? 'border-green-500/30 bg-green-500/5' :
        connectionStatus === 'error' ? 'border-red-500/30 bg-red-500/5' :
        'border-border bg-gradient-card'
      }`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {connectionStatus === 'connected' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : connectionStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Globe className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {connectionStatus === 'connected' ? 'Connected to Vercel' :
                   connectionStatus === 'error' ? 'Connection Failed' :
                   'Not Configured'}
                </p>
                {projectName && connectionStatus === 'connected' && (
                  <p className="text-sm text-muted-foreground">Project: {projectName}</p>
                )}
              </div>
            </div>
            {connectionStatus === 'connected' && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" /> Active
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration Card */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" /> 
            Vercel API Configuration
          </CardTitle>
          <CardDescription>
            Configure your Vercel API credentials to enable automatic domain registration for panel owners.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert className="border-blue-500/30 bg-blue-500/5">
            <Globe className="w-4 h-4 text-blue-500" />
            <AlertDescription className="text-sm">
              <strong>How it works:</strong> When panel owners add custom domains, the system automatically 
              registers them with your Vercel project using these credentials. They only need to add DNS 
              records at their registrar—no nameserver changes required.
            </AlertDescription>
          </Alert>

          {/* API Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="vercel_token">Vercel API Token</Label>
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
                placeholder="Enter your Vercel API token"
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
            <div className="flex items-center justify-between">
              <Label htmlFor="vercel_project_id">Project ID</Label>
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
            <Label htmlFor="vercel_team_id">Team ID (Optional)</Label>
            <Input
              id="vercel_team_id"
              value={config.vercel_team_id}
              onChange={(e) => handleChange('vercel_team_id', e.target.value)}
              placeholder="team_xxxxxxxxxxxx"
            />
            <p className="text-xs text-muted-foreground">
              Only required if your project belongs to a team. Find in Team Settings → General.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={testing || !config.vercel_token || !config.vercel_project_id}
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
              disabled={saving}
              className="flex-1 bg-gradient-primary hover:shadow-glow"
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
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">What Panel Owners See</CardTitle>
          <CardDescription>
            Panel owners adding custom domains will see these DNS instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="shrink-0">A</Badge>
              <code className="text-xs">@</code>
              <span className="text-muted-foreground">→</span>
              <code className="text-xs">76.76.21.21</code>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="shrink-0">CNAME</Badge>
              <code className="text-xs">www</code>
              <span className="text-muted-foreground">→</span>
              <code className="text-xs">cname.vercel-dns.com</code>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="shrink-0">TXT</Badge>
              <code className="text-xs">_homeofsmm</code>
              <span className="text-muted-foreground">→</span>
              <code className="text-xs">homeofsmm-verify=xxxxx</code>
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
