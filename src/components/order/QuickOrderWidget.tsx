import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Calculator, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  min_quantity: number;
  max_quantity: number;
}

interface QuickOrderWidgetProps {
  services?: Service[];
  onPlaceOrder?: (serviceId: string, quantity: number, targetUrl: string) => void;
  showTitle?: boolean;
  compact?: boolean;
}

const defaultServices: Service[] = [
  { id: '1', name: 'Instagram Followers', category: 'instagram', price: 0.01, min_quantity: 100, max_quantity: 100000 },
  { id: '2', name: 'YouTube Views', category: 'youtube', price: 0.05, min_quantity: 1000, max_quantity: 1000000 },
  { id: '3', name: 'TikTok Likes', category: 'tiktok', price: 0.02, min_quantity: 100, max_quantity: 500000 },
];

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    instagram: '📸',
    youtube: '🎥',
    tiktok: '🎵',
    twitter: '🐦',
    facebook: '👥',
    linkedin: '💼'
  };
  return icons[category] || '🌟';
};

export function QuickOrderWidget({ 
  services = defaultServices, 
  onPlaceOrder,
  showTitle = true,
  compact = false 
}: QuickOrderWidgetProps) {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (selectedService && quantity) {
      const qty = parseInt(quantity) || 0;
      const cost = (qty / 1000) * selectedService.price;
      setTotalCost(cost);
    } else {
      setTotalCost(0);
    }
  }, [selectedService, quantity]);

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service || null);
    if (service) {
      setQuantity(service.min_quantity.toString());
    }
  };

  const handleProceed = () => {
    if (onPlaceOrder && selectedService) {
      onPlaceOrder(selectedService.id, parseInt(quantity), targetUrl);
    } else {
      // Navigate to order page with pre-filled data
      const params = new URLSearchParams();
      if (selectedService) params.set('service', selectedService.id);
      if (quantity) params.set('quantity', quantity);
      if (targetUrl) params.set('url', encodeURIComponent(targetUrl));
      navigate(`/new-order?${params.toString()}`);
    }
  };

  return (
    <Card className={`${compact ? 'p-4' : 'p-6'} bg-card/50 backdrop-blur-sm border-border/50`}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Fast Order</h3>
            <p className="text-xs text-muted-foreground">Quick service selection</p>
          </div>
        </div>
      )}

      <div className={`space-y-${compact ? '3' : '4'}`}>
        {/* Service Select */}
        <div className="space-y-1.5">
          <Label className="text-sm">Service</Label>
          <Select value={selectedService?.id || ''} onValueChange={handleServiceChange}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  <div className="flex items-center gap-2">
                    <span>{getCategoryIcon(service.category)}</span>
                    <span>{service.name}</span>
                    <Badge variant="secondary" className="ml-1 text-[10px]">
                      ${service.price.toFixed(3)}/1K
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedService && (
          <>
            {/* Target URL */}
            <div className="space-y-1.5">
              <Label className="text-sm">Target URL</Label>
              <Input
                placeholder={`https://${selectedService.category}.com/username`}
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="bg-background/50"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label className="text-sm">
                Quantity ({selectedService.min_quantity.toLocaleString()} - {selectedService.max_quantity.toLocaleString()})
              </Label>
              <Input
                type="number"
                min={selectedService.min_quantity}
                max={selectedService.max_quantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-background/50"
              />
            </div>

            {/* Price Display */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calculator className="w-4 h-4" />
                <span>Total Cost</span>
              </div>
              <span className="text-lg font-bold text-primary">
                ${totalCost.toFixed(4)}
              </span>
            </div>

            {/* Proceed Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={handleProceed}
                disabled={!targetUrl || !quantity}
                className="w-full gap-2"
              >
                Proceed to Order
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </Card>
  );
}
