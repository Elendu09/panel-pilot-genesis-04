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
  Edit,
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
          className="fixed left-4 right-4 bottom-[5.5rem] z-[60] md:left-1/2 md:right-auto md:w-auto md:max-w-fit md:-translate-x-1/2 md:bottom-6"
        >
          <div className="overflow-x-auto scrollbar-hide">
            <div className="mx-auto flex w-max items-center gap-2 rounded-2xl border border-border/50 bg-background/95 px-3 py-2.5 shadow-2xl backdrop-blur-xl sm:px-4 sm:py-3">
              <Badge className="bg-primary text-primary-foreground px-2 sm:px-3 py-1 text-xs sm:text-sm shrink-0">
                {selectedCount}
              </Badge>

              <div className="w-px h-6 bg-border mx-1 shrink-0" />

              {onBulkEdit && (
                <Button variant="ghost" size="icon" onClick={onBulkEdit} className="h-9 w-9 shrink-0">
                  <Edit className="w-4 h-4" />
                </Button>
              )}

              {onAdjustBalance && (
                <Button variant="ghost" size="icon" onClick={onAdjustBalance} className="h-9 w-9 shrink-0">
                  <Wallet className="w-4 h-4" />
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={onSendEmail} className="h-9 w-9 shrink-0">
                <Mail className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="icon" onClick={onApplyDiscount} className="h-9 w-9 shrink-0">
                <Percent className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="icon" onClick={onExport} className="h-9 w-9 shrink-0">
                <Download className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1 shrink-0" />

              <Button variant="ghost" size="icon" onClick={onActivate} className="h-9 w-9 shrink-0 text-green-500 hover:text-green-600">
                <UserCheck className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="icon" onClick={onSuspend} className="h-9 w-9 shrink-0 text-destructive hover:text-destructive">
                <UserX className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1 shrink-0" />

              <Button variant="ghost" size="icon" onClick={onClearSelection} className="h-9 w-9 shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
