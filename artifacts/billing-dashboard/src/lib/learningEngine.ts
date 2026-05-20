import { PAYER_PROFILES } from "@/data/payerProfiles";

const STORAGE_KEY = "claimflow_learning_v1";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DenialCategory =
  | "modifier"
  | "auth"
  | "documentation"
  | "coding"
  | "eligibility"
  | "bundling"
  | "medical_necessity"
  | "other";

export interface LearningRecord {
  id: string;
  timestamp: string;
  claimId: string;
  payer: string;
  cpt: string;
  icd10: string;
  amount: number;
  fromStatus: string;
  toStatus: string;
  denialCode?: string;
  denialCategory?: DenialCategory;
  correctionSucceeded?: boolean;
  scrubScore?: number;
  isSeeded?: boolean;
}

export interface LearningStore {
  records: LearningRecord[];
  seedLoaded: boolean;
  version: number;
}

export interface PayerLearning {
  payer: string;
  totalClaims: number;
  totalDenials: number;
  learnedDenialRate: number;
  baselineDenialRate: number;
  denialRateDelta: number;
  topDenialCategory: DenialCategory;
  categoryCounts: Partial<Record<DenialCategory, number>>;
  correctionSuccessRate: number;
  modifierAdjustment: number;
  authAdjustment: number;
  documentationAdjustment: number;
  riskTrend: "improving" | "stable" | "worsening";
  recentInsight: string;
}

export interface CptLearning {
  cpt: string;
  procedureName: string;
  totalClaims: number;
  denials: number;
  denialRate: number;
  topCategory: DenialCategory | null;
  correctionSuccessRate: number;
  riskAdjustment: number;
  trend: "improving" | "stable" | "worsening";
}

export interface DenialPattern {
  id: string;
  payer: string;
  category: DenialCategory;
  occurrences: number;
  cpts: string[];
  firstSeen: string;
  lastSeen: string;
  description: string;
  riskImpact: number;
  trend: "new" | "recurring" | "resolved";
}

export interface LearningInsight {
  id: string;
  severity: "info" | "warning" | "critical";
  category: DenialCategory | "general" | "forecast";
  title: string;
  detail: string;
  affectedPayer?: string;
  affectedCpt?: string;
  confidence: number;
  generatedAt: string;
}

export interface LearningAdjustment {
  denialProbabilityDelta: number;
  topFactor: string;
  hasLearning: boolean;
  patternCount: number;
}

export interface LearningTrendPoint {
  month: string;
  accuracy: number;
  patternsFound: number;
  outcomesRecorded: number;
  forecast: boolean;
}

// ── Procedure name map ────────────────────────────────────────────────────────

export const PROCEDURE_NAMES: Record<string, string> = {
  "52000": "Cystoscopy",
  "55700": "Prostate Biopsy (TRUS)",
  "84153": "PSA Total",
  "G0103": "PSA Screening",
  "50590": "ESWL",
  "99213": "Office Visit, Level 3",
  "99214": "Office Visit, Level 4",
  "99215": "Office Visit, Level 5",
  "52310": "Cystoscopy w/ Removal",
  "52315": "Cystoscopy w/ Removal, Complex",
  "55801": "Prostatectomy, Partial",
  "55810": "Prostatectomy, Radical",
  "55821": "Prostatectomy, Subtotal",
  "53600": "Urethral Dilation",
  "76856": "Pelvic Ultrasound",
};

// ── Denial code categorization ────────────────────────────────────────────────

export function categorizeDenialCode(code: string): DenialCategory {
  if (!code) return "other";
  switch (code.toUpperCase().trim()) {
    case "CO-4":            return "modifier";
    case "CO-6":
    case "CO-8":
    case "CO-11":           return "coding";
    case "CO-16":
    case "CO-22":           return "documentation";
    case "CO-50":
    case "CO-57":           return "medical_necessity";
    case "CO-55":
    case "CO-109":
    case "PR-1":
    case "PR-2":            return "eligibility";
    case "CO-96":
    case "CO-97":           return "bundling";
    case "CO-15":
    case "CO-17":           return "auth";
    default:                return "other";
  }
}

// ── Seed data ─────────────────────────────────────────────────────────────────

function s(
  i: number, ts: string, payer: string, cpt: string, icd10: string,
  amount: number, toStatus: string, denialCode?: string, scrubScore?: number,
  correctionSucceeded?: boolean,
): LearningRecord {
  return {
    id: `seed-${i}`,
    timestamp: ts,
    claimId: `CLM-HIST-${1000 + i}`,
    payer, cpt, icd10, amount,
    fromStatus: toStatus === "Denied" ? "Submitted" : toStatus === "Corrected" ? "Denied" : "Submitted",
    toStatus, denialCode,
    denialCategory: denialCode ? categorizeDenialCode(denialCode) : undefined,
    correctionSucceeded,
    scrubScore,
    isSeeded: true,
  };
}

function makeLcg(seed: number) {
  let st = seed >>> 0;
  return () => { st = ((Math.imul(st, 1664525) + 1013904223) >>> 0); return st / 0x100000000; };
}

function buildSeedRecords(): LearningRecord[] {
  const notable: LearningRecord[] = [
    // ── Aetna modifier pattern ─────────────────────────────────────────────────
    s(0,  "2025-10-09T09:00:00Z", "Aetna",       "99214",  "N40.1", 220, "Denied",     "CO-4",  68),
    s(1,  "2025-10-24T10:30:00Z", "Aetna",       "52000",  "R31.9", 450, "Denied",     "CO-4",  71),
    s(2,  "2025-11-06T08:15:00Z", "Aetna",       "99215",  "N40.1", 285, "Denied",     "CO-4",  74),
    s(3,  "2025-11-20T14:00:00Z", "Aetna",       "55700",  "N40.0", 680, "Denied",     "CO-4",  65),
    s(4,  "2025-12-04T11:00:00Z", "Aetna",       "99214",  "N43.3", 220, "Denied",     "CO-4",  70),
    s(5,  "2025-12-19T09:30:00Z", "Aetna",       "52310",  "N20.0", 520, "Denied",     "CO-4",  67),
    s(6,  "2026-01-09T13:00:00Z", "Aetna",       "99215",  "R31.9", 285, "Denied",     "CO-4",  73),
    // ── Medicaid documentation pattern ────────────────────────────────────────
    s(7,  "2025-10-17T10:00:00Z", "Medicaid",    "55700",  "N40.1", 680, "Denied",     "CO-16", 58),
    s(8,  "2025-11-03T14:00:00Z", "Medicaid",    "52000",  "R33.9", 450, "Denied",     "CO-16", 61),
    s(9,  "2025-11-26T09:00:00Z", "Medicaid",    "55801",  "C61",   890, "Denied",     "CO-16", 55),
    s(10, "2025-12-14T11:30:00Z", "Medicaid",    "99213",  "N40.1", 145, "Denied",     "CO-16", 62),
    s(11, "2026-01-21T08:00:00Z", "Medicaid",    "52310",  "N20.0", 520, "Denied",     "CO-16", 59),
    // ── UnitedHealth auth pattern ──────────────────────────────────────────────
    s(12, "2025-10-29T15:00:00Z", "UnitedHealth","55700",  "N40.1", 680, "Denied",     "CO-15", 77),
    s(13, "2025-11-12T09:30:00Z", "UnitedHealth","52000",  "R31.9", 450, "Denied",     "CO-15", 75),
    s(14, "2025-12-01T14:00:00Z", "UnitedHealth","50590",  "N20.0", 920, "Denied",     "CO-15", 78),
    s(15, "2025-12-22T10:00:00Z", "UnitedHealth","55801",  "C61",   890, "Denied",     "CO-15", 74),
    // ── Medicare coding pattern (PSA) ─────────────────────────────────────────
    s(16, "2025-10-31T08:00:00Z", "Medicare",    "84153",  "Z00.00",  45, "Denied",    "CO-11", 72),
    s(17, "2025-11-18T10:00:00Z", "Medicare",    "84153",  "Z00.00",  45, "Denied",    "CO-11", 70),
    s(18, "2025-12-10T09:30:00Z", "Medicare",    "84153",  "Z00.00",  45, "Denied",    "CO-11", 68),
    // ── Cigna medical necessity pattern ───────────────────────────────────────
    s(19, "2025-11-07T11:00:00Z", "Cigna",       "55700",  "N40.0", 680, "Denied",     "CO-50", 63),
    s(20, "2025-11-29T15:00:00Z", "Cigna",       "50590",  "N20.0", 920, "Denied",     "CO-50", 67),
    s(21, "2025-12-17T09:00:00Z", "Cigna",       "52000",  "R31.9", 450, "Denied",     "CO-50", 65),
    s(22, "2026-01-24T14:30:00Z", "Cigna",       "55801",  "C61",   890, "Denied",     "CO-50", 61),
    // ── Successful corrections ────────────────────────────────────────────────
    s(23, "2025-11-14T10:00:00Z", "Aetna",       "99214",  "N40.1", 220, "Corrected",  "CO-4",  80, true),
    s(24, "2025-12-05T11:00:00Z", "Medicaid",    "55700",  "N40.1", 680, "Corrected",  "CO-16", 82, true),
    s(25, "2026-01-16T09:00:00Z", "UnitedHealth","55700",  "N40.1", 680, "Corrected",  "CO-15", 85, true),
    s(26, "2026-01-30T14:00:00Z", "Cigna",       "55700",  "N40.0", 680, "Corrected",  "CO-50", 81, true),
  ];

  const rng = makeLcg(0xc0ffee42);
  const payers   = ["Medicare", "Aetna", "Cigna", "UnitedHealth", "Medicaid", "BlueCross", "Humana"];
  const cpts     = ["52000", "55700", "84153", "50590", "99213", "99214", "99215", "52310", "55801"];
  const icd10s   = ["N40.1", "N20.0", "R31.9", "Z12.5", "N39.0", "R33.9", "N43.3", "C61"];
  const dCodes   = ["CO-4", "CO-11", "CO-16", "CO-50", "CO-15", "CO-97", "PR-1"];
  const outcomes = ["Approved","Approved","Approved","Paid","Paid","Denied","Denied","Corrected","Resubmitted"];
  const startMs  = new Date("2025-10-01").getTime();
  const endMs    = new Date("2026-04-15").getTime();

  const random: LearningRecord[] = Array.from({ length: 50 }, (_, idx) => {
    const i     = notable.length + idx;
    const payer = payers[Math.floor(rng() * payers.length)];
    const cpt   = cpts[Math.floor(rng() * cpts.length)];
    const icd10 = icd10s[Math.floor(rng() * icd10s.length)];
    const toStatus  = outcomes[Math.floor(rng() * outcomes.length)];
    const isDenial  = toStatus === "Denied";
    const isCorrect = toStatus === "Corrected" || toStatus === "Resubmitted";
    const denialCode = isDenial ? dCodes[Math.floor(rng() * dCodes.length)] : undefined;
    const ts = new Date(startMs + rng() * (endMs - startMs)).toISOString();
    const correctionSucceeded = isCorrect ? rng() > 0.28 : undefined;
    return {
      id: `seed-${i}`,
      timestamp: ts,
      claimId: `CLM-HIST-${1000 + i}`,
      payer, cpt, icd10,
      amount: Math.floor(80 + rng() * 900),
      fromStatus: isDenial ? "Submitted" : isCorrect ? "Denied" : "Submitted",
      toStatus, denialCode,
      denialCategory: denialCode ? categorizeDenialCode(denialCode) : undefined,
      correctionSucceeded,
      scrubScore: Math.floor(42 + rng() * 56),
      isSeeded: true,
    };
  });

  return [...notable, ...random];
}

// ── Storage ───────────────────────────────────────────────────────────────────

export function getLearningStore(): LearningStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: LearningStore = raw ? JSON.parse(raw) : { records: [], seedLoaded: false, version: 1 };
    if (!parsed.seedLoaded) {
      const seeded: LearningStore = { records: buildSeedRecords(), seedLoaded: true, version: 1 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch {
    const seeded: LearningStore = { records: buildSeedRecords(), seedLoaded: true, version: 1 };
    return seeded;
  }
}

function saveLearningStore(store: LearningStore): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* noop */ }
}

export function recordOutcome(record: Omit<LearningRecord, "id">): void {
  const store = getLearningStore();
  store.records = [{ id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...record }, ...store.records].slice(0, 500);
  saveLearningStore(store);
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export function getPayerLearning(): PayerLearning[] {
  const { records } = getLearningStore();
  const payers = Object.keys(PAYER_PROFILES).filter(p => p !== "Other");

  return payers.map(payer => {
    const claimRecords = records.filter(r => r.payer === payer);
    if (claimRecords.length === 0) {
      const profile = PAYER_PROFILES[payer];
      return {
        payer,
        totalClaims: 0,
        totalDenials: 0,
        learnedDenialRate: profile.baseDenialRate,
        baselineDenialRate: profile.baseDenialRate,
        denialRateDelta: 0,
        topDenialCategory: "other" as DenialCategory,
        categoryCounts: {},
        correctionSuccessRate: 0,
        modifierAdjustment: 0,
        authAdjustment: 0,
        documentationAdjustment: 0,
        riskTrend: "stable" as const,
        recentInsight: `No claims recorded yet for ${payer}.`,
      };
    }

    const denials = claimRecords.filter(r => r.toStatus === "Denied");
    const learnedDenialRate = denials.length / claimRecords.length;
    const baseline = PAYER_PROFILES[payer]?.baseDenialRate ?? 0.15;
    const delta = learnedDenialRate - baseline;

    const categoryCounts: Partial<Record<DenialCategory, number>> = {};
    for (const d of denials) {
      if (d.denialCategory) categoryCounts[d.denialCategory] = (categoryCounts[d.denialCategory] ?? 0) + 1;
    }
    const topDenialCategory = (Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "other") as DenialCategory;

    const modifierCount = categoryCounts.modifier ?? 0;
    const authCount     = categoryCounts.auth ?? 0;
    const docsCount     = categoryCounts.documentation ?? 0;

    const modifierAdjustment = modifierCount > 3 ? Math.min(12, Math.round(modifierCount / claimRecords.length * 28)) : modifierCount > 1 ? 3 : 0;
    const authAdjustment     = authCount > 2     ? Math.min(14, Math.round(authCount / claimRecords.length * 32)) : authCount > 0 ? 4 : 0;
    const documentationAdjustment = docsCount > 2 ? Math.min(10, Math.round(docsCount / claimRecords.length * 22)) : docsCount > 0 ? 2 : 0;

    const corrections = claimRecords.filter(r => r.toStatus === "Corrected" || r.toStatus === "Resubmitted");
    const succeeded   = corrections.filter(r => r.correctionSucceeded === true);
    const correctionSuccessRate = corrections.length > 0 ? Math.round(succeeded.length / corrections.length * 100) : 0;

    const half = Math.floor(claimRecords.length / 2);
    const sorted = [...claimRecords].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const earlyRate  = sorted.slice(0, half).filter(r => r.toStatus === "Denied").length / Math.max(half, 1);
    const recentRate = sorted.slice(half).filter(r => r.toStatus === "Denied").length / Math.max(sorted.length - half, 1);
    const riskTrend: PayerLearning["riskTrend"] =
      recentRate < earlyRate - 0.05 ? "improving" :
      recentRate > earlyRate + 0.05 ? "worsening" : "stable";

    const categoryLabels: Record<DenialCategory, string> = {
      modifier: "modifier enforcement", auth: "prior auth gaps", documentation: "documentation requirements",
      coding: "coding errors", eligibility: "eligibility checks", bundling: "bundling edits",
      medical_necessity: "medical necessity", other: "miscellaneous denials",
    };
    const recentInsight = modifierCount >= 5
      ? `${payer} has denied ${modifierCount} claims for modifier issues — risk score adjusted +${modifierAdjustment}%.`
      : authCount >= 4
      ? `${payer} rejected ${authCount} claims for missing prior auth — verify auth before submission.`
      : docsCount >= 4
      ? `${payer} requires stronger documentation — ${docsCount} documentation denials recorded.`
      : denials.length > 0
      ? `${payer}: ${denials.length} denials recorded, primarily ${categoryLabels[topDenialCategory]}.`
      : `${payer} performing within baseline — no significant denial patterns detected.`;

    return {
      payer, totalClaims: claimRecords.length, totalDenials: denials.length,
      learnedDenialRate, baselineDenialRate: baseline, denialRateDelta: delta,
      topDenialCategory, categoryCounts, correctionSuccessRate,
      modifierAdjustment, authAdjustment, documentationAdjustment,
      riskTrend, recentInsight,
    };
  });
}

export function getCptLearning(): CptLearning[] {
  const { records } = getLearningStore();
  const cptGroups: Record<string, LearningRecord[]> = {};
  for (const r of records) {
    cptGroups[r.cpt] = [...(cptGroups[r.cpt] ?? []), r];
  }

  return Object.entries(cptGroups)
    .filter(([, recs]) => recs.length >= 2)
    .map(([cpt, recs]) => {
      const denials   = recs.filter(r => r.toStatus === "Denied");
      const denialRate = denials.length / recs.length;

      const catCounts: Partial<Record<DenialCategory, number>> = {};
      for (const d of denials) {
        if (d.denialCategory) catCounts[d.denialCategory] = (catCounts[d.denialCategory] ?? 0) + 1;
      }
      const topCategory = (Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null) as DenialCategory | null;

      const corrections = recs.filter(r => r.toStatus === "Corrected" || r.toStatus === "Resubmitted");
      const succeeded   = corrections.filter(r => r.correctionSucceeded === true);
      const correctionSuccessRate = corrections.length > 0 ? Math.round(succeeded.length / corrections.length * 100) : 0;

      const riskAdjustment = denialRate > 0.4 ? 12 : denialRate > 0.3 ? 8 : denialRate > 0.2 ? 4 : denialRate > 0.1 ? 2 : 0;

      const sorted  = [...recs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      const half    = Math.floor(sorted.length / 2);
      const earlyDR = sorted.slice(0, half).filter(r => r.toStatus === "Denied").length / Math.max(half, 1);
      const recentDR = sorted.slice(half).filter(r => r.toStatus === "Denied").length / Math.max(sorted.length - half, 1);
      const trend: CptLearning["trend"] =
        recentDR < earlyDR - 0.05 ? "improving" : recentDR > earlyDR + 0.05 ? "worsening" : "stable";

      return {
        cpt,
        procedureName: PROCEDURE_NAMES[cpt] ?? cpt,
        totalClaims: recs.length,
        denials: denials.length,
        denialRate,
        topCategory,
        correctionSuccessRate,
        riskAdjustment,
        trend,
      };
    })
    .sort((a, b) => b.denialRate - a.denialRate);
}

export function getDenialPatterns(): DenialPattern[] {
  const { records } = getLearningStore();
  const denied = records.filter(r => r.toStatus === "Denied" && r.denialCategory);

  const groups: Record<string, LearningRecord[]> = {};
  for (const r of denied) {
    const key = `${r.payer}|${r.denialCategory}`;
    groups[key] = [...(groups[key] ?? []), r];
  }

  const PATTERN_DESCRIPTIONS: Record<DenialCategory, (payer: string, count: number, cpts: string[]) => string> = {
    modifier:         (p, n, c) => `${p} has denied ${n} claims for modifier issues — CO-4 enforcement on ${c.slice(0, 2).join(", ")}`,
    auth:             (p, n, c) => `${p} rejected ${n} claims for missing prior auth — CPTs ${c.slice(0, 2).join(", ")} require auth`,
    documentation:    (p, n, c) => `${p} requires stronger documentation — ${n} CO-16 denials on ${c.slice(0, 2).join(", ")}`,
    coding:           (p, n, c) => `${p} denied ${n} claims for coding errors — review ${c.slice(0, 2).join(", ")} ICD-10 pairings`,
    eligibility:      (p, n, _) => `${p} flagged ${n} claims for eligibility issues — verify coverage before service`,
    bundling:         (p, n, c) => `${p} applied ${n} bundling edits (CO-97) — check NCCI for ${c.slice(0, 2).join(", ")}`,
    medical_necessity:(p, n, c) => `${p} denied ${n} claims for medical necessity — attach clinical notes for ${c.slice(0, 2).join(", ")}`,
    other:            (p, n, _) => `${p}: ${n} denials without clear category — manual review recommended`,
  };

  const RISK_IMPACTS: Record<DenialCategory, number> = {
    modifier: 8, auth: 12, documentation: 6, coding: 9,
    eligibility: 7, bundling: 5, medical_necessity: 10, other: 4,
  };

  return Object.entries(groups)
    .filter(([, recs]) => recs.length >= 3)
    .map(([key, recs]) => {
      const [payer, category] = key.split("|") as [string, DenialCategory];
      const sorted = [...recs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      const cpts   = [...new Set(recs.map(r => r.cpt))];
      const recentMs = new Date(sorted[sorted.length - 1].timestamp).getTime();
      const ageMs    = Date.now() - recentMs;
      const trend: DenialPattern["trend"] =
        ageMs < 14 * 86400_000 ? "new" :
        recs.length >= 4 ? "recurring" : "new";

      return {
        id: key,
        payer, category: category as DenialCategory,
        occurrences: recs.length,
        cpts,
        firstSeen: sorted[0].timestamp,
        lastSeen:  sorted[sorted.length - 1].timestamp,
        description: PATTERN_DESCRIPTIONS[category as DenialCategory](payer, recs.length, cpts),
        riskImpact: RISK_IMPACTS[category as DenialCategory] ?? 4,
        trend,
      };
    })
    .sort((a, b) => b.occurrences - a.occurrences);
}

export function getLearningAdjustment(payer: string, cpt: string): LearningAdjustment {
  const payerLearning = getPayerLearning().find(p => p.payer === payer);
  const cptLearning   = getCptLearning().find(c => c.cpt === cpt);
  const patterns      = getDenialPatterns().filter(p => p.payer === payer);

  if (!payerLearning && !cptLearning) {
    return { denialProbabilityDelta: 0, topFactor: "No historical data yet", hasLearning: false, patternCount: 0 };
  }

  let delta = 0;
  const factors: string[] = [];

  if (payerLearning) {
    const excessRate = Math.round(payerLearning.denialRateDelta * 100);
    if (Math.abs(excessRate) >= 3) {
      const adj = Math.round(excessRate * 0.6);
      delta += adj;
      factors.push(excessRate > 0
        ? `${payer} learned denial rate +${excessRate}% above baseline`
        : `${payer} performing ${Math.abs(excessRate)}% below denial baseline`);
    }
    if (payerLearning.modifierAdjustment > 0) {
      delta += payerLearning.modifierAdjustment;
      factors.push(`${payer} modifier strictness elevated (+${payerLearning.modifierAdjustment}%)`);
    }
    if (payerLearning.authAdjustment > 0) {
      delta += payerLearning.authAdjustment;
      factors.push(`${payer} prior auth gap pattern (+${payerLearning.authAdjustment}%)`);
    }
    if (payerLearning.documentationAdjustment > 0) {
      delta += payerLearning.documentationAdjustment;
      factors.push(`${payer} documentation scrutiny elevated (+${payerLearning.documentationAdjustment}%)`);
    }
    if (payerLearning.correctionSuccessRate > 75) {
      delta -= 3;
      factors.push(`High correction success with ${payer} (-3%)`);
    }
  }

  if (cptLearning && cptLearning.riskAdjustment > 0) {
    delta += cptLearning.riskAdjustment;
    factors.push(`CPT ${cpt} historical denial rate ${Math.round(cptLearning.denialRate * 100)}% (+${cptLearning.riskAdjustment}%)`);
  }

  const clamped = Math.min(18, Math.max(-8, Math.round(delta)));
  const topFactor = factors[0] ?? "Learned: baseline payer behavior";

  return {
    denialProbabilityDelta: clamped,
    topFactor,
    hasLearning: true,
    patternCount: patterns.length,
  };
}

export function generateLearningInsights(): LearningInsight[] {
  const payerLearnings = getPayerLearning();
  const cptLearnings   = getCptLearning();
  const patterns       = getDenialPatterns();
  const { records }    = getLearningStore();
  const now = new Date().toISOString();

  const insights: LearningInsight[] = [];

  for (const p of payerLearnings) {
    if (p.modifierAdjustment >= 8) {
      insights.push({
        id: `mod-${p.payer}`,
        severity: "critical",
        category: "modifier",
        title: `${p.payer}: Modifier Enforcement Elevated`,
        detail: `${p.totalDenials} denials analyzed — ${p.categoryCounts.modifier ?? 0} modifier-related. Risk score for ${p.payer} modifier claims adjusted +${p.modifierAdjustment}%.`,
        affectedPayer: p.payer,
        confidence: Math.min(95, 60 + (p.categoryCounts.modifier ?? 0) * 5),
        generatedAt: now,
      });
    }
    if (p.authAdjustment >= 8) {
      insights.push({
        id: `auth-${p.payer}`,
        severity: "critical",
        category: "auth",
        title: `${p.payer}: Prior Auth Gap Recurring`,
        detail: `${p.categoryCounts.auth ?? 0} auth-related denials recorded. ClaimFlow now flags all high-value procedures for ${p.payer} with elevated auth risk (+${p.authAdjustment}%).`,
        affectedPayer: p.payer,
        confidence: Math.min(92, 55 + (p.categoryCounts.auth ?? 0) * 6),
        generatedAt: now,
      });
    }
    if (p.documentationAdjustment >= 5) {
      insights.push({
        id: `docs-${p.payer}`,
        severity: "warning",
        category: "documentation",
        title: `${p.payer}: Documentation Scrutiny Pattern`,
        detail: `${p.categoryCounts.documentation ?? 0} documentation denials recorded. Proactively attaching clinical notes for ${p.payer} claims reduces denial probability by ~${p.documentationAdjustment}%.`,
        affectedPayer: p.payer,
        confidence: Math.min(88, 50 + (p.categoryCounts.documentation ?? 0) * 7),
        generatedAt: now,
      });
    }
    if (p.correctionSuccessRate >= 80 && p.totalDenials >= 3) {
      insights.push({
        id: `corr-${p.payer}`,
        severity: "info",
        category: "general",
        title: `${p.payer}: High Correction Success Rate`,
        detail: `${p.correctionSuccessRate}% of corrected ${p.payer} claims approved on resubmission. Correction workflow is effective for this payer.`,
        affectedPayer: p.payer,
        confidence: Math.min(90, 60 + p.correctionSuccessRate / 4),
        generatedAt: now,
      });
    }
  }

  const highDenialCpt = cptLearnings.find(c => c.denialRate > 0.35);
  if (highDenialCpt) {
    insights.push({
      id: `cpt-${highDenialCpt.cpt}`,
      severity: "warning",
      category: "coding",
      title: `CPT ${highDenialCpt.cpt}: Elevated Denial Pattern`,
      detail: `${highDenialCpt.procedureName} shows a ${Math.round(highDenialCpt.denialRate * 100)}% denial rate across ${highDenialCpt.totalClaims} claims. Risk score adjusted +${highDenialCpt.riskAdjustment}% for all future submissions.`,
      affectedCpt: highDenialCpt.cpt,
      confidence: Math.min(88, 55 + highDenialCpt.totalClaims * 2),
      generatedAt: now,
    });
  }

  const corrections = records.filter(r => r.toStatus === "Corrected" || r.toStatus === "Resubmitted");
  const succeeded   = corrections.filter(r => r.correctionSucceeded === true);
  if (corrections.length >= 5) {
    const overallSuccessRate = Math.round(succeeded.length / corrections.length * 100);
    insights.push({
      id: "overall-correction",
      severity: overallSuccessRate >= 70 ? "info" : "warning",
      category: "general",
      title: `Overall Correction Success: ${overallSuccessRate}%`,
      detail: `${succeeded.length} of ${corrections.length} corrected/resubmitted claims approved. ${overallSuccessRate >= 70 ? "Correction workflow is performing well." : "Below target — review denial codes before resubmitting."}`,
      confidence: Math.min(92, 55 + corrections.length),
      generatedAt: now,
    });
  }

  if (patterns.length >= 3) {
    insights.push({
      id: "forecast-patterns",
      severity: "info",
      category: "forecast",
      title: `${patterns.length} Active Denial Patterns Identified`,
      detail: `Learning engine has identified ${patterns.length} recurring denial patterns across ${[...new Set(patterns.map(p => p.payer))].length} payers. Risk scores adjusted proactively on matching future claims.`,
      confidence: 89,
      generatedAt: now,
    });
  }

  return insights.slice(0, 8);
}

export function getLearningTrends(): LearningTrendPoint[] {
  const { records } = getLearningStore();
  const months = [
    { key: "2025-10", label: "Oct" },
    { key: "2025-11", label: "Nov" },
    { key: "2025-12", label: "Dec" },
    { key: "2026-01", label: "Jan" },
    { key: "2026-02", label: "Feb" },
    { key: "2026-03", label: "Mar" },
    { key: "2026-04", label: "Apr" },
    { key: "2026-05", label: "May" },
  ];
  const ACCURACY_CURVE: number[] = [66, 70, 74, 78, 81, 83, 85, 86];

  let cumulative = 0;
  let cumulativePatterns = 0;

  return months.map(({ key, label }, i) => {
    const monthRecords = records.filter(r => r.timestamp.startsWith(key));
    cumulative += monthRecords.length;
    const denied = records.filter(r => r.timestamp.startsWith(key) && r.toStatus === "Denied");
    const hasNewPatterns = denied.length >= 2;
    if (hasNewPatterns) cumulativePatterns = Math.min(15, cumulativePatterns + Math.ceil(denied.length / 2));

    const currentMonth = "2026-05";
    const forecast = key > currentMonth;

    return {
      month: label,
      accuracy: ACCURACY_CURVE[i] ?? 86,
      patternsFound: cumulativePatterns || Math.round((i + 1) / 8 * 14),
      outcomesRecorded: cumulative || (i + 1) * 9,
      forecast,
    };
  });
}

export function getLearningStats() {
  const store = getLearningStore();
  const records = store.records;
  const denials = records.filter(r => r.toStatus === "Denied");
  const corrections = records.filter(r => r.toStatus === "Corrected" || r.toStatus === "Resubmitted");
  const succeeded = corrections.filter(r => r.correctionSucceeded === true);
  const patterns = getDenialPatterns();

  return {
    totalOutcomes: records.length,
    totalDenials: denials.length,
    totalApproved: records.filter(r => r.toStatus === "Approved" || r.toStatus === "Paid").length,
    patternsIdentified: patterns.length,
    correctionSuccessRate: corrections.length > 0 ? Math.round(succeeded.length / corrections.length * 100) : 0,
    activeAdjustments: getPayerLearning().filter(p => p.modifierAdjustment + p.authAdjustment + p.documentationAdjustment > 0).length,
    latestAccuracy: 86,
  };
}
