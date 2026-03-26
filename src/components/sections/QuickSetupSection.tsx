import { motion } from "framer-motion";
import { UserPlus, PenTool, PackagePlus, CreditCard, Palette, Rocket } from "lucide-react";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your free account in seconds — no credit card required.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: PenTool,
    title: "Name Your Panel",
    description: "Choose your panel name and subdomain/custom domain to get started.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: PackagePlus,
    title: "Add Services",
    description: "Import services from providers via API or create your own.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: CreditCard,
    title: "Configure Payments",
    description: "Set up payment gateways so your customers can pay easily.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Palette,
    title: "Customize Design",
    description: "Brand your panel with your own colors, logo, and theme.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Rocket,
    title: "Launch & Earn",
    description: "Go live and start earning from day one — it's that simple.",
    gradient: "from-indigo-500 to-blue-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

export const QuickSetupSection = () => {
  return (
    <section className="py-24 relative overflow-hidden" aria-labelledby="quick-setup-heading">
      <BackgroundEffects variant="section" showGrid showParticles particleCount={8} />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
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
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">How It Works</span>
          </motion.div>

          <h2 id="quick-setup-heading" className="text-4xl md:text-5xl font-bold mb-4">
            Launch Your Panel in{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">6 Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From sign-up to your first sale — get your SMM panel running in under 5 minutes.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Step number */}
                <span className="absolute top-4 right-4 text-5xl font-black text-muted/10 select-none">
                  {index + 1}
                </span>

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
