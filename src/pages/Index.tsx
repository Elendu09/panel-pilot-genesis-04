import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { PlatformFeaturesSection } from "@/components/sections/PlatformFeaturesSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { Footer } from "@/components/layout/Footer";
import { CursorEffects } from "@/components/effects/CursorEffects";

const Index = () => {
  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // SEO-optimized title and description with proper pixel lengths
  const seoTitle = "HOME OF SMM - #1 SMM Panel Platform for Resellers";
  const seoDescription = "Create and manage your own SMM panel with HOME OF SMM. Start your social media marketing business with custom branding, automated orders, multiple payment gateways, and powerful analytics. Join 10,000+ panel owners today.";
  
  return (
    <div className="min-h-screen bg-background">
      <CursorEffects />
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content="SMM panel, social media marketing, instagram followers, youtube views, tiktok likes, SMM reseller panel, create smm panel, smm panel script, smm panel software" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="HOME OF SMM" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="HOME OF SMM" />
      </Helmet>
      <Navigation />
      <main role="main" aria-label="Main content">
        <HeroSection />
        <PlatformFeaturesSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
