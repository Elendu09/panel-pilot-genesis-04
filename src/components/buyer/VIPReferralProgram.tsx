import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Gift, 
  Copy, 
  Users, 
  DollarSign, 
  Share2, 
  Trophy,
  Lock,
  Sparkles,
  Check
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "@/hooks/use-toast";

interface ReferralReward {
  id: string;
  reward_amount: number;
  order_amount: number;
  status: string;
  created_at: string;
}

export const VIPReferralProgram = () => {
  const { buyer } = useBuyerAuth();
  const { panel } = useTenant();
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isVip = buyer?.is_vip || false;
  const referralCode = buyer?.referral_code || '';
  const referralCount = buyer?.referral_count || 0;

  useEffect(() => {
    if (buyer?.id) {
      fetchRewards();
    }
  }, [buyer?.id]);

  const fetchRewards = async () => {
    if (!buyer?.id) return;

    try {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('referrer_id', buyer.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalEarned = rewards.reduce((sum, r) => sum + (r.reward_amount || 0), 0);
  const pendingRewards = rewards.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.reward_amount, 0);

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `Join me on this amazing SMM panel! Use my referral code ${referralCode} to get started: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnTelegram = () => {
    const text = `Join me on this amazing SMM panel! Use my referral code ${referralCode} to get started: ${referralLink}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!isVip) {
    return (
      <Card className="glass-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10" />
        <CardContent className="relative p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">VIP Exclusive</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            The referral program is exclusively available for VIP members. 
            Contact support to learn how to become a VIP.
          </p>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Crown className="w-3 h-3 mr-1" />
            VIP Only Feature
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* VIP Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 p-6 text-white"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold">VIP Member</h3>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-white/80 text-sm">
              You have access to the exclusive referral program!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{referralCount}</p>
            <p className="text-xs text-muted-foreground">Total Referrals</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
            <p className="text-2xl font-bold">${totalEarned.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">${pendingRewards.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold">5%</p>
            <p className="text-xs text-muted-foreground">Commission</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share & Earn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Referral Code</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                5% Bonus
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-background/50 rounded-lg font-mono text-lg text-center">
                {referralCode}
              </code>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={copyReferralCode}
                className={cn(copied && "bg-emerald-500/10 border-emerald-500/20")}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Share via</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={copyReferralLink} className="gap-2">
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              <Button 
                variant="outline" 
                onClick={shareOnWhatsApp}
                className="gap-2 hover:bg-[#25D366]/10 hover:border-[#25D366]/50 hover:text-[#25D366]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                onClick={shareOnTelegram}
                className="gap-2 hover:bg-[#0088cc]/10 hover:border-[#0088cc]/50 hover:text-[#0088cc]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Share your referral code with friends. When they sign up and make their first order, 
            you'll earn 5% of their order value as bonus credits!
          </p>
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      {rewards.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Recent Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rewards.slice(0, 5).map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">
                      Referral bonus from ${reward.order_amount.toFixed(2)} order
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reward.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500">+${reward.reward_amount.toFixed(2)}</p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        reward.status === 'completed' 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}
                    >
                      {reward.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper component for Label
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-sm font-medium", className)}>{children}</p>
);

export default VIPReferralProgram;
