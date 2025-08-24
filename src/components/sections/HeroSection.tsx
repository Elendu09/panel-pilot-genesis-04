import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ServiceShowcase } from "./ServiceShowcase";
import { AnimatedText } from "@/components/ui/animated-text";
export const HeroSection = () => {
  return <>
      <section className="relative min-h-screen bg-gradient-hero overflow-hidden perspective-1000">
        {/* Enhanced 3D Background Pattern */}
        <div className="absolute inset-0 opacity-10 mx-[10px] py-[5px] px-[5px] my-[10px]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-float-medium"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-primary/50 rounded-full blur-2xl animate-rotate-slow transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Floating 3D Elements & Social Media Bubbles */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Original floating elements */}
          <div className="absolute top-20 left-10 w-4 h-4 bg-primary/30 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-primary/20 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-primary/40 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-20 right-10 w-5 h-5 bg-primary/25 rounded-full animate-float"></div>
          
          {/* Additional social media style bubbles */}
          <div className="absolute top-32 left-1/4 w-8 h-8 bg-primary/15 rounded-full animate-pulse"></div>
          <div className="absolute top-60 right-1/4 w-5 h-5 bg-primary/25 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-60 left-1/3 w-6 h-6 bg-primary/20 rounded-full animate-float"></div>
          <div className="absolute bottom-32 right-1/3 w-4 h-4 bg-primary/35 rounded-full animate-float-medium"></div>
          <div className="absolute top-1/2 left-16 w-3 h-3 bg-primary/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-16 w-7 h-7 bg-primary/15 rounded-full animate-float-slow"></div>
          <div className="absolute top-72 left-1/2 w-4 h-4 bg-primary/25 rounded-full animate-float"></div>
          <div className="absolute bottom-72 right-1/2 w-5 h-5 bg-primary/20 rounded-full animate-float-medium"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 pt-32">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-card border border-border rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Automate Your Business</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Create your own
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                smm panel
              </span>
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow text-lg px-8 py-6 rounded-full">
                <Link to="/register">
                  Create panel <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10 rounded-full">
                Best SMM services
              </Button>
            </div>
          </div>
        </div>

        {/* Animated Text Section */}
        <div className="container mx-auto px-4 relative z-10 -mt-8 mb-4">
          <AnimatedText
            phrases={[
              { static: "build an smm panel", bold: "for profit" },
              { static: "build an smm panel", bold: "for clients" },
              { static: "build an smm panel", bold: "with ease" }
            ]}
          />
        </div>

        {/* Service Showcase */}
        <ServiceShowcase />
      </section>
    </>;
};