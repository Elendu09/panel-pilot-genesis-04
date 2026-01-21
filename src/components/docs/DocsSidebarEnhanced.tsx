import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Zap, 
  Code, 
  Link2, 
  Settings, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Search,
  BookOpen,
  FileText,
  Users,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  icon: string | null;
}

interface Category {
  name: string;
  slug: string;
  icon: React.ElementType;
  description: string;
}

const categoryConfig: Category[] = [
  { 
    name: "Getting Started", 
    slug: "getting-started", 
    icon: Zap,
    description: "Quick start and setup guides"
  },
  { 
    name: "API Reference", 
    slug: "api", 
    icon: Code,
    description: "REST API documentation"
  },
  { 
    name: "Integration", 
    slug: "integration", 
    icon: Link2,
    description: "Provider and payment setup"
  },
  { 
    name: "Configuration", 
    slug: "configuration", 
    icon: Settings,
    description: "Panel customization"
  },
  { 
    name: "User Management", 
    slug: "user-management", 
    icon: Users,
    description: "Users, roles and permissions"
  },
  { 
    name: "Security", 
    slug: "security", 
    icon: Shield,
    description: "Security best practices"
  },
  { 
    name: "Troubleshooting", 
    slug: "troubleshooting", 
    icon: AlertTriangle,
    description: "Common issues and FAQ"
  },
];

const getArticleIcon = (iconName: string | null): React.ElementType => {
  const iconMap: Record<string, React.ElementType> = {
    zap: Zap,
    code: Code,
    link: Link2,
    settings: Settings,
    alert: AlertTriangle,
    book: BookOpen,
    file: FileText,
    users: Users,
    shield: Shield,
  };
  return iconMap[iconName || "file"] || FileText;
};

interface DocsSidebarEnhancedProps {
  className?: string;
}

export function DocsSidebarEnhanced({ className }: DocsSidebarEnhancedProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState<DocArticle[]>([]);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch articles from database
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_docs')
          .select('id, title, slug, category, icon')
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

  // Open current category by default
  useEffect(() => {
    const currentCategory = currentPath.split("/")[2];
    if (currentCategory) {
      setOpenCategories(prev => new Set([...prev, currentCategory]));
    }
  }, [currentPath]);

  const toggleCategory = (slug: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  // Group articles by category
  const articlesByCategory = articles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, DocArticle[]>);

  // Filter articles based on search
  const filteredCategories = categoryConfig.filter(category => {
    if (!searchTerm) return true;
    
    const categoryArticles = articlesByCategory[category.slug] || [];
    const matchesCategory = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArticle = categoryArticles.some(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return matchesCategory || matchesArticle;
  });

  return (
    <aside className={cn(
      "w-72 shrink-0 border-r bg-card/50 backdrop-blur-sm",
      className
    )}>
      <div className="sticky top-16 h-[calc(100vh-4rem)]">
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="p-4 space-y-2">
            {/* Docs Home Link */}
            <Link
              to="/docs"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                currentPath === "/docs"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <BookOpen className="h-4 w-4" />
              Documentation Home
            </Link>

            <div className="h-px bg-border my-4" />

            {/* Categories */}
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const categoryArticles = articlesByCategory[category.slug] || [];
              const isOpen = openCategories.has(category.slug) || searchTerm !== "";
              const currentCategory = currentPath.split("/")[2];
              const isActiveCategory = currentCategory === category.slug;

              // Filter articles if searching
              const filteredArticles = searchTerm
                ? categoryArticles.filter(article =>
                    article.title.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                : categoryArticles;

              if (searchTerm && filteredArticles.length === 0) return null;

              return (
                <Collapsible
                  key={category.slug}
                  open={isOpen}
                  onOpenChange={() => toggleCategory(category.slug)}
                >
                  <CollapsibleTrigger className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                    isActiveCategory
                      ? "bg-primary/5 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn(
                        "h-4 w-4",
                        isActiveCategory ? "text-primary" : ""
                      )} />
                      <span>{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {categoryArticles.length}
                      </Badge>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <ul className="mt-1 ml-4 border-l border-border space-y-0.5">
                      {filteredArticles.map((article) => {
                        const href = `/docs/${category.slug}/${article.slug}`;
                        const isActive = currentPath === href;
                        const ArticleIcon = getArticleIcon(article.icon);

                        return (
                          <li key={article.id}>
                            <Link
                              to={href}
                              className={cn(
                                "flex items-center gap-2 py-1.5 px-3 text-sm transition-colors -ml-px border-l-2",
                                isActive
                                  ? "border-primary text-primary font-medium bg-primary/5"
                                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                              )}
                            >
                              <ArticleIcon className="h-3.5 w-3.5" />
                              <span className="truncate">{article.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                      
                      {categoryArticles.length === 0 && (
                        <li className="py-2 px-3 text-xs text-muted-foreground italic">
                          No articles yet
                        </li>
                      )}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}
