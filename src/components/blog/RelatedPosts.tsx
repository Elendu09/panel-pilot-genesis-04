import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { BlogPost, blogPosts } from "@/data/blogPosts";

interface RelatedPostsProps {
  currentPost: BlogPost;
  maxPosts?: number;
}

export const RelatedPosts = ({ currentPost, maxPosts = 3 }: RelatedPostsProps) => {
  // Get posts from same category, excluding current post
  const sameCategoryPosts = blogPosts.filter(
    post => post.category === currentPost.category && post.id !== currentPost.id
  );

  // If not enough from same category, get other recent posts
  const otherPosts = blogPosts.filter(
    post => post.category !== currentPost.category && post.id !== currentPost.id
  );

  const relatedPosts = [...sameCategoryPosts, ...otherPosts].slice(0, maxPosts);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="py-12 border-t border-border">
      <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`}>
            <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group">
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};
