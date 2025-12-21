import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { ServiceShowcase } from "./ServiceShowcase";
import { AnimatedText } from "@/components/ui/animated-text";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden perspective-1000">
      {/* Enhanced 3D Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-32 h-32 bg-primary/50 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Floating 3D Elements & Social Media Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: "5%", left: "10%", size: 16, delay: 0 },
          { top: "15%", right: "15%", size: 24, delay: 0.5 },
          { bottom: "30%", left: "8%", size: 12, delay: 1 },
          { bottom: "15%", right: "12%", size: 20, delay: 1.5 },
          { top: "35%", left: "25%", size: 32, delay: 2 },
          { top: "50%", right: "25%", size: 20, delay: 2.5 },
          { bottom: "45%", left: "33%", size: 24, delay: 3 },
          { bottom: "25%", right: "33%", size: 16, delay: 3.5 },
        ].map((bubble, i) => (
          <motion.div
            key={i}
            className="absolute bg-primary/20 rounded-full"
            style={{ 
              top: bubble.top, 
              left: bubble.left, 
              right: bubble.right,
              bottom: bubble.bottom,
              width: bubble.size, 
              height: bubble.size 
            }}
            animate={{ 
              y: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4 + i * 0.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: bubble.delay
            }}
          />
        ))}
      </div>

      {/* Kanban-style floating cards */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <motion.div
          className="absolute top-32 left-[5%] glass-card p-4 rounded-xl border border-primary/20"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Growth</span>
          </div>
          <div className="text-2xl font-bold text-primary">+247%</div>
        </motion.div>

        <motion.div
          className="absolute top-48 right-[8%] glass-card p-4 rounded-xl border border-primary/20"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-success" />
            </div>
            <span className="text-sm font-medium">Active Users</span>
          </div>
          <div className="text-2xl font-bold text-success">12.5K</div>
        </motion.div>

        <motion.div
          className="absolute bottom-[35%] left-[8%] glass-card p-4 rounded-xl border border-primary/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-warning" />
            </div>
            <span className="text-sm font-medium">Orders Today</span>
          </div>
          <div className="text-2xl font-bold text-warning">1,847</div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 pt-32">
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
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow text-lg px-8 py-6 rounded-full">
                <Link to="/auth">
                  Create panel <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10 rounded-full backdrop-blur-sm">
                <Link to="/services">
                  Best SMM services
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated Text Section */}
      <motion.div 
        className="container mx-auto px-4 relative z-10 -mt-8 mb-4"
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

      {/* Service Showcase */}
      <ServiceShowcase />
    </section>
  );
};
