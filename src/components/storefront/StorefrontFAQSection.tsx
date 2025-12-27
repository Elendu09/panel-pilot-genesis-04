import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles, Zap, CreditCard, DollarSign, Shield, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQ {
  question: string;
  answer: string;
  icon?: React.ElementType;
}

interface StorefrontFAQSectionProps {
  customization?: any;
}

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

// Icon mapping for FAQs
const iconMapping: Record<string, React.ElementType> = {
  "⚡": Zap,
  "✨": Sparkles,
  "💳": CreditCard,
  "💰": DollarSign,
  "🛡️": Shield,
  "🎯": Target,
};

export const StorefrontFAQSection = ({ customization = {} }: StorefrontFAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const themeMode = customization.themeMode || 'dark';
  const textColor = customization.textColor || (themeMode === 'dark' ? '#FFFFFF' : '#1F2937');
  const textMuted = customization.textMuted || (themeMode === 'dark' ? '#A1A1AA' : '#4B5563');
  const cardBg = themeMode === 'dark' ? 'bg-slate-900/60' : 'bg-white/80';
  const borderStyle = themeMode === 'dark' ? 'border-white/10' : 'border-gray-200';

  const defaultFaqs: FAQ[] = [
    {
      question: "How fast is the delivery?",
      answer: "Most orders start within 0-1 hour after payment confirmation. Delivery speed depends on the service type and quantity ordered. We offer drip-feed options for gradual delivery.",
      icon: Zap
    },
    {
      question: "Are the followers/likes real?",
      answer: "We offer both real and premium services. Real services come from genuine accounts with activity history. Premium services provide high-quality engagement that looks natural.",
      icon: Sparkles
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept multiple payment methods including PayPal, Credit/Debit Cards, Cryptocurrency (Bitcoin, USDT, ETH), and various local payment options depending on your country.",
      icon: CreditCard
    },
    {
      question: "Is there a money-back guarantee?",
      answer: "Yes! If we fail to deliver your order or if there's an issue with the quality, we offer full refunds. Our customer support team will help resolve any issues within 24 hours.",
      icon: DollarSign
    },
    {
      question: "Will my account get banned?",
      answer: "No. Our services are designed to be safe and comply with platform guidelines. We use gradual delivery and quality accounts to ensure your safety. We've never had a customer banned.",
      icon: Shield
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes, we offer 24/7 customer support via live chat and ticket system. Our average response time is under 5 minutes. We're always here to help with any questions or issues.",
      icon: Target
    }
  ];

  const faqs: FAQ[] = customization.faqs?.map((faq: any) => ({
    ...faq,
    icon: faq.icon ? (typeof faq.icon === 'string' ? iconMapping[faq.icon] : faq.icon) : HelpCircle
  })) || defaultFaqs;

  return (
    <section id="faq" className="py-24 relative overflow-hidden" style={{ backgroundColor: customization.backgroundColor }}>
      {/* Background Elements */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: themeMode === 'dark' 
            ? `linear-gradient(180deg, ${customization.backgroundColor || '#0A0A12'}, ${customization.primaryColor || '#8B5CF6'}08, ${customization.backgroundColor || '#0A0A12'})`
            : `linear-gradient(180deg, ${customization.backgroundColor || '#F8F7FF'}, ${customization.primaryColor || '#7C3AED'}05, ${customization.backgroundColor || '#F8F7FF'})`
        }}
      />
      <div 
        className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
        style={{ backgroundColor: `${customization.primaryColor || '#8B5CF6'}08` }}
      />
      <div 
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: `${customization.primaryColor || '#8B5CF6'}12` }}
      />
      
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{ 
              backgroundColor: `${customization.primaryColor || '#8B5CF6'}15`,
              borderColor: `${customization.primaryColor || '#8B5CF6'}30`
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <HelpCircle className="w-4 h-4" style={{ color: customization.primaryColor || '#8B5CF6' }} />
            <span className="text-sm font-medium" style={{ color: customization.primaryColor || '#8B5CF6' }}>FAQ</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>
            Your{" "}
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${customization.primaryColor || '#8B5CF6'}, ${customization.secondaryColor || '#EC4899'})` }}
            >
              questions
            </span>
            , answered
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: textMuted }}>
            Everything you need to know about our services
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
          {faqs.map((faq, index) => {
            const IconComponent = faq.icon || HelpCircle;
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                className={`group relative rounded-2xl transition-all duration-300 ${
                  openIndex === index 
                    ? `border ${borderStyle} shadow-lg`
                    : `${cardBg} backdrop-blur-sm border ${borderStyle}`
                } overflow-hidden`}
                style={{
                  backgroundColor: openIndex === index 
                    ? `${customization.primaryColor || '#8B5CF6'}08`
                    : undefined
                }}
              >
                {/* Glow effect when open */}
                {openIndex === index && (
                  <motion.div 
                    className="absolute inset-0"
                    style={{ 
                      background: `linear-gradient(90deg, ${customization.primaryColor || '#8B5CF6'}05, transparent, ${customization.primaryColor || '#8B5CF6'}05)`
                    }}
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
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: `${customization.primaryColor || '#8B5CF6'}15`,
                    }}
                    animate={{ 
                      scale: openIndex === index ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: customization.primaryColor || '#8B5CF6' }} />
                  </motion.div>
                  
                  {/* Question */}
                  <span 
                    className="font-semibold text-lg flex-1 transition-colors"
                    style={{ color: openIndex === index ? (customization.primaryColor || '#8B5CF6') : textColor }}
                  >
                    {faq.question}
                  </span>
                  
                  {/* Chevron */}
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-shrink-0 p-2 rounded-full transition-colors"
                    style={{ 
                      backgroundColor: openIndex === index ? `${customization.primaryColor || '#8B5CF6'}20` : (themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                      color: openIndex === index ? (customization.primaryColor || '#8B5CF6') : textMuted
                    }}
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
                      <div className="px-6 pb-5 pl-20">
                        <motion.p 
                          className="leading-relaxed"
                          style={{ color: textMuted }}
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
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="mb-4" style={{ color: textMuted }}>
            Still have questions?
          </p>
          <motion.a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border font-medium transition-all"
            style={{ 
              backgroundColor: `${customization.primaryColor || '#8B5CF6'}15`,
              borderColor: `${customization.primaryColor || '#8B5CF6'}30`,
              color: customization.primaryColor || '#8B5CF6'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-4 h-4" />
            Contact Support
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};