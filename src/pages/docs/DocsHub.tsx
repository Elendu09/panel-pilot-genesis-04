import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DocsLayout } from "./DocsLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Code, 
  Link2, 
  Settings, 
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Star,
  Clock,
  Users,
  Shield,
  Sparkles,
  FileText,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  read_time: string | null;
  is_popular: boolean | null;
}

const featureCards = [
  {
    title: "Quick Start",
    description: "Get your SMM panel running in under 5 minutes",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    link: "/docs/getting-started/quick-start",
    badge: "5 min"
  },
  {
    title: "API Reference",
    description: "Complete REST API documentation with examples",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    link: "/docs/api/api-overview",
    badge: "REST"
  },
  {
    title: "Integrations",
    description: "Connect providers, payments, and custom domains",
    icon: Link2,
    color: "from-purple-500 to-pink-500",
    link: "/docs/integration/provider-integration",
    badge: null
  },
  {
    title: "Configuration",
    description: "Customize every aspect of your panel",
    icon: Settings,
    color: "from-green-500 to-emerald-500",
    link: "/docs/configuration/panel-settings",
    badge: null
  },
];

const essentialsDocs = [
  { title: "Quick Start Guide", link: "/docs/getting-started/quick-start", icon: Zap },
  { title: "Creating Your Panel", link: "/docs/getting-started/creating-panel", icon: FileText },
  { title: "Adding Providers", link: "/docs/integration/provider-integration", icon: Link2 },
  { title: "Payment Methods", link: "/docs/integration/payment-gateway-integration", icon: CheckCircle2 },
];

const advancedDocs = [
  { title: "API Authentication", link: "/docs/api/api-overview", icon: Code },
  { title: "Webhooks Guide", link: "/docs/api/webhooks-guide", icon: ExternalLink },
  { title: "Custom Domain Setup", link: "/docs/integration/custom-domain", icon: Settings },
  { title: "Security Settings", link: "/docs/security/security-overview", icon: Shield },
];

const categoryCards = [
  { name: "Getting Started", slug: "getting-started", icon: Zap, color: "text-yellow-500" },
  { name: "API Reference", slug: "api", icon: Code, color: "text-blue-500" },
  { name: "Integration", slug: "integration", icon: Link2, color: "text-purple-500" },
  { name: "Configuration", slug: "configuration", icon: Settings, color: "text-green-500" },
  { name: "User Management", slug: "user-management", icon: Users, color: "text-orange-500" },
  { name: "Security", slug: "security", icon: Shield, color: "text-red-500" },
  { name: "Troubleshooting", slug: "troubleshooting", icon: AlertTriangle, color: "text-amber-500" },
];

export default function DocsHub() {
  const [articles, setArticles] = useState<DocArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_docs')
          .select('id, title, slug, category, excerpt, read_time, is_popular')
          .eq('status', 'published')
          .order('order_index', { ascending: true });

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error('Error fetching docs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Group by category for counts
  const articlesByCategory = articles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, DocArticle[]>);

  const popularArticles = articles.filter(a => a.is_popular);

  return (
    <DocsLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Documentation
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Everything You Need to Master
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              HOME OF SMM
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Comprehensive guides, API references, and tutorials to help you build and scale your SMM panel business.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {articles.length}+ articles
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {categoryCards.length} categories
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Updated regularly
            </span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {featureCards.map((card) => (
            <Link key={card.title} to={card.link}>
              <Card className="p-5 h-full bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:border-primary/30 transition-all group cursor-pointer">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  {card.badge && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {card.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
                <div className="flex items-center gap-1 mt-3 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Two Column Essentials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Essentials */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Essentials
            </h2>
            <Card className="p-4 bg-card/50 backdrop-blur-sm divide-y divide-border/50">
              {essentialsDocs.map((doc) => (
                <Link 
                  key={doc.title} 
                  to={doc.link}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary transition-colors group"
                >
                  <doc.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  <span className="flex-1">{doc.title}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </Card>
          </div>

          {/* Advanced Topics */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-500" />
              Advanced Topics
            </h2>
            <Card className="p-4 bg-card/50 backdrop-blur-sm divide-y divide-border/50">
              {advancedDocs.map((doc) => (
                <Link 
                  key={doc.title} 
                  to={doc.link}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:text-primary transition-colors group"
                >
                  <doc.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  <span className="flex-1">{doc.title}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </Card>
          </div>
        </div>

        {/* Popular Topics */}
        {popularArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Popular Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularArticles.map((article) => (
                <Link key={article.id} to={`/docs/${article.category}/${article.slug}`}>
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1.5 text-sm hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors"
                  >
                    {article.title}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Browse by Category */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryCards.map((category) => {
              const count = articlesByCategory[category.slug]?.length || 0;
              const firstArticle = articlesByCategory[category.slug]?.[0];
              const link = firstArticle 
                ? `/docs/${category.slug}/${firstArticle.slug}`
                : `/docs/${category.slug}/quick-start`;

              return (
                <Link key={category.slug} to={link}>
                  <Card className="p-5 h-full bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:border-primary/30 transition-all group cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                      <Badge variant="outline" className="text-xs">
                        {count} articles
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {count > 0 ? `Explore ${count} guides and tutorials` : 'Coming soon'}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* API Preview Section */}
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <Badge className="mb-3 bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Code className="w-3 h-3 mr-1" />
                REST API
              </Badge>
              <h3 className="text-2xl font-bold mb-3">Powerful API Integration</h3>
              <p className="text-muted-foreground mb-4">
                Build custom integrations with our comprehensive REST API. 
                Full documentation with code examples in multiple languages.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['cURL', 'PHP', 'Python', 'Node.js'].map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link to="/docs/api/api-overview">
                  View API Docs <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="lg:w-80">
              <div className="bg-background/80 rounded-lg p-4 font-mono text-sm">
                <div className="text-muted-foreground mb-2">// Example Request</div>
                <div className="text-green-400">GET</div>
                <div className="text-foreground">/api/v1/services</div>
                <div className="text-muted-foreground mt-3 mb-1">// Response</div>
                <pre className="text-xs text-muted-foreground overflow-x-auto">
{`{
  "status": "success",
  "data": [...]
}`}
                </pre>
              </div>
            </div>
          </div>
        </Card>

        {/* Help Section */}
        <div className="text-center py-8 border-t border-border/50">
          <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/docs/troubleshooting/faq">
                <AlertTriangle className="mr-2 h-4 w-4" />
                View FAQ
              </Link>
            </Button>
            <Button asChild>
              <Link to="/contact">
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
}
