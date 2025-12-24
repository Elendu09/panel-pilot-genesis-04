// This hook has been moved to a context provider for shared state.
// Please use: import { useOnboardingTour } from "@/contexts/OnboardingTourContext";
// This file is kept for backwards compatibility.

export { useOnboardingTour } from "@/contexts/OnboardingTourContext";
export default { useOnboardingTour: () => { throw new Error("Please use OnboardingTourContext instead"); } };
