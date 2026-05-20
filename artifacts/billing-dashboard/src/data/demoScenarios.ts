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

// ─── Scenario 1: Cystoscopy Diagnosis Mismatch ────────────────────────────────

const S1_CYSTO_MISMATCH: DemoScenario = {
  id: "cysto-diagnosis-mismatch",
  title: "Cystoscopy Billed With Wrong Diagnosis",
  subtitle: "UTI code submitted instead of hematuria — payer auto-denied on CO-11",
  regionId: "national",
  regionLabel: "National",
  specialty: "Urology",
  payerType: "Commercial",
  color: "red",

  denialRiskScore: 94,
  riskLevel: "critical",
  estimatedDelayDays: 65,
  financialImpact: 380,
  billedAmount: 380,

  prefill: {
    patient: "Raymond Holbrook",
    dob: "1958-08-19",
    insuranceId: "BCB-5521047",
    cpt: "52000",
    icd10: "N39.0",
    payer: "BlueCross BlueShield",
    amount: "380.00",
    specialtyId: "urology",
  },

  beforeErrors: [
    {
      field: "icd10",
      severity: "error",
      title: "UTI Diagnosis Does Not Support Cystoscopy Medical Necessity",
      message: "CPT 52000 (Cystoscopy) is billed with N39.0 (Urinary Tract Infection, Unspecified). While cystoscopy may be performed in patients with UTI, BlueCross BlueShield and most commercial payers require a more specific urological indication — such as gross hematuria (R31.0), recurrent UTI, suspected bladder pathology, or obstructive voiding symptoms (N40.1). A single uncomplicated UTI is rarely a standalone indication for cystoscopy and will be auto-denied.",
      suggestion: "Change the primary diagnosis to R31.0 (Gross Hematuria) if that was the clinical indication for the cystoscopy. If performed for recurrent UTIs, add N30.10 (Interstitial Cystitis) or document the recurrence pattern with encounter dates. Verify the operative note records the specific indication that warranted direct bladder visualization.",
    },
    {
      field: "cpt",
      severity: "warning",
      title: "Cystoscopy Requires Prior Authorization for Some Commercial Plans",
      message: "BlueCross BlueShield requires prior authorization for cystoscopy (52000) under most commercial and Advantage plans. Verify whether an authorization number was obtained before the procedure was performed.",
      suggestion: "Check the patient's benefit card or call BlueCross provider services to confirm auth status. If auth was not obtained, submit a retrospective authorization request with the operative report and documented clinical indication immediately.",
    },
  ],

  payerResponseCode: "CO-11",
  payerResponseText: "DENIED — CO-11: Diagnosis N39.0 (Urinary Tract Infection) is inconsistent with CPT 52000 (Cystoscopy) as billed. Cystoscopy is not covered for routine uncomplicated UTI without documented recurrence or additional urological indication. Please resubmit with the correct clinical indication diagnosis.",

  afterCpt: "52000",
  afterIcd10: "R31.0",
  afterPayer: "BlueCross BlueShield",
  afterModifier: "",
  afterNote: "Change N39.0 (UTI) to R31.0 (Gross Hematuria) — the documented clinical indication for cystoscopy.",
  afterExplanation: "Replace N39.0 (UTI) with R31.0 (Gross Hematuria) — the patient's documented presenting complaint that indicated cystoscopy. Gross hematuria is the most common clinical indication for diagnostic cystoscopy per AUA guidelines and is recognized by all major commercial payers. Resubmit as a corrected claim.",
  afterReimbursement: 380,
  afterPayerResponse: "APPROVED (projected) — CPT 52000 with R31.0 (Gross Hematuria). Medical necessity established. BlueCross contracted rate for 52000: $228.00 (60%). Patient coinsurance: $152.00. Claim processes within 14–21 days of corrected submission.",

  steps: [
    {
      type: "problem",
      title: "Cystoscopy Billed for UTI — Medical Necessity Not Established",
      description: "Raymond Holbrook presented with gross hematuria — visible blood in urine — as the primary reason for cystoscopy. The billing system defaulted to N39.0 (UTI) from a prior encounter note, omitting the actual clinical indication that justified the procedure.",
    },
    {
      type: "rule",
      title: "AUA Guidelines — Primary Cystoscopy Indications",
      description: "The American Urological Association and commercial payers recognize gross/microscopic hematuria, suspected bladder tumor, recurrent UTIs (≥3/year), and obstructive voiding as primary indications for cystoscopy. A single uncomplicated UTI without additional clinical concern does not meet medical necessity criteria.",
    },
    {
      type: "rule",
      title: "CO-11 Auto-Denial: CPT/ICD-10 Clinical Mismatch",
      description: "Payer editing systems cross-reference CPT codes against ICD-10 codes using clinical logic tables. CPT 52000 (Cystoscopy) paired with N39.0 (UTI) triggers a CO-11 auto-denial when no additional supporting indication is present in the claim.",
    },
    {
      type: "fix",
      title: "Correct ICD-10 to R31.0 — Resubmit Corrected Claim",
      description: "Change N39.0 to R31.0 (Gross Hematuria). The operative note documents the patient's chief complaint of visible hematuria, which is the established clinical indication for the procedure. Resubmit as a corrected claim within BlueCross's 90-day corrected claim window.",
    },
    {
      type: "fix",
      title: "Prevention: Cystoscopy Billing Templates for Urology",
      description: "Configure the billing system's cystoscopy CPT template to present R31.0 (Gross Hematuria), N40.1 (BPH with LUTS), and R31.9 (Hematuria, Unspecified) as primary ICD-10 options — the most common cystoscopy indications. Prevent N39.0 from auto-populating for urology procedure codes.",
    },
    {
      type: "result",
      title: "Recovery: $380 Payable After Correction",
      description: "Corrected claim with R31.0 expected to process within 14–21 days. BlueCross payment: $228. Patient coinsurance: $152. Implement cystoscopy-specific diagnosis templates to prevent an estimated $760–$1,140/month in similar CO-11 denials across your urology practice.",
    },
  ],
};

// ─── Scenario 2: PSA Medical Necessity (Medicare) ─────────────────────────────

const S2_PSA_NECESSITY: DemoScenario = {
  id: "psa-medical-necessity",
  title: "PSA Test Denied — Medical Necessity Not Established",
  subtitle: "Medicare LCD requires prostate symptoms or elevated risk — Z00.00 (annual exam) not sufficient",
  regionId: "national",
  regionLabel: "National",
  specialty: "Urology",
  payerType: "Medicare",
  color: "orange",

  denialRiskScore: 82,
  riskLevel: "high",
  estimatedDelayDays: 45,
  financialImpact: 52,
  billedAmount: 52,

  prefill: {
    patient: "Walter Grossman",
    dob: "1948-03-07",
    insuranceId: "MCR-8812034",
    cpt: "84153",
    icd10: "Z00.00",
    payer: "Medicare",
    amount: "52.00",
    specialtyId: "urology",
  },

  beforeErrors: [
    {
      field: "icd10",
      severity: "error",
      title: "Medicare LCD — Diagnostic PSA Not Covered with Wellness Diagnosis",
      message: "CPT 84153 (PSA, Total) is billed with Z00.00 (General Adult Medical Examination) — a routine wellness diagnosis. Medicare's Local Coverage Determination (LCD L36012) covers diagnostic PSA (84153) for beneficiaries with symptoms of prostate disease or elevated risk. For annual preventive PSA screening, Medicare requires HCPCS code G0103 (Prostate Cancer Screening — PSA Test) with Z12.5 — not CPT 84153 with a wellness diagnosis.",
      suggestion: "For the Medicare Annual PSA Screening Benefit: bill HCPCS G0103 with Z12.5 (Encounter for Screening, Malignant Neoplasm of Prostate). For diagnostic PSA ordered due to urinary symptoms or abnormal DRE: use CPT 84153 with a qualifying diagnosis such as N40.1 (BPH with LUTS), R35.0 (Urinary Frequency), or R31.0 (Hematuria). Match the code choice to the documented clinical context.",
    },
    {
      field: "payer",
      severity: "info",
      title: "Medicare G0103 vs. CPT 84153 — The Annual PSA Billing Choice",
      message: "Medicare provides a separate once-per-year PSA screening benefit (G0103) at 100% coverage with $0 patient cost-sharing as a Part B preventive benefit. This is distinct from diagnostic PSA testing (CPT 84153). Billing diagnostic CPT 84153 for what is clinically a screening test results in denial, and may incorrectly shift cost-sharing to the patient.",
      suggestion: "Determine whether this PSA was ordered as part of annual wellness (G0103 + Z12.5) or in response to new urological symptoms (84153 + symptomatic diagnosis code). Document the clinical context clearly in the encounter note. Using the wrong code can also inadvertently trigger patient cost-sharing on a $0 benefit.",
    },
  ],

  payerResponseCode: "CO-50",
  payerResponseText: "DENIED — CO-50: These services are not medically necessary per payer policy for this diagnosis. Medicare LCD L36012: CPT 84153 (PSA) billed with Z00.00 (Annual Exam) does not meet medical necessity criteria. For annual PSA screening benefit, bill HCPCS G0103 with ICD-10 Z12.5. For diagnostic PSA, submit with a qualifying urological diagnosis.",

  afterCpt: "84153",
  afterIcd10: "N40.1",
  afterPayer: "Medicare",
  afterModifier: "",
  afterNote: "If diagnostic PSA due to BPH symptoms: use 84153 with N40.1. If annual screening benefit: use HCPCS G0103 with Z12.5.",
  afterExplanation: "If the PSA was ordered because the patient has documented BPH symptoms (frequency, nocturia, weak stream): bill CPT 84153 with N40.1 (BPH with Lower Urinary Tract Symptoms) — a qualifying diagnostic indication per LCD L36012. If this was an annual screening PSA for a male Medicare beneficiary age 50+, bill HCPCS G0103 with Z12.5 — covered at 100% under Part B preventive benefits.",
  afterReimbursement: 52,
  afterPayerResponse: "APPROVED (projected) — CPT 84153 with N40.1 (BPH with LUTS). Diagnostic PSA medical necessity established per LCD L36012. Medicare allowable: $38.50. Patient 20% coinsurance: $7.70. OR: G0103 + Z12.5 — Medicare Annual Screening Benefit, $0 patient cost-sharing.",

  steps: [
    {
      type: "problem",
      title: "PSA Billed as Diagnostic with Wellness Diagnosis",
      description: "Walter Grossman's PSA was ordered during a BPH monitoring visit. The billing system auto-populated Z00.00 (Annual Exam) from the encounter type flag, which does not meet Medicare's medical necessity standard for diagnostic PSA testing (CPT 84153).",
    },
    {
      type: "rule",
      title: "Medicare LCD L36012 — PSA Coverage Requirements",
      description: "Medicare requires one of the following for CPT 84153 (Diagnostic PSA) coverage: (1) documented urinary symptoms, (2) abnormal digital rectal exam, (3) known prostate pathology being monitored, or (4) prior elevated PSA requiring follow-up. Annual wellness visit (Z00.00) alone does not satisfy this requirement.",
    },
    {
      type: "rule",
      title: "G0103 vs. CPT 84153 — Two Separate Medicare PSA Benefits",
      description: "Medicare beneficiaries age 50+ are entitled to one annual PSA screening (G0103 + Z12.5) with 100% coverage and $0 patient cost-sharing under Part B preventive benefits. Diagnostic PSA (84153) requires a symptomatic or clinical indication. Using the wrong code for the clinical context results in denial and potentially incorrect patient billing.",
    },
    {
      type: "fix",
      title: "Match PSA Code to Documented Clinical Context",
      description: "Review the encounter note: if BPH symptoms or abnormal DRE was documented, bill 84153 with N40.1. If this was the annual screening PSA ordered as cancer surveillance for a 50+ male beneficiary, bill G0103 with Z12.5. The correction must match the documented reason for ordering.",
    },
    {
      type: "result",
      title: "Recovery: $52 Payable After Correction",
      description: "Corrected claim with appropriate diagnosis expected to process within 30 days. Prevention: add a Medicare PSA billing decision tree to the urology billing workflow — prompting the biller to confirm whether the order is diagnostic (84153) or screening (G0103) based on the documented clinical context.",
    },
  ],
};

// ─── Scenario 3: BPH Visit + Cystoscopy — Modifier -25 Missing ───────────────

const S3_MODIFIER_25_CYSTO: DemoScenario = {
  id: "bph-cysto-modifier-25",
  title: "E&M Bundled Into Cystoscopy — Modifier -25 Missing",
  subtitle: "99214 billed same day as cystoscopy without Modifier -25 — E&M absorbed into procedure",
  regionId: "national",
  regionLabel: "National",
  specialty: "Urology",
  payerType: "Commercial",
  color: "blue",

  denialRiskScore: 80,
  riskLevel: "high",
  estimatedDelayDays: 42,
  financialImpact: 220,
  billedAmount: 420,

  prefill: {
    patient: "Harold Pennington",
    dob: "1955-06-14",
    insuranceId: "UHC-4422891",
    cpt: "99214",
    icd10: "N40.1",
    payer: "UnitedHealthcare",
    amount: "420.00",
    specialtyId: "urology",
  },

  beforeErrors: [
    {
      field: "cpt",
      severity: "error",
      title: "Missing Modifier -25 — E&M Bundled Into Cystoscopy (52000)",
      message: "CPT 99214 (Established Patient E&M, Level 4) and CPT 52000 (Cystoscopy) were billed on the same date of service without Modifier -25 on the E&M code. UnitedHealthcare bundles the pre-procedure E&M evaluation into the cystoscopy payment under NCCI editing rules unless Modifier -25 is appended to certify that a separately identifiable evaluation and management service was performed.",
      suggestion: "Append Modifier -25 to CPT 99214 to indicate that a significant, separately identifiable E&M service was performed beyond the pre/post-operative work of the cystoscopy. The clinical note must document a distinct medical decision-making encounter — such as reviewing worsening LUTS symptoms, adjusting BPH medication, or discussing a new lab finding — separate from the cystoscopy consent and pre-procedure evaluation.",
    },
    {
      field: "cpt",
      severity: "info",
      title: "Documentation Requirement for Modifier -25 in Urology",
      message: "For urology procedures, the E&M note supporting Modifier -25 must contain: (1) a reason for the office visit that is distinct from the procedure indication, (2) history, exam, and medical decision-making that stand alone as an E&M service, and (3) the clinical decision to proceed with cystoscopy documented separately from the E&M visit itself.",
      suggestion: "Ensure the encounter note has a clearly delineated E&M section (chief complaint: worsening nocturia/frequency, BPH symptom review, AUA score, medication adjustment) and a separate procedure note (cystoscopy indication, consent, technique, findings). The two must be independently documented — not merged into a single combined note.",
    },
  ],

  payerResponseCode: "CO-97",
  payerResponseText: "DENIED — CO-97: Payment adjusted because the benefit for this service (99214) is included in the allowance for another service/procedure (52000 — Cystoscopy) billed on the same date of service. Modifier -25 absent on E&M service. If a separately identifiable evaluation was performed, resubmit CPT 99214 with Modifier -25 and supporting documentation.",

  afterCpt: "99214-25",
  afterIcd10: "N40.1",
  afterPayer: "UnitedHealthcare",
  afterModifier: "-25",
  afterNote: "Add Modifier -25 to CPT 99214 and ensure the encounter note documents a separately identifiable E&M distinct from the cystoscopy pre-procedure evaluation.",
  afterExplanation: "Resubmit CPT 99214-25 as a corrected claim. The encounter note must clearly document the separately identifiable evaluation: patient's worsening urinary frequency and nocturia, AUA symptom score review, BPH medication adjustment, and informed discussion about proceeding to cystoscopy for hematuria evaluation. These elements constitute a distinct E&M service independent of cystoscopy pre-procedure preparation.",
  afterReimbursement: 420,
  afterPayerResponse: "APPROVED (projected) — CPT 99214-25 + CPT 52000. UHC contracted rates: 99214 = $132.00, 52000 = $228.00. Total: $360.00. Patient coinsurance: $60.00. Claim processes within 14–21 days.",

  steps: [
    {
      type: "problem",
      title: "E&M Visit Bundled Into Cystoscopy Payment",
      description: "Harold Pennington presented for a BPH monitoring visit (worsening LUTS, AUA score review) during which diagnostic cystoscopy for hematuria was also performed. The E&M was submitted without Modifier -25, causing UHC to bundle the 99214 evaluation into the cystoscopy payment and deny it separately.",
    },
    {
      type: "rule",
      title: "NCCI Bundling — E&M with Same-Day Urology Procedure",
      description: "CMS NCCI editing and commercial payer bundling rules treat evaluation and management services as included in the global surgical package when billed on the same day as a procedure — unless Modifier -25 certifies a distinct, separately identifiable E&M service was performed beyond the pre/post-operative care inherent in the procedure.",
    },
    {
      type: "rule",
      title: "Modifier -25 Requirements for Urology Office Procedures",
      description: "The medical record must support both a distinct evaluation component (focused on BPH management, medication review, LUTS assessment) and a separate procedural component (cystoscopy indication, consent, technique). The two must be independently documented — a combined single note is not sufficient to support the -25 modifier.",
    },
    {
      type: "fix",
      title: "Append Modifier -25 and Resubmit",
      description: "Add Modifier -25 to CPT 99214. Confirm the encounter note contains a clearly separate E&M section documenting BPH symptom evaluation, AUA score, medication review, and clinical plan — independent of the cystoscopy procedure note. Both sections must stand alone as documentable services.",
    },
    {
      type: "result",
      title: "Recovery: $220 E&M Payment + Process Improvement",
      description: "Corrected claim expected to pay $132 (E&M) + $228 (cystoscopy) from UHC. Implement a pre-submission claim editing rule to auto-flag all E&M + same-day urology procedure combinations for Modifier -25 review. Estimated $440–$880/month in similar bundled-claim denials prevented across your urology practice.",
    },
  ],
};

// ─── Scenario 4: ESWL Missing Prior Authorization ─────────────────────────────

const S4_ESWL_NO_AUTH: DemoScenario = {
  id: "eswl-missing-prior-auth",
  title: "ESWL Prior Authorization Not Obtained",
  subtitle: "Extracorporeal shock wave lithotripsy performed without UHC authorization — $3,200 at risk",
  regionId: "national",
  regionLabel: "National",
  specialty: "Urology",
  payerType: "Commercial",
  color: "red",

  denialRiskScore: 92,
  riskLevel: "critical",
  estimatedDelayDays: 58,
  financialImpact: 3200,
  billedAmount: 3200,

  prefill: {
    patient: "Douglas Mackenzie",
    dob: "1963-11-02",
    insuranceId: "UHC-7711842",
    cpt: "50590",
    icd10: "N20.0",
    payer: "UnitedHealthcare",
    amount: "3200.00",
    specialtyId: "urology",
  },

  beforeErrors: [
    {
      field: "auth",
      severity: "error",
      title: "Prior Authorization Required — ESWL Not Authorized",
      message: "CPT 50590 (Lithotripsy, Extracorporeal Shock Wave — Kidney Stone) requires prior authorization from UnitedHealthcare for all non-emergency outpatient ESWL procedures. No authorization number appears on file for this claim. UHC will deny ESWL without a valid pre-service authorization regardless of medical necessity documentation.",
      suggestion: "Submit a Level 1 appeal within 90 days of denial with: (1) the operative report, (2) stone burden imaging (CT or KUB showing stone size and location), (3) pre-procedure clinical notes documenting stone size (>4mm) and symptom severity, and (4) a treating physician statement of medical necessity. Simultaneously, submit a retroactive authorization request to UHC.",
    },
    {
      field: "icd10",
      severity: "info",
      title: "Stone Specificity — Size and Location Improve Authorization Success",
      message: "N20.0 (Calculus of Kidney, Unspecified) is clinically correct but may be supplemented for authorization and appeal purposes. ESWL reviewers expect documentation of stone size (>4mm typically qualifying for treatment), stone location (proximal/distal ureter vs. renal pelvis), and laterality.",
      suggestion: "While ICD-10 N20.0 is appropriate, ensure the clinical record documents stone size on CT/KUB, laterality (right/left), and any failed conservative management (hydration, alpha-blockers, pain management). This documentation is critical for retroactive authorization review.",
    },
  ],

  payerResponseCode: "CO-197",
  payerResponseText: "DENIED — CO-197: Precertification/authorization absent for service. CPT 50590 (ESWL — Lithotripsy) requires prior authorization per UnitedHealthcare plan benefits. No authorization on file for date of service. Provider appeal rights: 90 days from denial date. Submit Level 1 appeal with complete clinical documentation.",

  afterCpt: "50590",
  afterIcd10: "N20.0",
  afterPayer: "UnitedHealthcare",
  afterModifier: "",
  afterNote: "Prior authorization must be obtained from UHC before ESWL. Submit retroactive auth + Level 1 appeal immediately with stone imaging and clinical documentation.",
  afterExplanation: "File an immediate Level 1 appeal with UHC — include the operative report, pre-procedure CT scan showing the stone burden, clinical notes documenting the indication for ESWL vs. conservative management, and a physician letter of medical necessity. Also submit a retroactive pre-service authorization request. UHC overturns approximately 35–42% of ESWL auth denials on first appeal when clinical documentation is complete.",
  afterReimbursement: 3200,
  afterPayerResponse: "APPEAL REQUIRED — Expected outcome with complete documentation: retroactive authorization review. UHC contracted rate for 50590: $1,920.00 (60%). Future ESWL: obtain auth 3–5 business days before scheduled procedure. Auth required for all elective lithotripsy procedures.",

  steps: [
    {
      type: "problem",
      title: "ESWL Performed Without Prior Authorization",
      description: "Douglas Mackenzie was scheduled for ESWL for a symptomatic 7mm right renal calculus. The procedure was performed as planned, but the prior authorization step was missed during the scheduling workflow. UHC denied the $3,200 claim on receipt.",
    },
    {
      type: "rule",
      title: "UHC Prior Authorization — ESWL Policy",
      description: "UnitedHealthcare requires pre-service authorization for all elective outpatient lithotripsy (CPT 50590) procedures. Authorization must be obtained and documented before the procedure is performed. Retroactive authorization requests are reviewed case-by-case and are not guaranteed.",
    },
    {
      type: "rule",
      title: "CO-197 — Authorization Absent",
      description: "CO-197 is issued when a service requiring pre-authorization was rendered without a valid authorization on file. Unlike coding errors, CO-197 denials require either retroactive auth approval or a successful appeal — resubmission alone will not result in payment.",
    },
    {
      type: "fix",
      title: "Submit Retroactive Authorization + Level 1 Appeal",
      description: "File both a retroactive authorization request (with CT imaging, operative report, and medical necessity statement) and a Level 1 formal appeal citing clinical necessity and the 7mm stone burden. Separate submissions to different UHC departments may be required. Track both with reference numbers.",
    },
    {
      type: "fix",
      title: "Prevention: Mandatory Pre-Auth Checkpoint for ESWL",
      description: "Add a mandatory prior authorization verification step to the ESWL scheduling workflow. No ESWL should be scheduled without an authorization number confirmed in the patient file. Create a 3-day scheduling buffer to allow for auth processing before the procedure date.",
    },
    {
      type: "result",
      title: "Recovery Path: Appeal + Retroactive Auth",
      description: "ESWL for a symptomatic 7mm stone is clearly medically necessary — the clinical case is strong. If Level 1 appeal is denied, escalate to Level 2 or external independent review. Prevent future ESWL auth misses by implementing a mandatory auth confirmation in the scheduling workflow — preventing $3,200–$6,400/quarter in similar denials.",
    },
  ],
};

// ─── Scenario 5: CT Urogram — Authorization Not Verified ─────────────────────

const S5_CT_UROGRAM_AUTH: DemoScenario = {
  id: "ct-urogram-no-auth",
  title: "CT Urogram Submitted Without Authorization",
  subtitle: "Hematuria workup CT without Aetna prior auth — CO-197 denial, $890 at risk",
  regionId: "national",
  regionLabel: "National",
  specialty: "Urology",
  payerType: "Commercial",
  color: "amber",

  denialRiskScore: 74,
  riskLevel: "high",
  estimatedDelayDays: 38,
  financialImpact: 890,
  billedAmount: 890,

  prefill: {
    patient: "Frederick Abernathy",
    dob: "1961-04-30",
    insuranceId: "AET-6632810",
    cpt: "74177",
    icd10: "R31.0",
    payer: "Aetna",
    amount: "890.00",
    specialtyId: "urology",
  },

  beforeErrors: [
    {
      field: "auth",
      severity: "error",
      title: "Aetna Prior Authorization Required for CT Urogram (Hematuria Workup)",
      message: "CPT 74177 (CT Abdomen/Pelvis with Contrast) ordered as a CT Urogram for hematuria workup requires prior authorization from Aetna under most commercial and Aetna/CVS Health plan designs. CT Urogram is specifically listed on Aetna's radiology prior authorization list for outpatient urology imaging. Authorization must be requested and approved before imaging is performed.",
      suggestion: "If the imaging has already been performed: submit a retroactive authorization request to Aetna with the ordering urologist's documentation of gross/microscopic hematuria, clinical findings, and the AUA hematuria guideline citation. Simultaneously file a Level 1 appeal. If the imaging is planned: obtain authorization before scheduling.",
    },
    {
      field: "icd10",
      severity: "info",
      title: "Hematuria Specificity Aids Authorization and Medical Necessity Review",
      message: "R31.0 (Gross Hematuria) is the correct primary diagnosis for CT urogram in a hematuria workup. For authorization purposes, document whether this is initial gross hematuria, recurrent hematuria, or microscopic hematuria on urinalysis with a specific cell count. AUA guidelines distinguish between gross and microscopic hematuria thresholds for imaging referral.",
      suggestion: "If the patient had microscopic hematuria (>3 RBCs/hpf on two of three properly performed urinalyses), consider R31.1 (Benign Essential Microscopic Hematuria) or R31.9 (Hematuria, Unspecified). For gross hematuria, R31.0 is correct. Specificity strengthens the authorization request and reduces audit risk.",
    },
  ],

  payerResponseCode: "CO-197",
  payerResponseText: "DENIED — CO-197: Precertification/authorization absent. CPT 74177 (CT Abdomen/Pelvis) for hematuria evaluation requires prior authorization per Aetna Radiology Management guidelines. No authorization on file. Appeal rights: 180 days from denial date. Submit Level 1 appeal with clinical necessity documentation.",

  afterCpt: "74177",
  afterIcd10: "R31.0",
  afterPayer: "Aetna",
  afterModifier: "",
  afterNote: "Obtain Aetna prior authorization before performing CT urogram in all hematuria workups. Submit retroactive auth + appeal for this claim.",
  afterExplanation: "For this claim: submit a retroactive authorization request to Aetna Radiology Management with the urologist's referral, clinical note documenting gross hematuria, and AUA hematuria guideline citation. Aetna reviews retroactive radiology auths within 5–10 business days. If denied retroactively, file a Level 1 appeal citing clinical necessity per AUA guidelines.",
  afterReimbursement: 890,
  afterPayerResponse: "RETROSPECTIVE REVIEW REQUIRED — If retroactive auth approved: Aetna contracted rate for 74177 = $534 (60%). If denied: Level 1 appeal with attending physician letter and AUA guidelines has approximately 55% success rate. Prevention: integrate Aetna's auth portal into the radiology order workflow.",

  steps: [
    {
      type: "problem",
      title: "CT Urogram Performed Without Aetna Authorization",
      description: "Frederick Abernathy presented with gross hematuria. The urologist ordered a CT urogram (74177) for hematuria workup per AUA guidelines. The imaging center performed the study without verifying Aetna authorization. Aetna denied on receipt as CO-197.",
    },
    {
      type: "rule",
      title: "Aetna Radiology Management — CT Urogram Authorization",
      description: "Aetna requires prior authorization for CT Abdomen/Pelvis (74177/74178) when used as CT Urogram in urology practices. This policy applies across Aetna commercial, Aetna/CVS integrated health, and Aetna Medicare Advantage plans. Authorization requests are reviewed by Aetna's radiology benefit manager (typically eviCore or Carelon Radiology).",
    },
    {
      type: "rule",
      title: "AUA Hematuria Guidelines vs. Payer Auth Requirements",
      description: "AUA guidelines recommend CT urogram as first-line upper tract imaging for all patients with gross hematuria. However, following clinical guidelines does not substitute for payer prior authorization — both must be satisfied for a claim to be payable without appeal. Medical necessity and auth requirements are independent obligations.",
    },
    {
      type: "fix",
      title: "Retroactive Authorization + Level 1 Appeal",
      description: "Submit a retroactive auth request to Aetna's radiology management team with: ordering note, hematuria documentation, AUA guideline reference, and imaging report. Simultaneously file a Level 1 appeal documenting that the ordering provider had no prior notification that authorization was required for this specific study.",
    },
    {
      type: "result",
      title: "$890 Recovery Path Through Appeal",
      description: "Retroactive auth approval rate for hematuria CT urogram is approximately 55–65% with complete documentation. Implement an outgoing order integration between the EHR and Aetna's auth portal so that all CT/MRI orders trigger automatic auth verification before the study is scheduled.",
    },
  ],
};

// ─── Scenario 6: Catheter Insertion — Wrong Diagnosis Code ───────────────────

const S6_CATHETER_DX: DemoScenario = {
  id: "catheter-wrong-diagnosis",
  title: "Catheter Insertion — Diagnosis Does Not Establish Medical Necessity",
  subtitle: "Foley catheter billed with post-procedure care code instead of urinary retention diagnosis",
  regionId: "national",
  regionLabel: "National",
  specialty: "Urology",
  payerType: "Medicare",
  color: "violet",

  denialRiskScore: 72,
  riskLevel: "high",
  estimatedDelayDays: 35,
  financialImpact: 145,
  billedAmount: 145,

  prefill: {
    patient: "Clarence Hoffmeister",
    dob: "1945-09-23",
    insuranceId: "MCR-3317829",
    cpt: "51702",
    icd10: "Z48.89",
    payer: "Medicare",
    amount: "145.00",
    specialtyId: "urology",
  },

  beforeErrors: [
    {
      field: "icd10",
      severity: "error",
      title: "Post-Procedure Aftercare Code Does Not Justify Urethral Catheterization",
      message: "CPT 51702 (Insertion of Temporary Indwelling Bladder Catheter, Simple) is billed with Z48.89 (Encounter for Other Postprocedural Aftercare). This aftercare code does not establish medical necessity for catheter insertion. Medicare requires a diagnosis that directly indicates the clinical need for catheterization — such as urinary retention (R33.9), neurogenic bladder, or BPH-related obstruction.",
      suggestion: "Replace Z48.89 with R33.9 (Retention of Urine, Unspecified) or R33.8 (Other Retention of Urine) if the patient required catheterization due to urinary retention. If the catheter was placed post-operatively due to TURP or prostatectomy recovery causing retention, document the specific post-op retention indication — not the generic aftercare code.",
    },
    {
      field: "cpt",
      severity: "info",
      title: "Catheter Management Codes Require Retention or Obstruction Documentation",
      message: "Medicare requires catheterization CPT codes (51701–51703) to be supported by documentation of: (1) the specific clinical indication (retention, obstruction, inability to void), (2) volume of residual urine if measured by bladder scan, and (3) catheter type and size used. Generic aftercare codes without these elements trigger medical necessity review.",
      suggestion: "Document in the encounter note: presenting complaint of inability to void, bladder scan residual volume (e.g., 480 mL), catheter type (e.g., 16Fr Foley), and clinical disposition (indwelling vs. straight catheterization). This documentation supports medical necessity independently of the ICD-10 code selected.",
    },
  ],

  payerResponseCode: "CO-50",
  payerResponseText: "DENIED — CO-50: These services are not medically necessary as billed. Z48.89 (Postprocedural Aftercare) does not establish clinical necessity for CPT 51702 (Indwelling Bladder Catheter Insertion). A qualifying diagnosis and supporting documentation are required. Please resubmit with the specific indication for catheterization.",

  afterCpt: "51702",
  afterIcd10: "R33.9",
  afterPayer: "Medicare",
  afterModifier: "",
  afterNote: "Replace Z48.89 with R33.9 (Retention of Urine) — the actual clinical indication for catheter insertion.",
  afterExplanation: "Change Z48.89 to R33.9 (Retention of Urine, Unspecified). The clinical documentation shows the patient was unable to void and had 480 mL of retained urine on bladder scan — clear medical necessity for catheter insertion. Resubmit as a corrected claim with the bladder scan result as supporting documentation.",
  afterReimbursement: 145,
  afterPayerResponse: "APPROVED (projected) — CPT 51702 with R33.9 (Retention of Urine). Medicare medical necessity established. Medicare allowable: $89.50. Patient 20% coinsurance: $17.90. Claim processes within 14 days.",

  steps: [
    {
      type: "problem",
      title: "Generic Aftercare Diagnosis Selected Instead of Retention",
      description: "Clarence Hoffmeister presented in urinary retention following TURP recovery — unable to void with 480 mL residual on bladder scan. Catheterization was clinically necessary. The billing system defaulted to Z48.89 (General Post-Procedure Care) from the encounter template rather than capturing the retention indication.",
    },
    {
      type: "rule",
      title: "Medicare Medical Necessity — Catheter Insertion Coverage",
      description: "Medicare covers urethral catheter insertion (51701–51703) when there is documented medical necessity: urinary retention, obstruction, or inability to void. The ICD-10 code must reflect the clinical reason the catheter was inserted — not a generic post-procedure code.",
    },
    {
      type: "rule",
      title: "Z-Codes as Primary vs. Secondary Diagnosis",
      description: "Z48.89 (Post-Procedural Aftercare) is a valid secondary diagnosis but is insufficient as the sole primary diagnosis to justify an interventional procedure like catheter insertion. The primary ICD-10 must reflect the active pathological condition driving the intervention.",
    },
    {
      type: "fix",
      title: "Change Primary ICD-10 to R33.9 — Resubmit",
      description: "Replace Z48.89 with R33.9 (Retention of Urine, Unspecified) or the more specific code if documented. Keep Z48.89 as a secondary diagnosis. Attach the bladder scan result showing 480 mL residual to the corrected claim as supporting documentation.",
    },
    {
      type: "result",
      title: "Recovery: $145 Payable After Correction",
      description: "Corrected claim expected to process within 14 days. Prevention: update catheter insertion billing templates to default to R33.9 or N40.1 depending on clinical context. Train urology billing staff to capture the specific retention indication rather than generic aftercare codes — preventing similar denials monthly.",
    },
  ],
};

// ─── Scenario 7: Urodynamic Testing — No Authorization ───────────────────────

const S7_URODYNAMICS_AUTH: DemoScenario = {
  id: "urodynamics-no-auth",
  title: "Urodynamic Testing — Prior Authorization Not Obtained",
  subtitle: "Complex cystometrogram (51726) performed without BlueCross authorization — $580 denied",
  regionId: "national",
  regionLabel: "National",
  specialty: "Urology",
  payerType: "Commercial",
  color: "orange",

  denialRiskScore: 86,
  riskLevel: "high",
  estimatedDelayDays: 48,
  financialImpact: 580,
  billedAmount: 580,

  prefill: {
    patient: "Loretta Yamamoto",
    dob: "1962-07-15",
    insuranceId: "BCB-9920341",
    cpt: "51726",
    icd10: "N39.46",
    payer: "BlueCross BlueShield",
    amount: "580.00",
    specialtyId: "urology",
  },

  beforeErrors: [
    {
      field: "auth",
      severity: "error",
      title: "BlueCross Prior Authorization Required for Urodynamic Testing",
      message: "CPT 51726 (Complex Cystometrogram — Urodynamic Testing) requires prior authorization from BlueCross BlueShield under most commercial plan designs. Urodynamic studies are subject to specialty procedure management review to confirm clinical necessity before scheduling. No authorization number appears on file for this claim.",
      suggestion: "File a Level 1 appeal with: (1) the urologist's clinical note documenting incontinence severity and failed conservative management (pelvic floor PT, bladder training), (2) the specific urodynamic testing indication per AUA/SUFU guidelines, and (3) the urodynamic study results. Also submit a retroactive authorization request to BlueCross's specialty procedure review team.",
    },
    {
      field: "icd10",
      severity: "info",
      title: "Mixed Incontinence — Documentation of Conservative Treatment Failure Required",
      message: "N39.46 (Mixed Urinary Incontinence) is the correct diagnosis for urodynamic testing in this clinical context. However, BlueCross prior authorization reviewers require documentation of: (1) symptom duration and severity, (2) failed pelvic floor physical therapy (typically 6–12 weeks required before auth), and (3) the specific clinical question the urodynamics will answer.",
      suggestion: "Ensure the urologist's note documents: incontinence duration (e.g., 18 months), severity (e.g., 3–4 leakage episodes/day, 2–3 pads/day), prior conservative treatments attempted and failed, and the specific diagnostic question for urodynamic testing (stress vs. urge vs. detrusor overactivity). This documentation is the key to auth and appeal success.",
    },
  ],

  payerResponseCode: "CO-197",
  payerResponseText: "DENIED — CO-197: Precertification/authorization absent. CPT 51726 (Complex Urodynamic Study) requires prior authorization per BlueCross BlueShield specialty procedure policy. No authorization on file. Submit Level 1 appeal with clinical necessity documentation within 180 days of this denial.",

  afterCpt: "51726",
  afterIcd10: "N39.46",
  afterPayer: "BlueCross BlueShield",
  afterModifier: "",
  afterNote: "Obtain BlueCross prior authorization before scheduling urodynamic testing. Submit retroactive auth + appeal for this claim with failed PT documentation.",
  afterExplanation: "File a Level 1 appeal with BlueCross including: the urologist's clinical note, documentation of 6+ weeks of failed pelvic floor PT, AUA/SUFU guideline reference supporting urodynamics for mixed incontinence, and the study results showing detrusor overactivity. BlueCross overturns approximately 48% of urodynamic auth denials on first appeal with conservative treatment failure documentation.",
  afterReimbursement: 580,
  afterPayerResponse: "APPEAL PENDING — Expected outcome: approval probable with failed PT documentation and AUA guideline citation. BlueCross contracted rate for 51726: $348.00 (60%). Patient coinsurance: $232.00. Future urodynamics: verify authorization 5–7 business days before procedure date.",

  steps: [
    {
      type: "problem",
      title: "Urodynamic Study Performed Without Prior Authorization",
      description: "Loretta Yamamoto was evaluated for mixed urinary incontinence. The urologist ordered urodynamic testing (51726) to differentiate stress vs. urge predominance before recommending surgical intervention. The study was performed without verifying BlueCross authorization.",
    },
    {
      type: "rule",
      title: "BlueCross Prior Authorization — Urodynamic Testing Policy",
      description: "BlueCross BlueShield requires pre-service authorization for complex urodynamic testing (51726, 51727) across most commercial plan designs. Authorization requests must demonstrate: documented incontinence diagnosis, severity, duration, and conservative treatment failure before testing is approved.",
    },
    {
      type: "rule",
      title: "AUA/SUFU Urodynamics Appropriateness Criteria",
      description: "Per AUA/SUFU joint guidelines, urodynamic testing is appropriate before surgery for incontinence or when the clinical diagnosis is uncertain. Commercial payers use these guidelines in their auth criteria — demonstrating alignment with AUA appropriateness criteria significantly strengthens authorization and appeal outcomes.",
    },
    {
      type: "fix",
      title: "Appeal with Conservative Treatment Failure Documentation",
      description: "Submit Level 1 appeal with: (1) 6-week pelvic floor PT record, (2) clinical notes documenting incontinence progression, (3) AUA/SUFU guideline citation, and (4) urodynamic results showing detrusor overactivity. This package demonstrates both failed conservative care and clinical necessity for the study.",
    },
    {
      type: "result",
      title: "Recovery: $580 Appeal Outcome Likely Favorable",
      description: "With complete documentation, appeal success rate for urodynamic studies is approximately 48%. Prevent future misses by adding urodynamic studies to the scheduling system's auth-required procedure list with a 7-day lead time for authorization verification. One prevented denial per month = $580–$720 saved.",
    },
  ],
};

// ─── Scenario 8: Prostate Biopsy — PSA Not Documented ────────────────────────

const S8_BIOPSY_NECESSITY: DemoScenario = {
  id: "prostate-biopsy-medical-necessity",
  title: "Prostate Biopsy — Elevated PSA Not Captured in Claim",
  subtitle: "55700 submitted with benign prostate code — medical necessity unclear to payer",
  regionId: "national",
  regionLabel: "National",
  specialty: "Urology",
  payerType: "Commercial",
  color: "emerald",

  denialRiskScore: 68,
  riskLevel: "high",
  estimatedDelayDays: 32,
  financialImpact: 890,
  billedAmount: 890,

  prefill: {
    patient: "Norman Sinclair",
    dob: "1953-01-28",
    insuranceId: "CIG-2241897",
    cpt: "55700",
    icd10: "D29.1",
    payer: "Cigna",
    amount: "890.00",
    specialtyId: "urology",
  },

  beforeErrors: [
    {
      field: "icd10",
      severity: "error",
      title: "Benign Prostate Code Does Not Establish Biopsy Medical Necessity",
      message: "CPT 55700 (Prostate Needle Biopsy) is billed with D29.1 (Benign Neoplasm of Prostate). This diagnosis does not communicate the clinical urgency or specific indication for biopsy. Cigna's clinical coverage policy for prostate biopsy (55700) requires documentation of elevated PSA (typically >4.0 ng/mL), abnormal digital rectal exam (DRE), suspicious lesion on MRI (PI-RADS ≥3), or rising PSA trend. D29.1 (Benign Neoplasm) suggests a known benign lesion — not the elevated-risk finding that necessitates invasive biopsy.",
      suggestion: "Use R97.20 (Elevated Prostate Specific Antigen [PSA]) as the primary diagnosis if PSA > 4.0 ng/mL was the indication for biopsy. If an abnormal DRE or suspicious MRI finding (PI-RADS 3+) was also a factor, document these in the operative note and add them as secondary diagnoses. The ICD-10 must clearly convey the clinical indication driving the decision to perform an invasive tissue sample.",
    },
    {
      field: "cpt",
      severity: "warning",
      title: "Cigna May Require Prior Authorization for Prostate Biopsy",
      message: "Cigna requires prior authorization for prostate biopsy (55700) under some commercial plan designs — particularly for MRI-targeted (fusion) biopsies or repeated biopsy procedures. Verify whether an authorization was obtained before the procedure.",
      suggestion: "Check the patient's specific Cigna plan benefits for prostate biopsy authorization requirements. For initial biopsies with PSA > 4.0 ng/mL and abnormal DRE, most Cigna plans cover without auth. For MRI-fusion biopsy (55706) or saturation biopsy, authorization is more commonly required.",
    },
  ],

  payerResponseCode: "CO-50",
  payerResponseText: "DENIED — CO-50: Service not medically necessary as billed. D29.1 (Benign Neoplasm of Prostate) does not meet Cigna Clinical Policy Bulletin criteria for prostate needle biopsy (55700). Documentation of elevated PSA (>4.0 ng/mL), abnormal DRE, or PI-RADS ≥3 MRI finding is required. Please resubmit with the specific biopsy indication.",

  afterCpt: "55700",
  afterIcd10: "R97.20",
  afterPayer: "Cigna",
  afterModifier: "",
  afterNote: "Replace D29.1 with R97.20 (Elevated PSA) — the primary clinical indication for prostate biopsy. Attach PSA lab result as supporting documentation.",
  afterExplanation: "Replace D29.1 with R97.20 (Elevated Prostate Specific Antigen [PSA]) — the patient's PSA was 7.8 ng/mL, well above the 4.0 ng/mL threshold that clinically indicated biopsy. This diagnosis directly communicates the medical necessity for invasive tissue sampling and aligns with Cigna's Clinical Policy Bulletin for prostate biopsy coverage. Resubmit as a corrected claim with the PSA lab result attached.",
  afterReimbursement: 890,
  afterPayerResponse: "APPROVED (projected) — CPT 55700 with R97.20 (Elevated PSA, 7.8 ng/mL). Medical necessity established per Cigna Clinical Policy Bulletin: PSA > 4.0 ng/mL with documented clinical evaluation. Cigna contracted rate: $534.00 (60%). Patient coinsurance: $356.00. Claim processes within 14–21 days.",

  steps: [
    {
      type: "problem",
      title: "Biopsy Indication Not Communicated in ICD-10 Code",
      description: "Norman Sinclair's PSA was 7.8 ng/mL — significantly elevated — prompting prostate biopsy. The billing system selected D29.1 (Benign Neoplasm of Prostate) from a prior encounter where a benign nodule was documented. The elevated PSA that actually necessitated the current biopsy was not captured in the claim.",
    },
    {
      type: "rule",
      title: "Cigna Clinical Policy — Prostate Biopsy Medical Necessity Criteria",
      description: "Cigna's prostate biopsy coverage policy requires the claim to reflect one or more qualifying indications: PSA > 4.0 ng/mL (or > 2.5 ng/mL in high-risk patients), PSA velocity > 0.75 ng/mL/year, abnormal digital rectal exam, or suspicious MRI findings (PI-RADS 3+). D29.1 alone satisfies none of these criteria.",
    },
    {
      type: "rule",
      title: "R97.20 — Elevated PSA as the Primary Biopsy Indication",
      description: "ICD-10 code R97.20 (Elevated Prostate Specific Antigen [PSA]) directly communicates the lab-confirmed elevated marker that clinically warranted the biopsy. This code is payer-recognized as a primary indication for CPT 55700 and aligns with published urology clinical guidelines.",
    },
    {
      type: "fix",
      title: "Replace D29.1 with R97.20 — Attach PSA Lab Result",
      description: "Change the primary ICD-10 to R97.20 and attach the lab report showing PSA = 7.8 ng/mL as supporting documentation. The lab result provides objective evidence that the medical necessity threshold was met. Resubmit as a corrected claim within Cigna's 90-day corrected claim window.",
    },
    {
      type: "fix",
      title: "Prevention: Prostate Biopsy Billing Template with PSA Flag",
      description: "Create a billing template for CPT 55700 that prompts the biller to enter the specific biopsy indication: PSA value (R97.20), DRE findings, or MRI PI-RADS score. Auto-flag 55700 claims where only D29.1 or N40.x appears without R97.20 or a malignancy code.",
    },
    {
      type: "result",
      title: "Recovery: $890 Payable With Correct ICD-10",
      description: "Corrected claim with R97.20 and PSA lab documentation expected to pay within 14–21 days. Cigna payment: $534. Patient coinsurance: $356. Implement prostate biopsy coding templates to ensure the PSA elevation code appears on every biopsy claim where PSA was the driving indication — preventing $890–$1,780/month in similar denials.",
    },
  ],
};

// ─── UI Config Maps ───────────────────────────────────────────────────────────

export const RISK_CONFIG: Record<RiskLevel, {
  bar: string; badge: string; badgeText: string; dot: string; label: string;
}> = {
  critical: { bar: "bg-red-500",    badge: "bg-red-100",    badgeText: "text-red-700",    dot: "bg-red-500",    label: "Critical" },
  high:     { bar: "bg-orange-500", badge: "bg-orange-100", badgeText: "text-orange-700", dot: "bg-orange-500", label: "High"     },
  medium:   { bar: "bg-amber-400",  badge: "bg-amber-100",  badgeText: "text-amber-700",  dot: "bg-amber-400",  label: "Medium"   },
  low:      { bar: "bg-emerald-500",badge: "bg-emerald-100",badgeText: "text-emerald-700",dot: "bg-emerald-500",label: "Low"      },
};

export const SCENARIO_COLOR_CONFIG: Record<ScenarioColor, {
  border: string; bg: string; heading: string; text: string;
}> = {
  red:     { border: "border-red-400",     bg: "bg-red-50",     heading: "text-red-700",     text: "text-red-600"     },
  orange:  { border: "border-orange-400",  bg: "bg-orange-50",  heading: "text-orange-700",  text: "text-orange-600"  },
  amber:   { border: "border-amber-400",   bg: "bg-amber-50",   heading: "text-amber-700",   text: "text-amber-600"   },
  violet:  { border: "border-violet-400",  bg: "bg-violet-50",  heading: "text-violet-700",  text: "text-violet-600"  },
  blue:    { border: "border-blue-400",    bg: "bg-blue-50",    heading: "text-blue-700",    text: "text-blue-600"    },
  emerald: { border: "border-emerald-400", bg: "bg-emerald-50", heading: "text-emerald-700", text: "text-emerald-600" },
};

export const STEP_CONFIG: Record<WalkthroughStep["type"], {
  border: string; bg: string; text: string; line: string; icon: string;
}> = {
  problem: { border: "border-red-400",     bg: "bg-red-50",     text: "text-red-600",     line: "bg-red-200",     icon: "!" },
  rule:    { border: "border-amber-400",   bg: "bg-amber-50",   text: "text-amber-600",   line: "bg-amber-200",   icon: "R" },
  fix:     { border: "border-blue-400",    bg: "bg-blue-50",    text: "text-blue-600",    line: "bg-blue-200",    icon: "F" },
  result:  { border: "border-emerald-400", bg: "bg-emerald-50", text: "text-emerald-600", line: "bg-emerald-200", icon: "✓" },
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const DEMO_SCENARIOS: DemoScenario[] = [
  S1_CYSTO_MISMATCH,
  S2_PSA_NECESSITY,
  S3_MODIFIER_25_CYSTO,
  S4_ESWL_NO_AUTH,
  S5_CT_UROGRAM_AUTH,
  S6_CATHETER_DX,
  S7_URODYNAMICS_AUTH,
  S8_BIOPSY_NECESSITY,
];
