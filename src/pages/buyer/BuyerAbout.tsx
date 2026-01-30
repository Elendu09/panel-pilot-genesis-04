import { useTenant } from '@/hooks/useTenant';
import { useLanguage } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Shield, HeartHandshake, Clock, Users } from 'lucide-react';
import BuyerLayout from './BuyerLayout';

const BuyerAbout = () => {
  const { panel, loading } = useTenant();
  const { t } = useLanguage();

  const companyName = panel?.name || 'SMM Panel';
  const customBranding = panel?.custom_branding as any;
  const description = customBranding?.footerAbout || customBranding?.description || 
    t('buyer.about.defaultDescription') || 'We are a professional social media marketing service provider, helping businesses and individuals grow their online presence with high-quality, affordable services.';
  const primaryColor = customBranding?.primaryColor || panel?.primary_color || '#3B82F6';

  if (loading) {
    return (
      <BuyerLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </BuyerLayout>
    );
  }

  const whyChooseUs = [
    { icon: Zap, title: t('buyer.about.bullet1') || 'Instant Delivery', description: t('buyer.about.bullet1Desc') || 'Orders start processing within minutes' },
    { icon: Shield, title: t('buyer.about.bullet2') || 'Secure & Safe', description: t('buyer.about.bullet2Desc') || 'Your data and payments are protected' },
    { icon: HeartHandshake, title: t('buyer.about.bullet3') || '24/7 Support', description: t('buyer.about.bullet3Desc') || 'Our team is always ready to help' },
  ];

  return (
    <BuyerLayout>
      <Helmet>
        <title>{t('buyer.about.pageTitle') || 'About Us'} - {companyName}</title>
        <meta name="description" content={description} />
      </Helmet>

      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('buyer.about.title') || 'About'}{' '}
            <span style={{ color: primaryColor }}>{companyName}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('buyer.about.subtitle') || 'Your trusted partner for social media growth'}
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-10 border-0 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">
                {t('buyer.about.missionTitle') || 'Our Mission'}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('buyer.about.missionBody') || 
                'We believe everyone deserves a strong online presence. That\'s why we provide reliable, affordable services backed by real support. Whether you\'re a small business, influencer, or agency, we\'re here to help you achieve your social media goals.'}
            </p>
          </CardContent>
        </Card>

        {/* Why Choose Us */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-center mb-6">
            {t('buyer.about.whyTitle') || 'Why Choose Us?'}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {whyChooseUs.map((item, idx) => (
              <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-8 px-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
          <h3 className="text-xl font-bold mb-2">
            {t('buyer.about.ctaTitle') || 'Ready to Get Started?'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t('buyer.about.ctaSubtitle') || 'Join thousands of satisfied customers today'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild style={{ backgroundColor: primaryColor }}>
              <Link to="/auth?tab=signup">
                {t('buyer.about.signUpCta') || 'Create Account'}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">
                {t('buyer.about.contactCta') || 'Contact Us'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
};

export default BuyerAbout;
