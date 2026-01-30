import { useTenant } from '@/hooks/useTenant';
import { useLanguage } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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

      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          {t('buyer.about.aboutTitle') || 'About'} <span style={{ color: primaryColor }}>{companyName}</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          {description}
        </p>
        <Button asChild style={{ backgroundColor: primaryColor }}>
          <Link to="/contact">
            {t('buyer.about.contactUs') || 'Contact Us'}
          </Link>
        </Button>
      </div>
    </BuyerLayout>
  );
};

export default BuyerAbout;
