import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, MapPin } from "lucide-react";
import { useTour } from "@/context/TourContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Rect { top: number; left: number; width: number; height: number }

// ── Position calc — uses ACTUAL rendered tooltip dimensions ───────────────────

function getTooltipPosition(
  targetRect: Rect | null,
  position: string,
  tipW: number,
  tipH: number,
): React.CSSProperties {
  const PAD = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!targetRect) {
    // No target — center in viewport
    return {
      position: "fixed",
      top: Math.round(vh / 2 - tipH / 2),
      left: Math.round(vw / 2 - tipW / 2),
    };
  }

  const clampLeft = (l: number) => Math.max(PAD, Math.min(l, vw - tipW - PAD));
  const clampTop  = (t: number) => Math.max(PAD, Math.min(t, vh - tipH - PAD));

  switch (position) {
    case "right": {
      let left = targetRect.left + targetRect.width + PAD;
      // Flip to left if it would overflow right edge
      if (left + tipW > vw - PAD) left = targetRect.left - tipW - PAD;
      // Keep left >= 0
      left = Math.max(PAD, left);
      const top = clampTop(targetRect.top + targetRect.height / 2 - tipH / 2);
      return { position: "fixed", top, left };
    }
    case "left": {
      let left = targetRect.left - tipW - PAD;
      // Flip to right if it would overflow left edge
      if (left < PAD) left = targetRect.left + targetRect.width + PAD;
      const top = clampTop(targetRect.top + targetRect.height / 2 - tipH / 2);
      return { position: "fixed", top, left };
    }
    case "top": {
      let top = targetRect.top - tipH - PAD;
      // Flip to bottom if it would overflow top edge
      if (top < PAD) top = targetRect.top + targetRect.height + PAD;
      const left = clampLeft(targetRect.left + targetRect.width / 2 - tipW / 2);
      return { position: "fixed", top, left };
    }
    case "bottom":
    default: {
      let top = targetRect.top + targetRect.height + PAD;
      // Flip to top if it would overflow bottom edge
      if (top + tipH > vh - PAD) top = targetRect.top - tipH - PAD;
      top = Math.max(PAD, top);
      const left = clampLeft(targetRect.left + targetRect.width / 2 - tipW / 2);
      return { position: "fixed", top, left };
    }
  }
}

// ── Spotlight overlay ─────────────────────────────────────────────────────────

function SpotlightOverlay({ targetRect }: { targetRect: Rect | null }) {
  const PAD = 8;

  if (!targetRect) {
    return (
      <div className="fixed inset-0 bg-black/55 z-[9998] pointer-events-none" />
    );
  }

  const spotTop  = targetRect.top  - PAD;
  const spotLeft = targetRect.left - PAD;
  const spotW    = targetRect.width  + PAD * 2;
  const spotH    = targetRect.height + PAD * 2;

  return (
    <svg
      className="fixed inset-0 z-[9998] pointer-events-none"
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
    >
      <defs>
        <mask id="tour-spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x={spotLeft} y={spotTop} width={spotW} height={spotH} rx="10" fill="black" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.62)" mask="url(#tour-spotlight-mask)" />
      <rect
        x={spotLeft - 2} y={spotTop - 2}
        width={spotW + 4} height={spotH + 4}
        rx="12" fill="none"
        stroke="rgba(99,102,241,0.85)" strokeWidth="2"
      />
    </svg>
  );
}

// ── Progress dots ─────────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {[...Array(total)].map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current   ? "w-4 h-1.5 bg-blue-500"
            : i < current  ? "w-1.5 h-1.5 bg-blue-300"
            :                "w-1.5 h-1.5 bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

// ── Main GuidedTour ───────────────────────────────────────────────────────────

export default function GuidedTour() {
  const { active, step, currentStep, totalSteps, nextStep, prevStep, endTour } = useTour();

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect]   = useState<Rect | null>(null);
  const [visible,    setVisible]      = useState(false);
  const [tooltipPos, setTooltipPos]   = useState<React.CSSProperties>({
    position: "fixed", top: -9999, left: -9999,
  });

  // ── Step change: locate target element ──────────────────────────────────────
  useEffect(() => {
    if (!active) { setVisible(false); return; }

    setVisible(false);
    setTargetRect(null);

    // Longer delay when the step switches tabs so the new page has time to mount
    const delay = step.tab ? 400 : 120;

    const t = setTimeout(() => {
      if (step.tourKey) {
        const el = document.querySelector(`[data-tour="${step.tourKey}"]`) as HTMLElement | null;
        if (el) {
          const r = el.getBoundingClientRect();
          setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }
      }
      setVisible(true);
    }, delay);

    return () => clearTimeout(t);
  }, [active, step, currentStep]);

  // ── After render: measure actual tooltip size and compute position ───────────
  useLayoutEffect(() => {
    if (!active || !visible) return;
    const tip = tooltipRef.current;
    if (!tip) return;

    const tipH = tip.offsetHeight || 280;
    const tipW = tip.offsetWidth  || 320;
    setTooltipPos(getTooltipPosition(targetRect, step.position ?? "bottom", tipW, tipH));
  }, [targetRect, visible, active, step, currentStep]);

  if (!active) return null;

  const isFirst    = currentStep === 0;
  const isLast     = currentStep === totalSteps - 1;
  const progress   = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <>
      <SpotlightOverlay targetRect={visible ? targetRect : null} />

      {/* Tooltip card — initially placed off-screen; repositioned after measurement */}
      <div
        ref={tooltipRef}
        className={`z-[9999] w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ ...tooltipPos, pointerEvents: "auto" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
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
