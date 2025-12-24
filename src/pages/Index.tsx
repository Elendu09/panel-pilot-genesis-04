import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { PlatformFeaturesSection } from "@/components/sections/PlatformFeaturesSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>SMMPilot - Professional SMM Panel Platform</title>
        <meta 
          name="description" 
          content="Create and manage your own SMM panel with SMMPilot. Offer social media marketing services with custom branding, multiple payment methods, and powerful analytics." 
        />
        <meta 
          name="keywords" 
          content="SMM panel, social media marketing, instagram followers, youtube views, tiktok likes, SMM reseller panel"
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="SMMPilot - Professional SMM Panel Platform" />
        <meta 
          property="og:description" 
          content="Create and manage your own SMM panel with SMMPilot. Offer social media marketing services with custom branding, multiple payment methods, and powerful analytics." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SMMPilot - Professional SMM Panel Platform" />
        <meta name="twitter:description" content="Create and manage your own SMM panel with SMMPilot." />
      </Helmet>
      <Navigation />
      <main>
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
