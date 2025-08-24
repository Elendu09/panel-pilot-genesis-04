import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Star, Globe, Shield, Zap } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export const ThemeTwo = () => {
  const features = [
    {
      icon: CheckCircle,
      title: "Verified Services",
      description: "All our services are tested and verified for maximum quality and safety."
    },
    {
      icon: Zap,
      title: "Instant Delivery",
      description: "Most orders start within 0-1 hour and complete within 24-48 hours."
    },
    {
      icon: Shield,
      title: "Money Back Guarantee",
      description: "100% refund if we can't deliver what we promise. Your satisfaction is guaranteed."
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "We serve customers worldwide with localized services and 24/7 multilingual support."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Digital Marketer",
      content: "This platform has revolutionized how I manage my clients' social media growth. The quality is outstanding!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Content Creator",
      content: "Fast delivery, great prices, and excellent customer service. I've been using this for over a year now.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Small Business Owner",
      content: "Helped me grow my business Instagram from 500 to 50K followers in just 6 months. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-left">
              <Badge variant="outline" className="mb-6 border-primary text-primary">
                Professional SMM Services
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Professional Social Media
                <span className="text-primary"> Marketing</span> Solutions
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Elevate your brand with our premium social media marketing services. 
                Trusted by 50,000+ businesses worldwide for authentic growth and engagement.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/services">
                    Get Started <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link to="/register">
                    View Pricing
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No Password Required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Money Back Guarantee
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  24/7 Support
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="relative">
                <Card className="p-8 bg-card border-primary/20 shadow-2xl">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">Quick Order</h3>
                    <p className="text-muted-foreground">Start your growth journey</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span>Instagram Followers</span>
                      <span className="font-semibold">$0.01/1K</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span>YouTube Views</span>
                      <span className="font-semibold">$0.05/1K</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                      <span>TikTok Likes</span>
                      <span className="font-semibold">$0.02/1K</span>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full mt-6">
                    <Link to="/new-order">
                      Place Order Now
                    </Link>
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide the most reliable and effective social media marketing services in the industry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center bg-card hover:shadow-lg transition-all hover-scale">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">What Our Clients Say</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied customers who trust our services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-card hover:shadow-lg transition-all">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-glow">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Grow Your Social Media?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and start growing your social media presence today
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link to="/register">
              Get Started Now <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};