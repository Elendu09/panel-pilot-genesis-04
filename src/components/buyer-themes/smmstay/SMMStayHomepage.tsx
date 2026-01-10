import { motion } from 'framer-motion';
import { 
  Flame, Zap, Shield, Users, Star, ArrowRight,
  Instagram, Youtube, Twitter, MessageCircle
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
  
  // Theme defaults for SMMStay (neon pink/purple)
  const defaultPrimary = '#FF4081';
  const defaultSecondary = '#E040FB';
  const defaultBg = '#000000';
  const defaultSurface = '#0A0A0A';

  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  const bgColor = customization.backgroundColor || defaultBg;
  const textCol = customization.textColor || '#FFFFFF';
  const surfaceColor = customization.surfaceColor || defaultSurface;
  const mutedColor = customization.mutedColor || '#9CA3AF';

  // Typography
  const fontFamily = customization.fontFamily || 'Montserrat';
  const headingWeight = customization.headingWeight || '900';

  // Content
  const heroTitle = customization.heroTitle || 'Dominate';
  const heroSubtitle = customization.heroSubtitle || 'Premium followers, likes & views at unbeatable prices';
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
  const showPlatforms = customization.enablePlatformFeatures !== false;
  const showTestimonials = customization.enableTestimonials !== false;
  const showFAQs = customization.enableFAQs !== false;

  // Content arrays
  const featureCards = customization.featureCards || [
    { title: 'INSTANT START', description: 'Orders begin within seconds', icon: 'Zap' },
    { title: 'PREMIUM QUALITY', description: 'Real accounts only', icon: 'Star' },
    { title: '24/7 SUPPORT', description: 'Always here for you', icon: 'Users' },
    { title: 'REFILL GUARANTEE', description: 'Drop protection included', icon: 'Shield' },
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

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'Telegram', icon: MessageCircle, color: '#0088cc' },
  ];

  return (
    <main role="main" className={`min-h-screen font-${fontFamily.toLowerCase()} overflow-hidden`} style={{ backgroundColor: bgColor, color: textCol }}>
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
      <header>
        <nav className="relative z-50 py-4" style={{ borderBottom: `1px solid ${primary}33` }} aria-label="Main navigation">
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3" aria-label={`${companyName} home`}>
                <div className="relative">
                  {displayLogo ? (
                    <img src={displayLogo} alt={companyName} className="w-10 h-10 rounded-lg object-contain" loading="eager" />
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                        <Flame className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-lg blur-lg opacity-50" style={{ backgroundColor: primary }} />
                    </>
                  )}
                </div>
                <span className="text-xl font-black uppercase tracking-wider">{companyName}</span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link to="/services" className="text-sm font-bold uppercase tracking-wider transition-colors" style={{ color: mutedColor }}>Services</Link>
                <Link to="/orders" className="text-sm font-bold uppercase tracking-wider transition-colors" style={{ color: mutedColor }}>Orders</Link>
                {showBlogInMenu && <Link to="/blog" className="text-sm font-bold uppercase tracking-wider transition-colors" style={{ color: mutedColor }}>Blog</Link>}
                <Link to="/support" className="text-sm font-bold uppercase tracking-wider transition-colors" style={{ color: mutedColor }}>Support</Link>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild className="font-bold uppercase text-white hover:bg-white/10">
                  <Link to="/auth">Login</Link>
                </Button>
                <Button size="sm" asChild className="font-black uppercase text-white shadow-lg hover:opacity-90" style={primaryButtonStyle}>
                  <Link to="/auth?tab=signup">Join Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <article>
        {/* Hero Section */}
        <section id="hero" aria-label="Hero Section" className="relative" style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}>
          <motion.div 
            className="mx-auto px-4 sm:px-6 lg:px-8 text-center" 
            style={{ maxWidth: containerMax }}
            {...(enableAnimations ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } } : {})}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase mb-6">
              <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{heroTitle}</span>
              <br />
              <span>Social Media</span>
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto uppercase tracking-wide" style={{ color: mutedColor }}>{heroSubtitle}</p>
            
            {/* Dynamic CTA based on enableFastOrder */}
            {enableFastOrder ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/fast-order')}
                  className="font-black uppercase text-lg px-10 text-white shadow-xl hover:opacity-90" 
                  style={primaryButtonStyle}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Fast Order
                </Button>
                <Button size="lg" variant="outline" asChild className="font-black uppercase" style={{ borderColor: `${secondary}80`, color: secondary }}>
                  <Link to="/services">View Services</Link>
                </Button>
              </div>
            ) : (
              <Button size="lg" asChild className="font-black uppercase text-lg px-10 text-white shadow-xl hover:opacity-90" style={primaryButtonStyle}>
                <Link to="/services">{heroCTA} <ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
            )}
          </motion.div>
        </section>

        {/* Stats */}
        {showStats && (
          <section id="stats" aria-label="Statistics" className="py-16" style={{ borderTop: `1px solid ${primary}1a`, borderBottom: `1px solid ${primary}1a` }}>
            <div className="mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8" style={{ maxWidth: containerMax }}>
              {[
                { label: 'USERS', value: stats?.totalUsers || '10K+' },
                { label: 'ORDERS', value: stats?.totalOrders || '50K+' },
                { label: 'SERVICES', value: stats?.servicesCount || '500+' },
                { label: 'UPTIME', value: '99.9%' },
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
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Platforms</span>
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
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reviews</span>
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
                  <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FAQ</span>
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
                Ready to <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dominate</span>?
              </h2>
              {enableFastOrder ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/fast-order')}
                  className="font-black uppercase text-lg px-10 text-white shadow-xl hover:opacity-90" 
                  style={primaryButtonStyle}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Fast Order Now
                </Button>
              ) : (
                <Button size="lg" asChild className="font-black uppercase text-lg px-10 text-white shadow-xl hover:opacity-90" style={primaryButtonStyle}>
                  <Link to="/auth?tab=signup">Join Now <ArrowRight className="w-5 h-5 ml-2" /></Link>
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
              <Flame className="w-5 h-5" style={{ color: primary }} />
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

export default SMMStayHomepage;