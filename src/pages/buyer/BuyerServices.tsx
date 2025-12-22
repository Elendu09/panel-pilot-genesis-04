import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Package, 
  Search,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  MessageCircle,
  Hash,
  Globe,
  ShoppingCart,
  Clock,
  Star,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTenant, useTenantServices } from "@/hooks/useTenant";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";

const BuyerServices = () => {
  const { panel } = useTenant();
  const { services, loading } = useTenantServices(panel?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [quantity, setQuantity] = useState(1000);
  const [targetUrl, setTargetUrl] = useState("");

  const categories = [
    { id: 'all', name: 'All', icon: Package },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'youtube', name: 'YouTube', icon: Youtube },
    { id: 'tiktok', name: 'TikTok', icon: Hash },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'telegram', name: 'Telegram', icon: MessageCircle },
    { id: 'other', name: 'Other', icon: Globe },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((service: any) => {
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Globe;
  };

  const handleOrder = () => {
    if (!selectedService) {
      toast({ title: "Please select a service", variant: "destructive" });
      return;
    }
    if (!targetUrl) {
      toast({ title: "Please enter a target URL", variant: "destructive" });
      return;
    }
    if (quantity < (selectedService.min_quantity || 1)) {
      toast({ title: `Minimum quantity is ${selectedService.min_quantity || 1}`, variant: "destructive" });
      return;
    }

    const totalPrice = (selectedService.price * quantity) / 1000;
    toast({
      title: "Order Placed!",
      description: `Your order for ${quantity} ${selectedService.name} has been placed. Total: $${totalPrice.toFixed(2)}`,
    });
    setSelectedService(null);
    setTargetUrl("");
    setQuantity(1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <BuyerLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl md:text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Browse and order our SMM services</p>
        </motion.div>

        {/* Search & Categories */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-9 bg-card/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count = cat.id === 'all' 
                ? services.length 
                : services.filter((s: any) => s.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "glass-card hover:bg-accent/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services List */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="space-y-3">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
                ))
              ) : filteredServices.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No services found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredServices.map((service: any) => {
                  const CategoryIcon = getCategoryIcon(service.category);
                  const isSelected = selectedService?.id === service.id;

                  return (
                    <motion.div
                      key={service.id}
                      variants={itemVariants}
                    >
                      <Card 
                        className={cn(
                          "glass-card-hover cursor-pointer transition-all",
                          isSelected && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedService(service)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                              <CategoryIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold">{service.name}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {service.description || 'High quality service with fast delivery'}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-lg font-bold">${service.price}</p>
                                  <p className="text-xs text-muted-foreground">per 1K</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service.estimated_time || '0-24 hours'}
                                </div>
                                <div>
                                  Min: {service.min_quantity || 100}
                                </div>
                                <div>
                                  Max: {(service.max_quantity || 10000).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Order Form */}
          <motion.div variants={itemVariants} className="lg:sticky lg:top-4 h-fit">
            <Card className="glass-card">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Place Order</h2>
                    <p className="text-sm text-muted-foreground">Fill in the details below</p>
                  </div>
                </div>

                {selectedService ? (
                  <div className="glass-card p-4 bg-primary/5">
                    <p className="font-medium">{selectedService.name}</p>
                    <p className="text-sm text-muted-foreground">${selectedService.price}/1K</p>
                  </div>
                ) : (
                  <div className="glass-card p-4 text-center">
                    <p className="text-sm text-muted-foreground">Select a service from the list</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Target URL</Label>
                  <Input
                    placeholder="https://..."
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    min={selectedService?.min_quantity || 1}
                    max={selectedService?.max_quantity || 100000}
                    className="bg-background/50"
                  />
                  {selectedService && (
                    <p className="text-xs text-muted-foreground">
                      Min: {selectedService.min_quantity || 100} | Max: {(selectedService.max_quantity || 10000).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold">
                      ${selectedService ? ((selectedService.price * quantity) / 1000).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    onClick={handleOrder}
                    disabled={!selectedService}
                  >
                    <Zap className="w-4 h-4" />
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerServices;
