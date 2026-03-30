import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { LegalTableOfContents } from "@/components/buyer/LegalTableOfContents";
import { cn } from "@/lib/utils";

const sections = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "platform-description", title: "Platform Description" },
  { id: "user-responsibilities", title: "User Responsibilities" },
  { id: "subscriptions", title: "Subscriptions & Billing" },
  { id: "trial", title: "Free Trial Policy" },
  { id: "platform-availability", title: "Platform Availability" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "termination", title: "Termination" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact Information" },
];

const Terms = () => {
  const [activeSection, setActiveSection] = useState("acceptance");

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
        <title>Terms of Service - Home of SMM</title>
        <meta name="description" content="Terms of service for the Home of SMM panel creation and management platform." />
        <link rel="canonical" href="https://homeofsmm.com/terms" />
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
                  By accessing and using Home of SMM, you accept and agree to be bound by these Terms of Service.
                  Home of SMM is a platform-as-a-service (PaaS) that enables entrepreneurs, businesses, and individuals
                  to create, manage, and operate their own Social Media Marketing (SMM) panels.
                  If you do not agree to these terms, please do not use this platform.
                </p>
              </section>

              <section id="platform-description" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">2. Platform Description</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Home of SMM provides the technology infrastructure for you to build and run your own SMM panel business.
                  We are not a reseller of SMM services — we provide the tools for you to create your own storefront.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Panel Creation</strong> — Set up your own branded SMM panel with custom domain, themes, and branding</li>
                  <li><strong>Service Management</strong> — Import, configure, and price services from your own providers</li>
                  <li><strong>Customer Management</strong> — Manage buyer accounts, balances, and order fulfillment on your panel</li>
                  <li><strong>Payment Integration</strong> — Connect your own payment gateways to accept payments from your customers</li>
                  <li><strong>Analytics & Reporting</strong> — Track orders, revenue, and customer activity across your panel</li>
                  <li><strong>Multi-Panel Support</strong> — Create and manage multiple panels from a single account (based on subscription tier)</li>
                </ul>
              </section>

              <section id="user-responsibilities" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  As a panel owner on Home of SMM, you are responsible for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>You must be at least 18 years old to use our platform</li>
                  <li>You are responsible for maintaining the security of your account and panel credentials</li>
                  <li>You are solely responsible for the services you offer to your customers through your panel</li>
                  <li>You must ensure your panel operations comply with all applicable laws in your jurisdiction</li>
                  <li>You are responsible for handling customer disputes, refunds, and support on your own panel</li>
                  <li>You must not use the platform for any unlawful, fraudulent, or prohibited purposes</li>
                  <li>You agree to provide accurate information during registration and panel setup</li>
                </ul>
              </section>

              <section id="subscriptions" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">4. Subscriptions & Billing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Home of SMM operates on a subscription-based model with the following tiers:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Free Plan</strong> — 1 panel, basic features, subdomain only</li>
                  <li><strong>Basic Plan ($5/mo)</strong> — Up to 3 panels, custom domain, full analytics, API access</li>
                  <li><strong>Pro Plan ($15/mo)</strong> — Up to 5 panels, advanced features, priority support, white-label branding</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  All payments are processed through trusted third-party payment providers. Subscriptions renew automatically
                  unless cancelled. A 5% platform commission applies to orders processed through your panel.
                  Refunds for subscription fees are provided only in cases of service unavailability on our end.
                </p>
              </section>

              <section id="trial" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">5. Free Trial Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  New users selecting a paid plan (Basic or Pro) receive a 3-day free trial. During the trial period,
                  you have full access to all features of your selected plan. If payment is not made before the trial expires,
                  your panel will be locked and downgraded to the Free plan. You may unlock your panel at any time by
                  subscribing through the Billing page. No charges are incurred during the trial period.
                </p>
              </section>

              <section id="platform-availability" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">6. Platform Availability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We strive to maintain 99.9% uptime for the Home of SMM platform. However, we do not guarantee
                  uninterrupted service. Scheduled maintenance, updates, and unforeseen technical issues may cause
                  temporary downtime. We will make reasonable efforts to notify users of planned maintenance in advance.
                </p>
              </section>

              <section id="liability" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Home of SMM provides the technology platform only. We are not responsible for the services you sell
                  through your panel, the quality of third-party providers you connect to, or any disputes between you
                  and your customers. Home of SMM shall not be liable for any direct, indirect, incidental, or
                  consequential damages arising from the use of our platform, including loss of revenue, data, or
                  business opportunities.
                </p>
              </section>

              <section id="termination" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate your account and panels if you violate these terms,
                  engage in fraudulent activity, or fail to pay subscription fees. You may cancel your subscription
                  and delete your panels at any time through your dashboard. Upon termination, your panel data may
                  be retained for up to 30 days before permanent deletion.
                </p>
              </section>

              <section id="changes" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon
                  posting on the platform. We will notify users of significant changes via email or platform notification.
                  Continued use constitutes acceptance of updated terms.
                </p>
              </section>

              <section id="contact" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, please contact our support team at{' '}
                  <a href="mailto:support@homeofsmm.com" className="text-primary hover:underline">support@homeofsmm.com</a>.
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
