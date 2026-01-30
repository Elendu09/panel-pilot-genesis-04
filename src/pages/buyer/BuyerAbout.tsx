import { useTenant } from '@/hooks/useTenant';
import { useLanguage } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Zap, Shield, Users, MessageSquare } from 'lucide-react';
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

  return (
    <BuyerLayout>
      <Helmet>
        <title>{t('buyer.footer.about') || 'About Us'} - {companyName}</title>
        <meta name="description" content={description} />
      </Helmet>

      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Simple Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('buyer.about.aboutTitle') || 'About'} <span style={{ color: primaryColor }}>{companyName}</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
            {description}
          </p>
        </div>

        {/* Why Choose Us - Simple 3 Bullets */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { 
              icon: Zap, 
              title: t('buyer.about.instantDelivery') || 'Instant Delivery', 
              desc: t('buyer.about.instantDeliveryShort') || 'Fast order processing'
            },
            { 
              icon: Shield, 
              title: t('buyer.about.safeSecure') || 'Safe & Secure', 
              desc: t('buyer.about.safeSecureShort') || 'Your data is protected'
            },
            { 
              icon: Users, 
              title: t('buyer.about.support247') || '24/7 Support', 
              desc: t('buyer.about.support247Short') || 'Always here to help'
            },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-xl bg-card border border-border text-center hover:border-primary/50 transition-colors"
            >
              <div 
                className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <item.icon className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center p-8 rounded-2xl bg-muted/30 border border-border">
          <MessageSquare className="w-10 h-10 mx-auto mb-4" style={{ color: primaryColor }} />
          <h2 className="text-xl font-semibold mb-2">
            {t('buyer.about.haveQuestions') || 'Have Questions?'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t('buyer.about.contactUsDesc') || "We're always happy to help. Reach out to our support team."}
          </p>
          <Button asChild style={{ backgroundColor: primaryColor }}>
            <Link to="/contact">
              {t('buyer.about.contactUs') || 'Contact Us'}
            </Link>
          </Button>
        </div>
      </div>
    </BuyerLayout>
  );
};

export default BuyerAbout;
