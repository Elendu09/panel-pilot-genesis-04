import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Headphones,
  CreditCard,
  Globe,
  Sparkles,
  TrendingUp,
  Server,
  Lock,
  Clock,
  ChevronDown,
  DollarSign,
  Percent,
  Gift,
  Calculator
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [orderVolume, setOrderVolume] = useState([5000]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Calculate dynamic pricing based on order volume
  const dynamicPricing = useMemo(() => {
    const orders = orderVolume[0];
    let basePrice = 0;
    let planName = "Starter";
    
    if (orders <= 1000) {
      basePrice = 29;
      planName = "Starter";
    } else if (orders <= 5000) {
      basePrice = 49;
      planName = "Growth";
    } else if (orders <= 15000) {
      basePrice = 79;
      planName = "Professional";
    } else if (orders <= 50000) {
      basePrice = 149;
      planName = "Business";
    } else if (orders <= 100000) {
      basePrice = 249;
      planName = "Scale";
    } else {
      basePrice = 399;
      planName = "Enterprise";
    }
    
    const yearlyPrice = Math.round(basePrice * 10); // ~17% discount
    const yearlySavings = (basePrice * 12) - yearlyPrice;
    const pricePerOrder = basePrice / orders;
    
    return {
      monthlyPrice: basePrice,
      yearlyPrice,
      yearlySavings,
      planName,
      pricePerOrder,
      orders
    };
  }, [orderVolume]);

  // ROI Calculator
  const roiData = useMemo(() => {
    const avgOrderValue = 2.5; // Average revenue per order
    const monthlyRevenue = dynamicPricing.orders * avgOrderValue;
    const monthlyCost = isYearly ? dynamicPricing.yearlyPrice / 12 : dynamicPricing.monthlyPrice;
    const monthlyProfit = monthlyRevenue - monthlyCost;
    const roi = ((monthlyProfit / monthlyCost) * 100).toFixed(0);
    
    return {
      monthlyRevenue,
      monthlyCost,
      monthlyProfit,
      roi: parseInt(roi)
    };
  }, [dynamicPricing, isYearly]);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for new panel owners",
      icon: <Zap className="h-6 w-6" />,
      monthlyPrice: 29,
      yearlyPrice: 290,
      ordersIncluded: "1,000",
      popular: false,
      color: "from-blue-500 to-cyan-500",
      features: [
        "Up to 1,000 orders/month",
        "All 50+ social platforms",
        "Real-time analytics dashboard",
        "24/7 email support",
        "Full white-label branding",
        "API access included",
        "Custom domain support",
        "10+ payment gateways"
      ],
      limitations: []
    },
    {
      name: "Professional",
      description: "Most popular for growing panels",
      icon: <Star className="h-6 w-6" />,
      monthlyPrice: 79,
      yearlyPrice: 790,
      ordersIncluded: "15,000",
      popular: true,
      color: "from-primary to-primary-glow",
      features: [
        "Up to 15,000 orders/month",
        "All 50+ social platforms",
        "Advanced analytics + reports",
        "Priority 24/7 support",
        "Full white-label branding",
        "API access + webhooks",
        "Custom domain + SSL",
        "200+ payment gateways",
        "Multi-user management",
        "Automated order syncing"
      ],
      limitations: []
    },
    {
      name: "Enterprise",
      description: "For high-volume businesses",
      icon: <Crown className="h-6 w-6" />,
      monthlyPrice: 249,
      yearlyPrice: 2490,
      ordersIncluded: "Unlimited",
      popular: false,
      color: "from-amber-500 to-orange-500",
      features: [
        "Unlimited orders/month",
        "All 50+ social platforms",
        "Enterprise analytics suite",
        "Dedicated account manager",
        "Full white-label branding",
        "Priority API + webhooks",
        "Custom domain + SSL",
        "200+ payment gateways",
        "Unlimited team members",
        "Automated order syncing",
        "Custom integrations",
        "99.9% SLA guarantee"
      ],
      limitations: []
    }
  ];

  const competitorComparison = [
    { feature: "Starting Price", us: "$29/mo", competitor1: "$50/mo", competitor2: "Hidden" },
    { feature: "Order Limit (Starter)", us: "1,000", competitor1: "1,000", competitor2: "Unknown" },
    { feature: "Payment Gateways", us: "200+", competitor1: "Limited", competitor2: "200+" },
    { feature: "Languages", us: "20+", competitor1: "15+", competitor2: "20+" },
    { feature: "White Label", us: "✓ All plans", competitor1: "Extra cost", competitor2: "✓" },
    { feature: "Custom Domain", us: "✓ All plans", competitor1: "Pro+ only", competitor2: "Extra cost" },
    { feature: "API Access", us: "✓ All plans", competitor1: "Extra cost", competitor2: "✓" },
    { feature: "Setup Fee", us: "$0", competitor1: "$0", competitor2: "Varies" },
    { feature: "24/7 Support", us: "✓", competitor1: "Email only", competitor2: "✓" },
    { feature: "Free Trial", us: "14 days", competitor1: "7 days", competitor2: "None" },
  ];

  const trustBadges = [
    { icon: <Shield className="w-5 h-5" />, label: "SSL Secured" },
    { icon: <Lock className="w-5 h-5" />, label: "GDPR Compliant" },
    { icon: <Clock className="w-5 h-5" />, label: "99.9% Uptime" },
    { icon: <Headphones className="w-5 h-5" />, label: "24/7 Support" },
  ];

  const faqs = [
    {
      question: "How does the order-based pricing work?",
      answer: "Your plan automatically adjusts based on your monthly order volume. Start with any plan, and we'll suggest upgrades only when you're growing. No surprises, no overage charges."
    },
    {
      question: "Can I switch plans anytime?",
      answer: "Yes! Upgrade or downgrade instantly. When upgrading, you get immediate access to new features. When downgrading, your current plan stays active until the billing cycle ends."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, cryptocurrency (BTC, ETH, USDT), bank transfers, and 200+ local payment methods worldwide including Payoneer, Wise, and regional options."
    },
    {
      question: "Is there really no setup fee?",
      answer: "Absolutely! We believe in earning your business through value, not fees. Start your panel in minutes with zero upfront costs."
    },
    {
      question: "What makes you different from PerfectPanel or Socpanel?",
      answer: "We offer the most features at the lowest starting price. Full white-label, custom domain, and API access are included in ALL plans - features others charge extra for. Plus, our 14-day free trial lets you test everything risk-free."
    },
    {
      question: "Do you provide SMM services?",
      answer: "We provide the platform infrastructure. You connect your preferred SMM service providers via API. This gives you full control over service quality, pricing, and margins."
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (!isYearly) return 0;
    return (plan.monthlyPrice * 12) - plan.yearlyPrice;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Animated Background */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <Badge className="mb-6 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-4 py-1.5">
              <Sparkles className="w-4 h-4 mr-2" />
              Transparent Pricing • No Hidden Fees
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Pay Only for What You Use
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The most affordable SMM panel platform with all premium features included. 
              No per-order fees, no hidden costs.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-sm">
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-2 bg-muted/50 rounded-full backdrop-blur-sm">
              <span className={`px-4 py-2 rounded-full transition-all ${!isYearly ? 'bg-background shadow-md font-medium' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch 
                checked={isYearly} 
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-primary"
              />
              <span className={`px-4 py-2 rounded-full transition-all ${isYearly ? 'bg-background shadow-md font-medium' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              {isYearly && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <Gift className="w-3 h-3 mr-1" />
                  Save 17%
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Pricing Calculator */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Interactive Pricing Calculator</h3>
                  <p className="text-sm text-muted-foreground">Slide to see your perfect plan</p>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">Monthly Orders</span>
                  <Badge variant="outline" className="text-lg font-bold px-4 py-1">
                    {orderVolume[0].toLocaleString()}
                  </Badge>
                </div>
                <Slider
                  value={orderVolume}
                  onValueChange={setOrderVolume}
                  min={100}
                  max={150000}
                  step={100}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100</span>
                  <span>50K</span>
                  <span>100K</span>
                  <span>150K+</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Recommended Plan */}
                <div className="md:col-span-2 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Badge className="mb-2 bg-primary text-primary-foreground">Recommended</Badge>
                      <h4 className="text-2xl font-bold">{dynamicPricing.planName}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary">
                        ${isYearly ? Math.round(dynamicPricing.yearlyPrice / 12) : dynamicPricing.monthlyPrice}
                        <span className="text-lg font-normal text-muted-foreground">/mo</span>
                      </div>
                      {isYearly && (
                        <span className="text-sm text-green-600">Save ${dynamicPricing.yearlySavings}/year</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Only ${(dynamicPricing.pricePerOrder * 1000).toFixed(2)} per 1,000 orders</span>
                  </div>
                </div>
                
                {/* ROI Calculator */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-sm">Potential ROI</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {roiData.roi > 0 ? `+${roiData.roi}%` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Est. ${roiData.monthlyProfit.toLocaleString()}/mo profit
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`relative h-full flex flex-col p-6 transition-all duration-300 hover:shadow-2xl ${
                    plan.popular 
                      ? 'border-2 border-primary shadow-xl bg-gradient-to-b from-primary/5 to-transparent scale-[1.02]' 
                      : 'bg-card/70 backdrop-blur-sm hover:border-primary/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-4 py-1 shadow-lg">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <div className="text-center mb-6 pt-2">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-r ${plan.color} text-white shadow-lg`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">${getPrice(plan)}</span>
                      <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
                    </div>
                    {isYearly && getSavings(plan) > 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-green-600 font-medium mt-2"
                      >
                        Save ${getSavings(plan)}/year
                      </motion.div>
                    )}
                    <div className="mt-2 text-sm text-muted-foreground">
                      Up to <span className="font-semibold text-foreground">{plan.ordersIncluded}</span> orders/mo
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-grow">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="mt-0.5 p-0.5 rounded-full bg-green-500/10">
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    asChild 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    <Link to="/auth">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    14-day free trial • No credit card required
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us vs Competitors */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="secondary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Honest Comparison
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Panel Owners Choose Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how we stack up against other SMM panel platforms
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
                          <Rocket className="w-4 h-4" />
                          Us
                        </div>
                      </th>
                      <th className="text-center p-4 text-muted-foreground">Competitor A</th>
                      <th className="text-center p-4 text-muted-foreground">Competitor B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitorComparison.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{row.feature}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                            {row.us.includes('✓') ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              row.us
                            )}
                          </span>
                        </td>
                        <td className="p-4 text-center text-muted-foreground">{row.competitor1}</td>
                        <td className="p-4 text-center text-muted-foreground">{row.competitor2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`overflow-hidden transition-all cursor-pointer ${
                    expandedFaq === index ? 'border-primary/50 shadow-md' : ''
                  }`}
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <div className="p-5 flex items-center justify-between gap-4">
                    <h3 className="font-semibold">{faq.question}</h3>
                    <ChevronDown 
                      className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-0 text-muted-foreground border-t">
                          <p className="pt-4">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6" variant="secondary">
              <Rocket className="w-4 h-4 mr-2" />
              Get Started Today
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Launch Your<br />
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                SMM Empire?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of successful panel owners. Start your 14-day free trial today — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 text-lg px-8">
                <Link to="/auth">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/contact">Talk to Sales</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              🔒 Secure • ⚡ Instant Setup • 💰 No Credit Card Required
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}