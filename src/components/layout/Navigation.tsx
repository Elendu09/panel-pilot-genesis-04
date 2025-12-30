
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X, Zap, Users, Shield, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  const getDashboardPath = () => {
    switch (profile?.role) {
      case 'admin':
        return '/admin';
      case 'panel_owner':
        return '/panel';
      case 'buyer':
        return '/client';
      default:
        return '/';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border overflow-hidden">
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Floating bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-2 left-[10%] w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
        <div className="absolute top-4 left-[25%] w-1.5 h-1.5 rounded-full bg-primary/15 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1 left-[40%] w-1 h-1 rounded-full bg-primary/25 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-3 left-[55%] w-2 h-2 rounded-full bg-primary/10 animate-pulse" style={{ animationDelay: '0.3s' }} />
        <div className="absolute top-2 left-[70%] w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-4 left-[85%] w-1 h-1 rounded-full bg-primary/15 animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-1 right-[5%] w-2 h-2 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '0.9s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              HomeOfSMM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link to={getDashboardPath()}>Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/services">Service Tools</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-primary hover:shadow-glow">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Header Icons */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link to="/features" className="text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link to="/docs" className="text-muted-foreground hover:text-foreground">
                Documentation
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <ThemeToggle />
                {user ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                      {profile?.full_name || user.email}
                    </div>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to={getDashboardPath()}>Dashboard</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/services">Service Tools</Link>
                    </Button>
                    <Button variant="ghost" onClick={signOut} className="w-full justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-gradient-primary w-full justify-start">
                      <Link to="/auth">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
