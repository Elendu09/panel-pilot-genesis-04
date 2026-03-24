import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap, TrendingUp, MessageCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedText } from "@/components/ui/animated-text";
import { motion } from "framer-motion";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";
import { useLanguage } from "@/contexts/LanguageContext";

export const HeroSection = memo(() => {
  const { t } = useLanguage();

  const showcaseServices = useMemo(() => [
    { name: "Instagram Followers", price: "$0.80", category: "Instagram", gradient: "from-pink-500 to-purple-600" },
    { name: "TikTok Views", price: "$0.12", category: "TikTok", gradient: "from-cyan-400 to-blue-500" },
    { name: "YouTube Subscribers", price: "$2.50", category: "YouTube", gradient: "from-red-500 to-red-600" },
    { name: "Twitter Likes", price: "$0.35", category: "Twitter", gradient: "from-sky-400 to-blue-500" },
  ], []);

  return (
    <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[75vh] lg:min-h-screen bg-gradient-hero overflow-hidden perspective-1000 pb-4 md:pb-8 lg:pb-12">
      <BackgroundEffects variant="hero" showGrid showBubbles showParticles bubbleCount={6} particleCount={10} />
      
      {/* Glow orbs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse-float" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-primary/50 rounded-full blur-[150px] animate-pulse-float" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 pt-24 lg:pt-32">
        <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-xl border border-border/50 rounded-full px-6 py-2 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(var(--primary) / 0.3)" }}
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">The #1 Multi-Panel SMM Platform</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Launch Your Own
            <br />
            <motion.span 
              className="bg-gradient-primary bg-clip-text text-transparent inline-block"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              SMM Panel
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Create, brand, and scale your social media marketing business. 
            Manage multiple panels, automate orders, and connect 200+ payment gateways — all from one platform.
          </motion.p>

          <p className="sr-only">
            Launch your own SMM panel with Home of SMM. Create, manage, and scale your social media marketing business with custom branding, automated orders, and real-time analytics.
          </p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow text-lg px-8 py-6 rounded-full">
                <Link to="/auth">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10 rounded-full backdrop-blur-sm">
                <Link to="/demo">
                  View Live Demo
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Animated Text */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
          <AnimatedText
            phrases={[
              { static: "build an smm panel", bold: "that generates profit" },
              { static: "build an smm panel", bold: "with loyal clients" },
              { static: "build an smm panel", bold: "with total ease" }
            ]}
          />
        </motion.div>

        {/* Panel Showcase */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }} className="max-w-4xl mx-auto">
          <Card className="bg-card/60 backdrop-blur-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-2 sm:p-4 border-b border-border/50 bg-muted/30 gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
                <span className="font-bold text-sm sm:text-lg bg-gradient-primary bg-clip-text text-transparent shrink-0">YOUR PANEL</span>
                <Button size="sm" variant="default" className="bg-primary/90 text-xs shrink-0">New order</Button>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <motion.span className="text-primary font-bold text-lg sm:text-xl" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  $2,450
                </motion.span>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 p-2 sm:p-4 border-b border-border/50 overflow-x-auto scrollbar-hide">
              {['All', 'Instagram', 'TikTok', 'YouTube', 'Twitter'].map((cat, i) => (
                <motion.div key={cat} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + i * 0.1 }} className="shrink-0">
                  <Button size="sm" variant={i === 0 ? "default" : "outline"} className={`text-xs sm:text-sm ${i === 0 ? "bg-primary" : ""}`}>
                    {cat}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Service Cards */}
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {showcaseServices.map((service, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + index * 0.1 }} whileHover={{ y: -5, scale: 1.02 }} className="group">
                    <Card className="p-4 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all relative overflow-hidden">
                      <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)` }} />
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                        <span className="text-white text-xs font-bold">{service.category.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{service.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">{service.price}</span>
                        <span className="text-xs text-muted-foreground">per 1K</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mt-6 sm:mt-8 lg:mt-12 mb-4 sm:mb-6 lg:mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          {[
            { value: "200+", label: "Payment Gateways", icon: Zap },
            { value: "5 Min", label: "Setup Time", icon: Star },
            { value: "20+", label: "Languages", icon: MessageCircle },
            { value: "0%", label: "Upfront Cost", icon: TrendingUp },
          ].map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 + index * 0.1 }} whileHover={{ y: -5, scale: 1.02 }}>
              <Card className="p-4 glass-card text-center group">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
