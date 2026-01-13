import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { ThemeCustomization } from "@/types/theme-customization";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const calculateReadTime = (content: string | null) => {
  if (!content) return "Quick read";
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
};

// Get mode-specific colors for blog styling
const getModeColors = (customization: ThemeCustomization, isLight: boolean) => {
  if (isLight && customization.lightModeColors) {
    return {
      bgColor: customization.lightModeColors.backgroundColor || '#FAFBFC',
      surfaceColor: customization.lightModeColors.surfaceColor || '#FFFFFF',
      textColor: customization.lightModeColors.textColor || '#1F2937',
      mutedColor: customization.lightModeColors.mutedColor || '#6B7280',
      borderColor: customization.lightModeColors.borderColor || '#E5E7EB',
    };
  }
  if (!isLight && customization.darkModeColors) {
    return {
      bgColor: customization.darkModeColors.backgroundColor || '#0F172A',
      surfaceColor: customization.darkModeColors.surfaceColor || '#1E293B',
      textColor: customization.darkModeColors.textColor || '#FFFFFF',
      mutedColor: customization.darkModeColors.mutedColor || '#94A3B8',
      borderColor: customization.darkModeColors.borderColor || '#334155',
    };
  }
  return {
    bgColor: customization.backgroundColor || (isLight ? '#FAFBFC' : '#0F172A'),
    surfaceColor: customization.surfaceColor || (isLight ? '#FFFFFF' : '#1E293B'),
    textColor: customization.textColor || (isLight ? '#1F2937' : '#FFFFFF'),
    mutedColor: customization.mutedColor || (isLight ? '#6B7280' : '#94A3B8'),
    borderColor: customization.borderColor || (isLight ? '#E5E7EB' : '#334155'),
  };
};

const BuyerBlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { panel } = useTenant();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!panel?.id || !slug) return;
      
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, content, featured_image_url, published_at, seo_title, seo_description")
        .eq("panel_id", panel.id)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (fetchError) {
        setError("Blog post not found");
        setPost(null);
      } else {
        setPost(data as BlogPost);
      }
      setLoading(false);
    };

    fetchPost();
  }, [panel?.id, slug]);

  const panelName = panel?.name || "Panel";
  const pageTitle = post?.seo_title || post?.title || "Blog Post";
  const pageDescription = post?.seo_description || post?.excerpt || `Read this article on ${panelName}`;

  // Get customization and theme-aware colors
  const customization = ((panel as any)?.customization_json as ThemeCustomization) || {};
  const themeMode = customization.themeMode || 'dark';
  const isLight = themeMode === 'light';
  const { bgColor, surfaceColor, textColor, mutedColor, borderColor } = getModeColors(customization, isLight);
  const primaryColor = customization.primaryColor || '#6366F1';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || "Blog Post",
          text: post?.excerpt || "",
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor, color: textColor }}>
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}1a` }}>
            <span className="text-3xl">📄</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="mb-6" style={{ color: mutedColor }}>
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild style={{ backgroundColor: primaryColor, color: '#fff' }}>
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${pageTitle} | ${panelName}`}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : ""} />
        {post.featured_image_url && <meta property="og:image" content={post.featured_image_url} />}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
      </Helmet>
      
      <main className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
        {/* Header */}
        <section style={{ borderBottom: `1px solid ${borderColor}`, background: `linear-gradient(to bottom, ${surfaceColor}, ${bgColor})` }}>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 hover:bg-white/10" style={{ color: textColor }}>
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
            
            <Badge className="mb-4" style={{ backgroundColor: `${primaryColor}1a`, color: primaryColor, borderColor: `${primaryColor}4d` }}>
              Article
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ color: textColor }}>
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: mutedColor }}>
              {post.published_at && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" style={{ color: primaryColor }} />
                  {formatDate(post.published_at)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {calculateReadTime(post.content)}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="ml-auto hover:bg-white/10"
                style={{ color: mutedColor }}
              >
                <Share2 className="w-4 h-4 mr-1.5" />
                Share
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {post.featured_image_url && (
          <section className="container mx-auto px-4 max-w-4xl -mt-2">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </section>
        )}

        {/* Content */}
        <section className="container mx-auto px-4 py-10 max-w-4xl">
          <article 
            className="prose prose-lg max-w-none"
            style={{ 
              '--tw-prose-body': textColor,
              '--tw-prose-headings': textColor,
              '--tw-prose-links': primaryColor,
              '--tw-prose-bold': textColor,
              '--tw-prose-counters': mutedColor,
              '--tw-prose-bullets': mutedColor,
              '--tw-prose-hr': borderColor,
              '--tw-prose-quotes': textColor,
              '--tw-prose-quote-borders': primaryColor,
              '--tw-prose-code': primaryColor,
              '--tw-prose-pre-code': textColor,
              '--tw-prose-pre-bg': surfaceColor,
            } as React.CSSProperties}
          >
            {post.content ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(post.content) 
                }} 
              />
            ) : (
              <p style={{ color: mutedColor }}>No content available.</p>
            )}
          </article>
          
          {/* Back to blog CTA */}
          <div className="mt-12 pt-8" style={{ borderTop: `1px solid ${borderColor}` }}>
            <Button asChild variant="outline" style={{ borderColor: primaryColor, color: primaryColor }}>
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to all articles
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
};

export default BuyerBlogPost;