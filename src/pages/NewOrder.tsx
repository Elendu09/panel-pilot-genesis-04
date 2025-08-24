import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Calculator, ShoppingCart, Zap, Clock, Users, Shield, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function NewOrder() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');
  
  const [selectedService, setSelectedService] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  // Sample services (same as Services page)
  const sampleServices = [
    {
      id: '1',
      name: 'Instagram Followers',
      description: 'High-quality Instagram followers from real accounts',
      category: 'instagram',
      price: 0.01,
      min_quantity: 100,
      max_quantity: 100000,
      estimated_time: '0-1 hour',
      features: ['Real accounts', 'No password required', 'Instant start', 'Lifetime guarantee']
    },
    {
      id: '2',
      name: 'YouTube Views',
      description: 'Boost your YouTube video views with real engagement',
      category: 'youtube',
      price: 0.05,
      min_quantity: 1000,
      max_quantity: 1000000,
      estimated_time: '1-6 hours',
      features: ['Real views', 'High retention', 'Safe for monetization', '24/7 support']
    },
    {
      id: '3',
      name: 'TikTok Likes',
      description: 'Get more likes on your TikTok videos instantly',
      category: 'tiktok',
      price: 0.02,
      min_quantity: 100,
      max_quantity: 500000,
      estimated_time: '0-30 minutes',
      features: ['Instant delivery', 'Real users', 'No drop guarantee', 'Worldwide']
    }
  ];

  useEffect(() => {
    if (serviceId) {
      const service = sampleServices.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(service);
        setQuantity(service.min_quantity.toString());
      }
    }
  }, [serviceId]);

  useEffect(() => {
    if (selectedService && quantity) {
      setCalculating(true);
      const timer = setTimeout(() => {
        const qty = parseInt(quantity) || 0;
        const cost = (qty / 1000) * selectedService.price;
        setTotalCost(cost);
        setCalculating(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedService, quantity]);

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleServiceChange = (serviceId: string) => {
    const service = sampleServices.find(s => s.id === serviceId);
    setSelectedService(service);
    if (service) {
      setQuantity(service.min_quantity.toString());
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedService || !quantity || !targetUrl) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return;
    }

    const qty = parseInt(quantity);
    if (qty < selectedService.min_quantity || qty > selectedService.max_quantity) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: `Quantity must be between ${selectedService.min_quantity} and ${selectedService.max_quantity}`
      });
      return;
    }

    if (totalCost > (profile?.balance || 0)) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: "Please add funds to your account before placing this order"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Generate order number
      const orderNumber = `ORD${Date.now()}`;
      
      const { error } = await supabase
        .from('orders')
        .insert({
          buyer_id: profile.id,
          service_id: selectedService.id,
          order_number: orderNumber,
          target_url: targetUrl,
          quantity: qty,
          price: totalCost,
          notes: notes || null
        });

      if (error) throw error;

      toast({
        title: "Order Placed Successfully!",
        description: `Order ${orderNumber} has been created and will start processing soon.`
      });

      // Reset form
      setQuantity(selectedService.min_quantity.toString());
      setTargetUrl('');
      setNotes('');
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "There was an error placing your order. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      instagram: '📸',
      youtube: '🎥',
      tiktok: '🎵',
      twitter: '🐦',
      facebook: '👥',
      linkedin: '💼'
    };
    return icons[category] || '🌟';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Navigation />
      
      <section className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Link to="/services" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Link>
            </div>
            
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-4">
                Place New Order
              </h1>
              <p className="text-lg text-muted-foreground">
                Select a service and customize your order
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    Order Details
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="service">Select Service *</Label>
                      <Select value={selectedService?.id || ''} onValueChange={handleServiceChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleServices.map(service => (
                            <SelectItem key={service.id} value={service.id}>
                              <div className="flex items-center gap-2">
                                <span>{getCategoryIcon(service.category)}</span>
                                <span>{service.name}</span>
                                <Badge variant="secondary" className="ml-2">
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
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{getCategoryIcon(selectedService.category)}</span>
                            <h3 className="font-semibold">{selectedService.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{selectedService.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedService.features?.slice(0, 4).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="target-url">Target URL *</Label>
                          <Input
                            id="target-url"
                            type="url"
                            placeholder="https://instagram.com/username"
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            required
                          />
                          <p className="text-sm text-muted-foreground">
                            Enter the URL of your {selectedService.category} profile/post
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="quantity">
                            Quantity * (Min: {selectedService.min_quantity.toLocaleString()} - Max: {selectedService.max_quantity.toLocaleString()})
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            min={selectedService.min_quantity}
                            max={selectedService.max_quantity}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Additional Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any special instructions or notes for your order..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card className="p-6 sticky top-24">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Order Summary
                  </h3>
                  
                  {selectedService ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service:</span>
                        <span className="font-medium">{selectedService.name}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{quantity || '0'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price per 1K:</span>
                        <span className="font-medium">${selectedService.price.toFixed(3)}</span>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Cost:</span>
                          <span className="text-primary">
                            {calculating ? 'Calculating...' : `$${totalCost.toFixed(4)}`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Delivery: {selectedService.estimated_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          <span>Safe & Secure</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Real Users</span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Account Balance:</span>
                          <span className="font-medium">${(profile?.balance || 0).toFixed(2)}</span>
                        </div>
                        {totalCost > (profile?.balance || 0) && (
                          <p className="text-sm text-destructive">
                            Insufficient balance. Please add funds to continue.
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        onClick={handleSubmitOrder}
                        disabled={loading || !targetUrl || !quantity || totalCost > (profile?.balance || 0)}
                        className="w-full"
                        size="lg"
                      >
                        {loading ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Place Order
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🛒</div>
                      <p className="text-muted-foreground">
                        Select a service to see pricing
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}