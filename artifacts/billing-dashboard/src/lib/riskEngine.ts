import type { Claim } from "@/data/mockData";
import { getPayerProfile } from "@/data/payerProfiles";

export interface RiskFactor {
  label: string;
  impact: "positive" | "negative" | "neutral";
  detail: string;
  weight: number; // contribution to overall risk delta
}

export interface ClaimRiskScore {
  denialProbability: number;      // 0-100
  reimbursementConfidence: number;// 0-100
  estimatedDaysToPayment: number;
  estimatedReimbursement: number; // $
  reimbursementMin: number;       // $ range low
  reimbursementMax: number;       // $ range high
  payerRiskLevel: "low" | "medium" | "high" | "critical";
  riskFactors: RiskFactor[];
  predictiveInsight: string;
  cashFlowImpact: "positive" | "at-risk" | "negative";
  reimbursementDelayRisk: "low" | "medium" | "high";
}

// High-risk CPT codes that frequently trigger denials
const HIGH_RISK_CPTS = new Set(["55700", "52310", "52315", "52214", "55801", "55810", "55821", "55840", "55845"]);
const MODIFIER_REQUIRED_CPTS = new Set(["99213", "99214", "99215", "99203", "99204", "99205"]);
const AUTH_REQUIRED_CPTS = new Set(["55700", "52000", "52001", "52310", "52315", "55801", "55810", "55821"]);

// Problematic ICD-10 codes for specific payers
const PROBLEMATIC_DIAGNOSES: Record<string, string[]> = {
  Medicare: ["Z00.00", "Z00.01", "Z13.6"],
  Aetna:    ["Z00.00", "Z13.6"],
  Cigna:    ["Z00.00", "Z13.6", "R52"],
};

/** Deterministic pseudo-hash for seeded variance (no randomness on re-render) */
function claimSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) >>> 0;
  }
  return (h % 1000) / 1000; // 0-1
}

export function computeClaimRisk(claim: Claim): ClaimRiskScore {
  const profile = getPayerProfile(claim.payer);
  const seed = claimSeed(claim.id);
  const riskFactors: RiskFactor[] = [];

  // ── Base denial probability from payer profile ──────────────────────────────
  let denialProb = profile.baseDenialRate * 100; // e.g. 14 for Medicare

  // ── Scrub score adjustment ────────────────────────────────────────────────
  const scrubScore = claim.scrubScore ?? 75;
  if (scrubScore >= 90) {
    denialProb -= 8;
    riskFactors.push({ label: "AI Scrub Score", impact: "positive", detail: `Score ${scrubScore}/100 — minimal errors detected`, weight: -8 });
  } else if (scrubScore >= 75) {
    denialProb -= 3;
    riskFactors.push({ label: "AI Scrub Score", impact: "positive", detail: `Score ${scrubScore}/100 — minor warnings only`, weight: -3 });
  } else if (scrubScore >= 55) {
    denialProb += 10;
    riskFactors.push({ label: "AI Scrub Score", impact: "negative", detail: `Score ${scrubScore}/100 — multiple warnings present`, weight: +10 });
  } else {
    denialProb += 25;
    riskFactors.push({ label: "AI Scrub Score", impact: "negative", detail: `Score ${scrubScore}/100 — significant errors detected`, weight: +25 });
  }

  // ── Scrub errors ──────────────────────────────────────────────────────────
  const errorCount = claim.scrubErrorCount ?? 0;
  if (errorCount > 0) {
    const adj = errorCount * 12;
    denialProb += adj;
    riskFactors.push({ label: "Scrub Errors", impact: "negative", detail: `${errorCount} unresolved error${errorCount > 1 ? "s" : ""} flagged`, weight: adj });
  }

  // ── Payer modifier enforcement ────────────────────────────────────────────
  if (profile.modifierEnforcement > 0.7 && MODIFIER_REQUIRED_CPTS.has(claim.cpt)) {
    const adj = Math.round(profile.modifierEnforcement * 15);
    denialProb += adj;
    riskFactors.push({ label: "Modifier Risk", impact: "negative", detail: `${profile.name} strictly enforces modifiers on CPT ${claim.cpt}`, weight: adj });
  } else if (MODIFIER_REQUIRED_CPTS.has(claim.cpt)) {
    riskFactors.push({ label: "Modifier Check", impact: "neutral", detail: `CPT ${claim.cpt} may require modifier — verify before submission`, weight: 0 });
  }

  // ── Prior auth risk ───────────────────────────────────────────────────────
  if (AUTH_REQUIRED_CPTS.has(claim.cpt) && profile.authSensitivity > 0.65) {
    const adj = Math.round(profile.authSensitivity * 18);
    denialProb += adj;
    riskFactors.push({ label: "Prior Auth Required", impact: "negative", detail: `${profile.name} requires auth for CPT ${claim.cpt}`, weight: adj });
  }

  // ── High-risk CPT ─────────────────────────────────────────────────────────
  if (HIGH_RISK_CPTS.has(claim.cpt)) {
    denialProb += 8;
    riskFactors.push({ label: "High-Risk Procedure", impact: "negative", detail: `CPT ${claim.cpt} has elevated denial frequency across payers`, weight: 8 });
  }

  // ── Problematic diagnosis for this payer ────────────────────────────────
  const badDx = (PROBLEMATIC_DIAGNOSES[claim.payer] ?? []).includes(claim.icd10);
  if (badDx) {
    denialProb += 22;
    riskFactors.push({ label: "Diagnosis Risk", impact: "negative", detail: `ICD-10 ${claim.icd10} frequently denied by ${claim.payer}`, weight: 22 });
  } else {
    riskFactors.push({ label: "Diagnosis Coverage", impact: "positive", detail: `ICD-10 ${claim.icd10} is a covered indication for this payer`, weight: -4 });
    denialProb -= 4;
  }

  // ── Payer base risk level ─────────────────────────────────────────────────
  if (profile.riskLevel === "critical") {
    riskFactors.push({ label: "Payer Risk Level", impact: "negative", detail: `${profile.name} is a critical-risk payer (baseline denial rate ${Math.round(profile.baseDenialRate * 100)}%)`, weight: 0 });
  } else if (profile.riskLevel === "high") {
    riskFactors.push({ label: "Payer Risk Level", impact: "negative", detail: `${profile.name} has an above-average denial rate (${Math.round(profile.baseDenialRate * 100)}%)`, weight: 0 });
  } else if (profile.riskLevel === "low") {
    riskFactors.push({ label: "Payer Risk Level", impact: "positive", detail: `${profile.name} has a strong first-pass acceptance rate`, weight: 0 });
  }

  // ── Claim amount risk ─────────────────────────────────────────────────────
  if (claim.amount > 600) {
    denialProb += 5;
    riskFactors.push({ label: "Claim Amount", impact: "negative", detail: `High-value claim ($${claim.amount.toFixed(0)}) — increased payer scrutiny expected`, weight: 5 });
  } else if (claim.amount < 100) {
    riskFactors.push({ label: "Claim Amount", impact: "positive", detail: `Low-value claim — less likely to trigger additional review`, weight: 0 });
  }

  // ── Status-based overrides ────────────────────────────────────────────────
  const terminalStatus = claim.status;
  if (terminalStatus === "Paid" || terminalStatus === "Approved") {
    denialProb = 4 + Math.round(seed * 6); // already resolved
    riskFactors.length = 0;
    riskFactors.push({ label: "Claim Resolved", impact: "positive", detail: `Claim has been ${terminalStatus.toLowerCase()} — no outstanding risk`, weight: 0 });
  } else if (terminalStatus === "Denied") {
    denialProb = Math.max(denialProb, 78);
    riskFactors.push({ label: "Active Denial", impact: "negative", detail: claim.denialCode ? `Denial code: ${claim.denialCode}` : "Claim has been denied — correction required", weight: 0 });
  } else if (terminalStatus === "Corrected" || terminalStatus === "Resubmitted") {
    denialProb = Math.max(denialProb - 10, 15);
    riskFactors.push({ label: "Claim Corrected", impact: "positive", detail: "Corrections applied — reduced re-denial risk", weight: -10 });
  }

  // ── Clamp final denial probability ────────────────────────────────────────
  denialProb = Math.min(96, Math.max(2, Math.round(denialProb + seed * 4)));

  // ── Derived scores ────────────────────────────────────────────────────────
  const reimbursementConfidence = Math.round(100 - denialProb * 0.7 + seed * 6);
  const clampedConf = Math.min(98, Math.max(10, reimbursementConfidence));

  const baseReimbursement = claim.amount * profile.avgReimbursementRate;
  const variance = claim.amount * 0.08;
  const estimatedReimbursement = Math.round(baseReimbursement * (0.95 + seed * 0.1));
  const reimbursementMin = Math.round(Math.max(0, baseReimbursement - variance));
  const reimbursementMax = Math.round(baseReimbursement + variance);

  const delayFactor = denialProb > 50 ? 1.4 : denialProb > 30 ? 1.15 : 1.0;
  const estimatedDaysToPayment = Math.round(profile.avgDaysToPayment * delayFactor);

  const payerRiskLevel = profile.riskLevel;
  const cashFlowImpact: ClaimRiskScore["cashFlowImpact"] =
    denialProb > 55 ? "negative" : denialProb > 30 ? "at-risk" : "positive";

  const reimbursementDelayRisk: ClaimRiskScore["reimbursementDelayRisk"] =
    profile.reimbursementSpeed === "very-slow" ? "high" :
    profile.reimbursementSpeed === "slow" ? "high" :
    profile.reimbursementSpeed === "medium" ? "medium" : "low";

  // ── Predictive insight ────────────────────────────────────────────────────
  const insights = profile.predictiveInsights;
  const predictiveInsight = insights[Math.floor(seed * insights.length)] ?? insights[0];

  return {
    denialProbability: denialProb,
    reimbursementConfidence: clampedConf,
    estimatedDaysToPayment,
    estimatedReimbursement,
    reimbursementMin,
    reimbursementMax,
    payerRiskLevel,
    riskFactors,
    predictiveInsight,
    cashFlowImpact,
    reimbursementDelayRisk,
  };
}

/** Compute portfolio-level predictive summary across all claims */
export interface PortfolioForecast {
  projectedCCR: number;         // % projected clean claim rate
  projectedDenialVolume: number;// count expected denials
  projectedRevenueAtRisk: number; // $
  projectedDSO: number;         // days
  avgDenialProbability: number; // %
  highRiskClaims: number;       // claims with denial prob > 50
  criticalRiskClaims: number;   // claims with denial prob > 70
  projectedMonthlyRevenue: number; // $
  authBottleneckRisk: "low" | "medium" | "high";
}

export function computePortfolioForecast(claims: Claim[]): PortfolioForecast {
  if (claims.length === 0) {
    return {
      projectedCCR: 94, projectedDenialVolume: 0, projectedRevenueAtRisk: 0,
      projectedDSO: 18, avgDenialProbability: 0, highRiskClaims: 0,
      criticalRiskClaims: 0, projectedMonthlyRevenue: 0, authBottleneckRisk: "low",
    };
  }

  const scores = claims.map(c => computeClaimRisk(c));
  const avgDenial = scores.reduce((s, r) => s + r.denialProbability, 0) / scores.length;
  const highRisk = scores.filter(r => r.denialProbability > 50).length;
  const criticalRisk = scores.filter(r => r.denialProbability > 70).length;
  const totalBilled = claims.reduce((s, c) => s + c.amount, 0);
  const revenueAtRisk = scores.reduce((s, r, i) => s + (r.denialProbability > 40 ? claims[i].amount : 0), 0);
  const projectedRevenue = scores.reduce((s, r) => s + r.estimatedReimbursement, 0);
  const avgDSO = scores.reduce((s, r) => s + r.estimatedDaysToPayment, 0) / scores.length;
  const projectedCCR = Math.round(100 - avgDenial * 0.85);

  const authPayers = ["Aetna", "UnitedHealth", "Cigna"];
  const authRiskClaims = claims.filter(c => authPayers.some(p => c.payer.includes(p))).length;
  const authBottleneckRisk = authRiskClaims / claims.length > 0.4 ? "high" : authRiskClaims / claims.length > 0.2 ? "medium" : "low";

  return {
    projectedCCR,
    projectedDenialVolume: Math.round(claims.length * avgDenial / 100),
    projectedRevenueAtRisk: Math.round(revenueAtRisk),
    projectedDSO: Math.round(avgDSO),
    avgDenialProbability: Math.round(avgDenial),
    highRiskClaims: highRisk,
    criticalRiskClaims: criticalRisk,
    projectedMonthlyRevenue: Math.round(projectedRevenue),
    authBottleneckRisk,
  };
}

/** Generate 8-month trend + 3-month forecast series for charts */
export interface TrendPoint {
  month: string;
  ccr: number;
  denials: number;
  dso: number;
  revenue: number;
  forecast: boolean;
}

export function generateTrendSeries(baseCCR: number, baseDenials: number, baseDSO: number, baseRevenue: number): TrendPoint[] {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const now = 7; // index of "current" month (May)
  return months.map((month, i) => {
    const isForecast = i > now;
    const noise = (Math.sin(i * 2.3) * 0.5 + Math.cos(i * 1.7) * 0.5);
    const trend = isForecast ? (i - now) * 0.4 : 0; // slight improvement trend in forecast
    return {
      month,
      ccr: Math.min(98, Math.round(baseCCR + noise * 2 + trend * 0.5)),
      denials: Math.max(0, Math.round(baseDenials + noise * 2 - trend)),
      dso: Math.max(10, Math.round(baseDSO + noise * 1.5 - trend * 0.3)),
      revenue: Math.round(baseRevenue * (1 + noise * 0.05 + (isForecast ? 0.03 : 0))),
      forecast: isForecast,
    };
  });
}
