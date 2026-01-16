import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, Zap, Shield, Users, Star, ArrowRight, CheckCircle, Sparkles,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ThemeCustomization } from '@/types/theme-customization';
import { 
  getAnimationVariants, getButtonStyles, getHoverScale, getLucideIcon,
  getDefaultFeatures, getDefaultTestimonials, getDefaultFAQs, getSocialLinks,
  getModeColors, getSocialIconMap
} from '@/lib/theme-utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ThemeNavigation } from '../shared/ThemeNavigation';
import { AnimatedHeroText, getThemeDefaultAnimationStyle, getAnimatedWordFromTitle } from '../shared/AnimatedHeroText';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Theme mode - reactive to customization prop (no local state), FlySMM defaults to light
  const themeMode = customization.themeMode || 'light';
  const isLightMode = themeMode === 'light';
  
  // Theme defaults for FlySMM (light, blue accents)
  const defaultPrimary = '#2196F3';
  const defaultSecondary = '#00BCD4';

  // FlySMM theme color defaults
  const themeDefaults = {
    lightBg: '#F8FAFC',
    darkBg: '#0F172A',
    lightSurface: '#FFFFFF',
    darkSurface: '#1E293B',
    lightText: '#1F2937',
    darkText: '#FFFFFF',
    lightMuted: '#6B7280',
    darkMuted: '#9CA3AF',
    lightBorder: '#E5E7EB',
    darkBorder: '#334155',
  };

  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  
  // Get mode-specific colors
  const modeColors = getModeColors(customization, isLightMode, themeDefaults);
  const { backgroundColor: bgColor, surfaceColor, textColor: textCol, mutedColor } = modeColors;

  // Typography
  const fontFamily = customization.fontFamily || 'Nunito';
  const headingWeight = customization.headingWeight || '700';

  // Content - use translations for fallback text
  const heroTitle = customization.heroTitle || t('buyer.hero.title');
  const heroSubtitle = customization.heroSubtitle || t('buyer.hero.subtitle');
  const heroCTA = customization.heroCTAText || t('buyer.hero.cta');
  const heroSecondaryCTA = customization.heroSecondaryCTAText || t('buyer.hero.ctaSecondary');
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

  // Content arrays with translations
  const featureCards = customization.featureCards || [
    { title: t('buyer.features.instantStart'), description: t('buyer.features.instantStartDesc'), icon: 'Zap', color: primary },
    { title: t('buyer.features.bestPrices'), description: t('buyer.features.bestPricesDesc'), icon: 'Shield', color: secondary },
    { title: t('buyer.features.support'), description: t('buyer.features.supportDesc'), icon: 'Users', color: '#4CAF50' },
    { title: t('buyer.features.highQuality'), description: t('buyer.features.highQualityDesc'), icon: 'Star', color: '#FF9800' },
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

  // Theme mode change handler (no-op since we read from customization prop)
  const handleThemeModeChange = useCallback((mode: 'light' | 'dark') => {
    // Theme mode is controlled by parent via customization.themeMode
  }, []);

  const steps = [
    { num: '1', title: 'Create Account', desc: 'Sign up for free in seconds' },
    { num: '2', title: 'Add Funds', desc: 'Deposit using your preferred method' },
    { num: '3', title: 'Place Order', desc: 'Select service and start growing' },
  ];

  const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'Crypto', 'Apple Pay', 'Google Pay'];

  return (
    <main role="main" className={`min-h-screen font-${fontFamily.toLowerCase()} ${themeMode}`} style={{ backgroundColor: bgColor, color: textCol }}>
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
          <img 
            src="/default-panel-favicon.png" 
            alt={companyName} 
            className="w-10 h-10 rounded-2xl object-contain"
          />
        }
        defaultIcon={
          <img 
            src="/default-panel-favicon.png" 
            alt={companyName} 
            className="w-10 h-10 rounded-2xl object-contain"
          />
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
        signupLabel="Sign Up Free"
        navLinks={[
          { label: 'Services', to: '/services' },
          { label: 'My Orders', to: '/orders' },
          ...(showBlogInMenu ? [{ label: 'Blog', to: '/blog' }] : []),
          { label: 'Support', to: '/support' },
        ]}
      />

      <article>
        {/* Hero Section */}
        <section id="hero" aria-label="Hero Section" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, background: `linear-gradient(to bottom, ${surfaceColor}, ${bgColor})` }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6 } } : {})}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${primary}1a` }}>
                  <Sparkles className="w-4 h-4" style={{ color: primary }} />
                  <span className="text-sm font-medium" style={{ color: primary }}>Trusted by 10,000+ customers</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight" style={{ color: textCol, fontWeight: headingWeight }}>
                  {(() => {
                    const position = customization.heroAnimatedTextPosition || 'last';
                    const { before, animatedWord, after } = getAnimatedWordFromTitle(heroTitle, position);
                    const effectiveAnimStyle = customization.heroAnimatedTextStyle || getThemeDefaultAnimationStyle('flysmm');
                    return (
                      <>
                        {before && <span>{before} </span>}
                        <AnimatedHeroText 
                          text={animatedWord}
                          animationStyle={effectiveAnimStyle}
                          primaryColor={primary}
                          secondaryColor={secondary}
                          enableAnimations={enableAnimations}
                        />
                        {after && <span> {after}</span>}
                      </>
                    );
                  })()}
                </h1>

                <p className="text-lg mb-8 max-w-lg" style={{ color: mutedColor }}>{heroSubtitle}</p>

                {/* Dynamic CTA based on enableFastOrder */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {enableFastOrder ? (
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => navigate('/fast-order')}
                        className="text-white font-semibold text-lg px-8 shadow-xl hover:opacity-90" 
                        style={primaryButtonStyle}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        Fast Order
                      </Button>
                      <Button size="lg" variant="outline" asChild className="font-semibold" style={{ borderColor: primary, color: primary }}>
                        <Link to="/services">View Services</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="lg" asChild className="text-white font-semibold text-lg px-8 shadow-xl hover:opacity-90" style={primaryButtonStyle}>
                        <Link to="/services" className="flex items-center gap-2">
                          {heroCTA} <ArrowRight className="w-5 h-5" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild className="font-semibold" style={{ borderColor: primary, color: primary }}>
                        <Link to="/auth">{heroSecondaryCTA}</Link>
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm" style={{ color: mutedColor }}>
                  <CreditCard className="w-5 h-5" />
                  <span>We accept: {paymentMethods.join(', ')}</span>
                </div>
              </motion.div>

              <motion.div
                {...(enableAnimations ? { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6, delay: 0.2 } } : {})}
                className="relative hidden lg:block"
                aria-hidden="true"
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
        <section id="how-it-works" aria-label="How It Works" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
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
          <section id="features" aria-label="Features" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: bgColor }}>
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
          <section id="testimonials" aria-label="Customer Reviews" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
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
          <section id="faq" aria-label="Frequently Asked Questions" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: bgColor }}>
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
        <section id="cta" aria-label="Call to Action" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: bgColor }}>
          <div className="mx-auto px-4" style={{ maxWidth: 900 }}>
            <motion.div
              {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})}
              className="text-center p-12 rounded-3xl text-white"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              <h2 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: headingWeight }}>
                Ready to Grow Your Social Media?
              </h2>
              <p className="mb-8 opacity-90 max-w-xl mx-auto">
                Join thousands of satisfied customers and start your journey today!
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
                  <Link to="/auth?tab=signup">Get Started Free <ArrowRight className="w-5 h-5 ml-2" /></Link>
                </Button>
              )}
            </motion.div>
          </div>
        </section>
      </article>

      {/* Enhanced Footer */}
      {(customization.enableFooter !== false) && (
        <footer className="py-16" style={{ 
          backgroundColor: isLightMode ? surfaceColor : surfaceColor,
          borderTop: `1px solid ${primary}1a` 
        }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {/* Brand Column */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  {displayLogo ? (
                    <img src={displayLogo} alt={companyName} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primary }}>
                      <Rocket className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="font-bold text-lg">{companyName}</span>
                </div>
                <p className="text-sm mb-4" style={{ color: mutedColor }}>
                  {customization.footerAbout || 'Your trusted partner for social media growth.'}
                </p>
                {(() => {
                  const socialLinks = getSocialLinks(customization.socialLinks);
                  const iconMap = getSocialIconMap();
                  return socialLinks.length > 0 && (
                    <div className="flex gap-3">
                      {socialLinks.map(link => {
                        const Icon = iconMap[link.id] || Sparkles;
                        return (
                          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                            <Icon className="w-5 h-5" />
                          </a>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
              
              {/* Services Column */}
              <div>
                <h4 className="font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/services" className="hover:opacity-80 transition-opacity">All Services</Link></li>
                  <li><Link to="/services?platform=instagram" className="hover:opacity-80 transition-opacity">Instagram</Link></li>
                  <li><Link to="/services?platform=youtube" className="hover:opacity-80 transition-opacity">YouTube</Link></li>
                  <li><Link to="/services?platform=tiktok" className="hover:opacity-80 transition-opacity">TikTok</Link></li>
                </ul>
              </div>
              
              {/* Company Column */}
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/support" className="hover:opacity-80 transition-opacity">About Us</Link></li>
                  <li><Link to="/support" className="hover:opacity-80 transition-opacity">Contact</Link></li>
                  {showBlogInMenu && <li><Link to="/blog" className="hover:opacity-80 transition-opacity">Blog</Link></li>}
                </ul>
              </div>
              
              {/* Support Column */}
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><a href="#faq" className="hover:opacity-80 transition-opacity">FAQ</a></li>
                  <li><Link to="/terms" className="hover:opacity-80 transition-opacity">Terms</Link></li>
                  <li><Link to="/privacy" className="hover:opacity-80 transition-opacity">Privacy</Link></li>
                </ul>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="pt-8 text-center text-sm" style={{ borderTop: `1px solid ${primary}1a`, color: mutedColor }}>
              {customization.footerText || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
            </div>
          </div>
        </footer>
      )}
    </main>
  );
};

export default FlySMMHomepage;