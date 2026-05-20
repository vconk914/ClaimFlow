import { useEffect, useRef, useState } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, MapPin } from "lucide-react";
import { useTour, TOUR_STEPS } from "@/context/TourContext";

// ── Tooltip position calc ──────────────────────────────────────────────────────

interface Rect { top: number; left: number; width: number; height: number }

function getTooltipStyle(targetRect: Rect | null, position: string): React.CSSProperties {
  if (!targetRect) {
    return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
  const PAD = 16;
  const TIP_W = 320;
  const TIP_H = 180;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  switch (position) {
    case "right": {
      let left = targetRect.left + targetRect.width + PAD;
      let top = targetRect.top + targetRect.height / 2 - TIP_H / 2;
      if (left + TIP_W > vw) left = targetRect.left - TIP_W - PAD;
      top = Math.max(PAD, Math.min(top, vh - TIP_H - PAD));
      return { position: "fixed", top, left };
    }
    case "left": {
      let left = targetRect.left - TIP_W - PAD;
      if (left < 0) left = targetRect.left + targetRect.width + PAD;
      let top = targetRect.top + targetRect.height / 2 - TIP_H / 2;
      top = Math.max(PAD, Math.min(top, vh - TIP_H - PAD));
      return { position: "fixed", top, left };
    }
    case "top": {
      let top = targetRect.top - TIP_H - PAD;
      if (top < 0) top = targetRect.top + targetRect.height + PAD;
      let left = targetRect.left + targetRect.width / 2 - TIP_W / 2;
      left = Math.max(PAD, Math.min(left, vw - TIP_W - PAD));
      return { position: "fixed", top, left };
    }
    case "bottom":
    default: {
      let top = targetRect.top + targetRect.height + PAD;
      if (top + TIP_H > vh) top = targetRect.top - TIP_H - PAD;
      let left = targetRect.left + targetRect.width / 2 - TIP_W / 2;
      left = Math.max(PAD, Math.min(left, vw - TIP_W - PAD));
      return { position: "fixed", top, left };
    }
  }
}

// ── Spotlight overlay ─────────────────────────────────────────────────────────

function SpotlightOverlay({ targetRect }: { targetRect: Rect | null }) {
  const PAD = 8;
  if (!targetRect) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9998] pointer-events-none transition-all duration-500" />
    );
  }

  const { top, left, width, height } = targetRect;
  const spotTop = top - PAD;
  const spotLeft = left - PAD;
  const spotW = width + PAD * 2;
  const spotH = height + PAD * 2;

  return (
    <svg
      className="fixed inset-0 z-[9998] pointer-events-none transition-all duration-500"
      width="100%"
      height="100%"
      style={{ position: "fixed", top: 0, left: 0 }}
    >
      <defs>
        <mask id="tour-spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect
            x={spotLeft}
            y={spotTop}
            width={spotW}
            height={spotH}
            rx="12"
            fill="black"
          />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.65)"
        mask="url(#tour-spotlight-mask)"
      />
      {/* Spotlight ring */}
      <rect
        x={spotLeft - 2}
        y={spotTop - 2}
        width={spotW + 4}
        height={spotH + 4}
        rx="14"
        fill="none"
        stroke="rgba(99,102,241,0.8)"
        strokeWidth="2"
      />
    </svg>
  );
}

// ── Step dots progress ────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[...Array(total)].map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? "w-4 h-1.5 bg-blue-500"
              : i < current
              ? "w-1.5 h-1.5 bg-blue-300"
              : "w-1.5 h-1.5 bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

// ── Main GuidedTour component ─────────────────────────────────────────────────

export default function GuidedTour() {
  const { active, step, currentStep, totalSteps, nextStep, prevStep, endTour } = useTour();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);
  const animFrameRef = useRef<number>(0);

  // Locate the DOM element for the current step's tourKey
  useEffect(() => {
    if (!active) { setVisible(false); return; }

    const measureTarget = () => {
      if (!step.tourKey) {
        setTargetRect(null);
        return;
      }
      const el = document.querySelector(`[data-tour="${step.tourKey}"]`) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setTargetRect(null);
      }
    };

    // Small delay so React can render the new tab before measuring
    const t = setTimeout(() => {
      measureTarget();
      setVisible(true);
    }, 200);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, step, currentStep]);

  if (!active) return null;

  const tooltipStyle = getTooltipStyle(targetRect, step.position ?? "bottom");
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <>
      <SpotlightOverlay targetRect={targetRect} />

      {/* Tooltip card */}
      <div
        className={`z-[9999] w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{ ...tooltipStyle, pointerEvents: "auto" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-200 shrink-0" />
              <p className="text-white font-bold text-sm leading-tight">{step.title}</p>
            </div>
            <button
              onClick={endTour}
              className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>

          {step.action && (
            <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <p className="text-blue-700 text-xs font-medium">{step.action}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 flex items-center justify-between gap-3">
          <ProgressDots total={totalSteps} current={currentStep} />
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">{currentStep + 1}/{totalSteps}</span>
            {!isFirst && (
              <button
                onClick={prevStep}
                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 h-8 rounded-xl transition-colors shadow-sm"
            >
              {isLast ? "Done" : "Next"}
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Skip */}
        {!isLast && (
          <div className="px-5 pb-4 border-t border-slate-50 pt-3">
            <button
              onClick={endTour}
              className="text-slate-400 hover:text-slate-600 text-xs transition-colors w-full text-center"
            >
              Skip tour
            </button>
          </div>
        )}
      </div>
    </>
  );
}
