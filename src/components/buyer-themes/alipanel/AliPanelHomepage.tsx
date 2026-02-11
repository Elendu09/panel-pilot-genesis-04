import { useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, Shield, Users, Star, ArrowRight, CheckCircle, X,
  Instagram, Youtube, Twitter, Music, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BuyerAuthContext } from '@/contexts/BuyerAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ThemeCustomization } from '@/types/theme-customization';
import { 
  getAnimationVariants, getContainerVariants, getItemVariants,
  getButtonStyles, getCardStyles, getHoverScale, getLucideIcon,
  getDefaultStats, getDefaultFeatures, getDefaultTestimonials, getDefaultFAQs,
  getSocialLinks, getModeColors, getSocialIconMap
} from '@/lib/theme-utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ThemeNavigation } from '../shared/ThemeNavigation';
import { AnimatedHeroText, getThemeDefaultAnimationStyle, getAnimatedWordFromTitle } from '../shared/AnimatedHeroText';
import { useLanguage } from '@/contexts/LanguageContext';

interface AliPanelHomepageProps {
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

// AliPanel Theme: Dark with pink-orange gradients, floating icons, glassmorphism
export const AliPanelHomepage = ({ 
  panelName = 'SMM Panel', 
  services = [], 
  stats,
  customization = {},
  logoUrl 
}: AliPanelHomepageProps) => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  
  // Check if buyer is logged in for login-aware CTA
  const buyerAuthContext = useContext(BuyerAuthContext);
  const buyer = buyerAuthContext?.buyer || null;
  
  // Theme mode - reactive to customization prop (no local state)
  const themeMode = customization.themeMode || 'dark';
  const isLightMode = themeMode === 'light';
  
  // Theme defaults for AliPanel (pink-orange gradient)
  const defaultPrimary = '#FF6B6B';
  const defaultSecondary = '#FF8E53';
  const defaultAccent = '#FFCC70';
  
  // AliPanel theme color defaults
  const themeDefaults = {
    lightBg: '#FAFBFC',
    darkBg: '#0A0A0A',
    lightSurface: '#FFFFFF',
    darkSurface: '#1A1A1A',
    lightText: '#1F2937',
    darkText: '#FFFFFF',
    lightMuted: '#6B7280',
    darkMuted: '#A1A1AA',
    lightBorder: '#E5E7EB',
    darkBorder: '#333333',
  };

  // Use customization colors with light/dark mode adjustments
  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  const accent = customization.accentColor || defaultAccent;
  
  // Get mode-specific colors
  const modeColors = getModeColors(customization, isLightMode, themeDefaults);
  const { backgroundColor: bgColor, surfaceColor, textColor: textCol, mutedColor } = modeColors;

  // Typography
  const fontFamily = customization.fontFamily || 'Poppins';
  const headingFont = customization.headingFont || fontFamily;
  const headingWeight = customization.headingWeight || '700';

  // Content from customization or translations (fallback to translation keys)
  const heroTitle = customization.heroTitle || t('buyer.hero.title');
  const heroSubtitle = customization.heroSubtitle || t('buyer.hero.subtitle');
  const heroBadge = customization.heroBadgeText || t('buyer.hero.badge');
  const heroCTA = customization.heroCTAText || t('buyer.hero.cta');
  const heroSecondaryCTA = customization.heroSecondaryCTAText || t('buyer.hero.ctaSecondary');
  const displayLogo = customization.logoUrl || logoUrl;
  const companyName = customization.companyName || panelName;

  // Blog toggle - use nullish coalescing to properly handle undefined/false values
  const showBlogInMenu = customization.showBlogInMenu ?? false;

  // Fast Order toggle - determines CTA buttons
  const enableFastOrder = customization.enableFastOrder === true;

  // Section toggles
  const showStats = customization.enableStats !== false;
  const showFeatures = customization.enableFeatures !== false;
  const showTestimonials = customization.enableTestimonials !== false;
  const showFAQs = customization.enableFAQs !== false;

  // Content arrays with translations
  const featureCards = customization.featureCards || [
    { title: t('buyer.features.instantStart'), description: t('buyer.features.instantStartDesc'), icon: 'Zap' },
    { title: t('buyer.features.highQuality'), description: t('buyer.features.highQualityDesc'), icon: 'Award' },
    { title: t('buyer.features.bestPrices'), description: t('buyer.features.bestPricesDesc'), icon: 'TrendingUp' },
    { title: t('buyer.features.support'), description: t('buyer.features.supportDesc'), icon: 'Users' },
  ];
  const testimonials = customization.testimonials || getDefaultTestimonials();
  const faqs = customization.faqs || getDefaultFAQs();

  // Animation settings
  const animationVariants = getAnimationVariants(customization);
  const containerVariants = getContainerVariants(customization);
  const itemVariants = getItemVariants(customization);
  const hoverScale = getHoverScale(customization);
  const enableAnimations = customization.enableAnimations !== false;

  // Button styles
  const primaryButtonStyle = getButtonStyles(customization, 'primary');
  const outlineButtonStyle = getButtonStyles(customization, 'outline');

  // Card styles
  const cardStyle = getCardStyles(customization);

  // Spacing
  const sectionPadding = customization.sectionPaddingY || 80;
  const containerMax = customization.containerMaxWidth || 1280;

  // Theme mode change handler (no-op since we read from customization prop)
  const handleThemeModeChange = useCallback((mode: 'light' | 'dark') => {
    // Theme mode is controlled by parent via customization.themeMode
  }, []);

  const floatingIcons = [
    { icon: Instagram, color: '#E4405F', delay: 0, x: -120, y: -80 },
    { icon: Youtube, color: '#FF0000', delay: 0.2, x: 130, y: -60 },
    { icon: Twitter, color: '#1DA1F2', delay: 0.4, x: -100, y: 60 },
    { icon: Music, color: '#1DB954', delay: 0.6, x: 110, y: 80 },
    { icon: Video, color: '#000000', delay: 0.8, x: 0, y: -120 },
  ];

  const servicePills = [
    { name: t('buyer.platforms.followers') || 'Followers', gradient: `linear-gradient(to right, ${primary}, ${secondary})` },
    { name: t('buyer.platforms.likes') || 'Likes', gradient: `linear-gradient(to right, ${secondary}, ${accent})` },
    { name: t('buyer.platforms.views') || 'Views', gradient: 'linear-gradient(to right, #8B5CF6, #A855F7)' },
    { name: t('buyer.platforms.comments') || 'Comments', gradient: 'linear-gradient(to right, #06B6D4, #3B82F6)' },
  ];

  const comparisonItems = [
    { feature: t('buyer.features.instantStart') || 'Instant Start', us: true, others: false },
    { feature: t('buyer.features.support') || '24/7 Support', us: true, others: false },
    { feature: t('buyer.features.refillGuarantee') || 'Refill Guarantee', us: true, others: false },
    { feature: t('buyer.features.securePayments') || 'Secure Payments', us: true, others: true },
    { feature: t('buyer.features.bestPrices') || 'Low Prices', us: true, others: false },
  ];

  return (
    <main role="main" className={`min-h-screen overflow-hidden font-${fontFamily.toLowerCase()} ${themeMode}`} style={{ backgroundColor: bgColor, color: textCol }}>
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

      {/* Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]" style={{ background: `linear-gradient(to right, ${primary}33, ${secondary}33)` }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: `linear-gradient(to right, ${accent}26, ${primary}26)` }} />
      </div>

      {/* Navigation */}
      <ThemeNavigation
        companyName={companyName}
        logoUrl={displayLogo}
        logoIcon={
          <img 
            src="/default-panel-favicon.png" 
            alt={companyName} 
            className="w-10 h-10 rounded-xl object-contain"
          />
        }
        defaultIcon={
          <img 
            src="/default-panel-favicon.png" 
            alt={companyName} 
            className="w-10 h-10 rounded-xl object-contain"
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
        primaryButtonStyle={primaryButtonStyle}
        signupLabel={t('buyer.nav.getStarted') || 'Get Started'}
      />

      <article>
        {/* Hero Section */}
        <section id="hero" aria-label="Hero Section" className="relative overflow-hidden" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6 } } : {})}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                  style={{ background: `linear-gradient(to right, ${primary}1a, ${secondary}1a)`, border: `1px solid ${primary}33` }}>
                  <Star className="w-4 h-4" style={{ color: accent }} />
                  <span className="text-sm text-white/80">{heroBadge}</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight" style={{ fontWeight: headingWeight, fontFamily: headingFont }}>
                  {(() => {
                    const position = customization.heroAnimatedTextPosition || 'last';
                    const { before, animatedWord, after } = getAnimatedWordFromTitle(heroTitle, position);
                    const effectiveAnimStyle = customization.heroAnimatedTextStyle || getThemeDefaultAnimationStyle('alipanel');
                    return (
                      <>
                        {before && (
                          <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {before}{' '}
                          </span>
                        )}
                        <AnimatedHeroText 
                          text={animatedWord}
                          animationStyle={effectiveAnimStyle}
                          primaryColor={primary}
                          secondaryColor={secondary}
                          enableAnimations={enableAnimations}
                        />
                        {after && (
                          <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {' '}{after}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </h1>

                <p className="text-lg mb-8 max-w-lg" style={{ color: mutedColor }}>{heroSubtitle}</p>

                {/* Service Pills */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {servicePills.map((pill) => (
                    <motion.span
                      key={pill.name}
                      whileHover={enableAnimations ? { scale: 1.05 } : {}}
                      className="px-4 py-2 rounded-full text-sm font-medium text-white"
                      style={{ background: pill.gradient }}
                    >
                      {pill.name}
                    </motion.span>
                  ))}
                </div>

                {/* Dynamic CTA based on enableFastOrder - Default: Get Started + Fast Order */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {enableFastOrder ? (
                    // When enableFastOrder is ON: Fast Order primary + View Services secondary
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => navigate('/fast-order')}
                        className="text-white font-semibold text-lg px-8 shadow-xl hover:opacity-90" 
                        style={primaryButtonStyle}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        {t('buyer.fastOrder.title') || 'Fast Order'}
                      </Button>
                      <Button size="lg" variant="outline" asChild className="font-semibold hover:bg-white/5" style={outlineButtonStyle}>
                        <Link to="/services">{t('buyer.services.viewAll') || 'View Services'}</Link>
                      </Button>
                    </>
                  ) : (
                    // Default (enableFastOrder OFF): Get Started (login-aware) + Fast Order
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => buyer ? navigate('/dashboard') : navigate('/auth?tab=signup')}
                        className="text-white font-semibold text-lg px-8 shadow-xl hover:opacity-90" 
                        style={primaryButtonStyle}
                      >
                        {buyer ? (t('buyer.nav.dashboard') || 'Dashboard') : (heroCTA || t('buyer.hero.cta') || 'Get Started')} <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => navigate('/fast-order')}
                        className="font-semibold hover:bg-white/5" 
                        style={outlineButtonStyle}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        {t('buyer.fastOrder.title') || 'Fast Order'}
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Right Side - Floating Icons & Comparison */}
              <motion.div
                {...(enableAnimations ? { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6, delay: 0.2 } } : {})}
                className="relative hidden lg:block"
              >
                <div className="relative w-full h-[400px]">
                  {floatingIcons.map((item, idx) => (
                    <motion.div
                      key={idx}
                      {...(enableAnimations ? { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.5 + item.delay, type: 'spring' } } : {})}
                      className="absolute left-1/2 top-1/2 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm"
                      style={{ transform: `translate(${item.x}px, ${item.y}px)`, backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}
                    >
                      <item.icon className="w-7 h-7" style={{ color: item.color }} />
                    </motion.div>
                  ))}
                  
                  <motion.div
                    {...(enableAnimations ? { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.8 } } : {})}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-2xl backdrop-blur-xl"
                    style={{ backgroundColor: `${surfaceColor}cc`, border: `1px solid ${primary}26` }}
                  >
                    <h3 className="text-lg font-bold mb-4 text-center">{t('buyer.features.whyChooseUs') || 'Why Choose Us?'}</h3>
                    <div className="space-y-3">
                      {comparisonItems.map((item) => (
                        <div key={item.feature} className="flex items-center justify-between gap-8 text-sm">
                          <span style={{ color: mutedColor }}>{item.feature}</span>
                          <div className="flex items-center gap-4">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            {item.others ? <CheckCircle className="w-5 h-5 text-gray-500" /> : <X className="w-5 h-5 text-red-500" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {showStats && (
          <section id="stats" aria-label="Statistics" className="py-16" style={{ borderTop: `1px solid ${primary}1a`, borderBottom: `1px solid ${primary}1a` }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: t('buyer.stats.customers') || 'Happy Customers', value: stats?.totalUsers || '10K+' },
                  { label: t('buyer.stats.ordersCompleted') || 'Orders Completed', value: stats?.totalOrders || '50K+' },
                  { label: t('buyer.stats.services') || 'Services Available', value: stats?.servicesCount || '500+' },
                  { label: t('buyer.stats.countries') || 'Countries Served', value: '150+' },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold mb-2"
                      style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: headingWeight }}>
                      {stat.value}
                    </div>
                    <div className="text-sm" style={{ color: mutedColor }}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        {showFeatures && (
          <section id="features" aria-label="Features" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: headingWeight }}>
                  Why <span style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Choose Us</span>
                </h2>
                <p style={{ color: mutedColor }} className="max-w-xl mx-auto">
                  We provide the best social media marketing services at the most competitive prices.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featureCards.map((feature, idx) => {
                  const IconComponent = getLucideIcon(feature.icon);
                  const featureGradient = `linear-gradient(to right, ${idx % 2 === 0 ? primary : secondary}, ${idx % 2 === 0 ? secondary : accent})`;
                  return (
                    <motion.div
                      key={feature.title}
                      {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 }, whileHover: { y: -5, scale: hoverScale } } : {})}
                      className="p-6 rounded-2xl transition-all"
                      style={{ backgroundColor: surfaceColor, border: `1px solid ${primary}1a` }}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: featureGradient }}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm" style={{ color: mutedColor }}>{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {showTestimonials && testimonials.length > 0 && (
          <section id="testimonials" aria-label="Customer Reviews" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: headingWeight }}>
                  {t('buyer.testimonials.whatOur') || 'What Our'} <span style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('buyer.testimonials.customers') || 'Customers'}</span> {t('buyer.testimonials.say') || 'Say'}
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, idx) => (
                  <motion.div
                    key={testimonial.name}
                    {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                    className="p-6 rounded-2xl"
                    style={{ backgroundColor: bgColor, border: `1px solid ${primary}1a` }}
                  >
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" style={{ color: accent }} />
                      ))}
                    </div>
                    <p className="mb-4" style={{ color: mutedColor }}>"{testimonial.text}"</p>
                    <div className="font-semibold">{testimonial.name}</div>
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
                <h2 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: headingWeight }}>
                  {t('buyer.faq.frequently') || 'Frequently'} <span style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('buyer.faq.asked') || 'Asked'}</span> {t('buyer.faq.questions') || 'Questions'}
                </h2>
              </motion.div>

              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`} className="rounded-2xl px-6" style={{ backgroundColor: surfaceColor, border: `1px solid ${primary}1a` }}>
                      <AccordionTrigger className="text-left font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
                      <AccordionContent style={{ color: mutedColor }}>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section id="cta" aria-label="Call to Action" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          <div className="mx-auto px-4" style={{ maxWidth: 900 }}>
            <motion.div
              {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})}
              className="text-center p-12 rounded-3xl"
              style={{ background: `linear-gradient(135deg, ${surfaceColor}, ${bgColor})`, border: `1px solid ${primary}26` }}
            >
              <h2 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: headingWeight }}>
                {t('buyer.cta.readyTo') || 'Ready to'} <span style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('buyer.cta.grow') || 'Grow'}</span>?
              </h2>
              <p className="mb-8 max-w-xl mx-auto" style={{ color: mutedColor }}>
                {t('buyer.cta.subtitle') || 'Join thousands of satisfied customers and start growing your social media today.'}
              </p>
              {enableFastOrder ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/fast-order')}
                  className="text-white font-semibold text-lg px-10 shadow-xl hover:opacity-90" 
                  style={primaryButtonStyle}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {t('buyer.cta.fastOrder') || 'Fast Order Now'}
                </Button>
              ) : (
                <Button size="lg" asChild className="text-white font-semibold text-lg px-10 shadow-xl hover:opacity-90" style={primaryButtonStyle}>
                  <Link to="/auth?tab=signup">{t('buyer.cta.getStarted') || 'Get Started Now'} <ArrowRight className="w-5 h-5 ml-2" /></Link>
                </Button>
              )}
            </motion.div>
          </div>
        </section>
      </article>

      {/* Enhanced Footer */}
      {(customization.enableFooter !== false) && (
        <footer className="py-16" style={{ 
          backgroundColor: isLightMode ? '#F8FAFC' : surfaceColor,
          borderTop: `1px solid ${primary}1a` 
        }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {/* Brand Column */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  {displayLogo ? (
                    <img src={displayLogo} alt={companyName} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="font-bold text-lg">{companyName}</span>
                </div>
                <p className="text-sm mb-4" style={{ color: mutedColor }}>
                  {customization.footerAbout || 'Professional SMM services with instant delivery and 24/7 support.'}
                </p>
                {/* Social Links */}
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
                <h4 className="font-semibold mb-4">{t('buyer.footer.services') || 'Services'}</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/services" className="hover:opacity-80 transition-opacity">{t('buyer.footer.allServices') || 'All Services'}</Link></li>
                  <li><Link to="/services?platform=instagram" className="hover:opacity-80 transition-opacity">Instagram</Link></li>
                  <li><Link to="/services?platform=youtube" className="hover:opacity-80 transition-opacity">YouTube</Link></li>
                  <li><Link to="/services?platform=tiktok" className="hover:opacity-80 transition-opacity">TikTok</Link></li>
                </ul>
              </div>
              
              {/* Company Column */}
              <div>
                <h4 className="font-semibold mb-4">{t('buyer.footer.company') || 'Company'}</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/about" className="hover:opacity-80 transition-opacity">{t('buyer.footer.aboutUs') || 'About Us'}</Link></li>
                  <li><Link to="/contact" className="hover:opacity-80 transition-opacity">{t('buyer.footer.contact') || 'Contact'}</Link></li>
                  {showBlogInMenu && <li><Link to="/blog" className="hover:opacity-80 transition-opacity">{t('buyer.footer.blog') || 'Blog'}</Link></li>}
                </ul>
              </div>
              
              {/* Support Column */}
              <div>
                <h4 className="font-semibold mb-4">{t('buyer.footer.support') || 'Support'}</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><a href="#faq" className="hover:opacity-80 transition-opacity">{t('buyer.footer.faq') || 'FAQ'}</a></li>
                  <li><Link to="/terms" className="hover:opacity-80 transition-opacity">{t('buyer.footer.terms') || 'Terms'}</Link></li>
                  <li><Link to="/privacy" className="hover:opacity-80 transition-opacity">{t('buyer.footer.privacy') || 'Privacy'}</Link></li>
                </ul>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="pt-8 text-center text-sm" style={{ borderTop: `1px solid ${primary}1a`, color: mutedColor }}>
              {customization.footerText 
                ? customization.footerText.replace(/\{companyName\}/g, companyName)
                : `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
            </div>
          </div>
        </footer>
      )}
    </main>
  );
};

export default AliPanelHomepage;