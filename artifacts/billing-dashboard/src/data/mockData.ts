export type ClaimStatus = "Approved" | "Rejected" | "Pending";

export interface Claim {
  id: string;
  patient: string;
  dob: string;
  insuranceId: string;
  cpt: string;
  icd10: string;
  payer: string;
  amount: number;
  status: ClaimStatus;
  submittedAt: string;
  rejectionReason?: string;
}

export const INITIAL_CLAIMS: Claim[] = [
  { id: "CLM-2024-001", patient: "Margaret E. Thornton", dob: "1958-03-14", insuranceId: "BCB-4821039", cpt: "99213", icd10: "J06.9", payer: "BlueCross", amount: 145.00, status: "Approved", submittedAt: "2024-05-20T08:14:00Z" },
  { id: "CLM-2024-002", patient: "Robert L. Harrington", dob: "1972-07-22", insuranceId: "MCR-9932871", cpt: "93000", icd10: "R00.0", payer: "Medicare", amount: 89.50, status: "Approved", submittedAt: "2024-05-20T09:30:00Z" },
  { id: "CLM-2024-003", patient: "Sandra K. Watkins", dob: "1985-11-03", insuranceId: "AET-7761234", cpt: "99214", icd10: "M54.5", payer: "Aetna", amount: 220.00, status: "Rejected", submittedAt: "2024-05-21T10:05:00Z", rejectionReason: "Missing Modifier" },
  { id: "CLM-2024-004", patient: "James P. O'Brien", dob: "1963-01-30", insuranceId: "UHC-5548907", cpt: "29881", icd10: "M17.11", payer: "UnitedHealth", amount: 1850.00, status: "Approved", submittedAt: "2024-05-21T11:22:00Z" },
  { id: "CLM-2024-005", patient: "Linda F. Guerrero", dob: "1990-06-18", insuranceId: "MCD-3310045", cpt: "71046", icd10: "J18.9", payer: "Medicaid", amount: 175.00, status: "Pending", submittedAt: "2024-05-22T08:55:00Z" },
  { id: "CLM-2024-006", patient: "William T. Chambers", dob: "1948-09-05", insuranceId: "MCR-1192038", cpt: "99213", icd10: "E11.9", payer: "Medicare", amount: 145.00, status: "Rejected", submittedAt: "2024-05-22T13:40:00Z", rejectionReason: "Mismatched ICD-10 Code" },
  { id: "CLM-2024-007", patient: "Patricia H. Nguyen", dob: "1977-04-12", insuranceId: "BCB-8824511", cpt: "97110", icd10: "M54.5", payer: "BlueCross", amount: 95.00, status: "Approved", submittedAt: "2024-05-23T09:15:00Z" },
  { id: "CLM-2024-008", patient: "Charles B. Morrison", dob: "1968-12-28", insuranceId: "AET-9903312", cpt: "99214", icd10: "I10", payer: "Aetna", amount: 220.00, status: "Pending", submittedAt: "2024-05-23T14:20:00Z" },
  { id: "CLM-2024-009", patient: "Dorothy J. Sinclair", dob: "1955-08-17", insuranceId: "MCR-4467821", cpt: "93000", icd10: "I48.91", payer: "Medicare", amount: 89.50, status: "Approved", submittedAt: "2024-05-24T10:00:00Z" },
  { id: "CLM-2024-010", patient: "Michael R. Okafor", dob: "1982-02-07", insuranceId: "UHC-7712398", cpt: "29881", icd10: "M23.61", payer: "UnitedHealth", amount: 1850.00, status: "Rejected", submittedAt: "2024-05-24T11:45:00Z", rejectionReason: "Registration Error" },
  { id: "CLM-2024-011", patient: "Helen A. Bergman", dob: "1974-05-29", insuranceId: "BCB-3319204", cpt: "99213", icd10: "Z00.00", payer: "BlueCross", amount: 145.00, status: "Approved", submittedAt: "2024-05-25T08:30:00Z" },
  { id: "CLM-2024-012", patient: "Richard D. Estrada", dob: "1961-10-14", insuranceId: "MCD-8821047", cpt: "71046", icd10: "J96.00", payer: "Medicaid", amount: 175.00, status: "Pending", submittedAt: "2024-05-25T15:10:00Z" },
  { id: "CLM-2024-013", patient: "Barbara C. Kowalski", dob: "1943-03-21", insuranceId: "MCR-6643890", cpt: "99214", icd10: "F32.1", payer: "Medicare", amount: 220.00, status: "Rejected", submittedAt: "2024-05-26T09:55:00Z", rejectionReason: "Missing Prior Auth" },
  { id: "CLM-2024-014", patient: "Joseph M. Tanaka", dob: "1980-07-09", insuranceId: "AET-1120938", cpt: "97110", icd10: "M62.81", payer: "Aetna", amount: 95.00, status: "Approved", submittedAt: "2024-05-26T13:00:00Z" },
  { id: "CLM-2024-015", patient: "Nancy L. Fitzgerald", dob: "1969-01-25", insuranceId: "BCB-5510023", cpt: "93000", icd10: "Z82.49", payer: "BlueCross", amount: 89.50, status: "Pending", submittedAt: "2024-05-27T10:30:00Z" },
];

export const DENIAL_REASONS = [
  { name: "Missing Modifier", value: 28, color: "#3B82F6" },
  { name: "Mismatched ICD-10", value: 24, color: "#06B6D4" },
  { name: "Registration Error", value: 18, color: "#8B5CF6" },
  { name: "Non-covered Service", value: 16, color: "#F59E0B" },
  { name: "Missing Prior Auth", value: 14, color: "#EC4899" },
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

export const CPT_CODES: Record<string, { description: string; category: string }> = {
  "99213": { description: "Office Visit - Est. Patient, Level 3", category: "E&M" },
  "99214": { description: "Office Visit - Est. Patient, Level 4", category: "E&M" },
  "99203": { description: "Office Visit - New Patient, Level 3", category: "E&M" },
  "97110": { description: "Therapeutic Exercise", category: "Physical Therapy" },
  "29881": { description: "Knee Arthroscopy w/ Meniscectomy", category: "Surgery" },
  "93000": { description: "Electrocardiogram (ECG) - Routine", category: "Cardiology" },
  "71046": { description: "Chest X-Ray, 2 Views", category: "Radiology" },
  "28450": { description: "Treatment of Metatarsal Fracture", category: "Orthopedics" },
};

export const ICD10_CODES: Record<string, { description: string; category: string }> = {
  "M54.5": { description: "Low Back Pain", category: "Musculoskeletal" },
  "Z00.00": { description: "General Adult Medical Exam, w/o Abnormal Findings", category: "Preventive" },
  "J06.9": { description: "Acute Upper Respiratory Infection, Unspecified", category: "Respiratory" },
  "S92.501A": { description: "Displaced Fracture, Medial Cuneiform (Foot)", category: "Injury" },
  "M17.11": { description: "Primary Osteoarthritis, Right Knee", category: "Musculoskeletal" },
  "M23.61": { description: "Other Spontaneous Disruption of ACL, Right Knee", category: "Musculoskeletal" },
  "R00.0": { description: "Tachycardia, Unspecified", category: "Cardiovascular" },
  "I48.91": { description: "Unspecified Atrial Fibrillation", category: "Cardiovascular" },
  "I10": { description: "Essential (Primary) Hypertension", category: "Cardiovascular" },
  "J18.9": { description: "Pneumonia, Unspecified Organism", category: "Respiratory" },
  "E11.9": { description: "Type 2 Diabetes Mellitus w/o Complications", category: "Endocrine" },
  "F32.1": { description: "Major Depressive Disorder, Single Episode, Moderate", category: "Mental Health" },
  "Z82.49": { description: "Family Hx of Ischemic Heart Disease", category: "Family History" },
  "M62.81": { description: "Muscle Weakness, Shoulder Region", category: "Musculoskeletal" },
  "J96.00": { description: "Acute Respiratory Failure, Unspecified", category: "Respiratory" },
};

export interface ScrubError {
  field: string;
  severity: "error" | "warning";
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
  const errors: ScrubError[] = [];

  // Patient name
  if (!claim.patient.trim()) {
    errors.push({ field: "patient", severity: "error", message: "Patient name is required.", fix: "Enter the patient's full legal name as it appears on their insurance card." });
  }

  // DOB
  if (!claim.dob) {
    errors.push({ field: "dob", severity: "error", message: "Date of birth is required.", fix: "Enter the patient's date of birth." });
  }

  // Insurance ID
  if (!claim.insuranceId.trim()) {
    errors.push({ field: "insuranceId", severity: "error", message: "Insurance ID is required.", fix: "Enter the insurance member ID exactly as shown on the insurance card." });
  } else if (!/^[A-Z]{2,4}-\d{6,}$/.test(claim.insuranceId.trim())) {
    errors.push({ field: "insuranceId", severity: "warning", message: "Insurance ID format looks unusual (expected: XXX-0000000).", fix: "Verify the member ID with the insurance card. Common formats include a 2-4 letter prefix followed by a hyphen and 6+ digits (e.g., BCB-4821039)." });
  }

  // CPT
  const cptCode = claim.cpt.trim();
  if (!cptCode) {
    errors.push({ field: "cpt", severity: "error", message: "CPT code is required.", fix: "Enter a valid 5-digit CPT procedure code." });
  } else if (!CPT_CODES[cptCode]) {
    errors.push({ field: "cpt", severity: "warning", message: `CPT ${cptCode} is not in our reference list — verify it is valid and active.`, fix: "Check the AMA CPT code book or your billing software to confirm this code is active and billable for the current year." });
  }

  // ICD-10
  const icd = claim.icd10.trim().toUpperCase();
  if (!icd) {
    errors.push({ field: "icd10", severity: "error", message: "ICD-10 diagnosis code is required.", fix: "Enter a valid ICD-10-CM diagnosis code." });
  } else if (!/^[A-Z]\d{2}(\.\w+)?$/.test(icd)) {
    errors.push({ field: "icd10", severity: "error", message: `"${icd}" is not a valid ICD-10 format. Codes must include a decimal (e.g., M54.5, not M545).`, fix: "ICD-10-CM codes follow the pattern: one letter + two digits + optional decimal + up to 4 characters. Check your EHR or an ICD-10 lookup tool." });
  } else if (!ICD10_CODES[icd]) {
    errors.push({ field: "icd10", severity: "warning", message: `ICD-10 ${icd} is not in our common code reference — verify it is billable.`, fix: "Confirm the diagnosis code is as specific as possible (avoid 'unspecified' codes when a more specific code exists) and is covered by the payer for this service." });
  }

  // Clinical compatibility rules (only run if both CPT and ICD-10 are present and recognized)
  const cptInfo = CPT_CODES[cptCode];
  const icdInfo = ICD10_CODES[icd];

  if (cptCode && icd && cptInfo && icdInfo) {
    // Rule: E&M office visit for a foot fracture
    if (["99213", "99214", "99203"].includes(cptCode) && icd === "S92.501A") {
      errors.push({
        field: "icd10",
        severity: "error",
        message: `CPT ${cptCode} (${cptInfo.description}) is not appropriate as the primary procedure for a foot fracture (${icd}).`,
        fix: "A fracture requires a treatment procedure code. Use CPT 28450 (Metatarsal Fracture Treatment) or the appropriate orthopedic code. The E&M visit may be billed separately with Modifier -25 if a separate, significant evaluation was performed on the same day.",
      });
    }

    // Rule: Knee arthroscopy with non-knee diagnosis
    if (cptCode === "29881" && !["M17.11", "M23.61"].includes(icd)) {
      errors.push({
        field: "icd10",
        severity: "error",
        message: `CPT 29881 (Knee Arthroscopy) requires a knee-specific diagnosis. "${icdInfo.description}" (${icd}) does not support this procedure.`,
        fix: `Use a knee pathology diagnosis code such as M17.11 (Primary Osteoarthritis, Right Knee) or M23.61 (ACL Disruption). Payers will automatically deny arthroscopy claims without a matching joint diagnosis.`,
      });
    }

    // Rule: ECG with musculoskeletal diagnosis
    if (cptCode === "93000" && icdInfo.category === "Musculoskeletal") {
      errors.push({
        field: "icd10",
        severity: "warning",
        message: `CPT 93000 (ECG) billed with a musculoskeletal diagnosis (${icd}) may be questioned by the payer for medical necessity.`,
        fix: "Ensure the clinical notes document why an ECG was ordered in the context of a musculoskeletal complaint (e.g., pre-operative cardiac clearance). Add a cardiovascular diagnosis code as a secondary diagnosis if applicable.",
      });
    }

    // Rule: Chest X-ray with non-respiratory/cardiac diagnosis
    if (cptCode === "71046" && !["Respiratory", "Cardiovascular"].includes(icdInfo.category)) {
      errors.push({
        field: "icd10",
        severity: "warning",
        message: `CPT 71046 (Chest X-Ray) with diagnosis "${icdInfo.description}" may lack documented medical necessity.`,
        fix: "Ensure clinical notes document the reason a chest X-ray was ordered for this diagnosis. Add a respiratory or cardiovascular diagnosis if applicable.",
      });
    }

    // Rule: Family history code as primary
    if (icdInfo.category === "Family History") {
      errors.push({
        field: "icd10",
        severity: "warning",
        message: `${icd} (${icdInfo.description}) is a family history code and should not be used as the primary diagnosis.`,
        fix: "Family history codes (Z80–Z84) must be secondary diagnoses. Add the primary condition being treated as the first diagnosis code and move this code to a secondary position.",
      });
    }
  }

  return errors;
}
