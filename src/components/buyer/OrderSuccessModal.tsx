import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  Plus, 
  Loader2,
  ExternalLink,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Confetti } from '@/components/effects/Confetti';
import { toast } from '@/hooks/use-toast';

interface OrderSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  serviceName: string;
  quantity: number;
  totalPrice: string;
  onNewOrder: () => void;
}

export const OrderSuccessModal = ({
  open,
  onOpenChange,
  orderNumber,
  serviceName,
  quantity,
  totalPrice,
  onNewOrder,
}: OrderSuccessModalProps) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      // Delay confetti slightly for better effect
      const timer = setTimeout(() => setShowConfetti(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [open]);

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Order number copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleTrackOrder = () => {
    onOpenChange(false);
    navigate('/orders');
  };

  const handleNewOrder = () => {
    onOpenChange(false);
    onNewOrder();
  };

  return (
    <>
      <Confetti isActive={showConfetti} particleCount={60} duration={4000} />
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
          {/* Success Header */}
          <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white" />
              <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-white" />
            </div>
            
            <div className="relative z-10 text-center">
              {/* Animated Checkmark */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2
                }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                >
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white mb-1">
                    Order Successful!
                  </DialogTitle>
                </DialogHeader>
                <p className="text-white/80 text-sm">
                  Your order is now being processed
                </p>
              </motion.div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-5">
            {/* Order Number Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-muted/50 rounded-xl p-4 border border-border/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Order Number</p>
                  <p className="text-lg font-bold font-mono tracking-wider">{orderNumber}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyOrderNumber}
                  className="h-10 w-10 shrink-0"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Copy className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Service</span>
                <span className="text-sm font-medium text-right max-w-[200px] truncate">
                  {serviceName}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <span className="text-sm font-medium">{quantity.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Total Paid</span>
                <span className="text-lg font-bold text-primary">{totalPrice}</span>
              </div>
            </motion.div>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <Badge 
                variant="outline" 
                className="px-4 py-2 gap-2 text-amber-600 border-amber-500/30 bg-amber-500/10"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Processing</span>
              </Badge>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 gap-3 pt-2"
            >
              <Button
                variant="outline"
                onClick={handleNewOrder}
                className="h-12 gap-2"
              >
                <Plus className="h-4 w-4" />
                New Order
              </Button>
              <Button
                onClick={handleTrackOrder}
                className="h-12 gap-2"
              >
                <Package className="h-4 w-4" />
                Track Order
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderSuccessModal;
