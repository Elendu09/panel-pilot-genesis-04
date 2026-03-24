import { lazy, Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { Footer } from "@/components/layout/Footer";
import { MainHomepageSchemas, FAQPageSchema } from "@/components/seo/JsonLdSchema";

const HowItWorksSection = lazy(() => import("@/components/sections/HowItWorksSection").then(m => ({ default: m.HowItWorksSection })));
const FeaturesGridSection = lazy(() => import("@/components/sections/FeaturesGridSection").then(m => ({ default: m.FeaturesGridSection })));
const WhyChooseUsSection = lazy(() => import("@/components/sections/WhyChooseUsSection").then(m => ({ default: m.WhyChooseUsSection })));
const TestimonialsSection = lazy(() => import("@/components/sections/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const PricingPreviewSection = lazy(() => import("@/components/sections/PricingPreviewSection").then(m => ({ default: m.PricingPreviewSection })));
const CTASection = lazy(() => import("@/components/sections/CTASection").then(m => ({ default: m.CTASection })));
const FAQSection = lazy(() => import("@/components/sections/FAQSection").then(m => ({ default: m.FAQSection })));
const CursorEffects = lazy(() => import("@/components/effects/CursorEffects"));

const Index = () => {
  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://homeofsmm.com';
  const [showEffects, setShowEffects] = useState(false);
  
  useEffect(() => {
    const timer = requestIdleCallback 
      ? requestIdleCallback(() => setShowEffects(true))
      : setTimeout(() => setShowEffects(true), 100);
    return () => {
      if (requestIdleCallback && typeof timer === 'number') {
        cancelIdleCallback(timer);
      } else {
        clearTimeout(timer as unknown as number);
      }
    };
  }, []);
  
  const seoTitle = "HOME OF SMM: Create and Manage Your Own SMM Panel";
  const seoDescription = "Launch your own SMM panel with Home of SMM. Get custom branding, automated orders, multiple payment gateways, and real-time analytics to grow revenue";
  const seoKeywords = "HOME OF SMM, SMM panel, create SMM panel, best SMM panel, SMM panel platform, SMM reseller panel, SMM panel software, white label SMM panel, SMM panel provider, how to create SMM panel, make money SMM panel, SMM business, social media marketing panel, SMM automation, multi-panel SMM";
  
  const faqData = [
    { question: "What is an SMM Panel?", answer: "An SMM panel is a web-based platform where resellers sell social media marketing services such as followers, likes, views, and comments. Panel owners set their own prices, connect service providers via API, and manage customers through a branded dashboard." },
    { question: "What is HOME OF SMM?", answer: "HOME OF SMM is the leading multi-panel platform for creating and managing your own SMM panels. We provide everything you need including custom branding, 200+ payment gateways, automated order processing, multi-language support, and real-time analytics so you can launch your SMM business in minutes." },
    { question: "How do I create my own SMM Panel?", answer: "Sign up for free on HOME OF SMM, choose your panel name and subdomain, customize your branding and theme, connect your preferred SMM service providers via API, configure payment methods, and start selling. The entire setup takes less than 5 minutes with zero coding required." },
    { question: "How do panel owners make money through SMM?", answer: "As an SMM panel owner, you buy services wholesale from providers and resell them at a markup to your customers. HOME OF SMM charges only 5% commission on completed orders with zero fees when you have no income. Many panel owners earn thousands monthly by building a loyal customer base." },
    { question: "What makes HOME OF SMM the best SMM Panel platform?", answer: "HOME OF SMM offers the most affordable pricing (start free, 5% commission only), multi-panel management, 200+ payment gateways, 10+ language localizations, custom domains, white-label branding, automated order processing, and dedicated support. No other platform matches this combination of features at this price." },
    { question: "How much does it cost to start an SMM Panel?", answer: "You can start completely free with HOME OF SMM. There are no setup fees, no monthly subscriptions required, and you only pay a 5% commission on completed orders. Upgrade to Basic ($5/mo) or Pro ($15/mo) for advanced features like custom domains and unlimited services." }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      {showEffects && (
        <Suspense fallback={null}>
          <CursorEffects />
        </Suspense>
      )}
      
      <MainHomepageSchemas />
      <FAQPageSchema faqs={faqData} />
      
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="HOME OF SMM" />
        <meta property="og:image" content={`${canonicalUrl}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@homeofsmm" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={`${canonicalUrl}/og-image.png`} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      </Helmet>
      
      <Navigation />
      <main role="main" aria-label="Main content" itemScope itemType="https://schema.org/WebPage">
        <HeroSection />
        <Suspense fallback={null}>
          <HowItWorksSection />
        </Suspense>
        <Suspense fallback={null}>
          <FeaturesGridSection />
        </Suspense>
        <Suspense fallback={null}>
          <WhyChooseUsSection />
        </Suspense>
        <Suspense fallback={null}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={null}>
          <PricingPreviewSection />
        </Suspense>
        <Suspense fallback={null}>
          <FAQSection />
        </Suspense>
        <Suspense fallback={null}>
          <CTASection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
