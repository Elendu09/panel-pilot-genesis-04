import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";

const testimonials = [
  {
    name: "Daniel K.",
    role: "Panel Owner",
    text: "I launched my panel in under 10 minutes and had my first paying customer the same day. The multi-panel feature lets me run three separate brands from one account. Nothing else comes close.",
    rating: 5,
    avatar: "D",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Aisha M.",
    role: "SMM Reseller",
    text: "The automated order processing saves me hours every day. I connect providers via API, set my markup, and the platform handles everything. My revenue has tripled since switching to HOME OF SMM.",
    rating: 5,
    avatar: "A",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Carlos R.",
    role: "Agency Owner",
    text: "What sold me was the white-label branding and custom domain support. My clients have no idea I am using HOME OF SMM. The analytics dashboard gives me full visibility into every order and user.",
    rating: 5,
    avatar: "C",
    color: "from-amber-500 to-orange-500",
  },
];

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-background relative overflow-hidden" aria-labelledby="testimonials-heading">
      <BackgroundEffects variant="section" showGrid showBubbles showParticles bubbleCount={3} particleCount={8} />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Testimonials</span>
          </div>
          <h2 id="testimonials-heading" className="text-3xl md:text-5xl font-bold mb-4">
            Trusted by{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">Panel Owners</span>
            {" "}Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from entrepreneurs who have built successful SMM businesses using our platform.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 40, rotateX: -10 },
                visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 80, damping: 15 } },
              }}
              whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
              className="relative group"
            >
              <div className="glass-card p-8 h-full relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at top right, hsl(var(--primary) / 0.1) 0%, transparent 60%)` }}
                />

                <div className="absolute top-4 right-4 text-primary/10">
                  <Quote className="w-12 h-12" />
                </div>

                {/* Stars */}
                <div className="flex items-center space-x-1 mb-6 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-3 relative z-10">
                  <motion.div 
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>

                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${testimonial.color}`}
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

export default TestimonialsSection;
