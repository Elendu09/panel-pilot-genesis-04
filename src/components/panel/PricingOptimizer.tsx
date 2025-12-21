import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Zap,
  BarChart3,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Settings2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  costPrice: number;
  competitorPrices: number[];
  salesVolume: number;
  margin: number;
}

interface PriceSuggestion {
  serviceId: string;
  serviceName: string;
  currentPrice: number;
  suggestedPrice: number;
  competitorAvg: number;
  competitorMin: number;
  competitorMax: number;
  currentMargin: number;
  suggestedMargin: number;
  strategy: 'competitive' | 'premium' | 'value' | 'aggressive';
  confidence: number;
  potentialRevenue: number;
}

interface PricingOptimizerProps {
  services?: Service[];
  onApplyPrices?: (suggestions: PriceSuggestion[]) => void;
}

export function PricingOptimizer({ services: propServices, onApplyPrices }: PricingOptimizerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [strategy, setStrategy] = useState<'competitive' | 'premium' | 'value' | 'aggressive'>('competitive');
  const [marginTarget, setMarginTarget] = useState(25);
  const [undercut, setUndercut] = useState(5);
  const [autoApply, setAutoApply] = useState(false);

  // Mock services data for demo
  const mockServices: Service[] = [
    { id: '1', name: 'Instagram Followers 1K', category: 'instagram', currentPrice: 4.99, costPrice: 2.50, competitorPrices: [5.99, 4.50, 6.99, 4.25], salesVolume: 450, margin: 49.9 },
    { id: '2', name: 'Instagram Likes 1K', category: 'instagram', currentPrice: 1.99, costPrice: 0.80, competitorPrices: [2.50, 1.75, 2.99, 1.50], salesVolume: 890, margin: 59.8 },
    { id: '3', name: 'YouTube Views 10K', category: 'youtube', currentPrice: 12.99, costPrice: 7.00, competitorPrices: [15.99, 11.99, 14.50, 12.00], salesVolume: 230, margin: 46.1 },
    { id: '4', name: 'YouTube Subscribers 1K', category: 'youtube', currentPrice: 29.99, costPrice: 18.00, competitorPrices: [35.00, 28.50, 32.99, 27.00], salesVolume: 120, margin: 40.0 },
    { id: '5', name: 'TikTok Followers 1K', category: 'tiktok', currentPrice: 3.99, costPrice: 1.80, competitorPrices: [4.99, 3.50, 5.50, 3.25], salesVolume: 670, margin: 54.9 },
    { id: '6', name: 'TikTok Likes 1K', category: 'tiktok', currentPrice: 0.99, costPrice: 0.40, competitorPrices: [1.50, 0.85, 1.25, 0.75], salesVolume: 1200, margin: 59.6 },
    { id: '7', name: 'Twitter Followers 1K', category: 'twitter', currentPrice: 8.99, costPrice: 5.00, competitorPrices: [10.99, 7.99, 9.50, 8.50], salesVolume: 180, margin: 44.4 },
    { id: '8', name: 'Facebook Page Likes 1K', category: 'facebook', currentPrice: 6.99, costPrice: 3.50, competitorPrices: [8.50, 6.50, 7.99, 6.25], salesVolume: 290, margin: 49.9 },
  ];

  const services = propServices || mockServices;

  // Generate price suggestions based on strategy
  const suggestions = useMemo<PriceSuggestion[]>(() => {
    return services.map(service => {
      const competitorAvg = service.competitorPrices.reduce((a, b) => a + b, 0) / service.competitorPrices.length;
      const competitorMin = Math.min(...service.competitorPrices);
      const competitorMax = Math.max(...service.competitorPrices);

      let suggestedPrice: number;
      let strategyUsed = strategy;

      switch (strategy) {
        case 'aggressive':
          suggestedPrice = Math.max(service.costPrice * 1.1, competitorMin * (1 - undercut / 100));
          break;
        case 'value':
          suggestedPrice = competitorMin + (competitorAvg - competitorMin) * 0.3;
          break;
        case 'premium':
          suggestedPrice = competitorAvg * 1.15;
          break;
        case 'competitive':
        default:
          suggestedPrice = competitorAvg * (1 - undercut / 100);
      }

      // Ensure minimum margin
      const minPrice = service.costPrice * (1 + marginTarget / 100);
      suggestedPrice = Math.max(suggestedPrice, minPrice);
      suggestedPrice = Math.round(suggestedPrice * 100) / 100;

      const suggestedMargin = ((suggestedPrice - service.costPrice) / suggestedPrice) * 100;
      const potentialRevenue = (suggestedPrice - service.currentPrice) * service.salesVolume;
      const confidence = calculateConfidence(service, suggestedPrice, competitorAvg);

      return {
        serviceId: service.id,
        serviceName: service.name,
        currentPrice: service.currentPrice,
        suggestedPrice,
        competitorAvg,
        competitorMin,
        competitorMax,
        currentMargin: service.margin,
        suggestedMargin,
        strategy: strategyUsed,
        confidence,
        potentialRevenue,
      };
    });
  }, [services, strategy, marginTarget, undercut]);

  // Summary stats
  const stats = useMemo(() => {
    const avgCurrentMargin = suggestions.reduce((a, b) => a + b.currentMargin, 0) / suggestions.length;
    const avgSuggestedMargin = suggestions.reduce((a, b) => a + b.suggestedMargin, 0) / suggestions.length;
    const totalPotentialRevenue = suggestions.reduce((a, b) => a + b.potentialRevenue, 0);
    const priceIncreases = suggestions.filter(s => s.suggestedPrice > s.currentPrice).length;
    const priceDecreases = suggestions.filter(s => s.suggestedPrice < s.currentPrice).length;

    return {
      avgCurrentMargin,
      avgSuggestedMargin,
      totalPotentialRevenue,
      priceIncreases,
      priceDecreases,
      unchanged: suggestions.length - priceIncreases - priceDecreases,
    };
  }, [suggestions]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAnalyzing(false);
    toast.success('Analysis complete', { description: `${suggestions.length} services analyzed` });
  };

  const toggleSuggestion = (id: string) => {
    setSelectedSuggestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedSuggestions(new Set(suggestions.map(s => s.serviceId)));
  };

  const deselectAll = () => {
    setSelectedSuggestions(new Set());
  };

  const applySelected = () => {
    const selected = suggestions.filter(s => selectedSuggestions.has(s.serviceId));
    onApplyPrices?.(selected);
    toast.success('Prices updated', { description: `${selected.length} services updated` });
    setSelectedSuggestions(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Pricing Optimizer
          </h2>
          <p className="text-muted-foreground">Analyze competitor prices and optimize your margins</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings2 className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Prices'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/60 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Current Margin</p>
                <p className="text-xl font-bold">{stats.avgCurrentMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suggested Margin</p>
                <p className="text-xl font-bold text-green-500">{stats.avgSuggestedMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue Impact</p>
                <p className={cn(
                  "text-xl font-bold",
                  stats.totalPotentialRevenue >= 0 ? "text-green-500" : "text-destructive"
                )}>
                  {stats.totalPotentialRevenue >= 0 ? '+' : ''}${Math.abs(stats.totalPotentialRevenue).toFixed(0)}/mo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recommendations</p>
                <div className="flex gap-2 text-sm">
                  <span className="text-green-500">↑{stats.priceIncreases}</span>
                  <span className="text-destructive">↓{stats.priceDecreases}</span>
                  <span className="text-muted-foreground">={stats.unchanged}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Selector */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pricing Strategy</CardTitle>
          <CardDescription>Choose your pricing approach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: 'competitive', label: 'Competitive', desc: 'Match market average', icon: Target },
              { key: 'aggressive', label: 'Aggressive', desc: 'Undercut competitors', icon: Zap },
              { key: 'value', label: 'Value', desc: 'Balance price & quality', icon: BarChart3 },
              { key: 'premium', label: 'Premium', desc: 'Position as high-end', icon: TrendingUp },
            ].map(s => (
              <motion.button
                key={s.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStrategy(s.key as typeof strategy)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  strategy === s.key
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <s.icon className={cn("w-5 h-5 mb-2", strategy === s.key ? "text-primary" : "text-muted-foreground")} />
                <p className="font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Table */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Price Suggestions</CardTitle>
              <CardDescription>{selectedSuggestions.size} of {suggestions.length} selected</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>Select All</Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>Deselect All</Button>
              {selectedSuggestions.size > 0 && (
                <Button size="sm" onClick={applySelected}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Apply Selected ({selectedSuggestions.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Suggested</TableHead>
                  <TableHead className="text-center">Competitor Range</TableHead>
                  <TableHead className="text-right">Margin Change</TableHead>
                  <TableHead className="text-center">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {suggestions.map((suggestion, index) => {
                    const priceChange = suggestion.suggestedPrice - suggestion.currentPrice;
                    const isIncrease = priceChange > 0;
                    const isSelected = selectedSuggestions.has(suggestion.serviceId);

                    return (
                      <motion.tr
                        key={suggestion.serviceId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                        )}
                        onClick={() => toggleSuggestion(suggestion.serviceId)}
                      >
                        <TableCell>
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                          )}>
                            {isSelected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{suggestion.serviceName}</p>
                            <Badge variant="secondary" className="mt-1 text-xs capitalize">
                              {suggestion.strategy}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${suggestion.currentPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-mono font-medium">
                              ${suggestion.suggestedPrice.toFixed(2)}
                            </span>
                            {priceChange !== 0 && (
                              <Badge className={cn(
                                "text-xs",
                                isIncrease ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"
                              )}>
                                {isIncrease ? '+' : ''}{priceChange.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm text-muted-foreground">
                            ${suggestion.competitorMin.toFixed(2)} - ${suggestion.competitorMax.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            avg: ${suggestion.competitorAvg.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-muted-foreground">{suggestion.currentMargin.toFixed(0)}%</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span className={cn(
                              "font-medium",
                              suggestion.suggestedMargin > suggestion.currentMargin ? "text-green-500" : "text-destructive"
                            )}>
                              {suggestion.suggestedMargin.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={suggestion.confidence} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">{suggestion.confidence}%</span>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Optimizer Settings</DialogTitle>
            <DialogDescription>Configure pricing optimization parameters</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Minimum Margin Target: {marginTarget}%</Label>
              <Slider
                value={[marginTarget]}
                onValueChange={([v]) => setMarginTarget(v)}
                min={10}
                max={50}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Suggested prices will maintain at least this margin
              </p>
            </div>
            <div className="space-y-2">
              <Label>Competitor Undercut: {undercut}%</Label>
              <Slider
                value={[undercut]}
                onValueChange={([v]) => setUndercut(v)}
                min={0}
                max={20}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Price below competitor average by this percentage
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-apply suggestions</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically update prices after analysis
                </p>
              </div>
              <Switch checked={autoApply} onCheckedChange={setAutoApply} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button onClick={() => setShowSettings(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to calculate confidence score
function calculateConfidence(service: Service, suggestedPrice: number, competitorAvg: number): number {
  let confidence = 70;
  
  // More data points = higher confidence
  if (service.competitorPrices.length >= 4) confidence += 10;
  if (service.salesVolume > 500) confidence += 10;
  
  // Price close to competitor average = higher confidence
  const deviation = Math.abs(suggestedPrice - competitorAvg) / competitorAvg;
  if (deviation < 0.1) confidence += 10;
  else if (deviation > 0.3) confidence -= 15;
  
  return Math.min(95, Math.max(50, confidence));
}

export default PricingOptimizer;
