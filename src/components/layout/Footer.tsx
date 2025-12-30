import { Zap, Twitter, Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8">
          {/* Brand */}
          <div className="col-span-3 md:col-span-1 space-y-3 sm:space-y-4 mb-4 md:mb-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                HomeOfSMM
              </span>
            </Link>
            <p className="text-muted-foreground">
              The most advanced white-label SMM panel platform with fair commission and powerful features.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:support@homeofsmm.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-2 sm:space-y-4">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Product</h3>
            <div className="space-y-1 sm:space-y-2">
              <Link to="/features" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/demo" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </Link>
              <Link to="/api" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                API
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-2 sm:space-y-4">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Resources</h3>
            <div className="space-y-1 sm:space-y-2">
              <Link to="/docs" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
              <Link to="/blog" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link to="/support" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
              <Link to="/tutorial" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Tutorials
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-2 sm:space-y-4">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Company</h3>
            <div className="space-y-1 sm:space-y-2">
              <Link to="/about" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/contact" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link to="/privacy" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 HomeOfSMM. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm mt-4 md:mt-0">
            Built with ❤️ for SMM panel entrepreneurs
          </p>
        </div>
      </div>
    </footer>
  );
};