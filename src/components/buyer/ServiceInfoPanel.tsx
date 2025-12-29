import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SpeedGauge } from './SpeedGauge';
import { Shield, Star, Zap, Award, Clock, CheckCircle } from 'lucide-react';

interface ServiceInfoPanelProps {
  service: {
    id: string;
    name: string;
    description?: string;
    estimated_time?: string;
    features?: Record<string, any>;
    min_quantity?: number;
    max_quantity?: number;
  } | null;
  className?: string;
}

export const ServiceInfoPanel = ({ service, className = '' }: ServiceInfoPanelProps) => {
  if (!service) {
    return (
      <Card className={`p-4 bg-muted/30 border-dashed ${className}`}>
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground">
          <Zap className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">Select a service to view details</p>
        </div>
      </Card>
    );
  }

  // Parse features from service
  const features = service.features || {};
  const hasGuarantee = features.guarantee || features.refill || service.description?.toLowerCase().includes('guarantee');
  const quality = features.quality || 
    (service.name.toLowerCase().includes('premium') ? 'Premium' :
     service.name.toLowerCase().includes('hq') ? 'HQ' : 'Standard');
  const speedPerDay = features.speed_per_day || features.daily_speed;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="p-4 space-y-4 bg-gradient-to-br from-background to-muted/20">
        {/* Service ID */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Service ID</span>
          <Badge variant="outline" className="font-mono text-xs">
            #{service.id.slice(0, 8).toUpperCase()}
          </Badge>
        </div>

        {/* Speed Gauge */}
        <div className="flex justify-center py-2">
          <SpeedGauge estimatedTime={service.estimated_time} />
        </div>

        {/* Quality & Badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          {/* Quality Badge */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge 
              variant={quality === 'Premium' ? 'default' : 'secondary'}
              className="gap-1"
            >
              <Award className="w-3 h-3" />
              {quality}
            </Badge>
          </motion.div>

          {/* Guarantee Badge */}
          {hasGuarantee && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge variant="outline" className="gap-1 border-chart-2 text-chart-2">
                <Shield className="w-3 h-3" />
                Guarantee
              </Badge>
            </motion.div>
          )}

          {/* Speed Badge */}
          {speedPerDay && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge variant="outline" className="gap-1">
                <Zap className="w-3 h-3" />
                {speedPerDay}/day
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              {service.min_quantity?.toLocaleString() || 1}
            </div>
            <div className="text-xs text-muted-foreground">Min Order</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              {service.max_quantity?.toLocaleString() || '10K'}
            </div>
            <div className="text-xs text-muted-foreground">Max Order</div>
          </div>
        </div>

        {/* Features List */}
        {service.description && (
          <div className="pt-2 border-t border-border/50 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Features</span>
            <div className="flex flex-wrap gap-1">
              {['Real', 'Fast', 'Safe', 'No Drop'].map((feature, i) => (
                service.description?.toLowerCase().includes(feature.toLowerCase()) && (
                  <Badge key={i} variant="secondary" className="text-xs gap-1">
                    <CheckCircle className="w-2.5 h-2.5" />
                    {feature}
                  </Badge>
                )
              ))}
            </div>
          </div>
        )}

        {/* Estimated Time */}
        {service.estimated_time && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. delivery: {service.estimated_time}</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
