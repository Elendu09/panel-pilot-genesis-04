import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ComingSoonProps {
  title?: string;
  description?: string;
  estimatedTime?: string;
  showBackButton?: boolean;
  backTo?: string;
}

export const ComingSoon = ({
  title = "Coming Soon",
  description = "This feature is currently under development and will be available soon.",
  estimatedTime = "Q2 2024",
  showBackButton = true,
  backTo = "/"
}: ComingSoonProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
      <Card className="max-w-md w-full p-8 text-center bg-card/80 backdrop-blur-sm border-primary/10">
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          {title}
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {description}
        </p>
        
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            Estimated Launch: <span className="text-foreground">{estimatedTime}</span>
          </p>
        </div>
        
        {showBackButton && (
          <Button asChild variant="outline" className="w-full">
            <Link to={backTo}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Link>
          </Button>
        )}
      </Card>
    </div>
  );
};