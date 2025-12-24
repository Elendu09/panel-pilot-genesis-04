import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UndoOperation {
  id: string;
  type: 'status' | 'category' | 'icon' | 'delete' | 'markup';
  timestamp: Date;
  affectedIds: string[];
  previousState: Record<string, any>;
  description: string;
}

interface UseUndoHistoryReturn {
  undoStack: UndoOperation[];
  canUndo: boolean;
  pushUndo: (operation: Omit<UndoOperation, 'id' | 'timestamp'>) => void;
  undo: () => Promise<boolean>;
  undoOperation: (operation: UndoOperation) => Promise<boolean>;
  clearHistory: () => void;
}

const MAX_UNDO_STACK = 10;

export function useUndoHistory(onUndoComplete?: () => void): UseUndoHistoryReturn {
  const [undoStack, setUndoStack] = useState<UndoOperation[]>([]);

  const pushUndo = useCallback((operation: Omit<UndoOperation, 'id' | 'timestamp'>) => {
    const newOperation: UndoOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setUndoStack(prev => {
      const newStack = [newOperation, ...prev];
      return newStack.slice(0, MAX_UNDO_STACK);
    });
  }, []);

  const performUndo = async (operation: UndoOperation): Promise<boolean> => {
    try {
      switch (operation.type) {
        case 'status': {
          // Restore previous status for each service
          await Promise.all(
            Object.entries(operation.previousState).map(([id, prevState]) =>
              supabase
                .from('services')
                .update({ is_active: (prevState as { status: boolean }).status })
                .eq('id', id)
            )
          );
          toast({ title: 'Status changes reverted' });
          break;
        }

        case 'category': {
          // Restore previous category for each service
          await Promise.all(
            Object.entries(operation.previousState).map(([id, prevState]) =>
              supabase
                .from('services')
                .update({ 
                  category: (prevState as { category: string }).category as any,
                  image_url: (prevState as { image_url: string }).image_url,
                })
                .eq('id', id)
            )
          );
          toast({ title: 'Category changes reverted' });
          break;
        }

        case 'icon': {
          // Restore previous icons for each service
          await Promise.all(
            Object.entries(operation.previousState).map(([id, prevState]) =>
              supabase
                .from('services')
                .update({ image_url: (prevState as { image_url: string }).image_url })
                .eq('id', id)
            )
          );
          toast({ title: 'Icon changes reverted' });
          break;
        }

        case 'delete': {
          // Re-insert deleted services
          const servicesToRestore = Object.values(operation.previousState);
          if (servicesToRestore.length > 0) {
            const { error } = await supabase
              .from('services')
              .insert(servicesToRestore as any[]);
            
            if (error) throw error;
          }
          toast({ title: `${servicesToRestore.length} services restored` });
          break;
        }

        case 'markup': {
          // Restore previous prices
          await Promise.all(
            Object.entries(operation.previousState).map(([id, prevState]) =>
              supabase
                .from('services')
                .update({ price: (prevState as { price: number }).price })
                .eq('id', id)
            )
          );
          toast({ title: 'Price changes reverted' });
          break;
        }

        default:
          toast({ title: 'Unknown operation type', variant: 'destructive' });
          return false;
      }

      // Remove the operation from the stack
      setUndoStack(prev => prev.filter(op => op.id !== operation.id));
      return true;
    } catch (error) {
      console.error('Undo failed:', error);
      toast({ title: 'Failed to undo operation', variant: 'destructive' });
      return false;
    }
  };

  const undo = useCallback(async (): Promise<boolean> => {
    if (undoStack.length === 0) {
      toast({ title: 'Nothing to undo' });
      return false;
    }

    const lastOperation = undoStack[0];
    const success = await performUndo(lastOperation);
    if (success) {
      onUndoComplete?.();
    }
    return success;
  }, [undoStack, onUndoComplete]);

  const undoOperation = useCallback(async (operation: UndoOperation): Promise<boolean> => {
    const success = await performUndo(operation);
    if (success) {
      onUndoComplete?.();
    }
    return success;
  }, [onUndoComplete]);

  const clearHistory = useCallback(() => {
    setUndoStack([]);
  }, []);

  return {
    undoStack,
    canUndo: undoStack.length > 0,
    pushUndo,
    undo,
    undoOperation,
    clearHistory,
  };
}
