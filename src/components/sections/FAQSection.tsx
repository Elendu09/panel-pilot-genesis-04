import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is an SMM panel and how does it work?",
      answer: "An SMM panel is a social media marketing platform that allows users to purchase social media services like followers, likes, views, and comments. Our white-label solution lets you create and manage your own branded SMM panel with custom domains, themes, and complete control over pricing and services."
    },
    {
      question: "Is it legal to use an SMM panel for social media growth?",
      answer: "Yes, SMM panels are legal business tools. However, it's important to comply with each social media platform's terms of service and local regulations. We recommend transparency with your customers about the nature of the services and ensuring all services are delivered ethically."
    },
    {
      question: "How much can I earn with my SMM panel?",
      answer: "Earnings vary based on your marketing efforts, pricing strategy, and customer base. Our platform charges only 5% commission on completed orders with zero fees if you have no income. Many successful panel owners earn thousands monthly by building a loyal customer base."
    },
    {
      question: "What payment methods do you support?",
      answer: "We support 200+ payment systems including PayPal, Stripe, Paystack, Korapay, Flutterwave, PerfectMoney, Cryptomus, USDT, and bank transfers for multiple countries. You can configure which payment methods to offer your customers."
    },
    {
      question: "Can I use my own domain name?",
      answer: "Absolutely! You can connect your own custom domain or use a free subdomain (yourpanel.ourplatform.com). We provide SSL certificates and handle all the technical setup for you."
    },
    {
      question: "Do you provide customer support?",
      answer: "Yes, we provide comprehensive support for panel owners including setup assistance, technical support, and business guidance. Your customers will contact you directly for support, but we're here to help you succeed."
    }
  ];

  return (
    <section className="py-20 bg-accent/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about starting your SMM panel
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-gradient-card border border-border rounded-xl mb-4 overflow-hidden shadow-card"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};