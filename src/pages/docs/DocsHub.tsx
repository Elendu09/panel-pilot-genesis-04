import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DocsLayout } from "./DocsLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
  CheckCircle2,
  TrendingUp,
  Play,
  Rocket
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
    description: "Get your SMM panel running in under 5 minutes with our step-by-step guide",
    icon: Rocket,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    bgGlow: "bg-orange-500/20",
    link: "/docs/getting-started/quick-start-guide",
    badge: "5 min",
    stats: "Most popular"
  },
  {
    title: "API Reference",
    description: "Complete REST API documentation for buyers and panel owners",
    icon: Code,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    bgGlow: "bg-blue-500/20",
    link: "/docs/api/panel-api-overview",
    badge: "REST",
    stats: "25+ endpoints"
  },
  {
    title: "Integrations",
    description: "Connect providers, payment gateways, and set up custom domains",
    icon: Link2,
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    bgGlow: "bg-purple-500/20",
    link: "/docs/integration/provider-integration",
    badge: null,
    stats: "10+ providers"
  },
  {
    title: "User Management",
    description: "Manage customers, teams, pricing, and permissions across your panel",
    icon: Users,
    gradient: "from-emerald-500 via-green-500 to-lime-500",
    bgGlow: "bg-green-500/20",
    link: "/docs/user-management/customer-overview",
    badge: null,
    stats: "Full control"
  },
];

const essentialsDocs = [
  { title: "Quick Start Guide", link: "/docs/getting-started/quick-start-guide", icon: Zap, description: "Get up and running fast" },
  { title: "Creating Your Panel", link: "/docs/getting-started/creating-your-panel", icon: FileText, description: "Step-by-step setup" },
  { title: "Adding Providers", link: "/docs/integration/provider-integration", icon: Link2, description: "Connect API providers" },
  { title: "Payment Methods", link: "/docs/integration/payment-gateway-setup", icon: CheckCircle2, description: "Accept payments" },
];

const advancedDocs = [
  { title: "Panel Owner API", link: "/docs/api/panel-api-overview", icon: Code, description: "Build custom integrations" },
  { title: "Buyer API", link: "/docs/api/buyer-api-overview", icon: ExternalLink, description: "Storefront API access" },
  { title: "Security Overview", link: "/docs/security/security-overview", icon: Shield, description: "Protect your panel" },
  { title: "Team Roles", link: "/docs/user-management/roles-permissions", icon: Users, description: "Access control" },
];

const categoryCards = [
  { name: "Getting Started", slug: "getting-started", icon: Zap, gradient: "from-yellow-500 to-orange-500", description: "Start building your panel" },
  { name: "API Reference", slug: "api", icon: Code, gradient: "from-blue-500 to-cyan-500", description: "REST API documentation" },
  { name: "Integration", slug: "integration", icon: Link2, gradient: "from-purple-500 to-pink-500", description: "Connect external services" },
  { name: "Configuration", slug: "configuration", icon: Settings, gradient: "from-green-500 to-emerald-500", description: "Customize your panel" },
  { name: "User Management", slug: "user-management", icon: Users, gradient: "from-orange-500 to-red-500", description: "Manage customers & team" },
  { name: "Security", slug: "security", icon: Shield, gradient: "from-red-500 to-rose-500", description: "Protect your business" },
  { name: "Troubleshooting", slug: "troubleshooting", icon: AlertTriangle, gradient: "from-amber-500 to-yellow-500", description: "Solve common issues" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

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
      <motion.div 
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-primary-glow/20 text-primary border-primary/30 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Documentation
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Everything You Need to Master
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-primary-glow bg-clip-text text-transparent">
              HOME OF SMM
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Comprehensive guides, API references, and tutorials to help you build 
            and scale your SMM panel business from zero to hero.
          </p>
          
          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium">{articles.length}+</span>
              <span className="text-muted-foreground">articles</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-medium">{categoryCards.length}</span>
              <span className="text-muted-foreground">categories</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Updated daily</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Grid - GitBook Style */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-16"
          variants={itemVariants}
        >
          {featureCards.map((card, index) => (
            <Link key={card.title} to={card.link}>
              <Card className="group relative h-full overflow-hidden bg-card/50 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                {/* Gradient glow effect */}
                <div className={`absolute inset-0 ${card.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl`} />
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {card.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {card.badge}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{card.stats}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {card.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                    Get started <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </motion.div>

        {/* Two Column Essentials - Enhanced */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16"
          variants={itemVariants}
        >
          {/* Essentials */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Essentials</h2>
            </div>
            <Card className="bg-card/50 backdrop-blur-md border-border/50 overflow-hidden">
              {essentialsDocs.map((doc, index) => (
                <Link 
                  key={doc.title} 
                  to={doc.link}
                  className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group ${
                    index !== essentialsDocs.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <doc.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium group-hover:text-primary transition-colors">{doc.title}</h4>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1" />
                </Link>
              ))}
            </Card>
          </div>

          {/* Advanced Topics */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Code className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Advanced Topics</h2>
            </div>
            <Card className="bg-card/50 backdrop-blur-md border-border/50 overflow-hidden">
              {advancedDocs.map((doc, index) => (
                <Link 
                  key={doc.title} 
                  to={doc.link}
                  className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group ${
                    index !== advancedDocs.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <doc.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium group-hover:text-primary transition-colors">{doc.title}</h4>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1" />
                </Link>
              ))}
            </Card>
          </div>
        </motion.div>

        {/* Popular Topics Badges */}
        {popularArticles.length > 0 && (
          <motion.div className="mb-16" variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Popular Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularArticles.map((article) => (
                <Link key={article.id} to={`/docs/${article.category}/${article.slug}`}>
                  <Badge 
                    variant="outline" 
                    className="px-4 py-2 text-sm bg-card/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 cursor-pointer transition-all"
                  >
                    <TrendingUp className="h-3 w-3 mr-1.5" />
                    {article.title}
                  </Badge>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Browse by Category - Enhanced Grid */}
        <motion.div className="mb-16" variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryCards.map((category) => {
              const count = articlesByCategory[category.slug]?.length || 0;
              const firstArticle = articlesByCategory[category.slug]?.[0];
              const link = firstArticle 
                ? `/docs/${category.slug}/${firstArticle.slug}`
                : `/docs/${category.slug}/quick-start`;

              return (
                <Link key={category.slug} to={link}>
                  <Card className="group p-5 h-full bg-card/50 backdrop-blur-md border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                        <category.icon className="h-5 w-5 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {count} {count === 1 ? 'article' : 'articles'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* API Preview Section - Enhanced */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border-blue-500/20 backdrop-blur-md">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            
            <div className="relative p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
                    <Code className="w-3 h-3 mr-1" />
                    REST API
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                    Powerful API Integration
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Build custom integrations with our comprehensive REST API. 
                    Full documentation with code examples in multiple languages.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['cURL', 'PHP', 'Python', 'Node.js', 'Ruby'].map((lang) => (
                      <Badge key={lang} variant="outline" className="bg-background/50">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="bg-blue-500 hover:bg-blue-600">
                      <Link to="/docs/api/api-overview">
                        <Play className="mr-2 h-4 w-4" />
                        View API Docs
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/docs/api/api-endpoints">
                        See Endpoints
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {/* Code Preview */}
                <div className="lg:w-96">
                  <div className="rounded-lg overflow-hidden border border-blue-500/20 bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border/50">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/70" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                        <div className="w-3 h-3 rounded-full bg-green-500/70" />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">api-example.sh</span>
                    </div>
                    <div className="p-4 font-mono text-sm">
                      <div className="text-zinc-500 italic mb-1"># Get all services (Buyer API)</div>
                      <div><span className="text-cyan-400 font-semibold">curl</span> <span className="text-yellow-400">-X POST</span> \</div>
                      <div className="pl-4"><span className="text-amber-300">"https://yourpanel.homeofsmm.com/api/v2"</span> \</div>
                      <div className="pl-4"><span className="text-yellow-400">-d</span> <span className="text-amber-300">'&#123;"key":"API_KEY","action":"services"&#125;'</span></div>
                      <div className="text-zinc-500 italic mt-4 mb-1"># Response</div>
                      <pre className="text-xs text-zinc-400">
{`[
  { "service": "1", "name": "Instagram Followers", 
    "rate": "0.50", "min": 100, "max": 10000 }
]`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Help Section */}
        <motion.div 
          className="text-center py-12 mt-16 border-t border-border/50"
          variants={itemVariants}
        >
          <h3 className="text-2xl font-semibold mb-3">Can't find what you're looking for?</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Our support team is here to help. Check the FAQ or reach out directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/docs/troubleshooting/faq">
                <AlertTriangle className="mr-2 h-4 w-4" />
                View FAQ
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/contact">
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </DocsLayout>
  );
}
