import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, TrendingUp, Users, Heart, Eye, MessageCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedText } from "@/components/ui/animated-text";
import { motion } from "framer-motion";
import { TelegramIcon, VoteIcon, ViewsIcon, HeartIcon } from "@/components/icons/SocialIcons";

// Floating feature cards data
const leftCards = [
  { title: "Ultra fast.", subtitle: "Almost speed of light.", delay: 0.8 },
  { title: "Hot design", subtitle: "Far ahead of others.", delay: 1.2 },
];

const rightCards = [
  { title: "Cool functions.", subtitle: "Updates every month.", delay: 1.0 },
  { title: "Ecosystem.", subtitle: "Market transparency", delay: 1.4 },
];

// Panel showcase services with SVG icons
const showcaseServices = [
  { icon: TelegramIcon, name: "Telegram Subscribers", price: "$0.3", discount: "-50%", gradient: "from-blue-500 to-cyan-500" },
  { icon: VoteIcon, name: "Premium Votes", price: "$1", discount: "-30%", gradient: "from-amber-400 to-yellow-500" },
  { icon: ViewsIcon, name: "Channel Viewers", price: "$0.5", gradient: "from-green-500 to-emerald-500" },
  { icon: HeartIcon, name: "Real Likes", price: "$20", gradient: "from-red-500 to-pink-500" },
];

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden perspective-1000">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-primary/50 rounded-full blur-[150px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Left Floating Cards */}
      <div className="absolute left-4 lg:left-[5%] top-1/4 space-y-4 hidden lg:block z-20">
        {leftCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: card.delay, duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.05, x: 10 }}
            className="relative"
          >
            <Card className="p-5 bg-card/40 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10 w-[200px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg" />
              <h3 className="font-bold text-lg text-foreground relative z-10">{card.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 relative z-10">{card.subtitle}</p>
              <motion.div 
                className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-primary/20 to-primary/50 rounded-lg opacity-0 blur-sm"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Right Floating Cards */}
      <div className="absolute right-4 lg:right-[5%] top-1/4 space-y-4 hidden lg:block z-20">
        {rightCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: card.delay, duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.05, x: -10 }}
            className="relative"
          >
            <Card className="p-5 bg-card/40 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10 w-[200px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg" />
              <h3 className="font-bold text-lg text-foreground relative z-10">{card.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 relative z-10">{card.subtitle}</p>
              <motion.div 
                className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-primary/20 to-primary/50 rounded-lg opacity-0 blur-sm"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 text-center relative z-10 pt-24 lg:pt-32">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-xl border border-border/50 rounded-full px-6 py-2 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(var(--primary) / 0.3)" }}
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Automate Your Business</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Create your own
            <br />
            <motion.span 
              className="bg-gradient-primary bg-clip-text text-transparent inline-block"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              smm panel
            </motion.span>
          </motion.h1>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow text-lg px-8 py-6 rounded-full">
                <Link to="/auth">
                  Create panel <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10 rounded-full backdrop-blur-sm">
                <Link to="/services">
                  Best SMM services
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Animated Text */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <AnimatedText
            phrases={[
              { static: "build an smm panel", bold: "for profit" },
              { static: "build an smm panel", bold: "for clients" },
              { static: "build an smm panel", bold: "with ease" }
            ]}
          />
        </motion.div>

        {/* Panel Showcase - Kanban Style */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-card/60 backdrop-blur-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">PANEL</span>
                <Button size="sm" variant="default" className="bg-primary/90 text-xs">New order</Button>
                <Button size="sm" variant="outline" className="text-xs">
                  My orders <Badge variant="secondary" className="ml-1 text-xs">1</Badge>
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <motion.span 
                  className="text-primary font-bold text-xl"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  $800
                </motion.span>
                <Button size="sm" variant="ghost" className="text-xs">Menu</Button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 p-4 border-b border-border/50 overflow-x-auto">
              {['All', 'VK', 'Telegram', 'Instagram', 'More'].map((cat, i) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                >
                  <Button 
                    size="sm" 
                    variant={i === 0 ? "default" : "outline"}
                    className={i === 0 ? "bg-primary" : ""}
                  >
                    {cat}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Service Cards Grid - Kanban Style */}
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {showcaseServices.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="p-4 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all relative overflow-hidden">
                      {/* Glow effect */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: `radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)`
                        }}
                      />
                      
                      {/* Discount badge */}
                      {service.discount && (
                        <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-xs">
                          {service.discount}
                        </Badge>
                      )}
                      
                      {/* Premium SVG Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                        <service.icon className="text-white" size={24} />
                      </div>
                      
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{service.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">{service.price}</span>
                        <span className="text-xs text-muted-foreground">per 100</span>
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          {[
            { value: "200+", label: "Payment systems", icon: Zap },
            { value: "Easy start", label: "to run own panel", icon: Star },
            { value: "20+", label: "Language localizations", icon: MessageCircle },
            { value: "No code", label: "solution", icon: TrendingUp },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
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
};
