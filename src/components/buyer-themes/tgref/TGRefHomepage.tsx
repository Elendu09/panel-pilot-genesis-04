import { useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, Zap, Shield, Users, Star, ArrowRight, CheckCircle, Globe, Cpu, Play,
  Instagram, Youtube, Twitter, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { BuyerAuthContext } from '@/contexts/BuyerAuthContext';
import { Helmet } from 'react-helmet-async';
import { ThemeCustomization } from '@/types/theme-customization';
import { 
  getAnimationVariants, getContainerVariants, getItemVariants,
  getButtonStyles, getHoverScale, getLucideIcon,
  getDefaultStats, getDefaultFeatures, getDefaultTestimonials, getDefaultFAQs,
  getModeColors, getSocialLinks, getSocialIconMap
} from '@/lib/theme-utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ThemeNavigation } from '../shared/ThemeNavigation';
import { AnimatedHeroText, getThemeDefaultAnimationStyle, getAnimatedWordFromTitle } from '../shared/AnimatedHeroText';
import { useLanguage } from '@/contexts/LanguageContext';

interface TGRefHomepageProps {
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

// TGRef Theme: Terminal/Tech aesthetic with monospace fonts, teal gradients
export const TGRefHomepage = ({ 
  panelName = 'SMM Panel', 
  services = [], 
  stats,
  customization = {},
  logoUrl 
}: TGRefHomepageProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Check if buyer is logged in for login-aware CTA
  const buyerAuthContext = useContext(BuyerAuthContext);
  const buyer = buyerAuthContext?.buyer || null;
  
  // Theme mode - reactive to customization prop (no local state)
  const themeMode = customization.themeMode || 'dark';
  const isLightMode = themeMode === 'light';
  
  // Theme defaults for TGRef (teal/cyan terminal aesthetic)
  const defaultPrimary = '#00D4AA';
  const defaultSecondary = '#0EA5E9';
  const defaultAccent = '#7C3AED';

  // TGRef theme color defaults
  const themeDefaults = {
    lightBg: '#F8FAFC',
    darkBg: '#1A1B26',
    lightSurface: '#FFFFFF',
    darkSurface: '#0D0E14',
    lightText: '#1F2937',
    darkText: '#FFFFFF',
    lightMuted: '#6B7280',
    darkMuted: '#9CA3AF',
    lightBorder: '#E5E7EB',
    darkBorder: '#2D2E3A',
  };

  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  const accent = customization.accentColor || defaultAccent;
  
  // Get mode-specific colors
  const modeColors = getModeColors(customization, isLightMode, themeDefaults);
  const { backgroundColor: bgColor, surfaceColor, textColor: textCol, mutedColor } = modeColors;

  // Typography - TGRef prefers monospace
  const fontFamily = customization.fontFamily || 'mono';
  const headingWeight = customization.headingWeight || '700';

  // Content - use translations for fallback text
  const heroTitle = customization.heroTitle || t('buyer.hero.title');
  const heroSubtitle = customization.heroSubtitle || t('buyer.hero.subtitle');
  const displayLogo = customization.logoUrl || logoUrl;
  const companyName = customization.companyName || panelName;

  // Blog toggle - use nullish coalescing to properly handle undefined/false values
  const showBlogInMenu = customization.showBlogInMenu ?? false;

  // Fast Order toggle - determines CTA buttons
  const enableFastOrder = customization.enableFastOrder !== false;

  // Section toggles
  const showStats = customization.enableStats !== false;
  const showFeatures = customization.enableFeatures !== false;
  const showPlatforms = customization.enablePlatformFeatures !== false;
  const showTestimonials = customization.enableTestimonials !== false;
  const showFAQs = customization.enableFAQs !== false;

  // Content arrays with translations
  const featureCards = customization.featureCards || [
    { title: t('buyer.features.instantStart'), description: t('buyer.features.instantStartDesc'), icon: 'Zap' },
    { title: t('buyer.features.bestPrices'), description: t('buyer.features.bestPricesDesc'), icon: 'Shield' },
    { title: t('buyer.features.support'), description: t('buyer.features.supportDesc'), icon: 'Users' },
    { title: t('buyer.features.highQuality'), description: t('buyer.features.highQualityDesc'), icon: 'CheckCircle' },
  ];
  const testimonials = customization.testimonials || getDefaultTestimonials();
  const faqs = customization.faqs || getDefaultFAQs();

  // Animation settings
  const enableAnimations = customization.enableAnimations !== false;
  const hoverScale = getHoverScale(customization);
  const containerVariants = getContainerVariants(customization);
  const itemVariants = getItemVariants(customization);

  // Spacing
  const sectionPadding = customization.sectionPaddingY || 80;
  const containerMax = customization.containerMaxWidth || 1280;

  // Button styles
  const primaryButtonStyle = {
    ...getButtonStyles(customization, 'primary'),
    color: isLightMode ? '#FFFFFF' : bgColor,
  };

  // Theme mode change handler (no-op since we read from customization prop)
  const handleThemeModeChange = useCallback((mode: 'light' | 'dark') => {
    // Theme mode is controlled by parent via customization.themeMode
  }, []);

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'Telegram', icon: MessageCircle, color: '#0088cc' },
  ];

  return (
    <main role="main" className={`min-h-screen font-mono ${themeMode}`} style={{ backgroundColor: bgColor, color: textCol }}>
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

      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${primary}1a 1px, transparent 1px), linear-gradient(90deg, ${primary}1a 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Navigation */}
      <ThemeNavigation
        companyName={companyName}
        logoUrl={displayLogo}
        logoIcon={
          <img 
            src="/default-panel-favicon.png" 
            alt={companyName} 
            className="w-8 h-8 rounded object-contain"
          />
        }
        defaultIcon={
          <img 
            src="/default-panel-favicon.png" 
            alt={companyName} 
            className="w-8 h-8 rounded object-contain"
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
        navStyle="terminal"
        primaryButtonStyle={primaryButtonStyle}
      />

      <article>
        {/* Hero Section */}
        <section id="hero" aria-label="Hero Section" className="relative overflow-hidden" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-[100px]" style={{ backgroundColor: `${primary}33` }} aria-hidden="true" />
          <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full blur-[80px]" style={{ backgroundColor: `${accent}33` }} aria-hidden="true" />
          
          <motion.div 
            className="mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
            style={{ maxWidth: containerMax }}
            {...(enableAnimations ? { variants: containerVariants, initial: "hidden", animate: "visible" } : {})}
          >
            <motion.div {...(enableAnimations ? { variants: itemVariants } : {})} className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                style={{ backgroundColor: `${primary}1a`, border: `1px solid ${primary}4d` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
                <span className="text-sm" style={{ color: primary }}>system.status: online</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span style={{ color: mutedColor }}>&gt; </span>
                {(() => {
                  const position = customization.heroAnimatedTextPosition || 'last';
                  const { before, animatedWord, after } = getAnimatedWordFromTitle(heroTitle, position);
                  const effectiveAnimStyle = customization.heroAnimatedTextStyle || getThemeDefaultAnimationStyle('tgref');
                  return (
                    <>
                      {before && (
                        <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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
                        <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          {' '}{after}
                        </span>
                      )}
                    </>
                  );
                })()}
                <span className="animate-pulse" style={{ color: primary }}>_</span>
              </h1>

              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: mutedColor }}>
                <span style={{ color: secondary }}>$</span> {heroSubtitle}
              </p>

              {/* Dynamic CTA based on enableFastOrder - Default: Get Started + Fast Order */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {enableFastOrder ? (
                  // When enableFastOrder is ON: Fast Order primary + View Services secondary
                  <>
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/fast-order')}
                      className="font-bold font-mono text-lg px-8 hover:opacity-90" 
                      style={primaryButtonStyle}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      ./fast-order --now
                    </Button>
                    <Button size="lg" variant="outline" asChild className="font-mono" style={{ borderColor: `${accent}80`, color: accent }}>
                      <Link to="/services" className="flex items-center gap-2">
                        <Terminal className="w-5 h-5" />
                        ./view-services
                      </Link>
                    </Button>
                  </>
                ) : (
                  // Default (enableFastOrder OFF): Get Started (login-aware) + Fast Order
                  <>
                    <Button 
                      size="lg" 
                      onClick={() => buyer ? navigate('/dashboard') : navigate('/auth?tab=signup')}
                      className="font-bold font-mono text-lg px-8 hover:opacity-90" 
                      style={primaryButtonStyle}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {buyer ? './dashboard' : './get-started'}
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={() => navigate('/fast-order')}
                      className="font-mono" 
                      style={{ borderColor: `${accent}80`, color: accent }}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      ./fast-order
                    </Button>
                  </>
                )}
              </div>
            </motion.div>

            {/* Code Block Preview */}
            <motion.div {...(enableAnimations ? { variants: itemVariants } : {})} className="mt-16 max-w-2xl mx-auto">
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: surfaceColor, border: `1px solid ${primary}33` }}>
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${primary}33` }}>
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-gray-500">order.sh</span>
                </div>
                <div className="p-4 font-mono text-sm">
                  <div className="text-gray-500"># Quick order example</div>
                  <div className="mt-2">
                    <span style={{ color: accent }}>$</span>
                    <span> smm order </span>
                    <span style={{ color: primary }}>--service</span>
                    <span className="text-yellow-400"> "Instagram Followers"</span>
                  </div>
                  <div>
                    <span style={{ color: accent }}>$</span>
                    <span> smm order </span>
                    <span style={{ color: primary }}>--quantity</span>
                    <span style={{ color: secondary }}> 1000</span>
                  </div>
                  <div className="mt-2 text-green-400">✓ Order placed successfully! ID: #SMM-28491</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        {showStats && (
          <section id="stats" aria-label="Statistics" className="py-16" style={{ borderTop: `1px solid ${primary}1a`, borderBottom: `1px solid ${primary}1a` }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: t('buyer.stats.ordersCompleted') || 'Orders Completed', value: stats?.totalOrders || '50K+', icon: CheckCircle },
                  { label: t('buyer.stats.activeUsers') || 'Active Users', value: stats?.totalUsers || '10K+', icon: Users },
                  { label: t('buyer.stats.services') || 'Services Available', value: stats?.servicesCount || '500+', icon: Cpu },
                  { label: t('buyer.stats.uptime') || 'Uptime', value: '99.9%', icon: Globe },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                    className="text-center"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4"
                      style={{ backgroundColor: `${primary}1a`, border: `1px solid ${primary}33` }}>
                      <stat.icon className="w-6 h-6" style={{ color: primary }} />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold font-mono mb-1">{stat.value}</div>
                    <div className="text-sm" style={{ color: mutedColor }}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Platforms Section */}
        {showPlatforms && (
          <section id="platforms" aria-label="Supported Platforms" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span style={{ color: mutedColor }}>[</span>
                  <span>{t('buyer.platforms.supported') || 'Supported Platforms'}</span>
                  <span style={{ color: mutedColor }}>]</span>
                </h2>
                <p style={{ color: mutedColor }}>{t('buyer.platforms.allMajor') || 'All major social networks in one place'}</p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platforms.map((platform, idx) => (
                  <motion.div
                    key={platform.name}
                    {...(enableAnimations ? { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, transition: { delay: idx * 0.1 }, whileHover: { scale: hoverScale, y: -5 } } : {})}
                    className="p-6 rounded-lg transition-all cursor-pointer group"
                    style={{ backgroundColor: surfaceColor, border: `1px solid ${primary}1a` }}
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${platform.color}20` }}>
                      <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
                    </div>
                    <h3 className="font-bold mb-1">{platform.name}</h3>
                    <p className="text-xs" style={{ color: mutedColor }}>50+ services</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features Section - Command Style */}
        {showFeatures && (
          <section id="features" aria-label="Features" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span style={{ color: primary }}>&gt;</span> {t('buyer.features.whyChooseUs') || 'Why Choose Us'}
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-4">
                {featureCards.map((feature, idx) => {
                  const IconComponent = getLucideIcon(feature.icon);
                  return (
                    <motion.div
                      key={feature.title}
                      {...(enableAnimations ? { initial: { opacity: 0, x: idx % 2 === 0 ? -20 : 20 }, whileInView: { opacity: 1, x: 0 }, transition: { delay: idx * 0.1 } } : {})}
                      className="p-6 rounded-lg transition-all group"
                      style={{ border: `1px solid ${primary}1a` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                          <IconComponent className="w-5 h-5" style={{ color: bgColor }} />
                        </div>
                        <div>
                          <h3 className="font-mono mb-1" style={{ color: primary }}>$ {feature.title}</h3>
                          <p className="text-sm" style={{ color: mutedColor }}>{feature.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {showTestimonials && testimonials.length > 0 && (
          <section id="testimonials" aria-label="Customer Reviews" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span style={{ color: mutedColor }}>[</span>{t('buyer.testimonials.userReviews') || 'User Reviews'}<span style={{ color: mutedColor }}>]</span>
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, idx) => (
                  <motion.div
                    key={testimonial.name}
                    {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                    className="p-6 rounded-lg font-mono"
                    style={{ backgroundColor: surfaceColor, border: `1px solid ${primary}1a` }}
                  >
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" style={{ color: primary }} />
                      ))}
                    </div>
                    <p className="text-sm mb-4" style={{ color: mutedColor }}>
                      <span style={{ color: secondary }}>$</span> echo "{testimonial.text}"
                    </p>
                    <div className="font-bold" style={{ color: primary }}>@{testimonial.name.toLowerCase().replace(' ', '_')}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {showFAQs && faqs.length > 0 && (
          <section id="faq" aria-label="Frequently Asked Questions" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span style={{ color: primary }}>&gt;</span> FAQ
                </h2>
              </motion.div>

              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`} className="rounded-lg px-6 font-mono" style={{ backgroundColor: bgColor, border: `1px solid ${primary}1a` }}>
                      <AccordionTrigger className="text-left hover:no-underline" style={{ color: primary }}>
                        <span style={{ color: secondary }}>?</span> {faq.question}
                      </AccordionTrigger>
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
          <div className="mx-auto px-4 text-center" style={{ maxWidth: 900 }}>
            <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span style={{ color: mutedColor }}>&gt;</span> {t('buyer.cta.readyTo') || 'Ready to'} <span style={{ color: primary }}>{t('buyer.cta.execute') || 'Execute'}</span>?
              </h2>
              {enableFastOrder ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/fast-order')}
                  className="font-bold font-mono text-lg px-10 hover:opacity-90" 
                  style={primaryButtonStyle}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  ./fast-order --start
                </Button>
              ) : (
                <Button size="lg" asChild className="font-bold font-mono text-lg px-10 hover:opacity-90" style={primaryButtonStyle}>
                  <Link to="/auth?tab=signup">./register --now <ArrowRight className="w-5 h-5 ml-2" /></Link>
                </Button>
              )}
            </motion.div>
          </div>
        </section>
      </article>

      {/* Enhanced Footer */}
      {(customization.enableFooter !== false) && (
        <footer className="py-16 font-mono" style={{ 
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
                    <Terminal className="w-8 h-8" style={{ color: primary }} />
                  )}
                  <span className="font-bold text-lg">[{companyName}]</span>
                </div>
                <p className="text-sm mb-4" style={{ color: mutedColor }}>
                  {customization.footerAbout || '> Professional SMM services with instant delivery.'}
                </p>
                {(() => {
                  const socialLinks = getSocialLinks(customization.socialLinks);
                  const iconMap = getSocialIconMap();
                  return socialLinks.length > 0 && (
                    <div className="flex gap-3">
                      {socialLinks.map((link: any) => {
                        const Icon = iconMap[link.id] || Instagram;
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
                <h4 className="font-semibold mb-4">./services</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/services" className="hover:opacity-80 transition-opacity">{t('buyer.footer.allServices') || 'All Services'}</Link></li>
                  <li><Link to="/services?platform=instagram" className="hover:opacity-80 transition-opacity">Instagram</Link></li>
                  <li><Link to="/services?platform=youtube" className="hover:opacity-80 transition-opacity">YouTube</Link></li>
                  <li><Link to="/services?platform=tiktok" className="hover:opacity-80 transition-opacity">TikTok</Link></li>
                </ul>
              </div>
              
              {/* Company Column */}
              <div>
              <h4 className="font-semibold mb-4">./company</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/about" className="hover:opacity-80 transition-opacity">{t('buyer.footer.aboutUs') || 'About Us'}</Link></li>
                  <li><Link to="/contact" className="hover:opacity-80 transition-opacity">{t('buyer.footer.contact') || 'Contact'}</Link></li>
                  {showBlogInMenu && <li><Link to="/blog" className="hover:opacity-80 transition-opacity">{t('buyer.footer.blog') || 'Blog'}</Link></li>}
                </ul>
              </div>
              
              {/* Support Column */}
              <div>
                <h4 className="font-semibold mb-4">./help</h4>
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

export default TGRefHomepage;