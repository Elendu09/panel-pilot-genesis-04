import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ONBOARDING_PREFIX = "panel_onboarding_completed_";
const ONBOARDING_VERSION = "v1";

interface OnboardingTourContextType {
  isOpen: boolean;
  hasCompleted: boolean;
  isReady: boolean;
  completeTour: () => void;
  restartTour: () => void;
  openTour: () => void;
  closeTour: () => void;
}

const OnboardingTourContext = createContext<OnboardingTourContextType | undefined>(undefined);

export const OnboardingTourProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(true);
  const [isReady, setIsReady] = useState(false);

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
      setIsReady(false);
      return;
    }

    setIsReady(true);

    try {
      const completedData = localStorage.getItem(storageKey);
      
      if (completedData) {
        const parsed = JSON.parse(completedData);
        if (parsed.version === ONBOARDING_VERSION) {
          setHasCompleted(true);
          setIsOpen(false);
          return;
        }
      }
      
      setHasCompleted(false);
      
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    } catch {
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
      setHasCompleted(true);
      setIsOpen(false);
    }
  }, [getStorageKey]);

  const restartTour = useCallback(() => {
    const storageKey = getStorageKey();
    
    try {
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
    } catch {
      // continue anyway
    }
    
    setHasCompleted(false);
    setTimeout(() => {
      setIsOpen(true);
    }, 50);
  }, [getStorageKey]);

  const openTour = useCallback(() => {
    setHasCompleted(false);
    setIsOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <OnboardingTourContext.Provider value={{
      isOpen,
      hasCompleted,
      isReady,
      completeTour,
      restartTour,
      openTour,
      closeTour,
    }}>
      {children}
    </OnboardingTourContext.Provider>
  );
};

export const useOnboardingTour = () => {
  const context = useContext(OnboardingTourContext);
  if (context === undefined) {
    throw new Error("useOnboardingTour must be used within an OnboardingTourProvider");
  }
  return context;
};

export default OnboardingTourContext;
