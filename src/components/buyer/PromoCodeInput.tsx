import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tag, Check, X, Loader2, ChevronDown, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount: number;
}

interface PromoCodeInputProps {
  panelId: string;
  orderAmount: number;
  onApply: (promo: PromoCode | null) => void;
  appliedPromo: PromoCode | null;
  className?: string;
}

export const PromoCodeInput = ({
  panelId,
  orderAmount,
  onApply,
  appliedPromo,
  className = ''
}: PromoCodeInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('panel_id', panelId)
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Invalid promo code');
        return;
      }

      // Check if max uses reached
      if (data.max_uses && data.used_count >= data.max_uses) {
        setError('This promo code has expired');
        return;
      }

      // Check minimum order amount
      if (data.min_order_amount && orderAmount < data.min_order_amount) {
        setError(`Minimum order: $${data.min_order_amount}`);
        return;
      }

      // Check validity dates
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        setError('This promo code has expired');
        return;
      }

      onApply(data as PromoCode);
      toast.success('Promo code applied!');
    } catch (err) {
      console.error('Promo code error:', err);
      setError('Failed to apply promo code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onApply(null);
    setCode('');
    setError('');
  };

  const getDiscountDisplay = (promo: PromoCode) => {
    if (promo.discount_type === 'percent') {
      return `${promo.discount_value}% OFF`;
    }
    return `$${promo.discount_value} OFF`;
  };

  return (
    <div className={className}>
      <Collapsible open={isOpen || !!appliedPromo} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>I have a promo code</span>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <AnimatePresence mode="wait">
            {appliedPromo ? (
              <motion.div
                key="applied"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2"
              >
                <div className="flex items-center justify-between p-3 rounded-lg bg-chart-2/10 border border-chart-2/30">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-chart-2" />
                    <span className="font-medium text-chart-2">{appliedPromo.code}</span>
                    <Badge variant="secondary" className="bg-chart-2/20 text-chart-2 gap-1">
                      <Percent className="w-3 h-3" />
                      {getDiscountDisplay(appliedPromo)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 space-y-2"
              >
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    className="uppercase"
                    onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  />
                  <Button
                    onClick={handleApply}
                    disabled={loading || !code.trim()}
                    className="shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
                
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-destructive"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
