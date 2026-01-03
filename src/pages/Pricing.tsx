import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Crown, 
  Rocket,
  ArrowRight,
  Users,
  BarChart3,
  Shield,
  Headphones
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for beginners",
      icon: <Zap className="h-6 w-6" />,
      monthlyPrice: 29,
      yearlyPrice: 290,
      popular: false,
      features: [
        "Up to 1,000 orders/month",
        "5 social platforms",
        "Basic analytics",
        "Email support",
        "Custom branding",
        "API access"
      ],
      limitations: [
        "No advanced analytics",
        "No priority support",
        "Limited customization"
      ]
    },
    {
      name: "Professional",
      description: "Most popular choice",
      icon: <Star className="h-6 w-6" />,
      monthlyPrice: 79,
      yearlyPrice: 790,
      popular: true,
      features: [
        "Up to 10,000 orders/month",
        "All social platforms",
        "Advanced analytics",
        "Priority support",
        "Full white-label",
        "API access",
        "Multi-user management",
        "Custom domain"
      ],
      limitations: [
        "No dedicated support"
      ]
    },
    {
      name: "Enterprise",
      description: "For large businesses",
      icon: <Crown className="h-6 w-6" />,
      monthlyPrice: 199,
      yearlyPrice: 1990,
      popular: false,
      features: [
        "Unlimited orders",
        "All social platforms",
        "Advanced analytics",
        "Dedicated support",
        "Full white-label",
        "API access",
        "Multi-user management",
        "Custom domain",
        "Custom integrations",
        "SLA guarantee"
      ],
      limitations: []
    }
  ];

  const features = [
    {
      feature: "Monthly Orders",
      starter: "1,000",
      professional: "10,000",
      enterprise: "Unlimited"
    },
    {
      feature: "Social Platforms",
      starter: "5",
      professional: "All",
      enterprise: "All"
    },
    {
      feature: "Analytics",
      starter: "Basic",
      professional: "Advanced",
      enterprise: "Advanced"
    },
    {
      feature: "Support",
      starter: "Email",
      professional: "Priority",
      enterprise: "Dedicated"
    },
    {
      feature: "White Label",
      starter: "✓",
      professional: "✓",
      enterprise: "✓"
    },
    {
      feature: "API Access",
      starter: "✓",
      professional: "✓",
      enterprise: "✓"
    },
    {
      feature: "Multi-user",
      starter: "✗",
      professional: "✓",
      enterprise: "✓"
    },
    {
      feature: "Custom Domain",
      starter: "✗",
      professional: "✓",
      enterprise: "✓"
    },
    {
      feature: "Custom Integrations",
      starter: "✗",
      professional: "✗",
      enterprise: "✓"
    },
    {
      feature: "SLA Guarantee",
      starter: "✗",
      professional: "✗",
      enterprise: "✓"
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    return price;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (!isYearly) return 0;
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    return monthlyCost - yearlyCost;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge className="mb-6 bg-gradient-primary text-primary-foreground">
              <Rocket className="w-4 h-4 mr-2" />
              Simple Pricing
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-6">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Transparent pricing with no hidden fees. Start free and scale as you grow.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch 
                checked={isYearly} 
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-primary"
              />
              <span className={`font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              <Badge variant="secondary" className="ml-2">
                Save up to 20%
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`p-8 relative ${
                  plan.popular 
                    ? 'border-primary shadow-xl scale-105 bg-gradient-to-b from-primary/5 to-transparent' 
                    : 'bg-card/70 backdrop-blur-sm'
                } hover:shadow-2xl transition-all`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-8">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    plan.popular ? 'bg-gradient-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">${getPrice(plan)}</span>
                      <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
                    </div>
                    {isYearly && getSavings(plan) > 0 && (
                      <div className="text-sm text-green-600 font-medium mt-2">
                        Save ${getSavings(plan)} per year
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-center gap-3 opacity-60">
                      <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  asChild 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-primary hover:shadow-glow' 
                      : 'variant-outline'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  <Link to="/auth">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Feature Comparison</h2>
            <p className="text-xl text-muted-foreground">
              See what's included in each plan
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-6 font-semibold">Features</th>
                      <th className="text-center p-6 font-semibold">Starter</th>
                      <th className="text-center p-6 font-semibold">Professional</th>
                      <th className="text-center p-6 font-semibold">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-6 font-medium">{row.feature}</td>
                        <td className="p-6 text-center">{row.starter}</td>
                        <td className="p-6 text-center">{row.professional}</td>
                        <td className="p-6 text-center">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee for all new subscriptions.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers for enterprise customers.
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Is there a setup fee?</h3>
              <p className="text-muted-foreground">
                No setup fees. You only pay for your chosen plan, nothing more.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Growing?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of businesses already using HOME OF SMM
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}