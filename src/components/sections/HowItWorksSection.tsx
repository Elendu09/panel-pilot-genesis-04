import { Rocket, Link2, CreditCard, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";

const steps = [
  {
    icon: Rocket,
    title: "Create Your Panel",
    description: "Sign up for free and set up your branded SMM panel with a custom subdomain or domain in under 5 minutes.",
    gradient: "from-blue-500 to-cyan-500",
    step: "01",
  },
  {
    icon: Link2,
    title: "Connect Providers",
    description: "Integrate with any SMM service provider via API. Import thousands of services instantly with automatic syncing.",
    gradient: "from-purple-500 to-pink-500",
    step: "02",
  },
  {
    icon: CreditCard,
    title: "Add Payment Methods",
    description: "Configure from 200+ payment gateways including Stripe, PayPal, crypto, and regional options for global reach.",
    gradient: "from-amber-500 to-orange-500",
    step: "03",
  },
  {
    icon: TrendingUp,
    title: "Start Selling",
    description: "Launch your panel and start accepting orders. All processing is automated so you can focus on growing your business.",
    gradient: "from-green-500 to-emerald-500",
    step: "04",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 relative overflow-hidden" aria-labelledby="how-it-works-heading">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Quick Setup</span>
          </div>
          <h2 id="how-it-works-heading" className="text-3xl md:text-5xl font-bold mb-4">
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Go from zero to a fully operational SMM panel in four simple steps. No coding, no complexity.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="relative group"
            >
              <div className="glass-card p-6 md:p-8 text-center h-full relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                {/* Step Number */}
                <div className="absolute top-4 right-4 text-5xl font-bold text-primary/10 select-none">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="relative z-10 mb-5">
                  <motion.div 
                    className={`w-16 h-16 mx-auto bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                
                <h3 className="font-bold text-lg mb-3 relative z-10 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground relative z-10 leading-relaxed">
                  {step.description}
                </p>

                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient}`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
