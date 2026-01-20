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
        <div className="container mx-auto px-4 pt-8">
          <div className="relative w-full aspect-[21/9] max-h-[450px] overflow-hidden rounded-3xl shadow-2xl">
            {post.featured_image_url ? (
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/20">
                <span className="text-8xl font-bold text-primary/30">
                  {post.title.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent rounded-3xl" />
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="py-4">
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <header className="max-w-4xl mx-auto pb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-sm">
                Article
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {getReadTime(post.content)}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {post.published_at ? format(new Date(post.published_at), 'MMM dd, yyyy') : 'Draft'}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
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
                  <Badge key={tag} variant="outline" className="text-xs">
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
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:scroll-mt-24
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-strong:text-foreground
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* FAQ Section */}
              {faqs.length > 0 && (
                <div className="mt-12 border-t pt-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-primary" />
                    Frequently Asked Questions
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </article>

            {/* Table of Contents */}
            <TableOfContents items={headings} activeId={activeId} />
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
