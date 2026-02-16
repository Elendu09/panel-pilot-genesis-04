import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { LegalTableOfContents } from "@/components/buyer/LegalTableOfContents";

const sections = [
  { id: "info-collect", title: "Information We Collect" },
  { id: "how-use", title: "How We Use Your Information" },
  { id: "info-sharing", title: "Information Sharing" },
  { id: "data-security", title: "Data Security" },
  { id: "cookies", title: "Cookies and Tracking" },
  { id: "your-rights", title: "Your Rights" },
  { id: "children", title: "Children's Privacy" },
  { id: "policy-changes", title: "Changes to This Policy" },
  { id: "contact-us", title: "Contact Us" },
];

const Privacy = () => {
  const [activeSection, setActiveSection] = useState("info-collect");

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
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-center py-4">Privacy Policy</h1>
            
            {/* Mobile TOC */}
            <div className="lg:hidden mb-8">
              <LegalTableOfContents
                sections={sections}
                activeSection={activeSection}
                onSectionClick={scrollToSection}
              />
            </div>
            
            <div className="prose prose-lg max-w-none space-y-8">
              <section id="info-collect" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Account information (email, username, password)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Service usage data and order history</li>
                  <li>Communication records when you contact support</li>
                </ul>
              </section>

              <section id="how-use" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>To provide and maintain our services</li>
                  <li>To process payments and fulfill orders</li>
                  <li>To communicate with you about your account and services</li>
                  <li>To improve our platform and user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section id="info-sharing" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>With service providers who help us operate our platform</li>
                  <li>When required by law or to protect our rights</li>
                  <li>With your explicit consent</li>
                </ul>
              </section>

              <section id="data-security" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized access,
                  alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
                </p>
              </section>

              <section id="cookies" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to enhance your experience on our platform. You can control
                  cookie settings through your browser preferences.
                </p>
              </section>

              <section id="your-rights" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Data portability where applicable</li>
                </ul>
              </section>

              <section id="children" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not intended for children under 18. We do not knowingly collect personal information
                  from children under 18.
                </p>
              </section>

              <section id="policy-changes" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                  the new policy on this page.
                </p>
              </section>

              <section id="contact-us" className="scroll-mt-[100px]">
                <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy, please contact our support team through the platform.
                </p>
              </section>
            </div>
          </div>

          {/* Desktop TOC Sidebar */}
          <LegalTableOfContents
            sections={sections}
            activeSection={activeSection}
            onSectionClick={scrollToSection}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;