import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface TourStep {
  id: string;
  title: string;
  description: string;
  tourKey?: string;       // must match a data-tour="..." attribute in the DOM
  action?: string;        // optional hint shown in a blue chip
  tab?: string;           // tab to switch to before showing step
  position?: "top" | "bottom" | "left" | "right";
}

// Every tourKey here maps to a real data-tour attribute in the DOM:
//  - "nav-*"          → sidebar nav buttons  (App.tsx NAV_ITEMS, data-tour={tourKey})
//  - "ai-assistant-btn" → floating AI widget wrapper (App.tsx, data-tour="ai-assistant-btn")
// Steps without a tourKey show a centered tooltip (welcome / done / overview steps).

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to ClaimFlow",
    description: "This tour covers the key features of the platform — it takes about 2 minutes. You can skip or exit at any time.",
    position: "bottom",
  },
  {
    id: "dashboard",
    title: "Executive Dashboard",
    description: "Your practice KPIs at a glance — clean claim rate, revenue at risk, days to pay, and denial trends — all updating live as claims move through the lifecycle.",
    tourKey: "nav-dashboard",
    tab: "dashboard",
    position: "right",
  },
  {
    id: "workqueue",
    title: "Denial Prevention Queue",
    description: "Every active claim scored for denial risk before submission. Filter by risk level, modifier issues, auth gaps, or coding problems. Fix issues before they reach the payer.",
    tourKey: "nav-workqueue",
    tab: "workqueue",
    position: "right",
    action: "Review high-risk claims here before submitting",
  },
  {
    id: "scrubber",
    title: "AI Claims Scrubber",
    description: "Enter a claim and ClaimFlow's AI checks for CPT/ICD-10 conflicts, missing modifiers, and prior auth requirements — before you submit. Results include a detailed scrub report.",
    tourKey: "nav-scrubber",
    tab: "scrubber",
    position: "right",
    action: "Try entering a claim to see the scrub in action",
  },
  {
    id: "timeline",
    title: "Claims Timeline",
    description: "Track every claim from Draft through Paid with a full audit trail. Click any claim card to advance the workflow, apply corrections, or view the complete history.",
    tourKey: "nav-timeline",
    tab: "timeline",
    position: "right",
  },
  {
    id: "analytics",
    title: "Analytics & Reporting",
    description: "Filter, sort, and review your full claims log. Drill into denials by payer, specialty, or denial code to find root causes. Export to CSV for your billing reports.",
    tourKey: "nav-analytics",
    tab: "analytics",
    position: "right",
  },
  {
    id: "predictive",
    title: "Predictive Intelligence",
    description: "AI-powered forecasting for your claim portfolio — projected clean claim rate, revenue at risk, payer-level predictions, and 3-month trend forecasts.",
    tourKey: "nav-predictive",
    tab: "predictive",
    position: "right",
  },
  {
    id: "learning",
    title: "Learning Engine",
    description: "ClaimFlow learns from every outcome. Repeated Aetna modifier denials raise that payer's risk score. Successful corrections build confidence. The engine adapts continuously.",
    tourKey: "nav-learning",
    tab: "learning",
    position: "right",
    action: "See payer-level adjustments your practice has learned",
  },
  {
    id: "demo",
    title: "Demo Scenarios",
    description: "Explore real-world billing failure scenarios — missing modifiers, wrong diagnosis codes, bundling conflicts. Load any scenario directly into the scrubber to see how ClaimFlow catches it.",
    tourKey: "nav-demo",
    tab: "demo",
    position: "right",
  },
  {
    id: "ai-assistant",
    title: "AI Billing Assistant",
    description: "Ask about specific codes, payer rules, prior auth requirements, or denial patterns. Available on every page — click the brain icon in the bottom-right corner at any time.",
    tourKey: "ai-assistant-btn",
    position: "left",
  },
  {
    id: "done",
    title: "You're all set!",
    description: "Start by submitting a claim in the Claims Scrubber, or review the Prevention Queue to see which active claims need attention before submission.",
    position: "bottom",
  },
];

// ── Context ───────────────────────────────────────────────────────────────────

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

export function TourProvider({
  children,
  onTabChange,
}: {
  children: ReactNode;
  onTabChange?: (tab: string) => void;
}) {
  const [active, setActive]           = useState(false);
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
    const next = TOUR_STEPS[clamped];
    if (next.tab && onTabChange) {
      onTabChange(next.tab);
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
