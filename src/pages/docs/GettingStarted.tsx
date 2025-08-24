import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

const GettingStarted = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Getting Started</h1>
        <p className="text-xl text-muted-foreground">Quick start guide coming soon...</p>
      </div>
      <Footer />
    </div>
  );
};

export default GettingStarted;