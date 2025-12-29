import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import BuyerLayout from "./BuyerLayout";

const BuyerPrivacy = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
  const [privacyPolicy, setPrivacyPolicy] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      if (!panel?.id) return;
      
      try {
        const { data } = await supabase
          .from('panel_settings')
          .select('privacy_policy')
          .eq('panel_id', panel.id)
          .single();
        
        if (data?.privacy_policy) {
          setPrivacyPolicy(data.privacy_policy);
        }
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, [panel?.id]);

  // Convert markdown-like formatting to HTML
  const formatContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        // Handle headers
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return (
            <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-foreground">
              {paragraph.replace(/\*\*/g, '')}
            </h3>
          );
        }
        // Handle list items
        if (paragraph.startsWith('- ')) {
          const items = paragraph.split('\n').filter(item => item.startsWith('- '));
          return (
            <ul key={index} className="list-disc list-inside space-y-1 mb-4 text-muted-foreground">
              {items.map((item, i) => (
                <li key={i}>{item.replace('- ', '')}</li>
              ))}
            </ul>
          );
        }
        // Regular paragraphs
        return (
          <p key={index} className="text-muted-foreground mb-4 leading-relaxed">
            {paragraph}
          </p>
        );
      });
  };

  return (
    <BuyerLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">
              How we collect, use, and protect your data
            </p>
          </div>
        </div>

        {/* Content */}
        <Card className="glass-card">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/50">
              <div className="p-3 rounded-xl bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">{panel?.name || 'Panel'}</h2>
                <p className="text-sm text-muted-foreground">Privacy Policy</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {formatContent(privacyPolicy)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerPrivacy;
