import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ArrowRight, Calendar, Clock, Search, BookOpen, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import BuyerLayout from "./BuyerLayout";
import { useLanguage } from "@/contexts/LanguageContext";

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

const getReadTime = (content: string | null) => {
  if (!content) return "1 min read";
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return `${minutes} min read`;
};

const BuyerBlog = () => {
  const { panel } = useTenant();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <BuyerLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-primary border-primary/30">
                Blog
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {t('blog.title') || 'Insights & Updates'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('blog.subtitle') || `Articles, updates, and guides from ${panel?.name || 'us'}`}
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="glass-card p-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Articles</p>
                <p className="font-bold">{posts.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('blog.search') || "Search articles..."}
            className="pl-10 bg-card/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass-card overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? t('blog.no_results') || 'No articles found' : t('blog.no_posts') || 'No articles yet'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery 
                    ? t('blog.try_different') || 'Try a different search term'
                    : t('blog.check_back') || 'Check back soon for new content!'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <motion.div variants={itemVariants}>
                <Link to={`/blog/${featuredPost.slug}`}>
                  <Card className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300 border-primary/20">
                    <div className="grid md:grid-cols-2 gap-0">
                      {featuredPost.featured_image_url && (
                        <div className="relative h-64 md:h-full overflow-hidden">
                          <img
                            src={featuredPost.featured_image_url}
                            alt={featuredPost.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          {featuredPost.published_at && (
                            <span className="inline-flex items-center gap-1 text-primary">
                              <Calendar className="w-3 h-3" /> 
                              {formatDate(featuredPost.published_at)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getReadTime(featuredPost.content)}
                          </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                          {featuredPost.title}
                        </h2>
                        {featuredPost.excerpt && (
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {featuredPost.excerpt}
                          </p>
                        )}
                        <Button variant="ghost" className="w-fit px-0 text-primary hover:text-primary/80 gap-2">
                          Read article
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )}

            {/* Regular Posts Grid */}
            {regularPosts.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regularPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/blog/${post.slug}`}>
                      <Card className="glass-card h-full overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                        {post.featured_image_url && (
                          <div className="relative h-44 overflow-hidden">
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          </div>
                        )}
                        <CardContent className="p-4 flex flex-col">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            {post.published_at && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-primary" /> 
                                {formatDate(post.published_at)}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getReadTime(post.content)}
                            </span>
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="mt-auto pt-2 flex items-center gap-1 text-sm text-primary">
                            Read more
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerBlog;
