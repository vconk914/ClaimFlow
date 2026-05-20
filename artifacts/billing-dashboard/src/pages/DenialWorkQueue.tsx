import { useMemo, useState } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, ShieldAlert, FileWarning,
  ChevronRight, Filter, Zap, ClipboardList, ArrowRight,
  FileCheck, Info, DollarSign, RefreshCw,
} from "lucide-react";
import { useClaimStore } from "@/context/ClaimStore";
import { computeClaimRisk } from "@/lib/riskEngine";
import { getRiskColor, getRiskLabel } from "@/components/RiskMeter";
import ClaimDetailModal from "@/components/ClaimDetailModal";
import type { Claim, ClaimStatus } from "@/data/mockData";

// ── Types ──────────────────────────────────────────────────────────────────────

type FilterKey = "all" | "auth" | "modifier" | "coding" | "documentation" | "critical";

interface WorkItem {
  claim: Claim;
  denialProbability: number;
  topIssue: string;
  suggestedFix: string;
  category: FilterKey[];
  payerRiskLevel: string;
  estimatedReimbursement: number;
  estimatedDaysToPayment: number;
}

// ── Determine work queue categories from risk factors ──────────────────────────

function categorize(factors: { label: string; impact: string }[]): FilterKey[] {
  const cats: FilterKey[] = [];
  for (const f of factors) {
    if (f.impact !== "negative") continue;
    const l = f.label.toLowerCase();
    if (l.includes("auth")) cats.push("auth");
    else if (l.includes("modifier")) cats.push("modifier");
    else if (l.includes("diagnosis") || l.includes("scrub error")) cats.push("coding");
    else if (l.includes("documentation") || l.includes("scrub score")) cats.push("documentation");
  }
  return cats.length ? cats : ["coding"];
}

// ── Category config ────────────────────────────────────────────────────────────

const FILTER_CONFIG: Record<FilterKey, { label: string; icon: any; color: string; bg: string; border: string }> = {
  all:           { label: "All",             icon: ClipboardList, color: "text-slate-600", bg: "bg-slate-100",   border: "border-slate-200"   },
  critical:      { label: "Critical Risk",   icon: Zap,           color: "text-red-600",   bg: "bg-red-50",      border: "border-red-200"     },
  auth:          { label: "Auth Required",   icon: ShieldAlert,   color: "text-orange-600",bg: "bg-orange-50",   border: "border-orange-200"  },
  modifier:      { label: "Modifier Alert",  icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50",    border: "border-amber-200"   },
  coding:        { label: "Coding Issue",    icon: FileWarning,   color: "text-blue-600",  bg: "bg-blue-50",     border: "border-blue-200"    },
  documentation: { label: "Documentation",  icon: FileCheck,     color: "text-violet-600",bg: "bg-violet-50",   border: "border-violet-200"  },
};

// ── Work queue item row ────────────────────────────────────────────────────────

function WorkQueueRow({ item, onOpen }: { item: WorkItem; onOpen: () => void }) {
  const dc = getRiskColor(item.denialProbability);
  const isHighRisk = item.denialProbability > 50;

  return (
    <div
      onClick={onOpen}
      className={`group flex items-start gap-4 px-5 py-4 border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors ${
        isHighRisk ? "bg-red-50/20" : ""
      }`}
    >
      {/* Risk arc / score */}
      <div className="shrink-0 flex flex-col items-center gap-1 w-14">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${dc.bg} ${dc.text} border ${dc.border}`}>
          {item.denialProbability}%
        </div>
        <span className={`text-[9px] font-bold ${dc.text}`}>{getRiskLabel(item.denialProbability)}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div>
            <span className="text-xs font-mono text-slate-400 mr-2">{item.claim.id}</span>
            <span className="text-sm font-bold text-slate-900">{item.claim.patient}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500">{item.claim.payer}</span>
            <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{item.claim.cpt}</span>
          </div>
        </div>

        {/* Issue row */}
        <div className="flex items-start gap-2 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">{item.topIssue}</p>
        </div>

        {/* Fix row */}
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 font-medium leading-relaxed">{item.suggestedFix}</p>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          {item.category.map(cat => {
            const cfg = FILTER_CONFIG[cat];
            const Icon = cfg.icon;
            return (
              <span key={cat} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                <Icon className="w-2.5 h-2.5" />
                {cfg.label}
              </span>
            );
          })}
          <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
            <DollarSign className="w-2.5 h-2.5" />
            Est. ${item.estimatedReimbursement} in {item.estimatedDaysToPayment}d
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-3" />
    </div>
  );
}

// ── Summary stat pill ──────────────────────────────────────────────────────────

function SummaryPill({ icon: Icon, label, value, color, bg }: {
  icon: any; label: string; value: string | number; color: string; bg: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${bg} rounded-2xl px-5 py-4 border border-white/50`}>
      <div className="w-9 h-9 bg-white/60 rounded-xl flex items-center justify-center">
        <Icon className={`w-4.5 h-4.5 w-[18px] h-[18px] ${color}`} />
      </div>
      <div>
        <p className={`text-xl font-black ${color}`}>{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ── Urology quick-reference rules panel ──────────────────────────────────────

const UROLOGY_RULES = [
  {
    cpt: "99213–99215",
    title: "E&M Same-Day Procedure",
    rule: "Always add Modifier -25 when billing E&M on the same day as cystoscopy, urodynamics, or any urology procedure.",
    payer: "All payers — NCCI enforced",
    severity: "error" as const,
  },
  {
    cpt: "84153",
    title: "PSA — Medicare Billing",
    rule: "Annual PSA screening: use HCPCS G0103 + ICD-10 Z12.5. Diagnostic PSA: use CPT 84153 + symptomatic diagnosis (N40.1, R31.0). Never bill 84153 with Z00.00.",
    payer: "Medicare / Medicare Advantage",
    severity: "error" as const,
  },
  {
    cpt: "52000 / 52204",
    title: "Cystoscopy — Diagnosis",
    rule: "Primary ICD-10 must be genitourinary (R31.0, N40.1, N30.10, N20.1). Billing cystoscopy with non-GU primary (e.g., UTI J06.9) triggers CO-11 auto-denial.",
    payer: "All payers",
    severity: "error" as const,
  },
  {
    cpt: "55700 / 55706",
    title: "Prostate Biopsy — Medical Necessity",
    rule: "ICD-10 R97.20 (Elevated PSA) or documented abnormal DRE is required. D29.1 (Benign Neoplasm) alone is insufficient for Cigna and most commercial payers.",
    payer: "Cigna, UHC, Aetna",
    severity: "warning" as const,
  },
  {
    cpt: "50590",
    title: "ESWL — Prior Auth",
    rule: "Prior authorization required from all major commercial payers. Obtain 3–5 days before procedure. Stone size, laterality, and location must be in documentation.",
    payer: "All commercial + Medicare Advantage",
    severity: "warning" as const,
  },
  {
    cpt: "51726 / 51727",
    title: "Urodynamics — Auth + Documentation",
    rule: "Auth required by BlueCross, Aetna, most commercial. Requires documentation of failed conservative treatment (6+ weeks pelvic floor PT) per AUA/SUFU guidelines.",
    payer: "BCBS, Aetna, UHC, Cigna",
    severity: "warning" as const,
  },
];

// ── Main page ──────────────────────────────────────────────────────────────────

export default function DenialWorkQueue() {
  const { claims, updateStatus } = useClaimStore();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showRules, setShowRules] = useState(false);

  // Build work queue from pre-submission claims
  const workItems = useMemo<WorkItem[]>(() => {
    const preSubmission: ClaimStatus[] = ["Draft", "Scrubbed", "Submitted", "Pending", "Denied", "Corrected"];
    return claims
      .filter(c => preSubmission.includes(c.status))
      .map(c => {
        const risk = computeClaimRisk(c);
        const negFactors = risk.riskFactors.filter(f => f.impact === "negative");
        const topFactor = negFactors.sort((a, b) => b.weight - a.weight)[0];
        const cats = categorize(risk.riskFactors);

        const topIssue = topFactor
          ? topFactor.detail
          : `${c.payer} has a ${risk.denialProbability}% predicted denial rate for this claim profile.`;

        const suggestedFix = topFactor?.label.toLowerCase().includes("auth")
          ? `Verify prior authorization for CPT ${c.cpt} with ${c.payer} before submission.`
          : topFactor?.label.toLowerCase().includes("modifier")
          ? `Add the required modifier(s) for CPT ${c.cpt} — check ${c.payer} billing guidelines.`
          : topFactor?.label.toLowerCase().includes("diagnosis")
          ? `Correct ICD-10 ${c.icd10} to an approved indication for CPT ${c.cpt}.`
          : topFactor?.label.toLowerCase().includes("scrub")
          ? `Resolve all scrub errors before submission to improve first-pass acceptance.`
          : `Review claim in the Scrubber for full rule analysis before submission.`;

        return {
          claim: c,
          denialProbability: risk.denialProbability,
          topIssue,
          suggestedFix,
          category: cats,
          payerRiskLevel: risk.payerRiskLevel,
          estimatedReimbursement: risk.estimatedReimbursement,
          estimatedDaysToPayment: risk.estimatedDaysToPayment,
        };
      })
      .sort((a, b) => b.denialProbability - a.denialProbability);
  }, [claims]);

  // Filter
  const filtered = useMemo(() => {
    if (activeFilter === "all") return workItems;
    if (activeFilter === "critical") return workItems.filter(i => i.denialProbability > 60);
    return workItems.filter(i => i.category.includes(activeFilter));
  }, [workItems, activeFilter]);

  // Summary stats
  const criticalCount  = workItems.filter(i => i.denialProbability > 60).length;
  const authCount      = workItems.filter(i => i.category.includes("auth")).length;
  const modifierCount  = workItems.filter(i => i.category.includes("modifier")).length;
  const revenueAtRisk  = workItems.filter(i => i.denialProbability > 40).reduce((s, i) => s + i.claim.amount, 0);

  // Filter counts
  const filterCounts: Record<FilterKey, number> = {
    all: workItems.length,
    critical: criticalCount,
    auth: authCount,
    modifier: modifierCount,
    coding: workItems.filter(i => i.category.includes("coding")).length,
    documentation: workItems.filter(i => i.category.includes("documentation")).length,
  };

  return (
    <div className="space-y-6 animate-tab-enter">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-red-600" />
            <h1 className="text-2xl font-black text-foreground">Denial Prevention Queue</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Pre-submission review of claims with elevated denial risk — resolve issues before they hit the payer
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRules(r => !r)}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-colors ${
              showRules ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Urology Rules Reference
          </button>
        </div>
      </div>

      {/* ── Summary pills ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryPill icon={Zap}         label="Critical Risk Claims"   value={criticalCount}               color="text-red-600"    bg="bg-red-50"    />
        <SummaryPill icon={ShieldAlert} label="Auth Gaps Detected"      value={authCount}                   color="text-orange-600" bg="bg-orange-50" />
        <SummaryPill icon={AlertTriangle} label="Modifier Alerts"       value={modifierCount}               color="text-amber-600"  bg="bg-amber-50"  />
        <SummaryPill icon={DollarSign}  label="Revenue at Risk"         value={`$${(revenueAtRisk/1000).toFixed(1)}k`} color="text-slate-700"  bg="bg-slate-100" />
      </div>

      {/* ── Urology rules reference (collapsible) ───────────────────────────── */}
      {showRules && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm">Urology Denial Prevention — Quick Reference Rules</h2>
            <span className="ml-auto text-[10px] text-slate-400">Based on current payer LCDs and NCCI edits</span>
          </div>
          <div className="divide-y divide-slate-50">
            {UROLOGY_RULES.map((rule, i) => (
              <div key={i} className={`flex gap-4 px-6 py-4 ${rule.severity === "error" ? "bg-red-50/30" : "bg-amber-50/20"}`}>
                <div className="shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    rule.severity === "error"
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-amber-50 text-amber-600 border-amber-200"
                  }`}>
                    {rule.severity === "error" ? "REQUIRED" : "ADVISORY"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{rule.cpt}</span>
                    <span className="text-sm font-bold text-slate-800">{rule.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-1.5">{rule.rule}</p>
                  <p className="text-[10px] text-slate-400">Applies to: {rule.payer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Work queue ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {(Object.keys(FILTER_CONFIG) as FilterKey[]).map(f => {
            const cfg = FILTER_CONFIG[f];
            const Icon = cfg.icon;
            const count = filterCounts[f];
            const active = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border ${
                  active
                    ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                    : "text-slate-500 border-transparent hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3 h-3" />
                {cfg.label}
                <span className={`text-[10px] px-1 rounded-full ${active ? "bg-white/60" : "bg-slate-100 text-slate-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
            <RefreshCw className="w-3 h-3" />
            Live · {workItems.length} claims in queue
          </div>
        </div>

        {/* Table header */}
        <div className="px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 flex items-center gap-4">
          <div className="w-14 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Risk</span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Claim / Issue</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Suggested Fix</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Category</span>
          </div>
        </div>

        {/* Items */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="font-bold text-slate-700">No items in this filter</p>
            <p className="text-sm text-slate-400 mt-1">
              {activeFilter === "all"
                ? "All active claims are at low denial risk."
                : `No claims flagged with ${FILTER_CONFIG[activeFilter].label} issues.`}
            </p>
          </div>
        ) : (
          filtered.map(item => (
            <WorkQueueRow
              key={item.claim.id}
              item={item}
              onOpen={() => setSelectedClaim(item.claim)}
            />
          ))
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/40 flex items-center justify-between">
            <p className="text-[10px] text-slate-400">
              {filtered.length} claim{filtered.length !== 1 ? "s" : ""} · Click any row to review and take action
            </p>
            <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold">
              <ArrowRight className="w-3 h-3" />
              Open in Scrubber to fix
            </div>
          </div>
        )}
      </div>

      {/* ── Payer auth quick-check ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <ShieldAlert className="w-4 h-4 text-orange-500" />
          <h2 className="font-bold text-slate-900 text-sm">Prior Authorization Requirements by Payer</h2>
          <span className="ml-auto text-[10px] text-slate-400">Urology-specific · Common procedures</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                {["Procedure", "Medicare", "BlueCross", "Aetna", "Cigna", "UHC", "Medicaid"].map(h => (
                  <th key={h} className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { proc: "Cystoscopy (52000)",       vals: ["No","No","Yes","No","Yes","Yes"] },
                { proc: "ESWL (50590)",             vals: ["MA only","No","Yes","Yes","Yes","Yes"] },
                { proc: "Urodynamics (51726)",      vals: ["No","Yes","Yes","Yes","Yes","Yes"] },
                { proc: "Prostate Biopsy (55700)", vals: ["No","No","Yes","Yes","Yes","Yes"] },
                { proc: "TURP (52601)",             vals: ["No","Yes","Yes","Yes","Yes","Yes"] },
                { proc: "CT Urogram (74177)",       vals: ["No","Yes","Yes","Yes","Yes","Yes"] },
              ].map(row => (
                <tr key={row.proc} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">{row.proc}</td>
                  {row.vals.map((v, i) => (
                    <td key={i} className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        v === "Yes"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : v === "No"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-amber-50 text-amber-600 border-amber-200"
                      }`}>
                        {v === "Yes" && <ShieldAlert className="w-2.5 h-2.5" />}
                        {v === "No" && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {v === "MA only" && <AlertTriangle className="w-2.5 h-2.5" />}
                        {v}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-400 mt-4">MA = Medicare Advantage plans only. Verify with individual plan ID — requirements vary by region and plan contract.</p>
      </div>

      {selectedClaim && (
        <ClaimDetailModal claim={selectedClaim} onClose={() => setSelectedClaim(null)} />
      )}
    </div>
  );
}
