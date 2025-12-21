import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Copy, Gift, Link2, Users, TrendingUp, DollarSign, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface ReferralSectionProps {
  customer: {
    id: string;
    name: string;
    referralCode?: string;
    referredBy?: string;
    referralCount?: number;
    customDiscount?: number;
  };
  panelDomain?: string;
}

export const ReferralSection = ({ customer, panelDomain = "yourpanel.com" }: ReferralSectionProps) => {
  const referralLink = `https://${panelDomain}/signup?ref=${customer.referralCode || ""}`;
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ 
      title: "Copied!", 
      description: `${label} copied to clipboard` 
    });
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on this platform!',
          text: `Use my referral code ${customer.referralCode} to get started!`,
          url: referralLink,
        });
      } catch (err) {
        copyToClipboard(referralLink, "Referral link");
      }
    } else {
      copyToClipboard(referralLink, "Referral link");
    }
  };

  // Mock rewards earned (would come from real data)
  const totalRewardsEarned = (customer.referralCount || 0) * 2.50;

  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <Gift className="w-4 h-4 text-primary" />
        Referral Program
      </h4>

      {/* Referral Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Referral Code</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Active
              </Badge>
            </div>
            <div className="flex gap-2">
              <Input 
                value={customer.referralCode || "N/A"} 
                readOnly 
                className="font-mono text-lg font-bold text-center bg-background/50"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(customer.referralCode || "", "Referral code")}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referral Link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Referral Link</span>
            </div>
            <div className="flex gap-2">
              <Input 
                value={referralLink} 
                readOnly 
                className="text-sm bg-background/50 truncate"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={shareReferral}
                className="shrink-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{customer.referralCount || 0}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500">${totalRewardsEarned.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referred By */}
      {customer.referredBy && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Referred By</p>
                  <p className="font-mono font-semibold">{customer.referredBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Custom Discount Display */}
      {customer.customDiscount && customer.customDiscount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Custom Discount</p>
                    <p className="font-semibold">Special Pricing Active</p>
                  </div>
                </div>
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                  -{customer.customDiscount}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
