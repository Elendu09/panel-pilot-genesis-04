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
import { MainHomepageSchemas, FAQPageSchema } from "@/components/seo/JsonLdSchema";

const Index = () => {
  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://homeofsmm.com';
  
  // SEO-optimized title and description with proper pixel lengths
  const seoTitle = "HOME OF SMM - #1 SMM Panel Platform | Create Your Own SMM Panel";
  const seoDescription = "Create and manage your own SMM panel with HOME OF SMM. Start your social media marketing business with custom branding, automated orders, multiple payment gateways, and powerful analytics. Join 10,000+ panel owners today. Best SMM panel script 2025.";
  const seoKeywords = "SMM panel, SMM panel script, create SMM panel, best SMM panel, SMM reseller panel, SMM panel software, social media marketing panel, white label SMM panel, cheapest SMM panel, SMM panel provider, buy SMM panel, SMM panel 2025, instagram followers panel, youtube views panel, tiktok likes panel, SMM services, social media marketing, SMM automation";
  
  // FAQ data for structured data
  const faqData = [
    { question: "What is an SMM panel and how does it work?", answer: "An SMM panel is a social media marketing platform that allows users to purchase social media services like followers, likes, views, and comments. Our white-label solution lets you create and manage your own branded SMM panel with custom domains, themes, and complete control over pricing and services." },
    { question: "Is it legal to use an SMM panel for social media growth?", answer: "Yes, SMM panels are legal business tools. However, it's important to comply with each social media platform's terms of service and local regulations. We recommend transparency with your customers about the nature of the services and ensuring all services are delivered ethically." },
    { question: "How much can I earn with my SMM panel?", answer: "Earnings vary based on your marketing efforts, pricing strategy, and customer base. Our platform charges only 5% commission on completed orders with zero fees if you have no income. Many successful panel owners earn thousands monthly by building a loyal customer base." },
    { question: "What payment methods do you support?", answer: "We support 200+ payment systems including PayPal, Stripe, Paystack, Korapay, Flutterwave, PerfectMoney, Cryptomus, USDT, and bank transfers for multiple countries." },
    { question: "Can I use my own domain name?", answer: "Absolutely! You can connect your own custom domain or use a free subdomain (yourpanel.homeofsmm.com). We provide SSL certificates and handle all the technical setup for you." },
    { question: "Do you provide customer support?", answer: "Yes, we provide comprehensive support for panel owners including setup assistance, technical support, and business guidance. Your customers will contact you directly for support, but we're here to help you succeed." }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <CursorEffects />
      
      {/* JSON-LD Structured Data */}
      <MainHomepageSchemas />
      <FAQPageSchema faqs={faqData} />
      
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="HOME OF SMM" />
        <meta property="og:image" content={`${canonicalUrl}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@homeofsmm" />
        <meta name="twitter:creator" content="@homeofsmm" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={`${canonicalUrl}/og-image.png`} />
        
        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="HOME OF SMM" />
        <meta name="publisher" content="HOME OF SMM" />
        <meta name="copyright" content="HOME OF SMM" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        
        {/* Geo Tags */}
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        
        {/* Mobile optimization */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HOME OF SMM" />
      </Helmet>
      
      <Navigation />
      <main role="main" aria-label="Main content" itemScope itemType="https://schema.org/WebPage">
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
