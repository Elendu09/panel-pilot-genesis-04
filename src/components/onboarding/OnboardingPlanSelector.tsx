import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Sparkles, Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Plan {
  id: 'free' | 'basic' | 'pro';
  name: string;
  price: number;
  period: string;
  description: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  features: string[];
  highlighted: boolean;
  domainType: 'subdomain' | 'custom';
  hasTrial: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic features',
    icon: Zap,
    color: 'from-slate-500 to-slate-600',
    glowColor: '',
    features: [
      'Subdomain only',
      'Up to 100 Services',
      '100 Orders/month',
      'Basic Analytics',
      'Email Support'
    ],
    highlighted: false,
    domainType: 'subdomain',
    hasTrial: false
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 5,
    period: 'month',
    description: 'Perfect for growing panels',
    icon: Sparkles,
    color: 'from-blue-500 to-blue-600',
    glowColor: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    features: [
      'Up to 5,000 Services',
      'Full Analytics Dashboard',
      'Priority Email Support',
      'Custom Domain',
      '1,000 Orders/month',
      'API Access'
    ],
    highlighted: false,
    domainType: 'custom',
    hasTrial: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15,
    period: 'month',
    description: 'For serious SMM businesses',
    icon: Crown,
    color: 'from-amber-500 to-amber-600',
    glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    features: [
      'Up to 10,000 Services',
      'Advanced Analytics + Reports',
      '24/7 Priority Support',
      'Multiple Custom Domains',
      'Unlimited Orders',
      'Full API Access',
      'White-label Branding',
      'Custom Integrations'
    ],
    highlighted: true,
    domainType: 'custom',
    hasTrial: true
  }
];

interface OnboardingPlanSelectorProps {
  selectedPlan: 'free' | 'basic' | 'pro';
  onSelectPlan: (plan: 'free' | 'basic' | 'pro') => void;
  lockedPlan?: 'free' | 'basic' | 'pro' | null;
}

export const OnboardingPlanSelector = ({ selectedPlan, onSelectPlan, lockedPlan }: OnboardingPlanSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">Select a plan that fits your business needs</p>
      </div>

      {lockedPlan && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-3">
          <Lock className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            You've already subscribed to the <strong className="text-foreground">{lockedPlan.charAt(0).toUpperCase() + lockedPlan.slice(1)}</strong> plan. Continue with your current plan.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          const isLocked = !!lockedPlan && plan.id !== lockedPlan;
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: plans.indexOf(plan) * 0.1 }}
              className="relative"
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground px-3">
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card 
                className={cn(
                  "bg-card/60 backdrop-blur-xl border-2 h-full transition-all duration-300",
                  isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                  plan.highlighted && !isLocked && "border-primary/50 shadow-lg shadow-primary/10",
                  isSelected && !isLocked && "ring-2 ring-primary border-primary",
                  !isSelected && !isLocked && "border-border/50 hover:border-primary/30",
                  !isLocked && plan.glowColor
                )}
                onClick={() => !isLocked && onSelectPlan(plan.id)}
              >
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30",
                  `bg-gradient-to-br ${plan.color}`
                )} />
                
                <CardHeader className="text-center pb-2">
                  <div className={cn(
                    "w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br",
                    plan.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  {plan.hasTrial && (
                    <Badge variant="outline" className="mx-auto mt-1 gap-1 text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                      <Clock className="w-3 h-3" />
                      3-day free trial
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-xs text-muted-foreground">
                        +{plan.features.length - 5} more features
                      </li>
                    )}
                  </ul>
                  
                  <Button
                    className={cn(
                      "w-full gap-2",
                      isSelected && !isLocked && "bg-primary",
                      lockedPlan === plan.id && "bg-emerald-600 hover:bg-emerald-600"
                    )}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    disabled={isLocked}
                  >
                    {lockedPlan === plan.id ? (
                      <><Lock className="w-3 h-3" /> Paid</>
                    ) : isLocked ? (
                      <><Lock className="w-3 h-3" /> Locked</>
                    ) : isSelected ? 'Selected' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedPlan !== 'free' && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
          <p className="text-sm text-center text-muted-foreground">
            🎉 Start with a <strong>3-day free trial</strong> — payment required after trial ends
          </p>
        </div>
      )}
    </div>
  );
};
