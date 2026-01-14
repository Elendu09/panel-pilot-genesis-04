import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Mail, Lock, Eye, EyeOff, Loader2, Shield, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';

const TeamAuth = () => {
  const navigate = useNavigate();
  const { panel, loading: tenantLoading } = useTenant();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberRole, setMemberRole] = useState<string | null>(null);

  // Check for existing team session
  useEffect(() => {
    const teamSession = localStorage.getItem('team_session');
    if (teamSession) {
      try {
        const session = JSON.parse(teamSession);
        if (session.panelId === panel?.id && session.token) {
          // Verify token is still valid
          verifyAndRedirect(session);
        }
      } catch (e) {
        localStorage.removeItem('team_session');
      }
    }
  }, [panel?.id]);

  const verifyAndRedirect = async (session: any) => {
    try {
      const { data } = await supabase.functions.invoke('team-auth', {
        body: {
          panelId: session.panelId,
          action: 'verify-token',
          token: session.token
        }
      });

      if (data?.valid) {
        navigate('/team-dashboard');
      } else {
        localStorage.removeItem('team_session');
      }
    } catch (error) {
      localStorage.removeItem('team_session');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Please fill in all fields' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('team-auth', {
        body: {
          panelId: panel?.id,
          action: 'login',
          email,
          password
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast({ variant: 'destructive', title: 'Login failed', description: data.error });
        return;
      }

      // Check if must change password (first login with temp password)
      if (data?.mustChangePassword) {
        setMustChangePassword(true);
        setMemberId(data.memberId);
        setMemberRole(data.role);
        toast({ 
          title: 'Password Change Required', 
          description: 'Please create a new secure password to continue.' 
        });
        return;
      }

      if (data?.success && data?.token) {
        // Save session
        localStorage.setItem('team_session', JSON.stringify({
          memberId: data.member.id,
          email: data.member.email,
          fullName: data.member.full_name,
          role: data.member.role,
          panelId: panel?.id,
          token: data.token,
          expiresAt: Date.now() + (data.expiresIn * 1000)
        }));

        toast({ title: 'Welcome back!', description: `Logged in as ${data.member.role}` });
        navigate('/team-dashboard');
      }
    } catch (error: any) {
      console.error('Team login error:', error);
      toast({ variant: 'destructive', title: 'Login failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast({ variant: 'destructive', title: 'Password must be at least 8 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('team-auth', {
        body: {
          panelId: panel?.id,
          action: 'change-password',
          memberId,
          newPassword
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast({ variant: 'destructive', title: 'Failed to change password', description: data.error });
        return;
      }

      if (data?.success && data?.token) {
        localStorage.setItem('team_session', JSON.stringify({
          memberId: data.member.id,
          email: data.member.email,
          fullName: data.member.full_name,
          role: data.member.role,
          panelId: panel?.id,
          token: data.token,
          expiresAt: Date.now() + (data.expiresIn * 1000)
        }));

        toast({ title: 'Password changed successfully!', description: 'Welcome to the team dashboard.' });
        navigate('/team-dashboard');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      toast({ variant: 'destructive', title: 'Failed to change password', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {mustChangePassword ? 'Change Password' : 'Team Login'}
              </CardTitle>
              <CardDescription className="mt-2">
                {mustChangePassword 
                  ? 'Create a new secure password to access the dashboard'
                  : `Sign in to ${panel?.name || 'Panel'} team dashboard`
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {mustChangePassword ? (
              // Password change form
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Warning about temporary password */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-600 dark:text-yellow-400">First Time Login</p>
                    <p className="text-muted-foreground">
                      You're using a temporary password. Please create a secure password to continue.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Change Password & Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setMustChangePassword(false);
                    setMemberId(null);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              // Login form
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Access is managed by the panel owner</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TeamAuth;
