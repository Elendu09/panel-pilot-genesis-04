import { useRef, useMemo, useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { extractHeadings } from "@/lib/utils";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import { useActiveSection } from "@/hooks/use-active-section";
import { CalendarDays, Clock, ArrowLeft, User, HelpCircle } from "lucide-react";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/JsonLdSchema";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image_url: string | null;
  author_name: string;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  table_of_contents: any[];
  faqs: any[];
  published_at: string | null;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const progress = useReadingProgress(contentRef);
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setNotFound(true);
      } else {
        setPost(data as BlogPostData);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const headings = useMemo(() => {
    if (!post?.content) return [];
    return extractHeadings(post.content);
  }, [post]);

  // Sanitize blog content to prevent XSS attacks
  const sanitizedContent = useMemo(() => {
    if (!post?.content) return '';
    return DOMPurify.sanitize(post.content, {
      ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br', 'span', 'div', 'blockquote', 'code', 'pre', 'img'],
      ALLOWED_ATTR: ['href', 'id', 'class', 'target', 'rel', 'src', 'alt', 'title'],
    });
  }, [post]);

  const activeId = useActiveSection(headings);

  const getReadTime = (content: string | null) => {
    if (!content) return '3 min read';
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <Skeleton className="w-full aspect-[21/9] max-h-[450px] rounded-3xl mb-8" />
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/blog" replace />;
  }

  const fullUrl = `https://homeofsmm.com/blog/${post.slug}`;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://homeofsmm.com';
  const faqs = (post.faqs || []) as { question: string; answer: string }[];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <ArticleSchema
        headline={post.seo_title || post.title}
        description={post.seo_description || post.excerpt || ''}
        image={post.featured_image_url || ''}
        author={post.author_name}
        datePublished={post.published_at || post.created_at}
        url={fullUrl}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: baseUrl },
          { name: 'Blog', url: `${baseUrl}/blog` },
          { name: post.title, url: fullUrl },
        ]}
      />
      
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{post.seo_title || post.title} | HOME OF SMM Blog</title>
        <meta name="description" content={post.seo_description || post.excerpt || ''} />
        <meta name="author" content={post.author_name} />
        <link rel="canonical" href={fullUrl} />
        {post.seo_keywords && <meta name="keywords" content={post.seo_keywords.join(', ')} />}

        {/* Open Graph Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.seo_title || post.title} />
        <meta property="og:description" content={post.seo_description || post.excerpt || ''} />
        {post.featured_image_url && <meta property="og:image" content={post.featured_image_url} />}
        <meta property="og:url" content={fullUrl} />
        <meta property="og:site_name" content="HOME OF SMM" />
        <meta property="article:published_time" content={post.published_at || post.created_at} />
        {post.seo_keywords && <meta property="article:tag" content={post.seo_keywords.join(',')} />}

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo_title || post.title} />
        <meta name="twitter:description" content={post.seo_description || post.excerpt || ''} />
        {post.featured_image_url && <meta name="twitter:image" content={post.featured_image_url} />}
      </Helmet>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={progress} className="h-1 rounded-none bg-background/50" />
      </div>

      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero Section with Curved Image */}
        <div className="container mx-auto px-4 pt-24 md:pt-28">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] min-h-[280px] md:min-h-[400px] max-h-[500px] overflow-hidden rounded-3xl shadow-2xl">
            {post.featured_image_url ? (
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/20">
                <span className="text-8xl font-bold text-primary/30">
                  {post.title.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent rounded-3xl" />
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="py-6">
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <header className="max-w-4xl mx-auto pb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-sm font-medium">
                Article
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {getReadTime(post.content)}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {post.published_at ? format(new Date(post.published_at), 'MMM dd, yyyy') : 'Draft'}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-foreground">
              {post.title}
            </h1>

            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <User className="h-4 w-4" />
              <span>By {post.author_name}</span>
            </div>

            {/* Tags */}
            {post.seo_keywords && post.seo_keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.seo_keywords.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Mobile Share Buttons */}
            <div className="lg:hidden">
              <ShareButtons title={post.title} url={fullUrl} />
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex gap-8 max-w-6xl mx-auto">
            {/* Desktop Sticky Share Buttons */}
            <aside className="hidden lg:block sticky top-24 h-fit">
              <ShareButtons title={post.title} url={fullUrl} vertical />
            </aside>

            {/* Article Content */}
            <article className="flex-1 max-w-3xl" ref={contentRef}>
              {/* Mobile Table of Contents */}
              {headings.length > 0 && (
                <div className="lg:hidden mb-8 p-4 bg-muted/50 rounded-xl border">
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                    Table of Contents
                  </h3>
                  <nav className="space-y-2">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-sm py-1 hover:text-primary transition-colors ${
                          heading.level === 3 ? 'pl-4 text-muted-foreground' : 'font-medium'
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              <div
                className="blog-content space-y-6"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* FAQ Section */}
              {faqs.length > 0 && (
                <div className="mt-16 pt-8 border-t border-border">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <HelpCircle className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      Frequently Asked Questions
                    </h2>
                  </div>
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {faqs.map((faq, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`faq-${index}`}
                        className="border border-border rounded-lg px-4 bg-card/50 data-[state=open]:bg-card"
                      >
                        <AccordionTrigger className="text-left font-medium hover:no-underline py-4 text-foreground">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </article>

            {/* Desktop Table of Contents */}
            {headings.length > 0 && (
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24">
                  <div className="p-4 bg-muted/30 rounded-xl border">
                    <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                      On This Page
                    </h3>
                    <nav className="space-y-2">
                      {headings.map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          className={`block text-sm py-1.5 transition-colors border-l-2 pl-3 ${
                            activeId === heading.id
                              ? 'border-primary text-primary font-medium'
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                          } ${heading.level === 3 ? 'pl-5' : ''}`}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              </aside>
            )}
          </div>

          {/* Related Posts Section - Could be added later */}
          <div className="max-w-6xl mx-auto mt-12 mb-8">
            <Link to="/blog">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                View All Articles
              </Button>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
