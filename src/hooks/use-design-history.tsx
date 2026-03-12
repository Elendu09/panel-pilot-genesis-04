import { useState, useCallback, useEffect, useRef } from 'react';

interface UseDesignHistoryOptions<T> {
  maxHistory?: number;
  debounceMs?: number;
}

interface UseDesignHistoryReturn<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  futureLength: number;
  reset: (newState: T) => void;
}

export function useDesignHistory<T>(
  initialState: T,
  options: UseDesignHistoryOptions<T> = {}
): UseDesignHistoryReturn<T> {
  const { maxHistory = 20, debounceMs = 300 } = options;
  
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);
  
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedState = useRef<T>(initialState);
  const isUndoRedo = useRef(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl + Z (undo) or Cmd/Ctrl + Shift + Z (redo)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      // Alternative redo: Cmd/Ctrl + Y
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [past, future]);

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    // If this is triggered by undo/redo, don't add to history
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }

    setPresent(prev => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev) 
        : newState;
      
      // Clear any pending debounce
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Debounce adding to history
      debounceTimer.current = setTimeout(() => {
        // Only add to history if state actually changed
        if (JSON.stringify(lastSavedState.current) !== JSON.stringify(nextState)) {
          setPast(p => {
            const newPast = [...p, lastSavedState.current];
            return newPast.slice(-maxHistory);
          });
          setFuture([]);
          lastSavedState.current = nextState;
        }
      }, debounceMs);
      
      return nextState;
    });
  }, [maxHistory, debounceMs]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    
    isUndoRedo.current = true;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    
    setPast(newPast);
    setFuture(f => [present, ...f].slice(0, maxHistory));
    setPresent(previous);
    lastSavedState.current = previous;
  }, [past, present, maxHistory]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    
    isUndoRedo.current = true;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast(p => [...p, present].slice(-maxHistory));
    setFuture(newFuture);
    setPresent(next);
    lastSavedState.current = next;
  }, [future, present, maxHistory]);

  const reset = useCallback((newState: T) => {
    setPast([]);
    setFuture([]);
    setPresent(newState);
    lastSavedState.current = newState;
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    state: present,
    setState,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historyLength: past.length,
    futureLength: future.length,
    reset,
  };
}
