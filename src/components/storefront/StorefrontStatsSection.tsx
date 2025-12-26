import { Users, ShoppingBag, Globe, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface StorefrontStatsSectionProps {
  panel?: any;
  customization?: any;
}

export const StorefrontStatsSection = ({ panel, customization = {} }: StorefrontStatsSectionProps) => {
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

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-mesh opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Trusted by{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              thousands of users
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
              
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -8,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="relative group"
              >
                <div className="glass-stat-card p-6 lg:p-8 text-center h-full">
                  {/* Glow effect on hover */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at center, hsl(var(--primary) / 0.15) 0%, transparent 70%)`
                    }}
                  />
                  
                  {/* Icon */}
                  <motion.div 
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4 shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>

                  {/* Value */}
                  <motion.div 
                    className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.div>

                  {/* Label */}
                  <div className="text-muted-foreground text-sm lg:text-base font-medium">
                    {stat.label}
                  </div>

                  {/* Bottom accent line */}
                  <motion.div 
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-full bg-gradient-to-r ${stat.gradient}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: "40%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
