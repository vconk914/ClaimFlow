import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { REGIONAL_CONFIGS, type StateId, type RegionalConfig } from "@/data/regionalData";

const STORAGE_KEY = "claimflow_region";

interface RegionalContextValue {
  stateId: StateId;
  config: RegionalConfig;
  setStateId: (id: StateId) => void;
  onboardingComplete: boolean;
  completeOnboarding: (id: StateId) => void;
}

const RegionalContext = createContext<RegionalContextValue | null>(null);

export function RegionalProvider({ children }: { children: ReactNode }) {
  const [stateId, setStateIdState] = useState<StateId>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as StateId | null;
    return stored && REGIONAL_CONFIGS[stored] ? stored : "national";
  });

  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) !== null;
  });

  function setStateId(id: StateId) {
    setStateIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  function completeOnboarding(id: StateId) {
    setStateId(id);
    setOnboardingComplete(true);
  }

  const config = REGIONAL_CONFIGS[stateId];

  return (
    <RegionalContext.Provider value={{ stateId, config, setStateId, onboardingComplete, completeOnboarding }}>
      {children}
    </RegionalContext.Provider>
  );
}

export function useRegion() {
  const ctx = useContext(RegionalContext);
  if (!ctx) throw new Error("useRegion must be used within RegionalProvider");
  return ctx;
}
