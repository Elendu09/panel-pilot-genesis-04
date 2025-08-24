
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";

const CreatePanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [panelName, setPanelName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreatePanel = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // Panel creation logic will be handled by existing auth context
    localStorage.setItem('pendingPanelCreation', JSON.stringify({
      panelName,
      description,
      userId: user.id
    }));
    navigate("/panel/onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Create Your SMM Panel
            </h1>
            <p className="text-muted-foreground text-lg">
              Start your own social media marketing business with our powerful platform
            </p>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Panel Details
              </CardTitle>
              <CardDescription>
                Enter the basic information for your new SMM panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="panelName">Panel Name</Label>
                <Input
                  id="panelName"
                  placeholder="My SMM Panel"
                  value={panelName}
                  onChange={(e) => setPanelName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your SMM panel..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  onClick={handleCreatePanel}
                  className="w-full bg-gradient-primary hover:shadow-glow"
                  disabled={!panelName.trim()}
                >
                  Create Panel <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                
                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Don't have an account? <Link to="/auth" className="text-primary hover:underline">Sign up here</Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePanel;
