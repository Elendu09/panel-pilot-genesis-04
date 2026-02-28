import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Percent, 
  Download, 
  UserX, 
  UserCheck,
  X,
  Wallet,
  Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BulkActionToolbarProps {
  selectedCount: number;
  onSendEmail: () => void;
  onApplyDiscount: () => void;
  onExport: () => void;
  onSuspend: () => void;
  onActivate: () => void;
  onClearSelection: () => void;
  onAdjustBalance?: () => void;
  onBulkEdit?: () => void;
}

export const BulkActionToolbar = ({
  selectedCount,
  onSendEmail,
  onApplyDiscount,
  onExport,
  onSuspend,
  onActivate,
  onClearSelection,
  onAdjustBalance,
  onBulkEdit,
}: BulkActionToolbarProps) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-2 px-3 md:px-4 py-3 bg-background/95 backdrop-blur-xl border border-border/50 rounded-full shadow-2xl max-w-[calc(100vw-2rem)] overflow-x-auto scrollbar-hide">
            <Badge className="bg-primary text-primary-foreground px-3 py-1">
              {selectedCount} selected
            </Badge>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            {onBulkEdit && (
              <Button variant="ghost" size="sm" onClick={onBulkEdit} className="gap-2">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            
            {onAdjustBalance && (
              <Button variant="ghost" size="sm" onClick={onAdjustBalance} className="gap-2">
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Balance</span>
              </Button>
            )}
            
            <Button variant="ghost" size="sm" onClick={onSendEmail} className="gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onApplyDiscount} className="gap-2">
              <Percent className="w-4 h-4" />
              <span className="hidden sm:inline">Discount</span>
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onExport} className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Button variant="ghost" size="sm" onClick={onActivate} className="gap-2 text-green-500 hover:text-green-600">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Activate</span>
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onSuspend} className="gap-2 text-destructive hover:text-destructive">
              <UserX className="w-4 h-4" />
              <span className="hidden sm:inline">Suspend</span>
            </Button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Button variant="ghost" size="icon" onClick={onClearSelection} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
