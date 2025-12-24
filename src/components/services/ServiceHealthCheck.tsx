import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2,
  DollarSign,
  Package,
  Image,
  Tag,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface HealthIssue {
  id: string;
  type: "error" | "warning" | "info";
  category: string;
  message: string;
  serviceId?: string;
  serviceName?: string;
  fixable: boolean;
}

interface ServiceHealthCheckProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelId: string;
  onIssuesFound: (count: number) => void;
  onRefresh: () => void;
}

export const ServiceHealthCheck = ({
  open,
  onOpenChange,
  panelId,
  onIssuesFound,
  onRefresh,
}: ServiceHealthCheckProps) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [issues, setIssues] = useState<HealthIssue[]>([]);
  const [fixing, setFixing] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    if (open) {
      runHealthCheck();
    }
  }, [open, panelId]);

  const runHealthCheck = async () => {
    if (!panelId) return;
    
    setScanning(true);
    setProgress(0);
    setScanComplete(false);
    setIssues([]);

    try {
      // Fetch all services
      const { data: services, error } = await supabase
        .from("services")
        .select("*")
        .eq("panel_id", panelId);

      if (error) throw error;

      const foundIssues: HealthIssue[] = [];
      const totalServices = services?.length || 0;

      for (let i = 0; i < totalServices; i++) {
        const service = services![i];
        setProgress(Math.round(((i + 1) / totalServices) * 100));

        // Check for missing category
        if (!service.category || service.category === "other") {
          foundIssues.push({
            id: `cat-${service.id}`,
            type: "warning",
            category: "Category",
            message: `Service is uncategorized or set to "other"`,
            serviceId: service.id,
            serviceName: service.name,
            fixable: true,
          });
        }

        // Check for invalid price
        if (service.price <= 0) {
          foundIssues.push({
            id: `price-${service.id}`,
            type: "error",
            category: "Price",
            message: `Service has invalid price ($${service.price})`,
            serviceId: service.id,
            serviceName: service.name,
            fixable: false,
          });
        }

        // Check for missing icon
        if (!service.image_url) {
          foundIssues.push({
            id: `icon-${service.id}`,
            type: "info",
            category: "Icon",
            message: `Service is missing an icon`,
            serviceId: service.id,
            serviceName: service.name,
            fixable: true,
          });
        }

        // Check for min > max quantity
        if (service.min_quantity > service.max_quantity) {
          foundIssues.push({
            id: `qty-${service.id}`,
            type: "error",
            category: "Quantity",
            message: `Min quantity (${service.min_quantity}) is greater than max (${service.max_quantity})`,
            serviceId: service.id,
            serviceName: service.name,
            fixable: false,
          });
        }
      }

      // Check for duplicates
      const nameCount: Record<string, string[]> = {};
      services?.forEach((s) => {
        const key = s.name.toLowerCase().trim();
        if (!nameCount[key]) nameCount[key] = [];
        nameCount[key].push(s.id);
      });

      Object.entries(nameCount).forEach(([name, ids]) => {
        if (ids.length > 1) {
          foundIssues.push({
            id: `dup-${ids[0]}`,
            type: "warning",
            category: "Duplicate",
            message: `${ids.length} services with similar name "${name.slice(0, 30)}..."`,
            fixable: false,
          });
        }
      });

      setIssues(foundIssues);
      onIssuesFound(foundIssues.filter(i => i.type === "error" || i.type === "warning").length);
      setScanComplete(true);
    } catch (error) {
      console.error("Health check error:", error);
      toast({ title: "Health check failed", variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const fixAllAuto = async () => {
    const fixableIssues = issues.filter(i => i.fixable && i.serviceId);
    if (fixableIssues.length === 0) {
      toast({ title: "No auto-fixable issues" });
      return;
    }

    setFixing(true);
    try {
      // Fix missing icons by setting default based on category
      const iconFixes = fixableIssues.filter(i => i.category === "Icon");
      for (const fix of iconFixes) {
        const { data: service } = await supabase
          .from("services")
          .select("category")
          .eq("id", fix.serviceId)
          .single();
        
        if (service) {
          await supabase
            .from("services")
            .update({ image_url: `icon:${service.category || "other"}` })
            .eq("id", fix.serviceId);
        }
      }

      toast({ 
        title: "Auto-fix complete", 
        description: `Fixed ${iconFixes.length} issues`
      });
      
      // Re-run health check
      runHealthCheck();
      onRefresh();
    } catch (error) {
      console.error("Auto-fix error:", error);
      toast({ title: "Auto-fix failed", variant: "destructive" });
    } finally {
      setFixing(false);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Price":
        return <DollarSign className="w-3 h-3" />;
      case "Icon":
        return <Image className="w-3 h-3" />;
      case "Category":
        return <Tag className="w-3 h-3" />;
      case "Duplicate":
        return <Copy className="w-3 h-3" />;
      default:
        return <Package className="w-3 h-3" />;
    }
  };

  const errorCount = issues.filter(i => i.type === "error").length;
  const warningCount = issues.filter(i => i.type === "warning").length;
  const infoCount = issues.filter(i => i.type === "info").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Service Health Check
          </DialogTitle>
          <DialogDescription>
            Scanning your services for errors, warnings, and optimization opportunities
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {scanning ? (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Scanning services...</p>
                <Progress value={progress} className="w-48 mx-auto" />
                <p className="text-xs text-muted-foreground">{progress}% complete</p>
              </div>
            </div>
          ) : scanComplete ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <Card className={cn(errorCount > 0 && "border-destructive/50")}>
                  <CardContent className="p-3 text-center">
                    <XCircle className={cn("w-6 h-6 mx-auto mb-1", errorCount > 0 ? "text-destructive" : "text-muted-foreground")} />
                    <p className="text-2xl font-bold">{errorCount}</p>
                    <p className="text-xs text-muted-foreground">Errors</p>
                  </CardContent>
                </Card>
                <Card className={cn(warningCount > 0 && "border-amber-500/50")}>
                  <CardContent className="p-3 text-center">
                    <AlertTriangle className={cn("w-6 h-6 mx-auto mb-1", warningCount > 0 ? "text-amber-500" : "text-muted-foreground")} />
                    <p className="text-2xl font-bold">{warningCount}</p>
                    <p className="text-xs text-muted-foreground">Warnings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <CheckCircle className={cn("w-6 h-6 mx-auto mb-1", infoCount > 0 ? "text-blue-500" : "text-muted-foreground")} />
                    <p className="text-2xl font-bold">{infoCount}</p>
                    <p className="text-xs text-muted-foreground">Info</p>
                  </CardContent>
                </Card>
              </div>

              {/* Issues List */}
              <ScrollArea className="h-[300px] border rounded-lg">
                {issues.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">All services are healthy!</p>
                    <p className="text-sm text-muted-foreground">No issues found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {issues.map((issue) => (
                      <div key={issue.id} className="p-3 hover:bg-muted/50 flex items-start gap-3">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs gap-1">
                              {getCategoryIcon(issue.category)}
                              {issue.category}
                            </Badge>
                            {issue.fixable && (
                              <Badge variant="secondary" className="text-xs">
                                Auto-fixable
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{issue.message}</p>
                          {issue.serviceName && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              Service: {issue.serviceName}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {scanComplete && issues.filter(i => i.fixable).length > 0 && (
            <Button onClick={fixAllAuto} disabled={fixing}>
              {fixing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Auto-Fix ({issues.filter(i => i.fixable).length})
            </Button>
          )}
          {scanComplete && (
            <Button variant="outline" onClick={runHealthCheck}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-scan
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Need to import RefreshCw
import { RefreshCw } from "lucide-react";
import { Sparkles } from "lucide-react";

export default ServiceHealthCheck;
