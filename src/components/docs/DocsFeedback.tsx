import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Send, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DocsFeedbackProps {
  articleId: string;
}

export function DocsFeedback({ articleId }: DocsFeedbackProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    if (type === 'negative') {
      setShowComment(true);
    } else {
      // For positive feedback, just submit immediately
      submitFeedback(type);
    }
  };

  const submitFeedback = async (type?: 'positive' | 'negative') => {
    const feedbackType = type || feedback;
    if (!feedbackType) return;

    // In a real app, you'd save this to the database
    console.log('Feedback submitted:', { 
      articleId, 
      feedback: feedbackType, 
      comment: comment || null 
    });

    setSubmitted(true);
    setShowComment(false);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 text-center backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <Check className="h-6 w-6 text-green-500" />
          </motion.div>
          <h4 className="font-semibold text-green-500 mb-1">Thank you for your feedback!</h4>
          <p className="text-sm text-muted-foreground">
            Your input helps us improve our documentation.
          </p>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Was this article helpful?</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Let us know how we can improve this documentation.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant={feedback === 'positive' ? 'default' : 'outline'}
            size="lg"
            onClick={() => handleFeedback('positive')}
            className={cn(
              "gap-2 transition-all",
              feedback === 'positive' && "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20"
            )}
          >
            <ThumbsUp className="h-5 w-5" />
            Yes, helpful
          </Button>
          <Button
            variant={feedback === 'negative' ? 'default' : 'outline'}
            size="lg"
            onClick={() => handleFeedback('negative')}
            className={cn(
              "gap-2 transition-all",
              feedback === 'negative' && "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
            )}
          >
            <ThumbsDown className="h-5 w-5" />
            Not really
          </Button>
        </div>

        <AnimatePresence>
          {showComment && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-4 overflow-hidden"
            >
              <Textarea
                placeholder="What could be improved? Your feedback helps us make better docs..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none bg-muted/30 border-border/50 focus:border-primary/50"
                rows={3}
              />
              <div className="flex justify-center gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowComment(false);
                    setFeedback(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => submitFeedback()} 
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
