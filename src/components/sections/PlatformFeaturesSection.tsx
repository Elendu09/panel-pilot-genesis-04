import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, Globe, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";
import { useLanguage } from "@/contexts/LanguageContext";

export const PlatformFeaturesSection = () => {
  const { t } = useLanguage();
  const features = [
    {
      title: "Powered by zero-knowledge",
      description: "HOME OF SMM runs a sophisticated panel management system that orchestrates multiple providers to work together as one unified platform.",
      icon: Zap,
      gradient: "from-primary/20 to-primary/5"
    },
    {
      title: "Ultra-high performance",
      description: "The platform gets more powerful with every panel that connects, creating a network purpose-built for social media marketing.",
      icon: BarChart3,
      gradient: "from-accent/20 to-accent/5"
    },
    {
      title: "Made for mass adoption", 
      description: "The HOME OF SMM platform makes it easy for anyone to create, manage, and scale their own SMM panel business via our web app.",
      icon: Users,
      gradient: "from-secondary/20 to-secondary/5"
    },
    {
      title: "Global reach",
      description: "Connect with providers worldwide and offer services to customers across all major social media platforms and regions.",
      icon: Globe,
      gradient: "from-primary/15 to-primary/5"
    }
  ];

  return (
    <section className="py-24 bg-card/50 border-t border-border relative overflow-hidden">
      {/* Grid, Bubbles & Particles */}
      <BackgroundEffects variant="section" showGrid showBubbles showParticles bubbleCount={5} particleCount={10} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {t('platform_features.title.world_of')}
                <br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {t('platform_features.title.possibilities')}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t('platform_features.description')}
              </p>
              <Button 
                variant="outline" 
                className="border-primary/30 hover:bg-primary/10"
                asChild
              >
                <Link to="/docs">
                  {t('platform_features.docs_button')} <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  className={`p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group relative overflow-hidden`}
                  whileHover={{ y: -5, scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Hover glow effect */}
                  <motion.div 
                    className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="mb-6 relative z-10">
                    <motion.div 
                      className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    >
                      <Icon className="w-6 h-6 text-primary" />
                    </motion.div>
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
          </div>
        </div>
      </div>
    </section>
  );
};