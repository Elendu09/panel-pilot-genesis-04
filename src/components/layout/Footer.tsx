import { useState } from "react";
import { Zap, Twitter, Github, Linkedin, Mail, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    }
  };

  return (
    <footer className="bg-card border-t border-border relative overflow-hidden">
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Brand */}
          <div className="col-span-3 md:col-span-1 space-y-2 sm:space-y-3 mb-3 md:mb-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
            <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                HOME OF SMM
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground">
              The most advanced white-label SMM panel platform.
            </p>
            <div className="flex space-x-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="mailto:support@homeofsmm.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-xs sm:text-sm">Product</h3>
            <div className="space-y-1">
              <Link to="/features" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/demo" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-xs sm:text-sm">Resources</h3>
            <div className="space-y-1">
              <Link to="/docs" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
              <Link to="/blog" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link to="/support" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-xs sm:text-sm">Company</h3>
            <div className="space-y-1">
              <Link to="/about" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/contact" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link to="/privacy" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-border mt-6 pt-6">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-sm font-semibold mb-2">Subscribe to our newsletter</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get the latest updates and tips delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 text-xs"
                required
              />
              <Button type="submit" size="sm" className="h-8 text-xs px-4">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Built with love */}
        <div className="border-t border-border mt-6 pt-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-muted-foreground text-xs">
            © 2024 HOME OF SMM. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs flex items-center gap-1.5">
            Built with 
            <span className="relative inline-flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-blue-500/30 blur-md animate-pulse" />
              <Heart className="w-4 h-4 text-blue-500 fill-blue-500 relative z-10" />
            </span>
            for SMM panel entrepreneurs
          </p>
        </div>
      </div>
    </footer>
  );
};