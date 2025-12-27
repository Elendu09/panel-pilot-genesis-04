import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, Globe, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface StorefrontPlatformSectionProps {
  customization?: any;
}

export const StorefrontPlatformSection = ({ customization = {} }: StorefrontPlatformSectionProps) => {
  const platformFeatures = customization.platformFeatures || [
    {
      title: "Instant Delivery",
      description: "Our automated system processes orders instantly. Most services start within minutes of placing your order.",
      icon: Zap,
      gradient: "from-primary/20 to-primary/5"
    },
    {
      title: "High Quality Services",
      description: "We provide only premium quality services with real engagement that helps grow your social media presence.",
      icon: BarChart3,
      gradient: "from-accent/20 to-accent/5"
    },
    {
      title: "Best Prices Guaranteed", 
      description: "Compare our prices with any competitor. We offer the most competitive rates in the market.",
      icon: Users,
      gradient: "from-secondary/20 to-secondary/5"
    },
    {
      title: "Global Coverage",
      description: "Services available for all major social media platforms worldwide with multiple payment options.",
      icon: Globe,
      gradient: "from-primary/15 to-primary/5"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  const themeMode = customization?.themeMode || 'dark';

  return (
    <section 
      className={`py-24 border-t ${themeMode === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
      style={{ backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Why Choose
                <br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Our Services?
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                We've helped thousands of customers grow their social media presence with our reliable, fast, and affordable SMM services. Join our community of satisfied customers today.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  className="border-primary/30 hover:bg-primary/10"
                  asChild
                >
                  <a href="/services">
                    Browse Services <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {platformFeatures.map((feature, index) => {
              const Icon = typeof feature.icon === 'string' 
                ? { Zap, BarChart3, Users, Globe }[feature.icon] || Zap
                : feature.icon;
              
              return (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} transition-all duration-300 hover:shadow-lg group ${
                    themeMode === 'dark' 
                      ? 'border border-white/10 hover:border-primary/30' 
                      : 'border border-gray-200 hover:border-primary/40 shadow-sm'
                  }`}
                >
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
