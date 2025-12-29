import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UndoRedoOperation {
  id: string;
  type: 'status' | 'category' | 'icon' | 'delete' | 'markup' | 'edit';
  timestamp: Date;
  affectedIds: string[];
  previousState: Record<string, any>;
  newState?: Record<string, any>;
  description: string;
}

interface UseUndoRedoHistoryReturn {
  undoStack: UndoRedoOperation[];
  redoStack: UndoRedoOperation[];
  canUndo: boolean;
  canRedo: boolean;
  pushUndo: (operation: Omit<UndoRedoOperation, 'id' | 'timestamp'>) => void;
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  undoOperation: (operation: UndoRedoOperation) => Promise<boolean>;
  clearHistory: () => void;
}

const MAX_STACK_SIZE = 20;

export function useUndoRedoHistory(onOperationComplete?: () => void): UseUndoRedoHistoryReturn {
  const [undoStack, setUndoStack] = useState<UndoRedoOperation[]>([]);
  const [redoStack, setRedoStack] = useState<UndoRedoOperation[]>([]);

  const pushUndo = useCallback((operation: Omit<UndoRedoOperation, 'id' | 'timestamp'>) => {
    const newOperation: UndoRedoOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setUndoStack(prev => {
      const newStack = [newOperation, ...prev];
      return newStack.slice(0, MAX_STACK_SIZE);
    });
    
    // Clear redo stack when new action is performed
    setRedoStack([]);
  }, []);

  const performUndo = async (operation: UndoRedoOperation): Promise<boolean> => {
    try {
      switch (operation.type) {
        case 'status': {
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

        case 'edit': {
          await Promise.all(
            Object.entries(operation.previousState).map(([id, prevState]) =>
              supabase
                .from('services')
                .update(prevState as any)
                .eq('id', id)
            )
          );
          toast({ title: 'Edit reverted' });
          break;
        }

        default:
          toast({ title: 'Unknown operation type', variant: 'destructive' });
          return false;
      }

      return true;
    } catch (error) {
      console.error('Undo failed:', error);
      toast({ title: 'Failed to undo operation', variant: 'destructive' });
      return false;
    }
  };

  const performRedo = async (operation: UndoRedoOperation): Promise<boolean> => {
    try {
      if (!operation.newState) {
        toast({ title: 'Cannot redo this operation', variant: 'destructive' });
        return false;
      }

      switch (operation.type) {
        case 'status': {
          await Promise.all(
            Object.entries(operation.newState).map(([id, newState]) =>
              supabase
                .from('services')
                .update({ is_active: (newState as { status: boolean }).status })
                .eq('id', id)
            )
          );
          toast({ title: 'Status changes reapplied' });
          break;
        }

        case 'category': {
          await Promise.all(
            Object.entries(operation.newState).map(([id, newState]) =>
              supabase
                .from('services')
                .update({ 
                  category: (newState as { category: string }).category as any,
                  image_url: (newState as { image_url: string }).image_url,
                })
                .eq('id', id)
            )
          );
          toast({ title: 'Category changes reapplied' });
          break;
        }

        case 'icon': {
          await Promise.all(
            Object.entries(operation.newState).map(([id, newState]) =>
              supabase
                .from('services')
                .update({ image_url: (newState as { image_url: string }).image_url })
                .eq('id', id)
            )
          );
          toast({ title: 'Icon changes reapplied' });
          break;
        }

        case 'delete': {
          const idsToDelete = operation.affectedIds;
          const { error } = await supabase
            .from('services')
            .delete()
            .in('id', idsToDelete);
          
          if (error) throw error;
          toast({ title: `${idsToDelete.length} services deleted again` });
          break;
        }

        case 'markup': {
          await Promise.all(
            Object.entries(operation.newState).map(([id, newState]) =>
              supabase
                .from('services')
                .update({ price: (newState as { price: number }).price })
                .eq('id', id)
            )
          );
          toast({ title: 'Price changes reapplied' });
          break;
        }

        case 'edit': {
          await Promise.all(
            Object.entries(operation.newState).map(([id, newState]) =>
              supabase
                .from('services')
                .update(newState as any)
                .eq('id', id)
            )
          );
          toast({ title: 'Edit reapplied' });
          break;
        }

        default:
          return false;
      }

      return true;
    } catch (error) {
      console.error('Redo failed:', error);
      toast({ title: 'Failed to redo operation', variant: 'destructive' });
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
      setUndoStack(prev => prev.slice(1));
      setRedoStack(prev => [lastOperation, ...prev].slice(0, MAX_STACK_SIZE));
      onOperationComplete?.();
    }
    return success;
  }, [undoStack, onOperationComplete]);

  const redo = useCallback(async (): Promise<boolean> => {
    if (redoStack.length === 0) {
      toast({ title: 'Nothing to redo' });
      return false;
    }

    const lastOperation = redoStack[0];
    const success = await performRedo(lastOperation);
    
    if (success) {
      setRedoStack(prev => prev.slice(1));
      setUndoStack(prev => [lastOperation, ...prev].slice(0, MAX_STACK_SIZE));
      onOperationComplete?.();
    }
    return success;
  }, [redoStack, onOperationComplete]);

  const undoOperation = useCallback(async (operation: UndoRedoOperation): Promise<boolean> => {
    const success = await performUndo(operation);
    if (success) {
      setUndoStack(prev => prev.filter(op => op.id !== operation.id));
      setRedoStack(prev => [operation, ...prev].slice(0, MAX_STACK_SIZE));
      onOperationComplete?.();
    }
    return success;
  }, [onOperationComplete]);

  const clearHistory = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y or Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    undoStack,
    redoStack,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    pushUndo,
    undo,
    redo,
    undoOperation,
    clearHistory,
  };
}
