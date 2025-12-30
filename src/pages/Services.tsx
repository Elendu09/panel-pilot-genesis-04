import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ComingSoon } from "@/components/ui/coming-soon";

const Services = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Service Tools - HomeOfSMM</title>
        <meta 
          name="description" 
          content="Powerful service tools for your SMM panel. Coming soon with advanced features to boost your social media marketing business." 
        />
      </Helmet>
      <Navigation />
      <div className="flex-1 flex items-center justify-center">
        <ComingSoon 
          title="Service Tools"
          description="We're building powerful service tools to help you manage and optimize your SMM services. Stay tuned for advanced analytics, bulk operations, and more."
          estimatedTime="Q1 2026"
          showBackButton={true}
          backTo="/"
        />
      </div>
      <Footer />
    </div>
  );
};

export default Services;
