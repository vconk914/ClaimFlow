export interface PayerBehaviorProfile {
  id: string;
  name: string;
  modifierEnforcement: number;      // 0-1: how strictly they enforce modifier requirements
  authSensitivity: number;          // 0-1: likelihood of denying for missing prior auth
  documentationSensitivity: number; // 0-1: strictness on clinical documentation
  baseDenialRate: number;           // 0-1: historical baseline denial rate
  avgDaysToPayment: number;         // calendar days from clean submission to EFT
  avgReimbursementRate: number;     // 0-1: % of billed charges typically paid
  reimbursementSpeed: "fast" | "medium" | "slow" | "very-slow";
  riskLevel: "low" | "medium" | "high" | "critical";
  knownIssues: string[];
  predictiveInsights: string[];
}

export const PAYER_PROFILES: Record<string, PayerBehaviorProfile> = {
  Medicare: {
    id: "medicare",
    name: "Medicare",
    modifierEnforcement: 0.72,
    authSensitivity: 0.65,
    documentationSensitivity: 0.80,
    baseDenialRate: 0.14,
    avgDaysToPayment: 18,
    avgReimbursementRate: 0.72,
    reimbursementSpeed: "medium",
    riskLevel: "medium",
    knownIssues: [
      "PSA screening (84153) requires Z12.5 — not Z00.00",
      "Cystoscopy prior auth required for certain indications",
      "Modifier -25 strictly enforced for same-day E&M + procedure",
    ],
    predictiveInsights: [
      "Medicare denies ~14% of urology claims nationally.",
      "Claims missing modifier -25 on same-day E&M+procedure are denied 92% of the time.",
      "PSA screening (84153) is denied if ICD-10 is Z00.00 — change to Z12.5.",
      "Medicare typically pays within 18 days for clean electronic claims.",
    ],
  },
  BlueCross: {
    id: "bluecross",
    name: "BlueCross / BCBS",
    modifierEnforcement: 0.55,
    authSensitivity: 0.58,
    documentationSensitivity: 0.62,
    baseDenialRate: 0.10,
    avgDaysToPayment: 14,
    avgReimbursementRate: 0.79,
    reimbursementSpeed: "fast",
    riskLevel: "low",
    knownIssues: [
      "Modifier -59 required to unbundle overlapping procedures",
      "Auth required for outpatient cystoscopy in some regions",
    ],
    predictiveInsights: [
      "BlueCross has a strong first-pass acceptance rate (~90%).",
      "Modifier -59 is enforced for same-session overlapping codes.",
      "BCBS typically reimburses within 14 days — among the fastest commercial payers.",
      "Ensure bundling edits are resolved before submission to avoid CO-97 denials.",
    ],
  },
  Aetna: {
    id: "aetna",
    name: "Aetna",
    modifierEnforcement: 0.82,
    authSensitivity: 0.70,
    documentationSensitivity: 0.74,
    baseDenialRate: 0.17,
    avgDaysToPayment: 12,
    avgReimbursementRate: 0.75,
    reimbursementSpeed: "fast",
    riskLevel: "high",
    knownIssues: [
      "Strict modifier enforcement — -51, -59, -25 all closely reviewed",
      "Prior auth required for most surgical procedures over $500",
      "Frequently issues CO-4 (modifier required) on surgical claims",
    ],
    predictiveInsights: [
      "Aetna is one of the strictest modifier enforcers — always verify -51/-59/-25.",
      "Prior auth is required for CPTs 55700+. Missing auth = near-certain denial.",
      "Despite strict requirements, Aetna pays fast (avg 12 days) once approved.",
      "CO-4 (invalid modifier) is the #1 denial code from Aetna for urology claims.",
    ],
  },
  Cigna: {
    id: "cigna",
    name: "Cigna",
    modifierEnforcement: 0.75,
    authSensitivity: 0.76,
    documentationSensitivity: 0.88,
    baseDenialRate: 0.19,
    avgDaysToPayment: 16,
    avgReimbursementRate: 0.76,
    reimbursementSpeed: "medium",
    riskLevel: "high",
    knownIssues: [
      "Highest documentation sensitivity of major commercial payers",
      "CO-50 frequently issued for medical necessity gaps",
      "Requires LOD (Letter of Determination) for PSA after 72",
    ],
    predictiveInsights: [
      "Cigna has the strictest documentation requirements — attach clinical notes proactively.",
      "Medical necessity denials (CO-50) represent 38% of Cigna denials in this practice.",
      "LOD required for PSA screening in patients over age 72 under Cigna plans.",
      "Cigna's appeal window is 120 days — act quickly on denials.",
    ],
  },
  UnitedHealth: {
    id: "unitedhealth",
    name: "UnitedHealth / UHC",
    modifierEnforcement: 0.78,
    authSensitivity: 0.82,
    documentationSensitivity: 0.76,
    baseDenialRate: 0.18,
    avgDaysToPayment: 15,
    avgReimbursementRate: 0.77,
    reimbursementSpeed: "medium",
    riskLevel: "high",
    knownIssues: [
      "Very high prior auth threshold — nearly all procedures over $400 require auth",
      "Bundling edits (NCCI) strictly applied",
      "Network adequacy denials increasing in some regions",
    ],
    predictiveInsights: [
      "UHC requires prior auth on ~80% of procedures billed by this practice.",
      "NCCI bundling edits are automatically applied — always check before submission.",
      "UHC's denial rate has trended up 3.2% this quarter across urology claims.",
      "Authorization portal verification is the single best way to prevent UHC denials.",
    ],
  },
  Medicaid: {
    id: "medicaid",
    name: "Medicaid",
    modifierEnforcement: 0.60,
    authSensitivity: 0.88,
    documentationSensitivity: 0.85,
    baseDenialRate: 0.26,
    avgDaysToPayment: 28,
    avgReimbursementRate: 0.58,
    reimbursementSpeed: "very-slow",
    riskLevel: "critical",
    knownIssues: [
      "Highest denial rate of all payers — 26% baseline",
      "Very low reimbursement rates (avg 58% of billed)",
      "Lengthy adjudication — avg 28 days",
      "Income/eligibility verification required before each visit",
    ],
    predictiveInsights: [
      "Medicaid denies 26% of claims — ensure eligibility is verified on day of service.",
      "Reimbursement is capped at 58% of billed — factor into revenue projections.",
      "Expect 28+ days to payment — highest cash flow risk of any payer.",
      "Re-verify eligibility within 24 hrs of service to prevent retroactive denials.",
    ],
  },
  Humana: {
    id: "humana",
    name: "Humana",
    modifierEnforcement: 0.63,
    authSensitivity: 0.67,
    documentationSensitivity: 0.68,
    baseDenialRate: 0.12,
    avgDaysToPayment: 13,
    avgReimbursementRate: 0.78,
    reimbursementSpeed: "fast",
    riskLevel: "medium",
    knownIssues: [
      "Strong performer for Medicare Advantage plans",
      "Auth required for outpatient surgery",
      "Modifier -25 must be documented with office note",
    ],
    predictiveInsights: [
      "Humana is a relatively clean-paying payer with only a 12% denial rate.",
      "Medicare Advantage plans under Humana follow commercial (not Medicare) rules.",
      "Humana pays within 13 days for clean claims — good cash flow profile.",
      "Always include office notes when billing -25 modifier to prevent downcoding.",
    ],
  },
  Other: {
    id: "other",
    name: "Other / Unknown",
    modifierEnforcement: 0.55,
    authSensitivity: 0.55,
    documentationSensitivity: 0.55,
    baseDenialRate: 0.15,
    avgDaysToPayment: 20,
    avgReimbursementRate: 0.73,
    reimbursementSpeed: "medium",
    riskLevel: "medium",
    knownIssues: ["Payer-specific rules unknown — apply general best practices"],
    predictiveInsights: [
      "Payer not in profile database — using industry averages.",
      "Verify modifier requirements and auth thresholds directly with this payer.",
      "Industry average denial rate for commercial payers: ~15%.",
    ],
  },
};

export function getPayerProfile(payerName: string): PayerBehaviorProfile {
  const exact = PAYER_PROFILES[payerName];
  if (exact) return exact;
  // fuzzy match
  const key = Object.keys(PAYER_PROFILES).find(k =>
    payerName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(payerName.toLowerCase())
  );
  return key ? PAYER_PROFILES[key] : PAYER_PROFILES.Other;
}
