import { motion } from 'framer-motion';
import { 
  Terminal, Zap, Shield, Users, Star, ArrowRight, CheckCircle, Globe, Cpu, Play,
  Instagram, Youtube, Twitter, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ThemeCustomization } from '@/types/theme-customization';
import { 
  getAnimationVariants, getContainerVariants, getItemVariants,
  getButtonStyles, getHoverScale, getLucideIcon,
  getDefaultStats, getDefaultFeatures, getDefaultTestimonials, getDefaultFAQs
} from '@/lib/theme-utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  
  // Theme defaults for TGRef (teal/cyan terminal aesthetic)
  const defaultPrimary = '#00D4AA';
  const defaultSecondary = '#0EA5E9';
  const defaultAccent = '#7C3AED';
  const defaultBg = '#1A1B26';
  const defaultSurface = '#0D0E14';

  const primary = customization.primaryColor || defaultPrimary;
  const secondary = customization.secondaryColor || defaultSecondary;
  const accent = customization.accentColor || defaultAccent;
  const bgColor = customization.backgroundColor || defaultBg;
  const textCol = customization.textColor || '#FFFFFF';
  const surfaceColor = customization.surfaceColor || defaultSurface;
  const mutedColor = customization.mutedColor || '#9CA3AF';

  // Typography - TGRef prefers monospace
  const fontFamily = customization.fontFamily || 'mono';
  const headingWeight = customization.headingWeight || '700';

  // Content
  const heroTitle = customization.heroTitle || 'Social Growth';
  const heroSubtitle = customization.heroSubtitle || 'Execute powerful SMM commands. Instant delivery, premium quality, unbeatable prices.';
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
    { title: 'instant-delivery', description: 'Orders start within seconds', icon: 'Zap' },
    { title: 'secure-payment', description: 'Encrypted transactions', icon: 'Shield' },
    { title: 'live-support', description: '24/7 customer assistance', icon: 'Users' },
    { title: 'auto-refill', description: 'Guaranteed delivery', icon: 'CheckCircle' },
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
    color: bgColor,
  };

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { name: 'YouTube', icon: Youtube, color: '#FF0000' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'Telegram', icon: MessageCircle, color: '#0088cc' },
  ];

  return (
    <main role="main" className="min-h-screen font-mono" style={{ backgroundColor: bgColor, color: textCol }}>
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
      <header>
        <nav className="relative z-50 backdrop-blur-xl" style={{ borderBottom: `1px solid ${primary}33` }} aria-label="Main navigation">
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: containerMax }}>
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2" aria-label={`${companyName} home`}>
                {displayLogo ? (
                  <img src={displayLogo} alt={companyName} className="w-8 h-8 rounded object-contain" loading="eager" />
                ) : (
                  <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${primary}, ${secondary})` }}>
                    <Terminal className="w-5 h-5" style={{ color: bgColor }} />
                  </div>
                )}
                <span className="text-lg font-bold" style={{ color: primary }}>[{companyName}]</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-6">
                <Link to="/services" className="text-sm transition-colors" style={{ color: mutedColor }}>./services</Link>
                <Link to="/orders" className="text-sm transition-colors" style={{ color: mutedColor }}>./orders</Link>
                {showBlogInMenu && <Link to="/blog" className="text-sm transition-colors" style={{ color: mutedColor }}>./blog</Link>}
                <Link to="/support" className="text-sm transition-colors" style={{ color: mutedColor }}>./support</Link>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild className="font-mono" style={{ borderColor: `${primary}4d`, color: primary }}>
                  <Link to="/auth">&gt; login</Link>
                </Button>
                <Button size="sm" asChild className="font-bold font-mono hover:opacity-90" style={primaryButtonStyle}>
                  <Link to="/auth?tab=signup">&gt; register</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </header>

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
                <span style={{ background: `linear-gradient(to right, ${primary}, ${secondary}, ${accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {heroTitle}
                </span>
                <br />
                <span>Made Simple</span>
                <span className="animate-pulse" style={{ color: primary }}>_</span>
              </h1>

              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: mutedColor }}>
                <span style={{ color: secondary }}>$</span> {heroSubtitle}
              </p>

              {/* Dynamic CTA based on enableFastOrder */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {enableFastOrder ? (
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
                  <>
                    <Button size="lg" asChild className="font-bold font-mono text-lg px-8 hover:opacity-90" style={primaryButtonStyle}>
                      <Link to="/services" className="flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        ./start --now
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="font-mono" style={{ borderColor: `${accent}80`, color: accent }}>
                      <Link to="/auth" className="flex items-center gap-2">
                        <Terminal className="w-5 h-5" />
                        ./create-account
                      </Link>
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
                  { label: 'Orders Completed', value: stats?.totalOrders || '50K+', icon: CheckCircle },
                  { label: 'Active Users', value: stats?.totalUsers || '10K+', icon: Users },
                  { label: 'Services Available', value: stats?.servicesCount || '500+', icon: Cpu },
                  { label: 'Uptime', value: '99.9%', icon: Globe },
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
                  <span>Supported Platforms</span>
                  <span style={{ color: mutedColor }}>]</span>
                </h2>
                <p style={{ color: mutedColor }}>All major social networks in one place</p>
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
                  <span style={{ color: primary }}>&gt;</span> Why Choose Us
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
                  <span style={{ color: mutedColor }}>[</span>User Reviews<span style={{ color: mutedColor }}>]</span>
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
                <span style={{ color: mutedColor }}>&gt;</span> Ready to <span style={{ color: primary }}>Execute</span>?
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

      {/* Footer */}
      <footer className="py-12" style={{ borderTop: `1px solid ${primary}1a` }}>
        <div className="mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4" style={{ maxWidth: containerMax }}>
          <div className="flex items-center gap-2 font-mono">
            {displayLogo ? (
              <img src={displayLogo} alt={companyName} className="w-5 h-5 rounded object-contain" loading="lazy" />
            ) : (
              <Terminal className="w-5 h-5" style={{ color: primary }} />
            )}
            <span style={{ color: mutedColor }}>© {new Date().getFullYear()} [{companyName}]</span>
          </div>
          <nav className="flex gap-6 text-sm font-mono" aria-label="Footer navigation">
            <Link to="/terms" style={{ color: mutedColor }}>./terms</Link>
            <Link to="/privacy" style={{ color: mutedColor }}>./privacy</Link>
            <Link to="/support" style={{ color: mutedColor }}>./support</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
};

export default TGRefHomepage;