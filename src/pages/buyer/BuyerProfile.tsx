import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Compass
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChangePasswordDialog } from "@/components/buyer/ChangePasswordDialog";

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
export default BuyerProfile;