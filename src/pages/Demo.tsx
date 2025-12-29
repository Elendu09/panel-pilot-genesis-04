import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Monitor, Smartphone, Tablet } from "lucide-react";

export default function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Navigation />
      
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge className="mb-6 bg-gradient-primary text-primary-foreground">
              <Play className="w-4 h-4 mr-2" />
              Live Demo
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-6">
              Experience HomeOfSMM
              <br />in Action
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              See how easy it is to create and manage your own SMM panel with our interactive demo
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary hover:shadow-glow">
                <Play className="mr-2 h-5 w-5" />
                Start Interactive Demo
              </Button>
              <Button variant="outline" size="lg">
                Watch Video Tour
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 text-center bg-card/70 backdrop-blur-sm">
                <Monitor className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Desktop Demo</h3>
                <p className="text-sm text-muted-foreground">Full admin panel experience</p>
              </Card>
              <Card className="p-6 text-center bg-card/70 backdrop-blur-sm">
                <Tablet className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Tablet View</h3>
                <p className="text-sm text-muted-foreground">Responsive design testing</p>
              </Card>
              <Card className="p-6 text-center bg-card/70 backdrop-blur-sm">
                <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Mobile Demo</h3>
                <p className="text-sm text-muted-foreground">Mobile-optimized interface</p>
              </Card>
            </div>
            
            <Card className="p-8 bg-card/70 backdrop-blur-sm aspect-video flex items-center justify-center">
              <div className="text-center">
                <Play className="w-24 h-24 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Interactive Demo Loading...</h3>
                <p className="text-muted-foreground">Click to start exploring HomeOfSMM features</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}