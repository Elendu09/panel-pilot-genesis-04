import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Rocket, 
  UserPlus, 
  CreditCard, 
  Globe, 
  Palette, 
  Plug, 
  ArrowRight,
  CheckCircle2,
  Lightbulb
} from "lucide-react";

const onboardingSteps = [
  {
    step: 1,
    title: "Create Your Account",
    icon: UserPlus,
    description: "Sign up with your email address. You'll receive a verification email to confirm your account. Once verified, you'll be guided through the panel setup wizard automatically.",
    tip: "Use a business email for a professional appearance in your panel."
  },
  {
    step: 2,
    title: "Name Your Panel",
    icon: Rocket,
    description: "Choose a unique name for your SMM panel. This will be your brand identity visible to all your customers. The name is used for your subdomain (e.g., yourpanel.smmpilot.online) and can be changed later.",
    tip: "Keep it short, memorable, and relevant to your niche."
  },
  {
    step: 3,
    title: "Choose a Plan",
    icon: CreditCard,
    description: "Select a subscription plan that fits your needs. Plans differ in features, commission rates, and limits. You can start with a trial and upgrade anytime from your Billing page.",
    tip: "Start with the Basic plan to test the platform, then upgrade as you grow."
  },
  {
    step: 4,
    title: "Connect a Provider",
    icon: Plug,
    description: "Link an upstream SMM provider by entering their API URL and API key. The system verifies the connection, syncs available services, and lets you import them with custom pricing in one click.",
    tip: "You can connect unlimited providers and switch between them anytime."
  },
  {
    step: 5,
    title: "Set Up Your Domain",
    icon: Globe,
    description: "Connect your own custom domain (e.g., yourdomain.com) or use the free subdomain provided. The setup wizard guides you through DNS configuration and automatically provisions an SSL certificate.",
    tip: "DNS propagation can take up to 48 hours. Use the 'Verify DNS' button to check progress."
  },
  {
    step: 6,
    title: "Configure Branding",
    icon: Palette,
    description: "Customize your panel's look with the Storefront Builder. Choose from 7+ pre-built templates, set your color palette, upload logo & favicon, select fonts, and preview everything live before publishing.",
    tip: "Use the live preview to see exactly how your storefront looks to customers."
  },
];

const GettingStarted = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <Badge variant="secondary" className="mb-3">Documentation</Badge>
          <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
          <p className="text-lg text-muted-foreground">
            Set up your SMM panel in minutes with our guided 6-step onboarding wizard. No technical knowledge required.
          </p>
        </div>

        {/* Overview Card */}
        <Card className="mb-10 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">How It Works</h2>
                <p className="text-muted-foreground">
                  When you create your account, the platform walks you through a step-by-step onboarding wizard. 
                  Each step is optional and can be completed later from your dashboard. Your panel goes live as soon 
                  as you finish setup — customers can start placing orders immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          {onboardingSteps.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.step} className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {item.step}
                    </div>
                    <Icon className="w-5 h-5 text-primary" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-muted-foreground">{item.description}</p>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Tip:</span> {item.tip}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* What's Next */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Once your panel is live, explore these key areas from your dashboard:
            </p>
            <ul className="space-y-2">
              {[
                "Import services from providers and set your markup pricing",
                "Configure payment methods for your customers",
                "Customize your storefront design with the Storefront Builder",
                "Create blog posts to boost SEO and attract organic traffic",
                "Set up promo codes and coupons to drive sales",
                "Add team members with role-based permissions",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link to="/docs">Browse All Documentation</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/docs/api">API Reference</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/tutorial">Platform Tutorial</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GettingStarted;
