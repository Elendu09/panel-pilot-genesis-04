
import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Users, Search, Package } from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const topServices = [
    {
      id: 1,
      rank: 1,
      icon: "📦",
      title: "Premium BOT START MIX",
      subtitle: "BOT START • boostlega.online",
      provider: "Direct provider",
      activeAccounts: "3519 active accounts",
      category: "Ads",
      price: "$6.9",
      featured: true
    },
    {
      id: 2,
      rank: 1,
      icon: "📦",
      title: "Premium подписчики 14 DAYS",
      subtitle: "Telegram Premium подписчик • boostlega.online",
      provider: "Direct provider",
      activeAccounts: "2600 active accounts",
      category: "Ads",
      price: "$8.1",
      featured: false
    },
    {
      id: 3,
      rank: 1,
      icon: "⭐",
      title: "Premium BOT START | NO ACTIVITY | 30 DAYS",
      subtitle: "Premium BOT START • testagram.com",
      provider: "Direct provider",
      activeAccounts: "12778 active accounts",
      category: "Ads",
      price: "$4",
      featured: false
    },
    {
      id: 4,
      rank: 1,
      icon: "🎯",
      title: "IG ru Подписчики RU HQ ( 6 ≡ 30 )",
      subtitle: "Instagram подписчик (таргет) • asmm.pro",
      provider: "Direct provider",
      activeAccounts: "8500 active accounts",
      category: "Ads",
      price: "$5.4",
      featured: false
    }
  ];

  const socialPlatforms = [
    { id: 'all', name: 'All', color: 'bg-blue-500' },
    { id: 'telegram', name: 'Telegram', color: 'bg-blue-400' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
    { id: 'vk', name: 'VK', color: 'bg-blue-600' },
    { id: 'youtube', name: 'Youtube', color: 'bg-red-500' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-700' },
    { id: 'twitter', name: 'Twitter', color: 'bg-sky-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Top SMM Panel Services
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-2">
            Choose the best services
          </p>
          <p className="text-gray-400 text-sm">
            Top is calculated by service money flow, so this is the list of biggest services
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="likes instagram"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              Search
            </Button>
          </div>

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
              <TabsTrigger value="providers" className="text-gray-300">Providers</TabsTrigger>
              <TabsTrigger value="services" className="text-gray-300">Services</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex justify-end mt-4">
            <Select defaultValue="usd">
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Social Platform Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {socialPlatforms.map((platform) => (
            <Button
              key={platform.id}
              variant={platform.id === 'all' ? 'default' : 'outline'}
              size="sm"
              className={`${platform.id === 'all' ? 'bg-blue-600' : 'bg-slate-800 border-slate-700 text-gray-300'} hover:bg-opacity-80`}
            >
              {platform.name}
            </Button>
          ))}
        </div>

        {/* Services List */}
        <div className="max-w-6xl mx-auto space-y-4">
          {topServices.map((service) => (
            <Card key={service.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-400 min-w-[2rem]">
                      {service.rank}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                        <span className="text-lg">{service.icon}</span>
                      </div>
                      
                      <div>
                        <h3 className="text-white font-semibold text-lg">{service.title}</h3>
                        <p className="text-gray-400 text-sm">{service.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="bg-red-600 text-white">
                        {service.provider}
                      </Badge>
                      <div className="flex items-center gap-1 text-green-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{service.activeAccounts}</span>
                      </div>
                    </div>

                    <Badge variant="secondary" className="bg-slate-700 text-gray-300">
                      {service.category}
                    </Badge>

                    <div className="text-right">
                      <div className="text-xl font-bold text-white">≈ {service.price}</div>
                    </div>

                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Buy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-white">Want to List Your Services?</h3>
              <p className="text-gray-300 mb-6">
                Join our platform and showcase your SMM services to thousands of potential customers
              </p>
              <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow">
                <Link to="/auth">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Services;
