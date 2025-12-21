import { useState, useEffect } from "react";

const ONBOARDING_KEY = "panel_onboarding_completed";

export const useOnboardingTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setHasCompleted(false);
      // Slight delay to allow page to render first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setHasCompleted(true);
    setIsOpen(false);
  };

  const restartTour = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setHasCompleted(false);
    setIsOpen(true);
  };

  const openTour = () => {
    setIsOpen(true);
  };

  const closeTour = () => {
    setIsOpen(false);
  };

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
