import { 
  Layers, Globe, Zap, CreditCard, BarChart3, Palette, Code2, Server 
} from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";

const features = [
  {
    icon: Layers,
    title: "Multi-Panel System",
    description: "Create and manage multiple SMM panels from a single account. Each panel gets its own branding, users, and services.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Globe,
    title: "Custom Domains & Subdomains",
    description: "Connect your own domain or use a free subdomain. Full white-label experience with SSL included.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "Automated Order Processing",
    description: "Orders are automatically sent to providers via API, processed, and status-updated in real time with zero manual work.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: CreditCard,
    title: "200+ Payment Gateways",
    description: "Accept payments via Stripe, PayPal, crypto, Flutterwave, Paystack, Razorpay, and hundreds more worldwide options.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track revenue, orders, user activity, and growth metrics with a comprehensive analytics dashboard.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Palette,
    title: "White-Label Branding",
    description: "Fully customize your panel with your brand colors, logo, favicon, and theme. Your customers see only your brand.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Code2,
    title: "API Integration",
    description: "Connect any SMM provider with a standard API. Import services, sync statuses, and automate fulfillment instantly.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Server,
    title: "Fast & Scalable Infrastructure",
    description: "Built on enterprise-grade cloud infrastructure with 99.9% uptime. Scales automatically as your business grows.",
    gradient: "from-teal-500 to-cyan-600",
  },
];

export const FeaturesGridSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-background relative overflow-hidden" aria-labelledby="features-heading">
      <BackgroundEffects variant="section" showGrid showBubbles showParticles bubbleCount={4} particleCount={10} />
      <div className="absolute inset-0 bg-mesh opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Platform Features</span>
          </div>
          <h2 id="features-heading" className="text-3xl md:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete toolkit for launching, managing, and scaling your SMM panel business with confidence.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } } }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <div className="glass-card p-6 h-full relative overflow-hidden">
                <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 mb-5">
                  <motion.div 
                    className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
                
                <h3 className="font-bold text-base mb-2 relative z-10 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground relative z-10 leading-relaxed">
                  {feature.description}
                </p>

                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGridSection;
