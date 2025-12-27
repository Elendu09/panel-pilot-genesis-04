import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Zap, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { SOCIAL_ICONS_MAP } from '@/components/icons/SocialIcons';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
  min_quantity?: number;
  max_quantity?: number;
}

interface FastOrderSectionProps {
  services: Service[];
  panelId: string;
  panelName: string;
  customization?: any;
}

export const FastOrderSection = ({ services, panelId, panelName, customization }: FastOrderSectionProps) => {
  const themeMode = customization?.themeMode || 'dark';
  const textColor = customization?.textColor || (themeMode === 'dark' ? '#FFFFFF' : '#1F2937');
  const textMuted = customization?.textMuted || (themeMode === 'dark' ? '#A1A1AA' : '#4B5563');
  const cardBg = themeMode === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white shadow-md border-gray-200';
  const inputBg = themeMode === 'dark' ? 'bg-slate-800/50 border-white/10' : 'bg-gray-50 border-gray-200';
  const navigate = useNavigate();
  const { buyer, refreshBuyer } = useBuyerAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [isOrdering, setIsOrdering] = useState(false);

  // Get top 8 popular services (sorted by price or just take first 8)
  const popularServices = services.slice(0, 8);
  const selectedService = services.find(s => s.id === selectedServiceId);
  const totalPrice = selectedService ? (selectedService.price * quantity) / 1000 : 0;

  const getCategoryIcon = (category: string) => {
    return SOCIAL_ICONS_MAP[category] || SOCIAL_ICONS_MAP.other;
  };

  const handleQuickOrder = async () => {
    if (!buyer) {
      // Redirect to auth if not logged in
      toast({
        title: "Login Required",
        description: "Please login or create an account to place orders",
      });
      navigate('/auth');
      return;
    }

    if (!selectedService) {
      toast({ title: "Please select a service", variant: "destructive" });
      return;
    }

    if (!targetUrl) {
      toast({ title: "Please enter a target URL", variant: "destructive" });
      return;
    }

    if ((buyer.balance || 0) < totalPrice) {
      toast({
        title: "Insufficient Balance",
        description: `You need $${totalPrice.toFixed(2)} but only have $${(buyer.balance || 0).toFixed(2)}`,
        variant: "destructive"
      });
      navigate('/deposit');
      return;
    }

    setIsOrdering(true);
    try {
      const orderNumber = `ORD${Date.now()}`;

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          panel_id: panelId,
          buyer_id: buyer.id,
          service_id: selectedService.id,
          target_url: targetUrl,
          quantity,
          price: totalPrice,
          status: 'pending',
          progress: 0,
        });

      if (orderError) throw orderError;

      const newBalance = (buyer.balance || 0) - totalPrice;
      await supabase
        .from('client_users')
        .update({
          balance: newBalance,
          total_spent: (buyer.total_spent || 0) + totalPrice,
        })
        .eq('id', buyer.id);

      await refreshBuyer();

      toast({
        title: "Order Placed!",
        description: `Your order for ${quantity.toLocaleString()} ${selectedService.name} has been placed.`,
      });

      setSelectedServiceId('');
      setTargetUrl('');
      setQuantity(1000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsOrdering(false);
    }
  };

  if (services.length === 0) return null;

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" id="fast-order">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Zap className="w-3 h-3 mr-1" />
            Fast Order
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textColor }}>
            Quick Order in Seconds
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: textMuted }}>
            Select a service, enter your link, and boost your social presence instantly
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Popular Services Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>Popular Services</h3>
            <div className="grid grid-cols-2 gap-3">
              {popularServices.map((service) => {
                const categoryData = getCategoryIcon(service.category);
                const CategoryIcon = categoryData.icon;
                const isSelected = selectedServiceId === service.id;

                return (
                  <motion.button
                    key={service.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : themeMode === 'dark' 
                          ? "border-white/10 bg-slate-800/50 hover:bg-slate-800 hover:border-primary/30"
                          : "border-gray-200 bg-white hover:bg-gray-50 hover:border-primary/30 shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn("p-2 rounded-lg", categoryData.bgColor)}>
                        <CategoryIcon className="w-4 h-4 text-white" size={16} />
                      </div>
                      <span className="text-lg font-bold" style={{ color: textColor }}>${service.price}</span>
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: textMuted }}>
                      {service.name}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Order Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className={`backdrop-blur-xl border ${cardBg}`}>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/60">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: textColor }}>Place Your Order</h3>
                    <p className="text-sm" style={{ color: textMuted }}>Fast & secure delivery</p>
                  </div>
                </div>

                {/* Service Selector */}
                <div className="space-y-2">
                  <Label style={{ color: textColor }}>Service</Label>
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger className={inputBg}>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - ${service.price}/1K
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target URL */}
                <div className="space-y-2">
                  <Label style={{ color: textColor }}>Link / Username</Label>
                  <Input
                    placeholder="https://instagram.com/yourprofile"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className={inputBg}
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label style={{ color: textColor }}>Quantity</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    min={selectedService?.min_quantity || 100}
                    max={selectedService?.max_quantity || 100000}
                    className={inputBg}
                  />
                  {selectedService && (
                    <p className="text-xs" style={{ color: textMuted }}>
                      Min: {selectedService.min_quantity || 100} | Max: {(selectedService.max_quantity || 10000).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className={`pt-4 border-t ${themeMode === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span style={{ color: textMuted }}>Total</span>
                    <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                  </div>

                  {buyer ? (
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={handleQuickOrder}
                      disabled={!selectedService || isOrdering}
                    >
                      {isOrdering ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      {isOrdering ? 'Processing...' : 'Place Order'}
                    </Button>
                  ) : (
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={() => navigate('/auth')}
                    >
                      <Lock className="w-4 h-4" />
                      Login to Order
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};