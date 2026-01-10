import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, Shield, Users, Star, ArrowRight, CheckCircle, X,
  Instagram, Youtube, Twitter, Music, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ThemeCustomization } from '@/types/theme-customization';
import { 
  getAnimationVariants, getContainerVariants, getItemVariants,
  getButtonStyles, getCardStyles, getHoverScale, getLucideIcon,
  getDefaultStats, getDefaultFeatures, getDefaultTestimonials, getDefaultFAQs
} from '@/lib/theme-utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  
  // Theme defaults for AliPanel (pink-orange gradient)
  const defaultPrimary = '#FF6B6B';
  const defaultSecondary = '#FF8E53';
  const defaultAccent = '#FFCC70';
  const defaultBg = '#0A0A0A';
  const defaultSurface = '#1A1A1A';

  // Use customization colors or fallback to theme defaults
  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  const accent = customization.accentColor || defaultAccent;
  const bgColor = customization.backgroundColor || defaultBg;
  const textCol = customization.textColor || '#FFFFFF';
  const surfaceColor = customization.surfaceColor || defaultSurface;
  const mutedColor = customization.mutedColor || '#A1A1AA';

  // Typography
  const fontFamily = customization.fontFamily || 'Poppins';
  const headingFont = customization.headingFont || fontFamily;
  const headingWeight = customization.headingWeight || '700';

  // Content from customization or defaults
  const heroTitle = customization.heroTitle || 'Boost Your';
  const heroSubtitle = customization.heroSubtitle || 'Get real followers, likes, and views at the lowest prices. Trusted by over 10,000+ customers worldwide.';
  const heroBadge = customization.heroBadgeText || '#1 Rated SMM Panel';
  const heroCTA = customization.heroCTAText || 'Start Growing';
  const heroSecondaryCTA = customization.heroSecondaryCTAText || 'View Prices';
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

  // Content arrays from customization
  const featureCards = customization.featureCards || getDefaultFeatures();
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

  const floatingIcons = [
    { icon: Instagram, color: '#E4405F', delay: 0, x: -120, y: -80 },
    { icon: Youtube, color: '#FF0000', delay: 0.2, x: 130, y: -60 },
    { icon: Twitter, color: '#1DA1F2', delay: 0.4, x: -100, y: 60 },
    { icon: Music, color: '#1DB954', delay: 0.6, x: 110, y: 80 },
    { icon: Video, color: '#000000', delay: 0.8, x: 0, y: -120 },
  ];

  const servicePills = [
    { name: 'Followers', gradient: `linear-gradient(to right, ${primary}, ${secondary})` },
    { name: 'Likes', gradient: `linear-gradient(to right, ${secondary}, ${accent})` },
    { name: 'Views', gradient: 'linear-gradient(to right, #8B5CF6, #A855F7)' },
    { name: 'Comments', gradient: 'linear-gradient(to right, #06B6D4, #3B82F6)' },
  ];

  const comparisonItems = [
    { feature: 'Instant Start', us: true, others: false },
    { feature: '24/7 Support', us: true, others: false },
    { feature: 'Refill Guarantee', us: true, others: false },
    { feature: 'Secure Payments', us: true, others: true },
    { feature: 'Low Prices', us: true, others: false },
  ];

  return (
    <main role="main" className={`min-h-screen overflow-hidden font-${fontFamily.toLowerCase()}`} style={{ backgroundColor: bgColor, color: textCol }}>
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
      <header>
        <nav className="relative z-50 py-4" aria-label="Main navigation">
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3" aria-label={`${companyName} home`}>
                {displayLogo ? (
                  <img src={displayLogo} alt={companyName} className="w-10 h-10 rounded-xl object-contain" loading="eager" />
                ) : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})`, boxShadow: `0 10px 25px -5px ${primary}4d` }}>
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                )}
                <span className="text-xl font-bold" style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: headingWeight }}>
                  {companyName}
                </span>
              </Link>
              
              <div className="hidden md:flex items-center gap-8">
                <Link to="/services" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>Services</Link>
                <Link to="/orders" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>Orders</Link>
                {showBlogInMenu && <Link to="/blog" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>Blog</Link>}
                <Link to="/support" className="text-sm transition-colors font-medium" style={{ color: mutedColor }}>Support</Link>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                  <Link to="/auth">Login</Link>
                </Button>
                <Button size="sm" asChild className="text-white font-semibold shadow-lg hover:opacity-90" style={primaryButtonStyle}>
                  <Link to="/auth?tab=signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </header>

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
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {heroTitle}
                  </span>
                  <br />
                  <span>Social Media</span>
                  <br />
                  <span>Presence</span>
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

                {/* Dynamic CTA based on enableFastOrder */}
                <div className="flex flex-col sm:flex-row gap-4">
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
                      <Button size="lg" variant="outline" asChild className="font-semibold hover:bg-white/5" style={outlineButtonStyle}>
                        <Link to="/services">View Services</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="lg" asChild className="text-white font-semibold text-lg px-8 shadow-xl hover:opacity-90" style={primaryButtonStyle}>
                        <Link to="/auth?tab=signup" className="flex items-center gap-2">
                          {heroCTA} <ArrowRight className="w-5 h-5" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild className="font-semibold hover:bg-white/5" style={outlineButtonStyle}>
                        <Link to="/services">{heroSecondaryCTA}</Link>
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
                    <h3 className="text-lg font-bold mb-4 text-center">Why Choose Us?</h3>
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
                  { label: 'Happy Customers', value: stats?.totalUsers || '10K+' },
                  { label: 'Orders Completed', value: stats?.totalOrders || '50K+' },
                  { label: 'Services Available', value: stats?.servicesCount || '500+' },
                  { label: 'Countries Served', value: '150+' },
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
                  What Our <span style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Customers</span> Say
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
                  Frequently <span style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Asked</span> Questions
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
                Ready to <span style={{ background: `linear-gradient(to right, ${primary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grow</span>?
              </h2>
              <p className="mb-8 max-w-xl mx-auto" style={{ color: mutedColor }}>
                Join thousands of satisfied customers and start growing your social media today.
              </p>
              {enableFastOrder ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/fast-order')}
                  className="text-white font-semibold text-lg px-10 shadow-xl hover:opacity-90" 
                  style={primaryButtonStyle}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Fast Order Now
                </Button>
              ) : (
                <Button size="lg" asChild className="text-white font-semibold text-lg px-10 shadow-xl hover:opacity-90" style={primaryButtonStyle}>
                  <Link to="/auth?tab=signup">Get Started Now <ArrowRight className="w-5 h-5 ml-2" /></Link>
                </Button>
              )}
            </motion.div>
          </div>
        </section>
      </article>

      {/* Footer */}
      <footer className="py-12" style={{ borderTop: `1px solid ${primary}1a` }}>
        <div className="mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4" style={{ maxWidth: containerMax }}>
          <div className="flex items-center gap-2">
            {displayLogo ? (
              <img src={displayLogo} alt={companyName} className="w-5 h-5 rounded object-contain" loading="lazy" />
            ) : (
              <Sparkles className="w-5 h-5" style={{ color: primary }} />
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

export default AliPanelHomepage;