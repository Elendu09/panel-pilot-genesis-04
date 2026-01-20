import { useState } from "react";
import { Twitter, Github, Linkedin, Mail, Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, source: 'footer' });
      
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already subscribed!",
            description: "This email is already on our newsletter list.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Subscribed!",
          description: "Thank you for subscribing. Stay tuned for updates!",
        });
        setEmail("");
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
              <img 
                src="/favicon.ico" 
                alt="HOME OF SMM" 
                className="w-7 h-7 rounded-lg object-cover"
              />
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
          <nav aria-label="Product navigation" className="space-y-2">
            <h3 className="font-semibold text-foreground text-xs sm:text-sm">{t('footer.product')}</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/features" aria-label="Features page" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.features')}
                </Link>
              </li>
              <li>
                <Link to="/pricing" aria-label="Pricing page" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/demo" aria-label="Demo page" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.demo')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources navigation" className="space-y-2">
            <h3 className="font-semibold text-foreground text-xs sm:text-sm">{t('footer.resources')}</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/docs" aria-label="Documentation" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.docs')}
                </Link>
              </li>
              <li>
                <Link to="/blog" aria-label="Blog" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link to="/support" aria-label="Support" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.support')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company navigation" className="space-y-2">
            <h3 className="font-semibold text-foreground text-xs sm:text-sm">{t('footer.company')}</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/about" aria-label="About us" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" aria-label="Contact us" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" aria-label="Privacy Policy" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" aria-label="Terms of Service" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-border mt-6 pt-6">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-sm font-semibold mb-2">{t('footer.newsletter')}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {t('footer.newsletter.desc')}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 text-xs"
                required
                disabled={isLoading}
              />
              <Button type="submit" size="sm" className="h-8 text-xs px-4" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : t('footer.subscribe')}
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground/60 mt-2">
              📧 Email notifications for new blog posts coming soon!
            </p>
          </div>
        </div>

        {/* Built with love */}
        <div className="border-t border-border mt-6 pt-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-muted-foreground text-xs">
            © 2024 HOME OF SMM. {t('footer.rights')}
          </p>
          <p className="text-muted-foreground text-xs flex items-center gap-1.5">
            {t('footer.built')} 
            <span className="relative inline-flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-blue-500/30 blur-md animate-pulse" />
              <Heart className="w-4 h-4 text-blue-500 fill-blue-500 relative z-10" />
            </span>
            {t('footer.for')}
          </p>
        </div>
      </div>
    </footer>
  );
};
