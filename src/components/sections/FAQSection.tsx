import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles, Rocket, Scale, DollarSign, CreditCard, Globe, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundEffects } from "@/components/effects/BackgroundEffects";
import { useLanguage } from "@/contexts/LanguageContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export const FAQSection = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Icon mapping for FAQ items
  const iconMap: Record<string, any> = {
    rocket: Rocket,
    scale: Scale,
    dollar: DollarSign,
    credit: CreditCard,
    globe: Globe,
    target: Target,
  };

  const faqs = [
    {
      question: "What is an SMM Panel?",
      answer: "An SMM panel is a web-based platform where resellers sell social media marketing services such as followers, likes, views, and comments. Panel owners set their own prices, connect service providers via API, and manage customers through a branded dashboard.",
      iconKey: "rocket",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      question: "What is HOME OF SMM?",
      answer: "HOME OF SMM is the leading platform for creating and managing your own SMM panel. We provide everything you need — custom branding, 200+ payment gateways, automated order processing, multi-language support, and real-time analytics — so you can launch your SMM business in minutes.",
      iconKey: "target",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      question: "How do I create my own SMM Panel?",
      answer: "Sign up for free on HOME OF SMM, choose your panel name and subdomain, customize your branding and theme, connect your preferred SMM service providers via API, configure payment methods, and start selling. The entire setup takes less than 5 minutes with zero coding required.",
      iconKey: "globe",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      question: "How to make money through SMM?",
      answer: "As an SMM panel owner, you buy services wholesale from providers and resell them at a markup to your customers. HOME OF SMM charges only 5% commission on completed orders with zero fees when you have no income. Many panel owners earn thousands monthly by building a loyal customer base.",
      iconKey: "dollar",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      question: "What makes HOME OF SMM the best SMM Panel platform?",
      answer: "HOME OF SMM offers the most affordable pricing (start free, 5% commission only), 200+ payment gateways, 10+ language localizations, custom domains, white-label branding, automated order processing, and dedicated support. No other platform matches this combination of features at this price.",
      iconKey: "scale",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      question: "How much does it cost to start an SMM Panel?",
      answer: "You can start completely free with HOME OF SMM. There are no setup fees, no monthly subscriptions required, and you only pay a 5% commission on completed orders. Upgrade to Basic ($5/mo) or Pro ($15/mo) for advanced features like custom domains and unlimited services.",
      iconKey: "credit",
      gradient: "from-red-500 to-rose-500"
    }
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden scroll-mt-20" aria-labelledby="faq-heading">
      {/* Grid, Bubbles & Particles */}
      <BackgroundEffects variant="section" showGrid showBubbles showParticles bubbleCount={4} particleCount={10} />
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/10 to-background" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('faq.badge')}</span>
          </motion.div>
          
          <h2 id="faq-heading" className="text-4xl md:text-5xl font-bold mb-4">
            {t('faq.title.your')}{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t('faq.title.questions')}</span>
            , {t('faq.title.answered')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </motion.div>

        {/* FAQ Grid */}
        <motion.div 
          className="max-w-4xl mx-auto grid gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className={`group relative rounded-2xl transition-all duration-300 ${
                openIndex === index 
                  ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-lg shadow-primary/10' 
                  : 'bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 hover:bg-card/80'
              } border overflow-hidden`}
            >
              {/* Glow effect when open */}
              {openIndex === index && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              
              <button
                className="w-full px-6 py-5 text-left flex items-center gap-4 relative z-10"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {/* Icon */}
                <motion.div 
                  className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${faq.gradient} flex items-center justify-center shadow-lg`}
                  animate={{ 
                    scale: openIndex === index ? 1.1 : 1,
                    rotate: openIndex === index ? [0, -10, 10, 0] : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const IconComponent = iconMap[faq.iconKey];
                    return <IconComponent className="w-5 h-5 text-white" />;
                  })()}
                </motion.div>
                
                {/* Question */}
                <span className={`font-semibold text-lg flex-1 transition-colors ${
                  openIndex === index ? 'text-primary' : 'text-foreground group-hover:text-primary/80'
                }`}>
                  {faq.question}
                </span>
                
                {/* Chevron */}
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                    openIndex === index ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              
              {/* Answer */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: "auto", 
                      opacity: 1,
                      transition: {
                        height: { duration: 0.3, ease: "easeOut" },
                        opacity: { duration: 0.2, delay: 0.1 }
                      }
                    }}
                    exit={{ 
                      height: 0, 
                      opacity: 0,
                      transition: {
                        height: { duration: 0.2, ease: "easeIn" },
                        opacity: { duration: 0.1 }
                      }
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pl-16">
                      <motion.p 
                        className="text-muted-foreground leading-relaxed"
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        {faq.answer}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-muted-foreground mb-4">
            {t('faq.still_questions')}
          </p>
          <motion.a
            href="/support"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium hover:bg-primary/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-4 h-4" />
            {t('faq.contact_support')}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};