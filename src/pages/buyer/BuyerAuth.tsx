import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Lock, Mail, Loader2, ArrowLeft, Sparkles, Shield, Zap, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { BuyerThemeWrapper } from "@/components/buyer-themes";

// OAuth provider icons
const OAuthIcons: Record<string, React.ReactNode> = {
  google: (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  telegram: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0088cc">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  vk: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#4680C2">
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.59 4 8.165c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.455 2.27 4.607 2.86 4.607.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.15-3.574 2.15-3.574.12-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
    </svg>
  ),
  discord: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
    </svg>
  ),
};

interface EnabledOAuthProvider {
  id: string;
  name: string;
  clientId: string;
}

const BuyerAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, loading, buyer, panelId } = useBuyerAuth();
  
  const [activeTab, setActiveTab] = useState<string>(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'signup' ? 'signup' : 'login';
  });
  
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    email: "", 
    username: "", 
    password: "", 
    confirmPassword: "",
    fullName: ""
  });
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  
  // OAuth providers state
  const [oauthProviders, setOauthProviders] = useState<EnabledOAuthProvider[]>([]);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Check for OAuth error in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      toast.error(`Sign in failed: ${decodeURIComponent(errorParam)}`);
      // Clear the error from URL
      navigate('/auth', { replace: true });
    }
  }, [searchParams, navigate]);

  // Fetch enabled OAuth providers for this panel
  useEffect(() => {
    const fetchOAuthProviders = async () => {
      if (!panelId) return;
      
      try {
        const { data: settings } = await supabase
          .from('panel_settings')
          .select('oauth_google_enabled, oauth_google_client_id, oauth_telegram_enabled, oauth_telegram_client_id, oauth_vk_enabled, oauth_vk_client_id, oauth_discord_enabled, oauth_discord_client_id')
          .eq('panel_id', panelId)
          .single();

        if (settings) {
          const enabled: EnabledOAuthProvider[] = [];
          if (settings.oauth_google_enabled && settings.oauth_google_client_id) {
            enabled.push({ id: 'google', name: 'Google', clientId: settings.oauth_google_client_id });
          }
          if (settings.oauth_telegram_enabled && settings.oauth_telegram_client_id) {
            enabled.push({ id: 'telegram', name: 'Telegram', clientId: settings.oauth_telegram_client_id });
          }
          if (settings.oauth_vk_enabled && settings.oauth_vk_client_id) {
            enabled.push({ id: 'vk', name: 'VK', clientId: settings.oauth_vk_client_id });
          }
          if (settings.oauth_discord_enabled && settings.oauth_discord_client_id) {
            enabled.push({ id: 'discord', name: 'Discord', clientId: settings.oauth_discord_client_id });
          }
          setOauthProviders(enabled);
        }
      } catch (err) {
        console.error('Failed to fetch OAuth providers:', err);
      }
    };

    fetchOAuthProviders();
  }, [panelId]);

  // Update tab when URL param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup' || tabParam === 'login') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // If already logged in, redirect to dashboard
  if (buyer) {
    navigate("/dashboard", { replace: true });
    return null;
  }
  
  // Handle OAuth login
  const handleOAuthLogin = (provider: EnabledOAuthProvider) => {
    setOauthLoading(provider.id);
    
    // Store panel ID for callback
    localStorage.setItem('buyer_panel_id', panelId);
    
    const currentOrigin = window.location.origin;
    const state = btoa(JSON.stringify({ panelId, returnUrl: currentOrigin }));
    
    // Supabase edge function callback URL
    const callbackUrl = `https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/oauth-callback?provider=${provider.id}`;
    
    let authUrl = '';
    
    switch (provider.id) {
      case 'google':
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${provider.clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=email%20profile&state=${state}&access_type=offline&prompt=consent`;
        break;
      case 'discord':
        authUrl = `https://discord.com/api/oauth2/authorize?client_id=${provider.clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=identify%20email&state=${state}`;
        break;
      case 'vk':
        authUrl = `https://oauth.vk.com/authorize?client_id=${provider.clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=email&state=${state}&v=5.131`;
        break;
      case 'telegram':
        // Telegram uses a widget-based flow, handled separately
        toast.info('Telegram login uses a popup widget. Please configure the Telegram Login Widget on your domain.');
        setOauthLoading(null);
        return;
      default:
        setOauthLoading(null);
        return;
    }
    
    // Redirect to OAuth provider
    window.location.href = authUrl;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.identifier || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = await signIn(loginData.identifier, loginData.password);
    
    if (!result.error) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      // Handle special cases
      const errorMsg = result.error.message || "Login failed";
      const reason = result.error.reason;
      
      // Check for password reset requirement
      if (reason === 'requiresPasswordReset' || errorMsg.includes('reset your password')) {
        toast.error("Please reset your password to continue");
        setShowForgotPassword(true);
        setForgotPasswordEmail(loginData.identifier.includes('@') ? loginData.identifier : '');
        return;
      }
      
      // Show user-friendly error messages
      toast.error(errorMsg);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.email || !signupData.password || !signupData.confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (signupData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const result = await signUp(signupData.email, signupData.password, signupData.username || signupData.email.split('@')[0]);
    
    if (!result.error) {
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } else {
      toast.error(result.error.message || "Signup failed");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: {
          action: 'forgot-password',
          panelId,
          email: forgotPasswordEmail,
        }
      });

      if (error) throw error;
      
      toast.success(data?.message || "If an account exists with this email, you will receive a password reset link.");
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <BuyerThemeWrapper panelId={panelId || undefined}>
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      {/* Back to Storefront Link */}
      <motion.div 
        className="absolute top-6 left-6 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button 
          variant="ghost" 
          asChild 
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Storefront
          </Link>
        </Button>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <motion.div 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-foreground">Welcome</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted border border-border">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-gray-700 dark:text-gray-300">Email or Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="identifier"
                        type="text"
                        placeholder="Enter email or username"
                        value={loginData.identifier}
                        onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                        className="pl-10 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-primary/20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-primary/20"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary/80 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  
                  {/* OAuth Login Buttons */}
                  {oauthProviders.length > 0 && (
                    <div className="mt-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid gap-2">
                        {oauthProviders.map((provider) => (
                          <Button
                            key={provider.id}
                            type="button"
                            variant="outline"
                            onClick={() => handleOAuthLogin(provider)}
                            disabled={oauthLoading !== null}
                            className="w-full flex items-center justify-center gap-3 h-11"
                          >
                            {oauthLoading === provider.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              OAuthIcons[provider.id]
                            )}
                            <span>Continue with {provider.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </TabsContent>
              
                <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-gray-700 dark:text-gray-300">Username *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="Choose a username"
                        value={signupData.username}
                        onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                        className="pl-10 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-primary/20"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-700 dark:text-gray-300">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="pl-10 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-primary/20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-700 dark:text-gray-300">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="pl-10 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-primary/20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="pl-10 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-primary/20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-white" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  
                  {/* OAuth Signup Buttons */}
                  {oauthProviders.length > 0 && (
                    <div className="mt-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            Or sign up with
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid gap-2">
                        {oauthProviders.map((provider) => (
                          <Button
                            key={provider.id}
                            type="button"
                            variant="outline"
                            onClick={() => handleOAuthLogin(provider)}
                            disabled={oauthLoading !== null}
                            className="w-full flex items-center justify-center gap-3 h-11"
                          >
                            {oauthLoading === provider.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              OAuthIcons[provider.id]
                            )}
                            <span>Continue with {provider.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </TabsContent>
            </Tabs>
            
            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-6 text-gray-400 text-xs">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Trusted</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="your@email.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="pl-10"
                  disabled={forgotPasswordLoading}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForgotPassword(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </BuyerThemeWrapper>
  );
};

export default BuyerAuth;
