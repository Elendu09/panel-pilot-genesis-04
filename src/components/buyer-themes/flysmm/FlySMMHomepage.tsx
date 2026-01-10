import { motion } from 'framer-motion';
import { 
  Rocket, Zap, Shield, Users, Star, ArrowRight, CheckCircle, Sparkles,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ThemeCustomization } from '@/types/theme-customization';
import { 
  getAnimationVariants, getButtonStyles, getHoverScale, getLucideIcon,
  getDefaultFeatures, getDefaultTestimonials, getDefaultFAQs
} from '@/lib/theme-utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FlySMMHomepageProps {
  panelName?: string;
  services?: any[];
  stats?: {
    totalOrders?: number;
    totalUsers?: number;
    servicesCount?: number;
  };
  customization?: ThemeCustomization;
  logoUrl?: string;
}

// FlySMM Theme: Light, friendly, illustrated style with blue accents
export const FlySMMHomepage = ({ 
  panelName = 'SMM Panel', 
  services = [], 
  stats,
  customization = {},
  logoUrl 
}: FlySMMHomepageProps) => {
  // Theme defaults for FlySMM (light, blue accents)
  const defaultPrimary = '#2196F3';
  const defaultSecondary = '#00BCD4';
  const defaultBg = '#F8FAFC';
  const defaultSurface = '#FFFFFF';
  const defaultText = '#1F2937';

  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  const bgColor = customization.backgroundColor || defaultBg;
  const textCol = customization.textColor || defaultText;
  const surfaceColor = customization.surfaceColor || defaultSurface;
  const mutedColor = customization.mutedColor || '#6B7280';

  // Typography
  const fontFamily = customization.fontFamily || 'Nunito';
  const headingWeight = customization.headingWeight || '700';

  // Content
  const heroTitle = customization.heroTitle || 'Grow Your';
  const heroSubtitle = customization.heroSubtitle || 'Get real followers, likes, and views at the best prices. Fast delivery, premium quality, 24/7 support.';
  const heroCTA = customization.heroCTAText || 'Get Started';
  const heroSecondaryCTA = customization.heroSecondaryCTAText || 'View Prices';
  const displayLogo = customization.logoUrl || logoUrl;
  const companyName = customization.companyName || panelName;

  // Blog toggle
  const showBlogInMenu = customization.showBlogInMenu === true;

  // Section toggles
  const showStats = customization.enableStats !== false;
  const showFeatures = customization.enableFeatures !== false;
  const showTestimonials = customization.enableTestimonials !== false;
  const showFAQs = customization.enableFAQs !== false;

  // Content arrays
  const featureCards = customization.featureCards || [
    { title: 'Instant Delivery', description: 'Your order starts processing immediately', icon: 'Zap', color: primary },
    { title: 'Secure Payments', description: 'Protected by industry-standard encryption', icon: 'Shield', color: secondary },
    { title: '24/7 Support', description: 'Our team is always here to help you', icon: 'Users', color: '#4CAF50' },
    { title: 'Best Prices', description: 'Competitive rates for premium services', icon: 'Star', color: '#FF9800' },
  ];
  const testimonials = customization.testimonials || getDefaultTestimonials();
  const faqs = customization.faqs || getDefaultFAQs();

  // Animation settings
  const enableAnimations = customization.enableAnimations !== false;
  const hoverScale = getHoverScale(customization);

  // Spacing
  const sectionPadding = customization.sectionPaddingY || 80;
  const containerMax = customization.containerMaxWidth || 1280;

  // Button styles
  const primaryButtonStyle = getButtonStyles(customization, 'primary');

  const steps = [
    { num: '1', title: 'Create Account', desc: 'Sign up for free in seconds' },
    { num: '2', title: 'Add Funds', desc: 'Deposit using your preferred method' },
    { num: '3', title: 'Place Order', desc: 'Select service and start growing' },
  ];

  const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'Crypto', 'Apple Pay', 'Google Pay'];

  return (
    <div className={`min-h-screen font-${fontFamily.toLowerCase()}`} style={{ backgroundColor: bgColor, color: textCol }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: surfaceColor }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              {displayLogo ? (
                <img src={displayLogo} alt={companyName} className="w-10 h-10 rounded-2xl object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})`, boxShadow: `0 10px 25px -5px ${primary}33` }}>
                  <Rocket className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-xl font-bold" style={{ color: primary }}>{companyName}</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/services" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>Services</Link>
              <Link to="/orders" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>My Orders</Link>
              {showBlogInMenu && <Link to="/blog" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>Blog</Link>}
              <Link to="/support" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>Support</Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild style={{ color: mutedColor }}>
                <Link to="/auth">Login</Link>
              </Button>
              <Button size="sm" asChild className="text-white font-semibold shadow-lg hover:opacity-90" style={primaryButtonStyle}>
                <Link to="/auth?tab=signup">Sign Up Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, background: `linear-gradient(to bottom, ${surfaceColor}, ${bgColor})` }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...(enableAnimations ? { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6 } } : {})}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${primary}1a` }}>
                <Sparkles className="w-4 h-4" style={{ color: primary }} />
                <span className="text-sm font-medium" style={{ color: primary }}>Trusted by 10,000+ customers</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight" style={{ color: textCol, fontWeight: headingWeight }}>
                {heroTitle}
                <br />
                <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Social Media
                </span>
                <br />
                Today! 🚀
              </h1>

              <p className="text-lg mb-8 max-w-lg" style={{ color: mutedColor }}>{heroSubtitle}</p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" asChild className="text-white font-semibold text-lg px-8 shadow-xl hover:opacity-90" style={primaryButtonStyle}>
                  <Link to="/services" className="flex items-center gap-2">
                    {heroCTA} <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="font-semibold" style={{ borderColor: primary, color: primary }}>
                  <Link to="/auth">{heroSecondaryCTA}</Link>
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm" style={{ color: mutedColor }}>
                <CreditCard className="w-5 h-5" />
                <span>We accept: {paymentMethods.join(', ')}</span>
              </div>
            </motion.div>

            <motion.div
              {...(enableAnimations ? { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6, delay: 0.2 } } : {})}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-[400px]">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px]" style={{ backgroundColor: `${primary}33` }} />
                <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full blur-[60px]" style={{ backgroundColor: `${secondary}33` }} />
                
                <motion.div
                  animate={enableAnimations ? { y: [0, -10, 0] } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-10 right-10 p-4 rounded-2xl shadow-xl"
                  style={{ backgroundColor: surfaceColor }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primary}1a` }}>
                      <Users className="w-5 h-5" style={{ color: primary }} />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: textCol }}>{stats?.totalUsers || '10K+'}</div>
                      <div className="text-xs" style={{ color: mutedColor }}>Happy Users</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={enableAnimations ? { y: [0, 10, 0] } : {}}
                  transition={{ duration: 3.5, repeat: Infinity }}
                  className="absolute bottom-20 left-0 p-4 rounded-2xl shadow-xl"
                  style={{ backgroundColor: surfaceColor }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4CAF501a' }}>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: textCol }}>{stats?.totalOrders || '50K+'}</div>
                      <div className="text-xs" style={{ color: mutedColor }}>Orders Done</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
          <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4" style={{ color: textCol, fontWeight: headingWeight }}>
              How It <span style={{ color: primary }}>Works</span>
            </h2>
            <p style={{ color: mutedColor }} className="max-w-xl mx-auto">Get started in just 3 simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                  style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                  {step.num}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: textCol }}>{step.title}</h3>
                <p style={{ color: mutedColor }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      {showFeatures && (
        <section style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: bgColor }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl mb-4" style={{ color: textCol, fontWeight: headingWeight }}>
                Why Choose <span style={{ color: primary }}>Us</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featureCards.map((feature, idx) => {
                const IconComponent = getLucideIcon(feature.icon);
                const featureColor = feature.color || primary;
                return (
                  <motion.div
                    key={feature.title}
                    {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                    className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${featureColor}1a` }}>
                      <IconComponent className="w-6 h-6" style={{ color: featureColor }} />
                    </div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: textCol }}>{feature.title}</h3>
                    <p className="text-sm" style={{ color: mutedColor }}>{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {showTestimonials && testimonials.length > 0 && (
        <section style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl mb-4" style={{ color: textCol, fontWeight: headingWeight }}>
                What Our <span style={{ color: primary }}>Customers</span> Say
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={testimonial.name}
                  {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                  className="p-6 rounded-2xl"
                  style={{ backgroundColor: bgColor }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#FFB800' }} />
                    ))}
                  </div>
                  <p className="mb-4" style={{ color: mutedColor }}>"{testimonial.text}"</p>
                  <div className="font-semibold" style={{ color: textCol }}>{testimonial.name}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {showFAQs && faqs.length > 0 && (
        <section style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: bgColor }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl mb-4" style={{ color: textCol, fontWeight: headingWeight }}>
                Frequently Asked <span style={{ color: primary }}>Questions</span>
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="rounded-2xl px-6 shadow-sm" style={{ backgroundColor: surfaceColor, border: 'none' }}>
                    <AccordionTrigger className="text-left font-semibold hover:no-underline" style={{ color: textCol }}>{faq.question}</AccordionTrigger>
                    <AccordionContent style={{ color: mutedColor }}>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: bgColor }}>
        <div className="mx-auto px-4" style={{ maxWidth: 900 }}>
          <motion.div
            {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})}
            className="p-12 rounded-3xl shadow-xl text-center"
            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Grow Your Social Media?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of satisfied customers and start growing today.
            </p>
            <Button size="lg" asChild className="font-semibold text-lg px-10 shadow-xl hover:opacity-90"
              style={{ backgroundColor: surfaceColor, color: primary }}>
              <Link to="/auth?tab=signup">
                Start Now - It's Free! <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: surfaceColor, borderTop: `1px solid ${bgColor}` }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {displayLogo ? (
                <img src={displayLogo} alt={companyName} className="w-5 h-5 rounded object-contain" />
              ) : (
                <Rocket className="w-5 h-5" style={{ color: primary }} />
              )}
              <span style={{ color: mutedColor }}>© {new Date().getFullYear()} {companyName}. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/terms" style={{ color: mutedColor }}>Terms</Link>
              <Link to="/privacy" style={{ color: mutedColor }}>Privacy</Link>
              <Link to="/support" style={{ color: mutedColor }}>Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FlySMMHomepage;
