import { useState, useEffect, useRef } from "react";
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
  ChevronRight,
  Link2,
  FileText,
  Zap,
  Code,
  Settings,
  Users,
  Shield,
  AlertTriangle,
  Check,
  Copy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DocsTableOfContents } from "@/components/docs/DocsTableOfContents";
import { DocsFeedback } from "@/components/docs/DocsFeedback";
import { DocsRelatedArticles } from "@/components/docs/DocsRelatedArticles";
import { DocsReadingProgress } from "@/components/docs/DocsReadingProgress";
import DOMPurify from "dompurify";
import { toast } from "sonner";

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

// Language labels for code blocks
const languageLabels: Record<string, string> = {
  bash: "Bash",
  shell: "Shell",
  json: "JSON",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  php: "PHP",
  curl: "cURL",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
};

// Syntax highlighting
const highlightCode = (code: string, language: string): string => {
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const patterns: Record<string, { regex: RegExp; className: string }[]> = {
    bash: [
      { regex: /(curl|wget|npm|yarn|pnpm|git|cd|ls|mkdir|rm|echo|export)/g, className: 'text-cyan-400' },
      { regex: /(-X\s+\w+|-H\s+|-d\s+|--\w+)/g, className: 'text-yellow-400' },
      { regex: /(https?:\/\/[^\s"'\\]+)/g, className: 'text-green-400' },
      { regex: /(".*?"|'.*?')/g, className: 'text-amber-300' },
      { regex: /(#.*$)/gm, className: 'text-zinc-500 italic' },
    ],
    json: [
      { regex: /("[\w-]+")\s*:/g, className: 'text-purple-400' },
      { regex: /:\s*(".*?")/g, className: 'text-green-400' },
      { regex: /:\s*(\d+|true|false|null)/g, className: 'text-amber-400' },
    ],
    javascript: [
      { regex: /\b(const|let|var|function|async|await|return|import|export|from|if|else|try|catch)\b/g, className: 'text-purple-400' },
      { regex: /\b(true|false|null|undefined)\b/g, className: 'text-amber-400' },
      { regex: /(\/\/.*$)/gm, className: 'text-zinc-500 italic' },
      { regex: /(".*?"|'.*?'|`.*?`)/g, className: 'text-green-400' },
    ],
    php: [
      { regex: /(&lt;\?php|\?&gt;)/g, className: 'text-red-400' },
      { regex: /(\$\w+)/g, className: 'text-cyan-400' },
      { regex: /\b(echo|print|return|function|class|public|private|new|if|else|foreach|while)\b/g, className: 'text-purple-400' },
      { regex: /(".*?"|'.*?')/g, className: 'text-green-400' },
    ],
    python: [
      { regex: /\b(import|from|def|class|return|if|else|elif|try|except|with|as|for|in|while|True|False|None)\b/g, className: 'text-purple-400' },
      { regex: /(#.*$)/gm, className: 'text-zinc-500 italic' },
      { regex: /(".*?"|'.*?')/g, className: 'text-green-400' },
    ],
  };

  const langPatterns = patterns[language] || patterns['bash'];
  langPatterns?.forEach(({ regex, className }) => {
    highlighted = highlighted.replace(regex, (match) => 
      `<span class="${className}">${match}</span>`
    );
  });

  return highlighted;
};

export default function DocsArticlePage() {
  const { category, slug } = useParams();
  const [article, setArticle] = useState<DocArticle | null>(null);
  const [prevArticle, setPrevArticle] = useState<DocArticle | null>(null);
  const [nextArticle, setNextArticle] = useState<DocArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!category || !slug) return;

      setLoading(true);
      try {
        const { data: articleData, error } = await supabase
          .from('platform_docs')
          .select('*')
          .eq('category', category)
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error) throw error;
        setArticle(articleData);

        const { data: categoryArticles } = await supabase
          .from('platform_docs')
          .select('id, title, slug, category')
          .eq('category', category)
          .eq('status', 'published')
          .order('order_index', { ascending: true });

        if (categoryArticles) {
          const currentIndex = categoryArticles.findIndex(a => a.slug === slug);
          setPrevArticle(currentIndex > 0 ? categoryArticles[currentIndex - 1] as DocArticle : null);
          setNextArticle(currentIndex < categoryArticles.length - 1 ? categoryArticles[currentIndex + 1] as DocArticle : null);
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

  // Attach copy handlers to code blocks after render
  useEffect(() => {
    if (!contentRef.current) return;

    const copyButtons = contentRef.current.querySelectorAll('[data-copy-btn]');
    copyButtons.forEach((btn) => {
      const handler = async () => {
        const codeBlock = btn.closest('.code-block-wrapper');
        const codeElement = codeBlock?.querySelector('code');
        if (codeElement) {
          await navigator.clipboard.writeText(codeElement.textContent || '');
          toast.success("Copied to clipboard!");
        }
      };
      btn.addEventListener('click', handler);
    });
  }, [article]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Enhanced markdown to HTML conversion
  const renderContent = (content: string | null) => {
    if (!content) return null;

    let html = content
      // H3 - Subsection with left border accent
      .replace(/^### (.*$)/gim, (_, text) => {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h3 id="${id}" class="text-lg font-semibold mt-6 mb-3 pl-3 border-l-2 border-primary/60 scroll-mt-24 text-foreground">${text}</h3>`;
      })
      // H2 - Section with bottom border
      .replace(/^## (.*$)/gim, (_, text) => {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h2 id="${id}" class="text-xl font-bold mt-8 mb-3 pb-2 border-b border-border/60 scroll-mt-24 text-foreground">${text}</h2>`;
      })
      // H1 - Main title
      .replace(/^# (.*$)/gim, (_, text) => {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h1 id="${id}" class="text-2xl font-bold mt-6 mb-4 scroll-mt-24 text-foreground">${text}</h1>`;
      })
      // Bold and italic
      .replace(/\*\*([^*]+)\*\*/gim, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*([^*]+)\*/gim, '<em class="italic">$1</em>')
      // Callout blocks
      .replace(/>\s*\[!(TIP|WARNING|INFO|DANGER|NOTE)\]\s*\n>\s*([\s\S]*?)(?=\n\n|\n[^>]|$)/gim, (_, type, text) => {
        const cleanText = text.replace(/>\s*/g, '').trim();
        const styles: Record<string, string> = {
          tip: 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300',
          warning: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
          info: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
          danger: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300',
          note: 'bg-muted border-border text-muted-foreground',
        };
        const style = styles[type.toLowerCase()] || styles.note;
        return `<div class="my-4 p-4 rounded-lg border ${style}"><strong class="block mb-1">${type}</strong>${cleanText}</div>`;
      })
      // Code blocks with enhanced styling
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, (_, lang, code) => {
        const language = lang || 'bash';
        const displayLang = languageLabels[language] || language.toUpperCase();
        const highlighted = highlightCode(code.trim(), language);
        
        return `<div class="code-block-wrapper my-4 rounded-lg overflow-hidden border border-border bg-zinc-950 dark:bg-zinc-900">
          <div class="flex items-center justify-between px-4 py-2 bg-zinc-800/80 border-b border-zinc-700/50">
            <span class="text-xs font-mono text-zinc-400 uppercase tracking-wider">${displayLang}</span>
            <button data-copy-btn class="inline-flex items-center gap-1 h-7 px-2.5 text-xs font-medium rounded bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50 hover:text-white transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Copy
            </button>
          </div>
          <pre class="p-4 overflow-x-auto text-sm leading-relaxed"><code class="font-mono text-zinc-100">${highlighted}</code></pre>
        </div>`;
      })
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary border border-border/50">$1</code>')
      // Unordered lists
      .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc mb-1.5 text-muted-foreground leading-relaxed">$1</li>')
      // Ordered lists  
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal mb-1.5 text-muted-foreground leading-relaxed">$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline underline-offset-2 font-medium" target="_blank" rel="noopener noreferrer">$1</a>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="my-6 border-border/50" />')
      // Paragraphs
      .replace(/\n\n/gim, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
      // Line breaks
      .replace(/\n/gim, '<br />');

    html = `<p class="mb-4 text-muted-foreground leading-relaxed">${html}</p>`;

    return DOMPurify.sanitize(html, { 
      ADD_ATTR: ['target', 'data-type', 'data-language', 'data-copy-btn'],
      ADD_TAGS: ['button']
    });
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
      <DocsReadingProgress />
      
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
          <Card className="p-5 sm:p-8 mb-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div 
              ref={contentRef}
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
