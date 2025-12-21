import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Eye, Users, MessageCircle, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const serviceCategories = [
  { name: "All", active: true },
  { name: "VK", active: false },
  { name: "Telegram", active: false },
  { name: "Instagram", active: false },
  { name: "More", active: false }
];

const services = [
  {
    id: 1,
    title: "Telegram Subscribers",
    price: "$0.3",
    unit: "per 100",
    rating: 4.8,
    speed: "1k",
    icon: Users,
    category: "Telegram",
    featured: false,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    title: "Premium Votes Asian",
    price: "$1",
    unit: "per 100",
    rating: 5.0,
    speed: "1k",
    icon: Star,
    category: "Premium",
    featured: true,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    title: "Channel Post Viewers",
    price: "$0.5",
    unit: "per 100", 
    rating: 4.9,
    speed: "1k",
    icon: Eye,
    category: "Telegram",
    featured: false,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: 4,
    title: "Real Exclusive Likes Indian",
    price: "$20",
    unit: "per 100",
    rating: 4.7,
    speed: "1k",
    icon: MessageCircle,
    category: "Instagram",
    featured: false,
    gradient: "from-amber-500 to-orange-500"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

export const ServiceShowcase = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Balance and Action Bar */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-center mb-8 p-4 glass-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <span className="text-sm text-muted-foreground">What's trending?</span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="sm" className="backdrop-blur-sm">
                New order
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="sm" className="backdrop-blur-sm">
                My orders <Badge variant="secondary" className="ml-1">1</Badge>
              </Button>
            </motion.div>
          </div>
          <div className="flex items-center space-x-4">
            <motion.span 
              className="text-primary font-bold text-xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              $500
            </motion.span>
            <span className="text-sm text-muted-foreground">View demo</span>
            <Button variant="outline" size="sm">
              Menu
            </Button>
          </div>
        </motion.div>

        {/* Service Categories */}
        <motion.div 
          className="flex flex-wrap gap-2 mb-8"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {serviceCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={category.active ? "default" : "outline"}
                size="sm"
                className={category.active ? "bg-gradient-primary shadow-glow" : "backdrop-blur-sm"}
              >
                {category.name}
              </Button>
            </motion.div>
          ))}
          <motion.div 
            className="ml-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button variant="outline" size="sm" className="backdrop-blur-sm">
              Multiple order
            </Button>
          </motion.div>
        </motion.div>

        {/* Service Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.id}
                variants={cardVariants}
                whileHover={{ 
                  y: -8,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group"
              >
                <Card
                  className={`relative p-6 glass-card border-border/50 transition-all duration-300 hover:border-primary/50 overflow-hidden ${
                    service.featured ? "ring-2 ring-primary shadow-glow" : ""
                  }`}
                >
                  {/* Background glow */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at top left, hsl(var(--primary) / 0.1) 0%, transparent 60%)`
                    }}
                  />

                  {service.featured && (
                    <motion.div
                      initial={{ scale: 0, rotate: -12 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Badge className="absolute -top-2 -right-2 bg-gradient-primary shadow-lg">
                        Featured
                      </Badge>
                    </motion.div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <motion.div 
                      className={`p-3 rounded-xl bg-gradient-to-br ${service.gradient} shadow-lg`}
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex items-center space-x-1 bg-card/80 px-2 py-1 rounded-full backdrop-blur-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{service.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 relative z-10 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  
                  <div className="flex items-baseline space-x-1 mb-3 relative z-10">
                    <motion.span 
                      className="text-2xl font-bold text-primary"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                    >
                      {service.price}
                    </motion.span>
                    <span className="text-sm text-muted-foreground">{service.unit}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 relative z-10">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Speed: {service.speed}
                    </span>
                    <Badge variant="outline" className="text-xs backdrop-blur-sm">
                      {service.category}
                    </Badge>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full bg-gradient-primary hover:shadow-glow relative z-10" size="sm">
                      Order Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>

                  {/* Animated border */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(to right, transparent, hsl(var(--primary)), transparent)`
                    }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Stats - Kanban style cards */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {[
            { value: "200+", label: "Payment systems", sublabel: "for every country", icon: TrendingUp, gradient: "from-blue-500 to-cyan-500" },
            { value: "Easy start", label: "to run own panel", sublabel: "", icon: Zap, gradient: "from-purple-500 to-pink-500" },
            { value: "20+", label: "Language", sublabel: "localizations", icon: Star, gradient: "from-green-500 to-emerald-500" },
            { value: "No code", label: "solution", sublabel: "", icon: Eye, gradient: "from-amber-500 to-orange-500" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="text-center glass-card p-6 group cursor-pointer"
            >
              <motion.div 
                className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </motion.div>
              <div className="text-2xl md:text-3xl font-bold text-primary mb-2 group-hover:scale-105 transition-transform">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
              {stat.sublabel && (
                <div className="text-sm text-muted-foreground/70">{stat.sublabel}</div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
