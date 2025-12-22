import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, X, Clock, Star, Users, Zap, Shield, TrendingUp, CheckCircle, Instagram, Youtube, Twitter, MessageCircle } from 'lucide-react';

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
  const { previewId } = useParams();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [expired, setExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const storedData = localStorage.getItem(`preview_${previewId}`);
    if (storedData) {
      const parsed = JSON.parse(storedData) as PreviewData;
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Clock className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Preview Expired</h2>
            <p className="text-slate-600 mb-4">
              This preview link has expired. Please generate a new preview from the Design Customization page.
            </p>
            <Button onClick={() => window.close()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const services = [
    { icon: Instagram, name: 'Instagram', description: 'Followers, Likes, Views, Comments', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { icon: Youtube, name: 'YouTube', description: 'Subscribers, Views, Watch Hours', color: 'bg-red-500' },
    { icon: Twitter, name: 'Twitter / X', description: 'Followers, Retweets, Likes', color: 'bg-slate-900' },
    { icon: MessageCircle, name: 'TikTok', description: 'Followers, Likes, Views, Shares', color: 'bg-gradient-to-br from-cyan-400 to-pink-500' },
    { icon: Users, name: 'Facebook', description: 'Page Likes, Post Engagement', color: 'bg-blue-600' },
    { icon: TrendingUp, name: 'LinkedIn', description: 'Connections, Post Engagement', color: 'bg-blue-700' },
  ];

  const testimonials = [
    { name: 'Sarah K.', role: 'Influencer', content: 'Amazing service! My Instagram grew by 10K followers in just 2 weeks.', avatar: 'SK' },
    { name: 'Mike R.', role: 'Business Owner', content: 'The best SMM panel I have ever used. Fast delivery and great prices.', avatar: 'MR' },
    { name: 'Emily C.', role: 'Content Creator', content: 'Customer support is incredible. They helped me 24/7 with any questions.', avatar: 'EC' },
  ];

  const stats = [
    { value: '2000+', label: 'Satisfied Customers' },
    { value: '50K+', label: 'Orders Completed' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '24/7', label: 'Customer Support' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Mode Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-amber-600 text-white border-0">
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
      <header className="sticky top-10 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {previewData.logoUrl && (
              <img src={previewData.logoUrl} alt="Logo" className="h-10 w-auto rounded-lg" />
            )}
            <span className="text-xl font-bold text-slate-900">
              {previewData.headerTitle || previewData.companyName}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Services</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Reviews</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
            <Button 
              size="sm"
              className="text-white shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: previewData.primaryColor }}
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {previewData.showHero && (
        <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-0 px-4 py-1.5">
              <Star className="w-4 h-4 mr-2 fill-blue-500" />
              #1 Rated SMM Panel
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {previewData.companyName}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              {previewData.tagline || 'Grow your social media presence with high-quality followers, likes, views, and engagement for all major platforms.'}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg"
                className="text-white shadow-lg hover:shadow-xl transition-all px-8"
                style={{ backgroundColor: previewData.primaryColor }}
              >
                Start Growing Today
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                View Services
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">Instant Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {previewData.showStats && (
        <section className="py-12 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold mb-1" style={{ color: previewData.primaryColor }}>
                    {stat.value}
                  </p>
                  <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {previewData.showFeatures && (
        <section id="services" className="py-16 px-4 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Services</h2>
              <p className="text-slate-600 max-w-xl mx-auto">
                We provide high-quality social media marketing services for all major platforms
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card 
                    key={index}
                    className="bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{service.name}</h3>
                      <p className="text-slate-600 text-sm">{service.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {previewData.showTestimonials && (
        <section id="testimonials" className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Loved by 2000+ Customers</h2>
              <p className="text-slate-600">See what our satisfied customers have to say</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-slate-50 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{testimonial.name}</p>
                        <p className="text-slate-500 text-xs">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section 
        className="py-16 px-4"
        style={{ background: `linear-gradient(135deg, ${previewData.primaryColor}, ${previewData.secondaryColor || previewData.primaryColor})` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to grow your social media?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers and start growing your online presence today.
          </p>
          <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg px-8">
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <h3 className="font-bold text-lg mb-4">{previewData.companyName}</h3>
              <p className="text-slate-400 text-sm">
                Your trusted partner for social media growth and engagement.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
                <li><a href="#" className="hover:text-white transition-colors">TikTok</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400 text-sm">{previewData.footerText}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontPreview;