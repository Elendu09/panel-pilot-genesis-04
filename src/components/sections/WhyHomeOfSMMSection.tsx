import { Check, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";

const advantages = [
  {
    title: "Fastest Setup in the Industry",
    description: "Launch a fully branded panel in under 5 minutes. No developers, no hosting, no hassle.",
  },
  {
    title: "Premium UI/UX Design",
    description: "Your panel comes with a modern, clean interface that your customers will love using.",
  },
  {
    title: "Multi-Tenant Architecture",
    description: "Manage multiple independent panels from one account, each with its own domain and branding.",
    highlight: true,
  },
  {
    title: "Advanced Automation Tools",
    description: "Automated order processing, status syncing, refund handling, and balance alerts built in.",
  },
  {
    title: "Built for Scalability",
    description: "Enterprise-grade infrastructure that grows with you. Handle thousands of orders without slowdowns.",
  },
];

export const WhyHomeOfSMMSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden" aria-labelledby="why-heading">
      <BackgroundEffects variant="section" showGrid showBubbles bubbleCount={3} particleCount={6} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
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
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Why HOME OF SMM</span>
          </motion.div>

          <h2 id="why-heading" className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            The Competitive{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">Advantage</span>
            <br />
            Your Business Needs
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-2xl">
            HOME OF SMM is not just another panel script. It is a fully managed multi-panel platform
            designed to give you every tool to outperform your competition.
          </p>
        </motion.div>

        <div className="space-y-4">
          {advantages.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex items-start gap-4"
            >
              <div className="mt-1 shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-1 ${item.highlight ? "text-primary" : "text-foreground"}`}>
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
