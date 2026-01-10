import { motion } from 'framer-motion';
import { 
  Globe, Zap, Users, Star, ArrowRight, Award, TrendingUp,
  Instagram, Youtube, Twitter, Facebook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ThemeCustomization } from '@/types/theme-customization';
import { 
  getButtonStyles, getHoverScale, getLucideIcon,
  getDefaultFeatures, getDefaultTestimonials, getDefaultFAQs
} from '@/lib/theme-utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SMMVisitHomepageProps {
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

// SMMVisit Theme: Light gray, yellow/gold primary, clean professional
export const SMMVisitHomepage = ({ 
  panelName = 'SMM Panel', 
  services = [], 
  stats,
  customization = {},
  logoUrl 
}: SMMVisitHomepageProps) => {
  // Theme defaults for SMMVisit (yellow/gold on light)
  const defaultPrimary = '#FFD700';
  const defaultSecondary = '#FFC107';
  const defaultBg = '#F5F5F5';
  const defaultSurface = '#FFFFFF';
  const defaultText = '#1A1A1A';

  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  const bgColor = customization.backgroundColor || defaultBg;
  const textCol = customization.textColor || defaultText;
  const surfaceColor = customization.surfaceColor || defaultSurface;
  const mutedColor = customization.mutedColor || '#6B7280';

  // Typography
  const fontFamily = customization.fontFamily || 'Inter';
  const headingWeight = customization.headingWeight || '700';

  // Content
  const heroTitle = customization.heroTitle || 'Boost Your';
  const heroSubtitle = customization.heroSubtitle || 'Get real followers, likes, and views at the lowest prices. Trusted by over 100,000+ users worldwide.';
  const heroCTA = customization.heroCTAText || 'Get Started';
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
    { title: 'Instant Start', description: 'Orders begin processing immediately', icon: 'Zap' },
    { title: 'High Quality', description: 'Real and active accounts', icon: 'Award' },
    { title: 'Best Prices', description: 'Most competitive rates', icon: 'TrendingUp' },
    { title: '24/7 Support', description: 'Always here to help', icon: 'Users' },
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

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  ];

  return (
    <div className={`min-h-screen font-${fontFamily.toLowerCase()}`} style={{ backgroundColor: bgColor, color: textCol }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 rounded-b-2xl shadow-sm mx-4 mt-2" style={{ backgroundColor: surfaceColor }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              {displayLogo ? (
                <img src={displayLogo} alt={companyName} className="w-10 h-10 rounded-xl object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                  <Globe className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-xl font-bold" style={{ color: textCol }}>{companyName}</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/services" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>Services</Link>
              <Link to="/orders" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>Orders</Link>
              {showBlogInMenu && <Link to="/blog" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>Blog</Link>}
              <Link to="/support" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>Support</Link>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="font-medium" style={{ color: textCol }}>
                <Link to="/auth">Login</Link>
              </Button>
              <Button size="sm" asChild className="font-semibold text-white shadow-lg hover:opacity-90" style={primaryButtonStyle}>
                <Link to="/auth?tab=signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ maxWidth: containerMax }}>
          <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } } : {})}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6" style={{ fontWeight: headingWeight }}>
              {heroTitle}
              <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> Social Media</span>
            </h1>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: mutedColor }}>{heroSubtitle}</p>
            <Button size="lg" asChild className="font-semibold text-lg px-10 text-white shadow-xl hover:opacity-90" style={primaryButtonStyle}>
              <Link to="/services">{heroCTA} <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      {showStats && (
        <section className="py-16" style={{ backgroundColor: surfaceColor }}>
          <div className="mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8" style={{ maxWidth: containerMax }}>
            {[
              { label: 'Happy Users', value: stats?.totalUsers || '100K+' },
              { label: 'Orders Completed', value: stats?.totalOrders || '1M+' },
              { label: 'Services', value: stats?.servicesCount || '500+' },
              { label: 'Countries', value: '150+' },
            ].map((stat, idx) => (
              <motion.div 
                key={stat.label} 
                className="text-center"
                {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
              >
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: textCol }}>{stat.value}</div>
                <div className="text-sm" style={{ color: mutedColor }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      {showFeatures && (
        <section style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          <div className="mx-auto px-4" style={{ maxWidth: containerMax }}>
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: textCol, fontWeight: headingWeight }}>Why Choose Us</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featureCards.map((feature, idx) => {
                const IconComponent = getLucideIcon(feature.icon);
                return (
                  <motion.div 
                    key={feature.title} 
                    {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                    className="p-6 rounded-2xl shadow-lg" 
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                      <IconComponent className="w-6 h-6 text-white" />
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

      {/* Reviews */}
      {showTestimonials && testimonials.length > 0 && (
        <section style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
          <div className="mx-auto px-4" style={{ maxWidth: containerMax }}>
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: textCol, fontWeight: headingWeight }}>Customer Reviews</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((review, idx) => (
                <motion.div 
                  key={review.name} 
                  {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                  className="p-6 rounded-2xl" 
                  style={{ backgroundColor: bgColor }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" style={{ color: primary }} />
                    ))}
                  </div>
                  <p className="mb-4" style={{ color: mutedColor }}>"{review.text}"</p>
                  <div className="font-semibold" style={{ color: textCol }}>{review.name}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {showFAQs && faqs.length > 0 && (
        <section style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: headingWeight, color: textCol }}>
                Frequently Asked <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Questions</span>
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
      <section style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
        <div className="mx-auto px-4 text-center" style={{ maxWidth: 900 }}>
          <motion.div 
            {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})}
            className="p-12 rounded-3xl"
            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontWeight: headingWeight }}>
              Ready to Boost Your Social Media?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of satisfied customers and start growing today.
            </p>
            <Button size="lg" asChild className="font-semibold text-lg px-10 shadow-xl hover:opacity-90" style={{ backgroundColor: surfaceColor, color: textCol }}>
              <Link to="/auth?tab=signup">Get Started Now <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: surfaceColor, borderTop: `1px solid ${bgColor}` }}>
        <div className="mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4" style={{ maxWidth: containerMax }}>
          <div className="flex items-center gap-2">
            {displayLogo ? (
              <img src={displayLogo} alt={companyName} className="w-5 h-5 rounded object-contain" />
            ) : (
              <Globe className="w-5 h-5" style={{ color: primary }} />
            )}
            <span style={{ color: mutedColor }}>© {new Date().getFullYear()} {companyName}. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/terms" style={{ color: mutedColor }}>Terms</Link>
            <Link to="/privacy" style={{ color: mutedColor }}>Privacy</Link>
            <Link to="/support" style={{ color: mutedColor }}>Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SMMVisitHomepage;
