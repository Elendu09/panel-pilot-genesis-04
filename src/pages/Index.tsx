import { lazy, Suspense, useEffect, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { Footer } from "@/components/layout/Footer";
import { MainHomepageSchemas, FAQPageSchema } from "@/components/seo/JsonLdSchema";

// Lazy load all below-the-fold sections with webpackChunkName for better caching
const PlatformFeaturesSection = lazy(() => import(/* webpackChunkName: "platform-features" */ "@/components/sections/PlatformFeaturesSection").then(m => ({ default: m.PlatformFeaturesSection })));
const StatsSection = lazy(() => import(/* webpackChunkName: "stats" */ "@/components/sections/StatsSection").then(m => ({ default: m.StatsSection })));
const FeaturesSection = lazy(() => import(/* webpackChunkName: "features" */ "@/components/sections/FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const TestimonialsSection = lazy(() => import(/* webpackChunkName: "testimonials" */ "@/components/sections/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const FAQSection = lazy(() => import(/* webpackChunkName: "faq" */ "@/components/sections/FAQSection").then(m => ({ default: m.FAQSection })));

// Defer cursor effects until after main content is interactive
const CursorEffects = lazy(() => import(/* webpackChunkName: "cursor-effects" */ "@/components/effects/CursorEffects"));


const Index = () => {
  const [showEffects, setShowEffects] = useState(false);
  
  // Defer cursor effects until after initial render
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
  
  // FAQ data for structured data
  const faqData = [
    { question: "What is an SMM Panel?", answer: "An SMM panel is a web-based platform where resellers sell social media marketing services such as followers, likes, views, and comments. Panel owners set their own prices, connect service providers via API, and manage customers through a branded dashboard." },
    { question: "What is HOME OF SMM?", answer: "HOME OF SMM is the leading platform for creating and managing your own SMM panel. We provide everything you need — custom branding, 200+ payment gateways, automated order processing, multi-language support, and real-time analytics — so you can launch your SMM business in minutes." },
    { question: "How do I create my own SMM Panel?", answer: "Sign up for free on HOME OF SMM, choose your panel name and subdomain, customize your branding and theme, connect your preferred SMM service providers via API, configure payment methods, and start selling. The entire setup takes less than 5 minutes with zero coding required." },
    { question: "How to make money through SMM?", answer: "As an SMM panel owner, you buy services wholesale from providers and resell them at a markup to your customers. HOME OF SMM charges only 5% commission on completed orders with zero fees when you have no income. Many panel owners earn thousands monthly by building a loyal customer base." },
    { question: "What makes HOME OF SMM the best SMM Panel platform?", answer: "HOME OF SMM offers the most affordable pricing (start free, 5% commission only), 200+ payment gateways, 10+ language localizations, custom domains, white-label branding, automated order processing, and dedicated support. No other platform matches this combination of features at this price." },
    { question: "How much does it cost to start an SMM Panel?", answer: "You can start completely free with HOME OF SMM. There are no setup fees, no monthly subscriptions required, and you only pay a 5% commission on completed orders. Upgrade to Basic ($5/mo) or Pro ($15/mo) for advanced features like custom domains and unlimited services." }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      {/* Defer cursor effects to reduce TBT */}
      {showEffects && (
        <Suspense fallback={null}>
          <CursorEffects />
        </Suspense>
      )}
      
      {/* JSON-LD Structured Data only - no Helmet, SEO lives in index.html */}
      <MainHomepageSchemas />
      <FAQPageSchema faqs={faqData} />
      
      <Navigation />
      <main role="main" aria-label="Main content" itemScope itemType="https://schema.org/WebPage">
        <HeroSection />
        <Suspense fallback={null}>
          <PlatformFeaturesSection />
        </Suspense>
        <Suspense fallback={null}>
          <StatsSection />
        </Suspense>
        <Suspense fallback={null}>
          <FeaturesSection />
        </Suspense>
        <Suspense fallback={null}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={null}>
          <FAQSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
