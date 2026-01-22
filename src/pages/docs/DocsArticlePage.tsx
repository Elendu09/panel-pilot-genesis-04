import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DocsLayout } from "./DocsLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  BookOpen,
  ChevronRight,
  Link2,
  FileText,
  Zap,
  Code,
  Settings,
  Users,
  Shield,
  AlertTriangle,
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DocsTableOfContents } from "@/components/docs/DocsTableOfContents";
import { DocsFeedback } from "@/components/docs/DocsFeedback";
import { DocsRelatedArticles } from "@/components/docs/DocsRelatedArticles";
import { DocsCallout } from "@/components/docs/DocsCallout";
import { DocsCodeBlock } from "@/components/docs/DocsCodeBlock";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";

interface DocArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string | null;
  excerpt: string | null;
  read_time: string | null;
  updated_at: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; gradient: string }> = {
  "getting-started": { label: "Getting Started", icon: Zap, gradient: "from-yellow-500 to-orange-500" },
  "api": { label: "API Reference", icon: Code, gradient: "from-blue-500 to-cyan-500" },
  "integration": { label: "Integration", icon: Link2, gradient: "from-purple-500 to-pink-500" },
  "configuration": { label: "Configuration", icon: Settings, gradient: "from-green-500 to-emerald-500" },
  "user-management": { label: "User Management", icon: Users, gradient: "from-orange-500 to-red-500" },
  "security": { label: "Security", icon: Shield, gradient: "from-red-500 to-rose-500" },
  "troubleshooting": { label: "Troubleshooting", icon: AlertTriangle, gradient: "from-amber-500 to-yellow-500" },
};

export default function DocsArticlePage() {
  const { category, slug } = useParams();
  const [article, setArticle] = useState<DocArticle | null>(null);
  const [prevArticle, setPrevArticle] = useState<DocArticle | null>(null);
  const [nextArticle, setNextArticle] = useState<DocArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!category || !slug) return;

      setLoading(true);
      try {
        // Fetch current article
        const { data: articleData, error } = await supabase
          .from('platform_docs')
          .select('*')
          .eq('category', category)
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error) throw error;
        setArticle(articleData);

        // Fetch all articles in this category for prev/next navigation
        const { data: categoryArticles } = await supabase
          .from('platform_docs')
          .select('id, title, slug, category')
          .eq('category', category)
          .eq('status', 'published')
          .order('order_index', { ascending: true });

        if (categoryArticles) {
          const currentIndex = categoryArticles.findIndex(a => a.slug === slug);
          if (currentIndex > 0) {
            setPrevArticle(categoryArticles[currentIndex - 1] as DocArticle);
          } else {
            setPrevArticle(null);
          }
          if (currentIndex < categoryArticles.length - 1) {
            setNextArticle(categoryArticles[currentIndex + 1] as DocArticle);
          } else {
            setNextArticle(null);
          }
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [category, slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Enhanced markdown to HTML conversion with callout and code block support
  const renderContent = (content: string | null) => {
    if (!content) return null;

    // Basic markdown to HTML conversion with reduced spacing
    let html = content
      // Headers with IDs for TOC - reduced margins
      .replace(/^### (.*$)/gim, (_, text) => {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h3 id="${id}" class="text-xl font-semibold mt-4 mb-2 scroll-mt-24 group flex items-center gap-2">
          <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity">#</a>
          ${text}
        </h3>`;
      })
      .replace(/^## (.*$)/gim, (_, text) => {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h2 id="${id}" class="text-2xl font-bold mt-6 mb-2 scroll-mt-24 group flex items-center gap-2">
          <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity">#</a>
          ${text}
        </h2>`;
      })
      .replace(/^# (.*$)/gim, (_, text) => {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h1 id="${id}" class="text-3xl font-bold mt-4 mb-3 scroll-mt-24">${text}</h1>`;
      })
      // Bold and italic
      .replace(/\*\*([^*]+)\*\*/gim, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*([^*]+)\*/gim, '<em class="italic">$1</em>')
      // Callout blocks: > [!TIP] or > [!WARNING] etc.
      .replace(/>\s*\[!(TIP|WARNING|INFO|DANGER|NOTE)\]\s*\n>\s*([\s\S]*?)(?=\n\n|\n[^>]|$)/gim, (_, type, text) => {
        const cleanText = text.replace(/>\s*/g, '').trim();
        return `<div class="callout callout-${type.toLowerCase()}" data-type="${type.toLowerCase()}">${cleanText}</div>`;
      })
      // Code blocks with language - reduced margin
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, (_, lang, code) => {
        const language = lang || 'bash';
        return `<div class="code-block my-3" data-language="${language}">${code.trim()}</div>`;
      })
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono text-primary">$1</code>')
      // Lists - reduced margin
      .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc mb-1 text-muted-foreground">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal mb-1 text-muted-foreground">$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline underline-offset-2 font-medium" target="_blank" rel="noopener noreferrer">$1</a>')
      // Horizontal rules - reduced margin
      .replace(/^---$/gim, '<hr class="my-4 border-border/50" />')
      // Paragraphs - reduced margin
      .replace(/\n\n/gim, '</p><p class="mb-3 text-muted-foreground leading-relaxed">')
      // Line breaks
      .replace(/\n/gim, '<br />');

    // Wrap in paragraph tags - reduced margin
    html = `<p class="mb-3 text-muted-foreground leading-relaxed">${html}</p>`;

    // Sanitize HTML
    return DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'data-type', 'data-language'] });
  };

  if (loading) {
    return (
      <DocsLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-32 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DocsLayout>
    );
  }

  if (!article) {
    return (
      <DocsLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The documentation article you're looking for doesn't exist or is not published yet.
          </p>
          <Button asChild>
            <Link to="/docs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documentation
            </Link>
          </Button>
        </div>
      </DocsLayout>
    );
  }

  return (
    <DocsLayout>
      <div className="flex">
        {/* Main Content */}
        <article className="flex-1 min-w-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              to={`/docs/${category}/${article.slug}`} 
              className="hover:text-foreground transition-colors capitalize"
            >
              {categoryConfig[category || ""]?.label || category}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate">{article.title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="capitalize">
                {categoryConfig[category || ""]?.label || category}
              </Badge>
              {article.read_time && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {article.read_time} read
                </span>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{article.title}</h1>
            
            {article.excerpt && (
              <p className="text-lg text-muted-foreground mb-4">{article.excerpt}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Updated {new Date(article.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyLink}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-1" />
                    Copy link
                  </>
                )}
              </Button>
            </div>
          </header>

          {/* Article Content */}
          <Card className="p-4 sm:p-6 mb-6 bg-card/50 backdrop-blur-sm">
            <div 
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderContent(article.content) || '' }}
            />
          </Card>

          {/* Feedback */}
          <DocsFeedback articleId={article.id} />

          {/* Related Articles */}
          <DocsRelatedArticles 
            currentArticleId={article.id} 
            category={category || ""} 
          />

          {/* Prev/Next Navigation */}
          <nav className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-8 border-t">
            {prevArticle ? (
              <Link 
                to={`/docs/${prevArticle.category}/${prevArticle.slug}`}
                className="flex-1"
              >
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <ArrowLeft className="h-4 w-4 mr-3 shrink-0" />
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground mb-0.5">Previous</div>
                    <div className="font-medium truncate">{prevArticle.title}</div>
                  </div>
                </Button>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            
            {nextArticle && (
              <Link 
                to={`/docs/${nextArticle.category}/${nextArticle.slug}`}
                className="flex-1"
              >
                <Button variant="outline" className="w-full justify-end h-auto py-3">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-0.5">Next</div>
                    <div className="font-medium truncate">{nextArticle.title}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-3 shrink-0" />
                </Button>
              </Link>
            )}
          </nav>
        </article>

        {/* Table of Contents (Desktop) */}
        <DocsTableOfContents content={article.content || ""} />
      </div>
    </DocsLayout>
  );
}
