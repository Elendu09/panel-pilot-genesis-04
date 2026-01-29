import { useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, Zap, Shield, Users, Star, ArrowRight,
  Instagram, Youtube, Twitter, MessageCircle
} from 'lucide-react';
import { BuyerAuthContext } from '@/contexts/BuyerAuthContext';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ThemeCustomization } from '@/types/theme-customization';
import { 
  getButtonStyles, getHoverScale, getLucideIcon,
  getDefaultFeatures, getDefaultTestimonials, getDefaultFAQs,
  getModeColors, getSocialLinks, getSocialIconMap
} from '@/lib/theme-utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ThemeNavigation } from '../shared/ThemeNavigation';
import { AnimatedHeroText, getThemeDefaultAnimationStyle, getAnimatedWordFromTitle } from '../shared/AnimatedHeroText';
import { useLanguage } from '@/contexts/LanguageContext';

interface SMMStayHomepageProps {
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

// SMMStay Theme: Dark with neon pink/purple, bold uppercase, high-energy
export const SMMStayHomepage = ({ 
  panelName = 'SMM Panel', 
  services = [], 
  stats,
  customization = {},
  logoUrl 
}: SMMStayHomepageProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Check if buyer is logged in for login-aware CTA
  const buyerAuthContext = useContext(BuyerAuthContext);
  const buyer = buyerAuthContext?.buyer || null;
  
  // Theme mode - reactive to customization prop (no local state)
  const themeMode = customization.themeMode || 'dark';
  const isLightMode = themeMode === 'light';
  
  // Theme defaults for SMMStay (neon pink/purple)
  const defaultPrimary = '#FF4081';
  const defaultSecondary = '#E040FB';

  // SMMStay theme color defaults
  const themeDefaults = {
    lightBg: '#FAFBFC',
    darkBg: '#000000',
    lightSurface: '#FFFFFF',
    darkSurface: '#0A0A0A',
    lightText: '#1F2937',
    darkText: '#FFFFFF',
    lightMuted: '#6B7280',
    darkMuted: '#9CA3AF',
    lightBorder: '#E5E7EB',
    darkBorder: '#1A1A1A',
  };

  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  
  // Get mode-specific colors
  const modeColors = getModeColors(customization, isLightMode, themeDefaults);
  const { backgroundColor: bgColor, surfaceColor, textColor: textCol, mutedColor } = modeColors;

  // Typography
  const fontFamily = customization.fontFamily || 'Montserrat';
  const headingWeight = customization.headingWeight || '900';

  // Content - use translations for fallback text
  const heroTitle = customization.heroTitle || t('buyer.hero.title');
  const heroSubtitle = customization.heroSubtitle || t('buyer.hero.subtitle');
  const heroCTA = customization.heroCTAText || t('buyer.hero.cta');
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
    { title: t('buyer.features.highQuality'), description: t('buyer.features.highQualityDesc'), icon: 'Star' },
    { title: t('buyer.features.support'), description: t('buyer.features.supportDesc'), icon: 'Users' },
    { title: t('buyer.features.bestPrices'), description: t('buyer.features.bestPricesDesc'), icon: 'Shield' },
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
  const primaryButtonStyle = {
    ...getButtonStyles(customization, 'primary'),
    boxShadow: `0 0 30px ${primary}66`,
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
    <main role="main" className={`min-h-screen font-${fontFamily.toLowerCase()} overflow-hidden ${themeMode}`} style={{ backgroundColor: bgColor, color: textCol }}>
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

      {/* Neon Grid Background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${primary}26 0%, transparent 50%)` }} />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(${primary}1a 1px, transparent 1px), linear-gradient(90deg, ${primary}1a 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
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
            className="w-10 h-10 rounded-lg object-contain"
          />
        }
        defaultIcon={
          <img 
            src="/default-panel-favicon.png" 
            alt={companyName} 
            className="w-10 h-10 rounded-lg object-contain"
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
        navStyle="neon"
        primaryButtonStyle={primaryButtonStyle}
        signupLabel={t('buyer.nav.joinNow') || 'Join Now'}
      />

      <article>
        {/* Hero Section */}
        <section id="hero" aria-label="Hero Section" className="relative" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          <motion.div 
            className="mx-auto px-4 sm:px-6 lg:px-8 text-center" 
            style={{ maxWidth: containerMax }}
            {...(enableAnimations ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } } : {})}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase mb-6">
              {(() => {
                const position = customization.heroAnimatedTextPosition || 'last';
                const { before, animatedWord, after } = getAnimatedWordFromTitle(heroTitle, position);
                const effectiveAnimStyle = customization.heroAnimatedTextStyle || getThemeDefaultAnimationStyle('smmstay');
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
            <p className="text-xl mb-8 max-w-2xl mx-auto uppercase tracking-wide" style={{ color: mutedColor }}>{heroSubtitle}</p>
            
            {/* Dynamic CTA based on enableFastOrder - Default: Get Started + Fast Order */}
            {enableFastOrder ? (
              // When enableFastOrder is ON: Fast Order primary + View Services secondary
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/fast-order')}
                  className="font-black uppercase text-lg px-10 text-white shadow-xl hover:opacity-90" 
                  style={primaryButtonStyle}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {t('buyer.fastOrder.title') || 'Fast Order'}
                </Button>
                <Button size="lg" variant="outline" asChild className="font-black uppercase" style={{ borderColor: `${secondary}80`, color: secondary }}>
                  <Link to="/services">{t('buyer.services.viewAll') || 'View Services'}</Link>
                </Button>
              </div>
            ) : (
              // Default (enableFastOrder OFF): Get Started (login-aware) + Fast Order
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => buyer ? navigate('/dashboard') : navigate('/auth?tab=signup')}
                  className="font-black uppercase text-lg px-10 text-white shadow-xl hover:opacity-90" 
                  style={primaryButtonStyle}
                >
                  {buyer ? (t('buyer.nav.dashboard') || 'Dashboard') : (heroCTA || 'Get Started')} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/fast-order')}
                  className="font-black uppercase" 
                  style={{ borderColor: `${secondary}80`, color: secondary }}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {t('buyer.fastOrder.title') || 'Fast Order'}
                </Button>
              </div>
            )}
          </motion.div>
        </section>

        {/* Stats */}
        {showStats && (
          <section id="stats" aria-label="Statistics" className="py-16" style={{ borderTop: `1px solid ${primary}1a`, borderBottom: `1px solid ${primary}1a` }}>
            <div className="mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8" style={{ maxWidth: containerMax }}>
              {[
                { label: t('buyer.stats.users') || 'USERS', value: stats?.totalUsers || '10K+' },
                { label: t('buyer.stats.orders') || 'ORDERS', value: stats?.totalOrders || '50K+' },
                { label: t('buyer.stats.services') || 'SERVICES', value: stats?.servicesCount || '500+' },
                { label: t('buyer.stats.uptime') || 'UPTIME', value: '99.9%' },
              ].map((stat, idx) => (
                <motion.div 
                  key={stat.label} 
                  className="text-center"
                  {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                >
                  <div className="text-3xl md:text-4xl font-black mb-1" style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</div>
                  <div className="text-xs uppercase tracking-widest" style={{ color: mutedColor }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Platforms */}
        {showPlatforms && (
          <section id="platforms" aria-label="Supported Platforms" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('buyer.platforms.title') || 'Platforms'}</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platforms.map((platform, idx) => (
                  <motion.div
                    key={platform.name}
                    {...(enableAnimations ? { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, transition: { delay: idx * 0.1 }, whileHover: { scale: hoverScale } } : {})}
                    className="p-6 rounded-xl text-center"
                    style={{ backgroundColor: surfaceColor, border: `1px solid ${primary}1a` }}
                  >
                    <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${platform.color}20` }}>
                      <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
                    </div>
                    <h3 className="font-black uppercase">{platform.name}</h3>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        {showFeatures && (
          <section id="features" aria-label="Features" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
            <div className="mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ maxWidth: containerMax }}>
              {featureCards.map((feature, idx) => {
                const IconComponent = getLucideIcon(feature.icon);
                return (
                  <motion.div 
                    key={feature.title} 
                    {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                    className="p-6 rounded-xl text-center" 
                    style={{ backgroundColor: surfaceColor, border: `1px solid ${primary}1a` }}
                  >
                    <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-black uppercase mb-2">{feature.title}</h3>
                    <p className="text-sm" style={{ color: mutedColor }}>{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {showTestimonials && testimonials.length > 0 && (
          <section id="testimonials" aria-label="Customer Reviews" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding, backgroundColor: surfaceColor }}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('buyer.testimonials.reviews') || 'Reviews'}</span>
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, idx) => (
                  <motion.div
                    key={testimonial.name}
                    {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { delay: idx * 0.1 } } : {})}
                    className="p-6 rounded-xl"
                    style={{ backgroundColor: bgColor, border: `1px solid ${primary}1a` }}
                  >
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" style={{ color: primary }} />
                      ))}
                    </div>
                    <p className="mb-4" style={{ color: mutedColor }}>"{testimonial.text}"</p>
                    <div className="font-black uppercase">{testimonial.name}</div>
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
                <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('buyer.faq.title') || 'FAQ'}</span>
                </h2>
              </motion.div>

              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`} className="rounded-xl px-6" style={{ backgroundColor: surfaceColor, border: `1px solid ${primary}1a` }}>
                      <AccordionTrigger className="text-left font-bold uppercase hover:no-underline">{faq.question}</AccordionTrigger>
                      <AccordionContent style={{ color: mutedColor }}>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section id="cta" aria-label="Call to Action" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          <div className="mx-auto px-4 text-center" style={{ maxWidth: 900 }}>
            <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } } : {})}>
              <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">
                {t('buyer.cta.readyTo') || 'Ready to'} <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('buyer.cta.dominate') || 'Dominate'}</span>?
              </h2>
              {enableFastOrder ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/fast-order')}
                  className="font-black uppercase text-lg px-10 text-white shadow-xl hover:opacity-90" 
                  style={primaryButtonStyle}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {t('buyer.cta.fastOrder') || 'Fast Order Now'}
                </Button>
              ) : (
                <Button size="lg" asChild className="font-black uppercase text-lg px-10 text-white shadow-xl hover:opacity-90" style={primaryButtonStyle}>
                  <Link to="/auth?tab=signup">{t('buyer.nav.joinNow') || 'Join Now'} <ArrowRight className="w-5 h-5 ml-2" /></Link>
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
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="font-black text-lg uppercase">{companyName}</span>
                </div>
                <p className="text-sm mb-4" style={{ color: mutedColor }}>
                  {customization.footerAbout || 'THE #1 SMM PANEL FOR SERIOUS GROWTH.'}
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
                <h4 className="font-bold mb-4 uppercase">{t('buyer.footer.services') || 'Services'}</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/services" className="hover:opacity-80 transition-opacity">{t('buyer.footer.allServices') || 'All Services'}</Link></li>
                  <li><Link to="/services?platform=instagram" className="hover:opacity-80 transition-opacity">Instagram</Link></li>
                  <li><Link to="/services?platform=youtube" className="hover:opacity-80 transition-opacity">YouTube</Link></li>
                  <li><Link to="/services?platform=tiktok" className="hover:opacity-80 transition-opacity">TikTok</Link></li>
                </ul>
              </div>
              
              {/* Company Column */}
              <div>
                <h4 className="font-bold mb-4 uppercase">{t('buyer.footer.company') || 'Company'}</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><Link to="/support" className="hover:opacity-80 transition-opacity">{t('buyer.footer.aboutUs') || 'About Us'}</Link></li>
                  <li><Link to="/support" className="hover:opacity-80 transition-opacity">{t('buyer.footer.contact') || 'Contact'}</Link></li>
                  {showBlogInMenu && <li><Link to="/blog" className="hover:opacity-80 transition-opacity">{t('buyer.footer.blog') || 'Blog'}</Link></li>}
                </ul>
              </div>
              
              {/* Support Column */}
              <div>
                <h4 className="font-bold mb-4 uppercase">{t('buyer.footer.support') || 'Support'}</h4>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li><a href="#faq" className="hover:opacity-80 transition-opacity">{t('buyer.footer.faq') || 'FAQ'}</a></li>
                  <li><Link to="/terms" className="hover:opacity-80 transition-opacity">{t('buyer.footer.terms') || 'Terms'}</Link></li>
                  <li><Link to="/privacy" className="hover:opacity-80 transition-opacity">{t('buyer.footer.privacy') || 'Privacy'}</Link></li>
                </ul>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="pt-8 text-center text-sm uppercase" style={{ borderTop: `1px solid ${primary}1a`, color: mutedColor }}>
              {customization.footerText || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
            </div>
          </div>
        </footer>
      )}
    </main>
  );
};

export default SMMStayHomepage;