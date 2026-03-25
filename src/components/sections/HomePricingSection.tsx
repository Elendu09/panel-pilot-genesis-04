import { ArrowRight, Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started",
    icon: Zap,
    features: ["1 Panel", "Unlimited Services", "5% Commission", "Community Support"],
    gradient: "from-muted to-muted/50",
    popular: false,
  },
  {
    name: "Basic",
    price: "$5",
    period: "/month",
    description: "For growing businesses",
    icon: Zap,
    features: ["2 Panels", "Custom Domain", "4% Commission", "Priority Support"],
    gradient: "from-primary/20 to-primary/5",
    popular: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/month",
    description: "For serious panel owners",
    icon: Crown,
    features: ["5 Panels", "Custom Domain", "3% Commission", "24/7 Support", "Advanced Analytics"],
    gradient: "from-primary/30 to-primary/10",
    popular: true,
  },
];

export const HomePricingSection = () => {
  return (
    <section className="py-24 bg-card/50 border-t border-border relative overflow-hidden" aria-labelledby="pricing-heading">
      <BackgroundEffects variant="section" showGrid bubbleCount={3} particleCount={6} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Pricing</span>
          </motion.div>

          <h2 id="pricing-heading" className="text-4xl md:text-5xl font-bold mb-4">
            Simple,{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">Transparent</span>
            {" "}Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              <Card className={`relative p-6 h-full bg-gradient-to-br ${plan.gradient} border ${plan.popular ? "border-primary/40 shadow-lg shadow-primary/10" : "border-border/50"}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <div className="text-center mb-6">
                  <plan.icon className={`w-8 h-8 mx-auto mb-3 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Button asChild size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 rounded-full">
            <Link to="/pricing">
              View Full Pricing Details <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
