import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  published_at: string | null;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const StorefrontBlog = () => {
  const { panel } = useTenant();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!panel?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, content, featured_image_url, published_at")
        .eq("panel_id", panel.id)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (!error && data) {
        setPosts(data as BlogPost[]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [panel?.id]);

  const panelName = panel?.name || "SMM Panel";

  return (
    <>
      <Helmet>
        <title>{`${panelName} Blog | Latest Updates & Tips`}</title>
        <meta
          name="description"
          content={`Read the latest updates, tips, and news from ${panelName}.`}
        />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : ""} />
      </Helmet>
      <main className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border/40 bg-gradient-to-b from-background via-background/80 to-background">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-4">
                Blog
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Insights & Updates
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Articles, updates, and guides from {panelName} to help you grow your social
                media presence and get the most out of your panel.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-border/40 bg-card/60">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                No blog posts have been published yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="group">
                  <Card className="h-full overflow-hidden border-border/40 bg-card/60 flex flex-col">
                    {post.featured_image_url && (
                      <div className="relative h-40 w-full overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <CardContent className="flex-1 p-5 flex flex-col">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        {post.published_at && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(post.published_at)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.content && post.content.length > 0
                            ? `${Math.max(1, Math.round(post.content.split(" ").length / 200))} min read`
                            : "Quick read"}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-auto pt-2">
                        <Button
                          variant="ghost"
                          className="px-0 text-primary hover:text-primary flex items-center gap-1 text-sm"
                          asChild
                        >
                          <a href={`/blog/${post.slug}`}>
                            Read article
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default StorefrontBlog;
