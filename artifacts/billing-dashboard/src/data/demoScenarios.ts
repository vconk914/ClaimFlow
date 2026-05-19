// ─── Demo Scenario Types ──────────────────────────────────────────────────────

export interface ScenarioPrefill {
  patient: string;
  dob: string;
  insuranceId: string;
  cpt: string;
  icd10: string;
  payer: string;
  amount: string;
  specialtyId: string;
}

export interface ScenarioError {
  field: string;
  severity: "error" | "warning" | "info";
  title: string;
  message: string;
  suggestion: string;
}

export interface WalkthroughStep {
  type: "problem" | "rule" | "fix" | "result";
  title: string;
  description: string;
}

export type RiskLevel = "critical" | "high" | "medium" | "low";
export type ScenarioColor = "red" | "orange" | "amber" | "violet" | "blue" | "emerald";

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  regionId: string;
  regionLabel: string;
  specialty: string;
  payerType: string;
  color: ScenarioColor;

  denialRiskScore: number;
  riskLevel: RiskLevel;
  estimatedDelayDays: number;
  financialImpact: number;
  billedAmount: number;

  prefill: ScenarioPrefill;
  beforeErrors: ScenarioError[];
  payerResponseCode: string;
  payerResponseText: string;

  afterCpt: string;
  afterIcd10: string;
  afterPayer: string;
  afterModifier: string;
  afterNote: string;
  afterExplanation: string;
  afterReimbursement: number;
  afterPayerResponse: string;

  steps: WalkthroughStep[];
}

// ─── Scenario 1: NY No-Fault Urgent Care Denial ───────────────────────────────

const S1_NY_NO_FAULT: DemoScenario = {
  id: "ny-no-fault",
  title: "NY No-Fault Urgent Care Denial",
  subtitle: "Bill submitted 32 days after service — NY 30-day rule violated",
  regionId: "ny",
  regionLabel: "New York",
  specialty: "Urgent & Emergency Care",
  payerType: "No-Fault / PIP",
  color: "red",

  denialRiskScore: 100,
  riskLevel: "critical",
  estimatedDelayDays: 92,
  financialImpact: 487,
  billedAmount: 487,

  prefill: {
    patient: "Margaret Torres",
    dob: "1979-04-12",
    insuranceId: "ALT-NF-8821044",
    cpt: "99283",
    icd10: "S09.90XA",
    payer: "Allstate No-Fault / PIP",
    amount: "487.00",
    specialtyId: "urgent-emergency",
  },

  beforeErrors: [
    {
      field: "submission",
      severity: "error",
      title: "NY No-Fault 30-Day Deadline Exceeded",
      message: "Bill submitted on Day 32 (service date: May 3, 2024; bill date: June 4, 2024). NY Insurance Law §5106 mandates submission within 30 days of service. This deadline is absolute — no exceptions or waivers are available.",
      suggestion: "There is no remedy once the 30-day window has passed. Arbitration will also result in denial. Write off the claim and implement a 25-day internal no-fault billing SLA going forward.",
    },
    {
      field: "icd10",
      severity: "warning",
      title: "ICD-10 Specificity — Unspecified Injury",
      message: "S09.90XA (Unspecified injury of head, initial encounter) is accepted for no-fault but payers may request additional documentation of the accident mechanism.",
      suggestion: "If more specific injury documentation exists in the encounter note (e.g., concussion S09.90XA, cervical strain S13.4XXA), use the more specific code to reduce audit risk.",
    },
    {
      field: "cpt",
      severity: "info",
      title: "ED Moderate Complexity — Prior Auth Verification",
      message: "99283 is within the ED visit spectrum. Allstate No-Fault covers medically necessary ED care for MVA injuries without prior auth, but insurer may schedule an Independent Medical Examination (IME).",
      suggestion: "Document the mechanism of injury, clinical decision-making, and all treatment ordered at the encounter. IME physicians scrutinize incomplete documentation for MVA claims.",
    },
  ],

  payerResponseCode: "CO-29",
  payerResponseText: "DENIED — CO-29: The time limit for filing has expired. Reason: Bill received June 4, 2024 for date of service May 3, 2024 (32 days). NY Insurance Law §5106(a) requires submission within 30 calendar days. No appeal or waiver is available for this denial.",

  afterCpt: "99283",
  afterIcd10: "S09.90XA",
  afterPayer: "Allstate No-Fault / PIP",
  afterModifier: "",
  afterNote: "Implement 25-day internal no-fault billing deadline. No fix for this specific claim.",
  afterExplanation: "For future NY No-Fault claims: establish an internal billing SLA of 25 days to ensure claims reach the insurer within the 30-day statutory window. Use a no-fault billing tracker with automatic escalation flags at Day 20 and Day 25.",
  afterReimbursement: 0,
  afterPayerResponse: "PREVENTION ONLY — The 30-day window cannot be retroactively extended. Future claims billed within 25 days will be eligible for payment at 80% of the fee schedule rate per NY No-Fault regulations.",

  steps: [
    {
      type: "problem",
      title: "Bill Submitted 32 Days After Service",
      description: "Patient treated May 3, 2024 for motor vehicle accident injuries. Bill was prepared and submitted June 4, 2024 — two days past the statutory 30-day deadline under NY Insurance Law §5106(a).",
    },
    {
      type: "rule",
      title: "NY No-Fault 30-Day Absolute Rule",
      description: "NY Insurance Law §5106(a) requires all no-fault medical bills to be submitted within 30 calendar days of the date of service. Unlike most payer timely-filing requirements, this deadline cannot be waived, extended, or appealed — even with written justification.",
    },
    {
      type: "rule",
      title: "CO-29 Denial Code — Time Limit Expired",
      description: "Denial code CO-29 is issued by no-fault carriers when the 30-day submission window is missed. The Comprehensive Motor Vehicle Insurance Reparations Act (NY Ins. Law §5101–5108) provides no exception path. The denial is final.",
    },
    {
      type: "fix",
      title: "Process Improvement: 25-Day Internal SLA",
      description: "Establish a no-fault billing SLA of 25 calendar days from date of service. Configure practice management system alerts at Day 20 (warning) and Day 25 (escalation). This 5-day buffer accounts for mail, processing, and intake delays at the insurer.",
    },
    {
      type: "result",
      title: "Financial Impact: $487 Written Off",
      description: "This claim cannot be recovered. The full billed amount of $487 must be written off. Implementing the 25-day SLA prevents similar losses. Estimated exposure from systematic late filing: $4,200–$8,400/month depending on MVA patient volume.",
    },
  ],
};

// ─── Scenario 2: PT Authorization Exceeded ───────────────────────────────────

const S2_PT_AUTH: DemoScenario = {
  id: "pt-auth-exceeded",
  title: "PT Authorization Exceeded",
  subtitle: "Therapy rendered beyond authorized visit limit — 3 visits at risk",
  regionId: "national",
  regionLabel: "National",
  specialty: "Physical & Occupational Therapy",
  payerType: "Commercial",
  color: "orange",

  denialRiskScore: 85,
  riskLevel: "high",
  estimatedDelayDays: 52,
  financialImpact: 285,
  billedAmount: 285,

  prefill: {
    patient: "Harold Pemberton",
    dob: "1958-07-19",
    insuranceId: "UHC-7723091",
    cpt: "97110",
    icd10: "M54.5",
    payer: "UnitedHealthcare",
    amount: "285.00",
    specialtyId: "physical-occupational-therapy",
  },

  beforeErrors: [
    {
      field: "auth",
      severity: "error",
      title: "Authorization Limit Exceeded — 3 Unauthorized Visits",
      message: "UnitedHealthcare authorization #UHC-AUTH-2024-00341 approved 12 physical therapy visits. Patient has received 15 visits to date. Visits 13, 14, and 15 (billed amount: $285) were rendered without active authorization.",
      suggestion: "Submit a Continuation of Care (COC) authorization request to UnitedHealthcare before rendering visits beyond the authorized limit. Most payers require 48–72 hours for COC authorization decisions.",
    },
    {
      field: "icd10",
      severity: "info",
      title: "Functional Progress Documentation Required",
      message: "For COC authorization, UnitedHealthcare requires objective functional progress documentation: current vs. baseline outcome measures (e.g., Oswestry Disability Index), specific measurable goals, and evidence that maximum therapeutic benefit has not been reached.",
      suggestion: "Prepare a Progress Note with standardized outcome measure scores and a projected discharge plan to support the COC authorization request.",
    },
  ],

  payerResponseCode: "CO-197",
  payerResponseText: "DENIED — CO-197: Precertification/authorization absent for service. Auth #UHC-AUTH-2024-00341 authorized 12 visits (exhausted May 28, 2024). Visits 13–15 rendered June 3–17, 2024 without valid authorization. Provider appeal rights: 90 days from denial date.",

  afterCpt: "97110",
  afterIcd10: "M54.5",
  afterPayer: "UnitedHealthcare",
  afterModifier: "",
  afterNote: "Submit COC authorization before visit 13. Track visit count against auth limit in real-time.",
  afterExplanation: "Request a Continuation of Care authorization from UnitedHealthcare at visit 9 or 10 (when 3–4 visits remain on current auth). Submit a functional progress note with outcome measure scores and revised treatment goals. COC auths are typically approved within 2–3 business days if functional progress is documented.",
  afterReimbursement: 285,
  afterPayerResponse: "APPROVED (projected) — Continuation of Care authorization for 8 additional PT visits approved. Auth valid through August 31, 2024. Reimbursement at contracted PT rate: $95/visit × 3 visits = $285.",

  steps: [
    {
      type: "problem",
      title: "12-Visit Authorization Exhausted",
      description: "UnitedHealthcare issued auth #UHC-AUTH-2024-00341 for 12 physical therapy visits (Therapeutic Exercise, CPT 97110) for low back pain (M54.5). The patient completed visit 12 on May 28, 2024, exhausting the authorization.",
    },
    {
      type: "problem",
      title: "3 Unauthorized Visits Rendered",
      description: "Without a Continuation of Care authorization in place, the practice continued treatment on June 3, June 10, and June 17, 2024. These 3 visits were rendered outside the authorized episode, making all three claims non-payable per UHC policy.",
    },
    {
      type: "rule",
      title: "UnitedHealthcare COC Authorization Policy",
      description: "UHC requires prior authorization for physical therapy beyond the initial authorization. COC requests must be submitted and approved before providing additional services. Retroactive authorization is not available for non-emergency outpatient PT services.",
    },
    {
      type: "fix",
      title: "Submit COC at 75% of Auth Limit",
      description: "Establish a workflow to flag physical therapy authorizations when 75% of authorized visits are used (here, visit 9 of 12). Submit a COC authorization request with functional progress documentation at that point, ensuring auth continuity before the limit is reached.",
    },
    {
      type: "fix",
      title: "Appeal with Functional Progress Documentation",
      description: "For the 3 denied visits, submit a Level 1 appeal within 90 days of denial with: current outcome measures (e.g., Oswestry score), visit-by-visit progress notes, and treating PT's clinical rationale. UHC overturns ~38% of PT auth denials on first appeal with strong documentation.",
    },
    {
      type: "result",
      title: "Recovery Path: Appeal + Process Improvement",
      description: "Immediate: Appeal the 3 denied visits ($285). Going forward: implement real-time auth tracking with visit-count alerts at 75% and 90% of authorized limit. Prevent approximately $570–$950/month in similar write-offs.",
    },
  ],
};

// ─── Scenario 3: Medicare Modifier Issue ─────────────────────────────────────

const S3_MEDICARE_MODIFIER: DemoScenario = {
  id: "medicare-modifier",
  title: "Medicare Modifier Issue",
  subtitle: "E&M bundled with same-day procedure — Modifier -25 missing",
  regionId: "national",
  regionLabel: "National",
  specialty: "Family Medicine",
  payerType: "Medicare",
  color: "blue",

  denialRiskScore: 78,
  riskLevel: "high",
  estimatedDelayDays: 38,
  financialImpact: 145,
  billedAmount: 302,

  prefill: {
    patient: "Dorothy Sinclair",
    dob: "1942-11-03",
    insuranceId: "MCR-4467821",
    cpt: "99213",
    icd10: "L82.1",
    payer: "Medicare",
    amount: "145.00",
    specialtyId: "family-medicine",
  },

  beforeErrors: [
    {
      field: "cpt",
      severity: "error",
      title: "Missing Modifier -25 for Same-Day E&M + Procedure",
      message: "CPT 99213 (Established Patient E&M, moderate complexity) and CPT 17110 (Destruction of warts, up to 14 lesions) were billed on the same date of service. Medicare bundles E&M into the minor procedure unless Modifier -25 is appended to the E&M code, documenting a separately identifiable evaluation and management service.",
      suggestion: "Append Modifier -25 to CPT 99213 to certify that a separately identifiable E&M was performed beyond the pre/post-operative care inherent in CPT 17110. Document the distinct medical decision-making in the encounter note.",
    },
    {
      field: "icd10",
      severity: "info",
      title: "ICD-10 Supports Procedure — Documentation Review Recommended",
      message: "L82.1 (Inflamed Seborrheic Keratosis) supports the wart destruction procedure. Ensure the E&M note documents a separately identifiable problem or clinical decision separate from the wart treatment to support Modifier -25.",
      suggestion: "If patient had other complaints addressed (e.g., hypertension review, medication management), document those separately in the E&M note to clearly support the -25 modifier.",
    },
  ],

  payerResponseCode: "CO-97",
  payerResponseText: "DENIED — CO-97: Payment adjusted because the benefit for this service is included in the allowance for another service/procedure (CPT 17110). Modifier -25 not present on E&M service 99213. If a separately identifiable E&M was performed, resubmit with Modifier -25 and supporting documentation.",

  afterCpt: "99213-25",
  afterIcd10: "L82.1",
  afterPayer: "Medicare",
  afterModifier: "-25",
  afterNote: "Append Modifier -25 to 99213 and document separately identifiable E&M in the encounter note.",
  afterExplanation: "Add Modifier -25 to CPT 99213. The encounter note must clearly document: (1) the E&M portion — a separately identifiable problem addressed beyond the procedure's pre/post-service work, and (2) the clinical decision-making that occurred independent of the wart destruction. Resubmit as a corrected claim.",
  afterReimbursement: 145,
  afterPayerResponse: "APPROVED (projected) — CPT 99213-25 + CPT 17110. Modifier -25 accepted. Medicare allowable: 99213 = $73.56, 17110 = $54.47. Patient responsible for 20% coinsurance. Total claim: $127.03 (Medicare portion).",

  steps: [
    {
      type: "problem",
      title: "E&M Bundled Into Minor Procedure",
      description: "Dorothy presented for wart removal (CPT 17110 — seborrheic keratosis). The physician also performed and documented an evaluation and management service (CPT 99213) for additional concerns. Without Modifier -25, Medicare's bundling rules prevent separate payment for the E&M.",
    },
    {
      type: "rule",
      title: "CMS Modifier -25 Policy (NCCI Edits)",
      description: "Medicare's National Correct Coding Initiative (NCCI) bundles evaluation and management codes with minor procedures performed on the same day. Modifier -25 is the signal to CMS that the E&M was a 'significant, separately identifiable evaluation and management service' beyond the pre-/post-procedure care of the minor procedure.",
    },
    {
      type: "rule",
      title: "Documentation Requirement for Modifier -25",
      description: "The medical record must support that the E&M was independently warranted. The note must contain: (1) a chief complaint or problem separate from the procedure indication, (2) history, exam, and MDM elements meeting the 99213 level, and (3) documentation that the E&M decision-making was independent of the decision to perform the procedure.",
    },
    {
      type: "fix",
      title: "Correct Action: Append Modifier -25, Resubmit",
      description: "Resubmit CPT 99213-25 on a corrected claim (CMS-1500 Box 24D). Confirm the encounter note explicitly documents the separately identifiable E&M. If the note does not support Modifier -25, an addendum may be used to clarify — but should not change clinical content, only add clarifying context.",
    },
    {
      type: "result",
      title: "Recovery: $145 + Permanent Process Improvement",
      description: "Corrected claim expected to pay $73.56 (Medicare) + $18.39 (20% patient coinsurance). Implement a claim editing rule to auto-flag E&M + same-day procedure combinations for Modifier -25 review before submission. This pattern affects an estimated $890–$1,400/month in your E&M volume.",
    },
  ],
};

// ─── Scenario 4: Behavioral Health Diagnosis Mismatch ────────────────────────

const S4_BH_MISMATCH: DemoScenario = {
  id: "bh-diagnosis-mismatch",
  title: "Behavioral Health Diagnosis Mismatch",
  subtitle: "Psychotherapy billed with acute respiratory ICD-10 — automatic denial",
  regionId: "national",
  regionLabel: "National",
  specialty: "Behavioral Health",
  payerType: "Commercial — Behavioral",
  color: "violet",

  denialRiskScore: 96,
  riskLevel: "critical",
  estimatedDelayDays: 68,
  financialImpact: 320,
  billedAmount: 320,

  prefill: {
    patient: "Vivian Nakashima",
    dob: "1987-09-14",
    insuranceId: "CIG-3302917",
    cpt: "90837",
    icd10: "J06.9",
    payer: "Cigna",
    amount: "320.00",
    specialtyId: "behavioral-health",
  },

  beforeErrors: [
    {
      field: "icd10",
      severity: "error",
      title: "Psychotherapy Requires DSM-5 Mental Health Diagnosis",
      message: "CPT 90837 (Individual psychotherapy, 60 minutes) is billed with J06.9 (Acute Upper Respiratory Infection, unspecified) — a physical medicine diagnosis. Cigna Behavioral Health and all major commercial payers require a DSM-5 aligned mental health ICD-10 code (F01–F99 range) to authorize and pay psychotherapy services.",
      suggestion: "Replace J06.9 with the patient's established DSM-5 diagnosis: F32.1 (Major Depressive Disorder, moderate), F41.1 (Generalized Anxiety Disorder), F43.10 (Acute Stress Disorder), or other qualifying mental health code. Verify the diagnosis is documented in the patient's behavioral health record.",
    },
    {
      field: "payer",
      severity: "warning",
      title: "Cigna Behavioral Health — Carved-Out Benefits",
      message: "Cigna typically carves out behavioral health benefits to Evernorth Behavioral Health (formerly Cigna Behavioral Health). Verify whether the patient's plan uses Evernorth for behavioral health claims vs. the medical plan.",
      suggestion: "Check patient's benefit card or call Cigna member services to confirm whether behavioral health is administered by Evernorth (separate NPI and payer ID required) or the main Cigna medical plan.",
    },
    {
      field: "cpt",
      severity: "info",
      title: "90837 (60-min) vs. 90834 (45-min) — Documentation Requirement",
      message: "CPT 90837 requires documentation of 53+ minutes of face-to-face psychotherapy time. If session duration was less, use CPT 90834 (45-minute session, 38–52 minutes) to avoid an audit trigger.",
      suggestion: "Document session start time, end time, and total face-to-face minutes in the session note. Do not bill 90837 without confirmed 53+ minute documentation.",
    },
  ],

  payerResponseCode: "CO-11",
  payerResponseText: "DENIED — CO-11: The diagnosis is inconsistent with the procedure or service billed. CPT 90837 (Psychotherapy) requires a qualifying mental health diagnosis (DSM-5 ICD-10 F01–F99). J06.9 (Acute URI) is not a covered diagnosis for behavioral health services. Please resubmit with the correct DSM-5 diagnosis code.",

  afterCpt: "90837",
  afterIcd10: "F32.1",
  afterPayer: "Cigna",
  afterModifier: "",
  afterNote: "Replace J06.9 with F32.1 (Major Depressive Disorder, moderate) — the patient's documented DSM-5 diagnosis.",
  afterExplanation: "Correct the ICD-10 code to F32.1 (Major Depressive Disorder, moderate) which is the patient's documented DSM-5 diagnosis per the behavioral health record. This is the established diagnosis driving the psychotherapy treatment. Resubmit as a corrected claim. No other changes required — CPT 90837 and the Cigna payer ID are correct for this service.",
  afterReimbursement: 320,
  afterPayerResponse: "APPROVED (projected) — CPT 90837 with F32.1 (Major Depressive Disorder, moderate). Cigna Behavioral Health contracted rate: $192.00 (60%). Patient responsible for $128.00 (copay + coinsurance per plan). Claim processes within 14 days of receipt.",

  steps: [
    {
      type: "problem",
      title: "Wrong ICD-10 Category — Respiratory vs. Behavioral Health",
      description: "The claim was submitted with J06.9 (Acute Upper Respiratory Infection) — a Chapter X respiratory code — as the primary diagnosis for CPT 90837 (Individual Psychotherapy, 60 min). This combination is clinically implausible and triggers an automatic CO-11 denial at claim adjudication.",
    },
    {
      type: "rule",
      title: "DSM-5 Diagnosis Required for Behavioral Health CPT Codes",
      description: "All commercial payers and CMS require CPT codes 90832–90899 (Psychiatric Therapeutic Procedures) to be billed with a qualifying mental health diagnosis in the ICD-10-CM F01–F99 range (Mental, Behavioral and Neurodevelopmental Disorders). No cross-category exceptions apply.",
    },
    {
      type: "problem",
      title: "Root Cause: Billing System ICD-10 Data Entry Error",
      description: "The patient's active problem list includes both J06.9 (recent URI, resolved) and F32.1 (MDD, ongoing). The billing entry selected the most recently updated code (J06.9) rather than the primary behavioral health diagnosis (F32.1). This is a data workflow problem, not a clinical one.",
    },
    {
      type: "fix",
      title: "Correct ICD-10 to F32.1 — Resubmit Corrected Claim",
      description: "Change the primary ICD-10 from J06.9 to F32.1 (Major Depressive Disorder, moderate). Submit as a corrected claim (CMS-1500 Box 22: Resubmission Code 7). Cigna's corrected claim processing window: 60 days from original claim date.",
    },
    {
      type: "fix",
      title: "Prevention: Specialty-Specific ICD-10 Templates",
      description: "Configure your billing system with behavioral health specialty templates that present only DSM-5 F-code diagnoses for CPT 90xxx codes. This prevents cross-specialty ICD-10 selection errors at the point of data entry — the most common source of CO-11 denials.",
    },
    {
      type: "result",
      title: "Full Recovery Expected: $320 Payable",
      description: "Corrected claim with F32.1 should process within 14 business days. Expected Cigna payment: $192.00. Patient copay: $128.00 (collectable). Total revenue recovered: $320. Implement specialty ICD-10 templates to prevent an estimated $640–$960/month in similar denials.",
    },
  ],
};

// ─── Scenario 5: Orthopedic Surgery Coding Conflict ──────────────────────────

const S5_ORTHO_CONFLICT: DemoScenario = {
  id: "ortho-surgery-conflict",
  title: "Orthopedic Surgery Coding Conflict",
  subtitle: "Rotator cuff repair billed with knee osteoarthritis — anatomic site mismatch",
  regionId: "national",
  regionLabel: "National",
  specialty: "Orthopedics",
  payerType: "Commercial",
  color: "amber",

  denialRiskScore: 98,
  riskLevel: "critical",
  estimatedDelayDays: 74,
  financialImpact: 3200,
  billedAmount: 3200,

  prefill: {
    patient: "Bernard Kowalski",
    dob: "1965-02-28",
    insuranceId: "AET-9934201",
    cpt: "29827",
    icd10: "M17.11",
    payer: "Aetna",
    amount: "3200.00",
    specialtyId: "orthopedics",
  },

  beforeErrors: [
    {
      field: "icd10",
      severity: "error",
      title: "Anatomic Site Mismatch — Shoulder Surgery + Knee Diagnosis",
      message: "CPT 29827 (Arthroscopy, shoulder, surgical; rotator cuff repair) is paired with M17.11 (Primary osteoarthritis, right knee) — a knee pathology code. Aetna and all major commercial payers auto-deny surgery claims where the procedure site and ICD-10 anatomic site do not match. The shoulder procedure requires a shoulder-specific diagnosis.",
      suggestion: "Replace M17.11 with the correct shoulder diagnosis: M75.120 (Complete rotator cuff tear or rupture of right shoulder, not specified as traumatic) or S46.011A (Complete rupture of right rotator cuff, initial encounter) for traumatic tears. Verify the diagnosis is documented in the pre-operative evaluation.",
    },
    {
      field: "cpt",
      severity: "warning",
      title: "Prior Authorization — High-Cost Surgical Procedure",
      message: "CPT 29827 (rotator cuff repair) requires prior authorization from Aetna for all commercial plans. Confirm authorization number is documented in the claim and patient record before billing.",
      suggestion: "Verify auth number on file and include it in CMS-1500 Box 23. If auth was not obtained pre-operatively, submit a retrospective auth request with the operative note immediately.",
    },
    {
      field: "icd10",
      severity: "info",
      title: "ICD-10 Specificity — Laterality and Mechanism",
      message: "For rotator cuff repair, Aetna requires specificity in the ICD-10 code: right vs. left shoulder, traumatic vs. degenerative tear, and partial vs. complete tear when the operative note specifies.",
      suggestion: "Use M75.120 for complete degenerative tear (right), M75.121 (left), or S46.011A for traumatic complete tear (initial encounter). Avoid unspecified laterality codes as they increase audit risk.",
    },
  ],

  payerResponseCode: "CO-11",
  payerResponseText: "DENIED — CO-11: The diagnosis is inconsistent with the procedure billed. CPT 29827 (Shoulder arthroscopy — rotator cuff repair) requires a shoulder-specific diagnosis. M17.11 (Primary Osteoarthritis, Right Knee) is a knee pathology. Please correct the diagnosis code and resubmit. Authorization required for corrected claim.",

  afterCpt: "29827",
  afterIcd10: "M75.120",
  afterPayer: "Aetna",
  afterModifier: "",
  afterNote: "Replace M17.11 (knee OA) with M75.120 (complete rotator cuff tear, right shoulder).",
  afterExplanation: "Change the primary ICD-10 from M17.11 (Primary Osteoarthritis, Right Knee) to M75.120 (Complete Rotator Cuff Tear or Rupture of Right Shoulder — Not Traumatic). This is the correct diagnosis for arthroscopic rotator cuff repair. Confirm the prior authorization number is in Box 23 of the CMS-1500 before resubmission.",
  afterReimbursement: 3200,
  afterPayerResponse: "APPROVED (projected) — CPT 29827 with M75.120 (Complete rotator cuff tear, right shoulder). Auth #AET-SR-2024-00891 confirmed. Aetna contracted rate for 29827: $1,920.00 (60%). Patient deductible/coinsurance: $1,280.00. Claim processes within 21 days of corrected submission.",

  steps: [
    {
      type: "problem",
      title: "Shoulder Surgery Coded with Knee Diagnosis",
      description: "Bernard Kowalski underwent arthroscopic rotator cuff repair of the right shoulder (CPT 29827). The diagnosis field was incorrectly populated with M17.11 (Primary Osteoarthritis, Right Knee) — likely copied from a previous knee consultation in the patient's record.",
    },
    {
      type: "rule",
      title: "Anatomic Site Consistency — CCI Bundling and Payer Edits",
      description: "Commercial payers cross-reference CPT procedure codes against ICD-10 diagnosis codes for anatomic site consistency. Shoulder arthroscopy CPT codes (29800–29899) are paired against shoulder ICD-10 codes (M75.x, S46.x). A knee diagnosis triggers an automatic CO-11 mismatch denial regardless of clinical documentation.",
    },
    {
      type: "problem",
      title: "Root Cause: Copy-Forward Error in EHR",
      description: "The patient has bilateral joint issues — left knee OA and right shoulder rotator cuff tear. The billing module auto-populated the most recent orthopedic diagnosis (M17.11 from the knee visit) when creating the surgery claim, rather than the operative indication for the shoulder procedure.",
    },
    {
      type: "fix",
      title: "Correct Diagnosis to M75.120 — Resubmit with Authorization",
      description: "Replace M17.11 with M75.120 (Complete Rotator Cuff Tear or Rupture of Right Shoulder, Not Traumatic). Verify the pre-operative work-up and operative note both document this diagnosis. Include the prior authorization number (AET-SR-2024-00891) in Box 23. Resubmit as a corrected claim within Aetna's 90-day corrected claim window.",
    },
    {
      type: "fix",
      title: "Prevention: Surgical Case Billing Audit",
      description: "Implement a pre-submission audit rule for all surgical CPT codes (>$500 billed): verify ICD-10 anatomic site matches the surgical site documented in the operative note. High-value surgeries are priority candidates for denial — preventing one ortho coding conflict per month saves $2,400–$4,800.",
    },
    {
      type: "result",
      title: "Full Recovery: $3,200 Payable After Correction",
      description: "Corrected claim with M75.120 and auth #AET-SR-2024-00891 is expected to process within 21 days. Aetna payment: $1,920. Patient responsibility: $1,280. This case illustrates why surgical claims require an additional diagnostic review step before submission.",
    },
  ],
};

// ─── Scenario 6: Preventive Visit Billed Incorrectly ─────────────────────────

const S6_PREVENTIVE: DemoScenario = {
  id: "preventive-visit-error",
  title: "Preventive Visit Billed Incorrectly",
  subtitle: "Chronic disease code as primary ICD-10 triggers payer downcode to office visit",
  regionId: "national",
  regionLabel: "National",
  specialty: "Preventive Care",
  payerType: "Commercial",
  color: "emerald",

  denialRiskScore: 55,
  riskLevel: "medium",
  estimatedDelayDays: 25,
  financialImpact: 85,
  billedAmount: 245,

  prefill: {
    patient: "Susan Whitmore",
    dob: "1961-08-04",
    insuranceId: "BCB-5510023",
    cpt: "99396",
    icd10: "E11.9",
    payer: "BlueCross BlueShield",
    amount: "245.00",
    specialtyId: "preventive-care",
  },

  beforeErrors: [
    {
      field: "icd10",
      severity: "error",
      title: "Preventive Visit Requires Z-Code as Primary Diagnosis",
      message: "CPT 99396 (Preventive Medicine, Established Patient, 40–64 years) is billed with E11.9 (Type 2 Diabetes Mellitus, without complications) as the primary ICD-10 code. BlueCross requires preventive medicine codes to be paired with a Z-category wellness/screening diagnosis (Z00.xx) as primary. Active disease codes as primary convert the encounter to a sick visit (E&M), not a preventive visit.",
      suggestion: "Change primary ICD-10 to Z00.00 (Encounter for general adult medical examination without abnormal findings) or Z00.01 (with abnormal findings). List E11.9 as a secondary code. This preserves preventive coding and the patient's annual wellness benefit.",
    },
    {
      field: "cpt",
      severity: "warning",
      title: "Payer Downcode Risk — Preventive → Established E&M",
      message: "With E11.9 as primary, BlueCross may automatically downcode CPT 99396 ($245) to CPT 99213 ($160), classifying the encounter as a chronic disease management visit. This results in a $85 reimbursement reduction and the patient losing their ACA-mandated annual wellness benefit (no cost sharing).",
      suggestion: "Correct the primary ICD-10 to Z00.00 before claim submission. If patient also received counseling about diabetes management during the preventive visit, document it as an additional service — do not let it drive the primary encounter coding.",
    },
    {
      field: "icd10",
      severity: "info",
      title: "Secondary Codes: Chronic Conditions Managed at Visit",
      message: "ACA preventive coding allows secondary diagnoses for chronic conditions monitored during the wellness visit. E11.9, I10 (hypertension), and Z87.891 (personal history of nicotine dependence) can all be listed as secondary codes without affecting the primary preventive classification.",
      suggestion: "List the patient's chronic conditions as additional diagnosis codes (Box 21, lines 2–4 on CMS-1500). This accurately reflects the comprehensive preventive visit without triggering a downcode.",
    },
  ],

  payerResponseCode: "CO-4",
  payerResponseText: "ADJUSTED — CO-4: The service is inconsistent with the modifier billed or the service was billed as preventive but the primary diagnosis (E11.9 — Type 2 Diabetes) indicates a chronic disease management encounter. Claim reprocessed as CPT 99213 (Established Patient Office Visit). Payment adjusted from $245 to $160. Patient cost-sharing applies.",

  afterCpt: "99396",
  afterIcd10: "Z00.00",
  afterPayer: "BlueCross BlueShield",
  afterModifier: "",
  afterNote: "Change primary ICD-10 to Z00.00 (General adult medical examination). Add E11.9 as secondary.",
  afterExplanation: "Change primary ICD-10 from E11.9 to Z00.00 (Encounter for General Adult Medical Examination without Abnormal Findings). Add E11.9 as a secondary code in Box 21, Line 2. This preserves the preventive medicine classification and ensures the patient does not owe cost-sharing for their ACA-mandated annual wellness visit.",
  afterReimbursement: 245,
  afterPayerResponse: "APPROVED — CPT 99396 with Z00.00 (primary) + E11.9 (secondary). Preventive medicine benefit applied per ACA §2713. Patient cost-sharing: $0 (preventive visit — no deductible, no copay). BlueCross contracted rate: $245.00. Claim processes within 14 days.",

  steps: [
    {
      type: "problem",
      title: "Chronic Disease Code Used as Primary for Wellness Visit",
      description: "Susan Whitmore presented for her annual wellness exam. The physician reviewed her diabetes management (E11.9) during the visit. Billing entered E11.9 as the primary ICD-10 code rather than the wellness encounter code (Z00.00), effectively reclassifying the visit as a chronic disease management encounter.",
    },
    {
      type: "rule",
      title: "ACA Preventive Coding: Z-Code Required as Primary",
      description: "Under the ACA (§2713 and USPSTF guidelines), annual wellness visits are a preventive benefit with $0 patient cost-sharing when coded correctly. CMS and commercial payers require Z00.xx codes as the primary diagnosis for CPT 99381–99397 (preventive medicine). Active disease codes as primary triggers a downcode to E&M.",
    },
    {
      type: "problem",
      title: "Patient Impact: $0 Copay → $35 Copay + Deductible",
      description: "The downcode from preventive (CPT 99396) to office visit (CPT 99213) removes the ACA preventive benefit. Susan's plan has a $35 office copay plus her deductible is not yet met — making her out-of-pocket cost approximately $85–$160 for what should have been a $0 wellness visit. This often results in patient complaints and payment disputes.",
    },
    {
      type: "fix",
      title: "Corrected Claim: Z00.00 Primary, E11.9 Secondary",
      description: "Resubmit with Z00.00 as primary ICD-10 and E11.9 as secondary. If abnormal findings were documented at the wellness visit, use Z00.01 (with abnormal findings) as primary instead. List all chronic conditions managed during the visit (E11.9, I10, etc.) as secondary codes on lines 2–4.",
    },
    {
      type: "fix",
      title: "Prevention: Preventive Visit ICD-10 Templates",
      description: "Configure your EHR or billing system with a preventive visit encounter type that auto-suggests Z00.00 or Z00.01 as the primary code for CPT 99381–99397. Add a claim edit rule that flags any preventive medicine CPT code submitted without a Z00.xx primary diagnosis.",
    },
    {
      type: "result",
      title: "Recovery: $85 Adjustment Reversed + Patient Satisfaction",
      description: "Corrected claim will restore the full $245 preventive benefit. Patient cost-sharing returns to $0 per ACA mandate. Any previously collected patient payment must be refunded. Implementing preventive coding templates prevents approximately $340–$680/month in similar downcodes, and eliminates patient billing complaints from this coding error.",
    },
  ],
};

// ─── Exported collection ──────────────────────────────────────────────────────

export const DEMO_SCENARIOS: DemoScenario[] = [
  S1_NY_NO_FAULT,
  S2_PT_AUTH,
  S3_MEDICARE_MODIFIER,
  S4_BH_MISMATCH,
  S5_ORTHO_CONFLICT,
  S6_PREVENTIVE,
];

// ─── Risk level helpers ───────────────────────────────────────────────────────

export const RISK_CONFIG: Record<RiskLevel, { label: string; dot: string; badge: string; badgeText: string; bar: string }> = {
  critical: { label: "Critical",  dot: "bg-red-500",    badge: "bg-red-100",    badgeText: "text-red-700",    bar: "bg-red-500"    },
  high:     { label: "High",      dot: "bg-orange-500", badge: "bg-orange-100", badgeText: "text-orange-700", bar: "bg-orange-500" },
  medium:   { label: "Medium",    dot: "bg-amber-500",  badge: "bg-amber-100",  badgeText: "text-amber-700",  bar: "bg-amber-400"  },
  low:      { label: "Low",       dot: "bg-emerald-500",badge: "bg-emerald-100",badgeText: "text-emerald-700",bar: "bg-emerald-500"},
};

export const SCENARIO_COLOR_CONFIG: Record<ScenarioColor, { bg: string; border: string; text: string; heading: string; iconBg: string }> = {
  red:     { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     heading: "text-red-900",     iconBg: "bg-red-500"     },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  heading: "text-orange-900",  iconBg: "bg-orange-500"  },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   heading: "text-amber-900",   iconBg: "bg-amber-500"   },
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700",  heading: "text-violet-900",  iconBg: "bg-violet-500"  },
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    heading: "text-blue-900",    iconBg: "bg-blue-500"    },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", heading: "text-emerald-900", iconBg: "bg-emerald-500" },
};

export const STEP_CONFIG: Record<WalkthroughStep["type"], { icon: string; bg: string; border: string; text: string; line: string }> = {
  problem: { icon: "⚠",  bg: "bg-red-100",     border: "border-red-300",     text: "text-red-700",     line: "bg-red-200"     },
  rule:    { icon: "§",   bg: "bg-blue-100",    border: "border-blue-300",    text: "text-blue-700",    line: "bg-blue-200"    },
  fix:     { icon: "✓",  bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-700", line: "bg-emerald-200" },
  result:  { icon: "$",   bg: "bg-violet-100",  border: "border-violet-300",  text: "text-violet-700",  line: "bg-violet-200"  },
};
