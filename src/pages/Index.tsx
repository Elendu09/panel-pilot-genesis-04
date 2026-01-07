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
  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://homeofsmm.com';
  
  return (
    <div className="min-h-screen bg-background">
      <CursorEffects />
      <Helmet>
        <title>HOME OF SMM - #1 SMM Panel Platform | Create Your Own SMM Business</title>
        <meta 
          name="description" 
          content="HOME OF SMM is the leading white-label SMM panel platform. Create and manage your own social media marketing business with custom branding, multiple payment methods, powerful analytics, and 24/7 support. Join thousands of successful SMM resellers today." 
        />
        <meta 
          name="keywords" 
          content="SMM panel, SMM reseller panel, social media marketing, instagram followers, youtube views, tiktok likes, create SMM panel, white-label SMM panel, SMM panel platform, social media services, buy followers, SMM business, social media growth"
        />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="152x152" href="/favicon.ico" />
        <meta property="og:title" content="HOME OF SMM - #1 SMM Panel Platform | Create Your Own SMM Business" />
        <meta 
          property="og:description" 
          content="HOME OF SMM is the leading white-label SMM panel platform. Create and manage your own social media marketing business with custom branding, multiple payment methods, and powerful analytics." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HOME OF SMM - #1 SMM Panel Platform | Create Your Own SMM Business" />
        <meta name="twitter:description" content="Create and manage your own SMM panel with HOME OF SMM. The most advanced white-label SMM panel platform." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <Navigation />
      <main>
        <HeroSection />
        
        {/* SEO Content Section - Visible text for search engines and users */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <article className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Why Choose HOME OF SMM for Your Social Media Marketing Business?
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 text-muted-foreground">
                <p>
                  HOME OF SMM is the premier white-label SMM panel platform designed for entrepreneurs and businesses looking to enter the social media marketing industry. Our comprehensive platform enables you to create, customize, and manage your own SMM reseller panel with ease, offering services for Instagram, YouTube, TikTok, Twitter, Telegram, and many more social media platforms.
                </p>
                <p>
                  With our advanced SMM panel solution, you gain access to premium features including real-time order tracking, automated service delivery, multiple payment gateway integrations (PayPal, Stripe, cryptocurrency), and detailed analytics dashboards. Whether you're starting a new SMM business or scaling an existing one, HOME OF SMM provides all the tools you need for success.
                </p>
                <h3 className="text-xl font-semibold text-foreground mt-6">
                  Key Features of Our SMM Panel Platform
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Custom Branding:</strong> Full white-label solution with your own logo, colors, and domain name</li>
                  <li><strong>Multiple Payment Methods:</strong> Accept payments via PayPal, Stripe, credit cards, and cryptocurrency</li>
                  <li><strong>Instant Delivery:</strong> Automated order processing with real-time status updates</li>
                  <li><strong>24/7 Support:</strong> Dedicated customer support team available around the clock</li>
                  <li><strong>Secure Platform:</strong> Enterprise-grade security protecting your business and customers</li>
                  <li><strong>Analytics Dashboard:</strong> Track sales, orders, and revenue with detailed reporting</li>
                </ul>
                <p>
                  Join thousands of successful SMM resellers who trust HOME OF SMM to power their social media marketing businesses. Our platform handles everything from service delivery to customer management, allowing you to focus on growing your business and maximizing profits.
                </p>
              </div>
            </article>
          </div>
        </section>

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