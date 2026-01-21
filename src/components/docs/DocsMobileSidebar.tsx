import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Shield,
  Book,
  X
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
}

const categoryConfig: Category[] = [
  { name: "Getting Started", slug: "getting-started", icon: Zap },
  { name: "API Reference", slug: "api", icon: Code },
  { name: "Integration", slug: "integration", icon: Link2 },
  { name: "Configuration", slug: "configuration", icon: Settings },
  { name: "User Management", slug: "user-management", icon: Users },
  { name: "Security", slug: "security", icon: Shield },
  { name: "Troubleshooting", slug: "troubleshooting", icon: AlertTriangle },
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

interface DocsMobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DocsMobileSidebar({ open, onClose }: DocsMobileSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState<DocArticle[]>([]);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  // Fetch articles from database
  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from('platform_docs')
        .select('id, title, slug, category, icon')
        .eq('status', 'published')
        .order('order_index', { ascending: true });

      setArticles(data || []);
    };

    if (open) {
      fetchArticles();
    }
  }, [open]);

  // Open current category
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

  // Filter based on search
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
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="px-4 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Book className="h-4 w-4 text-primary-foreground" />
              </div>
              Documentation
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-10rem)]">
          <nav className="p-4 space-y-2">
            {/* Docs Home */}
            <Link
              to="/docs"
              onClick={onClose}
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
                    "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
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
                              onClick={onClose}
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
      </SheetContent>
    </Sheet>
  );
}
