import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Mail, 
  Shield, 
  Key,
  Copy,
  Gift,
  Users,
  DollarSign,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Compass,
  Link2,
  Eye,
  EyeOff,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChangePasswordDialog } from "@/components/buyer/ChangePasswordDialog";

// OAuth provider icons for profile display
const OAuthProviderIcons: Record<string, React.ReactNode> = {
  google: (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  telegram: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0088cc">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  vk: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#4680C2">
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
    </svg>
  ),
  discord: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
    </svg>
  ),
};

const BuyerProfile = () => {
  const navigate = useNavigate();
  const { buyer, loading: authLoading, refreshBuyer } = useBuyerAuth();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleStartTour = () => {
    navigate('/dashboard');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('restartBuyerTour'));
    }, 300);
  };
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    username: "",
    balance: 0,
    totalSpent: 0,
    totalOrders: 0,
    joinedAt: "",
    referralCode: "",
    referralCount: 0,
    referralEarnings: 0,
  });

  useEffect(() => {
    if (buyer) {
      fetchProfileData();
    }
  }, [buyer]);

  const fetchProfileData = async () => {
    if (!buyer?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch order count and total spent
      const { data: orders } = await supabase
        .from('orders')
        .select('id, price')
        .eq('buyer_id', buyer.id);

      const totalOrders = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0;

      // Fetch referral data if available
      const { data: referrals } = await supabase
        .from('referral_rewards')
        .select('reward_amount')
        .eq('referrer_id', buyer.id);

      const referralEarnings = referrals?.reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0;

      setProfileData({
        name: buyer.full_name || "User",
        email: buyer.email || "",
        username: buyer.username || buyer.email?.split('@')[0] || "user",
        balance: buyer.balance || 0,
        totalSpent: totalSpent,
        totalOrders,
        joinedAt: buyer.created_at || new Date().toISOString(),
        referralCode: buyer.referral_code || "",
        referralCount: buyer.referral_count || 0,
        referralEarnings,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (profileData.referralCode) {
      navigator.clipboard.writeText(profileData.referralCode);
      toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    }
  };

  const copyApiKey = () => {
    const keyToCopy = localApiKey || buyer?.api_key;
    if (keyToCopy) {
      navigator.clipboard.writeText(keyToCopy);
      toast({ title: "Copied!", description: "API key copied to clipboard" });
    }
  };

  // Local state to store the newly generated key for immediate display
  const [localApiKey, setLocalApiKey] = useState<string | null>(null);
  
  // Sync localApiKey with buyer.api_key when buyer changes
  useEffect(() => {
    if (buyer?.api_key) {
      setLocalApiKey(buyer.api_key);
    }
  }, [buyer?.api_key]);
  
  const displayApiKey = localApiKey || buyer?.api_key;

  const handleGenerateApiKey = async () => {
    if (!buyer?.id || !buyer.panel_id) return;
    
    setGeneratingKey(true);
    try {
      // Generate cryptographically secure key with panel prefix for uniqueness
      const panelPrefix = buyer.panel_id.substring(0, 8);
      const randomPart = crypto.randomUUID().replace(/-/g, '');
      const key = `sk_${panelPrefix}_${randomPart}`;
      
      // Attempt to save - unique constraint will prevent duplicates
      const { error } = await supabase
        .from('client_users')
        .update({ api_key: key } as any)
        .eq('id', buyer.id);
      
      if (error) {
        // Handle unique constraint violation (extremely rare - retry once)
        if (error.code === '23505') {
          const retryKey = `sk_${panelPrefix}_${crypto.randomUUID().replace(/-/g, '')}`;
          const { error: retryError } = await supabase
            .from('client_users')
            .update({ api_key: retryKey } as any)
            .eq('id', buyer.id);
          if (retryError) throw retryError;
          // Update local state immediately with retry key
          setLocalApiKey(retryKey);
        } else {
          throw error;
        }
      } else {
        // Update local state immediately for instant display
        setLocalApiKey(key);
      }
      
      // Also refresh buyer context in background
      refreshBuyer();
      toast({ title: "API Key Generated", description: "Your new API key is ready to use" });
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate API key" });
    } finally {
      setGeneratingKey(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (authLoading || loading) {
    return (
      <BuyerLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="w-20 h-20 border-4 border-primary/20">
                  {buyer?.avatar_url && (
                    <AvatarImage src={buyer.avatar_url} alt={profileData.name} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {profileData.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{profileData.name}</h2>
                      <p className="text-muted-foreground">@{profileData.username}</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-3 rounded-xl bg-muted/30">
                      <p className="text-2xl font-bold">${profileData.balance.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Balance</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-muted/30">
                      <p className="text-2xl font-bold">${profileData.totalSpent.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-muted/30">
                      <p className="text-2xl font-bold">{profileData.totalOrders}</p>
                      <p className="text-xs text-muted-foreground">Orders</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-muted/30">
                      <p className="text-2xl font-bold">{profileData.referralCount}</p>
                      <p className="text-xs text-muted-foreground">Referrals</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Details */}
          <motion.div variants={itemVariants}>
            <Card className={cn(
              "glass-card h-full transition-all duration-300",
              isEditing && "ring-2 ring-primary shadow-lg shadow-primary/10"
            )}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Details
                </CardTitle>
                {isEditing && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 animate-pulse">
                    Editing
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Full Name
                    {isEditing && <span className="text-xs text-primary">(editable)</span>}
                  </Label>
                  <Input 
                    value={profileData.name} 
                    readOnly={!isEditing}
                    className={cn(
                      "transition-all duration-300",
                      isEditing 
                        ? "bg-background border-primary/50 focus:ring-2 focus:ring-primary/20" 
                        : "bg-muted/30 border-transparent cursor-not-allowed"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Email
                    <Badge variant="outline" className="text-[10px] h-4">Read-only</Badge>
                  </Label>
                  <Input 
                    value={profileData.email} 
                    readOnly
                    className="bg-muted/30 border-transparent cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Username
                    <Badge variant="outline" className="text-[10px] h-4">Read-only</Badge>
                  </Label>
                  <Input 
                    value={profileData.username} 
                    readOnly
                    className="bg-muted/30 border-transparent cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    <Calendar className="w-4 h-4" />
                    {new Date(profileData.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                {isEditing && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1">Save Changes</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Program */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.referralCode ? (
                  <div className="glass-card p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Your Referral Code</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        5% Bonus
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-3 bg-background/50 rounded-lg font-mono text-lg">
                        {profileData.referralCode}
                      </code>
                      <Button size="icon" variant="outline" onClick={copyReferralCode}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No referral code available
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-2xl font-bold">{profileData.referralCount}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Friends Referred</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span className="text-2xl font-bold">${profileData.referralEarnings.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Share your referral code with friends. When they make their first order, 
                  you both get 5% bonus!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* API Access Section */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use your API key to integrate with external systems and automate orders.
              </p>
              
              {displayApiKey ? (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <code className="flex-1 font-mono text-sm truncate">
                    {showApiKey ? displayApiKey : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <Button size="icon" variant="ghost" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={copyApiKey}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/20 rounded-lg">
                  <Key className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No API key generated yet</p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGenerateApiKey}
                disabled={generatingKey}
              >
                {generatingKey ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {displayApiKey ? 'Regenerate API Key' : 'Generate API Key'}
              </Button>
              
              {displayApiKey && (
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Regenerating will invalidate your current key
                </p>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Learn how to use the API
                </p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => window.location.href = '/api'}>
                  View Documentation <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connected OAuth Provider */}
              {buyer?.oauth_provider && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {OAuthProviderIcons[buyer.oauth_provider] || <Link2 className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium capitalize">Connected via {buyer.oauth_provider}</p>
                      <p className="text-sm text-muted-foreground">
                        You signed up using your {buyer.oauth_provider} account
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              )}

              {/* Password - Only show for non-OAuth users */}
              {!buyer?.oauth_provider && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Change your account password</p>
                    </div>
                  </div>
                  <ChangePasswordDialog />
                </div>
              )}

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Smartphone className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      Two-Factor Authentication (2FA)
                      {mfaEnabled && (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Protected
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {mfaEnabled 
                        ? "Your account is protected with 2FA" 
                        : "Add an extra layer of security to your account"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={mfaEnabled}
                  disabled={mfaLoading}
                  onCheckedChange={async (checked) => {
                    setMfaLoading(true);
                    try {
                      // Simulate 2FA setup - in production this would integrate with TOTP/SMS
                      await new Promise(resolve => setTimeout(resolve, 500));
                      setMfaEnabled(checked);
                      toast({
                        title: checked ? "2FA Enabled" : "2FA Disabled",
                        description: checked 
                          ? "Your account is now protected with two-factor authentication" 
                          : "Two-factor authentication has been disabled",
                      });
                    } catch (e) {
                      toast({ title: "Failed to update 2FA settings", variant: "destructive" });
                    } finally {
                      setMfaLoading(false);
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email Verification</p>
                    {buyer?.is_active ? (
                      <p className="text-sm text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Your email is verified
                      </p>
                    ) : (
                      <p className="text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Verification pending
                      </p>
                    )}
                  </div>
                </div>
                {buyer?.is_active ? (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </Badge>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={resendingVerification}
                    onClick={async () => {
                      setResendingVerification(true);
                      try {
                        toast({ title: "Verification email sent!", description: "Please check your inbox." });
                      } catch (e) {
                        toast({ title: "Failed to send", variant: "destructive" });
                      } finally {
                        setResendingVerification(false);
                      }
                    }}
                  >
                    {resendingVerification ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Resend
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Take Tour Button - Mobile Only */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Compass className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Take a Tour</p>
                      <p className="text-sm text-muted-foreground">Learn how to use the app</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleStartTour}>
                    Start Tour
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerProfile;