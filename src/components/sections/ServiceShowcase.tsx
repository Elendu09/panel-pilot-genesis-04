import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Eye, Users, MessageCircle, Share2 } from "lucide-react";

const serviceCategories = [
  { name: "All", active: true },
  { name: "VK", active: false },
  { name: "Telegram", active: false },
  { name: "Instagram", active: false },
  { name: "More", active: false }
];

const services = [
  {
    id: 1,
    title: "Telegram Subscribers",
    price: "$0.3",
    unit: "per 100",
    rating: 4.8,
    speed: "1k",
    icon: Users,
    category: "Telegram",
    featured: false
  },
  {
    id: 2,
    title: "Premium Votes Asian",
    price: "$1",
    unit: "per 100",
    rating: 5.0,
    speed: "1k",
    icon: Star,
    category: "Premium",
    featured: true
  },
  {
    id: 3,
    title: "Channel Post Viewers",
    price: "$0.5",
    unit: "per 100", 
    rating: 4.9,
    speed: "1k",
    icon: Eye,
    category: "Telegram",
    featured: false
  },
  {
    id: 4,
    title: "Real Exclusive Likes Indian",
    price: "$20",
    unit: "per 100",
    rating: 4.7,
    speed: "1k",
    icon: MessageCircle,
    category: "Instagram",
    featured: false
  }
];

export const ServiceShowcase = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Balance and Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 p-4 bg-gradient-card rounded-xl border border-border">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <span className="text-sm text-muted-foreground">What's trending?</span>
            <Button variant="outline" size="sm">
              New order
            </Button>
            <Button variant="outline" size="sm">
              My orders <Badge variant="secondary" className="ml-1">1</Badge>
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-primary font-bold">$500</span>
            <span className="text-sm text-muted-foreground">View demo</span>
            <Button variant="outline" size="sm">
              Menu
            </Button>
          </div>
        </div>

        {/* Service Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {serviceCategories.map((category) => (
            <Button
              key={category.name}
              variant={category.active ? "default" : "outline"}
              size="sm"
              className={category.active ? "bg-gradient-primary" : ""}
            >
              {category.name}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="ml-auto">
            Multiple order
          </Button>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={service.id}
                className={`relative p-6 bg-gradient-service-card border transition-all duration-300 hover:scale-105 hover:shadow-glow ${
                  service.featured ? "ring-2 ring-primary" : ""
                }`}
              >
                {service.featured && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-primary">
                    Featured
                  </Badge>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{service.rating}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                
                <div className="flex items-baseline space-x-1 mb-3">
                  <span className="text-2xl font-bold text-primary">{service.price}</span>
                  <span className="text-sm text-muted-foreground">{service.unit}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>Speed: {service.speed}</span>
                  <Badge variant="outline" className="text-xs">
                    {service.category}
                  </Badge>
                </div>

                <Button className="w-full bg-gradient-primary hover:shadow-glow" size="sm">
                  Order Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">200+</div>
            <div className="text-muted-foreground">Payment systems</div>
            <div className="text-sm text-muted-foreground">for every country</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">Easy start</div>
            <div className="text-muted-foreground">to run own panel</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">20+</div>
            <div className="text-muted-foreground">Language</div>
            <div className="text-sm text-muted-foreground">localizations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">No code</div>
            <div className="text-muted-foreground">solution</div>
          </div>
        </div>
      </div>
    </section>
  );
};