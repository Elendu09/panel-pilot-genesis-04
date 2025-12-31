import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { detectPlatform, detectPlatformWithConfidence, detectServiceType, getServiceIcon } from "@/lib/service-icon-detection";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  Check,
  AlertCircle,
  ArrowRight,
  Loader2,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  MessageCircle,
  Globe,
  Hash,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ServicePreview {
  id: string;
  name: string;
  currentCategory: string;
  newCategory: string;
  currentIcon: string;
  newIcon: string;
  serviceType: string;
  willChange: boolean;
  confidence: "high" | "medium" | "low";
}

interface SmartCategorizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Array<{
    id: string;
    name: string;
    category: string;
    imageUrl?: string;
  }>;
  onApply: () => void;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  telegram: MessageCircle,
  tiktok: Hash,
  other: Globe,
};

export const SmartCategorizeDialog = ({
  open,
  onOpenChange,
  services,
  onApply,
}: SmartCategorizeDialogProps) => {
  const [applying, setApplying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());

  // Analyze services and generate preview
  const analysisResult = useMemo(() => {
    const previews: ServicePreview[] = services.map((s) => {
      const { platform: detectedPlatform, confidence: detectionConfidence } = 
        detectPlatformWithConfidence(s.name);
      const serviceType = detectServiceType(s.name);
      const newIcon = getServiceIcon(s.name, detectedPlatform);
      
      // Map numeric confidence to our categories
      let confidence: "high" | "medium" | "low" = "low";
      if (detectionConfidence >= 0.7) {
        confidence = "high";
      } else if (detectionConfidence >= 0.4) {
        confidence = "medium";
      }

      const willChange = s.category !== detectedPlatform || s.imageUrl !== newIcon;

      return {
        id: s.id,
        name: s.name,
        currentCategory: s.category,
        newCategory: detectedPlatform,
        currentIcon: s.imageUrl || "",
        newIcon,
        serviceType,
        willChange,
        confidence,
      };
    });

    // Group by platform
    const groupedByPlatform = previews.reduce((acc, p) => {
      const key = p.newCategory;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {} as Record<string, ServicePreview[]>);

    const changingCount = previews.filter((p) => p.willChange).length;
    const highConfidenceCount = previews.filter((p) => p.confidence === "high").length;

    return { previews, groupedByPlatform, changingCount, highConfidenceCount };
  }, [services]);

  // Fix: Initialize selected IDs when dialog opens using useEffect
  React.useEffect(() => {
    if (open) {
      const changingIds = analysisResult.previews
        .filter((p) => p.willChange)
        .map((p) => p.id);
      setSelectedIds(new Set(changingIds));
    }
  }, [open, analysisResult.previews]);

  const togglePlatform = (platform: string) => {
    setExpandedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  };

  const toggleService = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const allChanging = analysisResult.previews
      .filter((p) => p.willChange)
      .map((p) => p.id);
    setSelectedIds(new Set(allChanging));
  };

  const handleApply = async () => {
    if (selectedIds.size === 0) {
      toast({ title: "No services selected", variant: "destructive" });
      return;
    }

    setApplying(true);
    setProgress(0);

    try {
      const selectedServices = analysisResult.previews.filter(
        (p) => selectedIds.has(p.id) && p.willChange
      );

      // Use batch updates for better performance
      for (let i = 0; i < selectedServices.length; i++) {
        const s = selectedServices[i];
        
        const { error } = await supabase
          .from("services")
          .update({
            category: s.newCategory as any,
            image_url: s.newIcon,
          })
          .eq("id", s.id);

        if (error) {
          console.error(`Error updating service ${s.id}:`, error);
        }

        setProgress(Math.round(((i + 1) / selectedServices.length) * 100));
      }

      toast({
        title: "Smart Categorization Complete",
        description: `Updated ${selectedServices.length} services`,
      });

      // Small delay to ensure DB sync before refreshing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      onApply();
      onOpenChange(false);
    } catch (error) {
      console.error("Error applying categories:", error);
      toast({ variant: "destructive", title: "Failed to apply changes" });
    } finally {
      setApplying(false);
      setProgress(0);
    }
  };

  const getConfidenceBadge = (confidence: "high" | "medium" | "low") => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">High</Badge>;
      case "medium":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">Medium</Badge>;
      case "low":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px]">Low</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Smart Categorize
          </DialogTitle>
          <DialogDescription>
            AI-powered analysis found {analysisResult.changingCount} services that can be improved.
            {analysisResult.highConfidenceCount > 0 && (
              <span className="text-green-500 ml-1">
                ({analysisResult.highConfidenceCount} high confidence)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {applying ? (
          <div className="py-8 space-y-4">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Applying changes...</p>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm">{progress}% complete</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3 py-2">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{services.length}</p>
                <p className="text-xs text-muted-foreground">Total Services</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/10">
                <p className="text-2xl font-bold text-primary">{analysisResult.changingCount}</p>
                <p className="text-xs text-muted-foreground">Will Update</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-500/10">
                <p className="text-2xl font-bold text-green-500">{selectedIds.size}</p>
                <p className="text-xs text-muted-foreground">Selected</p>
              </div>
            </div>

            {/* Platform Groups */}
            <ScrollArea className="flex-1 max-h-[400px] pr-4">
              <div className="space-y-2">
                {Object.entries(analysisResult.groupedByPlatform)
                  .sort(([, a], [, b]) => b.length - a.length)
                  .map(([platform, platformServices]) => {
                    const PlatformIcon = platformIcons[platform] || Globe;
                    const changingInPlatform = platformServices.filter((s) => s.willChange);
                    const isExpanded = expandedPlatforms.has(platform);

                    if (changingInPlatform.length === 0) return null;

                    return (
                      <div key={platform} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => togglePlatform(platform)}
                          className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <PlatformIcon className="w-5 h-5 text-primary" />
                            <span className="font-medium capitalize">{platform}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {changingInPlatform.length} changes
                            </Badge>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-2 space-y-1 bg-background/50">
                                {changingInPlatform.map((s) => (
                                  <div
                                    key={s.id}
                                    className={cn(
                                      "flex items-center gap-2 p-2 rounded-lg text-sm transition-colors",
                                      selectedIds.has(s.id)
                                        ? "bg-primary/10"
                                        : "bg-muted/30"
                                    )}
                                  >
                                    <Checkbox
                                      checked={selectedIds.has(s.id)}
                                      onCheckedChange={() => toggleService(s.id)}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="truncate text-xs font-medium">{s.name}</p>
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <span className="capitalize">{s.currentCategory}</span>
                                        <ArrowRight className="w-3 h-3" />
                                        <span className="capitalize text-primary">{s.newCategory}</span>
                                      </div>
                                    </div>
                                    {getConfidenceBadge(s.confidence)}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={selectAll} disabled={applying}>
            Select All Changes
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={applying}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={applying || selectedIds.size === 0}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {applying ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Apply {selectedIds.size} Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SmartCategorizeDialog;
