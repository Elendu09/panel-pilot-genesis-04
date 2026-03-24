import { Check, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";

const advantages = [
  { title: "Fastest Setup in the Industry", description: "Launch a fully branded panel in under 5 minutes. No developers, no hosting, no hassle." },
  { title: "Premium UI/UX Design", description: "Your panel comes with a modern, clean interface that your customers will love using." },
  { title: "Multi-Tenant Architecture", description: "Manage multiple independent panels from one account, each with its own domain and branding." },
  { title: "Advanced Automation Tools", description: "Automated order processing, status syncing, refund handling, and balance alerts built in." },
  { title: "Built for Scalability", description: "Enterprise-grade infrastructure that grows with you. Handle thousands of orders without slowdowns." },
];

export const WhyChooseUsSection = () => {
  return (
    <section id="why-us" className="py-20 md:py-28 relative overflow-hidden" aria-labelledby="why-us-heading">
      <BackgroundEffects variant="minimal" showGrid showBubbles={false} showParticles bubbleCount={0} particleCount={6} />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Why HOME OF SMM</span>
            </div>
            
            <h2 id="why-us-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The Competitive{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">Advantage</span>
              {" "}Your Business Needs
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              HOME OF SMM is not just another panel script. It is a fully managed multi-panel platform 
              designed to give you every tool to outperform your competition.
            </p>

            <div className="space-y-5">
              {advantages.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Stacked card visual */}
              <Card className="glass-card p-6 relative z-30 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Panel Dashboard</div>
                    <div className="text-xs text-muted-foreground">Real-time overview</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-primary">$12.4K</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-400">2,847</div>
                    <div className="text-xs text-muted-foreground">Orders</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-amber-400">456</div>
                    <div className="text-xs text-muted-foreground">Users</div>
                  </div>
                </div>
              </Card>
              
              {/* Background stacked cards */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 glass-card border-primary/10 rounded-lg z-20" />
              <div className="absolute inset-0 translate-x-6 translate-y-6 glass-card border-primary/5 rounded-lg z-10 opacity-60" />
              
              {/* Glow behind */}
              <div className="absolute -inset-8 bg-primary/5 rounded-3xl blur-2xl z-0" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
