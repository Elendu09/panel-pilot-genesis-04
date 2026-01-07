import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  name: string;
  text: string;
  rating: number;
  avatar?: string;
  color?: string;
}

interface StorefrontTestimonialsSectionProps {
  customization?: any;
}

export const StorefrontTestimonialsSection = ({ customization = {} }: StorefrontTestimonialsSectionProps) => {
  const testimonials: Testimonial[] = customization.testimonials || [
    {
      name: "alex_marketing",
      text: "Amazing service! I've been using this panel for 6 months now and the quality is always top-notch. Fast delivery and great support. Highly recommended for anyone looking to grow their social media.",
      rating: 5,
      avatar: "A",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "social_growth_pro",
      text: "Best SMM panel I've ever used. The prices are unbeatable and the services are delivered instantly. My Instagram account grew from 1K to 50K followers in just a few months!",
      rating: 5,
      avatar: "S",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "digital_marketer_99",
      text: "I was skeptical at first, but this panel exceeded my expectations. The customer support is available 24/7 and they resolved my issue within minutes. Will definitely continue using this service.",
      rating: 5,
      avatar: "D",
      color: "from-amber-500 to-orange-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: { type: "spring" as const, stiffness: 80, damping: 15 }
    }
  };

  const themeMode = customization?.themeMode || 'dark';

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden scroll-mt-20" style={{ backgroundColor: customization?.backgroundColor }} aria-labelledby="storefront-testimonials-heading">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
      
      {/* Background effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Testimonials</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            What our{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              customers say
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust our platform
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                rotateY: 5,
                rotateX: 3,
                transition: { type: "spring", stiffness: 300 }
              }}
              className="relative group perspective-1000 transform-3d"
            >
              <div 
                className={`p-8 h-full relative overflow-hidden rounded-xl backdrop-blur-xl border transition-all ${
                  themeMode === 'dark' 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white shadow-md border-gray-200'
                }`}
              >
                
                {/* Gradient border glow on hover */}
                <div className={`absolute -inset-[1px] rounded-xl bg-gradient-to-r ${testimonial.color || 'from-primary to-accent'} opacity-0 group-hover:opacity-40 blur-[2px] transition-opacity duration-500`} style={{ zIndex: -1 }} />
                
                {/* Background gradient on hover */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at top right, hsl(var(--primary) / 0.1) 0%, transparent 60%)`
                  }}
                />

                {/* Quote icon */}
                <motion.div
                  className="absolute top-4 right-4 text-primary/10"
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 12, scale: 1.1 }}
                >
                  <Quote className="w-12 h-12" />
                </motion.div>

                {/* Rating stars */}
                <div className="flex items-center space-x-1 mb-6 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <Star className="w-5 h-5 fill-primary text-primary" />
                    </motion.div>
                  ))}
                </div>

                {/* Testimonial text */}
                <p 
                  className="mb-6 leading-relaxed relative z-10"
                  style={{ color: customization?.textMuted || (themeMode === 'dark' ? '#A1A1AA' : '#4B5563') }}
                >
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 relative z-10">
                  <motion.div 
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color || 'from-primary to-accent'} flex items-center justify-center text-white font-bold text-lg shadow-lg relative`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {/* Avatar glow */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${testimonial.color || 'from-primary to-accent'} blur-lg opacity-50 group-hover:opacity-80 transition-opacity`} />
                    <span className="relative z-10">{testimonial.avatar || testimonial.name[0].toUpperCase()}</span>
                  </motion.div>
                  <div>
                    <div 
                      className="font-semibold"
                      style={{ color: customization?.textColor || (themeMode === 'dark' ? '#FFFFFF' : '#1F2937') }}
                    >
                      @{testimonial.name}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: customization?.textMuted || (themeMode === 'dark' ? '#A1A1AA' : '#4B5563') }}
                    >
                      Verified Customer
                    </div>
                  </div>
                </div>

                {/* Bottom accent */}
                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${testimonial.color || 'from-primary to-accent'}`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
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
