import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Clock, Zap, Code, Link2, Settings, Users, Shield, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

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

const categoryIcons: Record<string, React.ElementType> = {
  "getting-started": Zap,
  "api": Code,
  "integration": Link2,
  "configuration": Settings,
  "user-management": Users,
  "security": Shield,
  "troubleshooting": AlertTriangle,
};

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

  const Icon = categoryIcons[category] || BookOpen;

  return (
    <motion.div 
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Related Articles</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article, index) => {
          const ArticleIcon = categoryIcons[article.category] || BookOpen;
          
          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link to={`/docs/${article.category}/${article.slug}`}>
                <Card className="p-4 h-full bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:border-primary/30 transition-all duration-200 group cursor-pointer">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                      <ArticleIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-2 flex-1">
                      {article.title}
                    </h4>
                  </div>
                  
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 pl-11">
                      {article.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pl-11">
                    {article.read_time && (
                      <Badge variant="secondary" className="text-xs bg-muted/50">
                        <Clock className="h-3 w-3 mr-1" />
                        {article.read_time}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors ml-auto">
                      Read more
                      <ArrowRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
