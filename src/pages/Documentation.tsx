import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
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
  ExternalLink,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PlatformDoc {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  icon: string | null;
  read_time: string | null;
  is_popular: boolean | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'getting-started': <Zap className="h-6 w-6" />,
  'api': <Code className="h-6 w-6" />,
  'integration': <Globe className="h-6 w-6" />,
  'configuration': <Settings className="h-6 w-6" />,
  'user-management': <Users className="h-6 w-6" />,
  'security': <Shield className="h-6 w-6" />,
  'troubleshooting': <HelpCircle className="h-6 w-6" />,
};

const categoryLabels: Record<string, string> = {
  'getting-started': 'Getting Started',
  'api': 'API Reference',
  'integration': 'Integration Guide',
  'configuration': 'Configuration',
  'user-management': 'User Management',
  'security': 'Security',
  'troubleshooting': 'Troubleshooting',
};

const categoryDescriptions: Record<string, string> = {
  'getting-started': 'Quick start guide to set up your SMM panel',
  'api': 'Complete API documentation and examples',
  'integration': 'Connect your panel with providers and services',
  'configuration': 'Panel settings and customization options',
  'user-management': 'Managing users, roles, and permissions',
  'security': 'Security best practices and configuration',
  'troubleshooting': 'Common issues and solutions',
};

export default function Documentation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [docs, setDocs] = useState<PlatformDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<PlatformDoc[]>([]);

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = docs.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, docs]);

  const fetchDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_docs')
        .select('id, title, slug, category, excerpt, icon, read_time, is_popular')
        .eq('status', 'published')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setDocs(data || []);
    } catch (error) {
      console.error('Error fetching docs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group docs by category
  const docsByCategory = docs.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, PlatformDoc[]>);

  const popularDocs = docs.filter(doc => doc.is_popular);

  const quickLinks = [
    {
      title: "API Documentation",
      description: "Complete REST API reference",
      icon: <Terminal className="h-5 w-5" />,
      url: "/docs/api/api-overview"
    },
    {
      title: "Integration Guide",
      description: "Connect your panel with providers",
      icon: <Globe className="h-5 w-5" />,
      url: "/docs/integration/provider-integration"
    },
    {
      title: "Configuration",
      description: "Panel settings and customization",
      icon: <Settings className="h-5 w-5" />,
      url: "/docs/configuration/panel-settings"
    },
    {
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: <HelpCircle className="h-5 w-5" />,
      url: "/docs/troubleshooting/common-issues"
    }
  ];

  const categories = Object.keys(categoryLabels);

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
              Comprehensive guides, API references, and tutorials to help you master HOME OF SMM
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
              
              {/* Search Results Dropdown */}
              {searchTerm && searchResults.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    {searchResults.map((doc) => (
                      <Link
                        key={doc.id}
                        to={`/docs/${doc.category}/${doc.slug}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setSearchTerm('')}
                      >
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{categoryLabels[doc.category] || doc.category}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{doc.read_time}</Badge>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
              
              {searchTerm && searchResults.length === 0 && !loading && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 p-4">
                  <p className="text-muted-foreground text-center">No results found for "{searchTerm}"</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {quickLinks.map((link, index) => (
              <Link key={index} to={link.url}>
                <Card className="p-6 bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all hover-scale cursor-pointer h-full">
                  <div className="text-primary mb-3">
                    {link.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{link.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Read more <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Documentation Sections</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {categories.map((category) => {
                const categoryDocs = docsByCategory[category] || [];
                
                return (
                  <Card key={category} className="p-8 bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {categoryIcons[category] || <BookOpen className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{categoryLabels[category]}</h3>
                        <p className="text-muted-foreground">{categoryDescriptions[category]}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {categoryDocs.length > 0 ? (
                        categoryDocs.slice(0, 4).map((doc) => (
                          <Link
                            key={doc.id}
                            to={`/docs/${doc.category}/${doc.slug}`}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{doc.title}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm py-4 text-center">
                          Articles coming soon...
                        </p>
                      )}
                      
                      {categoryDocs.length > 4 && (
                        <Link
                          to={`/docs/${category}/${categoryDocs[0]?.slug}`}
                          className="flex items-center justify-center p-3 text-primary hover:underline"
                        >
                          View all {categoryDocs.length} articles
                        </Link>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
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
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : popularDocs.length > 0 ? (
              popularDocs.map((doc) => (
                <Link key={doc.id} to={`/docs/${doc.category}/${doc.slug}`}>
                  <Card className="p-6 bg-card/70 backdrop-blur-sm hover:bg-card/90 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{doc.title}</h3>
                          <Badge variant="secondary">{categoryLabels[doc.category] || doc.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{doc.read_time || '5 min read'}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Popular articles will appear here once content is added.
              </p>
            )}
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
                  Integrate HOME OF SMM with your existing systems using our comprehensive REST API.
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
                  <Link to="/docs/api/api-overview">View API Docs <ExternalLink className="ml-2 h-4 w-4" /></Link>
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
