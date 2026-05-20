// ─── Claim Health Score Engine ────────────────────────────────────────────────

import type { ScrubError } from "@/data/mockData";

export type DenialRisk = "low" | "medium" | "high" | "critical";
export type AuthRisk   = "low" | "medium" | "high";

export interface ScoreRecommendation {
  priority: "high" | "medium" | "low";
  text: string;
}

export interface ClaimHealthScore {
  overall:                  number;   // 0–100
  denialRisk:               DenialRisk;
  reimbursementConfidence:  number;   // 0–100
  codingCompleteness:       number;   // 0–100
  authorizationRisk:        AuthRisk;
  modifierAccuracy:         number;   // 0–100
  recommendations:          ScoreRecommendation[];
}

// ─── Payer-specific risk adjustments ─────────────────────────────────────────

const PAYER_RISK_ADJUST: Record<string, number> = {
  "Medicare":                  -5,   // strict coding rules
  "Medicaid":                  -4,
  "UnitedHealthcare":          -3,
  "Cigna":                     -3,
  "Aetna":                     -2,
  "Allstate No-Fault / PIP":  -10,  // no-fault has extra compliance overhead
  "GEICO No-Fault":            -8,
};

// ─── Specialty risk adjustments ───────────────────────────────────────────────

const SPECIALTY_RISK_ADJUST: Record<string, number> = {
  "orthopedics":                  -4,  // high-cost, high-scrutiny
  "behavioral-health":            -3,  // DSM-5 alignment required
  "urgent-emergency":             -3,  // documentation-heavy
  "physical-occupational-therapy": -2,
  "preventive-care":              +5,  // usually low complexity
  "family-medicine":              +2,
};

// ─── Modifier-sensitive CPT codes ────────────────────────────────────────────

const MODIFIER_SENSITIVE_CPTS = new Set([
  "99202","99203","99204","99205",   // new patient E&M
  "99211","99212","99213","99214","99215",  // established E&M
  "99281","99282","99283","99284","99285",  // ED visits
]);

// ─── Main scoring function ────────────────────────────────────────────────────

export function computeHealthScore(params: {
  cpt:        string;
  icd10:      string;
  payer:      string;
  specialtyId: string;
  errors:     ScrubError[];
  amount?:    string;
}): ClaimHealthScore {
  const { cpt, icd10, payer, specialtyId, errors, amount } = params;

  // ── Base score ──────────────────────────────────────────────────────────────
  let base = 100;

  const errorCount   = errors.filter(e => e.severity === "error").length;
  const warningCount = errors.filter(e => e.severity === "warning").length;
  const infoCount    = errors.filter(e => e.severity === "info").length;

  base -= errorCount   * 22;
  base -= warningCount * 9;
  base -= infoCount    * 2;

  // Missing required fields
  if (!cpt)   base -= 15;
  if (!icd10) base -= 15;

  // Payer adjustment
  const payerAdj = PAYER_RISK_ADJUST[payer] ?? 0;
  base += payerAdj;

  // Specialty adjustment
  const specAdj = SPECIALTY_RISK_ADJUST[specialtyId] ?? 0;
  base += specAdj;

  const overall = Math.max(2, Math.min(100, Math.round(base)));

  // ── Sub-scores ──────────────────────────────────────────────────────────────

  const codingCompleteness = Math.max(0, Math.min(100,
    Math.round(100 - errorCount * 28 - warningCount * 10 - (!cpt ? 20 : 0) - (!icd10 ? 20 : 0))
  ));

  const hasModifierError = errors.some(e =>
    e.field === "modifier" || e.message?.toLowerCase().includes("modifier")
  );
  const needsModifier = MODIFIER_SENSITIVE_CPTS.has(cpt);
  const modifierAccuracy = hasModifierError ? 35 :
    needsModifier && errorCount > 0 ? 65 : 100;

  const authorizationRisk: AuthRisk =
    payer.includes("No-Fault") || payer.includes("Workers") ? "high" :
    warningCount >= 2 || errorCount >= 2 ? "high" :
    errorCount >= 1 || warningCount >= 1 ? "medium" : "low";

  const reimbursementConfidence = Math.max(0, Math.min(100,
    Math.round(overall * 0.9 + (errorCount === 0 ? 8 : 0))
  ));

  // ── Denial risk level ────────────────────────────────────────────────────────

  const denialRisk: DenialRisk =
    overall >= 85 ? "low" :
    overall >= 65 ? "medium" :
    overall >= 40 ? "high" : "critical";

  // ── Recommendations ──────────────────────────────────────────────────────────

  const recommendations: ScoreRecommendation[] = [];

  if (errorCount > 0) {
    recommendations.push({ priority: "high", text: `Resolve ${errorCount} error${errorCount > 1 ? "s" : ""} before submission to avoid automatic denial.` });
  }
  if (warningCount > 0) {
    recommendations.push({ priority: "medium", text: `Review ${warningCount} warning${warningCount > 1 ? "s" : ""} — these increase audit and downcode risk.` });
  }
  if (hasModifierError) {
    recommendations.push({ priority: "high", text: "Verify modifier usage — missing or incorrect modifiers are a top-10 denial cause for this CPT category." });
  }
  if (!cpt) {
    recommendations.push({ priority: "high", text: "CPT code is required. Select the procedure code that most accurately describes the service rendered." });
  }
  if (!icd10) {
    recommendations.push({ priority: "high", text: "ICD-10 code is required. Choose the diagnosis that is most specific and supported by the documentation." });
  }
  if (payer.includes("Medicare") && needsModifier) {
    recommendations.push({ priority: "medium", text: "Medicare E&M claims require Modifier -25 if a procedure was performed on the same date of service." });
  }
  if (payer.includes("No-Fault")) {
    recommendations.push({ priority: "high", text: "NY No-Fault: submit within 30 calendar days of service. Late bills are absolutely denied with no appeal path." });
  }
  if (authorizationRisk === "high") {
    recommendations.push({ priority: "medium", text: "Verify prior authorization is on file before submitting. Authorization-related denials account for 11% of all claim rejections." });
  }
  if (errorCount === 0 && warningCount === 0 && overall >= 85) {
    recommendations.push({ priority: "low", text: "Claim looks clean. Consider adding specificity to ICD-10 code if the documentation supports a more precise code." });
  }

  return {
    overall,
    denialRisk,
    reimbursementConfidence,
    codingCompleteness,
    authorizationRisk,
    modifierAccuracy,
    recommendations,
  };
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const DENIAL_RISK_CONFIG: Record<DenialRisk, { label: string; color: string; bg: string; border: string; bar: string; ring: string }> = {
  low:      { label: "Low Denial Risk",      color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500", ring: "stroke-emerald-500" },
  medium:   { label: "Moderate Denial Risk", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   bar: "bg-amber-400",   ring: "stroke-amber-400"   },
  high:     { label: "High Denial Risk",     color: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200",  bar: "bg-orange-500",  ring: "stroke-orange-500"  },
  critical: { label: "Critical Denial Risk", color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     bar: "bg-red-500",     ring: "stroke-red-500"     },
};

export const AUTH_RISK_CONFIG: Record<AuthRisk, { label: string; badge: string; text: string }> = {
  low:    { label: "Auth Risk: Low",    badge: "bg-emerald-100", text: "text-emerald-700" },
  medium: { label: "Auth Risk: Medium", badge: "bg-amber-100",   text: "text-amber-700"   },
  high:   { label: "Auth Risk: High",   badge: "bg-red-100",     text: "text-red-700"     },
};
