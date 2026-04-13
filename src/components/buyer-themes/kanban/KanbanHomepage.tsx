import { useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Shield, Users, Star, ArrowRight, CheckCircle,
  Instagram, Youtube, Twitter, Music, LayoutDashboard,
  Columns, KanbanSquare, ListChecks, BarChart3, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BuyerAuthContext } from '@/contexts/BuyerAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ThemeCustomization } from '@/types/theme-customization';
import { 
  getButtonStyles, getHoverScale, getLucideIcon,
  getDefaultTestimonials, getDefaultFAQs,
  getSocialLinks, getModeColors, getSocialIconMap
} from '@/lib/theme-utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ThemeNavigation } from '../shared/ThemeNavigation';
import { AnimatedHeroText, getThemeDefaultAnimationStyle, getAnimatedWordFromTitle } from '../shared/AnimatedHeroText';
import { useLanguage } from '@/contexts/LanguageContext';

interface KanbanHomepageProps {
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

export const KanbanHomepage = ({ 
  panelName = 'SMM Panel', 
  services = [], 
  stats,
  customization = {},
  logoUrl 
}: KanbanHomepageProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const buyerAuthContext = useContext(BuyerAuthContext);
  const buyer = buyerAuthContext?.buyer || null;
  
  const themeMode = customization.themeMode || 'dark';
  const isLightMode = themeMode === 'light';
  
  const defaultPrimary = '#3B82F6';
  const defaultSecondary = '#06B6D4';
  const defaultAccent = '#8B5CF6';
  
  const themeDefaults = {
    lightBg: '#F8FAFC',
    darkBg: '#0B1120',
    lightSurface: '#FFFFFF',
    darkSurface: '#131C2E',
    lightText: '#0F172A',
    darkText: '#F1F5F9',
    lightMuted: '#64748B',
    darkMuted: '#94A3B8',
    lightBorder: '#E2E8F0',
    darkBorder: '#1E293B',
  };

  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  const accent = customization.accentColor || defaultAccent;
  
  const modeColors = getModeColors(customization, isLightMode, themeDefaults);
  const { backgroundColor: bgColor, surfaceColor, textColor: textCol, mutedColor } = modeColors;

  const fontFamily = customization.fontFamily || 'Inter';
  const headingFont = customization.headingFont || fontFamily;
  const headingWeight = customization.headingWeight || '700';

  const heroTitle = customization.heroTitle || t('buyer.hero.title');
  const heroSubtitle = customization.heroSubtitle || t('buyer.hero.subtitle');
  const heroBadge = customization.heroBadgeText || t('buyer.hero.badge');
  const heroCTA = customization.heroCTAText || t('buyer.hero.cta');
  const displayLogo = customization.logoUrl || logoUrl;
  const companyName = customization.companyName || panelName;

  const showBlogInMenu = customization.showBlogInMenu ?? false;
  const enableFastOrder = customization.enableFastOrder === true;

  const showStats = customization.enableStats !== false;
  const showFeatures = customization.enableFeatures !== false;
  const showTestimonials = customization.enableTestimonials !== false;
  const showFAQs = customization.enableFAQs !== false;

  const featureCards = customization.featureCards || [
    { title: t('buyer.features.instantStart'), description: t('buyer.features.instantStartDesc'), icon: 'Zap' },
    { title: t('buyer.features.highQuality'), description: t('buyer.features.highQualityDesc'), icon: 'Award' },
    { title: t('buyer.features.bestPrices'), description: t('buyer.features.bestPricesDesc'), icon: 'TrendingUp' },
    { title: t('buyer.features.support'), description: t('buyer.features.supportDesc'), icon: 'Users' },
  ];
  const testimonials = customization.testimonials || getDefaultTestimonials();
  const faqs = customization.faqs || getDefaultFAQs();

  const hoverScale = getHoverScale(customization);
  const enableAnimations = customization.enableAnimations !== false;

  const primaryButtonStyle = getButtonStyles(customization, 'primary');
  const outlineButtonStyle = getButtonStyles(customization, 'outline');

  const sectionPadding = customization.sectionPaddingY || 80;
  const containerMax = customization.containerMaxWidth || 1280;

  const handleThemeModeChange = useCallback((mode: 'light' | 'dark') => {
  }, []);

  const kanbanColumns = [
    {
      title: t('buyer.platforms.followers') || 'Followers',
      icon: Users,
      color: primary,
      items: [
        { platform: 'Instagram', icon: Instagram, count: '1K - 100K' },
        { platform: 'TikTok', icon: Music, count: '500 - 50K' },
        { platform: 'YouTube', icon: Youtube, count: '100 - 10K' },
      ]
    },
    {
      title: t('buyer.platforms.likes') || 'Likes',
      icon: Star,
      color: secondary,
      items: [
        { platform: 'Instagram', icon: Instagram, count: '100 - 50K' },
        { platform: 'Twitter', icon: Twitter, count: '100 - 25K' },
        { platform: 'YouTube', icon: Youtube, count: '50 - 10K' },
      ]
    },
    {
      title: t('buyer.platforms.views') || 'Views',
      icon: BarChart3,
      color: accent,
      items: [
        { platform: 'YouTube', icon: Youtube, count: '1K - 1M' },
        { platform: 'TikTok', icon: Music, count: '1K - 500K' },
        { platform: 'Instagram', icon: Instagram, count: '500 - 100K' },
      ]
    },
  ];

  const workflowSteps = [
    { icon: ListChecks, label: t('buyer.howItWorks.step1') || 'Choose Service', description: t('buyer.howItWorks.step1Desc') || 'Browse our catalog of services' },
    { icon: KanbanSquare, label: t('buyer.howItWorks.step2') || 'Place Order', description: t('buyer.howItWorks.step2Desc') || 'Enter your details and submit' },
    { icon: Clock, label: t('buyer.howItWorks.step3') || 'Track Progress', description: t('buyer.howItWorks.step3Desc') || 'Watch your order in real-time' },
    { icon: CheckCircle, label: t('buyer.howItWorks.step4') || 'Get Results', description: t('buyer.howItWorks.step4Desc') || 'Enjoy instant delivery' },
  ];

  return (
    <main role="main" className={`min-h-screen overflow-hidden ${themeMode}`} style={{ backgroundColor: bgColor, color: textCol, fontFamily }}>
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

      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: `${primary}15` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: `${secondary}10` }} />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: `${accent}08` }} />
      </div>

      <ThemeNavigation
        companyName={companyName}
        logoUrl={displayLogo}
        logoIcon={
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
        }
        defaultIcon={
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
            <LayoutDashboard className="w-5 h-5 text-white" />
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
        primaryButtonStyle={primaryButtonStyle}
        signupLabel={t('buyer.nav.getStarted') || 'Get Started'}
      />

      <article>
        <section id="hero" aria-label="Hero Section" className="relative overflow-hidden" style={{ paddingTop: sectionPadding + 20, paddingBottom: sectionPadding }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } } : {})}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                  style={{ background: `${primary}15`, border: `1px solid ${primary}25` }}>
                  <Columns className="w-4 h-4" style={{ color: primary }} />
                  <span className="text-sm" style={{ color: primary }}>{heroBadge}</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight" style={{ fontWeight: headingWeight, fontFamily: headingFont }}>
                  {(() => {
                    const position = customization.heroAnimatedTextPosition || 'last';
                    const { before, animatedWord, after } = getAnimatedWordFromTitle(heroTitle, position);
                    const effectiveAnimStyle = customization.heroAnimatedTextStyle || getThemeDefaultAnimationStyle('kanban');
                    return (
                      <>
                        {before && <span>{before}{' '}</span>}
                        <AnimatedHeroText 
                          text={animatedWord}
                          animationStyle={effectiveAnimStyle}
                          primaryColor={primary}
                          secondaryColor={secondary}
                          enableAnimations={enableAnimations}
                        />
                        {after && <span>{' '}{after}</span>}
                      </>
                    );
                  })()}
                </h1>

                <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: mutedColor }}>{heroSubtitle}</p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {enableFastOrder ? (
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
            </div>

            {customization.enableHeroImage && customization.heroImageUrl ? (
              <motion.div
                {...(enableAnimations ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.3 } } : {})}
                className="relative max-w-4xl mx-auto"
              >
                <img 
                  src={customization.heroImageUrl} 
                  alt="Hero" 
                  className="w-full max-h-[400px] lg:max-h-[500px] object-contain rounded-2xl"
                  loading="eager"
                />
              </motion.div>
            ) : (
              <motion.div
                {...(enableAnimations ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.3 } } : {})}
                className="relative max-w-5xl mx-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {kanbanColumns.map((column, colIdx) => (
                    <motion.div
                      key={column.title}
                      {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 + colIdx * 0.15 } } : {})}
                      className="rounded-2xl p-4"
                      style={{ backgroundColor: `${surfaceColor}`, border: `1px solid ${column.color}20` }}
                    >
                      <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
                        <span className="font-semibold text-sm">{column.title}</span>
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${column.color}15`, color: column.color }}>{column.items.length}</span>
                      </div>
                      <div className="space-y-3">
                        {column.items.map((item, itemIdx) => (
                          <motion.div
                            key={item.platform}
                            {...(enableAnimations ? { whileHover: { scale: 1.02, y: -2 } } : {})}
                            className="p-3 rounded-xl cursor-pointer transition-all"
                            style={{ 
                              backgroundColor: isLightMode ? '#FFFFFF' : `${bgColor}`,
                              border: `1px solid ${column.color}15`,
                              boxShadow: `0 2px 8px ${column.color}08`
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${column.color}15` }}>
                                <item.icon className="w-4 h-4" style={{ color: column.color }} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.platform}</p>
                                <p className="text-xs" style={{ color: mutedColor }}>{item.count}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {showStats && (
          <section id="stats" aria-label="Statistics" className="py-16" style={{ borderTop: `1px solid ${primary}10`, borderBottom: `1px solid ${primary}10` }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: t('buyer.stats.customers') || 'Happy Customers', value: stats?.totalUsers || '10K+', icon: Users },
                  { label: t('buyer.stats.ordersCompleted') || 'Orders Completed', value: stats?.totalOrders || '50K+', icon: CheckCircle },
                  { label: t('buyer.stats.services') || 'Services Available', value: stats?.servicesCount || '500+', icon: Columns },
                  { label: t('buyer.stats.countries') || 'Countries Served', value: '150+', icon: Shield },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                    className="text-center p-4 rounded-xl"
                    style={{ backgroundColor: `${surfaceColor}80` }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${primary}15` }}>
                      <stat.icon className="w-5 h-5" style={{ color: primary }} />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold mb-1" style={{ fontWeight: headingWeight }}>
                      {stat.value}
                    </div>
                    <div className="text-xs" style={{ color: mutedColor }}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="workflow" aria-label="How It Works" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: headingWeight }}>
                {t('buyer.howItWorks.title') || 'How It'}{' '}
                <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {t('buyer.howItWorks.highlight') || 'Works'}
                </span>
              </h2>
              <p style={{ color: mutedColor }} className="max-w-xl mx-auto">
                {t('buyer.howItWorks.subtitle') || 'A simple workflow to boost your social media presence'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5" style={{ background: `linear-gradient(to right, ${primary}40, ${secondary}40, ${accent}40)` }} />
              {workflowSteps.map((step, idx) => (
                <motion.div
                  key={step.label}
                  {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.15 } } : {})}
                  className="text-center relative"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 relative z-10"
                    style={{ background: `linear-gradient(135deg, ${idx === 0 ? primary : idx === 1 ? secondary : idx === 2 ? accent : primary}, ${idx === 0 ? secondary : idx === 1 ? accent : idx === 2 ? primary : secondary})` }}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{step.label}</h3>
                  <p className="text-sm" style={{ color: mutedColor }}>{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {showFeatures && (
          <section id="features" aria-label="Features" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: `${surfaceColor}60` }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: headingWeight }}>
                  {t('buyer.features.whyChooseUs') || 'Why'}{' '}
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('buyer.features.chooseUsHighlight') || 'Choose Us'}
                  </span>
                </h2>
                <p style={{ color: mutedColor }} className="max-w-xl mx-auto">
                  {t('buyer.features.subtitle') || 'We provide the best social media marketing services at competitive prices.'}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {featureCards.map((feature, idx) => {
                  const IconComponent = getLucideIcon(feature.icon);
                  return (
                    <motion.div
                      key={feature.title}
                      {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 }, whileHover: { y: -4, scale: hoverScale } } : {})}
                      className="p-5 rounded-xl transition-all"
                      style={{ 
                        backgroundColor: isLightMode ? '#FFFFFF' : surfaceColor, 
                        border: `1px solid ${primary}12`,
                        boxShadow: `0 4px 20px ${primary}06`
                      }}
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${primary}12` }}>
                        <IconComponent className="w-5 h-5" style={{ color: primary }} />
                      </div>
                      <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: mutedColor }}>{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {showTestimonials && testimonials.length > 0 && (
          <section id="testimonials" aria-label="Customer Reviews" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: headingWeight }}>
                  {t('buyer.testimonials.whatOur') || 'What Our'}{' '}
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('buyer.testimonials.customers') || 'Customers'}
                  </span>{' '}
                  {t('buyer.testimonials.say') || 'Say'}
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-5">
                {testimonials.map((testimonial, idx) => (
                  <motion.div
                    key={testimonial.name}
                    {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                    className="p-5 rounded-xl"
                    style={{ 
                      backgroundColor: isLightMode ? '#FFFFFF' : surfaceColor,
                      border: `1px solid ${primary}10` 
                    }}
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#FBBF24' }} />
                      ))}
                    </div>
                    <p className="text-sm mb-4 leading-relaxed" style={{ color: mutedColor }}>"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                        {testimonial.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{testimonial.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {showFAQs && faqs.length > 0 && (
          <section id="faqs" aria-label="FAQ" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: `${surfaceColor}40` }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl mb-4" style={{ fontWeight: headingWeight }}>
                  {t('buyer.faq.title') || 'Frequently Asked'}{' '}
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('buyer.faq.highlight') || 'Questions'}
                  </span>
                </h2>
              </motion.div>

              <div className="max-w-2xl mx-auto">
                <Accordion type="single" collapsible className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <AccordionItem 
                      key={idx} 
                      value={`faq-${idx}`}
                      className="rounded-xl px-5 border-0"
                      style={{ 
                        backgroundColor: isLightMode ? '#FFFFFF' : surfaceColor,
                        border: `1px solid ${primary}10`
                      }}
                    >
                      <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm pb-4" style={{ color: mutedColor }}>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <motion.div
              {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})}
              className="text-center p-10 rounded-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${primary}15, ${secondary}10)`,
                border: `1px solid ${primary}20`
              }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t('buyer.cta.readyToStart') || 'Ready to Get Started?'}
              </h2>
              <p className="mb-6 max-w-lg mx-auto" style={{ color: mutedColor }}>
                {t('buyer.cta.subtitle') || 'Join thousands of satisfied customers and boost your social media today.'}
              </p>
              <Button 
                size="lg" 
                onClick={() => buyer ? navigate('/dashboard') : navigate('/auth?tab=signup')}
                className="text-white font-semibold px-8 shadow-xl hover:opacity-90" 
                style={primaryButtonStyle}
              >
                {buyer ? (t('buyer.nav.dashboard') || 'Dashboard') : (t('buyer.hero.cta') || 'Get Started')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      </article>

      {(customization.enableFooter !== false) && (
        <footer className="py-12" style={{ 
          backgroundColor: isLightMode ? '#F1F5F9' : surfaceColor,
          borderTop: `1px solid ${primary}15` 
        }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  {displayLogo ? (
                    <img src={displayLogo} alt={companyName} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                      <LayoutDashboard className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="font-bold text-lg">{companyName}</span>
                </div>
                <p className="text-sm mb-4" style={{ color: mutedColor }}>
                  {customization.footerAbout || 'Professional SMM services with instant delivery and 24/7 support.'}
                </p>
                {(() => {
                  const socialLinks = getSocialLinks(customization.socialLinks);
                  const iconMap = getSocialIconMap();
                  return socialLinks.length > 0 && (
                    <div className="flex gap-3">
                      {socialLinks.map(link => {
                        const Icon = iconMap[link.id] || LayoutDashboard;
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
              
              <div>
                <h4 className="font-semibold mb-4 text-sm">{t('buyer.footer.services') || 'Services'}</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/services" className="hover:opacity-80 transition-opacity">{t('buyer.footer.allServices') || 'All Services'}</Link></li>
                  <li><Link to="/services?platform=instagram" className="hover:opacity-80 transition-opacity">Instagram</Link></li>
                  <li><Link to="/services?platform=youtube" className="hover:opacity-80 transition-opacity">YouTube</Link></li>
                  <li><Link to="/services?platform=tiktok" className="hover:opacity-80 transition-opacity">TikTok</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-sm">{t('buyer.footer.company') || 'Company'}</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/about" className="hover:opacity-80 transition-opacity">{t('buyer.footer.aboutUs') || 'About Us'}</Link></li>
                  <li><Link to="/contact" className="hover:opacity-80 transition-opacity">{t('buyer.footer.contact') || 'Contact'}</Link></li>
                  {showBlogInMenu && <li><Link to="/blog" className="hover:opacity-80 transition-opacity">{t('buyer.footer.blog') || 'Blog'}</Link></li>}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-sm">{t('buyer.footer.support') || 'Support'}</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><a href="#faq" className="hover:opacity-80 transition-opacity">{t('buyer.footer.faq') || 'FAQ'}</a></li>
                  <li><Link to="/terms" className="hover:opacity-80 transition-opacity">{t('buyer.footer.terms') || 'Terms'}</Link></li>
                  <li><Link to="/privacy" className="hover:opacity-80 transition-opacity">{t('buyer.footer.privacy') || 'Privacy'}</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-6 text-center text-sm" style={{ borderTop: `1px solid ${primary}12`, color: mutedColor }}>
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
