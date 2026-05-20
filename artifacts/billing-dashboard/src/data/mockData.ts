export type ClaimStatus =
  | "Draft"
  | "Scrubbed"
  | "Submitted"
  | "Pending"
  | "Denied"
  | "Corrected"
  | "Resubmitted"
  | "Approved"
  | "Paid";

export interface TimelineEvent {
  id: string;
  status: ClaimStatus;
  timestamp: string;
  note: string;
  actor?: string;
}

export interface Claim {
  id: string;
  patient: string;
  dob: string;
  insuranceId: string;
  cpt: string;
  cptDescription?: string;
  icd10: string;
  icd10Description?: string;
  payer: string;
  specialty?: string;
  amount: number;
  status: ClaimStatus;
  submittedAt: string;
  createdAt?: string;
  rejectionReason?: string;
  denialCode?: string;
  scrubScore?: number;
  scrubErrorCount?: number;
  scrubWarningCount?: number;
  timeline?: TimelineEvent[];
}

export const INITIAL_CLAIMS: Claim[] = [
  {
    id: "CLM-2024-001", patient: "Robert J. Hadley", dob: "1951-03-14", insuranceId: "MCR-4821039",
    cpt: "99214", cptDescription: "Office visit, established patient, mod complexity",
    icd10: "N40.1", icd10Description: "Benign prostatic hyperplasia with LUTS",
    payer: "Medicare", specialty: "BPH / LUTS Management", amount: 220.00,
    status: "Paid", submittedAt: "2024-05-20T08:14:00Z", createdAt: "2024-05-18T09:00:00Z",
    scrubScore: 92, scrubErrorCount: 0, scrubWarningCount: 0,
    timeline: [
      { id: "e1a", status: "Scrubbed",  timestamp: "2024-05-18T09:10:00Z", note: "AI scrub passed. Health score 92/100. No errors.", actor: "ClaimFlow AI" },
      { id: "e1b", status: "Submitted", timestamp: "2024-05-20T08:14:00Z", note: "837P submitted via Availity. ACK-2024-00441.", actor: "Marcus Torres" },
      { id: "e1c", status: "Pending",   timestamp: "2024-05-20T11:00:00Z", note: "Medicare entered standard adjudication queue." },
      { id: "e1d", status: "Approved",  timestamp: "2024-05-28T14:30:00Z", note: "Approved. ERA/835 received. Contracted rate applied.", actor: "Medicare" },
      { id: "e1e", status: "Paid",      timestamp: "2024-06-02T08:00:00Z", note: "EFT deposited $171.60. Patient balance $48.40.", actor: "Medicare EFT" },
    ],
  },
  {
    id: "CLM-2024-002", patient: "Marcus D. Thornton", dob: "1960-07-22", insuranceId: "BCB-9932871",
    cpt: "52000", cptDescription: "Cystoscopy, diagnostic",
    icd10: "R31.0", icd10Description: "Gross hematuria",
    payer: "BlueCross", specialty: "Hematuria Workup", amount: 380.00,
    status: "Approved", submittedAt: "2024-05-20T09:30:00Z", createdAt: "2024-05-19T10:00:00Z",
    scrubScore: 89, scrubErrorCount: 0, scrubWarningCount: 1,
    timeline: [
      { id: "e2a", status: "Scrubbed",  timestamp: "2024-05-19T10:05:00Z", note: "AI scrub: 1 warning (modifier -59 recommended). Score 89/100.", actor: "ClaimFlow AI" },
      { id: "e2b", status: "Submitted", timestamp: "2024-05-20T09:30:00Z", note: "837P submitted. ACK-2024-00442.", actor: "Anita Patel" },
      { id: "e2c", status: "Pending",   timestamp: "2024-05-20T12:00:00Z", note: "BlueCross entered adjudication." },
      { id: "e2d", status: "Approved",  timestamp: "2024-06-01T10:00:00Z", note: "Approved. ERA received.", actor: "BlueCross" },
    ],
  },
  {
    id: "CLM-2024-003", patient: "Vincent K. Esposito", dob: "1948-11-03", insuranceId: "MCR-7761234",
    cpt: "84153", cptDescription: "PSA total",
    icd10: "Z00.00", icd10Description: "Encounter for general adult medical examination",
    payer: "Medicare", specialty: "Prostate Cancer Screening", amount: 52.00,
    status: "Denied", submittedAt: "2024-05-21T10:05:00Z", createdAt: "2024-05-20T08:00:00Z",
    rejectionReason: "CO-50: Diagnosis not covered for this service", denialCode: "CO-50",
    scrubScore: 38, scrubErrorCount: 2, scrubWarningCount: 1,
    timeline: [
      { id: "e3a", status: "Scrubbed",  timestamp: "2024-05-20T08:10:00Z", note: "AI scrub flagged 2 errors: Z00.00 invalid for PSA billing. Use Z12.5 + G0103. Score 38/100.", actor: "ClaimFlow AI" },
      { id: "e3b", status: "Submitted", timestamp: "2024-05-21T10:05:00Z", note: "Submitted with errors unresolved. ACK-2024-00528.", actor: "Marcus Torres" },
      { id: "e3c", status: "Pending",   timestamp: "2024-05-21T12:00:00Z", note: "Medicare entered adjudication." },
      { id: "e3d", status: "Denied",    timestamp: "2024-06-03T09:00:00Z", note: "CO-50: PSA billed with wellness diagnosis. Use G0103 for Medicare screening.", actor: "Medicare" },
    ],
  },
  {
    id: "CLM-2024-004", patient: "Earl T. Patterson", dob: "1963-01-30", insuranceId: "MCR-5548907",
    cpt: "50590", cptDescription: "Extracorporeal shock wave lithotripsy (ESWL)",
    icd10: "N20.0", icd10Description: "Calculus of kidney",
    payer: "Medicare", specialty: "Kidney Stone Care", amount: 3200.00,
    status: "Paid", submittedAt: "2024-05-21T11:22:00Z", createdAt: "2024-05-20T07:30:00Z",
    scrubScore: 95, scrubErrorCount: 0, scrubWarningCount: 0,
    timeline: [
      { id: "e4a", status: "Scrubbed",  timestamp: "2024-05-20T07:35:00Z", note: "AI scrub passed. All checks clear. Score 95/100.", actor: "ClaimFlow AI" },
      { id: "e4b", status: "Submitted", timestamp: "2024-05-21T11:22:00Z", note: "837P submitted. ACK-2024-00529.", actor: "Anita Patel" },
      { id: "e4c", status: "Pending",   timestamp: "2024-05-21T14:00:00Z", note: "Medicare adjudication queue." },
      { id: "e4d", status: "Approved",  timestamp: "2024-06-05T10:00:00Z", note: "Approved. ERA received.", actor: "Medicare" },
      { id: "e4e", status: "Paid",      timestamp: "2024-06-10T08:00:00Z", note: "EFT deposited $2,496.00. Patient balance $704.00.", actor: "Medicare EFT" },
    ],
  },
  {
    id: "CLM-2024-005", patient: "Harold S. Kimura", dob: "1957-06-18", insuranceId: "AET-3310045",
    cpt: "55700", cptDescription: "Prostate biopsy, needle",
    icd10: "N40.1", icd10Description: "Benign prostatic hyperplasia with LUTS",
    payer: "Aetna", specialty: "BPH / LUTS Management", amount: 890.00,
    status: "Pending", submittedAt: "2024-05-22T08:55:00Z", createdAt: "2024-05-21T09:00:00Z",
    scrubScore: 74, scrubErrorCount: 0, scrubWarningCount: 1,
    timeline: [
      { id: "e5a", status: "Scrubbed",  timestamp: "2024-05-21T09:05:00Z", note: "1 warning: D29.1 recommended alongside N40.1. Score 74/100.", actor: "ClaimFlow AI" },
      { id: "e5b", status: "Submitted", timestamp: "2024-05-22T08:55:00Z", note: "Submitted. ACK-2024-00530.", actor: "Marcus Torres" },
      { id: "e5c", status: "Pending",   timestamp: "2024-05-22T11:00:00Z", note: "Aetna processing. Est. adjudication: 14–21 days." },
    ],
  },
  {
    id: "CLM-2024-006", patient: "George M. Nakamura", dob: "1948-09-05", insuranceId: "MCR-1192038",
    cpt: "52601", cptDescription: "TURP, complete (electrosurgical)",
    icd10: "N40.1", icd10Description: "Benign prostatic hyperplasia with LUTS",
    payer: "Medicare", specialty: "BPH / LUTS Management", amount: 2850.00,
    status: "Corrected", submittedAt: "2024-05-22T13:40:00Z", createdAt: "2024-05-21T11:00:00Z",
    rejectionReason: "CO-4: Modifier invalid for service billed", denialCode: "CO-4",
    scrubScore: 42, scrubErrorCount: 1, scrubWarningCount: 2,
    timeline: [
      { id: "e6a", status: "Scrubbed",  timestamp: "2024-05-21T11:10:00Z", note: "AI scrub: 1 error — modifier -51 applied incorrectly to TURP. Score 42/100.", actor: "ClaimFlow AI" },
      { id: "e6b", status: "Submitted", timestamp: "2024-05-22T13:40:00Z", note: "Submitted with unresolved modifier issue.", actor: "Marcus Torres" },
      { id: "e6c", status: "Pending",   timestamp: "2024-05-22T15:00:00Z", note: "Medicare adjudication queue." },
      { id: "e6d", status: "Denied",    timestamp: "2024-06-04T10:00:00Z", note: "CO-4: Modifier -51 is invalid with TURP CPT 52601.", actor: "Medicare" },
      { id: "e6e", status: "Corrected", timestamp: "2024-06-09T14:00:00Z", note: "Modifier removed. Documentation reviewed and corrected.", actor: "Anita Patel" },
    ],
  },
  {
    id: "CLM-2024-007", patient: "Dennis R. Walcott", dob: "1955-04-12", insuranceId: "BCB-8824511",
    cpt: "51726", cptDescription: "Complex cystometrogram with voiding",
    icd10: "N39.46", icd10Description: "Mixed incontinence",
    payer: "BlueCross", specialty: "Urodynamics / Incontinence", amount: 580.00,
    status: "Paid", submittedAt: "2024-05-23T09:15:00Z", createdAt: "2024-05-22T08:00:00Z",
    scrubScore: 91, scrubErrorCount: 0, scrubWarningCount: 0,
    timeline: [
      { id: "e7a", status: "Scrubbed",  timestamp: "2024-05-22T08:10:00Z", note: "AI scrub passed. Score 91/100.", actor: "ClaimFlow AI" },
      { id: "e7b", status: "Submitted", timestamp: "2024-05-23T09:15:00Z", note: "837P submitted. ACK-2024-00531.", actor: "Marcus Torres" },
      { id: "e7c", status: "Pending",   timestamp: "2024-05-23T12:00:00Z", note: "BlueCross adjudication." },
      { id: "e7d", status: "Approved",  timestamp: "2024-06-03T11:00:00Z", note: "Approved. ERA received.", actor: "BlueCross" },
      { id: "e7e", status: "Paid",      timestamp: "2024-06-08T08:00:00Z", note: "EFT deposited $452.40. Patient balance $127.60.", actor: "BlueCross EFT" },
    ],
  },
  {
    id: "CLM-2024-008", patient: "Thomas B. Rafferty", dob: "1968-12-28", insuranceId: "UHC-9903312",
    cpt: "52332", cptDescription: "Cystoscopy with insertion of ureteral stent",
    icd10: "N20.1", icd10Description: "Calculus of ureter",
    payer: "UnitedHealth", specialty: "Kidney Stone Care", amount: 1240.00,
    status: "Pending", submittedAt: "2024-05-23T14:20:00Z", createdAt: "2024-05-22T10:00:00Z",
    scrubScore: 82, scrubErrorCount: 0, scrubWarningCount: 1,
    timeline: [
      { id: "e8a", status: "Scrubbed",  timestamp: "2024-05-22T10:10:00Z", note: "1 warning: UHC may require prior auth for stent insertion. Score 82/100.", actor: "ClaimFlow AI" },
      { id: "e8b", status: "Submitted", timestamp: "2024-05-23T14:20:00Z", note: "Submitted. ACK-2024-00532.", actor: "Anita Patel" },
      { id: "e8c", status: "Pending",   timestamp: "2024-05-23T16:00:00Z", note: "UHC processing. Auth status under review." },
    ],
  },
  {
    id: "CLM-2024-009", patient: "Arthur J. Pemberton", dob: "1955-08-17", insuranceId: "AET-4467821",
    cpt: "99213", cptDescription: "Office visit, established patient, low complexity",
    icd10: "N41.1", icd10Description: "Chronic prostatitis",
    payer: "Aetna", specialty: "BPH / LUTS Management", amount: 145.00,
    status: "Approved", submittedAt: "2024-05-24T10:00:00Z", createdAt: "2024-05-23T09:00:00Z",
    scrubScore: 88, scrubErrorCount: 0, scrubWarningCount: 0,
    timeline: [
      { id: "e9a", status: "Scrubbed",  timestamp: "2024-05-23T09:05:00Z", note: "AI scrub passed. Score 88/100.", actor: "ClaimFlow AI" },
      { id: "e9b", status: "Submitted", timestamp: "2024-05-24T10:00:00Z", note: "Submitted. ACK-2024-00533.", actor: "Marcus Torres" },
      { id: "e9c", status: "Pending",   timestamp: "2024-05-24T12:00:00Z", note: "Aetna adjudication." },
      { id: "e9d", status: "Approved",  timestamp: "2024-06-01T14:00:00Z", note: "Approved. ERA received.", actor: "Aetna" },
    ],
  },
  {
    id: "CLM-2024-010", patient: "Frank D. Gustavsson", dob: "1950-02-07", insuranceId: "MCR-7712398",
    cpt: "52204", cptDescription: "Cystoscopy with biopsy",
    icd10: "R31.0", icd10Description: "Gross hematuria",
    payer: "Medicare", specialty: "Hematuria Workup", amount: 780.00,
    status: "Resubmitted", submittedAt: "2024-05-24T11:45:00Z", createdAt: "2024-05-23T08:00:00Z",
    rejectionReason: "CO-197: Prior authorization required", denialCode: "CO-197",
    scrubScore: 55, scrubErrorCount: 1, scrubWarningCount: 0,
    timeline: [
      { id: "e10a", status: "Scrubbed",    timestamp: "2024-05-23T08:10:00Z", note: "1 error: Medicare auth required for cystoscopy with biopsy. Score 55/100.", actor: "ClaimFlow AI" },
      { id: "e10b", status: "Submitted",   timestamp: "2024-05-24T11:45:00Z", note: "Submitted without obtaining auth. ACK-2024-00534.", actor: "Marcus Torres" },
      { id: "e10c", status: "Pending",     timestamp: "2024-05-24T14:00:00Z", note: "Medicare adjudication." },
      { id: "e10d", status: "Denied",      timestamp: "2024-06-05T09:00:00Z", note: "CO-197: No prior auth on file. Appeal window: 90 days.", actor: "Medicare" },
      { id: "e10e", status: "Corrected",   timestamp: "2024-06-10T11:00:00Z", note: "Auth retroactively obtained. Documentation corrected.", actor: "Anita Patel" },
      { id: "e10f", status: "Resubmitted", timestamp: "2024-06-11T09:00:00Z", note: "Resubmitted with CCI 7 and auth reference number.", actor: "Anita Patel" },
    ],
  },
  {
    id: "CLM-2024-011", patient: "Larry W. McIntyre", dob: "1958-05-29", insuranceId: "BCB-3319204",
    cpt: "99214", cptDescription: "Office visit, established patient, mod complexity",
    icd10: "C61", icd10Description: "Malignant neoplasm of prostate",
    payer: "BlueCross", specialty: "Prostate Cancer Screening", amount: 220.00,
    status: "Paid", submittedAt: "2024-05-25T08:30:00Z", createdAt: "2024-05-24T09:00:00Z",
    scrubScore: 93, scrubErrorCount: 0, scrubWarningCount: 0,
    timeline: [
      { id: "e11a", status: "Scrubbed",  timestamp: "2024-05-24T09:05:00Z", note: "AI scrub passed. Score 93/100.", actor: "ClaimFlow AI" },
      { id: "e11b", status: "Submitted", timestamp: "2024-05-25T08:30:00Z", note: "837P submitted. ACK-2024-00535.", actor: "Marcus Torres" },
      { id: "e11c", status: "Pending",   timestamp: "2024-05-25T11:00:00Z", note: "BlueCross adjudication." },
      { id: "e11d", status: "Approved",  timestamp: "2024-06-04T10:00:00Z", note: "Approved. ERA received.", actor: "BlueCross" },
      { id: "e11e", status: "Paid",      timestamp: "2024-06-09T08:00:00Z", note: "EFT deposited $171.60. Patient balance $48.40.", actor: "BlueCross EFT" },
    ],
  },
  {
    id: "CLM-2024-012", patient: "Bernard K. Walsh", dob: "1945-10-14", insuranceId: "MCD-8821047",
    cpt: "51702", cptDescription: "Insertion of temporary indwelling bladder catheter",
    icd10: "R33.9", icd10Description: "Retention of urine, unspecified",
    payer: "Medicaid", specialty: "Urodynamics / Incontinence", amount: 145.00,
    status: "Submitted", submittedAt: "2024-05-25T15:10:00Z", createdAt: "2024-05-24T12:00:00Z",
    scrubScore: 78, scrubErrorCount: 0, scrubWarningCount: 1,
    timeline: [
      { id: "e12a", status: "Scrubbed",  timestamp: "2024-05-24T12:10:00Z", note: "1 warning: Medicaid may require medical necessity documentation. Score 78/100.", actor: "ClaimFlow AI" },
      { id: "e12b", status: "Submitted", timestamp: "2024-05-25T15:10:00Z", note: "Submitted. ACK-2024-00536.", actor: "Marcus Torres" },
    ],
  },
  {
    id: "CLM-2024-013", patient: "Douglas P. Mercer", dob: "1960-03-21", insuranceId: "AET-6643890",
    cpt: "74177", cptDescription: "CT urography with contrast",
    icd10: "N20.0", icd10Description: "Calculus of kidney",
    payer: "Aetna", specialty: "Kidney Stone Care", amount: 890.00,
    status: "Denied", submittedAt: "2024-05-26T09:55:00Z", createdAt: "2024-05-25T08:00:00Z",
    rejectionReason: "CO-197: Prior authorization required by Aetna for CT urography", denialCode: "CO-197",
    scrubScore: 35, scrubErrorCount: 2, scrubWarningCount: 1,
    timeline: [
      { id: "e13a", status: "Scrubbed",  timestamp: "2024-05-25T08:10:00Z", note: "2 errors: Aetna requires prior auth for CT urography; auth number missing. Score 35/100.", actor: "ClaimFlow AI" },
      { id: "e13b", status: "Submitted", timestamp: "2024-05-26T09:55:00Z", note: "Submitted without auth. ACK-2024-00537.", actor: "Marcus Torres" },
      { id: "e13c", status: "Pending",   timestamp: "2024-05-26T12:00:00Z", note: "Aetna adjudication." },
      { id: "e13d", status: "Denied",    timestamp: "2024-06-06T10:00:00Z", note: "CO-197: No prior authorization obtained. Appeal: 90 days.", actor: "Aetna" },
    ],
  },
  {
    id: "CLM-2024-014", patient: "Roger E. Castellano", dob: "1975-07-09", insuranceId: "MCD-1120938",
    cpt: "99213", cptDescription: "Office visit, established patient, low complexity",
    icd10: "N39.0", icd10Description: "Urinary tract infection, unspecified",
    payer: "Medicaid", specialty: "BPH / LUTS Management", amount: 145.00,
    status: "Approved", submittedAt: "2024-05-26T13:00:00Z", createdAt: "2024-05-25T10:00:00Z",
    scrubScore: 86, scrubErrorCount: 0, scrubWarningCount: 0,
    timeline: [
      { id: "e14a", status: "Scrubbed",  timestamp: "2024-05-25T10:05:00Z", note: "AI scrub passed. Score 86/100.", actor: "ClaimFlow AI" },
      { id: "e14b", status: "Submitted", timestamp: "2024-05-26T13:00:00Z", note: "Submitted. ACK-2024-00538.", actor: "Anita Patel" },
      { id: "e14c", status: "Pending",   timestamp: "2024-05-26T15:00:00Z", note: "Medicaid adjudication." },
      { id: "e14d", status: "Approved",  timestamp: "2024-06-04T11:00:00Z", note: "Approved. ERA received.", actor: "Medicaid" },
    ],
  },
  {
    id: "CLM-2024-015", patient: "Walter C. Brinkworth", dob: "1962-01-25", insuranceId: "UHC-5510023",
    cpt: "52000", cptDescription: "Cystoscopy, diagnostic",
    icd10: "N40.1", icd10Description: "Benign prostatic hyperplasia with LUTS",
    payer: "UnitedHealth", specialty: "Hematuria Workup", amount: 380.00,
    status: "Scrubbed", submittedAt: "2024-05-27T10:30:00Z", createdAt: "2024-05-27T09:00:00Z",
    scrubScore: 71, scrubErrorCount: 0, scrubWarningCount: 2,
    timeline: [
      { id: "e15a", status: "Scrubbed", timestamp: "2024-05-27T09:05:00Z", note: "2 warnings: N40.1 is suboptimal for cystoscopy (prefer R31.0); UHC may require auth. Score 71/100.", actor: "ClaimFlow AI" },
    ],
  },
  {
    id: "CLM-2024-016", patient: "Norman A. Driscoll", dob: "1953-04-17", insuranceId: "MCR-3381920",
    cpt: "55866", cptDescription: "Laparoscopic radical prostatectomy",
    icd10: "C61", icd10Description: "Malignant neoplasm of prostate",
    payer: "Medicare", specialty: "Prostate Cancer Screening", amount: 6800.00,
    status: "Approved", submittedAt: "2024-05-27T11:00:00Z", createdAt: "2024-05-26T08:00:00Z",
    scrubScore: 97, scrubErrorCount: 0, scrubWarningCount: 0,
    timeline: [
      { id: "e16a", status: "Scrubbed",  timestamp: "2024-05-26T08:10:00Z", note: "AI scrub passed. All criteria met. Score 97/100.", actor: "ClaimFlow AI" },
      { id: "e16b", status: "Submitted", timestamp: "2024-05-27T11:00:00Z", note: "837P submitted. ACK-2024-00539.", actor: "Anita Patel" },
      { id: "e16c", status: "Pending",   timestamp: "2024-05-27T14:00:00Z", note: "Medicare medical review — high-dollar claim." },
      { id: "e16d", status: "Approved",  timestamp: "2024-06-10T09:00:00Z", note: "Approved after medical review. ERA received.", actor: "Medicare" },
    ],
  },
  {
    id: "CLM-2024-017", patient: "Agnes M. Hollingsworth", dob: "1958-09-22", insuranceId: "BCB-2291043",
    cpt: "51840", cptDescription: "Anterior vesicourethropexy (MMK/Burch procedure)",
    icd10: "N39.3", icd10Description: "Stress incontinence (female) (male)",
    payer: "BlueCross", specialty: "Urodynamics / Incontinence", amount: 4200.00,
    status: "Resubmitted", submittedAt: "2024-05-28T09:00:00Z", createdAt: "2024-05-27T10:00:00Z",
    rejectionReason: "CO-11: Diagnosis code inconsistent with procedure billed", denialCode: "CO-11",
    scrubScore: 48, scrubErrorCount: 1, scrubWarningCount: 1,
    timeline: [
      { id: "e17a", status: "Scrubbed",    timestamp: "2024-05-27T10:10:00Z", note: "1 error: N39.3 doesn't map cleanly to Burch — confirm incontinence type. Score 48/100.", actor: "ClaimFlow AI" },
      { id: "e17b", status: "Submitted",   timestamp: "2024-05-28T09:00:00Z", note: "Submitted. ACK-2024-00540.", actor: "Marcus Torres" },
      { id: "e17c", status: "Pending",     timestamp: "2024-05-28T11:00:00Z", note: "BlueCross adjudication." },
      { id: "e17d", status: "Denied",      timestamp: "2024-06-08T10:00:00Z", note: "CO-11: Diagnosis not consistent with procedure. Submit with N39.41 or N39.46.", actor: "BlueCross" },
      { id: "e17e", status: "Corrected",   timestamp: "2024-06-12T14:00:00Z", note: "ICD-10 corrected to N39.41 (mixed incontinence). Documentation updated.", actor: "Anita Patel" },
      { id: "e17f", status: "Resubmitted", timestamp: "2024-06-13T09:30:00Z", note: "Resubmitted with CCI 7. ACK-2024-00601.", actor: "Anita Patel" },
    ],
  },
  {
    id: "CLM-2024-018", patient: "Clarence T. Turvey", dob: "1961-06-30", insuranceId: "AET-7723019",
    cpt: "50080", cptDescription: "Percutaneous nephrostolithotomy (PCNL), simple",
    icd10: "N20.0", icd10Description: "Calculus of kidney",
    payer: "Aetna", specialty: "Kidney Stone Care", amount: 5400.00,
    status: "Pending", submittedAt: "2024-05-28T14:00:00Z", createdAt: "2024-05-27T11:00:00Z",
    scrubScore: 84, scrubErrorCount: 0, scrubWarningCount: 1,
    timeline: [
      { id: "e18a", status: "Scrubbed",  timestamp: "2024-05-27T11:10:00Z", note: "1 warning: Aetna requires auth for PCNL — verify auth number. Score 84/100.", actor: "ClaimFlow AI" },
      { id: "e18b", status: "Submitted", timestamp: "2024-05-28T14:00:00Z", note: "Submitted with auth reference AUTH-2024-7731. ACK-2024-00541.", actor: "Marcus Torres" },
      { id: "e18c", status: "Pending",   timestamp: "2024-05-28T16:00:00Z", note: "Aetna processing. Auth verified." },
    ],
  },
  {
    id: "CLM-2024-019", patient: "Miriam L. Goldstein", dob: "1966-11-14", insuranceId: "UHC-4401298",
    cpt: "51798", cptDescription: "Ultrasound, bladder capacity measurement",
    icd10: "R33.9", icd10Description: "Retention of urine, unspecified",
    payer: "UnitedHealth", specialty: "Urodynamics / Incontinence", amount: 185.00,
    status: "Approved", submittedAt: "2024-05-29T09:15:00Z", createdAt: "2024-05-28T08:00:00Z",
    scrubScore: 90, scrubErrorCount: 0, scrubWarningCount: 0,
    timeline: [
      { id: "e19a", status: "Scrubbed",  timestamp: "2024-05-28T08:05:00Z", note: "AI scrub passed. Score 90/100.", actor: "ClaimFlow AI" },
      { id: "e19b", status: "Submitted", timestamp: "2024-05-29T09:15:00Z", note: "Submitted. ACK-2024-00542.", actor: "Anita Patel" },
      { id: "e19c", status: "Pending",   timestamp: "2024-05-29T11:00:00Z", note: "UHC adjudication." },
      { id: "e19d", status: "Approved",  timestamp: "2024-06-07T10:00:00Z", note: "Approved. ERA received.", actor: "UHC" },
    ],
  },
  {
    id: "CLM-2024-020", patient: "Wallace A. Pemberton", dob: "1949-03-08", insuranceId: "MCR-9910283",
    cpt: "52310", cptDescription: "Cystoscopy with removal of foreign body",
    icd10: "N21.0", icd10Description: "Calculus in bladder",
    payer: "Medicare", specialty: "Kidney Stone Care", amount: 920.00,
    status: "Draft", submittedAt: "2024-05-29T14:00:00Z", createdAt: "2024-05-29T13:30:00Z",
    timeline: [
      { id: "e20a", status: "Draft", timestamp: "2024-05-29T13:30:00Z", note: "Claim entered into system from encounter documentation.", actor: "Marcus Torres" },
    ],
  },
];

export const DENIAL_REASONS = [
  { name: "Missing Prior Authorization", value: 32, color: "#EF4444" },
  { name: "Diagnosis/Procedure Mismatch", value: 24, color: "#3B82F6" },
  { name: "Medical Necessity Not Met",   value: 18, color: "#8B5CF6" },
  { name: "Missing Modifier (-25/-59)",  value: 15, color: "#F59E0B" },
  { name: "Timely Filing Exceeded",      value: 11, color: "#06B6D4" },
];

export const PAYER_DATA = [
  { payer: "BlueCross", claims: 234, approved: 198, rejected: 36 },
  { payer: "Medicare", claims: 198, approved: 161, rejected: 37 },
  { payer: "Medicaid", claims: 167, approved: 136, rejected: 31 },
  { payer: "Aetna", claims: 143, approved: 122, rejected: 21 },
  { payer: "UnitedHealth", claims: 105, approved: 84, rejected: 21 },
];

export const MONTHLY_TREND = [
  { month: "Dec", submitted: 720, approved: 624, rejected: 96 },
  { month: "Jan", submitted: 765, approved: 658, rejected: 107 },
  { month: "Feb", submitted: 710, approved: 624, rejected: 86 },
  { month: "Mar", submitted: 800, approved: 704, rejected: 96 },
  { month: "Apr", submitted: 830, approved: 738, rejected: 92 },
  { month: "May", submitted: 847, approved: 745, rejected: 102 },
];

// ─── CPT Reference Library ────────────────────────────────────────────────────
export const CPT_CODES: Record<string, { description: string; category: string; fee?: number }> = {
  // Evaluation & Management
  "99201": { description: "Office Visit — New Patient, Level 1", category: "E&M", fee: 68 },
  "99202": { description: "Office Visit — New Patient, Level 2", category: "E&M", fee: 109 },
  "99203": { description: "Office Visit — New Patient, Level 3", category: "E&M", fee: 148 },
  "99204": { description: "Office Visit — New Patient, Level 4", category: "E&M", fee: 214 },
  "99205": { description: "Office Visit — New Patient, Level 5", category: "E&M", fee: 278 },
  "99211": { description: "Office Visit — Est. Patient, Level 1 (nurse)", category: "E&M", fee: 24 },
  "99212": { description: "Office Visit — Est. Patient, Level 2", category: "E&M", fee: 78 },
  "99213": { description: "Office Visit — Est. Patient, Level 3", category: "E&M", fee: 145 },
  "99214": { description: "Office Visit — Est. Patient, Level 4", category: "E&M", fee: 220 },
  "99215": { description: "Office Visit — Est. Patient, Level 5", category: "E&M", fee: 298 },
  // Preventive Medicine
  "99385": { description: "Preventive Medicine — New Patient, Age 18–39", category: "Preventive", fee: 198 },
  "99386": { description: "Preventive Medicine — New Patient, Age 40–64", category: "Preventive", fee: 232 },
  "99387": { description: "Preventive Medicine — New Patient, Age 65+", category: "Preventive", fee: 264 },
  "99395": { description: "Preventive Medicine — Est. Patient, Age 18–39", category: "Preventive", fee: 178 },
  "99396": { description: "Preventive Medicine — Est. Patient, Age 40–64", category: "Preventive", fee: 212 },
  "99397": { description: "Preventive Medicine — Est. Patient, Age 65+", category: "Preventive", fee: 240 },
  // Surgery
  "29881": { description: "Knee Arthroscopy w/ Meniscectomy", category: "Surgery", fee: 1850 },
  "29827": { description: "Shoulder Arthroscopy w/ Rotator Cuff Repair", category: "Surgery", fee: 3200 },
  "27447": { description: "Total Knee Arthroplasty", category: "Surgery", fee: 8500 },
  "27130": { description: "Total Hip Arthroplasty", category: "Surgery", fee: 9200 },
  "28450": { description: "Treatment of Metatarsal Fracture", category: "Orthopedics", fee: 620 },
  "20610": { description: "Aspiration/Injection — Major Joint or Bursa", category: "Surgery", fee: 115 },
  "10060": { description: "Incision and Drainage, Simple Abscess", category: "Surgery", fee: 145 },
  // Cardiology
  "93000": { description: "Electrocardiogram (ECG) — Routine", category: "Cardiology", fee: 89 },
  "93306": { description: "Echocardiography — Complete Transthoracic", category: "Cardiology", fee: 680 },
  "93015": { description: "Cardiovascular Stress Test — w/ Interpretation", category: "Cardiology", fee: 310 },
  "93010": { description: "ECG Interpretation Only", category: "Cardiology", fee: 28 },
  // Radiology
  "71046": { description: "Chest X-Ray, 2 Views", category: "Radiology", fee: 175 },
  "73721": { description: "MRI Knee — w/o Contrast", category: "Radiology", fee: 820 },
  "72148": { description: "MRI Lumbar Spine — w/o Contrast", category: "Radiology", fee: 890 },
  "70553": { description: "MRI Brain — w/ Contrast", category: "Radiology", fee: 1100 },
  "73030": { description: "X-Ray Shoulder — Minimum 2 Views", category: "Radiology", fee: 95 },
  // Physical Therapy
  "97001": { description: "Physical Therapy Evaluation", category: "Physical Therapy", fee: 145 },
  "97110": { description: "Therapeutic Exercise, 15 min", category: "Physical Therapy", fee: 95 },
  "97140": { description: "Manual Therapy, 15 min", category: "Physical Therapy", fee: 90 },
  "97530": { description: "Therapeutic Activities, 15 min", category: "Physical Therapy", fee: 92 },
  "97012": { description: "Mechanical Traction, 15 min", category: "Physical Therapy", fee: 42 },
  // Laboratory
  "80053": { description: "Comprehensive Metabolic Panel", category: "Laboratory", fee: 48 },
  "85027": { description: "CBC w/o Differential", category: "Laboratory", fee: 28 },
  "83036": { description: "Hemoglobin A1c (HbA1c)", category: "Laboratory", fee: 38 },
  "84443": { description: "TSH — Thyroid Stimulating Hormone", category: "Laboratory", fee: 52 },
  "82947": { description: "Glucose, Quantitative", category: "Laboratory", fee: 22 },
  "82962": { description: "Glucose — Blood Glucose Monitoring Device", category: "Laboratory", fee: 18 },
  // Mental Health
  "90791": { description: "Psychiatric Diagnostic Evaluation", category: "Mental Health", fee: 245 },
  "90834": { description: "Psychotherapy, 45 min", category: "Mental Health", fee: 158 },
  "90837": { description: "Psychotherapy, 60 min", category: "Mental Health", fee: 198 },
  "90847": { description: "Family Psychotherapy w/ Patient Present", category: "Mental Health", fee: 165 },
  // Emergency Medicine
  "99281": { description: "Emergency Dept Visit — Level 1, Minor Problem", category: "Emergency", fee: 58 },
  "99282": { description: "Emergency Dept Visit — Level 2, Low Complexity", category: "Emergency", fee: 98 },
  "99283": { description: "Emergency Dept Visit — Level 3, Moderate Complexity", category: "Emergency", fee: 168 },
  "99284": { description: "Emergency Dept Visit — Level 4, High Complexity", category: "Emergency", fee: 248 },
  "99285": { description: "Emergency Dept Visit — Level 5, High Complexity + Threat to Life", category: "Emergency", fee: 348 },
  // OR / Surgery
  "44950": { description: "Appendectomy, Open", category: "Surgery", fee: 3400 },
  "44970": { description: "Appendectomy, Laparoscopic", category: "Surgery", fee: 4200 },
  "47562": { description: "Cholecystectomy, Laparoscopic", category: "Surgery", fee: 5800 },
  "47600": { description: "Cholecystectomy, Open", category: "Surgery", fee: 7200 },
  "27236": { description: "Treatment of Femoral Neck Fracture — Internal Fixation", category: "Surgery", fee: 6800 },
  "25600": { description: "Treatment of Colles Fracture — Closed, w/o Manipulation", category: "Surgery", fee: 890 },
  "27759": { description: "Treatment of Tibial Shaft Fracture — Intramedullary Nail", category: "Surgery", fee: 5200 },
  "10061": { description: "Incision and Drainage, Complex Abscess or Carbuncle", category: "Surgery", fee: 310 },
  // Radiology (additional)
  "71250": { description: "CT Chest w/o Contrast", category: "Radiology", fee: 540 },
  "71270": { description: "CT Chest w/ and w/o Contrast", category: "Radiology", fee: 720 },
  "74177": { description: "CT Abdomen & Pelvis w/ Contrast", category: "Radiology", fee: 890 },
  "74178": { description: "CT Abdomen & Pelvis w/o and w/ Contrast", category: "Radiology", fee: 980 },
  "70551": { description: "MRI Brain w/o Contrast", category: "Radiology", fee: 980 },
  "72141": { description: "MRI Cervical Spine w/o Contrast", category: "Radiology", fee: 840 },
  "76700": { description: "Ultrasound, Abdomen — Complete", category: "Radiology", fee: 320 },
  "76805": { description: "Ultrasound, Obstetric (2nd/3rd Trimester)", category: "Radiology", fee: 290 },
  "77067": { description: "Screening Mammography, Bilateral", category: "Radiology", fee: 185 },
  "78452": { description: "Myocardial Perfusion Imaging w/ Exercise Stress (SPECT)", category: "Radiology", fee: 1240 },
  // Pulmonology
  "94010": { description: "Spirometry — Expiratory Flow Measurements", category: "Pulmonology", fee: 78 },
  "94060": { description: "Bronchodilation Responsiveness — Spirometry Before & After", category: "Pulmonology", fee: 124 },
  "94375": { description: "Respiratory Flow-Volume Loop", category: "Pulmonology", fee: 95 },
  "94620": { description: "Pulmonary Stress Test, Simple", category: "Pulmonology", fee: 198 },
  "94640": { description: "Pressurized Inhalation Treatment (Nebulizer)", category: "Pulmonology", fee: 42 },
  "94664": { description: "Aerosol or Vapor Inhalation — Initial Demonstration", category: "Pulmonology", fee: 38 },
  "31500": { description: "Intubation, Endotracheal — Emergency Procedure", category: "Pulmonology", fee: 320 },
  "32555": { description: "Thoracentesis w/ Imaging Guidance", category: "Pulmonology", fee: 780 },
  "94002": { description: "Ventilation Management, Hospital Inpatient — Initial Day", category: "Pulmonology", fee: 480 },
  // Occupational Therapy
  "97165": { description: "Occupational Therapy Evaluation — Low Complexity", category: "Occupational Therapy", fee: 125 },
  "97166": { description: "Occupational Therapy Evaluation — Moderate Complexity", category: "Occupational Therapy", fee: 170 },
  "97167": { description: "Occupational Therapy Evaluation — High Complexity", category: "Occupational Therapy", fee: 215 },
  "97168": { description: "Occupational Therapy Re-Evaluation", category: "Occupational Therapy", fee: 110 },
  "97535": { description: "Self-Care / Home Management Training, 15 min", category: "Occupational Therapy", fee: 95 },
  "97537": { description: "Community / Work Reintegration Training, 15 min", category: "Occupational Therapy", fee: 98 },
  "97542": { description: "Wheelchair Management / Propulsion Training, 15 min", category: "Occupational Therapy", fee: 88 },
  // Urology — Cystoscopy & Endoscopy
  "52000": { description: "Cystoscopy", category: "Urology", fee: 380 },
  "52001": { description: "Cystoscopy with Irrigation and Evacuation", category: "Urology", fee: 420 },
  "52204": { description: "Cystoscopy with Biopsy", category: "Urology", fee: 780 },
  "52310": { description: "Cystoscopy with Removal of Foreign Body or Calculus", category: "Urology", fee: 620 },
  "52332": { description: "Cystoscopy with Insertion of Indwelling Ureteral Stent", category: "Urology", fee: 1240 },
  "52353": { description: "Cystoscopy with Lithotripsy (Ureteral)", category: "Urology", fee: 1480 },
  // Urology — Prostate
  "52601": { description: "Transurethral Resection of Prostate (TURP) — First Stage", category: "Urology", fee: 2850 },
  "52630": { description: "Transurethral Resection, Residual or Regrowth Prostate Tissue", category: "Urology", fee: 2200 },
  "55700": { description: "Prostate Needle Biopsy — Single or Multiple", category: "Urology", fee: 890 },
  "55706": { description: "Prostate Needle Biopsy, Transperineal", category: "Urology", fee: 1100 },
  // Urology — Kidney Stone
  "50590": { description: "Lithotripsy, Extracorporeal Shock Wave (ESWL)", category: "Urology", fee: 3200 },
  // Urology — Catheter & Bladder
  "51700": { description: "Bladder Irrigation — Simple", category: "Urology", fee: 145 },
  "51701": { description: "Insertion of Non-Indwelling Bladder Catheter", category: "Urology", fee: 98 },
  "51702": { description: "Insertion of Temporary Indwelling Bladder Catheter — Simple", category: "Urology", fee: 145 },
  "51703": { description: "Insertion of Temporary Indwelling Bladder Catheter — Complicated", category: "Urology", fee: 198 },
  // Urology — Urodynamics
  "51726": { description: "Complex Cystometrogram (Urodynamics)", category: "Urology", fee: 580 },
  "51727": { description: "Complex Cystometrogram with Voiding Pressure Studies", category: "Urology", fee: 720 },
  "51736": { description: "Simple Uroflowmetry", category: "Urology", fee: 145 },
  "51741": { description: "Complex Uroflowmetry with Calibration", category: "Urology", fee: 210 },
  // Urology — PSA & Labs
  "84153": { description: "Prostate Specific Antigen (PSA), Total", category: "Laboratory", fee: 52 },
  "84154": { description: "Prostate Specific Antigen (PSA), Free", category: "Laboratory", fee: 68 },
  // Urology — Radiology
  "76872": { description: "Ultrasound, Transrectal (TRUS)", category: "Radiology", fee: 420 },
  "76770": { description: "Ultrasound, Retroperitoneal — Complete", category: "Radiology", fee: 340 },
  "76775": { description: "Ultrasound, Retroperitoneal — Limited", category: "Radiology", fee: 220 },
  "74400": { description: "Urography (IVP) — w/ or w/o KUB", category: "Radiology", fee: 640 },
};

// ─── ICD-10 Reference Library ─────────────────────────────────────────────────
export const ICD10_CODES: Record<string, { description: string; category: string }> = {
  // Musculoskeletal
  "M54.5":   { description: "Low Back Pain", category: "Musculoskeletal" },
  "M54.2":   { description: "Cervicalgia (Neck Pain)", category: "Musculoskeletal" },
  "M54.16":  { description: "Radiculopathy, Lumbar Region", category: "Musculoskeletal" },
  "M17.11":  { description: "Primary Osteoarthritis, Right Knee", category: "Musculoskeletal" },
  "M17.12":  { description: "Primary Osteoarthritis, Left Knee", category: "Musculoskeletal" },
  "M16.11":  { description: "Primary Osteoarthritis, Right Hip", category: "Musculoskeletal" },
  "M25.511": { description: "Pain in Right Shoulder", category: "Musculoskeletal" },
  "M25.512": { description: "Pain in Left Shoulder", category: "Musculoskeletal" },
  "M75.1":   { description: "Rotator Cuff Syndrome", category: "Musculoskeletal" },
  "M23.61":  { description: "Spontaneous Disruption of ACL, Right Knee", category: "Musculoskeletal" },
  "M23.62":  { description: "Spontaneous Disruption of ACL, Left Knee", category: "Musculoskeletal" },
  "M62.81":  { description: "Muscle Weakness, Shoulder Region", category: "Musculoskeletal" },
  "G89.29":  { description: "Other Chronic Pain", category: "Musculoskeletal" },
  // Injury
  "S92.501A": { description: "Displaced Fracture, Medial Cuneiform (Foot) — Initial", category: "Injury" },
  "S83.511A": { description: "Sprain of ACL, Right Knee — Initial Encounter", category: "Injury" },
  "S83.512A": { description: "Sprain of ACL, Left Knee — Initial Encounter", category: "Injury" },
  "S46.011A": { description: "Rotator Cuff Tear, Right Shoulder — Initial", category: "Injury" },
  // Cardiovascular
  "I10":    { description: "Essential (Primary) Hypertension", category: "Cardiovascular" },
  "I25.10": { description: "Atherosclerotic Heart Disease, Native Vessel", category: "Cardiovascular" },
  "I48.91": { description: "Unspecified Atrial Fibrillation", category: "Cardiovascular" },
  "I50.9":  { description: "Heart Failure, Unspecified", category: "Cardiovascular" },
  "R00.0":  { description: "Tachycardia, Unspecified", category: "Cardiovascular" },
  "R55":    { description: "Syncope and Collapse", category: "Cardiovascular" },
  // Respiratory
  "J06.9":  { description: "Acute Upper Respiratory Infection, Unspecified", category: "Respiratory" },
  "J18.9":  { description: "Pneumonia, Unspecified Organism", category: "Respiratory" },
  "J20.9":  { description: "Acute Bronchitis, Unspecified", category: "Respiratory" },
  "J44.1":  { description: "COPD with Acute Exacerbation", category: "Respiratory" },
  "J45.20": { description: "Mild Intermittent Asthma, Uncomplicated", category: "Respiratory" },
  "J96.00": { description: "Acute Respiratory Failure, Unspecified", category: "Respiratory" },
  "R05.9":  { description: "Cough, Unspecified", category: "Respiratory" },
  // Endocrine / Metabolic
  "E11.9":  { description: "Type 2 Diabetes Mellitus w/o Complications", category: "Endocrine" },
  "E11.65": { description: "Type 2 Diabetes Mellitus with Hyperglycemia", category: "Endocrine" },
  "E03.9":  { description: "Hypothyroidism, Unspecified", category: "Endocrine" },
  "E78.5":  { description: "Hyperlipidemia, Unspecified", category: "Endocrine" },
  // Mental Health
  "F32.1":  { description: "Major Depressive Disorder, Single Episode, Moderate", category: "Mental Health" },
  "F33.0":  { description: "Major Depressive Disorder, Recurrent, Mild", category: "Mental Health" },
  "F41.1":  { description: "Generalized Anxiety Disorder", category: "Mental Health" },
  "F43.10": { description: "Adjustment Disorder, Unspecified", category: "Mental Health" },
  // Preventive
  "Z00.00": { description: "General Adult Medical Exam, w/o Abnormal Findings", category: "Preventive" },
  "Z00.01": { description: "General Adult Medical Exam, with Abnormal Findings", category: "Preventive" },
  "Z23":    { description: "Encounter for Immunization", category: "Preventive" },
  "Z01.00": { description: "Encounter for Examination of Eyes and Vision", category: "Preventive" },
  "Z12.11": { description: "Encounter for Screening, Colorectal Cancer", category: "Preventive" },
  // Gastrointestinal
  "K21.0":  { description: "Gastro-esophageal Reflux Disease with Esophagitis", category: "Gastrointestinal" },
  "K57.30": { description: "Diverticulosis of Large Intestine, w/o Perforation", category: "Gastrointestinal" },
  // Genitourinary
  "N39.0":  { description: "Urinary Tract Infection, Site Not Specified", category: "Genitourinary" },
  // Urology — Prostate
  "N40.0":  { description: "Benign Prostatic Hyperplasia without Lower Urinary Tract Symptoms", category: "Urology" },
  "N40.1":  { description: "Benign Prostatic Hyperplasia with Lower Urinary Tract Symptoms", category: "Urology" },
  "N40.2":  { description: "Nodular Prostate without Lower Urinary Tract Symptoms", category: "Urology" },
  "N40.3":  { description: "Nodular Prostate with Lower Urinary Tract Symptoms", category: "Urology" },
  "N41.0":  { description: "Acute Prostatitis", category: "Urology" },
  "N41.1":  { description: "Chronic Prostatitis", category: "Urology" },
  "D29.1":  { description: "Benign Neoplasm of Prostate", category: "Urology" },
  "C61":    { description: "Malignant Neoplasm of Prostate", category: "Urology" },
  "R97.20": { description: "Elevated Prostate Specific Antigen [PSA]", category: "Urology" },
  // Urology — Kidney & Ureter
  "N20.0":  { description: "Calculus of Kidney", category: "Urology" },
  "N20.1":  { description: "Calculus of Ureter", category: "Urology" },
  "N20.2":  { description: "Calculus of Kidney with Calculus of Ureter", category: "Urology" },
  "N21.0":  { description: "Calculus in Bladder", category: "Urology" },
  "N13.30": { description: "Hydronephrosis with Obstruction, Unspecified", category: "Urology" },
  "C64.1":  { description: "Malignant Neoplasm of Right Kidney", category: "Urology" },
  "C64.2":  { description: "Malignant Neoplasm of Left Kidney", category: "Urology" },
  // Urology — Hematuria & Voiding
  "R31.0":  { description: "Gross Hematuria", category: "Urology" },
  "R31.1":  { description: "Benign Essential Microscopic Hematuria", category: "Urology" },
  "R31.9":  { description: "Hematuria, Unspecified", category: "Urology" },
  "R33.8":  { description: "Other Retention of Urine", category: "Urology" },
  "R33.9":  { description: "Retention of Urine, Unspecified", category: "Urology" },
  "R35.0":  { description: "Frequency of Micturition", category: "Urology" },
  "R35.1":  { description: "Nocturia", category: "Urology" },
  // Urology — Bladder & Incontinence
  "N30.00": { description: "Acute Cystitis without Hematuria", category: "Urology" },
  "N30.10": { description: "Interstitial Cystitis (Chronic), without Hematuria", category: "Urology" },
  "N39.3":  { description: "Stress Urinary Incontinence", category: "Urology" },
  "N39.41": { description: "Urge Incontinence", category: "Urology" },
  "N39.46": { description: "Mixed Urinary Incontinence", category: "Urology" },
  "C67.9":  { description: "Malignant Neoplasm of Bladder, Unspecified", category: "Urology" },
  // Urology — Scrotal & Other
  "N43.3":  { description: "Hydrocele, Unspecified", category: "Urology" },
  "N44.0":  { description: "Torsion of Testis", category: "Urology" },
  "N45.1":  { description: "Epididymitis", category: "Urology" },
  // Urology — Screening & Prevention
  "Z12.5":  { description: "Encounter for Screening, Malignant Neoplasm of Prostate", category: "Urology" },
  "Z80.42": { description: "Family History of Prostate Cancer", category: "Family History" },
  // Neurological
  "R51.9":  { description: "Headache, Unspecified", category: "Neurological" },
  "G43.909":{ description: "Migraine, Unspecified, Not Intractable", category: "Neurological" },
  // Family History / Other
  "Z82.49": { description: "Family Hx of Ischemic Heart Disease", category: "Family History" },
  // Emergency / Acute Presentations
  "R07.9":    { description: "Chest Pain, Unspecified", category: "Emergency" },
  "R07.4":    { description: "Chest Pain on Breathing (Pleuritic)", category: "Emergency" },
  "R06.00":   { description: "Dyspnea (Shortness of Breath), Unspecified", category: "Emergency" },
  "R06.09":   { description: "Other Forms of Dyspnea", category: "Emergency" },
  "R10.9":    { description: "Unspecified Abdominal Pain", category: "Emergency" },
  "R10.0":    { description: "Acute Abdomen", category: "Emergency" },
  "R10.11":   { description: "Right Upper Quadrant Pain", category: "Emergency" },
  "R10.31":   { description: "Right Lower Quadrant Pain", category: "Emergency" },
  "R50.9":    { description: "Fever, Unspecified", category: "Emergency" },
  "E86.0":    { description: "Dehydration", category: "Emergency" },
  "E86.1":    { description: "Hypovolemia (Volume Depletion)", category: "Emergency" },
  // Additional Injury (ER/Surgical)
  "S93.401A": { description: "Sprain of Right Ankle, Unspecified Ligament — Initial", category: "Injury" },
  "S93.402A": { description: "Sprain of Left Ankle, Unspecified Ligament — Initial", category: "Injury" },
  "S72.001A": { description: "Fracture of Right Femoral Head — Initial, Closed", category: "Injury" },
  "S72.002A": { description: "Fracture of Left Femoral Head — Initial, Closed", category: "Injury" },
  "S52.001A": { description: "Fracture of Upper End of Right Ulna — Initial, Closed", category: "Injury" },
  "S01.411A": { description: "Laceration w/o Foreign Body, Right Cheek — Initial", category: "Injury" },
  "S21.011A": { description: "Laceration w/o Foreign Body, Right Chest Wall — Initial", category: "Injury" },
  "S61.211A": { description: "Laceration w/o Foreign Body, Right Hand — Initial", category: "Injury" },
  // Surgical Diagnoses
  "K37":      { description: "Unspecified Appendicitis", category: "Gastrointestinal" },
  "K35.80":   { description: "Acute Appendicitis w/o Abscess", category: "Gastrointestinal" },
  "K35.89":   { description: "Acute Appendicitis with Other Complications", category: "Gastrointestinal" },
  "K80.20":   { description: "Calculus of Gallbladder w/o Cholecystitis — w/o Obstruction", category: "Gastrointestinal" },
  "K81.0":    { description: "Acute Cholecystitis", category: "Gastrointestinal" },
  "K81.1":    { description: "Chronic Cholecystitis", category: "Gastrointestinal" },
  "K80.00":   { description: "Calculus of Gallbladder w/ Acute Cholecystitis", category: "Gastrointestinal" },
  "Z48.89":   { description: "Encounter for Other Postprocedural Aftercare", category: "Preventive" },
  "Z48.810":  { description: "Encounter for Surgical Aftercare Following Surgery on Sense Organs", category: "Preventive" },
  "T81.40XA": { description: "Infection Following Procedure, Unspecified — Initial", category: "Injury" },
  // Pulmonology — additional respiratory
  "J43.9":   { description: "Emphysema, Unspecified", category: "Respiratory" },
  "J45.21":  { description: "Mild Intermittent Asthma, Acute Exacerbation", category: "Respiratory" },
  "J45.41":  { description: "Moderate Persistent Asthma, Uncomplicated", category: "Respiratory" },
  "J45.51":  { description: "Severe Persistent Asthma, Uncomplicated", category: "Respiratory" },
  "J84.10":  { description: "Pulmonary Fibrosis, Unspecified", category: "Respiratory" },
  "G47.33":  { description: "Obstructive Sleep Apnea (Adult)", category: "Respiratory" },
  "J93.11":  { description: "Primary Spontaneous Pneumothorax", category: "Respiratory" },
  "J90":     { description: "Pleural Effusion, Not Elsewhere Classified", category: "Respiratory" },
  "J47.1":   { description: "Bronchiectasis with Acute Exacerbation", category: "Respiratory" },
  // Radiology indications
  "Z12.31":  { description: "Encounter for Screening Mammogram", category: "Preventive" },
  "R91.8":   { description: "Other Nonspecific Abnormal Lung Finding on Imaging", category: "Respiratory" },
  "C34.10":  { description: "Malignant Neoplasm, Upper Lobe Bronchus/Lung, Unspecified", category: "Respiratory" },
  "R19.00":  { description: "Intra-Abdominal/Pelvic Swelling or Mass, Unspecified", category: "Gastrointestinal" },
  "R93.0":   { description: "Abnormal Findings on Diagnostic Imaging of Skull/Head", category: "Neurological" },
  // Occupational Therapy / Rehabilitation
  "R26.89":  { description: "Other Abnormalities of Gait and Mobility", category: "Musculoskeletal" },
  "Z96.641": { description: "Presence of Right Artificial Knee Joint", category: "Musculoskeletal" },
  "Z96.642": { description: "Presence of Left Artificial Knee Joint", category: "Musculoskeletal" },
  "G81.10":  { description: "Spastic Hemiplegia, Unspecified Side", category: "Neurological" },
  "G35":     { description: "Multiple Sclerosis", category: "Neurological" },
};

// ─── CPT ↔ ICD-10 compatibility map ──────────────────────────────────────────
// Used by both the live check hook and scrubClaim for consistent rule evaluation.
export interface CompatRule {
  match: (cpt: string, icd: string, cptCat: string, icdCat: string) => boolean;
  severity: "error" | "warning";
  message: (cptCode: string, cptDesc: string, icd: string, icdDesc: string) => string;
  fix: (cptCode: string, icd: string) => string;
  liveLabel: string;
}

export const COMPAT_RULES: CompatRule[] = [
  // E&M with foot fracture
  {
    match: (cpt, icd) => ["99213","99214","99203","99212","99215","99204","99205"].includes(cpt) && icd === "S92.501A",
    severity: "error",
    message: (cpt, cptD, icd) => `CPT ${cpt} (${cptD}) cannot be the procedure code for a foot fracture (${icd}).`,
    fix: () => "Use CPT 28450 (Metatarsal Fracture Treatment) as the procedure. If a separate E&M evaluation was also performed, bill it with Modifier -25 on its own line.",
    liveLabel: "E&M code not appropriate for a fracture — needs a treatment procedure code",
  },
  // E&M with annual wellness
  {
    match: (cpt, icd) => ["99213","99214","99203","99212","99215","99204","99205"].includes(cpt) && ["Z00.00","Z00.01"].includes(icd),
    severity: "error",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) billed with ${icd} (${icdD}) will be denied. Payers expect a preventive medicine code for wellness encounters.`,
    fix: () => "Replace with CPT 99395 (age 18–39), 99396 (age 40–64), or 99397 (age 65+). If a separate acute problem was also addressed, add the E&M code back with Modifier -25.",
    liveLabel: "Wellness diagnosis requires a preventive medicine CPT (99395–99397), not an E&M code",
  },
  // Knee arthroscopy with non-knee diagnosis
  {
    match: (cpt, icd) => cpt === "29881" && !["M17.11","M17.12","M23.61","M23.62","S83.511A","S83.512A"].includes(icd),
    severity: "error",
    message: (_, __, icd, icdD) => `CPT 29881 (Knee Arthroscopy) requires a knee-specific diagnosis. "${icdD}" (${icd}) does not support this procedure.`,
    fix: () => "Use a knee pathology diagnosis: M17.11 (Osteoarthritis Right Knee), M23.61 (ACL Disruption), or S83.511A (ACL Sprain). Payers auto-deny arthroscopy without a matching joint diagnosis.",
    liveLabel: "Knee arthroscopy requires a knee-specific diagnosis code",
  },
  // Shoulder arthroscopy with non-shoulder diagnosis
  {
    match: (cpt, icd) => cpt === "29827" && !["M75.1","M25.511","M25.512","S46.011A","M62.81"].includes(icd),
    severity: "error",
    message: (_, __, icd, icdD) => `CPT 29827 (Shoulder Arthroscopy) requires a shoulder-specific diagnosis. "${icdD}" (${icd}) does not support this procedure.`,
    fix: () => "Use a shoulder-specific diagnosis: M75.1 (Rotator Cuff Syndrome), S46.011A (Rotator Cuff Tear), or M25.511 (Shoulder Pain). Payers require a matching shoulder pathology code.",
    liveLabel: "Shoulder arthroscopy requires a shoulder-specific diagnosis code",
  },
  // Knee replacement with non-knee diagnosis
  {
    match: (cpt, icd) => cpt === "27447" && !["M17.11","M17.12","M23.61","M23.62"].includes(icd),
    severity: "error",
    message: (_, __, icd, icdD) => `CPT 27447 (Total Knee Arthroplasty) requires severe knee pathology. "${icdD}" (${icd}) is unlikely to justify this surgery.`,
    fix: () => "Use M17.11 (Primary Osteoarthritis, Right Knee) or M17.12 (Left Knee). Most payers require documented severe joint deterioration for arthroplasty approval.",
    liveLabel: "Knee replacement requires a severe knee pathology diagnosis",
  },
  // Hip replacement with non-hip diagnosis
  {
    match: (cpt, icd) => cpt === "27130" && !["M16.11","M16.12"].includes(icd),
    severity: "error",
    message: (_, __, icd, icdD) => `CPT 27130 (Total Hip Arthroplasty) requires hip pathology. "${icdD}" (${icd}) does not justify this procedure.`,
    fix: () => "Use M16.11 (Primary Osteoarthritis, Right Hip) or M16.12 (Left Hip). Prior authorization is typically required with supporting imaging and clinical notes.",
    liveLabel: "Hip replacement requires a hip-specific osteoarthritis or pathology diagnosis",
  },
  // Physical/Occupational therapy with non-musculoskeletal/neurological
  {
    match: (cpt, _, __, icdCat) => ["97110","97140","97530","97012","97165","97166","97167","97168","97535","97537","97542"].includes(cpt) && !["Musculoskeletal","Injury","Neurological"].includes(icdCat),
    severity: "warning",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) with "${icdD}" (${icd}) may lack documented PT/OT medical necessity.`,
    fix: () => "PT and OT codes require a musculoskeletal, injury, or neurological diagnosis supported by documented functional deficits. Use M54.5 (low back pain), S46.011A (rotator cuff tear), G81.10 (hemiplegia), or G35 (MS). Payers may request the treatment plan.",
    liveLabel: "PT/OT codes require a musculoskeletal, injury, or neurological diagnosis",
  },
  // ECG with musculoskeletal
  {
    match: (cpt, _, __, icdCat) => ["93000","93010"].includes(cpt) && icdCat === "Musculoskeletal",
    severity: "warning",
    message: (_, __, icd, icdD) => `ECG billed with musculoskeletal diagnosis "${icdD}" (${icd}) may be questioned for medical necessity.`,
    fix: () => "Document why an ECG was clinically indicated (e.g., pre-op cardiac clearance). If a cardiovascular condition was also addressed, add it as a secondary diagnosis (e.g., I10 for hypertension).",
    liveLabel: "ECG medical necessity may be questioned with a musculoskeletal primary diagnosis",
  },
  // Echo with non-cardiovascular
  {
    match: (cpt, _, __, icdCat) => cpt === "93306" && icdCat !== "Cardiovascular",
    severity: "warning",
    message: (_, __, icd, icdD) => `CPT 93306 (Echocardiography) with "${icdD}" (${icd}) may lack documented cardiac indication.`,
    fix: () => "Add a cardiovascular diagnosis (e.g., I50.9 Heart Failure, I48.91 Atrial Fibrillation) to support medical necessity. Document the clinical reason an echo was ordered.",
    liveLabel: "Echocardiogram typically requires a cardiovascular primary diagnosis",
  },
  // Chest X-ray with non-respiratory/cardiovascular
  {
    match: (cpt, _, __, icdCat) => cpt === "71046" && !["Respiratory","Cardiovascular"].includes(icdCat),
    severity: "warning",
    message: (_, __, icd, icdD) => `CPT 71046 (Chest X-Ray) with "${icdD}" (${icd}) may lack documented respiratory or cardiac necessity.`,
    fix: () => "Document the clinical reason a chest X-ray was ordered. Add a respiratory or cardiovascular secondary diagnosis if applicable (e.g., J06.9 for URI symptoms).",
    liveLabel: "Chest X-ray typically requires a respiratory or cardiovascular primary diagnosis",
  },
  // Knee MRI with non-knee
  {
    match: (cpt, icd, _, icdCat) => cpt === "73721" && !["M17.11","M17.12","M23.61","M23.62","S83.511A","S83.512A"].includes(icd) && icdCat !== "Injury",
    severity: "warning",
    message: (_, __, icd, icdD) => `CPT 73721 (MRI Knee) with "${icdD}" (${icd}) may not demonstrate medical necessity for knee imaging.`,
    fix: () => "Ensure the diagnosis reflects a knee condition. Use M17.11/M17.12 for osteoarthritis, M23.61/M23.62 for ligament issues, or S83.511A/S83.512A for ACL sprain.",
    liveLabel: "Knee MRI typically requires a knee-specific diagnosis",
  },
  // Lumbar MRI with non-back
  {
    match: (cpt, icd) => cpt === "72148" && !["M54.5","M54.16","G89.29"].includes(icd),
    severity: "warning",
    message: (_, __, icd, icdD) => `CPT 72148 (MRI Lumbar Spine) with "${icdD}" (${icd}) may require additional documentation of lumbar pathology.`,
    fix: () => "Use M54.5 (Low Back Pain) or M54.16 (Lumbar Radiculopathy) to support medical necessity for lumbar spine imaging. Document conservative treatment failure if required by payer.",
    liveLabel: "Lumbar MRI typically requires a low back or radiculopathy diagnosis",
  },
  // Psych therapy with non-mental-health
  {
    match: (cpt, _, __, icdCat) => ["90791","90834","90837","90847"].includes(cpt) && icdCat !== "Mental Health",
    severity: "warning",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) with "${icdD}" (${icd}) — psychiatric services require a mental health diagnosis.`,
    fix: () => "Add a mental health diagnosis as the primary: F32.1 (Depression), F41.1 (Anxiety), or F43.10 (Adjustment Disorder). Payers require a qualifying DSM-5 diagnosis for mental health claim approval.",
    liveLabel: "Psychotherapy requires a mental health diagnosis (e.g., F32.1, F41.1)",
  },
  // Preventive CPT with non-preventive ICD
  {
    match: (cpt, _, __, icdCat) => ["99395","99396","99397","99385","99386","99387"].includes(cpt) && icdCat !== "Preventive",
    severity: "warning",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) is a preventive medicine code but "${icdD}" (${icd}) is not a preventive/wellness diagnosis.`,
    fix: () => "Use Z00.00 or Z00.01 (General Medical Exam) as the primary diagnosis for preventive visits. If an acute problem was also addressed, bill the corresponding E&M code separately with Modifier -25.",
    liveLabel: "Preventive medicine CPT codes expect a preventive/wellness diagnosis",
  },
  // Family history as primary
  {
    match: (_, __, ___, icdCat) => icdCat === "Family History",
    severity: "warning",
    message: (_, __, icd, icdD) => `${icd} (${icdD}) is a family history code and must not be the primary diagnosis.`,
    fix: () => "Family history codes (Z80–Z84) must be secondary diagnoses. Place the primary condition being treated first and move this to a secondary position on the claim.",
    liveLabel: "Family history codes cannot be primary diagnosis — must be secondary",
  },
  // ER E&M with wellness diagnosis
  {
    match: (cpt, icd) => ["99281","99282","99283","99284","99285"].includes(cpt) && ["Z00.00","Z00.01","Z23"].includes(icd),
    severity: "error",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) billed with ${icd} (${icdD}) will be denied. ED visits cannot be billed for scheduled wellness encounters.`,
    fix: () => "ED visit codes (99281–99285) require an acute, unscheduled medical complaint. Replace the wellness diagnosis with the acute presenting diagnosis (e.g., R07.9 chest pain, R06.00 dyspnea, R10.9 abdominal pain).",
    liveLabel: "Emergency dept codes cannot be billed with a wellness or preventive diagnosis",
  },
  // ER E&M with preventive CPT family
  {
    match: (cpt, _, __, icdCat) => ["99281","99282","99283","99284","99285"].includes(cpt) && icdCat === "Preventive",
    severity: "error",
    message: (cpt, cptD, icd, icdD) => `ED visit CPT ${cpt} (${cptD}) paired with preventive diagnosis ${icd} (${icdD}) is not a valid billing combination.`,
    fix: () => "Emergency visits require an acute presenting diagnosis. Use the primary reason the patient came to the ED (chest pain, shortness of breath, injury, etc.) as the principal ICD-10 code.",
    liveLabel: "ED visit codes require an acute presenting complaint, not a preventive diagnosis",
  },
  // Appendectomy requires appendicitis
  {
    match: (cpt, icd) => ["44950","44970"].includes(cpt) && !["K37","K35.80","K35.89"].includes(icd),
    severity: "error",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) requires an appendicitis diagnosis. "${icdD}" (${icd}) does not justify an appendectomy.`,
    fix: () => "Use K35.80 (Acute Appendicitis w/o Abscess), K35.89 (Acute Appendicitis with Complications), or K37 (Unspecified Appendicitis). Payers will deny appendectomy claims without a matching appendicitis diagnosis.",
    liveLabel: "Appendectomy requires an appendicitis diagnosis (K35.80, K37)",
  },
  // Laparoscopic cholecystectomy requires gallbladder diagnosis
  {
    match: (cpt, icd) => ["47562","47600"].includes(cpt) && !["K80.20","K81.0","K81.1","K80.00"].includes(icd),
    severity: "error",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) requires a gallbladder pathology diagnosis. "${icdD}" (${icd}) does not support this procedure.`,
    fix: () => "Use K81.0 (Acute Cholecystitis), K80.20 (Gallstones w/o Cholecystitis), or K80.00 (Gallstones w/ Acute Cholecystitis). Prior authorization is typically required with imaging documentation.",
    liveLabel: "Cholecystectomy requires a gallbladder diagnosis (K81.0, K80.20)",
  },
  // Hip fracture ORIF requires hip/femoral fracture
  {
    match: (cpt, icd) => cpt === "27236" && !["S72.001A","S72.002A"].includes(icd),
    severity: "error",
    message: (_, __, icd, icdD) => `CPT 27236 (Femoral Neck Fracture Fixation) requires a femoral fracture diagnosis. "${icdD}" (${icd}) does not support this procedure.`,
    fix: () => "Use S72.001A (Right Femoral Head Fracture, Initial) or S72.002A (Left). Surgical fixation of hip fractures requires laterality-specific fracture coding. Payers cross-check procedure and fracture site.",
    liveLabel: "Femoral fracture fixation requires a matching hip/femur fracture diagnosis",
  },
  // Wrist/forearm fracture repair requires matching fracture
  {
    match: (cpt, icd) => cpt === "25600" && !["S52.001A"].includes(icd),
    severity: "warning",
    message: (_, __, icd, icdD) => `CPT 25600 (Colles Fracture Treatment) paired with "${icdD}" (${icd}) — verify the fracture site matches the procedure performed.`,
    fix: () => "Colles fracture treatment (25600) requires a distal radius/ulna fracture code. Use S52.001A for ulnar fractures or the appropriate S52.5xx code for distal radius fractures.",
    liveLabel: "Wrist fracture treatment requires a distal forearm fracture diagnosis",
  },
  // High-level ER code with very minor diagnosis
  {
    match: (cpt, _, __, icdCat) => ["99284","99285"].includes(cpt) && ["Preventive","Family History"].includes(icdCat),
    severity: "warning",
    message: (cpt, cptD, icd, icdD) => `High-acuity ED code ${cpt} (${cptD}) with "${icdD}" (${icd}) is likely to trigger a medical necessity audit.`,
    fix: () => "Level 4–5 ED visits require documented high medical decision complexity or threat to life. Ensure the primary diagnosis reflects the severity that justified this E&M level. Add objective clinical findings to the chart notes.",
    liveLabel: "High-acuity ED code with low-acuity diagnosis may trigger a medical necessity review",
  },
  // Surgical code with wellness/preventive primary
  {
    match: (cpt, _, __, icdCat) => ["44950","44970","47562","47600","27236","27759","25600"].includes(cpt) && icdCat === "Preventive",
    severity: "error",
    message: (cpt, cptD, icd, icdD) => `Surgical CPT ${cpt} (${cptD}) cannot be billed with a preventive/wellness diagnosis "${icdD}" (${icd}).`,
    fix: () => "Replace the preventive diagnosis with the pathology that necessitated surgery (e.g., K81.0 for cholecystectomy, K35.80 for appendectomy, S72.001A for hip fracture fixation). Post-op aftercare should use Z48.89.",
    liveLabel: "Surgical procedure codes cannot be paired with preventive/wellness diagnoses",
  },
  // Spirometry with non-respiratory
  {
    match: (cpt, _, __, icdCat) => ["94010","94060","94375","94620"].includes(cpt) && !["Respiratory","Emergency"].includes(icdCat),
    severity: "warning",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) with "${icdD}" (${icd}) may lack a documented pulmonary indication.`,
    fix: () => "Pulmonary function tests require a respiratory diagnosis. Use J44.1 (COPD), J45.21 (Asthma, Acute Exacerbation), J43.9 (Emphysema), or J84.10 (Pulmonary Fibrosis). Document clinical symptoms and the specific spirometry indication in chart notes.",
    liveLabel: "Pulmonary function tests require a documented respiratory diagnosis",
  },
  // CT Chest with non-thoracic diagnosis
  {
    match: (cpt, _, __, icdCat) => ["71250","71270"].includes(cpt) && !["Respiratory","Cardiovascular","Emergency","Injury"].includes(icdCat),
    severity: "warning",
    message: (_, __, icd, icdD) => `CT Chest with "${icdD}" (${icd}) may require additional documentation of thoracic clinical necessity.`,
    fix: () => "CT Chest is typically indicated for thoracic conditions. Add a respiratory or cardiovascular primary diagnosis (e.g., J18.9 Pneumonia, J44.1 COPD, R91.8 Abnormal Lung Finding, C34.10 Lung Malignancy). Payers may require prior auth without a clear thoracic indication.",
    liveLabel: "CT Chest typically requires a respiratory, cardiovascular, or thoracic diagnosis",
  },
  // CT Abdomen/Pelvis with non-abdominal diagnosis
  {
    match: (cpt, _, __, icdCat) => ["74177","74178"].includes(cpt) && !["Gastrointestinal","Genitourinary","Urology","Emergency","Injury"].includes(icdCat),
    severity: "warning",
    message: (_, __, icd, icdD) => `CT Abdomen/Pelvis with "${icdD}" (${icd}) may require additional documentation of abdominal/pelvic indication.`,
    fix: () => "CT Abdomen/Pelvis requires an abdominal or pelvic clinical indication. Use R10.9 (Abdominal Pain), K81.0 (Cholecystitis), K37 (Appendicitis), or R19.00 (Abdominal Mass). Payers typically require prior authorization for CT without a supporting clinical diagnosis.",
    liveLabel: "CT Abdomen/Pelvis typically requires an abdominal or pelvic diagnosis",
  },
  // MRI Brain with non-neurological
  {
    match: (cpt, _, __, icdCat) => ["70551","70553"].includes(cpt) && !["Neurological","Emergency","Injury"].includes(icdCat),
    severity: "warning",
    message: (_, __, icd, icdD) => `MRI Brain with "${icdD}" (${icd}) may lack a documented neurological indication.`,
    fix: () => "Add a neurological primary diagnosis to support brain MRI (e.g., G43.909 Migraine, R51.9 Headache, R93.0 Abnormal Head Imaging Findings, G35 Multiple Sclerosis). Many payers require prior auth for brain MRI without a clear neurological indication.",
    liveLabel: "Brain MRI typically requires a neurological primary diagnosis",
  },
  // Screening mammography with non-screening diagnosis
  {
    match: (cpt, icd) => cpt === "77067" && !["Z12.31","Z00.00","Z00.01"].includes(icd),
    severity: "warning",
    message: (_, __, icd, icdD) => `Screening mammography (77067) with "${icdD}" (${icd}) — verify this is a preventive screening encounter, not a diagnostic study.`,
    fix: () => "Use Z12.31 (Encounter for Screening Mammogram) for preventive bilateral mammography. If the patient has a breast symptom, lump, or abnormal finding, bill diagnostic mammography (77065 or 77066) instead, with the appropriate clinical diagnosis code.",
    liveLabel: "Screening mammography (77067) requires a screening or preventive diagnosis",
  },
  // Thoracentesis without pleural/respiratory
  {
    match: (cpt, _, __, icdCat) => cpt === "32555" && !["Respiratory","Emergency"].includes(icdCat),
    severity: "error",
    message: (_, __, icd, icdD) => `CPT 32555 (Thoracentesis) with "${icdD}" (${icd}) lacks a documented pleural or thoracic indication.`,
    fix: () => "Thoracentesis requires a pleural or thoracic diagnosis: J90 (Pleural Effusion), J93.11 (Spontaneous Pneumothorax), or J18.9 (Pneumonia with effusion). Payers will deny without a supporting thoracic indication documented in chart notes.",
    liveLabel: "Thoracentesis requires a pleural effusion or respiratory primary diagnosis",
  },
  // Inhalation treatment with non-respiratory
  {
    match: (cpt, _, __, icdCat) => ["94640","94664"].includes(cpt) && icdCat !== "Respiratory",
    severity: "warning",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) with "${icdD}" (${icd}) — inhalation treatments require a respiratory indication.`,
    fix: () => "Nebulizer and inhalation treatments are indicated for respiratory conditions. Use J45.21 (Asthma, Acute Exacerbation), J44.1 (COPD Exacerbation), or J18.9 (Pneumonia) as the primary diagnosis. Payers expect a qualifying respiratory code.",
    liveLabel: "Inhalation therapy requires a respiratory primary diagnosis",
  },
  // OT evaluation codes with non-qualifying diagnosis
  {
    match: (cpt, _, __, icdCat) => ["97165","97166","97167","97168","97535","97537","97542"].includes(cpt) && !["Musculoskeletal","Injury","Neurological"].includes(icdCat),
    severity: "warning",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) with "${icdD}" (${icd}) may lack documented OT medical necessity.`,
    fix: () => "Occupational therapy codes require a functional deficit documented in the treatment plan. Use a musculoskeletal, injury, or neurological diagnosis (e.g., M54.5, S46.011A, G81.10, G35). Payers will request documentation of ADL limitations and treatment goals.",
    liveLabel: "Occupational therapy codes require a musculoskeletal, injury, or neurological diagnosis",
  },
  // Ultrasound Abdomen with non-abdominal
  {
    match: (cpt, _, __, icdCat) => cpt === "76700" && !["Gastrointestinal","Genitourinary","Urology","Emergency","Cardiovascular"].includes(icdCat),
    severity: "warning",
    message: (_, __, icd, icdD) => `Abdominal ultrasound (76700) with "${icdD}" (${icd}) may lack a documented abdominal indication.`,
    fix: () => "Abdominal ultrasound requires an abdominal or pelvic clinical indication. Common supporting diagnoses: R10.9 (Abdominal Pain), K81.0 (Cholecystitis), R19.00 (Abdominal Mass), K21.0 (GERD). Document the specific clinical reason the ultrasound was ordered.",
    liveLabel: "Abdominal ultrasound typically requires an abdominal or pelvic indication",
  },
  // ─── Urology-Specific Rules ───────────────────────────────────────────────
  // Cystoscopy with non-urological diagnosis
  {
    match: (cpt, _, __, icdCat) => ["52000","52001","52204","52310","52332","52353"].includes(cpt) && !["Urology","Genitourinary"].includes(icdCat),
    severity: "error",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) requires a genitourinary diagnosis. "${icdD}" (${icd}) does not support cystoscopy — expect CO-11 denial.`,
    fix: () => "Cystoscopy requires a urological indication: R31.0 (Gross Hematuria), N40.1 (BPH with LUTS), N30.10 (Interstitial Cystitis), N20.1 (Ureteral Stone), or N21.0 (Bladder Stone). Non-GU diagnoses will result in a CO-11 denial.",
    liveLabel: "Cystoscopy requires a genitourinary/urology diagnosis (hematuria, BPH, stone)",
  },
  // ESWL without a urinary stone diagnosis
  {
    match: (cpt, icd) => cpt === "50590" && !["N20.0","N20.1","N20.2","N21.0"].includes(icd),
    severity: "error",
    message: (_, __, icd, icdD) => `CPT 50590 (ESWL — Lithotripsy) requires a urinary calculus diagnosis. "${icdD}" (${icd}) does not support this procedure — payers auto-deny without a stone diagnosis.`,
    fix: () => "ESWL requires a calculus diagnosis: N20.0 (Calculus of Kidney), N20.1 (Calculus of Ureter), N20.2 (Both), or N21.0 (Bladder Stone). Stone size and laterality should be documented in the operative note to support medical necessity.",
    liveLabel: "ESWL requires a urinary calculus diagnosis (N20.0, N20.1, N21.0)",
  },
  // TURP without prostate/BPH diagnosis
  {
    match: (cpt, icd) => ["52601","52630"].includes(cpt) && !["N40.0","N40.1","N40.2","N40.3","C61","D29.1"].includes(icd),
    severity: "error",
    message: (_, __, icd, icdD) => `CPT 52601 (TURP) requires a prostate pathology diagnosis. "${icdD}" (${icd}) does not support transurethral resection of the prostate — expect a CO-11 denial.`,
    fix: () => "TURP requires a prostate diagnosis: N40.1 (BPH with LUTS), N40.0 (BPH without LUTS), C61 (Prostate Carcinoma), or D29.1 (Benign Neoplasm of Prostate). Payers auto-deny TURP without a matching prostate pathology diagnosis.",
    liveLabel: "TURP requires a prostate pathology diagnosis (BPH, prostate cancer)",
  },
  // PSA with non-prostate/non-urological primary
  {
    match: (cpt, _, __, icdCat) => ["84153","84154"].includes(cpt) && ["Preventive","Mental Health","Musculoskeletal","Respiratory","Cardiovascular","Gastrointestinal"].includes(icdCat),
    severity: "warning",
    message: (_, __, icd, icdD) => `PSA test billed with "${icdD}" (${icd}) — Medicare requires a prostate-related diagnosis for diagnostic PSA (84153). For annual screening, use G0103 + Z12.5 instead.`,
    fix: () => "For diagnostic PSA: use N40.1 (BPH with LUTS), R35.0 (Urinary Frequency), R31.0 (Hematuria), or R97.20 (Elevated PSA follow-up). For Medicare annual PSA screening benefit: bill HCPCS G0103 with Z12.5 — not CPT 84153 with Z00.00.",
    liveLabel: "Diagnostic PSA requires a prostate-related diagnosis; annual Medicare screening uses G0103 + Z12.5",
  },
  // Prostate biopsy without elevated PSA or prostate indication
  {
    match: (cpt, icd, _, icdCat) => ["55700","55706"].includes(cpt) && !["N40.0","N40.1","N40.2","N40.3","C61","R97.20","D29.1"].includes(icd) && !["Urology"].includes(icdCat),
    severity: "warning",
    message: (cpt, cptD, icd, icdD) => `Prostate biopsy (${cpt} — ${cptD}) billed with "${icdD}" (${icd}) may lack documented medical necessity. Payers require elevated PSA, abnormal DRE, or suspicious imaging finding.`,
    fix: () => "Use R97.20 (Elevated PSA) if PSA > 4.0 ng/mL drove the biopsy decision. For abnormal DRE with BPH: use N40.1 (BPH with LUTS). For suspected malignancy: use C61 (Prostate Carcinoma). The ICD-10 must reflect the specific indication — not a generic benign prostate code.",
    liveLabel: "Prostate biopsy requires elevated PSA (R97.20), BPH, or prostate malignancy diagnosis",
  },
  // Urodynamics without incontinence or retention
  {
    match: (cpt, icd) => ["51726","51727","51728","51729"].includes(cpt) && !["N39.3","N39.41","N39.46","R33.8","R33.9","N30.10"].includes(icd),
    severity: "warning",
    message: (_, __, icd, icdD) => `Complex urodynamic testing billed with "${icdD}" (${icd}) — payers require documented incontinence or voiding dysfunction as the primary indication.`,
    fix: () => "Urodynamic testing (51726–51729) requires an incontinence or voiding disorder diagnosis: N39.3 (Stress Incontinence), N39.41 (Urge Incontinence), N39.46 (Mixed Incontinence), R33.9 (Urinary Retention), or N30.10 (Interstitial Cystitis). Document failed conservative treatment (pelvic floor PT) to support prior authorization.",
    liveLabel: "Urodynamic testing requires an incontinence or urinary retention diagnosis",
  },
];

// ─── Specialty Configurations ─────────────────────────────────────────────────

export interface SpecialtyConfig {
  id: string;
  label: string;
  color: string;       // tailwind color name, e.g. "blue"
  description: string;
  checks: string[];
  commonDenials: string[];
  cptCodes: string[];
  icd10Codes: string[];
}

export const SPECIALTY_CONFIGS: Record<string, SpecialtyConfig> = {
  "family-medicine": {
    id: "family-medicine",
    label: "Family Medicine",
    color: "blue",
    description: "Broad primary care — acute visits, chronic disease management, preventive exams, and routine labs.",
    checks: [
      "Wellness vs. E&M code confusion (Z00.00 requires preventive CPT)",
      "Age-appropriate preventive medicine code selection",
      "Chronic disease management with correct specificity",
      "Lab medical necessity documentation",
    ],
    commonDenials: [
      "Billing 99213 with Z00.00 — use 99395–99397 instead",
      "Missing Modifier -25 on same-day E&M + preventive",
      "Unspecified diagnosis codes when specific codes exist",
    ],
    cptCodes: ["99201","99202","99203","99204","99205","99211","99212","99213","99214","99215","99395","99396","99397","80053","85027","83036","84443","82947","93000"],
    icd10Codes: ["M54.5","I10","E11.9","E78.5","J06.9","Z00.00","Z00.01","Z23","F41.1","K21.0","N39.0","R51.9","R05.9","E03.9"],
  },
  "orthopedics": {
    id: "orthopedics",
    label: "Orthopedics",
    color: "orange",
    description: "Musculoskeletal procedures, joint surgery, fracture treatment, and imaging — all with strict site-matching requirements.",
    checks: [
      "Procedure and diagnosis must match joint site (knee, hip, shoulder)",
      "Prior authorization for joint replacement surgery",
      "Fracture treatment vs. E&M code distinction",
      "MRI and X-ray medical necessity vs. diagnosis",
    ],
    commonDenials: [
      "Arthroscopy without a joint-specific diagnosis code",
      "Joint replacement without documented OA severity",
      "Missing laterality (left/right) on extremity diagnosis codes",
    ],
    cptCodes: ["29881","29827","27447","27130","28450","20610","73721","72148","73030","97001","99213","99214"],
    icd10Codes: ["M17.11","M17.12","M16.11","M25.511","M25.512","M75.1","M23.61","M23.62","M54.5","M54.16","S92.501A","S83.511A","S83.512A","S46.011A","G89.29"],
  },
  "cardiology": {
    id: "cardiology",
    label: "Cardiology",
    color: "pink",
    description: "Cardiac diagnostics and management — ECG, echo, stress testing, and cardiovascular disease coding.",
    checks: [
      "ECG and echocardiography require a cardiovascular primary diagnosis",
      "Stress test indication must be documented in chart notes",
      "Payer prior auth for echocardiography in some plans",
      "Cardiology codes questioned with unrelated primary diagnoses",
    ],
    commonDenials: [
      "ECG (93000) with musculoskeletal or unrelated primary diagnosis",
      "Echo (93306) without documented cardiac indication",
      "Stress test billed without chest pain or cardiac risk documentation",
    ],
    cptCodes: ["93000","93010","93306","93015","99213","99214","99215","80053","82947"],
    icd10Codes: ["I10","I25.10","I48.91","I50.9","R00.0","R55","E78.5","E11.9","E03.9"],
  },
  "behavioral-health": {
    id: "behavioral-health",
    label: "Behavioral Health",
    color: "violet",
    description: "Psychiatric evaluation, individual and family psychotherapy — all requiring DSM-5 diagnosis codes.",
    checks: [
      "Mental health diagnosis (DSM-5) required for all therapy claims",
      "Session duration must match CPT code (45 min vs. 60 min)",
      "Prior authorization for ongoing therapy beyond initial sessions",
      "E&M and psychotherapy billed together require documentation",
    ],
    commonDenials: [
      "Therapy CPT without a qualifying DSM-5 diagnosis code",
      "Session time code mismatch (90834 vs. 90837)",
      "Non-covered behavioral health services per payer plan",
    ],
    cptCodes: ["90791","90834","90837","90847","99213","99214"],
    icd10Codes: ["F32.1","F33.0","F41.1","F43.10"],
  },
  "physical-occupational-therapy": {
    id: "physical-occupational-therapy",
    label: "Physical & Occupational Therapy",
    color: "teal",
    description: "PT and OT rehabilitation — therapeutic exercise, manual therapy, ADL reintegration, and self-care training tied to musculoskeletal, injury, and neurological diagnoses.",
    checks: [
      "Musculoskeletal, injury, or neurological diagnosis required for all PT/OT codes",
      "OT evaluation complexity (97165–97167) must match documented ADL deficits",
      "Functional deficit must be documented in the treatment plan",
      "Correct 15-minute unit billing per CPT guidelines — units must match chart time",
    ],
    commonDenials: [
      "PT/OT codes billed with non-qualifying primary diagnosis",
      "Missing or expired treatment plan or medical necessity certification",
      "Exceeding payer-allowed units per visit or episode of care",
      "OT and PT billed same-day without separate documentation of distinct goals",
    ],
    cptCodes: ["97001","97110","97140","97530","97012","97165","97166","97167","97168","97535","97537","97542"],
    icd10Codes: ["M54.5","M54.2","M17.11","M25.511","M75.1","M62.81","S83.511A","S46.011A","G89.29","M54.16","M23.61","R26.89","G81.10","G35","Z96.641","Z96.642"],
  },
  "preventive-care": {
    id: "preventive-care",
    label: "Preventive Care",
    color: "emerald",
    description: "Annual wellness exams, immunizations, screenings, and age-specific preventive medicine codes.",
    checks: [
      "Age-appropriate preventive CPT code selection (18–39, 40–64, 65+)",
      "Preventive diagnosis (Z00.xx) required for preventive CPT codes",
      "Lab bundling rules apply — panels may not be billed separately",
      "Modifier -25 required when E&M is billed with preventive same-day",
    ],
    commonDenials: [
      "Wrong age bracket preventive code (e.g., 99395 for a 70-year-old)",
      "Preventive CPT billed with a problem-focused diagnosis only",
      "Separate billing of components already bundled in a panel",
    ],
    cptCodes: ["99385","99386","99387","99395","99396","99397","80053","85027","83036","84443","82947","93000","71046"],
    icd10Codes: ["Z00.00","Z00.01","Z23","Z01.00","Z12.11","I10","E78.5","E11.9"],
  },
  "urgent-emergency": {
    id: "urgent-emergency",
    label: "Urgent & Emergency Care",
    color: "amber",
    description: "Acute, unscheduled urgent care and ED visits — strict E&M level documentation, acute diagnosis requirements, and ER-specific code compliance.",
    checks: [
      "ED-level E&M codes (99281–99285) require acute, unscheduled presenting complaint",
      "E&M level must match documented medical decision complexity",
      "New vs. established patient status verified for urgent care codes",
      "Acute diagnosis required — wellness codes are never valid for ED/urgent visits",
    ],
    commonDenials: [
      "ED code (99281–99285) billed with a wellness or preventive diagnosis",
      "E&M level too high for documented complexity in chart notes",
      "New patient code (992xx) billed for an established patient",
      "Fracture or laceration CPT without supporting imaging or clinical exam note",
    ],
    cptCodes: ["99281","99282","99283","99284","99285","99203","99204","99213","99214","71046","93000","10060","10061"],
    icd10Codes: ["R07.9","R07.4","R06.00","R10.9","R10.0","R10.31","R50.9","E86.0","J06.9","J18.9","N39.0","S92.501A","S93.401A","S01.411A","S61.211A","R51.9","R00.0"],
  },
  "radiology": {
    id: "radiology",
    label: "Radiology",
    color: "indigo",
    description: "Diagnostic imaging — X-ray, CT, MRI, ultrasound, and nuclear medicine — each requiring a site-specific clinical indication and payer-specific prior auth compliance.",
    checks: [
      "Imaging site must match the primary diagnosis anatomical location",
      "CT and MRI studies often require prior authorization — verify per payer plan",
      "Contrast vs. non-contrast selection must match the clinical indication",
      "Screening vs. diagnostic imaging codes differ — wrong choice triggers automatic denial",
    ],
    commonDenials: [
      "MRI or CT without a supporting site-specific clinical indication or prior auth",
      "Imaging site mismatch with primary diagnosis (e.g., knee MRI with back pain code)",
      "Screening mammography (77067) billed with a symptom or diagnostic diagnosis",
      "Duplicate imaging — same modality and site ordered within a short timeframe",
    ],
    cptCodes: ["71046","71250","71270","74177","74178","73721","72148","72141","70553","70551","73030","76700","76805","77067","78452"],
    icd10Codes: ["M54.5","M54.16","J18.9","J44.1","R91.8","C34.10","M17.11","M23.61","I50.9","I48.91","G43.909","R51.9","R93.0","R19.00","Z12.31","R07.9","S72.001A"],
  },
  "pulmonology": {
    id: "pulmonology",
    label: "Pulmonology",
    color: "sky",
    description: "Respiratory diagnostics and treatment — pulmonary function tests, inhalation therapy, thoracentesis, and ventilation management with strict respiratory diagnosis requirements.",
    checks: [
      "Pulmonary function tests (94010, 94060) require a documented respiratory diagnosis",
      "Inhalation treatments (94640, 94664) require a qualifying respiratory primary diagnosis",
      "Thoracentesis (32555) must document pleural effusion or pneumothorax indication",
      "Ventilation management (94002) requires inpatient setting documentation",
    ],
    commonDenials: [
      "Spirometry billed without a respiratory indication documented in chart notes",
      "Inhalation treatment without a qualifying exacerbation diagnosis (J45.21, J44.1)",
      "Thoracentesis without documented pleural pathology (J90, J93.11)",
      "Pulmonary stress test billed without documented clinical indication or prior auth",
    ],
    cptCodes: ["94010","94060","94375","94620","94640","94664","31500","32555","94002","71046","71250","71270","93000","99213","99214"],
    icd10Codes: ["J44.1","J45.20","J45.21","J45.41","J45.51","J43.9","J84.10","G47.33","J93.11","J90","J47.1","J18.9","J20.9","J06.9","R06.00","R06.09","R91.8","C34.10"],
  },
  "or-surgical": {
    id: "or-surgical",
    label: "OR / Surgical",
    color: "red",
    description: "Operative and pre/post-surgical billing — anatomical site matching, prior authorization for major procedures, and post-op modifier validation.",
    checks: [
      "Procedure diagnosis must match the anatomical site of surgery (appendix, gallbladder, joint, etc.)",
      "Laparoscopic vs. open approach affects CPT code selection (47562 vs. 47600)",
      "Prior authorization required for elective surgery — verify before submitting",
      "Post-op aftercare billed with Z48.89, not the original surgical diagnosis",
    ],
    commonDenials: [
      "Appendectomy or cholecystectomy without matching organ pathology diagnosis",
      "Fracture fixation with mismatched anatomical site or laterality",
      "Modifier -51 or -59 missing on same-session multiple procedures",
      "Surgical claim with wellness/preventive primary diagnosis",
    ],
    cptCodes: ["44950","44970","47562","47600","29881","29827","27447","27130","27236","27759","25600","28450","10060","10061","20610"],
    icd10Codes: ["K37","K35.80","K35.89","K81.0","K81.1","K80.20","K80.00","M17.11","M17.12","M16.11","M75.1","M23.61","S72.001A","S72.002A","S52.001A","S92.501A","S83.511A","S46.011A","Z48.89","T81.40XA"],
  },
  "urology": {
    id: "urology",
    label: "Urology",
    color: "blue",
    description: "Urological procedures and diagnostics — cystoscopy, ESWL, TURP, prostate biopsy, urodynamics, PSA testing, and hematuria workup — all with strict CPT/ICD-10 matching and prior authorization requirements.",
    checks: [
      "Cystoscopy (52000/52204) requires a GU diagnosis: R31.0 (Hematuria), N40.1 (BPH), or N20.1 (Ureteral Stone)",
      "ESWL (50590) requires a calculus diagnosis (N20.0, N20.1, N21.0) and prior authorization",
      "TURP (52601) requires a prostate pathology diagnosis: N40.1 (BPH with LUTS) or C61",
      "PSA: Medicare annual screening = G0103 + Z12.5; diagnostic PSA = 84153 + GU diagnosis per LCD L36012",
      "Prostate biopsy (55700/55706) requires R97.20 (Elevated PSA), abnormal DRE, or suspicious imaging",
      "Urodynamics (51726/51727) requires incontinence/retention diagnosis + auth + failed conservative treatment documentation",
      "Modifier -25 required on all same-day E&M + urology procedure pairs to prevent NCCI bundling",
    ],
    commonDenials: [
      "Cystoscopy with UTI (N39.0) instead of Hematuria (R31.0) — CO-11 auto-denial",
      "ESWL without prior authorization — CO-197 denial, no payment fallback",
      "PSA (84153) billed with Z00.00 (Annual Exam) — CO-50 Medicare medical necessity denial",
      "E&M billed same day as cystoscopy without Modifier -25 — CO-97 bundling denial",
      "Prostate biopsy without elevated PSA or abnormal DRE documentation — CO-50 denial",
      "CT Urogram (74177) without prior authorization — Aetna, UHC, BlueCross auto-deny",
      "Urodynamics (51726) without auth or documentation of failed pelvic floor PT — CO-197 denial",
    ],
    cptCodes: [
      "52000","52001","52204","52310","52332","52353",
      "52601","52630","55700","55706","50590",
      "51700","51701","51702","51703",
      "51726","51727","51736","51741",
      "84153","84154","76872","76770","76775","74400",
      "74177","74178","99213","99214","99215",
    ],
    icd10Codes: [
      "N40.0","N40.1","N40.2","N40.3",
      "R31.0","R31.1","R31.9",
      "N20.0","N20.1","N20.2","N21.0","N13.30",
      "R97.20","C61","D29.1","N41.0","N41.1",
      "N39.0","N39.3","N39.41","N39.46",
      "N30.00","N30.10","R33.8","R33.9","R35.0","R35.1",
      "C67.9","C64.1","C64.2","N43.3","N44.0","N45.1",
      "Z12.5","Z80.42",
    ],
  },
};

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ScrubError {
  field: string;
  severity: "error" | "warning" | "info";
  message: string;
  fix: string;
}

export function scrubClaim(claim: {
  patient: string;
  dob: string;
  insuranceId: string;
  cpt: string;
  icd10: string;
}): ScrubError[] {
  const result: ScrubError[] = [];

  // Patient name
  if (!claim.patient.trim()) {
    result.push({ field: "patient", severity: "error", message: "Missing patient name.", fix: "Enter the patient's full legal name as it appears on their insurance card." });
  }

  // DOB
  if (!claim.dob) {
    result.push({ field: "dob", severity: "error", message: "Missing date of birth.", fix: "Enter the patient's date of birth. Payers use this to match the claim to the correct member record." });
  }

  // Insurance ID — info if missing, warning if malformed
  if (!claim.insuranceId.trim()) {
    result.push({ field: "insuranceId", severity: "info", message: "No insurance member ID entered.", fix: "Adding the member ID enables payer-specific eligibility checks. Format is usually 2–4 letters, a hyphen, then 6+ digits (e.g., BCB-4821039)." });
  } else if (!/^[A-Z]{2,4}-\d{6,}$/.test(claim.insuranceId.trim())) {
    result.push({ field: "insuranceId", severity: "warning", message: "Insurance ID format looks unusual (expected: XXX-0000000).", fix: "Verify the member ID on the insurance card. Common formats: 2–4 letter prefix, hyphen, 6+ digits (e.g., BCB-4821039)." });
  }

  // CPT — info if missing, warning if unrecognised
  const cptCode = claim.cpt.trim();
  if (!cptCode) {
    result.push({ field: "cpt", severity: "info", message: "No CPT procedure code entered.", fix: "Add a 5-digit CPT code to check procedure-specific billing rules and CPT/ICD-10 compatibility. Example: 99213 (office visit, established patient) or 99396 (preventive visit, age 40–64)." });
  } else if (!CPT_CODES[cptCode]) {
    result.push({ field: "cpt", severity: "warning", message: `CPT ${cptCode} is not in our reference library — verify it is valid and active.`, fix: "Check the AMA CPT code book or your billing software to confirm this code is active for the current year. Use the typeahead to explore known codes." });
  }

  // ICD-10 — info if missing, warning/error if malformed or unknown
  const icd = claim.icd10.trim().toUpperCase();
  if (!icd) {
    result.push({ field: "icd10", severity: "info", message: "No ICD-10 diagnosis code entered.", fix: "Add a diagnosis code to validate medical necessity. Example: M54.5 (low back pain), Z00.00 (annual wellness), J06.9 (upper respiratory infection)." });
  } else if (!/^[A-Z]\d{2}(\.\w+)?$/.test(icd)) {
    result.push({ field: "icd10", severity: "warning", message: `"${icd}" is not a valid ICD-10 format (expected e.g., M54.5, J06.9).`, fix: "ICD-10-CM codes: one letter + two digits + optional decimal + up to 4 characters. Use the typeahead to find the correct code." });
  } else if (!ICD10_CODES[icd]) {
    result.push({ field: "icd10", severity: "warning", message: `ICD-10 ${icd} is not in our reference library — verify it is billable.`, fix: "Confirm the code is as specific as possible. Avoid 'unspecified' codes when a more precise code exists. Use the typeahead to explore common codes." });
  }

  // Compatibility rules
  const cptInfo = CPT_CODES[cptCode];
  const icdInfo = ICD10_CODES[icd];

  if (cptCode && icd && cptInfo && icdInfo) {
    for (const rule of COMPAT_RULES) {
      if (rule.match(cptCode, icd, cptInfo.category, icdInfo.category)) {
        result.push({
          field: "icd10",
          severity: rule.severity,
          message: rule.message(cptCode, cptInfo.description, icd, icdInfo.description),
          fix: rule.fix(cptCode, icd),
        });
      }
    }
  }

  return result;
}
