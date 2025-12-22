import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, X, Clock } from 'lucide-react';

interface PreviewData {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  borderRadius: string;
  logoUrl: string;
  companyName: string;
  tagline: string;
  headerTitle: string;
  footerText: string;
  showHero: boolean;
  showFeatures: boolean;
  showStats: boolean;
  showTestimonials: boolean;
  expiresAt: number;
}

const StorefrontPreview = () => {
  const { userId, previewId } = useParams();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [expired, setExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Load preview data from localStorage
    const storedData = localStorage.getItem(`preview_${previewId}`);
    if (storedData) {
      const parsed = JSON.parse(storedData) as PreviewData;
      
      // Check if expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        setExpired(true);
        localStorage.removeItem(`preview_${previewId}`);
      } else {
        setPreviewData(parsed);
      }
    } else {
      setExpired(true);
    }
  }, [previewId]);

  // Update remaining time
  useEffect(() => {
    if (!previewData?.expiresAt) return;
    
    const updateTime = () => {
      const remaining = previewData.expiresAt - Date.now();
      if (remaining <= 0) {
        setExpired(true);
        setTimeRemaining('');
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [previewData?.expiresAt]);

  const handleClosePreview = () => {
    if (previewId) {
      localStorage.removeItem(`preview_${previewId}`);
    }
    window.close();
  };

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Preview Expired</h2>
            <p className="text-muted-foreground mb-4">
              This preview link has expired. Please generate a new preview from the Design Customization page.
            </p>
            <Button onClick={() => window.close()}>Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: previewData.backgroundColor,
        color: previewData.textColor 
      }}
    >
      {/* Preview Mode Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-amber-600 text-white">
              <Eye className="w-3 h-3 mr-1" />
              Preview Mode
            </Badge>
            <span className="text-sm font-medium">
              Changes are not saved. This preview expires in {timeRemaining}
            </span>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleClosePreview}
            className="gap-2 bg-amber-600 border-amber-700 text-white hover:bg-amber-700"
          >
            <X className="w-4 h-4" />
            Close Preview
          </Button>
        </div>
      </div>

      {/* Header */}
      <header 
        className="sticky top-10 z-40 border-b"
        style={{ 
          backgroundColor: previewData.surfaceColor,
          borderColor: `${previewData.mutedColor}30`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {previewData.logoUrl && (
              <img src={previewData.logoUrl} alt="Logo" className="h-10 w-auto" />
            )}
            <span className="text-xl font-bold" style={{ color: previewData.primaryColor }}>
              {previewData.headerTitle || previewData.companyName}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-sm" style={{ color: previewData.mutedColor }}>Services</span>
            <span className="text-sm" style={{ color: previewData.mutedColor }}>Pricing</span>
            <span className="text-sm" style={{ color: previewData.mutedColor }}>Support</span>
            <Button 
              size="sm"
              style={{ backgroundColor: previewData.primaryColor }}
              className="text-white"
            >
              Login
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {previewData.showHero && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {previewData.companyName}
            </h1>
            <p className="text-xl mb-8" style={{ color: previewData.mutedColor }}>
              {previewData.tagline}
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg"
                style={{ backgroundColor: previewData.primaryColor }}
                className="text-white"
              >
                Get Started
              </Button>
              <Button 
                size="lg"
                variant="outline"
                style={{ 
                  borderColor: previewData.secondaryColor,
                  color: previewData.secondaryColor
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {previewData.showFeatures && (
        <section 
          className="py-16 px-4"
          style={{ backgroundColor: previewData.surfaceColor }}
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {['Instagram', 'TikTok', 'YouTube'].map((platform) => (
                <Card 
                  key={platform}
                  style={{ 
                    backgroundColor: previewData.backgroundColor,
                    borderColor: `${previewData.mutedColor}30`,
                    borderRadius: `${previewData.borderRadius}px`
                  }}
                >
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{platform}</h3>
                    <p style={{ color: previewData.mutedColor }}>
                      High quality {platform.toLowerCase()} services
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {previewData.showStats && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: 'Active Users', value: '10K+' },
                { label: 'Orders', value: '50K+' },
                { label: 'Services', value: '100+' },
                { label: 'Uptime', value: '99.9%' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold" style={{ color: previewData.primaryColor }}>
                    {stat.value}
                  </p>
                  <p className="text-sm" style={{ color: previewData.mutedColor }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer 
        className="py-8 px-4 border-t"
        style={{ 
          backgroundColor: previewData.surfaceColor,
          borderColor: `${previewData.mutedColor}30`
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ color: previewData.mutedColor }}>
            {previewData.footerText}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontPreview;