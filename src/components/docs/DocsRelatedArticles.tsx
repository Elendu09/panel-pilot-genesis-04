import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  read_time: string | null;
}

interface DocsRelatedArticlesProps {
  currentArticleId: string;
  category: string;
}

export function DocsRelatedArticles({ currentArticleId, category }: DocsRelatedArticlesProps) {
  const [articles, setArticles] = useState<RelatedArticle[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      // Fetch other articles in the same category
      const { data, error } = await supabase
        .from('platform_docs')
        .select('id, title, slug, category, excerpt, read_time')
        .eq('status', 'published')
        .eq('category', category)
        .neq('id', currentArticleId)
        .order('order_index', { ascending: true })
        .limit(3);

      if (!error && data) {
        setArticles(data);
      }
    };

    fetchRelated();
  }, [currentArticleId, category]);

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        Related Articles
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <Link key={article.id} to={`/docs/${article.category}/${article.slug}`}>
            <Card className="p-4 h-full bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors group cursor-pointer">
              <h4 className="font-medium mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h4>
              {article.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between">
                {article.read_time && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {article.read_time}
                  </Badge>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
