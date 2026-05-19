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
  // Physical therapy with non-musculoskeletal
  {
    match: (cpt, _, __, icdCat) => ["97110","97140","97530","97012"].includes(cpt) && !["Musculoskeletal","Injury"].includes(icdCat),
    severity: "warning",
    message: (cpt, cptD, icd, icdD) => `CPT ${cpt} (${cptD}) with "${icdD}" (${icd}) may lack medical necessity documentation.`,
    fix: () => "Therapeutic procedures are typically supported by musculoskeletal or injury diagnoses. Ensure clinical notes document a functional deficit. Consider adding a musculoskeletal diagnosis if one applies.",
    liveLabel: "Physical therapy codes typically require a musculoskeletal or injury diagnosis",
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
  "physical-therapy": {
    id: "physical-therapy",
    label: "Physical Therapy",
    color: "teal",
    description: "Therapeutic exercises, manual therapy, and traction — tied closely to musculoskeletal and injury diagnoses.",
    checks: [
      "Musculoskeletal or injury diagnosis required for all PT codes",
      "Functional deficit must be documented in the treatment plan",
      "Therapy necessity vs. diagnosis alignment verified",
      "Correct 15-minute unit billing per CPT guidelines",
    ],
    commonDenials: [
      "PT codes billed with non-musculoskeletal primary diagnosis",
      "Missing or expired treatment plan on file",
      "Exceeding payer-allowed units per visit or per episode",
    ],
    cptCodes: ["97001","97110","97140","97530","97012"],
    icd10Codes: ["M54.5","M54.2","M17.11","M25.511","M75.1","M62.81","S83.511A","S46.011A","G89.29","M54.16","M23.61"],
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
