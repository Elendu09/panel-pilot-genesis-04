import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface UpgradePromptProps {
  feature: string;
  currentPlan?: 'free' | 'basic' | 'pro';
  requiredPlan?: 'basic' | 'pro';
  className?: string;
  compact?: boolean;
}

export function UpgradePrompt({ 
  feature, 
  currentPlan = 'free', 
  requiredPlan = 'basic',
  className,
  compact = false
}: UpgradePromptProps) {
  const navigate = useNavigate();
  
  const planLabel = requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1);
  const planPrice = requiredPlan === 'basic' ? '$5' : '$15';
  
  if (compact) {
    return (
      <div className={cn(
        "flex items-center justify-between p-4 rounded-xl",
        "bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10",
        "border border-amber-500/30",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="font-medium text-sm">{feature} requires {planLabel}</p>
            <p className="text-xs text-muted-foreground">Starting at {planPrice}/month</p>
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={() => navigate('/panel/billing')}
          className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          Upgrade
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    );
  }
  
  return (
    <Card className={cn(
      "border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-yellow-500/5",
      "overflow-hidden",
      className
    )}>
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl" />
      
      <CardContent className="relative p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Crown className="w-8 h-8 text-amber-500" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            {feature} is a {planLabel} Feature
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Upgrade your plan to unlock {feature.toLowerCase()} and many more powerful features
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button 
            onClick={() => navigate('/panel/billing')} 
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
          >
            <Sparkles className="w-4 h-4" />
            View Plans
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/panel/billing')}
            className="border-amber-500/30 hover:bg-amber-500/10"
          >
            Compare Features
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Plans start at just {requiredPlan === 'basic' ? '$5/month' : '$15/month'}
        </p>
      </CardContent>
    </Card>
  );
}
