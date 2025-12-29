import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  Book, 
  Search, 
  Code, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight,
  BookOpen,
  Terminal,
  Globe,
  Settings,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Documentation() {
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    {
      title: "Getting Started",
      icon: <Zap className="h-6 w-6" />,
      description: "Quick start guide to set up your SMM panel",
      articles: [
        "Installation Guide",
        "First Steps",
        "Basic Configuration",
        "Panel Setup"
      ]
    },
    {
      title: "API Reference",
      icon: <Code className="h-6 w-6" />,
      description: "Complete API documentation and examples",
      articles: [
        "Authentication",
        "Services Endpoint",
        "Orders Endpoint",
        "Webhooks"
      ]
    },
    {
      title: "User Management",
      icon: <Users className="h-6 w-6" />,
      description: "Managing users, roles, and permissions",
      articles: [
        "User Roles",
        "Permissions",
        "Registration Flow",
        "Profile Management"
      ]
    },
    {
      title: "Security",
      icon: <Shield className="h-6 w-6" />,
      description: "Security best practices and configuration",
      articles: [
        "SSL Configuration",
        "API Security",
        "User Authentication",
        "Data Protection"
      ]
    }
  ];

  const quickLinks = [
    {
      title: "API Documentation",
      description: "Complete REST API reference",
      icon: <Terminal className="h-5 w-5" />,
      url: "#api"
    },
    {
      title: "Integration Guide",
      description: "Connect your panel with providers",
      icon: <Globe className="h-5 w-5" />,
      url: "#integration"
    },
    {
      title: "Configuration",
      description: "Panel settings and customization",
      icon: <Settings className="h-5 w-5" />,
      url: "#config"
    },
    {
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: <HelpCircle className="h-5 w-5" />,
      url: "#troubleshooting"
    }
  ];

  const popularArticles = [
    {
      title: "How to Set Up Your First Panel",
      category: "Getting Started",
      readTime: "5 min read"
    },
    {
      title: "API Authentication Guide",
      category: "API",
      readTime: "3 min read"
    },
    {
      title: "Configuring Payment Methods",
      category: "Configuration",
      readTime: "7 min read"
    },
    {
      title: "White Label Setup",
      category: "Customization",
      readTime: "4 min read"
    },
    {
      title: "Managing User Permissions",
      category: "User Management",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge className="mb-6 bg-gradient-primary text-primary-foreground">
              <Book className="w-4 h-4 mr-2" />
              Documentation
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-6">
              Everything You Need
              <br />to Get Started
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Comprehensive guides, API references, and tutorials to help you master HomeOfSMM
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {quickLinks.map((link, index) => (
              <Card key={index} className="p-6 bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all hover-scale cursor-pointer">
                <div className="text-primary mb-3">
                  {link.icon}
                </div>
                <h3 className="font-semibold mb-2">{link.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
                <div className="flex items-center text-primary text-sm font-medium">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Documentation Sections</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {sections.map((section, index) => (
              <Card key={index} className="p-8 bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                    <p className="text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {section.articles.map((article, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{article}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Articles</h2>
            <p className="text-lg text-muted-foreground">
              Most viewed guides and tutorials
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {popularArticles.map((article, index) => (
              <Card key={index} className="p-6 bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{article.title}</h3>
                      <Badge variant="secondary">{article.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{article.readTime}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-6 bg-gradient-primary text-primary-foreground">
                  <Code className="w-4 h-4 mr-2" />
                  API Reference
                </Badge>
                <h2 className="text-4xl font-bold mb-6">
                  Powerful REST API
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Integrate HomeOfSMM with your existing systems using our comprehensive REST API.
                  Complete with authentication, rate limiting, and detailed documentation.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>RESTful endpoints</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>JSON responses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Rate limiting</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Webhook support</span>
                  </div>
                </div>

                <Button asChild className="bg-gradient-primary hover:shadow-glow">
                  <Link to="/docs/api">View API Docs <ExternalLink className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
              
              <Card className="p-6 bg-muted/50">
                <div className="mb-4">
                  <Badge className="mb-2">GET</Badge>
                  <code className="block text-sm bg-background p-3 rounded">
                    /api/v1/services
                  </code>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Response:</h4>
                  <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`{
  "status": "success",
  "data": [
    {
      "id": "1",
      "name": "Instagram Followers",
      "category": "instagram",
      "price": 0.01,
      "min_quantity": 100,
      "max_quantity": 100000
    }
  ]
}`}
                  </pre>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Need Help?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow">
              <Link to="/contact">Contact Support</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}