import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ONBOARDING_PREFIX = "panel_onboarding_completed_";
const ONBOARDING_VERSION = "v1";

export const useOnboardingTour = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(true);

  // Get user-specific storage key
  const getStorageKey = useCallback(() => {
    if (user?.id) {
      return `${ONBOARDING_PREFIX}${user.id}`;
    }
    return null;
  }, [user?.id]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey || !profile) {
      setHasCompleted(true);
      setIsOpen(false);
      return;
    }

    try {
      const completedData = localStorage.getItem(storageKey);
      
      if (completedData) {
        // User has completed onboarding before
        const parsed = JSON.parse(completedData);
        if (parsed.version === ONBOARDING_VERSION) {
          setHasCompleted(true);
          setIsOpen(false);
          return;
        }
      }
      
      // Check if this is a new user who hasn't seen the tour
      // Only show tour if profile exists and tour hasn't been completed
      setHasCompleted(false);
      
      // Delay showing tour to let the page render first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    } catch {
      // localStorage might be blocked
      setHasCompleted(true);
      setIsOpen(false);
    }
  }, [getStorageKey, profile]);

  const completeTour = useCallback(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify({
        version: ONBOARDING_VERSION,
        completedAt: new Date().toISOString()
      }));
      setHasCompleted(true);
      setIsOpen(false);
    } catch {
      // localStorage might be blocked
      setHasCompleted(true);
      setIsOpen(false);
    }
  }, [getStorageKey]);

  const restartTour = useCallback(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      localStorage.removeItem(storageKey);
      setHasCompleted(false);
      setIsOpen(true);
    } catch {
      // localStorage might be blocked
    }
  }, [getStorageKey]);

  const openTour = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    hasCompleted,
    completeTour,
    restartTour,
    openTour,
    closeTour,
  };
};

export default useOnboardingTour;