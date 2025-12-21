import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Percent, 
  TrendingUp, 
  DollarSign,
  CreditCard,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommissionTrackerProps {
  commissionRate?: number;
  earnedThisMonth?: number;
  pendingCommission?: number;
  paidCommission?: number;
  onPayCommission?: () => void;
}

export const CommissionTracker = ({
  commissionRate = 5,
  earnedThisMonth = 127.50,
  pendingCommission = 45.00,
  paidCommission = 82.50,
  onPayCommission,
}: CommissionTrackerProps) => {
  const totalEarned = pendingCommission + paidCommission;
  const paidPercentage = totalEarned > 0 ? (paidCommission / totalEarned) * 100 : 0;

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Percent className="w-5 h-5" />
          Commission Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Commission Rate Banner */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Percent className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Commission Rate</p>
              <p className="text-2xl font-bold text-primary">{commissionRate}%</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10 border-primary/20">
            Platform Fee
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xl font-bold">${earnedThisMonth.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-orange-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xl font-bold text-orange-500">${pendingCommission.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-blue-500">${paidCommission.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Paid</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Commission Paid</span>
            <span className="font-medium">{paidPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={paidPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${paidCommission.toFixed(2)} paid</span>
            <span>${pendingCommission.toFixed(2)} remaining</span>
          </div>
        </div>

        {/* Pay Commission Button */}
        {pendingCommission > 0 && (
          <Button 
            className="w-full gap-2" 
            variant="outline"
            onClick={onPayCommission}
          >
            <CreditCard className="w-4 h-4" />
            Pay Commission (${pendingCommission.toFixed(2)})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
