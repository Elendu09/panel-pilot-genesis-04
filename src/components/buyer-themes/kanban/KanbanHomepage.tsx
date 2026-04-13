import { useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Shield, Users, Star, ArrowRight, CheckCircle,
  Instagram, Youtube, Twitter, Music, LayoutDashboard,
  Columns, KanbanSquare, ListChecks, BarChart3, Clock,
  Sparkles, TrendingUp
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
  
  const defaultPrimary = '#6366F1';
  const defaultSecondary = '#06B6D4';
  const defaultAccent = '#8B5CF6';
  
  const themeDefaults = {
    lightBg: '#F8FAFC',
    darkBg: '#060B18',
    lightSurface: '#FFFFFF',
    darkSurface: '#0D1526',
    lightText: '#0F172A',
    darkText: '#F1F5F9',
    lightMuted: '#64748B',
    darkMuted: '#94A3B8',
    lightBorder: '#E2E8F0',
    darkBorder: '#1E2D45',
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

  const handleThemeModeChange = useCallback((mode: 'light' | 'dark') => {}, []);

  const glassStyle = {
    background: isLightMode 
      ? 'rgba(255,255,255,0.7)' 
      : 'rgba(13,21,38,0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${isLightMode ? 'rgba(255,255,255,0.9)' : `rgba(255,255,255,0.06)`}`,
  };

  const glassCardStyle = {
    background: isLightMode
      ? 'rgba(255,255,255,0.75)'
      : `rgba(13,21,38,0.55)`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.07)'}`,
    boxShadow: isLightMode
      ? `0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)`
      : `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`,
  };

  const kanbanColumns = [
    {
      title: t('buyer.platforms.followers') || 'Followers',
      icon: Users,
      color: primary,
      items: [
        { platform: 'Instagram', icon: Instagram, count: '1K – 100K' },
        { platform: 'TikTok', icon: Music, count: '500 – 50K' },
        { platform: 'YouTube', icon: Youtube, count: '100 – 10K' },
      ]
    },
    {
      title: t('buyer.platforms.likes') || 'Likes',
      icon: Star,
      color: secondary,
      items: [
        { platform: 'Instagram', icon: Instagram, count: '100 – 50K' },
        { platform: 'Twitter', icon: Twitter, count: '100 – 25K' },
        { platform: 'YouTube', icon: Youtube, count: '50 – 10K' },
      ]
    },
    {
      title: t('buyer.platforms.views') || 'Views',
      icon: BarChart3,
      color: accent,
      items: [
        { platform: 'YouTube', icon: Youtube, count: '1K – 1M' },
        { platform: 'TikTok', icon: Music, count: '1K – 500K' },
        { platform: 'Instagram', icon: Instagram, count: '500 – 100K' },
      ]
    },
  ];

  const workflowSteps = [
    { icon: ListChecks, label: t('buyer.howItWorks.step1') || 'Choose Service', description: t('buyer.howItWorks.step1Desc') || 'Browse our catalog of services', color: primary },
    { icon: KanbanSquare, label: t('buyer.howItWorks.step2') || 'Place Order', description: t('buyer.howItWorks.step2Desc') || 'Enter your details and submit', color: secondary },
    { icon: Clock, label: t('buyer.howItWorks.step3') || 'Track Progress', description: t('buyer.howItWorks.step3Desc') || 'Watch your order in real-time', color: accent },
    { icon: CheckCircle, label: t('buyer.howItWorks.step4') || 'Get Results', description: t('buyer.howItWorks.step4Desc') || 'Enjoy instant delivery', color: primary },
  ];

  const fadeUp = enableAnimations ? { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55 } } : {};
  const fadeUpView = (delay = 0) => enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.5 } } : {};

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
                acceptedAnswer: { '@type': 'Answer', text: faq.answer }
              }))
            })}
          </script>
        </Helmet>
      )}

      {/* Ambient glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] animate-pulse" style={{ background: `${primary}18` }} />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: `${secondary}12` }} />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full blur-[120px] animate-pulse" style={{ background: `${accent}0C`, animationDelay: '1s' }} />
        <div className="absolute top-2/3 right-1/3 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: `${primary}0A` }} />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(circle, ${isLightMode ? '#0F172A' : '#FFFFFF'} 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <ThemeNavigation
        companyName={companyName}
        logoUrl={displayLogo}
        logoIcon={
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, boxShadow: `0 4px 14px ${primary}40` }}>
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        }
        defaultIcon={
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, boxShadow: `0 4px 14px ${primary}40` }}>
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        }
        showBlogInMenu={showBlogInMenu}
        themeMode={themeMode}
        onThemeModeChange={handleThemeModeChange}
        containerMax={containerMax}
        mutedColor={mutedColor}
        primaryColor={primary}
        textColor={textCol}
        surfaceColor={isLightMode ? 'rgba(255,255,255,0.85)' : 'rgba(13,21,38,0.85)'}
        bgColor={bgColor}
        primaryButtonStyle={primaryButtonStyle}
        signupLabel={t('buyer.nav.getStarted') || 'Get Started'}
      />

      <article>
        {/* ── Hero ── */}
        <section id="hero" aria-label="Hero Section" className="relative overflow-hidden" style={{ paddingTop: sectionPadding + 32, paddingBottom: sectionPadding }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div {...fadeUp}>
                {/* Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 text-sm font-medium"
                  style={{ ...glassStyle, color: primary, borderColor: `${primary}30` }}
                  {...(enableAnimations ? { whileHover: { scale: 1.04 } } : {})}
                >
                  <Sparkles className="w-4 h-4" style={{ color: primary }} />
                  {heroBadge}
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
                </motion.div>

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

                <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: mutedColor }}>{heroSubtitle}</p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {enableFastOrder ? (
                    <>
                      <motion.div {...(enableAnimations ? { whileHover: { scale: 1.04, y: -2 } } : {})}>
                        <Button size="lg" onClick={() => navigate('/fast-order')} className="font-semibold text-lg px-8 shadow-2xl hover:opacity-90 transition-all" style={primaryButtonStyle}>
                          <Zap className="w-5 h-5 mr-2" />
                          {t('buyer.fastOrder.title') || 'Fast Order'}
                        </Button>
                      </motion.div>
                      <motion.div {...(enableAnimations ? { whileHover: { scale: 1.04, y: -2 } } : {})}>
                        <Button size="lg" variant="outline" asChild className="font-semibold transition-all hover:bg-white/5" style={outlineButtonStyle}>
                          <Link to="/services">{t('buyer.services.viewAll') || 'View Services'}</Link>
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div {...(enableAnimations ? { whileHover: { scale: 1.04, y: -2 } } : {})}>
                        <Button size="lg" onClick={() => buyer ? navigate('/dashboard') : navigate('/auth?tab=signup')} className="font-semibold text-lg px-8 shadow-2xl hover:opacity-90 transition-all" style={primaryButtonStyle}>
                          {buyer ? (t('buyer.nav.dashboard') || 'Dashboard') : (heroCTA || t('buyer.hero.cta') || 'Get Started')} <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </motion.div>
                      <motion.div {...(enableAnimations ? { whileHover: { scale: 1.04, y: -2 } } : {})}>
                        <Button size="lg" variant="outline" onClick={() => navigate('/fast-order')} className="font-semibold transition-all hover:bg-white/5" style={outlineButtonStyle}>
                          <Zap className="w-5 h-5 mr-2" />
                          {t('buyer.fastOrder.title') || 'Fast Order'}
                        </Button>
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Kanban Board Preview */}
            {customization.enableHeroImage && customization.heroImageUrl ? (
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.3 } } : {})} className="relative max-w-4xl mx-auto">
                <img src={customization.heroImageUrl} alt="Hero" className="w-full max-h-[500px] object-contain rounded-2xl" loading="eager" />
              </motion.div>
            ) : (
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: 0.25 } } : {})} className="relative max-w-5xl mx-auto">
                {/* Board header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 h-6 rounded-md ml-2 flex items-center px-3" style={{ ...glassStyle }}>
                    <span className="text-xs" style={{ color: mutedColor }}>SMM Board — Active Services</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {kanbanColumns.map((column, colIdx) => (
                    <motion.div
                      key={column.title}
                      {...(enableAnimations ? { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.35 + colIdx * 0.15, duration: 0.5 } } : {})}
                      className="rounded-2xl p-4"
                      style={glassCardStyle}
                    >
                      {/* Column header */}
                      <div className="flex items-center gap-2 mb-4 px-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color, boxShadow: `0 0 6px ${column.color}80` }} />
                        <span className="font-semibold text-sm">{column.title}</span>
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${column.color}18`, color: column.color, border: `1px solid ${column.color}25` }}>{column.items.length}</span>
                      </div>

                      <div className="space-y-2.5">
                        {column.items.map((item, itemIdx) => (
                          <motion.div
                            key={item.platform}
                            {...(enableAnimations ? { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.5 + colIdx * 0.15 + itemIdx * 0.07 }, whileHover: { scale: 1.03, x: 3, transition: { duration: 0.15 } } } : {})}
                            className="p-3 rounded-xl cursor-pointer group transition-all duration-200"
                            style={{ 
                              background: isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(6,11,24,0.5)',
                              border: `1px solid ${column.color}20`,
                              boxShadow: `0 2px 10px ${column.color}08`,
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors" style={{ backgroundColor: `${column.color}18` }}>
                                <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: column.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.platform}</p>
                                <p className="text-xs truncate" style={{ color: mutedColor }}>{item.count}</p>
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: column.color }} />
                            </div>
                          </motion.div>
                        ))}
                        {/* Add task placeholder */}
                        <div className="p-2.5 rounded-xl border border-dashed text-center cursor-pointer opacity-30 hover:opacity-60 transition-opacity text-xs" style={{ borderColor: `${column.color}40`, color: column.color }}>
                          + Add service
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* ── Stats ── */}
        {showStats && (
          <section id="stats" aria-label="Statistics" className="py-14">
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: t('buyer.stats.customers') || 'Happy Customers', value: stats?.totalUsers ? `${(stats.totalUsers / 1000).toFixed(0)}K+` : '10K+', icon: Users, color: primary },
                  { label: t('buyer.stats.ordersCompleted') || 'Orders Completed', value: stats?.totalOrders ? `${(stats.totalOrders / 1000).toFixed(0)}K+` : '50K+', icon: CheckCircle, color: secondary },
                  { label: t('buyer.stats.services') || 'Services Available', value: stats?.servicesCount ? `${stats.servicesCount}+` : '500+', icon: Columns, color: accent },
                  { label: t('buyer.stats.countries') || 'Countries Served', value: '150+', icon: Shield, color: primary },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    {...fadeUpView(idx * 0.1)}
                    className="text-center p-5 rounded-2xl transition-all"
                    style={glassCardStyle}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `linear-gradient(135deg, ${stat.color}22, ${stat.color}0A)`, border: `1px solid ${stat.color}20` }}>
                      <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold mb-1" style={{ fontWeight: headingWeight, color: stat.color }}>
                      {stat.value}
                    </div>
                    <div className="text-xs leading-tight" style={{ color: mutedColor }}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── How It Works ── */}
        <section id="workflow" aria-label="How It Works" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <motion.div {...fadeUpView()} className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl mb-4 leading-tight" style={{ fontWeight: headingWeight }}>
                {t('buyer.howItWorks.title') || 'How It'}{' '}
                <span className="relative inline-block">
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('buyer.howItWorks.highlight') || 'Works'}
                  </span>
                </span>
              </h2>
              <p className="max-w-xl mx-auto" style={{ color: mutedColor }}>
                {t('buyer.howItWorks.subtitle') || 'A simple workflow to boost your social media presence'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              <div className="hidden md:block absolute top-11 left-[13%] right-[13%] h-px" style={{ background: `linear-gradient(to right, ${primary}50, ${secondary}50, ${accent}50, ${primary}50)` }} />
              {workflowSteps.map((step, idx) => (
                <motion.div
                  key={step.label}
                  {...fadeUpView(idx * 0.12)}
                  className="text-center relative group"
                >
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10 transition-transform"
                    style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}99)`, boxShadow: `0 8px 24px ${step.color}30` }}
                    {...(enableAnimations ? { whileHover: { scale: 1.1, rotate: 5 } } : {})}
                  >
                    <step.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                    <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: step.color }}>{idx + 1}</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2">{step.label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: mutedColor }}>{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        {showFeatures && (
          <section id="features" aria-label="Features" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...fadeUpView()} className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl mb-4 leading-tight" style={{ fontWeight: headingWeight }}>
                  {t('buyer.features.whyChooseUs') || 'Why'}{' '}
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('buyer.features.chooseUsHighlight') || 'Choose Us'}
                  </span>
                </h2>
                <p className="max-w-xl mx-auto" style={{ color: mutedColor }}>
                  {t('buyer.features.subtitle') || 'We provide the best social media marketing services at competitive prices.'}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {featureCards.map((feature, idx) => {
                  const IconComponent = getLucideIcon(feature.icon);
                  const featureColors = [primary, secondary, accent, primary];
                  const fc = featureColors[idx % featureColors.length];
                  return (
                    <motion.div
                      key={feature.title}
                      {...fadeUpView(idx * 0.1)}
                      {...(enableAnimations ? { whileHover: { y: -6, scale: hoverScale } } : {})}
                      className="p-6 rounded-2xl transition-all duration-300 group cursor-default relative overflow-hidden"
                      style={glassCardStyle}
                    >
                      {/* Gradient accent top border */}
                      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-70" style={{ background: `linear-gradient(to right, transparent, ${fc}, transparent)` }} />
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${fc}22, ${fc}0A)`, border: `1px solid ${fc}25` }}>
                        <IconComponent className="w-5 h-5" style={{ color: fc }} />
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

        {/* ── Testimonials ── */}
        {showTestimonials && testimonials.length > 0 && (
          <section id="testimonials" aria-label="Customer Reviews" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...fadeUpView()} className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl mb-4 leading-tight" style={{ fontWeight: headingWeight }}>
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
                    {...fadeUpView(idx * 0.1)}
                    {...(enableAnimations ? { whileHover: { y: -4 } } : {})}
                    className="p-6 rounded-2xl relative overflow-hidden group transition-all duration-300"
                    style={glassCardStyle}
                  >
                    <div className="absolute inset-x-0 bottom-0 h-0.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ background: `linear-gradient(to right, transparent, ${primary}, transparent)` }} />
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#FBBF24' }} />
                      ))}
                    </div>
                    <p className="text-sm mb-5 leading-relaxed" style={{ color: mutedColor }}>"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-semibold block">{testimonial.name}</span>
                        {testimonial.role && <span className="text-xs" style={{ color: mutedColor }}>{testimonial.role}</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {showFAQs && faqs.length > 0 && (
          <section id="faqs" aria-label="FAQ" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...fadeUpView()} className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl mb-4 leading-tight" style={{ fontWeight: headingWeight }}>
                  {t('buyer.faq.title') || 'Frequently Asked'}{' '}
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('buyer.faq.highlight') || 'Questions'}
                  </span>
                </h2>
              </motion.div>

              <div className="max-w-2xl mx-auto">
                <Accordion type="single" collapsible className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <motion.div key={idx} {...fadeUpView(idx * 0.05)}>
                      <AccordionItem 
                        value={`faq-${idx}`}
                        className="rounded-xl px-5 border-0"
                        style={glassCardStyle}
                      >
                        <AccordionTrigger className="text-sm font-medium hover:no-underline py-4" style={{ color: textCol }}>
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm pb-4" style={{ color: mutedColor }}>
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="py-16">
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <motion.div
              {...fadeUpView()}
              className="text-center p-12 rounded-3xl relative overflow-hidden"
              style={{
                background: isLightMode
                  ? `linear-gradient(135deg, ${primary}12 0%, ${secondary}10 50%, ${accent}08 100%)`
                  : `linear-gradient(135deg, ${primary}18 0%, ${secondary}10 50%, ${accent}08 100%)`,
                border: `1px solid ${primary}25`,
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 rounded-full opacity-60" style={{ background: `linear-gradient(to right, transparent, ${primary}, ${secondary}, transparent)` }} />
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: headingFont, fontWeight: headingWeight }}>
                {t('buyer.cta.readyToStart') || 'Ready to Get Started?'}
              </h2>
              <p className="mb-8 max-w-lg mx-auto" style={{ color: mutedColor }}>
                {t('buyer.cta.subtitle') || 'Join thousands of satisfied customers and boost your social media today.'}
              </p>
              <motion.div {...(enableAnimations ? { whileHover: { scale: 1.05, y: -2 } } : {})}>
                <Button size="lg" onClick={() => buyer ? navigate('/dashboard') : navigate('/auth?tab=signup')} className="font-semibold px-10 shadow-2xl hover:opacity-90 transition-all" style={primaryButtonStyle}>
                  {buyer ? (t('buyer.nav.dashboard') || 'Dashboard') : (t('buyer.hero.cta') || 'Get Started')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </article>

      {/* ── Footer ── */}
      {(customization.enableFooter !== false) && (
        <footer className="py-14 relative" style={{ borderTop: `1px solid ${primary}15` }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: isLightMode ? 'rgba(248,250,252,0.9)' : 'rgba(6,11,24,0.8)', backdropFilter: 'blur(12px)' }} />
          <div className="relative mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {/* Brand col */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2.5 mb-5">
                  {displayLogo ? (
                    <img src={displayLogo} alt={companyName} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                      <LayoutDashboard className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="font-bold text-base" style={{ color: textCol }}>{companyName}</span>
                </div>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: mutedColor }}>
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
                          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-all hover:scale-110"
                            style={{ background: `${primary}15` }}>
                            <Icon className="w-4 h-4" style={{ color: primary }} />
                          </a>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-sm" style={{ color: textCol }}>{t('buyer.footer.services') || 'Services'}</h4>
                <ul className="space-y-2.5 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/services" className="hover:opacity-100 opacity-70 transition-opacity">{t('buyer.footer.allServices') || 'All Services'}</Link></li>
                  <li><Link to="/services?platform=instagram" className="hover:opacity-100 opacity-70 transition-opacity">Instagram</Link></li>
                  <li><Link to="/services?platform=youtube" className="hover:opacity-100 opacity-70 transition-opacity">YouTube</Link></li>
                  <li><Link to="/services?platform=tiktok" className="hover:opacity-100 opacity-70 transition-opacity">TikTok</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-sm" style={{ color: textCol }}>{t('buyer.footer.company') || 'Company'}</h4>
                <ul className="space-y-2.5 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/about" className="hover:opacity-100 opacity-70 transition-opacity">{t('buyer.footer.aboutUs') || 'About Us'}</Link></li>
                  <li><Link to="/contact" className="hover:opacity-100 opacity-70 transition-opacity">{t('buyer.footer.contact') || 'Contact'}</Link></li>
                  {showBlogInMenu && <li><Link to="/blog" className="hover:opacity-100 opacity-70 transition-opacity">{t('buyer.footer.blog') || 'Blog'}</Link></li>}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-sm" style={{ color: textCol }}>{t('buyer.footer.support') || 'Support'}</h4>
                <ul className="space-y-2.5 text-sm" style={{ color: mutedColor }}>
                  <li><a href="#faqs" className="hover:opacity-100 opacity-70 transition-opacity">{t('buyer.footer.faq') || 'FAQ'}</a></li>
                  <li><Link to="/terms" className="hover:opacity-100 opacity-70 transition-opacity">{t('buyer.footer.terms') || 'Terms'}</Link></li>
                  <li><Link to="/privacy" className="hover:opacity-100 opacity-70 transition-opacity">{t('buyer.footer.privacy') || 'Privacy'}</Link></li>
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
