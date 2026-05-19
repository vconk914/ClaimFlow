// ─── Regional Intelligence Data ───────────────────────────────────────────────
// State-specific billing logic layers for ClaimFlow's national platform.
// All data is simulated for demo purposes.

export type StateId = "national" | "ny" | "fl" | "ca" | "tx";

export interface RegionalPayer {
  name: string;
  type: "commercial" | "medicaid" | "medicare" | "workers-comp" | "no-fault" | "managed-care";
  marketShare: number;
  denialRate: number;
  avgDaysToPayment: number;
  notes: string;
}

export interface RegionalDenialPattern {
  category: string;
  percentage: number;
  description: string;
  stateSpecific: boolean;
}

export interface WorkersCompConfig {
  program: string;
  administrator: string;
  feeSchedule: string;
  notes: string;
  commonDenials: string[];
  billingRules: string[];
}

export interface MedicaidConfig {
  program: string;
  administrator: string;
  managedCare: boolean;
  notes: string;
  priorAuthThreshold: string;
  commonDenials: string[];
  billingRules: string[];
}

export interface NoFaultConfig {
  applicable: boolean;
  program?: string;
  statute?: string;
  billingDeadlineDays?: number;
  notes?: string;
  commonDenials?: string[];
  keyRules?: string[];
}

export interface WorkflowRule {
  id: string;
  category: "prior-auth" | "timely-filing" | "no-fault" | "workers-comp" | "medicaid" | "billing" | "audit";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export interface RegionalConfig {
  id: StateId;
  label: string;
  abbreviation: string;
  description: string;
  payers: RegionalPayer[];
  denialPatterns: RegionalDenialPattern[];
  workersComp: WorkersCompConfig;
  medicaid: MedicaidConfig;
  noFault: NoFaultConfig;
  workflowRules: WorkflowRule[];
}

// ─── National / General ───────────────────────────────────────────────────────

const NATIONAL: RegionalConfig = {
  id: "national",
  label: "General / National",
  abbreviation: "US",
  description: "Standard CMS fee schedules and national payer guidelines apply. No state-specific billing overlays are active.",
  payers: [
    { name: "BlueCross BlueShield", type: "commercial", marketShare: 24, denialRate: 12, avgDaysToPayment: 32, notes: "Largest national network. Verify local BCBS plan affiliate." },
    { name: "Medicare (CMS)", type: "medicare", marketShare: 18, denialRate: 8, avgDaysToPayment: 28, notes: "CMS MAC jurisdiction determines fee schedule. Use NCDs and LCDs." },
    { name: "Medicaid (State-Managed)", type: "medicaid", marketShare: 16, denialRate: 18, avgDaysToPayment: 45, notes: "Select a state profile for state-specific Medicaid payer and rules." },
    { name: "UnitedHealthcare", type: "commercial", marketShare: 15, denialRate: 14, avgDaysToPayment: 30, notes: "Optum-owned. Prior auth requirements are higher than average." },
    { name: "Aetna / CVS Health", type: "commercial", marketShare: 12, denialRate: 11, avgDaysToPayment: 27, notes: "CVS Health integration affects formulary and pharmacy benefit rules." },
    { name: "Cigna", type: "commercial", marketShare: 9, denialRate: 13, avgDaysToPayment: 33, notes: "Evernorth platform. Behavioral health is often separately administered." },
    { name: "Humana", type: "commercial", marketShare: 6, denialRate: 10, avgDaysToPayment: 29, notes: "Strong Medicare Advantage presence. Verify MA plan vs. traditional Medicare." },
  ],
  denialPatterns: [
    { category: "Missing Modifier", percentage: 28, description: "Modifier required but not included — most common national denial", stateSpecific: false },
    { category: "Mismatched ICD-10", percentage: 24, description: "Procedure and diagnosis codes do not support medical necessity", stateSpecific: false },
    { category: "Missing Prior Auth", percentage: 19, description: "Service required prior authorization per payer policy", stateSpecific: false },
    { category: "Non-covered Service", percentage: 16, description: "Service not covered under the patient's plan benefits", stateSpecific: false },
    { category: "Timely Filing", percentage: 13, description: "Claim submitted after the payer's filing deadline", stateSpecific: false },
  ],
  workersComp: {
    program: "State-Specific (not loaded)",
    administrator: "Select a state profile to load workers' comp rules",
    feeSchedule: "Varies by state jurisdiction",
    notes: "Workers' comp rules, fee schedules, and utilization review requirements vary significantly by state. Select a state profile to load the applicable program.",
    commonDenials: ["Select a state to load denial patterns"],
    billingRules: ["Select a state to load billing rules"],
  },
  medicaid: {
    program: "Medicaid (State-Administered)",
    administrator: "CMS / State Medicaid Agency",
    managedCare: true,
    notes: "Medicaid is administered jointly by the federal government and individual states. Select a state profile for plan-specific guidelines, managed care organization details, and denial patterns.",
    priorAuthThreshold: "Varies by state and service type",
    commonDenials: ["Select a state to load Medicaid denial patterns"],
    billingRules: ["Select a state to load Medicaid billing rules"],
  },
  noFault: {
    applicable: false,
    notes: "No-fault / PIP insurance rules vary by state. Select a state profile to determine whether no-fault auto billing rules apply in your jurisdiction.",
  },
  workflowRules: [
    { id: "nat-1", category: "timely-filing", title: "CMS Timely Filing — 12 Months", description: "Medicare claims must be filed within 12 months of the date of service. Missing this deadline results in automatic denial with no appeal path.", impact: "high" },
    { id: "nat-2", category: "prior-auth", title: "Prior Auth for High-Cost Imaging", description: "Most commercial payers require prior authorization for MRI, CT, PET, and nuclear medicine. Confirm per payer and plan.", impact: "high" },
    { id: "nat-3", category: "billing", title: "Modifier -25 for Same-Day E&M + Procedure", description: "When a separately identifiable E&M service is performed on the same day as a procedure, Modifier -25 must be appended to the E&M code.", impact: "high" },
    { id: "nat-4", category: "audit", title: "OIG Work Plan Monitoring", description: "Annually review the OIG Work Plan to identify high-risk billing areas subject to federal audit. Implement internal controls accordingly.", impact: "medium" },
    { id: "nat-5", category: "billing", title: "HIPAA 837P Electronic Claims Format", description: "All electronic claims must comply with HIPAA 837P transaction standards. Verify NPI, taxonomy code, and rendering provider fields.", impact: "medium" },
  ],
};

// ─── New York ─────────────────────────────────────────────────────────────────

const NEW_YORK: RegionalConfig = {
  id: "ny",
  label: "New York",
  abbreviation: "NY",
  description: "NY requires compliance with eMedNY Medicaid, NYSIF workers' comp, and NY No-Fault (PIP) billing under Insurance Law §5101. Strict 30-day no-fault billing windows apply.",
  payers: [
    { name: "Empire BlueCross BlueShield", type: "commercial", marketShare: 22, denialRate: 13, avgDaysToPayment: 30, notes: "Largest commercial insurer in NY. Anthem-owned. Prior auth required for most imaging." },
    { name: "EmblemHealth / GHI", type: "commercial", marketShare: 14, denialRate: 15, avgDaysToPayment: 35, notes: "Strong NYC presence. GHI and HIP plans have distinct formularies and auth rules." },
    { name: "Healthfirst", type: "managed-care", marketShare: 12, denialRate: 20, avgDaysToPayment: 42, notes: "Medicaid managed care dominant in NYC. Requires eMedNY enrollment." },
    { name: "MetroPlus Health Plan", type: "managed-care", marketShare: 8, denialRate: 22, avgDaysToPayment: 48, notes: "NYC Health + Hospitals affiliated. Medicaid managed care. High auth requirements." },
    { name: "Fidelis Care (Centene)", type: "medicaid", marketShare: 10, denialRate: 18, avgDaysToPayment: 44, notes: "Statewide Medicaid managed care. Centene subsidiary. Child Health Plus and Medicaid." },
    { name: "MVP Health Care", type: "commercial", marketShare: 7, denialRate: 11, avgDaysToPayment: 28, notes: "Upstate NY focus. Strong Medicare Advantage presence in Capital Region and Western NY." },
    { name: "NY State Insurance Fund (NYSIF)", type: "workers-comp", marketShare: 9, denialRate: 16, avgDaysToPayment: 38, notes: "Largest workers' comp carrier in NY. All bills must follow NY WC Medical Fee Schedule." },
    { name: "Medicare (Empire MAC)", type: "medicare", marketShare: 18, denialRate: 8, avgDaysToPayment: 26, notes: "NY falls under Novitas Solutions MAC (JH). LCD and NCD policies apply." },
  ],
  denialPatterns: [
    { category: "No-Fault 30-Day Rule", percentage: 31, description: "NY PIP claims not submitted within 30 days of service are auto-denied under Ins. Law §5106", stateSpecific: true },
    { category: "Missing Modifier", percentage: 22, description: "Modifier omission — particularly critical for NY workers' comp and no-fault claims", stateSpecific: false },
    { category: "eMedNY Enrollment Lapse", percentage: 18, description: "Provider not enrolled or not re-credentialed with eMedNY Medicaid portal", stateSpecific: true },
    { category: "WC Fee Schedule Violation", percentage: 14, description: "Billed amount exceeds NY Workers' Comp Medical Fee Schedule maximums", stateSpecific: true },
    { category: "OMIG Audit Flag", percentage: 9, description: "NYS OMIG audit trigger — upcoding, unbundling, or excessive utilization patterns", stateSpecific: true },
    { category: "Mismatched ICD-10", percentage: 6, description: "ICD-10 specificity not meeting NY Medicaid managed care requirements", stateSpecific: false },
  ],
  workersComp: {
    program: "NY Workers' Compensation Program",
    administrator: "NY Workers' Compensation Board (WCB)",
    feeSchedule: "NY WC Medical Fee Schedule — published by WCB, updated periodically",
    notes: "All WC medical bills in NY must follow the Medical Fee Schedule. Bills exceeding fee schedule maximums are automatically reduced. Utilization review is mandatory for non-emergency treatment. All providers must be credentialed with the WCB.",
    commonDenials: [
      "Bill exceeds NY WC Medical Fee Schedule maximum allowable",
      "Treatment not authorized by WC insurer via utilization review",
      "Missing WC case number or employer information on CMS-1500",
      "Provider not credentialed with the NY Workers' Compensation Board",
      "Treatment provided beyond maximum medical improvement (MMI) without documentation",
    ],
    billingRules: [
      "Use WCB Medical Fee Schedule for all procedure codes — not standard CPT fees",
      "Prior authorization required for non-emergency treatment via utilization review",
      "Submit bills within 45 days of service to avoid timely filing denial",
      "Use C-4 form (Doctor's Report of MMI/Permanent Impairment) when applicable",
      "Electronic billing required via WCB's online portal for most submissions",
    ],
  },
  medicaid: {
    program: "New York Medicaid (eMedNY)",
    administrator: "NYS Department of Health (DOH) / eMedNY Portal",
    managedCare: true,
    notes: "NY Medicaid is predominantly managed care in NYC and surrounding counties. Providers must be enrolled in eMedNY and re-credentialed every 3 years. OMIG (Office of Medicaid Inspector General) conducts regular audits of high-volume billing patterns.",
    priorAuthThreshold: "Required for inpatient admits, surgeries, high-cost imaging, DME over $500, and most specialty referrals",
    commonDenials: [
      "Provider not enrolled or re-credentialed in eMedNY",
      "Service requires prior authorization not obtained",
      "Managed care plan referral not obtained before specialist visit",
      "Exceeds benefit limits (e.g., physical therapy visit limits)",
      "OMIG audit flag — upcoding or duplicate billing detected",
    ],
    billingRules: [
      "All NY Medicaid billing must go through eMedNY portal (www.emedny.org)",
      "Managed care enrollees require MCO authorization — not eMedNY FFS auth",
      "Timely filing limit: 90 days from date of service for FFS Medicaid",
      "OMIG requires 6-year record retention for all Medicaid claims",
      "Child Health Plus and Essential Plan follow Medicaid managed care rules",
    ],
  },
  noFault: {
    applicable: true,
    program: "New York No-Fault / PIP Insurance",
    statute: "NY Insurance Law §5101–5108 (Comprehensive Motor Vehicle Insurance Reparations Act)",
    billingDeadlineDays: 30,
    notes: "NY is a strict no-fault state. All motor vehicle accident medical bills must be submitted to the no-fault (PIP) insurer within 30 days of service. Failure to meet this deadline results in automatic, non-waivable denial. Insurers have 30 days to pay or deny. Assignment of benefits is common.",
    commonDenials: [
      "Bill submitted more than 30 days after date of service (auto-denied, no waiver)",
      "Insurer disputes medical necessity under NY No-Fault regulations",
      "Failure to appear for independent medical examination (IME) scheduled by insurer",
      "Treatment deemed not causally related to motor vehicle accident",
      "Exhausted PIP policy limits ($50,000 minimum — higher if purchased)",
    ],
    keyRules: [
      "Bills must be submitted within 30 days of service — no exceptions",
      "PIP minimum benefit: $50,000 per person per accident (NY Ins. Law §5102)",
      "Insurer must pay or deny within 30 days of receiving a complete bill",
      "Assignment of benefits allows providers to bill insurer directly",
      "Denial can be appealed via arbitration (NY No-Fault Arbitration Program)",
      "Independent Medical Exams (IMEs) are frequently used to dispute medical necessity",
    ],
  },
  workflowRules: [
    { id: "ny-1", category: "no-fault", title: "30-Day No-Fault Billing Deadline", description: "NY Insurance Law §5106 requires all no-fault (PIP) bills to be submitted within 30 days of service. This deadline is absolute — no exceptions or waivers are available.", impact: "high" },
    { id: "ny-2", category: "medicaid", title: "eMedNY Re-Credentialing (3-Year Cycle)", description: "NY Medicaid requires provider re-enrollment and re-credentialing in eMedNY every 3 years. Claims submitted with a lapsed credential will be denied retroactively.", impact: "high" },
    { id: "ny-3", category: "workers-comp", title: "WC Fee Schedule Compliance", description: "All Workers' Comp bills must use the NY WC Medical Fee Schedule. Billing above fee schedule maximums results in automatic reduction to the fee schedule amount.", impact: "high" },
    { id: "ny-4", category: "audit", title: "OMIG Medicaid Audit Risk", description: "The NYS Office of Medicaid Inspector General (OMIG) actively audits providers billing $500k+ per year in Medicaid. High-volume specialties (PT, home health, DME) are priority targets.", impact: "high" },
    { id: "ny-5", category: "no-fault", title: "IME Compliance — No-Fault", description: "When a no-fault insurer schedules an Independent Medical Examination (IME), failure to appear results in suspension of no-fault benefits. Ensure patients are notified of IME requirements.", impact: "medium" },
    { id: "ny-6", category: "timely-filing", title: "Medicaid Timely Filing — 90 Days", description: "NY Medicaid FFS claims must be submitted within 90 days of service. Managed care organizations may have shorter windows — verify per MCO contract.", impact: "medium" },
  ],
};

// ─── Florida ──────────────────────────────────────────────────────────────────

const FLORIDA: RegionalConfig = {
  id: "fl",
  label: "Florida",
  abbreviation: "FL",
  description: "FL has a no-fault PIP system with a 14-day treatment rule, active Medicaid managed care (Staywell, Sunshine Health), and a DFS-supervised workers' comp fee schedule.",
  payers: [
    { name: "Florida Blue (BCBS)", type: "commercial", marketShare: 26, denialRate: 12, avgDaysToPayment: 29, notes: "Largest commercial payer in FL. GuideWell subsidiary. Strong Medicare Advantage presence." },
    { name: "Humana Florida", type: "commercial", marketShare: 16, denialRate: 11, avgDaysToPayment: 27, notes: "Very strong FL Medicare Advantage market share. CenterWell primary care partnership." },
    { name: "Molina Healthcare of Florida", type: "medicaid", marketShare: 11, denialRate: 19, avgDaysToPayment: 43, notes: "FL Medicaid managed care. Statewide coverage under FL SMMC (Statewide Medicaid Managed Care)." },
    { name: "Sunshine Health (Centene)", type: "medicaid", marketShare: 10, denialRate: 17, avgDaysToPayment: 40, notes: "FL SMMC managed care plan. Strong in South FL. WellCare of Florida also Centene-owned." },
    { name: "Simply Healthcare Plans", type: "managed-care", marketShare: 8, denialRate: 21, avgDaysToPayment: 46, notes: "FL Medicaid and Medicare Advantage. Higher denial rate for behavioral health and DME." },
    { name: "Aetna Better Health of FL", type: "medicaid", marketShare: 7, denialRate: 18, avgDaysToPayment: 42, notes: "FL Medicaid managed care. Particularly active in Broward and Miami-Dade counties." },
    { name: "FL Department of Financial Services (DFS)", type: "workers-comp", marketShare: 6, denialRate: 15, avgDaysToPayment: 36, notes: "FL WC overseen by DFS. Reimbursement uses FL WC fee schedule. E/M codes have specific FL WC rules." },
    { name: "Medicare (First Coast MAC)", type: "medicare", marketShare: 16, denialRate: 9, avgDaysToPayment: 27, notes: "FL falls under First Coast Service Options MAC (J9). Significant Medicare Advantage penetration." },
  ],
  denialPatterns: [
    { category: "PIP 14-Day Rule Violation", percentage: 29, description: "FL no-fault: initial treatment must occur within 14 days of accident for PIP coverage to apply", stateSpecific: true },
    { category: "Missing Modifier", percentage: 23, description: "Modifier omission — especially on same-day services and PIP claims", stateSpecific: false },
    { category: "SMMC Prior Auth Missing", percentage: 20, description: "FL Statewide Medicaid Managed Care plan authorization not obtained before service", stateSpecific: true },
    { category: "Assignment of Benefits (AOB) Issue", percentage: 14, description: "Improper AOB documentation — FL reformed AOB rules to limit assignment in insurance claims", stateSpecific: true },
    { category: "WC Fee Schedule Overage", percentage: 9, description: "Billed amount exceeds FL Workers' Comp fee schedule — reduced automatically", stateSpecific: true },
    { category: "Mismatched ICD-10", percentage: 5, description: "Diagnosis and procedure code mismatch affecting medical necessity determination", stateSpecific: false },
  ],
  workersComp: {
    program: "Florida Workers' Compensation Program",
    administrator: "FL Department of Financial Services (DFS), Division of Workers' Comp",
    feeSchedule: "Florida Workers' Compensation Reimbursement Manual — E/M codes follow FL-specific rules",
    notes: "FL Workers' Comp is employer-required for most businesses with 4+ employees (construction: 1+ employees). Reimbursement uses DFS fee schedule. E&M codes (99201–99215) are bundled differently under FL WC rules. Utilization review is required for non-emergency care.",
    commonDenials: [
      "Bill exceeds FL WC Reimbursement Manual maximum allowable",
      "Unauthorized treatment — provider did not obtain WC insurer authorization",
      "Injured worker not confirmed as eligible employee on date of injury",
      "Claim filed after 30-day reporting deadline from employer",
      "Treatment not causally related to the work-related injury",
    ],
    billingRules: [
      "Use FL WC Reimbursement Manual — not standard CPT fee schedules",
      "Authorization required for all non-emergency services beyond the first visit",
      "Submit bills within 45 days of service to FL WC insurer",
      "E&M codes have FL-specific bundling rules — verify FL WC E&M guidelines",
      "Use DFS-approved claim forms (HCFA-1500 for professional services)",
    ],
  },
  medicaid: {
    program: "Florida Medicaid — Statewide Medicaid Managed Care (SMMC)",
    administrator: "FL Agency for Health Care Administration (AHCA)",
    managedCare: true,
    notes: "FL Medicaid operates almost entirely through the Statewide Medicaid Managed Care (SMMC) system. Nearly all FL Medicaid recipients are enrolled in a managed care plan. Fee-for-service is limited to specific populations. Managed care plan contracts vary — prior auth requirements differ by plan.",
    priorAuthThreshold: "Required for inpatient, surgical procedures, high-cost imaging, specialty medications, and most specialty referrals under SMMC plans",
    commonDenials: [
      "Service requires SMMC managed care plan prior authorization",
      "Out-of-network provider for SMMC enrollee without emergency exception",
      "Specialty referral not obtained from FL Medicaid primary care provider",
      "Service exceeds SMMC plan benefit limits",
      "Provider not credentialed with the applicable SMMC managed care plan",
    ],
    billingRules: [
      "All SMMC billing goes directly to the managed care plan — not AHCA",
      "FFS Medicaid is limited — verify enrollee's Medicaid type before billing",
      "Timely filing limit: 12 months from date of service for most SMMC plans",
      "AHCA 6-year record retention requirement for all Medicaid documentation",
      "Provider must be credentialed separately with each SMMC managed care plan",
    ],
  },
  noFault: {
    applicable: true,
    program: "Florida No-Fault / PIP Insurance",
    statute: "FL Personal Injury Protection — Florida Statute §627.736",
    billingDeadlineDays: 35,
    notes: "Florida is a no-fault state under FL Statute §627.736. PIP covers 80% of medical bills and 60% of lost wages up to $10,000. Critical: the injured party must seek initial treatment within 14 days of the accident for PIP coverage to apply. Bills must be submitted within 35 days of service.",
    commonDenials: [
      "Initial treatment not sought within 14 days of accident — PIP benefits void",
      "Bill submitted more than 35 days after date of service",
      "Treatment deemed not medically necessary per FL PIP standards",
      "Failure to attend FL PIP IME (Independent Medical Examination)",
      "PIP limit of $10,000 exhausted (or $2,500 if non-emergency condition)",
      "Insurer disputes emergency vs. non-emergency classification (affects $10k vs. $2.5k limit)",
    ],
    keyRules: [
      "14-day rule: Initial treatment must occur within 14 days of accident",
      "PIP covers 80% of medical bills up to $10,000 (emergency) or $2,500 (non-emergency)",
      "Bills must be submitted to PIP insurer within 35 days of service",
      "Insurer must pay or deny within 30 days of receipt of a complete bill",
      "Medical conditions must be an emergency for the $10,000 limit to apply",
      "FL enacted PIP reforms limiting attorney involvement in PIP disputes",
    ],
  },
  workflowRules: [
    { id: "fl-1", category: "no-fault", title: "PIP 14-Day Initial Treatment Rule", description: "Florida Statute §627.736 requires that injured parties seek initial medical treatment within 14 days of the accident. If 14 days pass without treatment, PIP benefits are forfeited entirely with no exceptions.", impact: "high" },
    { id: "fl-2", category: "medicaid", title: "SMMC Managed Care Prior Authorization", description: "All Florida Medicaid recipients are enrolled in SMMC managed care. Each MCO has distinct prior auth requirements. Verify auth requirements with the specific SMMC plan — not AHCA — before rendering service.", impact: "high" },
    { id: "fl-3", category: "no-fault", title: "PIP Emergency vs. Non-Emergency Classification", description: "FL PIP pays up to $10,000 for emergency medical conditions and $2,500 for non-emergency. The treating provider must document an emergency medical condition to trigger the higher limit. Documentation quality is critical.", impact: "high" },
    { id: "fl-4", category: "workers-comp", title: "FL WC 30-Day Employer Reporting", description: "FL employers must report workplace injuries to their WC insurer within 30 days. Late reporting affects claim adjudication. Providers should confirm claim reporting status before treating WC patients.", impact: "medium" },
    { id: "fl-5", category: "audit", title: "AHCA Medicaid Fraud Control", description: "FL AHCA and the FL Medicaid Fraud Control Unit (MFCU) actively investigate billing anomalies. High-volume billers in home health, DME, and behavioral health are frequent targets. Maintain robust documentation.", impact: "high" },
    { id: "fl-6", category: "timely-filing", title: "PIP 35-Day Billing Window", description: "FL PIP bills must be submitted to the no-fault insurer within 35 days of the date of service. This window is shorter than many states — establish workflows to bill PIP claims within 30 days to ensure compliance.", impact: "high" },
  ],
};

// ─── California ───────────────────────────────────────────────────────────────

const CALIFORNIA: RegionalConfig = {
  id: "ca",
  label: "California",
  abbreviation: "CA",
  description: "CA has the largest Medi-Cal program in the US (managed through DHCS), OMFS workers' comp fee schedule enforced by DWC, and AB 72 out-of-network billing protections. No PIP/no-fault auto insurance.",
  payers: [
    { name: "Anthem Blue Cross of CA", type: "commercial", marketShare: 20, denialRate: 14, avgDaysToPayment: 32, notes: "Largest commercial payer in CA. CalPERS and large group markets. Strong prior auth requirements." },
    { name: "Blue Shield of California", type: "commercial", marketShare: 15, denialRate: 12, avgDaysToPayment: 30, notes: "Non-profit Blue Plan. Covered CA marketplace presence. Promise plan for Medi-Cal in some counties." },
    { name: "Kaiser Permanente", type: "commercial", marketShare: 17, denialRate: 7, avgDaysToPayment: 22, notes: "Integrated delivery system — Kaiser bills internally. Referrals to non-Kaiser providers are restricted." },
    { name: "Health Net of California (Centene)", type: "managed-care", marketShare: 10, denialRate: 18, avgDaysToPayment: 40, notes: "Large Medi-Cal managed care plan. Centene-owned. Active in Southern CA and Central Valley." },
    { name: "L.A. Care Health Plan", type: "medicaid", marketShare: 8, denialRate: 20, avgDaysToPayment: 45, notes: "Largest publicly operated health plan in the US. Medi-Cal in LA County. Low-income focus." },
    { name: "Molina Healthcare of CA", type: "medicaid", marketShare: 7, denialRate: 19, avgDaysToPayment: 44, notes: "Medi-Cal managed care in multiple CA counties. Behavioral health and long-term services." },
    { name: "State Compensation Insurance Fund (SCIF)", type: "workers-comp", marketShare: 9, denialRate: 16, avgDaysToPayment: 39, notes: "Largest CA WC insurer. CA DWC OMFS fee schedule applies. UR (utilization review) is mandatory." },
    { name: "Medicare (Noridian MAC)", type: "medicare", marketShare: 14, denialRate: 9, avgDaysToPayment: 27, notes: "CA falls under Noridian Healthcare Solutions MAC (JE). LCDs and NCDs published by Noridian." },
  ],
  denialPatterns: [
    { category: "AB 72 Out-of-Network Dispute", percentage: 26, description: "CA AB 72 limits OON billing — disputes arise when non-par providers bill beyond 125% of Medicare rate", stateSpecific: true },
    { category: "Missing Modifier", percentage: 21, description: "Modifier missing — especially relevant for CA WC and Medi-Cal claims", stateSpecific: false },
    { category: "Medi-Cal Auth Not Obtained", percentage: 22, description: "Medi-Cal managed care plan authorization not obtained prior to service delivery", stateSpecific: true },
    { category: "DWC OMFS Fee Schedule Overage", percentage: 15, description: "CA Workers' Comp bill exceeds Official Medical Fee Schedule (OMFS) maximum", stateSpecific: true },
    { category: "SB 1120 Prior Auth Denial", percentage: 10, description: "Insurer denied prior auth for a service that may qualify for expedited review under CA SB 1120", stateSpecific: true },
    { category: "Mismatched ICD-10", percentage: 6, description: "Diagnosis does not support medical necessity for billed procedure", stateSpecific: false },
  ],
  workersComp: {
    program: "California Workers' Compensation Program",
    administrator: "CA Division of Workers' Compensation (DWC), Department of Industrial Relations (DIR)",
    feeSchedule: "Official Medical Fee Schedule (OMFS) — published by CA DWC, updated regularly",
    notes: "CA has one of the most complex WC systems in the country. The OMFS is the mandatory fee schedule. Utilization review (UR) is required for non-emergency treatment. Independent Medical Review (IMR) by Maximus Federal Services resolves UR disputes. Physicians must be MPN (Medical Provider Network) enrolled to treat WC patients.",
    commonDenials: [
      "Bill exceeds CA OMFS maximum allowable reimbursement",
      "Treatment not authorized via Utilization Review (UR) per DWC guidelines",
      "Provider not enrolled in employer's Medical Provider Network (MPN)",
      "IMR (Independent Medical Review) overturned UR authorization decision",
      "Treatment not causally related to industrial injury per medical-legal report",
      "Delay in reporting injury (CA requires 30-day reporting by employer)",
    ],
    billingRules: [
      "All CA WC billing must use OMFS fee schedule — not standard CPT fees",
      "UR required for all non-emergency treatment per DWC UR standards",
      "MPN enrollment is mandatory — treating physicians must be in the insurer's MPN",
      "Use DWC form PR-2 (Primary Treating Physician's Progress Report) for ongoing treatment",
      "UR denials can be appealed via IMR through Maximus Federal Services",
      "Lien claims against WC settlements are subject to WCAB adjudication",
    ],
  },
  medicaid: {
    program: "Medi-Cal (California Medicaid)",
    administrator: "CA Department of Health Care Services (DHCS)",
    managedCare: true,
    notes: "Medi-Cal is the largest state Medicaid program in the US. The vast majority of Medi-Cal enrollees are in managed care plans (Medi-Cal Managed Care). DHCS is transitioning to CalAIM — a multi-year reform initiative changing benefit structures and managed care contracting. Providers must be enrolled in the DHCS Medi-Cal provider database.",
    priorAuthThreshold: "Required for inpatient, surgeries, high-cost drugs, DME, most imaging, specialty services, and all non-emergency out-of-county services",
    commonDenials: [
      "Provider not enrolled in DHCS Medi-Cal provider database",
      "Service requires Medi-Cal managed care plan prior authorization",
      "CalAIM transition: service category or benefit no longer covered under new model",
      "Out-of-network service without emergency exception documentation",
      "Duplicate claim — same service already paid by another payer (coordination of benefits)",
    ],
    billingRules: [
      "Medi-Cal billing through DHCS's Medi-Cal Rx and MediCal Providers portal",
      "Managed care enrollees: bill the MCO plan, not DHCS directly",
      "Timely filing: 180 days from date of service for FFS Medi-Cal",
      "CalAIM Enhanced Care Management (ECM) requires separate provider enrollment",
      "DHCS requires 7-year record retention for all Medi-Cal documentation",
    ],
  },
  noFault: {
    applicable: false,
    program: "N/A — California is an At-Fault Auto Insurance State",
    notes: "California does NOT have a no-fault (PIP) auto insurance system. CA uses a traditional fault-based (tort) system. Auto accident medical bills are pursued through the at-fault driver's bodily injury (BI) liability coverage, the injured party's Med-Pay coverage (if purchased), or a personal injury lawsuit. No PIP billing rules apply.",
    keyRules: [
      "CA is an at-fault state — no PIP billing applies",
      "Auto accident claims go through liability (BI) coverage of at-fault driver",
      "Med-Pay (Medical Payments) coverage is optional add-on — not mandatory PIP",
      "Providers can accept assignment of Med-Pay or BI benefits",
      "No 14-day or 30-day billing deadline for auto-related injury claims in CA",
    ],
  },
  workflowRules: [
    { id: "ca-1", category: "billing", title: "AB 72 Out-of-Network Billing Cap", description: "California AB 72 limits out-of-network billing for services at in-network facilities to the greater of 125% of Medicare or the average contracted rate. Providers billing above this face dispute and non-payment.", impact: "high" },
    { id: "ca-2", category: "workers-comp", title: "CA DWC Utilization Review (UR) Mandatory", description: "All non-emergency WC medical treatment in CA requires utilization review. UR requests must be submitted per DWC guidelines. Treating physician must use the MTUS (Medical Treatment Utilization Schedule) as the treatment guideline.", impact: "high" },
    { id: "ca-3", category: "medicaid", title: "CalAIM Reform Compliance", description: "DHCS is implementing CalAIM across Medi-Cal managed care. New Enhanced Care Management (ECM), In Lieu of Services (ILOS), and Community Supports programs require separate enrollment and billing procedures.", impact: "high" },
    { id: "ca-4", category: "prior-auth", title: "SB 1120 Prior Auth Timelines", description: "California SB 1120 requires health plans to respond to standard prior auth requests within 5 business days and urgent requests within 72 hours. Violations subject payers to penalties and deemed authorization.", impact: "medium" },
    { id: "ca-5", category: "audit", title: "DHCS Medi-Cal Audit Risk", description: "DHCS conducts regular post-payment audits of Medi-Cal claims. Home health, DME, and behavioral health are highest risk. Maintain complete documentation and ensure treatment plans are current.", impact: "high" },
    { id: "ca-6", category: "timely-filing", title: "Medi-Cal 180-Day Timely Filing", description: "FFS Medi-Cal claims must be submitted within 180 days of the date of service. Managed care plans may have shorter windows — verify per MCO contract. Late submission is a non-waivable denial.", impact: "medium" },
  ],
};

// ─── Texas ────────────────────────────────────────────────────────────────────

const TEXAS: RegionalConfig = {
  id: "tx",
  label: "Texas",
  abbreviation: "TX",
  description: "TX uses an employer-optional WC system (non-subscriber option exists), STAR managed Medicaid through HHSC, a TDI-regulated insurance market, and a fault-based (not PIP) auto insurance system.",
  payers: [
    { name: "BlueCross BlueShield of Texas (BCBSTX)", type: "commercial", marketShare: 28, denialRate: 12, avgDaysToPayment: 29, notes: "Largest commercial payer in TX. Strong employer group market. Medicare Advantage growing rapidly." },
    { name: "Aetna Texas", type: "commercial", marketShare: 14, denialRate: 13, avgDaysToPayment: 28, notes: "CVS Health subsidiary. Large commercial presence in DFW and Houston markets." },
    { name: "UnitedHealthcare Texas", type: "commercial", marketShare: 12, denialRate: 14, avgDaysToPayment: 31, notes: "Strong presence in TX HMO market. Optum-owned — prior auth via OptumRx for pharmacy." },
    { name: "Community Health Choice (TX)", type: "managed-care", marketShare: 6, denialRate: 19, avgDaysToPayment: 43, notes: "TX STAR Medicaid managed care in the Gulf Coast region (Harris, Jefferson counties). FQHC-affiliated." },
    { name: "Molina Healthcare of Texas", type: "medicaid", marketShare: 8, denialRate: 18, avgDaysToPayment: 42, notes: "TX STAR and CHIP managed care. Active in multiple service areas across TX." },
    { name: "Scott & White Health Plan", type: "commercial", marketShare: 5, denialRate: 10, avgDaysToPayment: 24, notes: "BSW subsidiary. Central TX focus. Strong integrated delivery network with Baylor Scott & White." },
    { name: "TX Mutual Insurance (Workers' Comp)", type: "workers-comp", marketShare: 7, denialRate: 15, avgDaysToPayment: 37, notes: "Largest TX WC carrier. TX uses DWC fee schedule. Non-subscriber WC is unique to TX." },
    { name: "Medicare (Novitas MAC)", type: "medicare", marketShare: 10, denialRate: 8, avgDaysToPayment: 26, notes: "TX falls under Novitas Solutions MAC (JH). LCD and NCD policies published by Novitas for TX." },
    { name: "Humana Texas", type: "commercial", marketShare: 10, denialRate: 11, avgDaysToPayment: 28, notes: "Strong TX Medicare Advantage market. Growing ACA marketplace presence." },
  ],
  denialPatterns: [
    { category: "TX Non-Subscriber WC Liability Issue", percentage: 24, description: "TX employer opted out of WC (non-subscriber) — liability claims route through civil litigation, not WC", stateSpecific: true },
    { category: "Missing Modifier", percentage: 22, description: "Modifier not included — especially for same-day E&M and procedure billing", stateSpecific: false },
    { category: "STAR Managed Care Auth", percentage: 21, description: "TX STAR Medicaid MCO prior authorization not obtained before service", stateSpecific: true },
    { category: "TDI Prompt Pay Violation", percentage: 16, description: "Insurer failed to pay within TX TDI prompt pay timelines — triggers interest and penalties", stateSpecific: true },
    { category: "WC DWC Fee Schedule Overage", percentage: 11, description: "TX WC bill exceeds Division of Workers' Comp fee schedule maximum", stateSpecific: true },
    { category: "Mismatched ICD-10", percentage: 6, description: "Diagnosis and procedure code mismatch flagged by STAR managed care plan", stateSpecific: false },
  ],
  workersComp: {
    program: "Texas Workers' Compensation Program (and Non-Subscriber Option)",
    administrator: "TX Division of Workers' Compensation (DWC), TX Department of Insurance (TDI)",
    feeSchedule: "TX Workers' Compensation Medical Fee Schedule — established by DWC, updated periodically",
    notes: "Texas is unique in that WC coverage is NOT mandatory for most private employers. TX employers may 'opt out' and become non-subscribers, which shifts liability to civil litigation. When WC does apply, the TX DWC fee schedule governs reimbursement. Preauthorization is required for non-emergency care. Providers must be registered with TX DWC to treat WC patients.",
    commonDenials: [
      "Employer is a non-subscriber — injury claim routes to civil liability, not DWC WC system",
      "Treatment not authorized via DWC preauthorization review",
      "Provider not registered with TX DWC to provide workers' comp treatment",
      "Bill exceeds TX DWC Medical Fee Schedule maximum allowable",
      "Treatment deemed not causally related to work injury per medical evidence",
    ],
    billingRules: [
      "Verify employer WC subscriber status before billing as WC claim",
      "Use TX DWC Medical Fee Schedule — not standard CPT fee amounts",
      "Preauthorization required for all non-emergency services per DWC rules",
      "Register as TX DWC healthcare provider via DWC TexComp portal",
      "Submit Form HCFA-1500 or UB-04 per DWC electronic billing requirements",
      "Non-subscriber injury claims: bill employer's general liability insurer, not DWC WC",
    ],
  },
  medicaid: {
    program: "Texas Medicaid — STAR, STAR+PLUS, CHIP (HHSC)",
    administrator: "TX Health and Human Services Commission (HHSC)",
    managedCare: true,
    notes: "TX Medicaid is almost entirely managed care through the STAR (children/families), STAR+PLUS (aged/disabled), and STAR Health (foster care) programs. CHIP serves children in families that earn too much for Medicaid. Each program has a separate set of managed care organizations with distinct prior auth requirements. HHSC contracts with MCOs across 11 service areas.",
    priorAuthThreshold: "Required for inpatient, surgeries, high-cost imaging, specialty medications, DME, and most specialty referrals under all STAR/STAR+PLUS plans",
    commonDenials: [
      "Service requires STAR or STAR+PLUS MCO prior authorization not obtained",
      "Out-of-network provider without emergency or continuity-of-care exception",
      "Service area mismatch — beneficiary moved to different TX HHSC service area",
      "CHIP enrollment lapse — child aged out or income no longer qualifies",
      "Provider not credentialed with applicable TX Medicaid managed care plan",
    ],
    billingRules: [
      "Bill the specific STAR/STAR+PLUS MCO — not HHSC directly",
      "Verify patient's enrolled MCO and service area before rendering service",
      "Timely filing: 95 days from date of service for most TX Medicaid MCOs",
      "HHSC requires 5-year record retention for TX Medicaid billing",
      "Credentialing required separately with each STAR/STAR+PLUS MCO",
    ],
  },
  noFault: {
    applicable: false,
    program: "N/A — Texas is an At-Fault Auto Insurance State",
    notes: "Texas does NOT have a no-fault (PIP) auto insurance mandate. TX uses a fault-based (tort) system. Auto accident medical bills are pursued through the at-fault driver's bodily injury liability insurance or the injured party's optional Med-Pay coverage. Personal Injury Protection (PIP) is available as an optional add-on in TX but is not mandatory.",
    keyRules: [
      "TX is an at-fault state — no mandatory PIP billing applies",
      "Auto accident claims route through at-fault driver's BI liability insurance",
      "PIP is optional in TX — verify whether patient's policy includes it",
      "Med-Pay is also optional — confirm coverage before billing",
      "TDI regulates prompt pay requirements for auto liability claims in TX",
    ],
  },
  workflowRules: [
    { id: "tx-1", category: "workers-comp", title: "TX Non-Subscriber WC Check", description: "Texas uniquely allows employers to opt out of the workers' comp system. Before treating a WC patient, verify the employer is a WC subscriber through the TDI TexComp portal. Non-subscriber injuries are civil liability claims — billing and adjudication are entirely different.", impact: "high" },
    { id: "tx-2", category: "medicaid", title: "STAR/STAR+PLUS MCO Verification", description: "TX Medicaid is managed through 11 service areas with multiple MCOs. The MCO and service area determine the prior auth requirements and fee schedule. Verify the patient's specific enrolled plan before rendering service — errors here cause most TX Medicaid denials.", impact: "high" },
    { id: "tx-3", category: "billing", title: "TDI Prompt Pay Enforcement", description: "Texas Insurance Code §1301 requires insurers to acknowledge claims within 15 days and pay or deny within 45 days. Violations trigger interest penalties of 18% per year. Track insurer response timelines and escalate late payments to TDI.", impact: "medium" },
    { id: "tx-4", category: "prior-auth", title: "DWC WC Preauthorization Requirements", description: "TX Workers' Comp requires preauthorization for non-emergency medical treatment per DWC rules. Unauthorized care may not be reimbursed. Submit preauth requests via the TX DWC TexComp online system.", impact: "high" },
    { id: "tx-5", category: "timely-filing", title: "TX Medicaid 95-Day Filing Window", description: "Most TX STAR/STAR+PLUS MCOs enforce a 95-day timely filing window from the date of service. Some plans have shorter windows per their individual contracts. Establish internal workflows to submit TX Medicaid claims within 60 days to ensure compliance.", impact: "medium" },
    { id: "tx-6", category: "audit", title: "HHSC OIG Medicaid Integrity", description: "The TX HHSC Office of Inspector General conducts active Medicaid program integrity investigations. High-volume billing in home health, personal care, DME, and behavioral health are primary targets. Participate proactively in HHSC PI audits and maintain complete documentation.", impact: "high" },
  ],
};

// ─── Exported map ─────────────────────────────────────────────────────────────

export const REGIONAL_CONFIGS: Record<StateId, RegionalConfig> = {
  national: NATIONAL,
  ny: NEW_YORK,
  fl: FLORIDA,
  ca: CALIFORNIA,
  tx: TEXAS,
};

export const STATE_OPTIONS: { id: StateId; label: string; abbreviation: string }[] = [
  { id: "national", label: "General / National", abbreviation: "US" },
  { id: "ny", label: "New York", abbreviation: "NY" },
  { id: "fl", label: "Florida", abbreviation: "FL" },
  { id: "ca", label: "California", abbreviation: "CA" },
  { id: "tx", label: "Texas", abbreviation: "TX" },
];
