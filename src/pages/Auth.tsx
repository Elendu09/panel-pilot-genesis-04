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
import { Loader2, User, Mail, ArrowRight, Shield, Globe, BarChart3, Sparkles } from 'lucide-react';

const LAST_PANEL_ROUTE_KEY = 'homeofsmm_last_panel_route';

const features = [
  { icon: Globe, title: 'Custom Domains', desc: 'Launch your own branded panel' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track orders, revenue & growth' },
  { icon: Shield, title: 'Enterprise Security', desc: '2FA, audit logs & role-based access' },
  { icon: Sparkles, title: '150+ Payment Methods', desc: 'Accept payments globally' },
];

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

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
    if (location.state?.from?.pathname) return location.state.from.pathname;
    const lastRoute = localStorage.getItem(LAST_PANEL_ROUTE_KEY);
    if (lastRoute) return lastRoute;
    return null;
  };

  useEffect(() => {
    if (searchParams.get('type') === 'recovery') setIsRecoveryMode(true);
  }, [searchParams]);

  useEffect(() => {
    if (isRecoveryMode) return;
    if (user && profile) {
      if (isVerificationCallback) { checkOnboardingAndRedirect(null); return; }
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
      // Check for incomplete panels first to avoid redirect loops
      const { data: incompletePanels } = await supabase
        .from('panels')
        .select('id')
        .eq('owner_id', profile.id)
        .eq('onboarding_completed', false)
        .limit(1);

      if (incompletePanels && incompletePanels.length > 0) {
        navigate('/panel/onboarding', { replace: true });
        return;
      }

      const { data: panels } = await supabase
        .from('panels')
        .select('onboarding_completed')
        .eq('owner_id', profile.id)
        .eq('onboarding_completed', true)
        .limit(1);

      if (!panels || panels.length === 0) {
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
      toast({ title: "Email Not Verified", description: "Please verify your email to continue." });
    } else if (!result.error) {
      toast({ title: "Welcome back!", description: "You have been signed in successfully." });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const trimmedUsername = username.trim();
    const trimmedFullName = fullName.trim();
    if (!trimmedFullName) { toast({ variant: "destructive", title: "Full Name Required" }); setLoading(false); return; }
    if (trimmedFullName.length < 2) { toast({ variant: "destructive", title: "Name Too Short" }); setLoading(false); return; }
    if (!trimmedUsername) { toast({ variant: "destructive", title: "Username Required" }); setLoading(false); return; }
    if (trimmedUsername.length < 3) { toast({ variant: "destructive", title: "Username Too Short" }); setLoading(false); return; }
    if (trimmedUsername.length > 20) { toast({ variant: "destructive", title: "Username Too Long" }); setLoading(false); return; }
    
    const { data: existingUser } = await supabase.from('profiles').select('id').ilike('username', trimmedUsername).maybeSingle();
    if (existingUser) { toast({ variant: "destructive", title: "Username Taken" }); setLoading(false); return; }
    
    const { error } = await signUp(email, password, trimmedUsername, trimmedFullName);
    if (!error) { setRegisteredEmail(email); setShowVerification(true); }
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
      if (error) toast({ variant: "destructive", title: "Google Sign In Failed", description: error.message });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Google Sign In Failed", description: error.message });
    } finally { setGoogleLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your email address." });
      return;
    }
    // Basic email format check that accepts all TLDs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      toast({ variant: "destructive", title: "Invalid Email", description: "Please enter a valid email address." });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/auth?type=recovery`
      });
      if (error) {
        let desc = error.message;
        if (error.message?.toLowerCase().includes('rate limit')) {
          desc = "Too many reset attempts. Please wait a few minutes and try again.";
        } else if (error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('no user')) {
          desc = "If an account exists with this email, you'll receive reset instructions shortly.";
        }
        toast({ variant: "destructive", title: "Reset Failed", description: desc });
      } else {
        toast({ title: "Reset Email Sent", description: "If an account exists with this email, you'll receive reset instructions shortly." });
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Reset Failed", description: "Network error. Please check your connection and try again." });
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast({ variant: 'destructive', title: 'Passwords do not match' }); return; }
    if (newPassword.length < 6) { toast({ variant: 'destructive', title: 'Password too short' }); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: 'Password Updated' });
      setIsRecoveryMode(false);
      navigate('/auth', { replace: true });
    } catch (error: any) { toast({ variant: 'destructive', title: 'Reset Failed', description: error.message }); }
    finally { setLoading(false); }
  };

  const Divider = () => (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-3 text-muted-foreground">or</span>
      </div>
    </div>
  );

  const GoogleButton = ({ label }: { label: string }) => (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 gap-3 border-border hover:bg-muted/50 transition-colors"
      onClick={handleGoogleSignIn}
      disabled={googleLoading}
      data-testid="button-google-signin"
    >
      {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleLogo />}
      {label}
    </Button>
  );

  // Recovery mode
  if (isRecoveryMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet><title>Reset Password - HOME OF SMM</title><meta name="robots" content="noindex,nofollow" /></Helmet>
        <Card className="w-full max-w-md bg-card border-border shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-foreground">Set New Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
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
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading} data-testid="button-update-password">
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
        onBack={() => { setShowVerification(false); setIdentifier(''); setPassword(''); setUsername(''); setFullName(''); setEmail(''); }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Helmet>
        <title>Sign In - HOME OF SMM Platform</title>
        <meta name="description" content="Sign in to your HOME OF SMM account or create a new panel." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Left Panel — Branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-12 xl:px-20 bg-muted/30 border-r border-border">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/favicon.ico" alt="HOME OF SMM" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">HOME OF SMM</h1>
          </div>
          
          <h2 className="text-4xl xl:text-5xl font-extrabold text-foreground leading-tight mb-4">
            Launch Your SMM
            <br />
            <span className="text-primary">Empire Today</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            The all-in-one platform to create, manage & scale your social media marketing panel business.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="p-2 rounded-lg bg-primary/10">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-10 left-12 text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} HOME OF SMM. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md bg-card border-border shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden mx-auto mb-3 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/favicon.ico" alt="HOME OF SMM" className="w-8 h-8 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              <span className="lg:hidden">HOME OF SMM</span>
              <span className="hidden lg:inline">Welcome Back</span>
            </CardTitle>
            <CardDescription>
              <span className="lg:hidden">Launch and manage your SMM panel business</span>
              <span className="hidden lg:inline">Sign in to your account to continue</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Reset Password</h3>
                  <p className="text-sm text-muted-foreground">Enter your email to receive reset instructions</p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="resetEmail" type="text" inputMode="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Enter your email" className="pl-10 h-11" required data-testid="input-reset-email" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading} data-testid="button-send-reset">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => { setShowForgotPassword(false); setResetEmail(''); }} data-testid="button-back-to-signin">
                    Back to Sign In
                  </Button>
                </form>
              </div>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50">
                  <TabsTrigger value="signin" data-testid="tab-signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
                </TabsList>
              
                <TabsContent value="signin" className="space-y-0">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier">Email or Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter email or username" className="pl-10 h-11" required data-testid="input-identifier" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs text-primary hover:underline" data-testid="button-forgot-password">Forgot password?</button>
                      </div>
                      <PasswordInput id="password" value={password} onChange={setPassword} placeholder="Enter your password" />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground gap-2" disabled={loading} data-testid="button-signin">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                  <Divider />
                  <GoogleButton label="Sign in with Google" />
                </TabsContent>
              
                <TabsContent value="signup" className="space-y-0">
                  <form onSubmit={handleSignUp} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="pl-10 h-11" required data-testid="input-fullname" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" className="pl-10 h-11" required data-testid="input-username" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="pl-10 h-11" required data-testid="input-email" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword">Password</Label>
                      <PasswordInput id="signupPassword" value={password} onChange={setPassword} placeholder="Create a password" />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground gap-2" disabled={loading} data-testid="button-signup">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                  <Divider />
                  <GoogleButton label="Sign up with Google" />
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
