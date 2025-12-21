import { useState, useEffect, useCallback } from "react";

const ONBOARDING_KEY = "panel_onboarding_completed";
const ONBOARDING_VERSION = "v1"; // Change this to show tour again after major updates

export const useOnboardingTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(true);

  useEffect(() => {
    try {
      const completedVersion = localStorage.getItem(ONBOARDING_KEY);
      // Only show if never completed or if version changed
      if (!completedVersion || completedVersion !== ONBOARDING_VERSION) {
        setHasCompleted(false);
        // Slight delay to allow page to render first
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        setHasCompleted(true);
        setIsOpen(false);
      }
    } catch {
      // localStorage might be blocked
      setHasCompleted(true);
    }
  }, []);

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, ONBOARDING_VERSION);
      setHasCompleted(true);
      setIsOpen(false);
    } catch {
      // localStorage might be blocked
      setHasCompleted(true);
      setIsOpen(false);
    }
  }, []);

  const restartTour = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_KEY);
      setHasCompleted(false);
      setIsOpen(true);
    } catch {
      // localStorage might be blocked
    }
  }, []);

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
