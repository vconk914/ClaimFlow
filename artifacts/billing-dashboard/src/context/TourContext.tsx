import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface TourStep {
  id: string;
  title: string;
  description: string;
  tourKey?: string;
  action?: string;
  tab?: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to ClaimFlow!",
    description: "This guided tour will walk you through the key features of the platform in about 2 minutes. You can skip at any time.",
    position: "bottom",
  },
  {
    id: "dashboard",
    title: "Executive Dashboard",
    description: "Your KPIs at a glance — clean claim rate, days to pay, revenue at risk, and denial trends. All powered by live data from your claim store.",
    tourKey: "nav-dashboard",
    tab: "dashboard",
    position: "right",
  },
  {
    id: "kpi-cards",
    title: "Live KPI Cards",
    description: "These update in real time as claims move through the lifecycle. Click any card to drill down into the contributing claims.",
    tourKey: "kpi-cards",
    tab: "dashboard",
    position: "bottom",
  },
  {
    id: "scrubber",
    title: "AI Claims Scrubber",
    description: "Enter a claim here and ClaimFlow's AI checks for CPT/ICD-10 conflicts, missing modifiers, and prior auth requirements — before you submit.",
    tourKey: "nav-scrubber",
    tab: "scrubber",
    position: "right",
  },
  {
    id: "specialty-mode",
    title: "Specialty Mode",
    description: "Select your specialty — Urology, Cardiology, Family Medicine — to load discipline-specific code libraries and denial patterns.",
    tourKey: "specialty-select",
    tab: "scrubber",
    position: "bottom",
  },
  {
    id: "timeline",
    title: "Claims Timeline",
    description: "Track every claim from Draft through Paid. Click any claim card to see its full audit trail and advance the workflow.",
    tourKey: "nav-timeline",
    tab: "timeline",
    position: "right",
  },
  {
    id: "analytics",
    title: "Analytics & Reporting",
    description: "Filter, sort, and export your full claims log. Drill into denials by payer, specialty, or denial code to find root causes.",
    tourKey: "nav-analytics",
    tab: "analytics",
    position: "right",
  },
  {
    id: "demo-scenarios",
    title: "Demo Scenarios",
    description: "Explore real-world billing failure scenarios — missing modifiers, wrong diagnosis codes, bundling issues. Load any scenario directly into the scrubber.",
    tourKey: "nav-demo",
    tab: "demo",
    position: "right",
  },
  {
    id: "ai-assistant",
    title: "AI Billing Assistant",
    description: "Ask the AI about specific codes, denial patterns, or prior auth requirements. Click the blue brain icon in the bottom-right corner anytime.",
    tourKey: "ai-assistant-btn",
    position: "left",
  },
  {
    id: "done",
    title: "You're all set!",
    description: "You've seen the core platform. Start by submitting a claim in the Claims Scrubber, or explore the Analytics tab to review existing data. Happy billing!",
    position: "bottom",
  },
];

interface TourContextValue {
  active: boolean;
  currentStep: number;
  step: TourStep;
  totalSteps: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (n: number) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children, onTabChange }: { children: ReactNode; onTabChange?: (tab: string) => void }) {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setActive(true);
  }, []);

  const endTour = useCallback(() => {
    setActive(false);
    setCurrentStep(0);
  }, []);

  const goToStep = useCallback((n: number) => {
    const clamped = Math.max(0, Math.min(TOUR_STEPS.length - 1, n));
    setCurrentStep(clamped);
    const step = TOUR_STEPS[clamped];
    if (step.tab && onTabChange) {
      onTabChange(step.tab);
    }
  }, [onTabChange]);

  const nextStep = useCallback(() => {
    if (currentStep >= TOUR_STEPS.length - 1) {
      endTour();
    } else {
      goToStep(currentStep + 1);
    }
  }, [currentStep, endTour, goToStep]);

  const prevStep = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  return (
    <TourContext.Provider value={{
      active,
      currentStep,
      step: TOUR_STEPS[currentStep],
      totalSteps: TOUR_STEPS.length,
      startTour,
      endTour,
      nextStep,
      prevStep,
      goToStep,
    }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be inside TourProvider");
  return ctx;
}
