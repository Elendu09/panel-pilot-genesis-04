import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, KeyRound, Smartphone, Globe, UserCheck, Save, Activity, Eye, EyeOff, AlarmClock } from "lucide-react";

const SecuritySettings = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin/security` : '';

  return (
    <div className="space-y-6 animate-fade-in">
      <Helmet>
        <title>Admin Security Settings | HOME OF SMM</title>
        <meta name="description" content="Configure authentication, 2FA, sessions, IP rules and audit logs." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security & Access</h1>
          <p className="text-muted-foreground">Harden your platform with modern security controls</p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-glow">
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Core security</CardTitle>
            <CardDescription>Authentication, 2FA and session protection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-medium">Require Two‑Factor (2FA)</Label>
                <p className="text-sm text-muted-foreground">Force all admins to enable 2FA</p>
              </div>
              <Switch id="enforce-2fa" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Max login attempts</Label>
                <Input type="number" min={3} max={10} defaultValue={5} />
              </div>
              <div>
                <Label>Session timeout (mins)</Label>
                <Input type="number" min={5} max={1440} defaultValue={60} />
              </div>
              <div>
                <Label>Re-auth for sensitive actions</Label>
                <Select defaultValue="15">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 min</SelectItem>
                    <SelectItem value="15">Every 15 min</SelectItem>
                    <SelectItem value="30">Every 30 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2"><KeyRound className="w-4 h-4" /><span className="font-medium">Password policy</span></div>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center justify-between"><span>Minimum 8 characters</span><Switch defaultChecked /></label>
                  <label className="flex items-center justify-between"><span>Require numbers</span><Switch defaultChecked /></label>
                  <label className="flex items-center justify-between"><span>Require symbols</span><Switch /></label>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2"><Smartphone className="w-4 h-4" /><span className="font-medium">Device limits</span></div>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center justify-between"><span>Block rooted/jailbroken</span><Switch /></label>
                  <label className="flex items-center justify-between"><span>Notify new device login</span><Switch defaultChecked /></label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> IP & Country rules</CardTitle>
            <CardDescription>Restrict access based on location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Allowlist IPs (comma separated)</Label>
              <Input placeholder="192.168.1.1, 10.0.0.5" />
            </div>
            <div>
              <Label>Block countries</Label>
              <Input placeholder="e.g. CN, RU" />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Block TOR/VPN</span>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck className="w-5 h-5" /> Active sessions</CardTitle>
            <CardDescription>Manage and revoke sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2">User</th>
                    <th className="py-2">IP</th>
                    <th className="py-2">Device</th>
                    <th className="py-2">Last active</th>
                    <th className="py-2"/>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3].map((i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-3">admin{i}@domain.com</td>
                      <td className="py-3">102.89.10.{i}</td>
                      <td className="py-3">Chrome on macOS</td>
                      <td className="py-3">2m ago</td>
                      <td className="py-3 text-right"><Button variant="outline" size="sm">Revoke</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Audit log</CardTitle>
            <CardDescription>Recent sensitive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">User updated platform settings</p>
                    <p className="text-muted-foreground text-xs">admin@domain.com • 5m ago • IP 102.89.10.{i}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-accent">OK</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecuritySettings;
