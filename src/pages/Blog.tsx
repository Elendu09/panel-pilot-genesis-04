import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, ArrowRight, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image_url: string | null;
  author_name: string;
  status: string;
  seo_keywords: string[] | null;
  published_at: string | null;
}

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as BlogPost[]);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, posts]);

  const clearFilters = () => {
    setSearchQuery("");
  };

  const getReadTime = (content: string | null) => {
    if (!content) return '3 min read';
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <>
      <Helmet>
        <title>Blog & Insights | HOME OF SMM</title>
        <meta
          name="description"
          content="Stay updated with the latest trends, tips, and strategies in social media marketing. Expert insights on Instagram, TikTok, YouTube, and more."
        />
        <link rel="canonical" href="https://homeofsmm.com/blog" />
        <meta property="og:title" content="Blog & Insights | HOME OF SMM" />
        <meta
          property="og:description"
          content="Stay updated with the latest trends, tips, and strategies in social media marketing."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://homeofsmm.com/blog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 pt-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog & Insights</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest trends, tips, and strategies in social
              media marketing
            </p>
          </div>

          {/* Search */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchQuery && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear search
                </Button>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <CardHeader>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Blog Posts Grid */}
          {!loading && filteredPosts.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 bg-card/80 backdrop-blur-sm"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <div className="aspect-video overflow-hidden rounded-t-xl bg-muted">
                      {post.featured_image_url ? (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <span className="text-4xl font-bold text-primary/30">
                            {post.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">Article</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {getReadTime(post.content)}
                      </div>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      {post.published_at ? format(new Date(post.published_at), 'MMM dd, yyyy') : 'Draft'}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3 mb-4">
                      {post.excerpt || 'Read this article to learn more...'}
                    </CardDescription>
                    <Link to={`/blog/${post.slug}`}>
                      <Button variant="outline" className="w-full group/btn">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                No articles found.
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear search
                </Button>
              )}
            </div>
          ) : null}

          {/* Newsletter Signup */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-3xl p-8 md:p-12 text-center shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest social media
              marketing insights delivered to your inbox.
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl"
              />
              <Button className="rounded-xl">Subscribe</Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Blog;
