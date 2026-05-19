import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, DollarSign, ArrowRight,
  Zap, ShieldAlert, TrendingDown, MapPin, Stethoscope, ChevronRight,
  Play, RotateCcw, Info,
} from "lucide-react";
import {
  DEMO_SCENARIOS, RISK_CONFIG, SCENARIO_COLOR_CONFIG, STEP_CONFIG,
  type DemoScenario, type ScenarioPrefill,
} from "@/data/demoScenarios";

interface Props {
  onLoadInScrubber: (prefill: ScenarioPrefill) => void;
}

// ── Denial Risk Score gauge ───────────────────────────────────────────────────

function RiskGauge({ score, level }: { score: number; level: DemoScenario["riskLevel"] }) {
  const rc = RISK_CONFIG[level];
  const pct = score;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="8"
            className="text-muted/30" strokeDasharray="188.5" strokeDashoffset="0" strokeLinecap="round" />
          <circle cx="40" cy="40" r="30" fill="none" strokeWidth="8"
            className={rc.bar.replace("bg-", "stroke-")}
            strokeDasharray="188.5"
            strokeDashoffset={188.5 - (188.5 * pct / 100)}
            strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-lg font-bold text-foreground leading-none">{score}</span>
          <span className="text-[9px] text-muted-foreground font-medium leading-none mt-0.5">/ 100</span>
        </div>
      </div>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rc.badge} ${rc.badgeText}`}>
        {rc.label} Risk
      </span>
    </div>
  );
}

// ── Scenario list card ────────────────────────────────────────────────────────

function ScenarioCard({
  scenario, active, onClick,
}: { scenario: DemoScenario; active: boolean; onClick: () => void }) {
  const rc = RISK_CONFIG[scenario.riskLevel];
  const cc = SCENARIO_COLOR_CONFIG[scenario.color];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-3.5 transition-all group ${
        active
          ? `${cc.border} ${cc.bg} shadow-sm`
          : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${rc.dot}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold leading-snug ${active ? cc.heading : "text-foreground"}`}>
            {scenario.title}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${rc.badge} ${rc.badgeText}`}>
              {rc.label}
            </span>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {scenario.specialty}
            </span>
          </div>
          <p className={`text-[10px] mt-1.5 font-semibold ${scenario.riskLevel === "critical" ? "text-red-600" : scenario.riskLevel === "high" ? "text-orange-600" : "text-amber-600"}`}>
            ${scenario.financialImpact.toLocaleString()} at risk
          </p>
        </div>
        {active && <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-1 ${cc.text}`} />}
      </div>
    </button>
  );
}

// ── Claim field preview ───────────────────────────────────────────────────────

function ClaimFieldPreview({
  label, value, changed, error,
}: { label: string; value: string; changed?: boolean; error?: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${
      error ? "border-red-300 bg-red-50" :
      changed ? "border-emerald-300 bg-emerald-50" :
      "border-border bg-muted/20"
    }`}>
      <p className="text-[10px] font-medium text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-xs font-semibold truncate ${
        error ? "text-red-700" : changed ? "text-emerald-700" : "text-foreground"
      }`}>{value || "—"}</p>
      {changed && (
        <span className="text-[9px] text-emerald-600 font-medium">✓ corrected</span>
      )}
      {error && (
        <span className="text-[9px] text-red-600 font-medium">✗ error</span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DemoScenarios({ onLoadInScrubber }: Props) {
  const [activeId, setActiveId] = useState<string>(DEMO_SCENARIOS[0].id);
  const [activeView, setActiveView] = useState<"analysis" | "walkthrough">("analysis");
  const [loaded, setLoaded] = useState<string | null>(null);

  const scenario = DEMO_SCENARIOS.find(s => s.id === activeId) ?? DEMO_SCENARIOS[0];
  const cc = SCENARIO_COLOR_CONFIG[scenario.color];
  const rc = RISK_CONFIG[scenario.riskLevel];

  function handleLoad() {
    onLoadInScrubber(scenario.prefill);
    setLoaded(scenario.id);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demo Scenarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Six preset workflows illustrating real-world claim failures, denial logic, and corrective steps.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
            Simulated Data Only
          </span>
          <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <Zap className="w-3 h-3" />
            Live denial detection
          </span>
        </div>
      </div>

      <div className="flex gap-5 h-[calc(100vh-200px)] min-h-[600px]">
        {/* ── Left: Scenario selector ── */}
        <div className="w-72 flex flex-col gap-2 shrink-0 overflow-y-auto pr-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-0.5 mb-1">
            6 Scenarios
          </p>
          {DEMO_SCENARIOS.map(s => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              active={s.id === activeId}
              onClick={() => { setActiveId(s.id); setActiveView("analysis"); setLoaded(null); }}
            />
          ))}

          {/* Legend */}
          <div className="mt-2 p-3 bg-muted/30 border border-border rounded-xl space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Risk Levels</p>
            {(["critical", "high", "medium", "low"] as const).map(lvl => (
              <div key={lvl} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${RISK_CONFIG[lvl].dot}`} />
                <span className="text-[10px] text-muted-foreground">{RISK_CONFIG[lvl].label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Scenario detail ── */}
        <div className="flex-1 min-w-0 overflow-y-auto space-y-4 pb-6">
          {/* Header card */}
          <div className={`rounded-xl border-2 ${cc.border} ${cc.bg} p-5`}>
            <div className="flex items-start gap-5">
              {/* Risk gauge */}
              <div className="shrink-0">
                <RiskGauge score={scenario.denialRiskScore} level={scenario.riskLevel} />
              </div>

              {/* Title + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rc.badge} ${rc.badgeText} border ${rc.badge.replace("bg-", "border-").replace("100", "200")}`}>
                    {rc.label} Risk
                  </span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {scenario.specialty}
                  </span>
                  <span className="flex items-center gap-1 text-xs bg-card border border-border text-muted-foreground px-2 py-0.5 rounded-full">
                    <MapPin className="w-2.5 h-2.5" />
                    {scenario.regionLabel}
                  </span>
                  <span className="text-xs bg-card border border-border text-muted-foreground px-2 py-0.5 rounded-full">
                    {scenario.payerType}
                  </span>
                </div>
                <h2 className={`text-lg font-bold ${cc.heading} leading-snug`}>{scenario.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{scenario.subtitle}</p>
              </div>

              {/* Metric cards */}
              <div className="flex gap-3 shrink-0">
                <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
                  <TrendingDown className="w-4 h-4 text-red-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">${scenario.financialImpact.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">at risk</p>
                </div>
                <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
                  <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{scenario.estimatedDelayDays}d</p>
                  <p className="text-[10px] text-muted-foreground font-medium">delay</p>
                </div>
                <div className="bg-card border border-border rounded-xl px-4 py-3 text-center">
                  <DollarSign className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">${scenario.afterReimbursement.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">recoverable</p>
                </div>
              </div>
            </div>
          </div>

          {/* View tabs */}
          <div className="flex items-center gap-1 bg-muted/40 border border-border rounded-xl p-1">
            {([
              { id: "analysis",    label: "Before / After Analysis" },
              { id: "walkthrough", label: "Fix Walkthrough" },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
                  activeView === tab.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Analysis view ── */}
          {activeView === "analysis" && (
            <div className="grid grid-cols-2 gap-4">
              {/* Before Fix */}
              <div className="bg-card border-2 border-red-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-800">Before Fix</span>
                  <span className="ml-auto text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full font-medium">
                    {scenario.beforeErrors.filter(e => e.severity === "error").length} error{scenario.beforeErrors.filter(e => e.severity === "error").length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  {/* Claim fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <ClaimFieldPreview label="Patient" value={scenario.prefill.patient} />
                    <ClaimFieldPreview label="Insurance ID" value={scenario.prefill.insuranceId} />
                    <ClaimFieldPreview label="CPT Code" value={scenario.prefill.cpt} error={scenario.beforeErrors.some(e => e.field === "cpt" && e.severity === "error")} />
                    <ClaimFieldPreview label="ICD-10" value={scenario.prefill.icd10} error={scenario.beforeErrors.some(e => e.field === "icd10" && e.severity === "error")} />
                    <ClaimFieldPreview label="Payer" value={scenario.prefill.payer} />
                    <ClaimFieldPreview label="Billed Amount" value={`$${scenario.billedAmount.toLocaleString()}`} />
                  </div>

                  {/* Denial errors */}
                  <div className="space-y-2">
                    {scenario.beforeErrors.map((err, i) => (
                      <div key={i} className={`rounded-lg p-3 border ${
                        err.severity === "error"   ? "bg-red-50 border-red-200" :
                        err.severity === "warning" ? "bg-amber-50 border-amber-200" :
                        "bg-blue-50 border-blue-200"
                      }`}>
                        <div className="flex items-start gap-2">
                          {err.severity === "error"   && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                          {err.severity === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                          {err.severity === "info"    && <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${
                              err.severity === "error" ? "text-red-800" :
                              err.severity === "warning" ? "text-amber-800" : "text-blue-800"
                            }`}>{err.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{err.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payer response */}
                  <div className="bg-red-950 rounded-lg p-3 font-mono">
                    <p className="text-[9px] text-red-400 font-semibold mb-1 uppercase tracking-wider">Simulated Payer Response</p>
                    <p className="text-xs text-red-200 leading-relaxed">{scenario.payerResponseText}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[9px] font-bold text-red-400 bg-red-900 px-1.5 py-0.5 rounded">
                        {scenario.payerResponseCode}
                      </span>
                      <span className="text-[9px] text-red-400">CLAIM DENIED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* After Fix */}
              <div className="bg-card border-2 border-emerald-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-800">After Fix</span>
                  <span className="ml-auto text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                    corrected
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  {/* Corrected claim fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <ClaimFieldPreview label="Patient" value={scenario.prefill.patient} />
                    <ClaimFieldPreview label="Insurance ID" value={scenario.prefill.insuranceId} />
                    <ClaimFieldPreview
                      label="CPT Code"
                      value={scenario.afterCpt}
                      changed={scenario.afterCpt !== scenario.prefill.cpt}
                    />
                    <ClaimFieldPreview
                      label="ICD-10"
                      value={scenario.afterIcd10}
                      changed={scenario.afterIcd10 !== scenario.prefill.icd10}
                    />
                    <ClaimFieldPreview
                      label="Payer"
                      value={scenario.afterPayer}
                      changed={scenario.afterPayer !== scenario.prefill.payer}
                    />
                    <ClaimFieldPreview label="Billed Amount" value={`$${scenario.billedAmount.toLocaleString()}`} />
                  </div>

                  {/* Fix note */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-emerald-800 mb-0.5">What Was Fixed</p>
                        <p className="text-xs text-emerald-700 leading-relaxed">{scenario.afterNote}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-lg p-3">
                    <p className="text-xs font-semibold text-foreground mb-1">Why This Fixes It</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{scenario.afterExplanation}</p>
                  </div>

                  {/* Payer response (after) */}
                  <div className="bg-emerald-950 rounded-lg p-3 font-mono">
                    <p className="text-[9px] text-emerald-400 font-semibold mb-1 uppercase tracking-wider">Projected Payer Response</p>
                    <p className="text-xs text-emerald-200 leading-relaxed">{scenario.afterPayerResponse}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-900 px-1.5 py-0.5 rounded">
                        ${scenario.afterReimbursement.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-emerald-400">PAYABLE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Walkthrough view ── */}
          {activeView === "walkthrough" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Step-by-Step Fix Walkthrough</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Follow this workflow to identify, correct, and prevent this denial pattern.
                </p>
              </div>
              <div className="p-5">
                <div className="relative">
                  {scenario.steps.map((step, i) => {
                    const sc = STEP_CONFIG[step.type];
                    const isLast = i === scenario.steps.length - 1;
                    return (
                      <div key={i} className="flex gap-4">
                        {/* Step indicator + line */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-lg border-2 ${sc.border} ${sc.bg} flex items-center justify-center shrink-0 z-10`}>
                            <span className={`text-xs font-bold ${sc.text}`}>{sc.icon}</span>
                          </div>
                          {!isLast && <div className={`w-0.5 flex-1 my-1 ${sc.line}`} />}
                        </div>
                        {/* Content */}
                        <div className={`flex-1 pb-${isLast ? "0" : "5"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-foreground">{step.title}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sc.bg} ${sc.text}`}>
                              {step.type}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Suggestions from beforeErrors */}
                <div className="mt-2 border-t border-border pt-5">
                  <p className="text-xs font-semibold text-foreground mb-3">Corrective Action Details</p>
                  <div className="space-y-2.5">
                    {scenario.beforeErrors.map((err, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground">{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{err.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{err.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA bar */}
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Try it in the Claims Scrubber</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Auto-fills the scrubber form with this scenario's claim data and runs live denial detection.
              </p>
            </div>
            {loaded === scenario.id ? (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                Loaded — switch to Claims Scrubber
              </div>
            ) : (
              <button
                onClick={handleLoad}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shrink-0"
              >
                <Play className="w-4 h-4" />
                Load in Claims Scrubber
              </button>
            )}
            <button
              onClick={() => setLoaded(null)}
              className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
