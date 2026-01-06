import { useRef, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { blogPosts } from "@/data/blogPosts";
import { extractHeadings } from "@/lib/utils";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import { useActiveSection } from "@/hooks/use-active-section";
import { CalendarDays, Clock, ArrowLeft, User } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  const progress = useReadingProgress(contentRef);

  const post = blogPosts.find((p) => p.slug === slug);

  const headings = useMemo(() => {
    if (!post) return [];
    return extractHeadings(post.content);
  }, [post]);

  // Sanitize blog content to prevent XSS attacks
  const sanitizedContent = useMemo(() => {
    if (!post) return '';
    return DOMPurify.sanitize(post.content, {
      ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br', 'span', 'div', 'blockquote', 'code', 'pre', 'img'],
      ALLOWED_ATTR: ['href', 'id', 'class', 'target', 'rel', 'src', 'alt', 'title'],
    });
  }, [post]);

  const activeId = useActiveSection(headings);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const fullUrl = `https://homeofsmm.com/blog/${post.slug}`;

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{post.title} | HOME OF SMM Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="author" content={post.author} />
        <link rel="canonical" href={fullUrl} />
        <meta name="keywords" content={post.tags.join(', ')} />

        {/* Open Graph Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:site_name" content="HOME OF SMM" />
        <meta property="article:published_time" content={post.isoDate} />
        <meta property="article:section" content={post.category} />
        <meta property="article:tag" content={post.tags.join(',')} />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.image} />
      </Helmet>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={progress} className="h-1 rounded-none bg-background/50" />
      </div>

      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero Section */}
        <div className="relative w-full aspect-[21/9] max-h-[400px] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
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
                {post.category}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {post.date}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <User className="h-4 w-4" />
              <span>By {post.author}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

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
            </article>

            {/* Table of Contents */}
            <TableOfContents items={headings} activeId={activeId} />
          </div>

          {/* Related Posts */}
          <div className="max-w-6xl mx-auto mt-12">
            <RelatedPosts currentPost={post} />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
