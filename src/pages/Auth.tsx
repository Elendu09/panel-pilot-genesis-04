import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EmailVerificationKanban from '@/components/auth/EmailVerificationKanban';
import { Loader2, User, Mail, Lock, ArrowRight, Zap, Shield, Globe, BarChart3, Sparkles } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';

const LAST_PANEL_ROUTE_KEY = 'homeofsmm_last_panel_route';

const features = [
  { icon: Globe, title: 'Custom Domains', desc: 'Launch your own branded panel' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track orders, revenue & growth' },
  { icon: Shield, title: 'Enterprise Security', desc: '2FA, audit logs & role-based access' },
  { icon: Sparkles, title: '150+ Payment Methods', desc: 'Accept payments globally' },
];

const Auth = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  
  const { signIn, signUp, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const isVerificationCallback = searchParams.get('verified') === 'true' || 
                                  searchParams.get('type') === 'signup' ||
                                  searchParams.has('access_token') ||
                                  searchParams.has('token_hash');

  const getRedirectPath = () => {
    if (location.state?.from?.pathname) {
      return location.state.from.pathname;
    }
    const lastRoute = localStorage.getItem(LAST_PANEL_ROUTE_KEY);
    if (lastRoute) {
      return lastRoute;
    }
    return null;
  };

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setIsRecoveryMode(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isRecoveryMode) return;
    if (user && profile) {
      if (isVerificationCallback) {
        checkOnboardingAndRedirect(null);
        return;
      }
      
      const intendedPath = getRedirectPath();
      
      if (profile.role === 'admin') {
        navigate(intendedPath?.startsWith('/admin') ? intendedPath : '/admin', { replace: true });
      } else {
        checkOnboardingAndRedirect(intendedPath);
      }
    }
  }, [user, profile, isVerificationCallback, isRecoveryMode]);

  const checkOnboardingAndRedirect = async (intendedPath: string | null) => {
    if (!profile?.id) return;

    try {
      const { data: panels } = await supabase
        .from('panels')
        .select('onboarding_completed')
        .eq('owner_id', profile.id)
        .eq('onboarding_completed', true)
        .limit(1);

      const hasCompletedOnboarding = panels && panels.length > 0 && panels[0].onboarding_completed;

      if (!hasCompletedOnboarding) {
        navigate('/panel/onboarding', { replace: true });
      } else if (intendedPath?.startsWith('/panel')) {
        navigate(intendedPath, { replace: true });
      } else {
        navigate('/panel', { replace: true });
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      navigate('/panel/onboarding', { replace: true });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await signIn(identifier, password);
    
    if (result.emailNotVerified) {
      setRegisteredEmail(result.email || identifier);
      setShowVerification(true);
      toast({
        title: "Email Not Verified",
        description: "Please verify your email to continue."
      });
    } else if (!result.error) {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully."
      });
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const trimmedUsername = username.trim();
    const trimmedFullName = fullName.trim();
    
    if (!trimmedFullName) {
      toast({ variant: "destructive", title: "Full Name Required", description: "Please enter your full name." });
      setLoading(false);
      return;
    }

    if (trimmedFullName.length < 2) {
      toast({ variant: "destructive", title: "Name Too Short", description: "Full name must be at least 2 characters." });
      setLoading(false);
      return;
    }
    
    if (!trimmedUsername) {
      toast({ variant: "destructive", title: "Username Required", description: "Please enter a username." });
      setLoading(false);
      return;
    }
    
    if (trimmedUsername.length < 3) {
      toast({ variant: "destructive", title: "Username Too Short", description: "Username must be at least 3 characters." });
      setLoading(false);
      return;
    }
    
    if (trimmedUsername.length > 20) {
      toast({ variant: "destructive", title: "Username Too Long", description: "Username must be 20 characters or less." });
      setLoading(false);
      return;
    }
    
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', trimmedUsername)
      .maybeSingle();
    
    if (existingUser) {
      toast({ variant: "destructive", title: "Username Taken", description: "This username is already in use. Please choose another." });
      setLoading(false);
      return;
    }
    
    const { error } = await signUp(email, password, trimmedUsername, trimmedFullName);
    
    if (!error) {
      setRegisteredEmail(email);
      setShowVerification(true);
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth?verified=true`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });
      
      if (error) {
        toast({ variant: "destructive", title: "Google Sign In Failed", description: error.message });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Google Sign In Failed", description: error.message || "An unexpected error occurred." });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?type=recovery`
      });
      
      if (error) {
        toast({ variant: "destructive", title: "Reset Failed", description: error.message });
      } else {
        toast({ title: "Reset Email Sent", description: "Check your email for password reset instructions." });
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Reset Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Password too short', description: 'Minimum 6 characters.' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: 'Password Updated', description: 'Your password has been reset successfully.' });
      setIsRecoveryMode(false);
      setNewPassword('');
      setConfirmPassword('');
      navigate('/auth', { replace: true });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Reset Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const Divider = () => (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/60" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card/80 px-3 text-muted-foreground">or continue with</span>
      </div>
    </div>
  );

  const GoogleButton = ({ label }: { label: string }) => (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 gap-2 border-border/60 hover:bg-muted/50 transition-all"
      onClick={handleGoogleSignIn}
      disabled={googleLoading}
      data-testid="button-google-signin"
    >
      {googleLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <SiGoogle className="w-4 h-4" />
      )}
      {label}
    </Button>
  );

  // Recovery mode
  if (isRecoveryMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
        <Helmet>
          <title>Reset Password - HOME OF SMM</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <Card className="relative w-full max-w-md bg-card/90 backdrop-blur-xl border-border/40 shadow-2xl shadow-indigo-500/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Set New Password
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput id="newPassword" value={newPassword} onChange={setNewPassword} placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput id="confirmPassword" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" />
              </div>
              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all" disabled={loading} data-testid="button-update-password">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email verification
  if (showVerification) {
    return (
      <EmailVerificationKanban 
        email={registeredEmail} 
        onBack={() => {
          setShowVerification(false);
          setIdentifier('');
          setPassword('');
          setUsername('');
          setFullName('');
          setEmail('');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 flex">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
      
      <Helmet>
        <title>Sign In - HOME OF SMM Platform</title>
        <meta name="description" content="Sign in to your HOME OF SMM account or create a new panel to start your SMM business." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Left Panel — Branding & Features (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-12 xl:px-20">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              HOME OF SMM
            </h1>
          </div>
          
          <h2 className="text-4xl xl:text-5xl font-extrabold text-foreground leading-tight mb-4">
            Launch Your SMM
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Empire Today
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            The all-in-one platform to create, manage & scale your social media marketing panel business.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/20">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
                  <f.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-10 left-12 text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} HOME OF SMM. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <Card className="w-full max-w-md bg-card/90 backdrop-blur-xl border-border/40 shadow-2xl shadow-indigo-500/5">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden mx-auto mb-3 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              <span className="lg:hidden">HOME OF SMM</span>
              <span className="hidden lg:inline">Welcome Back</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              <span className="lg:hidden">Launch and manage your SMM panel business</span>
              <span className="hidden lg:inline">Sign in to your account to continue</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Reset Password</h3>
                  <p className="text-sm text-muted-foreground/80">
                    Enter your email to receive reset instructions
                  </p>
                </div>
                
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="resetEmail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10 h-11"
                        required
                        data-testid="input-reset-email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25" disabled={loading} data-testid="button-send-reset">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {loading ? 'Sending...' : 'Send Reset Email'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => { setShowForgotPassword(false); setResetEmail(''); }}
                      data-testid="button-back-to-signin"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50">
                  <TabsTrigger value="signin" data-testid="tab-signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
                </TabsList>
              
                <TabsContent value="signin" className="space-y-0">
                  <GoogleButton label="Sign in with Google" />
                  <Divider />
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier">Email or Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="identifier"
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Enter email or username"
                          className="pl-10 h-11"
                          required
                          data-testid="input-identifier"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-primary hover:underline"
                          data-testid="button-forgot-password"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Enter your password"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all gap-2" disabled={loading} data-testid="button-signin">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
              
                <TabsContent value="signup" className="space-y-0">
                  <GoogleButton label="Sign up with Google" />
                  <Divider />
                  <form onSubmit={handleSignUp} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="pl-10 h-11"
                          required
                          data-testid="input-fullname"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Choose a username"
                          className="pl-10 h-11"
                          required
                          data-testid="input-username"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="pl-10 h-11"
                          required
                          data-testid="input-email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword">Password</Label>
                      <PasswordInput
                        id="signupPassword"
                        value={password}
                        onChange={setPassword}
                        placeholder="Create a password"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all gap-2" disabled={loading} data-testid="button-signup">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
