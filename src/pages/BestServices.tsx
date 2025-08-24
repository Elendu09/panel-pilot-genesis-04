
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, TrendingUp, Shield, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const BestServices = () => {
  const services = [
    {
      category: "Instagram",
      icon: "📸",
      services: [
        { name: "Instagram Followers", price: "$2.50", per: "1000", rating: 4.9, features: ["High Quality", "Real Users", "Fast Delivery"] },
        { name: "Instagram Likes", price: "$1.20", per: "1000", rating: 4.8, features: ["Instant Start", "Non-Drop", "24/7 Support"] },
        { name: "Instagram Views", price: "$0.80", per: "1000", rating: 4.7, features: ["Real Views", "Safe Method", "Quick Delivery"] }
      ]
    },
    {
      category: "YouTube",
      icon: "🎥",
      services: [
        { name: "YouTube Subscribers", price: "$12.00", per: "1000", rating: 4.9, features: ["Real Accounts", "Permanent", "Safe"] },
        { name: "YouTube Views", price: "$1.50", per: "1000", rating: 4.8, features: ["High Retention", "Geo-Targeted", "Fast"] },
        { name: "YouTube Likes", price: "$8.00", per: "1000", rating: 4.6, features: ["Real Users", "Non-Drop", "Quick Start"] }
      ]
    },
    {
      category: "TikTok",
      icon: "🎵",
      services: [
        { name: "TikTok Followers", price: "$4.00", per: "1000", rating: 4.8, features: ["Active Users", "Fast Delivery", "High Quality"] },
        { name: "TikTok Likes", price: "$1.80", per: "1000", rating: 4.7, features: ["Real Engagement", "Quick Start", "Reliable"] },
        { name: "TikTok Views", price: "$0.60", per: "1000", rating: 4.9, features: ["High Retention", "Safe Method", "24/7 Support"] }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Best SMM Services
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our premium social media marketing services with the highest quality and best prices in the market
          </p>
        </div>

        {/* Service Categories */}
        <div className="space-y-8">
          {services.map((category) => (
            <div key={category.category} className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{category.icon}</span>
                <h2 className="text-2xl font-bold">{category.category} Services</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.services.map((service, index) => (
                  <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription>Per {service.per}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{service.price}</div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{service.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {service.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <Button className="w-full bg-gradient-primary hover:shadow-glow">
                          Order Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of satisfied customers and boost your social media presence today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow">
                  <Link to="/auth">Create Account</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BestServices;
