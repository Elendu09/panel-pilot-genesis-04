import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Zap, 
  Code, 
  Link2, 
  Settings, 
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Clock,
  Users,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  read_time: string | null;
}

const categoryIcons: Record<string, React.ElementType> = {
  "getting-started": Zap,
  "api": Code,
  "integration": Link2,
  "configuration": Settings,
  "user-management": Users,
  "security": Shield,
  "troubleshooting": AlertTriangle,
};

const categoryLabels: Record<string, string> = {
  "getting-started": "Getting Started",
  "api": "API Reference",
  "integration": "Integration",
  "configuration": "Configuration",
  "user-management": "User Management",
  "security": "Security",
  "troubleshooting": "Troubleshooting",
};

interface DocsSearchProps {
  open: boolean;
  onClose: () => void;
}

export function DocsSearch({ open, onClose }: DocsSearchProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<DocArticle[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch articles when dialog opens
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('platform_docs')
          .select('id, title, slug, category, excerpt, read_time')
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

    if (open) {
      fetchArticles();
      // Load recent searches from localStorage
      const saved = localStorage.getItem('docs-recent-searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [open]);

  // Filter articles based on search
  const filteredArticles = search
    ? articles.filter(article =>
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
        article.category.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // Group filtered articles by category
  const groupedArticles = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, DocArticle[]>);

  const handleSelect = useCallback((article: DocArticle) => {
    // Save to recent searches
    const newRecent = [article.title, ...recentSearches.filter(r => r !== article.title)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('docs-recent-searches', JSON.stringify(newRecent));
    
    navigate(`/docs/${article.category}/${article.slug}`);
    onClose();
    setSearch("");
  }, [navigate, onClose, recentSearches]);

  const handleQuickLink = (path: string) => {
    navigate(path);
    onClose();
    setSearch("");
  };

  // Quick access links
  const quickLinks = [
    { title: "Quick Start Guide", path: "/docs/getting-started/quick-start", icon: Zap },
    { title: "API Overview", path: "/docs/api/api-overview", icon: Code },
    { title: "Provider Integration", path: "/docs/integration/provider-integration", icon: Link2 },
    { title: "Common Issues", path: "/docs/troubleshooting/common-issues", icon: AlertTriangle },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onClose}>
      <CommandInput 
        placeholder="Search documentation..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No results found for "{search}"</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching for something else
            </p>
          </div>
        </CommandEmpty>

        {/* Search Results */}
        {search && Object.entries(groupedArticles).map(([category, categoryArticles]) => {
          const Icon = categoryIcons[category] || FileText;
          
          return (
            <CommandGroup 
              key={category} 
              heading={
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {categoryLabels[category] || category}
                </span>
              }
            >
              {categoryArticles.map((article) => (
                <CommandItem
                  key={article.id}
                  value={article.title}
                  onSelect={() => handleSelect(article)}
                  className="flex items-center gap-3 py-3"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{article.title}</p>
                    {article.excerpt && (
                      <p className="text-xs text-muted-foreground truncate">{article.excerpt}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {article.read_time && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {article.read_time}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}

        {/* Quick Links (shown when no search) */}
        {!search && (
          <>
            <CommandGroup heading="Quick Links">
              {quickLinks.map((link) => (
                <CommandItem
                  key={link.path}
                  value={link.title}
                  onSelect={() => handleQuickLink(link.path)}
                  className="flex items-center gap-3 py-2"
                >
                  <link.icon className="h-4 w-4 text-primary" />
                  <span>{link.title}</span>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>

            {recentSearches.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Recent Searches">
                  {recentSearches.map((term, index) => (
                    <CommandItem
                      key={`${term}-${index}`}
                      value={term}
                      onSelect={() => {
                        const article = articles.find(a => a.title === term);
                        if (article) {
                          handleSelect(article);
                        }
                      }}
                      className="flex items-center gap-3 py-2"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{term}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
