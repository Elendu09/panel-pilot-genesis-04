import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
const Terms = () => {
  return <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center mx-0 my-[15px] py-[15px]">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using our platform, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform provides SMM (Social Media Marketing) panel services that allow users to purchase social media 
              engagement services. We act as an intermediary between service providers and end users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must be at least 18 years old to use our services</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree not to use the service for any unlawful purposes</li>
              <li>You understand that services may take time to complete</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Payment and Refunds</h2>
            <p className="text-muted-foreground leading-relaxed">
              All payments are processed securely. Refunds are provided only in cases where services cannot be delivered
              due to technical issues on our end. No refunds will be provided for delivered services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Service Quality</h2>
            <p className="text-muted-foreground leading-relaxed">
              While we strive to provide high-quality services, we cannot guarantee specific results or timelines.
              Service delivery depends on various factors including platform algorithms and external providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform shall not be liable for any direct, indirect, incidental, or consequential damages
              arising from the use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon
              posting on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact our support team through the platform.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>;
};
export default Terms;