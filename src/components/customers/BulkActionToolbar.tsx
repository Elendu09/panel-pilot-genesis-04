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
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-fit"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-x-auto scrollbar-hide">
            <Badge className="bg-primary text-primary-foreground px-2 sm:px-3 py-1 text-xs sm:text-sm shrink-0">
              {selectedCount}
            </Badge>
            
            <div className="w-px h-6 bg-border mx-0.5 sm:mx-1 shrink-0" />
            
            {onBulkEdit && (
              <Button variant="ghost" size="icon" onClick={onBulkEdit} className="h-8 w-8 shrink-0">
                <Edit className="w-4 h-4" />
              </Button>
            )}
            
            {onAdjustBalance && (
              <Button variant="ghost" size="icon" onClick={onAdjustBalance} className="h-8 w-8 shrink-0">
                <Wallet className="w-4 h-4" />
              </Button>
            )}
            
            <Button variant="ghost" size="icon" onClick={onSendEmail} className="h-8 w-8 shrink-0">
              <Mail className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onApplyDiscount} className="h-8 w-8 shrink-0">
              <Percent className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onExport} className="h-8 w-8 shrink-0">
              <Download className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-0.5 sm:mx-1 shrink-0" />
            
            <Button variant="ghost" size="icon" onClick={onActivate} className="h-8 w-8 text-green-500 hover:text-green-600 shrink-0">
              <UserCheck className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onSuspend} className="h-8 w-8 text-destructive hover:text-destructive shrink-0">
              <UserX className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-0.5 sm:mx-1 shrink-0" />
            
            <Button variant="ghost" size="icon" onClick={onClearSelection} className="h-8 w-8 shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
