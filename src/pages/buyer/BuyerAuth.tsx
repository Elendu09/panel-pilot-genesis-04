import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Lock, Mail, Loader2, ArrowLeft, Sparkles, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

const BuyerAuth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loading, buyer, panelId } = useBuyerAuth();
  
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    email: "", 
    username: "", 
    password: "", 
    confirmPassword: "",
    fullName: ""
  });

  // If already logged in, redirect to dashboard
  if (buyer) {
    navigate("/dashboard", { replace: true });
    return null;
  }

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
      toast.error(result.error.message || "Login failed");
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

    const result = await signUp(signupData.email, signupData.password, signupData.fullName || signupData.email.split('@')[0]);
    
    if (!result.error) {
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } else {
      toast.error(result.error.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 py-12 px-4">
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
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 shadow-xl">
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
            
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Welcome</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
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
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
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
                    <Label htmlFor="signup-fullname" className="text-gray-700 dark:text-gray-300">Full Name (optional)</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="Your full name"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      className="bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-primary/20"
                      disabled={loading}
                    />
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
    </div>
  );
};

export default BuyerAuth;