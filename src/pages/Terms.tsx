import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { LegalTableOfContents } from "@/components/buyer/LegalTableOfContents";
import { cn } from "@/lib/utils";

const sections = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "service-description", title: "Service Description" },
  { id: "user-responsibilities", title: "User Responsibilities" },
  { id: "payment-refunds", title: "Payment and Refunds" },
  { id: "service-quality", title: "Service Quality" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact Information" },
];

const Terms = () => {
  const [activeSection, setActiveSection] = useState("acceptance");

  // IntersectionObserver for accurate active section tracking
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(section.id);
              }
            });
          },
          {
            rootMargin: '-100px 0px -60% 0px',
            threshold: 0,
          }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service - SMMPilot</title>
        <meta name="description" content="Terms of service for SMMPilot platform." />
        <link rel="canonical" href="https://smmpilot.online/terms" />
      </Helmet>
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center py-4">Terms of Service</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0 order-2 lg:order-1">
            
            <div className="prose prose-lg max-w-none space-y-8">
              <section id="acceptance" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using SMMPilot, you accept and agree to be bound by these Terms of Service. 
                  SMMPilot is a social media marketing (SMM) platform that enables panel owners and end users to purchase 
                  engagement services such as likes, followers, views, comments, and shares across major social media platforms.
                  If you do not agree, please do not use this service.
                </p>
              </section>

              <section id="service-description" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  SMMPilot acts as an intermediary between SMM service providers and end users. Our platform allows panel owners to create 
                  and manage their own SMM storefronts, connect to third-party providers, and offer services to their customers.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Social Media Growth</strong> — Followers, subscribers, and page likes for Instagram, TikTok, YouTube, Facebook, Twitter/X, Telegram, and more</li>
                  <li><strong>Engagement Services</strong> — Likes, views, comments, shares, saves, and reactions</li>
                  <li><strong>Content Promotion</strong> — Video views, story views, reel plays, and impression boosts</li>
                  <li><strong>Analytics & Tracking</strong> — Real-time order tracking, delivery status, and performance insights</li>
                </ul>
              </section>

              <section id="user-responsibilities" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>You must be at least 18 years old to use our services</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You must provide valid, publicly accessible social media URLs for orders</li>
                  <li>You must only use accounts you own or are authorized to manage</li>
                  <li>You agree not to use the service for any unlawful or prohibited purposes</li>
                  <li>You understand that services are delivered gradually and may take time to complete</li>
                </ul>
              </section>

              <section id="payment-refunds" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">4. Payment and Refunds</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All payments are processed securely through trusted payment providers. The platform operates on a prepaid balance system. 
                  Refunds are provided only when services cannot be delivered due to technical issues on our end. 
                  No refunds will be provided for completed or partially delivered services. Minor count drops due to platform algorithms 
                  are not considered service failures.
                </p>
              </section>

              <section id="service-quality" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">5. Service Quality</h2>
                <p className="text-muted-foreground leading-relaxed">
                  While we strive to provide high-quality services, we cannot guarantee specific results or timelines. 
                  Delivery depends on third-party provider capacity and social media platform algorithms. 
                  Some services include drop protection or refill guarantees — check individual service descriptions for details.
                </p>
              </section>

              <section id="liability" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  SMMPilot shall not be liable for any direct, indirect, incidental, or consequential damages arising from 
                  the use of our services, including but not limited to account suspensions by third-party platforms, 
                  follower/like drops, or delivery delays caused by external factors.
                </p>
              </section>

              <section id="changes" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon
                  posting on the platform. Continued use constitutes acceptance of updated terms.
                </p>
              </section>

              <section id="contact" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, please contact our support team through the platform dashboard.
                </p>
              </section>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <LegalTableOfContents
              sections={sections}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;