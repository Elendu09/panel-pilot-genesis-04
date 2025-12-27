import { Users, ShoppingBag, Globe, Zap } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface StorefrontStatsSectionProps {
  panel?: any;
  customization?: any;
}

// Counter animation hook
const useCounter = (end: number, duration: number = 2000, inView: boolean) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!inView) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, inView]);
  
  return count;
};

// Parse value for counter (e.g., "10K+" -> 10)
const parseStatValue = (value: string): { num: number; suffix: string } => {
  const match = value.match(/^([\d.]+)([KMB+%]*)$/i);
  if (match) {
    return { num: parseFloat(match[1]), suffix: match[2] };
  }
  return { num: 0, suffix: value };
};

export const StorefrontStatsSection = ({ panel, customization = {} }: StorefrontStatsSectionProps) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const customStats = customization.stats || [
    {
      icon: Users,
      value: "10K+",
      label: "Happy Customers",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: ShoppingBag,
      value: "1M+",
      label: "Orders Completed",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      value: "500+",
      label: "Services Available",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Globe,
      value: "50+",
      label: "Payment Methods",
      gradient: "from-amber-500 to-orange-500"
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
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  const themeMode = customization?.themeMode || 'dark';

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden" style={{ backgroundColor: customization?.backgroundColor }}>
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-mesh opacity-50" />
      
      {/* Gradient orbs */}
      <motion.div 
        className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ color: customization?.textColor }}
          >
            Trusted by{" "}
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${customization?.primaryColor || '#8B5CF6'}, ${customization?.secondaryColor || '#EC4899'})` }}
            >
              thousands of users
            </span>
          </h2>
          <p 
            className="text-xl max-w-2xl mx-auto"
            style={{ color: customization?.textMuted }}
          >
            Join our growing community of satisfied customers who trust our platform
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {customStats.map((stat, index) => {
            const Icon = typeof stat.icon === 'string' 
              ? { Users, ShoppingBag, Zap, Globe }[stat.icon] || Users
              : stat.icon;
            
            const { num, suffix } = parseStatValue(stat.value);
            
            return (
              <StatCard
                key={index}
                stat={stat}
                index={index}
                Icon={Icon}
                num={num}
                suffix={suffix}
                isInView={isInView}
                itemVariants={itemVariants}
                customization={customization}
              />
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

const StatCard = ({ stat, index, Icon, num, suffix, isInView, itemVariants, customization }: any) => {
  const count = useCounter(num, 2000 + index * 200, isInView);
  const themeMode = customization?.themeMode || 'dark';
  
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ 
        scale: 1.05,
        y: -8,
        rotateY: 5,
        transition: { type: "spring", stiffness: 300 }
      }}
      className="relative group perspective-1000"
    >
      <div 
        className={`p-6 lg:p-8 text-center h-full relative overflow-hidden rounded-xl backdrop-blur-xl transition-all ${
          themeMode === 'dark' 
            ? 'bg-white/5 border border-white/10' 
            : 'bg-white shadow-md border border-gray-200'
        }`}
      >
        {/* Glow effect on hover */}
        <motion.div 
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at center, hsl(var(--primary) / 0.15) 0%, transparent 70%)`
          }}
        />
        
        {/* Gradient border on hover */}
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-300" style={{ zIndex: -1 }} />
        
        {/* Icon with glow */}
        <motion.div 
          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4 shadow-lg relative`}
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.gradient} blur-lg opacity-50`} />
          <Icon className="w-7 h-7 text-white relative z-10" />
        </motion.div>

        {/* Animated counter value */}
        <motion.div 
          className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
        >
          {count}{suffix}
        </motion.div>

        {/* Label */}
        <div 
          className="text-sm lg:text-base font-medium transition-colors"
          style={{ color: customization?.textMuted }}
        >
          {stat.label}
        </div>

        {/* Animated bottom accent line */}
        <motion.div 
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-full bg-gradient-to-r ${stat.gradient}`}
          initial={{ width: 0 }}
          whileInView={{ width: "50%" }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};
