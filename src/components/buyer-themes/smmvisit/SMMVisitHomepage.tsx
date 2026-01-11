import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Zap, Users, Star, ArrowRight, Award, TrendingUp,
  Instagram, Youtube, Twitter, Facebook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ThemeCustomization } from '@/types/theme-customization';
import { 
  getButtonStyles, getHoverScale, getLucideIcon,
  getDefaultFeatures, getDefaultTestimonials, getDefaultFAQs
} from '@/lib/theme-utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ThemeNavigation } from '../shared/ThemeNavigation';

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
  const navigate = useNavigate();
  
  // Theme mode state - SMMVisit defaults to light
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(customization.themeMode || 'light');
  const isLightMode = themeMode === 'light';
  
  // Theme defaults for SMMVisit (yellow/gold on light)
  const defaultPrimary = '#FFD700';
  const defaultSecondary = '#FFC107';
  const defaultBgLight = '#F5F5F5';
  const defaultBgDark = '#1A1A1A';
  const defaultSurfaceLight = '#FFFFFF';
  const defaultSurfaceDark = '#262626';

  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  const bgColor = isLightMode 
    ? (customization.backgroundColor || defaultBgLight) 
    : (customization.backgroundColor || defaultBgDark);
  const textCol = isLightMode 
    ? (customization.textColor || '#1A1A1A') 
    : (customization.textColor || '#FFFFFF');
  const surfaceColor = isLightMode 
    ? (customization.surfaceColor || defaultSurfaceLight) 
    : (customization.surfaceColor || defaultSurfaceDark);
  const mutedColor = isLightMode 
    ? (customization.mutedColor || '#6B7280') 
    : (customization.mutedColor || '#9CA3AF');

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

  // Fast Order toggle - determines CTA buttons
  const enableFastOrder = customization.enableFastOrder !== false;

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

  // Theme mode change handler
  const handleThemeModeChange = useCallback((mode: 'light' | 'dark') => {
    setThemeMode(mode);
  }, []);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  ];

  return (
    <main role="main" className={`min-h-screen font-${fontFamily.toLowerCase()}`} style={{ backgroundColor: bgColor, color: textCol }}>
      {/* FAQPage JSON-LD Schema for rich snippets */}
      {showFAQs && faqs.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map(faq => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer
                }
              }))
            })}
          </script>
        </Helmet>
      )}

      {/* Navigation */}
      <ThemeNavigation
        companyName={companyName}
        logoUrl={displayLogo}
        logoIcon={
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
            <Globe className="w-6 h-6 text-white" />
          </div>
        }
        showBlogInMenu={showBlogInMenu}
        themeMode={themeMode}
        onThemeModeChange={handleThemeModeChange}
        containerMax={containerMax}
        mutedColor={mutedColor}
        primaryColor={primary}
        textColor={textCol}
        surfaceColor={surfaceColor}
        bgColor={bgColor}
        navStyle="floating"
        primaryButtonStyle={primaryButtonStyle}
        signupLabel="Sign Up"
      />

      <article>
        {/* Hero Section */}
        <section id="hero" aria-label="Hero Section" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ maxWidth: containerMax }}>
            <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } } : {})}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6" style={{ fontWeight: headingWeight }}>
                {heroTitle}
                <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> Social Media</span>
              </h1>
              <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: mutedColor }}>{heroSubtitle}</p>
              
              {/* Dynamic CTA based on enableFastOrder */}
              {enableFastOrder ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/fast-order')}
                    className="font-semibold text-lg px-10 text-white shadow-xl hover:opacity-90" 
                    style={primaryButtonStyle}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Fast Order
                  </Button>
                  <Button size="lg" variant="outline" asChild className="font-semibold" style={{ borderColor: primary, color: textCol }}>
                    <Link to="/services">View Services</Link>
                  </Button>
                </div>
              ) : (
                <Button size="lg" asChild className="font-semibold text-lg px-10 text-white shadow-xl hover:opacity-90" style={primaryButtonStyle}>
                  <Link to="/services">{heroCTA} <ArrowRight className="w-5 h-5 ml-2" /></Link>
                </Button>
              )}
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        {showStats && (
          <section id="stats" aria-label="Statistics" className="py-16" style={{ backgroundColor: surfaceColor }}>
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
          <section id="features" aria-label="Features" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
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
          <section id="testimonials" aria-label="Customer Reviews" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
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
          <section id="faq" aria-label="Frequently Asked Questions" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
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
        <section id="cta" aria-label="Call to Action" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
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
              {enableFastOrder ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/fast-order')}
                  className="font-semibold text-lg px-10 shadow-xl hover:opacity-90" 
                  style={{ backgroundColor: surfaceColor, color: textCol }}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Fast Order Now
                </Button>
              ) : (
                <Button size="lg" asChild className="font-semibold text-lg px-10 shadow-xl hover:opacity-90" style={{ backgroundColor: surfaceColor, color: textCol }}>
                  <Link to="/auth?tab=signup">Get Started Now <ArrowRight className="w-5 h-5 ml-2" /></Link>
                </Button>
              )}
            </motion.div>
          </div>
        </section>
      </article>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: surfaceColor, borderTop: `1px solid ${bgColor}` }}>
        <div className="mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4" style={{ maxWidth: containerMax }}>
          <div className="flex items-center gap-2">
            {displayLogo ? (
              <img src={displayLogo} alt={companyName} className="w-5 h-5 rounded object-contain" loading="lazy" />
            ) : (
              <Globe className="w-5 h-5" style={{ color: primary }} />
            )}
            <span style={{ color: mutedColor }}>© {new Date().getFullYear()} {companyName}. All rights reserved.</span>
          </div>
          <nav className="flex gap-6 text-sm" aria-label="Footer navigation">
            <Link to="/terms" style={{ color: mutedColor }}>Terms</Link>
            <Link to="/privacy" style={{ color: mutedColor }}>Privacy</Link>
            <Link to="/support" style={{ color: mutedColor }}>Support</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
};

export default SMMVisitHomepage;