import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles, Rocket, Scale, DollarSign, CreditCard, Globe, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      question: "What is an SMM panel and how does it work?",
      answer: "An SMM panel is a social media marketing platform that allows users to purchase social media services like followers, likes, views, and comments. Our white-label solution lets you create and manage your own branded SMM panel with custom domains, themes, and complete control over pricing and services.",
      iconKey: "rocket",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      question: "Is it legal to use an SMM panel for social media growth?",
      answer: "Yes, SMM panels are legal business tools. However, it's important to comply with each social media platform's terms of service and local regulations. We recommend transparency with your customers about the nature of the services and ensuring all services are delivered ethically.",
      iconKey: "scale",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      question: "How much can I earn with my SMM panel?",
      answer: "Earnings vary based on your marketing efforts, pricing strategy, and customer base. Our platform charges only 5% commission on completed orders with zero fees if you have no income. Many successful panel owners earn thousands monthly by building a loyal customer base.",
      iconKey: "dollar",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      question: "What payment methods do you support?",
      answer: "We support 200+ payment systems including PayPal, Stripe, Paystack, Korapay, Flutterwave, PerfectMoney, Cryptomus, USDT, and bank transfers for multiple countries. You can configure which payment methods to offer your customers.",
      iconKey: "credit",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      question: "Can I use my own domain name?",
      answer: "Absolutely! You can connect your own custom domain or use a free subdomain (yourpanel.ourplatform.com). We provide SSL certificates and handle all the technical setup for you.",
      iconKey: "globe",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      question: "Do you provide customer support?",
      answer: "Yes, we provide comprehensive support for panel owners including setup assistance, technical support, and business guidance. Your customers will contact you directly for support, but we're here to help you succeed.",
      iconKey: "target",
      gradient: "from-red-500 to-rose-500"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
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
            <span className="text-sm font-medium text-primary">FAQ</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              questions
            </span>
            , answered
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about starting your SMM panel
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
            Still have questions?
          </p>
          <motion.a
            href="/support"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium hover:bg-primary/20 transition-all"
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