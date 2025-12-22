import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Percent, 
  UserCheck, 
  UserX, 
  Loader2,
  Wallet,
  Settings,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onApplyDiscount: (discount: number, expiresAt: Date | null) => Promise<void>;
  onActivate: () => Promise<void>;
  onSuspend: () => Promise<void>;
  onAdjustBalance: (action: "add" | "subtract", amount: number, reason: string) => Promise<void>;
}

export const BulkEditDialog = ({
  open,
  onOpenChange,
  selectedCount,
  onApplyDiscount,
  onActivate,
  onSuspend,
  onAdjustBalance,
}: BulkEditDialogProps) => {
  const [discount, setDiscount] = useState(10);
  const [applying, setApplying] = useState(false);
  const [activeTab, setActiveTab] = useState("status");

  const handleApplyDiscount = async () => {
    setApplying(true);
    try {
      await onApplyDiscount(discount, null);
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  };

  const handleActivate = async () => {
    setApplying(true);
    try {
      await onActivate();
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  };

  const handleSuspend = async () => {
    setApplying(true);
    try {
      await onSuspend();
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Bulk Edit Customers
          </DialogTitle>
          <DialogDescription>
            Edit{" "}
            <Badge variant="secondary" className="mx-1">
              {selectedCount}
            </Badge>
            selected customers at once
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="status" className="gap-2">
              <Shield className="w-4 h-4" />
              Status
            </TabsTrigger>
            <TabsTrigger value="discount" className="gap-2">
              <Percent className="w-4 h-4" />
              Discount
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleActivate}
                disabled={applying}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-emerald-500 hover:bg-emerald-500/10 transition-all group"
              >
                <div className="p-4 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <UserCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Activate All</p>
                  <p className="text-xs text-muted-foreground">Enable selected accounts</p>
                </div>
              </button>

              <button
                onClick={handleSuspend}
                disabled={applying}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-destructive hover:bg-destructive/10 transition-all group"
              >
                <div className="p-4 rounded-full bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                  <UserX className="w-8 h-8 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Suspend All</p>
                  <p className="text-xs text-muted-foreground">Disable selected accounts</p>
                </div>
              </button>
            </div>
          </TabsContent>

          {/* Discount Tab */}
          <TabsContent value="discount" className="space-y-4 pt-4">
            <div className="space-y-6">
              <div className="text-center p-6 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-5xl font-bold text-primary">{discount}%</p>
                <p className="text-sm text-muted-foreground mt-1">Discount for all services</p>
              </div>

              <div className="space-y-2">
                <Label>Discount Percentage</Label>
                <Slider
                  value={[discount]}
                  onValueChange={([val]) => setDiscount(val)}
                  max={50}
                  min={0}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>

              <Button onClick={handleApplyDiscount} className="w-full" disabled={applying}>
                {applying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Apply {discount}% Discount to {selectedCount} Customers
              </Button>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Wallet className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Allow Negative Balance</p>
                    <p className="text-xs text-muted-foreground">Let customers order with negative balance</p>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">VIP Status</p>
                    <p className="text-xs text-muted-foreground">Grant VIP privileges to selected</p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              More bulk settings coming soon...
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
