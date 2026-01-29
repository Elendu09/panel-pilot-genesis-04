import { motion } from 'framer-motion';
import { Shield, Zap, Users, Award, CheckCircle, Globe, HeartHandshake, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import { useLanguage } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';

const BuyerAbout = () => {
  const { panel, loading } = useTenant();
  const { t } = useLanguage();

  const companyName = panel?.name || 'SMM Panel';
  const customBranding = panel?.custom_branding as any;
  const description = customBranding?.footerAbout || customBranding?.description || 
    'We are a professional social media marketing service provider, helping businesses and individuals grow their online presence with high-quality, affordable services.';
  const primaryColor = customBranding?.primaryColor || panel?.primary_color || '#3B82F6';

  const values = [
    { 
      icon: Zap, 
      title: t('buyer.about.instantDelivery') || 'Instant Delivery', 
      description: t('buyer.about.instantDeliveryDesc') || 'Orders start processing within seconds of placement for rapid growth.'
    },
    { 
      icon: Shield, 
      title: t('buyer.about.safeSecure') || 'Safe & Secure', 
      description: t('buyer.about.safeSecureDesc') || 'Your account security is our priority. We never ask for passwords.'
    },
    { 
      icon: Users, 
      title: t('buyer.about.support247') || '24/7 Support', 
      description: t('buyer.about.support247Desc') || 'Our dedicated team is available around the clock to assist you.'
    },
    { 
      icon: Award, 
      title: t('buyer.about.highQuality') || 'High Quality', 
      description: t('buyer.about.highQualityDesc') || 'Premium services that deliver real, lasting results for your accounts.'
    },
  ];

  const stats = [
    { label: t('buyer.about.happyCustomers') || 'Happy Customers', value: '10,000+' },
    { label: t('buyer.about.ordersCompleted') || 'Orders Completed', value: '50,000+' },
    { label: t('buyer.about.servicesOffered') || 'Services Offered', value: '500+' },
    { label: t('buyer.about.uptime') || 'Uptime', value: '99.9%' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Us - {companyName}</title>
        <meta name="description" content={description} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(circle at center, ${primaryColor} 0%, transparent 60%)` }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('buyer.about.aboutTitle') || 'About'} <span style={{ color: primaryColor }}>{companyName}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryColor }}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">
              {t('buyer.about.ourMission') || 'Our Mission'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('buyer.about.missionDesc') || 
                'To empower businesses and creators with affordable, high-quality social media marketing solutions that drive real engagement and growth.'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${primaryColor}20` }}>
                <Globe className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('buyer.about.globalReach') || 'Global Reach'}</h3>
              <p className="text-muted-foreground">
                {t('buyer.about.globalReachDesc') || 
                  'Serving customers worldwide with localized support and services tailored to different markets and platforms.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${primaryColor}20` }}>
                <HeartHandshake className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('buyer.about.customerFirst') || 'Customer First'}</h3>
              <p className="text-muted-foreground">
                {t('buyer.about.customerFirstDesc') || 
                  'Your success is our success. We prioritize your needs and continuously improve our services based on your feedback.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              {t('buyer.about.whyChooseUs') || 'Why Choose Us'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  <value.icon className="w-7 h-7" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              {t('buyer.about.howItWorks') || 'How It Works'}
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: '1', title: t('buyer.about.step1Title') || 'Create an Account', desc: t('buyer.about.step1Desc') || 'Sign up for free and get instant access to all our services.' },
              { step: '2', title: t('buyer.about.step2Title') || 'Add Funds', desc: t('buyer.about.step2Desc') || 'Deposit using your preferred payment method securely.' },
              { step: '3', title: t('buyer.about.step3Title') || 'Place Your Order', desc: t('buyer.about.step3Desc') || 'Select your service, enter your link, and submit your order.' },
              { step: '4', title: t('buyer.about.step4Title') || 'Watch Your Growth', desc: t('buyer.about.step4Desc') || 'Sit back and watch as your social media presence grows.' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              {t('buyer.about.readyToGrow') || 'Ready to Grow?'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t('buyer.about.readyToGrowDesc') || 
                'Join thousands of satisfied customers and start growing your social media presence today.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild style={{ backgroundColor: primaryColor }}>
                <Link to="/services">{t('buyer.about.browseServices') || 'Browse Services'}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">{t('buyer.about.contactUs') || 'Contact Us'}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Navigation */}
      <div className="py-8 px-4 border-t border-border/50">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">{t('nav.home') || 'Home'}</Link>
          <Link to="/services" className="hover:text-foreground transition-colors">{t('nav.services') || 'Services'}</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">{t('nav.contact') || 'Contact'}</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">{t('nav.terms') || 'Terms'}</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">{t('nav.privacy') || 'Privacy'}</Link>
        </div>
      </div>
    </div>
  );
};

export default BuyerAbout;
