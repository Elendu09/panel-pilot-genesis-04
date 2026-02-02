import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderLimitBannerProps {
  currentCount: number;
  maxAllowed: number;
  plan: string;
  className?: string;
}

const planConfig = {
  free: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Free" },
  basic: { color: "text-blue-500", bgColor: "bg-blue-500/10", label: "Basic" },
  pro: { color: "text-amber-500", bgColor: "bg-amber-500/10", label: "Pro" },
};

export function ProviderLimitBanner({ 
  currentCount, 
  maxAllowed, 
  plan,
  className 
}: ProviderLimitBannerProps) {
  const config = planConfig[plan as keyof typeof planConfig] || planConfig.free;
  const isAtLimit = currentCount >= maxAllowed;
  const percentage = maxAllowed === Infinity ? 0 : (currentCount / maxAllowed) * 100;
  const isUnlimited = maxAllowed === Infinity;

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border",
      isAtLimit && !isUnlimited ? "border-amber-500/50 bg-amber-500/5" : "border-border bg-muted/30",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", config.bgColor)}>
          <Crown className={cn("w-5 h-5", config.color)} />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", config.color)}>
              {config.label} Plan
            </Badge>
            {isAtLimit && !isUnlimited && (
              <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/50">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Limit Reached
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">
              {isUnlimited ? (
                <>Providers: <span className="text-green-500">{currentCount}</span> (Unlimited)</>
              ) : (
                <>Providers: <span className={isAtLimit ? "text-amber-500" : "text-green-500"}>{currentCount}</span> / {maxAllowed}</>
              )}
            </span>
          </div>
          
          {!isUnlimited && (
            <Progress 
              value={percentage} 
              className={cn("h-1.5 w-32", isAtLimit && "[&>div]:bg-amber-500")}
            />
          )}
        </div>
      </div>

      {plan !== 'pro' && (
        <Link to="/panel/billing">
          <Button 
            size="sm" 
            variant={isAtLimit ? "default" : "outline"}
            className={cn(
              "gap-2",
              isAtLimit && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            )}
          >
            <Zap className="w-4 h-4" />
            Upgrade for More
          </Button>
        </Link>
      )}
    </div>
  );
}
