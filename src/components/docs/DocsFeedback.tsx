import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageSquare, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <Card className="p-6 bg-green-500/10 border-green-500/20 text-center">
        <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
          <Check className="h-5 w-5" />
          <span className="font-medium">Thank you for your feedback!</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Your input helps us improve our documentation.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Was this article helpful?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Let us know how we can improve this documentation.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant={feedback === 'positive' ? 'default' : 'outline'}
            onClick={() => handleFeedback('positive')}
            className={cn(
              "gap-2",
              feedback === 'positive' && "bg-green-500 hover:bg-green-600"
            )}
          >
            <ThumbsUp className="h-4 w-4" />
            Yes, it helped
          </Button>
          <Button
            variant={feedback === 'negative' ? 'default' : 'outline'}
            onClick={() => handleFeedback('negative')}
            className={cn(
              "gap-2",
              feedback === 'negative' && "bg-red-500 hover:bg-red-600"
            )}
          >
            <ThumbsDown className="h-4 w-4" />
            Not really
          </Button>
        </div>

        {showComment && (
          <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
            <Textarea
              placeholder="What could be improved? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <Button onClick={() => submitFeedback()} className="gap-2">
              <Send className="h-4 w-4" />
              Submit Feedback
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
