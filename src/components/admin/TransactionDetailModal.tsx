import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  Copy,
  ExternalLink,
  Building2,
  User,
  CreditCard,
  Calendar,
  Hash,
  FileText,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TransactionData {
  id: string;
  type: string;
  amount: number;
  payment_method: string | null;
  status: string | null;
  created_at: string;
  description: string | null;
  panel_id: string | null;
  user_id: string | null;
  metadata?: Record<string, any> | null;
  payment_id?: string | null;
  panel?: {
    id: string;
    name: string;
    subdomain: string;
    owner?: {
      email: string;
      full_name: string;
    } | null;
  } | null;
}

interface TransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionData | null;
  onStatusUpdate?: () => void;
}

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
        </Badge>
      );
    case "pending":
    case "pending_verification":
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="w-3 h-3 mr-1" /> Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
};

export const TransactionDetailModal = ({
  open,
  onOpenChange,
  transaction,
  onStatusUpdate,
}: TransactionDetailModalProps) => {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [showMetadata, setShowMetadata] = useState(false);

  if (!transaction) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard` });
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === transaction.status) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: newStatus as "completed" | "failed" | "pending" | "refunded" })
        .eq("id", transaction.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Transaction marked as ${newStatus}`,
      });
      onStatusUpdate?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const DetailRow = ({
    icon: Icon,
    label,
    value,
    copyable,
    className,
  }: {
    icon: any;
    label: string;
    value: string | React.ReactNode;
    copyable?: boolean;
    className?: string;
  }) => (
    <div className="flex items-start justify-between py-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className={cn("flex items-center gap-2 text-right", className)}>
        {typeof value === "string" ? (
          <>
            <span className="font-medium text-sm">{value}</span>
            {copyable && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(value, label)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}
          </>
        ) : (
          value
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            Full information about this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount & Status Header */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  transaction.type === "deposit" || transaction.type === "admin_credit"
                    ? "text-green-500"
                    : "text-red-500"
                )}
              >
                {transaction.type === "deposit" || transaction.type === "admin_credit"
                  ? "+"
                  : "-"}
                ${Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
            {getStatusBadge(transaction.status)}
          </div>

          <Separator />

          {/* Transaction Info */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Transaction Info</h4>
            <DetailRow
              icon={Hash}
              label="Transaction ID"
              value={transaction.id.slice(0, 12) + "..."}
              copyable
            />
            <DetailRow
              icon={FileText}
              label="Type"
              value={
                <Badge variant="outline" className="capitalize">
                  {transaction.type.replace("_", " ")}
                </Badge>
              }
            />
            <DetailRow
              icon={CreditCard}
              label="Payment Method"
              value={transaction.payment_method || "N/A"}
            />
            <DetailRow
              icon={Calendar}
              label="Date"
              value={new Date(transaction.created_at).toLocaleString()}
            />
            {transaction.description && (
              <DetailRow
                icon={FileText}
                label="Description"
                value={transaction.description}
              />
            )}
          </div>

          <Separator />

          {/* Panel & Owner Info */}
          {transaction.panel && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Panel Information</h4>
              <DetailRow
                icon={Building2}
                label="Panel Name"
                value={transaction.panel.name}
              />
              <DetailRow
                icon={ExternalLink}
                label="Subdomain"
                value={transaction.panel.subdomain}
              />
              {transaction.panel.owner && (
                <>
                  <DetailRow
                    icon={User}
                    label="Owner Email"
                    value={transaction.panel.owner.email}
                    copyable
                  />
                  <DetailRow
                    icon={User}
                    label="Owner Name"
                    value={transaction.panel.owner.full_name || "N/A"}
                  />
                </>
              )}
            </div>
          )}

          {/* Metadata (Collapsible) */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <Collapsible open={showMetadata} onOpenChange={setShowMetadata}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span className="text-sm">Raw Metadata</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      showMetadata && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto max-h-[150px]">
                  {JSON.stringify(transaction.metadata, null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Status Update (for pending transactions) */}
          {(transaction.status === "pending" ||
            transaction.status === "pending_verification") && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Quick Actions</h4>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Update Status:</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleStatusUpdate}
                    disabled={!newStatus || updating}
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
