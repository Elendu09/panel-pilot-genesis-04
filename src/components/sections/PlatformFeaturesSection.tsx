import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, Globe, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export const PlatformFeaturesSection = () => {
  const features = [
    {
      title: "Powered by zero-knowledge",
      description: "SMMPilot runs a sophisticated panel management system that orchestrates multiple providers to work together as one unified platform.",
      icon: Zap,
      gradient: "from-primary/20 to-primary/5"
    },
    {
      title: "Ultra-high performance",
      description: "The platform gets more powerful with every panel that connects, creating a network purpose-built for social media marketing.",
      icon: BarChart3,
      gradient: "from-accent/20 to-accent/5"
    },
    {
      title: "Made for mass adoption", 
      description: "The SMMPilot platform makes it easy for anyone to create, manage, and scale their own SMM panel business via our web app.",
      icon: Users,
      gradient: "from-secondary/20 to-secondary/5"
    },
    {
      title: "Global reach",
      description: "Connect with providers worldwide and offer services to customers across all major social media platforms and regions.",
      icon: Globe,
      gradient: "from-primary/15 to-primary/5"
    }
  ];

  return (
    <section className="py-24 bg-card/50 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                A World of
                <br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  SMM Possibilities
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                A new era of social media marketing requires a new approach to panel management. The SMMPilot platform concentrates the world's SMM providers into a single, 100% scalable infrastructure.
              </p>
              <Button 
                variant="outline" 
                className="border-primary/30 hover:bg-primary/10"
                asChild
              >
                <Link to="/docs">
                  Platform Docs <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group`}
                >
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};