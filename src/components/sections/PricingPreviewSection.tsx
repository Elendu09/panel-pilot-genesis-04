import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect to get started and test the platform.",
    features: ["1 Panel", "Basic branding", "5% commission on orders", "Community support"],
    gradient: "from-slate-500 to-slate-600",
    popular: false,
  },
  {
    name: "Basic",
    price: "$5",
    period: "/month",
    description: "For growing panel owners who need more power.",
    features: ["3 Panels", "Custom subdomain", "Lower commission rates", "Priority support"],
    gradient: "from-blue-500 to-indigo-600",
    popular: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/month",
    description: "Full power for serious SMM entrepreneurs.",
    features: ["Unlimited Panels", "Custom domain + SSL", "Lowest commission", "Dedicated support", "Advanced analytics"],
    gradient: "from-primary to-accent",
    popular: true,
  },
];

export const PricingPreviewSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-28 relative overflow-hidden" aria-labelledby="pricing-heading">
      <BackgroundEffects variant="minimal" showGrid showBubbles={false} showParticles bubbleCount={0} particleCount={6} />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 id="pricing-heading" className="text-3xl md:text-5xl font-bold mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free. Upgrade when you are ready. No hidden fees, no surprises.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className={`relative group ${plan.popular ? "md:-mt-4 md:mb-[-16px]" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`glass-card p-6 md:p-8 h-full relative overflow-hidden ${plan.popular ? "border-primary/40 shadow-lg shadow-primary/10" : ""}`}>
                <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Button asChild variant="outline" size="lg" className="border-primary/30 hover:bg-primary/10 rounded-full">
            <Link to="/pricing">
              View Full Pricing <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingPreviewSection;
