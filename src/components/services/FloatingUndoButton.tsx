import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  RotateCcw, 
  X, 
  Power, 
  Trash2, 
  Palette, 
  Layers, 
  Sparkles,
  Clock 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UndoOperation } from "@/hooks/use-undo-history";
import { formatDistanceToNow } from "date-fns";

interface FloatingUndoButtonProps {
  undoStack: UndoOperation[];
  onUndo: (operation: UndoOperation) => Promise<boolean>;
  maxVisible?: number;
}

const getOperationIcon = (type: UndoOperation['type']) => {
  switch (type) {
    case 'status':
      return Power;
    case 'delete':
      return Trash2;
    case 'icon':
      return Palette;
    case 'category':
      return Layers;
    case 'markup':
      return Sparkles;
    default:
      return RotateCcw;
  }
};

const getOperationColor = (type: UndoOperation['type']) => {
  switch (type) {
    case 'status':
      return 'text-green-500 bg-green-500/10';
    case 'delete':
      return 'text-red-500 bg-red-500/10';
    case 'icon':
      return 'text-purple-500 bg-purple-500/10';
    case 'category':
      return 'text-blue-500 bg-blue-500/10';
    case 'markup':
      return 'text-amber-500 bg-amber-500/10';
    default:
      return 'text-primary bg-primary/10';
  }
};

export const FloatingUndoButton = ({ 
  undoStack, 
  onUndo,
  maxVisible = 5 
}: FloatingUndoButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const visibleOperations = undoStack.slice(0, maxVisible);
  const hasOperations = undoStack.length > 0;

  const handleUndo = async (operation: UndoOperation) => {
    setUndoingId(operation.id);
    try {
      await onUndo(operation);
    } finally {
      setUndoingId(null);
    }
  };

  if (!hasOperations) return null;

  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Button & Panel */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Card className="w-80 sm:w-96 shadow-2xl border-border/50 bg-card/95 backdrop-blur-lg">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Recent Actions
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsExpanded(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pb-4">
                  <ScrollArea className="max-h-80">
                    <div className="space-y-2">
                      {visibleOperations.map((operation) => {
                        const Icon = getOperationIcon(operation.type);
                        const colorClass = getOperationColor(operation.type);
                        const isUndoing = undoingId === operation.id;

                        return (
                          <motion.div
                            key={operation.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                          >
                            <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {operation.description}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(operation.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 h-8"
                              onClick={() => handleUndo(operation)}
                              disabled={isUndoing}
                            >
                              {isUndoing ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </motion.div>
                              ) : (
                                "Undo"
                              )}
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  {undoStack.length > maxVisible && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      + {undoStack.length - maxVisible} more actions in history
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg shadow-primary/25 relative"
                onClick={() => setIsExpanded(true)}
              >
                <RotateCcw className="w-5 h-5" />
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  variant="destructive"
                >
                  {Math.min(undoStack.length, 9)}
                  {undoStack.length > 9 ? '+' : ''}
                </Badge>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
