import { useCallback, useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Zap, Users, Star, ArrowRight, Award, TrendingUp,
  Instagram, Youtube, Twitter, Facebook, User, Lock, Bookmark, 
  LockKeyhole, ChevronDown, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { 
  FacebookIcon, YouTubeIcon, TelegramIcon, InstagramIcon, 
  TwitterIcon, SpotifyIcon, SnapchatIcon, TikTokIcon, SoundCloudIcon 
} from '@/components/icons/SocialIcons';
import { BuyerAuthContext } from '@/contexts/BuyerAuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

export const SMMVisitHomepage = ({ 
  panelName = 'SMM Panel', 
  services = [], 
  stats,
  customization = {},
  logoUrl 
}: SMMVisitHomepageProps) => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  
  // Auth context for inline login
  const authContext = useContext(BuyerAuthContext);
  const signIn = authContext?.signIn;
  const buyer = authContext?.buyer;
  const panelId = authContext?.panelId;
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  
  // Check if Google OAuth is enabled for this panel
  useEffect(() => {
    const checkGoogleOAuth = async () => {
      if (!panelId) return;
      try {
        const { data } = await (supabase as any)
          .from('panel_settings_public')
          .select('social_links')
          .eq('panel_id', panelId)
          .maybeSingle();
        
        const socialLinks = data?.social_links as Record<string, any> | null;
        setGoogleEnabled(socialLinks?.google_oauth_enabled === true);
      } catch (err) {
        console.log('Could not check Google OAuth status');
      }
    };
    checkGoogleOAuth();
  }, [panelId]);
  
  // Handle inline login form submission
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signIn) {
      navigate('/auth');
      return;
    }
    
    if (!loginEmail.trim()) {
      toast.error(t('buyer.auth.enterEmail') || 'Please enter your email or username');
      return;
    }
    if (!loginPassword) {
      toast.error(t('buyer.auth.enterPassword') || 'Please enter your password');
      return;
    }
    
    setLoginLoading(true);
    try {
      const result = await signIn(loginEmail.trim(), loginPassword);
      if (!result.error) {
        toast.success(t('buyer.auth.welcomeBack') || 'Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error(result.error.message || t('buyer.auth.loginFailed') || 'Login failed. Please try again.');
      }
    } catch (err) {
      toast.error(t('buyer.auth.error') || 'An error occurred. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };
  
  // Theme mode - reactive to customization prop
  const themeMode = customization.themeMode || 'light';
  const isLightMode = themeMode === 'light';
  
  // Theme defaults for SMMVisit
  const defaultPrimary = '#FFD700';
  const defaultSecondary = '#FFC107';

  const themeDefaults = {
    lightBg: '#F5F5F5',
    darkBg: '#1C1F26',
    lightSurface: '#FFFFFF',
    darkSurface: '#262A33',
    lightText: '#1A1A1A',
    darkText: '#FFFFFF',
    lightMuted: '#6B7280',
    darkMuted: '#9CA3AF',
    lightBorder: '#E5E7EB',
    darkBorder: '#333333',
  };

  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  
  // Get mode-specific colors
  const modeColors = getModeColors(customization, isLightMode, themeDefaults);
  const { backgroundColor: bgColor, surfaceColor, textColor: textCol, mutedColor } = modeColors;

  // Typography
  const fontFamily = customization.fontFamily || 'Inter';
  const headingWeight = customization.headingWeight || '700';

  // Content - use translations
  const heroTitle = customization.heroTitle || t('buyer.hero.title');
  const heroSubtitle = customization.heroSubtitle || t('buyer.hero.subtitle');
  const heroCTA = customization.heroCTAText || t('buyer.hero.cta');
  const displayLogo = customization.logoUrl || logoUrl;
  const companyName = customization.companyName || panelName;

  // Toggles - use nullish coalescing to properly handle undefined/false values
  const showBlogInMenu = customization.showBlogInMenu ?? false;
  const enableFastOrder = customization.enableFastOrder === true;
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
  const enableAnimations = customization.enableAnimations !== false;
  const sectionPadding = customization.sectionPaddingY || 80;
  const containerMax = customization.containerMaxWidth || 1280;

  // Button styles
  const primaryButtonStyle = getButtonStyles(customization, 'primary');

  // Theme mode change handler
  const handleThemeModeChange = useCallback((mode: 'light' | 'dark') => {
    // Theme mode is controlled by parent
  }, []);

  return (
    <main role="main" className="min-h-screen" style={{ fontFamily, backgroundColor: bgColor, color: textCol }}>
      {/* FAQPage JSON-LD Schema */}
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
        navStyle="floating"
        primaryButtonStyle={primaryButtonStyle}
        signupLabel={t('buyer.auth.signUp') || 'Sign Up'}
        hideThemeToggle={true}
      />

      <article>
        {/* Hero Section */}
        <section id="hero" aria-label="Hero Section" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          {customization.enableHeroImage && customization.heroImageUrl ? (
            <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12" style={{ maxWidth: containerMax }}>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } } : {})} className="flex-1 text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6" style={{ fontWeight: headingWeight, color: textCol }}>
                  {(() => {
                    const position = customization.heroAnimatedTextPosition || 'last';
                    const { before, animatedWord, after } = getAnimatedWordFromTitle(heroTitle, position);
                    const effectiveAnimStyle = customization.heroAnimatedTextStyle || getThemeDefaultAnimationStyle('smmvisit');
                    return (<>{before && <span style={{ color: textCol }}>{before} </span>}<AnimatedHeroText text={animatedWord} animationStyle={effectiveAnimStyle} primaryColor={primary} secondaryColor={secondary} enableAnimations={enableAnimations} />{after && <span style={{ color: textCol }}> {after}</span>}</>);
                  })()}
                </h1>
                <p className="text-lg mb-8 max-w-2xl" style={{ color: mutedColor }}>{heroSubtitle}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {enableFastOrder ? (<><Button size="lg" onClick={() => navigate('/fast-order')} className="font-semibold text-lg px-10 text-white shadow-xl hover:opacity-90" style={primaryButtonStyle}><Zap className="w-5 h-5 mr-2" />{t('buyer.fastOrder.title') || 'Fast Order'}</Button><Button size="lg" variant="outline" asChild className="font-semibold" style={{ borderColor: primary, color: textCol }}><Link to="/services">{t('buyer.services.viewAll') || 'View Services'}</Link></Button></>) : (<><Button size="lg" onClick={() => buyer ? navigate('/dashboard') : navigate('/auth?tab=signup')} className="font-semibold text-lg px-10 text-white shadow-xl hover:opacity-90" style={primaryButtonStyle}>{buyer ? (t('buyer.nav.dashboard') || 'Dashboard') : (heroCTA || 'Get Started')} <ArrowRight className="w-5 h-5 ml-2" /></Button><Button size="lg" variant="outline" onClick={() => navigate('/fast-order')} className="font-semibold" style={{ borderColor: primary, color: textCol }}><Zap className="w-5 h-5 mr-2" />{t('buyer.fastOrder.title') || 'Fast Order'}</Button></>)}
                </div>
              </motion.div>
              <motion.div {...(enableAnimations ? { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } } : {})} className="w-full lg:w-2/5 flex-shrink-0">
                <img src={customization.heroImageUrl} alt="Hero" className="w-full max-h-[400px] lg:max-h-[500px] object-contain rounded-2xl" loading="eager" />
              </motion.div>
            </div>
          ) : (
          <div className="mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ maxWidth: containerMax }}>
            <motion.div {...(enableAnimations ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } } : {})}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6" style={{ fontWeight: headingWeight, color: textCol }}>
                {(() => {
                  const position = customization.heroAnimatedTextPosition || 'last';
                  const { before, animatedWord, after } = getAnimatedWordFromTitle(heroTitle, position);
                  const effectiveAnimStyle = customization.heroAnimatedTextStyle || getThemeDefaultAnimationStyle('smmvisit');
                  return (<>{before && <span style={{ color: textCol }}>{before} </span>}<AnimatedHeroText text={animatedWord} animationStyle={effectiveAnimStyle} primaryColor={primary} secondaryColor={secondary} enableAnimations={enableAnimations} />{after && <span style={{ color: textCol }}> {after}</span>}</>);
                })()}
              </h1>
              <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: mutedColor }}>{heroSubtitle}</p>
              {enableFastOrder ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" onClick={() => navigate('/fast-order')} className="font-semibold text-lg px-10 text-white shadow-xl hover:opacity-90" style={primaryButtonStyle}><Zap className="w-5 h-5 mr-2" />{t('buyer.fastOrder.title') || 'Fast Order'}</Button>
                  <Button size="lg" variant="outline" asChild className="font-semibold" style={{ borderColor: primary, color: textCol }}><Link to="/services">{t('buyer.services.viewAll') || 'View Services'}</Link></Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" onClick={() => buyer ? navigate('/dashboard') : navigate('/auth?tab=signup')} className="font-semibold text-lg px-10 text-white shadow-xl hover:opacity-90" style={primaryButtonStyle}>{buyer ? (t('buyer.nav.dashboard') || 'Dashboard') : (heroCTA || 'Get Started')} <ArrowRight className="w-5 h-5 ml-2" /></Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/fast-order')} className="font-semibold" style={{ borderColor: primary, color: textCol }}><Zap className="w-5 h-5 mr-2" />{t('buyer.fastOrder.title') || 'Fast Order'}</Button>
                </div>
              )}
            </motion.div>
          </div>
          )}
        </section>

        {/* Quick Login Section */}
        {!buyer && (
          <section 
            id="quick-login" 
            aria-label="Quick Login" 
            className="py-12"
            style={{ backgroundColor: isLightMode ? '#F9FAFB' : surfaceColor }}
          >
            <div className="mx-auto px-4" style={{ maxWidth: containerMax }}>
              <motion.div 
                {...(enableAnimations ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.5 } } : {})}
                className="p-6 md:p-8 rounded-3xl shadow-lg"
                style={{ backgroundColor: isLightMode ? '#FFFFFF' : bgColor }}
              >
                <h2 className="text-xl md:text-2xl font-bold mb-6" style={{ color: textCol }}>
                  {t('buyer.auth.loginTitle') || 'Login to your account'}
                </h2>
                
                {/* Login Form */}
                <form onSubmit={handleQuickLogin}>
                  <div className="flex flex-col lg:flex-row items-stretch gap-3 mb-4">
                    {/* Email Input */}
                    <div className="relative flex-1">
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center rounded-l-xl z-10"
                        style={{ backgroundColor: primary }}
                      >
                        <User className="w-5 h-5" style={{ color: isLightMode ? '#1A1A1A' : '#FFFFFF' }} />
                      </div>
                      <Input 
                        placeholder={t('buyer.auth.emailPlaceholder') || 'Email or Username'}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-14 h-12 rounded-xl border-0"
                        style={{ 
                          backgroundColor: isLightMode ? '#F3F4F6' : '#333',
                          color: textCol
                        }}
                        disabled={loginLoading}
                      />
                    </div>
                    
                    {/* Password Input */}
                    <div className="relative flex-1">
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center rounded-l-xl z-10"
                        style={{ backgroundColor: primary }}
                      >
                        <Lock className="w-5 h-5" style={{ color: isLightMode ? '#1A1A1A' : '#FFFFFF' }} />
                      </div>
                      <Input 
                        type="password"
                        placeholder={t('buyer.auth.passwordPlaceholder') || 'Password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-14 h-12 rounded-xl border-0"
                        style={{ 
                          backgroundColor: isLightMode ? '#F3F4F6' : '#333',
                          color: textCol
                        }}
                        disabled={loginLoading}
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button"
                        variant="outline" 
                        size="icon"
                        className="w-12 h-12 rounded-xl border-0"
                        style={{ backgroundColor: primary }}
                      >
                        <Bookmark className="w-5 h-5" style={{ color: isLightMode ? '#1A1A1A' : '#FFFFFF' }} />
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="icon"
                        className="w-12 h-12 rounded-xl border-0"
                        style={{ backgroundColor: primary }}
                      >
                        <LockKeyhole className="w-5 h-5" style={{ color: isLightMode ? '#1A1A1A' : '#FFFFFF' }} />
                      </Button>
                      <Button 
                        type="submit"
                        className="h-12 px-6 md:px-8 rounded-xl font-semibold border-0"
                        disabled={loginLoading}
                        style={{ 
                          backgroundColor: isLightMode ? '#1A1A1A' : '#FFFFFF',
                          color: isLightMode ? '#FFFFFF' : '#1A1A1A'
                        }}
                      >
                        {loginLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('buyer.auth.signingIn') || 'Signing in...'}
                          </>
                        ) : (
                          t('buyer.auth.signIn') || 'Sign in'
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
                
                {/* Google Sign In */}
                {googleEnabled && (
                  <div className="flex justify-center mb-4">
                    <Button 
                      variant="outline" 
                      className="h-10 px-6 rounded-lg"
                      style={{ 
                        borderColor: isLightMode ? '#E5E7EB' : '#444', 
                        color: textCol,
                        backgroundColor: 'transparent'
                      }}
                    >
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-2" />
                      {t('buyer.auth.signInWithGoogle') || 'Sign in with Google'}
                    </Button>
                  </div>
                )}
                
                {/* Remember Me & Reset */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer" style={{ color: mutedColor }}>
                    <input 
                      type="checkbox" 
                      className="rounded w-4 h-4" 
                      style={{ accentColor: primary }}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    {t('buyer.auth.rememberMe') || 'Remember me'}
                  </label>
                  <Link to="/auth" className="underline hover:no-underline" style={{ color: textCol }}>
                    {t('buyer.auth.resetPassword') || 'Reset Password'}
                  </Link>
                </div>
              </motion.div>
            
              {/* Scroll Indicator */}
              <div className="flex items-center justify-center gap-2 mt-8" style={{ color: mutedColor }}>
                <ChevronDown className="w-4 h-4 animate-bounce" />
                <span className="text-sm">{t('buyer.home.scrollMore') || 'Scroll to see more'}</span>
              </div>
              
              {/* Divider */}
              <div className="w-full h-px mt-8" style={{ backgroundColor: isLightMode ? '#E5E7EB' : '#333' }} />
              
              {/* Social Platform Icons */}
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-8">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1877F2' }}>
                  <FacebookIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF0000' }}>
                  <YouTubeIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#0088CC' }}>
                  <TelegramIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)' }}>
                  <InstagramIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1DA1F2' }}>
                  <TwitterIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1DB954' }}>
                  <SpotifyIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFFC00' }}>
                  <SnapchatIcon className="w-8 h-8 md:w-10 md:h-10 text-black" />
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#000000' }}>
                  <TikTokIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #FF5500, #FF7700)' }}>
                  <SoundCloudIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats */}
        {showStats && (
          <section id="stats" aria-label="Statistics" className="py-16" style={{ backgroundColor: surfaceColor }}>
            <div className="mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8" style={{ maxWidth: containerMax }}>
              {[
                { label: t('buyer.stats.happyUsers') || 'Happy Users', value: stats?.totalUsers || '100K+' },
                { label: t('buyer.stats.ordersCompleted') || 'Orders Completed', value: stats?.totalOrders || '1M+' },
                { label: t('buyer.stats.services') || 'Services', value: stats?.servicesCount || '500+' },
                { label: t('buyer.stats.countries') || 'Countries', value: '150+' },
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
              <h2 className="text-3xl font-bold text-center mb-12" style={{ color: textCol, fontWeight: headingWeight }}>
                {t('buyer.features.title') || 'Why Choose Us'}
              </h2>
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
              <h2 className="text-3xl font-bold text-center mb-12" style={{ color: textCol, fontWeight: headingWeight }}>
                {t('buyer.testimonials.title') || 'Customer Reviews'}
              </h2>
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
                  {t('buyer.faq.title') || 'Frequently Asked'} <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('buyer.faq.questions') || 'Questions'}</span>
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
                {t('buyer.cta.title') || 'Ready to Boost Your Social Media?'}
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                {t('buyer.cta.subtitle') || 'Join thousands of satisfied customers and start growing today.'}
              </p>
              {enableFastOrder ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/fast-order')}
                  className="font-semibold text-lg px-10 shadow-xl hover:opacity-90" 
                  style={{ backgroundColor: surfaceColor, color: textCol }}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {t('buyer.cta.fastOrder') || 'Fast Order Now'}
                </Button>
              ) : (
                <Button size="lg" asChild className="font-semibold text-lg px-10 shadow-xl hover:opacity-90" style={{ backgroundColor: surfaceColor, color: textCol }}>
                  <Link to="/auth?tab=signup">{t('buyer.cta.getStarted') || 'Get Started Now'} <ArrowRight className="w-5 h-5 ml-2" /></Link>
                </Button>
              )}
            </motion.div>
          </div>
        </section>
      </article>

      {/* Footer */}
      {(customization.enableFooter !== false) && (
        <footer className="py-16" style={{ 
          backgroundColor: isLightMode ? '#FFFFFF' : surfaceColor,
          borderTop: isLightMode ? '1px solid #E5E7EB' : `1px solid ${primary}1a` 
        }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {/* Brand Column */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  {displayLogo ? (
                    <img src={displayLogo} alt={companyName} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primary }}>
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="font-bold text-lg" style={{ color: textCol }}>{companyName}</span>
                </div>
                <p className="text-sm mb-4" style={{ color: mutedColor }}>
                  {customization.footerAbout || t('buyer.footer.about') || 'Professional SMM services trusted worldwide.'}
                </p>
                {(() => {
                  const socialLinks = getSocialLinks(customization.socialLinks);
                  const iconMap = getSocialIconMap();
                  return socialLinks.length > 0 && (
                    <div className="flex gap-3">
                      {socialLinks.map((link: any) => {
                        const Icon = iconMap[link.id] || Instagram;
                        return (
                          <a 
                            key={link.id} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:opacity-100 transition-opacity"
                            style={{ color: mutedColor, opacity: 0.6 }}
                          >
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
                <h4 className="font-semibold mb-4" style={{ color: textCol }}>{t('buyer.footer.services') || 'Services'}</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/services" className="hover:opacity-80 transition-opacity" style={{ color: mutedColor }}>{t('buyer.footer.allServices') || 'All Services'}</Link></li>
                  <li><Link to="/services?platform=instagram" className="hover:opacity-80 transition-opacity" style={{ color: mutedColor }}>Instagram</Link></li>
                  <li><Link to="/services?platform=youtube" className="hover:opacity-80 transition-opacity" style={{ color: mutedColor }}>YouTube</Link></li>
                  <li><Link to="/services?platform=tiktok" className="hover:opacity-80 transition-opacity" style={{ color: mutedColor }}>TikTok</Link></li>
                </ul>
              </div>
              
              {/* Company Column */}
              <div>
                <h4 className="font-semibold mb-4" style={{ color: textCol }}>{t('buyer.footer.company') || 'Company'}</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/about" className="hover:opacity-80 transition-opacity" style={{ color: mutedColor }}>{t('buyer.footer.aboutUs') || 'About Us'}</Link></li>
                  <li><Link to="/contact" className="hover:opacity-80 transition-opacity" style={{ color: mutedColor }}>{t('buyer.footer.contact') || 'Contact'}</Link></li>
                  {showBlogInMenu && <li><Link to="/blog" className="hover:opacity-80 transition-opacity" style={{ color: mutedColor }}>{t('buyer.footer.blog') || 'Blog'}</Link></li>}
                </ul>
              </div>
              
              {/* Support Column */}
              <div>
                <h4 className="font-semibold mb-4" style={{ color: textCol }}>{t('buyer.footer.support') || 'Support'}</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#faq" className="hover:opacity-80 transition-opacity" style={{ color: mutedColor }}>{t('buyer.footer.faq') || 'FAQ'}</a></li>
                  <li><Link to="/terms" className="hover:opacity-80 transition-opacity" style={{ color: mutedColor }}>{t('buyer.footer.terms') || 'Terms'}</Link></li>
                  <li><Link to="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: mutedColor }}>{t('buyer.footer.privacy') || 'Privacy'}</Link></li>
                </ul>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="pt-8 text-center text-sm" style={{ borderTop: isLightMode ? '1px solid #E5E7EB' : `1px solid ${primary}1a`, color: mutedColor }}>
              {customization.footerText 
                ? customization.footerText.replace(/\{companyName\}/g, companyName)
                : `© ${new Date().getFullYear()} ${companyName}. ${t('buyer.footer.rights') || 'All rights reserved.'}`}
            </div>
          </div>
        </footer>
      )}
    </main>
  );
};

export default SMMVisitHomepage;
