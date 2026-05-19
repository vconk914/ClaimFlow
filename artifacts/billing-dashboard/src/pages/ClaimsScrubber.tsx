import { useState } from "react";
import { AlertTriangle, CheckCircle, Info, Loader2, Shield, ChevronRight, X, Sparkles } from "lucide-react";
import { scrubClaim, CPT_CODES, ICD10_CODES, type ScrubError } from "@/data/mockData";
import type { Claim } from "@/data/mockData";

interface ClaimsFormData {
  patient: string;
  dob: string;
  insuranceId: string;
  cpt: string;
  icd10: string;
}

interface Props {
  onSubmit: (claim: Claim) => void;
}

const PAYERS = ["BlueCross", "Medicare", "Medicaid", "Aetna", "UnitedHealth", "Humana", "Cigna", "Other"];

function FieldHint({ code, lookup }: { code: string; lookup: Record<string, { description: string }> }) {
  const info = lookup[code.trim().toUpperCase()] || lookup[code.trim()];
  if (!info || !code.trim()) return null;
  return (
    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
      <Info className="w-3 h-3 shrink-0" />
      {info.description}
    </p>
  );
}

function ErrorCard({ error }: { error: ScrubError }) {
  return (
    <div className={`rounded-xl border p-4 ${error.severity === "error"
      ? "bg-red-50 border-red-200"
      : "bg-amber-50 border-amber-200"
    }`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${error.severity === "error" ? "text-red-500" : "text-amber-500"}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${error.severity === "error" ? "text-red-800" : "text-amber-800"}`}>
            {error.severity === "error" ? "Error" : "Warning"} · {error.field.charAt(0).toUpperCase() + error.field.slice(1).replace(/([A-Z])/g, " $1")}
          </p>
          <p className={`text-sm mt-1 ${error.severity === "error" ? "text-red-700" : "text-amber-700"}`}>{error.message}</p>
          <div className={`mt-2 pt-2 border-t ${error.severity === "error" ? "border-red-200" : "border-amber-200"}`}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">How to fix</p>
            <p className={`text-xs ${error.severity === "error" ? "text-red-700" : "text-amber-700"}`}>{error.fix}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClaimsScrubber({ onSubmit }: Props) {
  const [form, setForm] = useState<ClaimsFormData>({
    patient: "", dob: "", insuranceId: "", cpt: "", icd10: "",
  });
  const [payer, setPayer] = useState("BlueCross");
  const [amount, setAmount] = useState("");
  const [scrubResult, setScrubResult] = useState<ScrubError[] | null>(null);
  const [isScubbing, setIsScrubbing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errorFields = new Set(scrubResult?.filter(e => e.severity === "error").map(e => e.field) ?? []);
  const warnFields = new Set(scrubResult?.filter(e => e.severity === "warning").map(e => e.field) ?? []);

  function fieldClass(field: string) {
    if (errorFields.has(field)) return "border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-400";
    if (warnFields.has(field)) return "border-amber-400 bg-amber-50 focus:ring-amber-500 focus:border-amber-400";
    return "border-border bg-background focus:ring-primary focus:border-primary";
  }

  const inputBase = "w-full rounded-lg border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors";

  async function handleScrub() {
    setIsScrubbing(true);
    setScrubResult(null);
    setSubmitted(false);
    await new Promise(r => setTimeout(r, 800)); // simulate processing
    const errors = scrubClaim(form);
    setScrubResult(errors);
    setIsScrubbing(false);
  }

  function handleSubmit() {
    const hasErrors = scrubResult?.some(e => e.severity === "error");
    if (hasErrors) return;
    const newClaim: Claim = {
      id: `CLM-2024-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`,
      patient: form.patient,
      dob: form.dob,
      insuranceId: form.insuranceId,
      cpt: form.cpt.trim(),
      icd10: form.icd10.trim().toUpperCase(),
      payer,
      amount: parseFloat(amount) || 145.00,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    onSubmit(newClaim);
    setSubmitted(true);
    setForm({ patient: "", dob: "", insuranceId: "", cpt: "", icd10: "" });
    setAmount("");
    setScrubResult(null);
  }

  const errors = scrubResult?.filter(e => e.severity === "error") ?? [];
  const warnings = scrubResult?.filter(e => e.severity === "warning") ?? [];
  const hasErrors = errors.length > 0;
  const isClean = scrubResult !== null && errors.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Claims Scrubber</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Enter claim details and scrub for errors before submission to avoid rejections.</p>
      </div>

      {/* Success banner */}
      {submitted && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Claim Submitted Successfully</p>
            <p className="text-xs text-emerald-700">Your clean claim has been queued for processing and will appear in the Analytics tab.</p>
          </div>
          <button onClick={() => setSubmitted(false)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Claim Form */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Claim Information</h2>
            <p className="text-xs text-muted-foreground mt-0.5">All fields are required for scrubbing</p>
          </div>
          <div className="p-6 space-y-5">
            {/* Patient name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Patient Full Name</label>
              <input
                className={`${inputBase} ${fieldClass("patient")}`}
                placeholder="e.g., Margaret E. Thornton"
                value={form.patient}
                onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}
              />
              {errorFields.has("patient") && <p className="text-xs text-red-600 mt-1">Required</p>}
            </div>

            {/* DOB + Insurance ID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  className={`${inputBase} ${fieldClass("dob")}`}
                  value={form.dob}
                  onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Insurance Member ID</label>
                <input
                  className={`${inputBase} ${fieldClass("insuranceId")}`}
                  placeholder="e.g., BCB-4821039"
                  value={form.insuranceId}
                  onChange={e => setForm(f => ({ ...f, insuranceId: e.target.value }))}
                />
              </div>
            </div>

            {/* Payer + Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Payer / Insurance</label>
                <select
                  className={`${inputBase} border-border bg-background`}
                  value={payer}
                  onChange={e => setPayer(e.target.value)}
                >
                  {PAYERS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Billed Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${inputBase} border-border bg-background`}
                  placeholder="e.g., 145.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* CPT Code */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">CPT Procedure Code</label>
              <input
                className={`${inputBase} ${fieldClass("cpt")} font-mono`}
                placeholder="e.g., 99213"
                value={form.cpt}
                onChange={e => setForm(f => ({ ...f, cpt: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                maxLength={5}
              />
              <FieldHint code={form.cpt} lookup={CPT_CODES} />
              {errorFields.has("cpt") && (
                <p className="text-xs text-red-600 mt-1">Invalid or missing CPT code</p>
              )}
            </div>

            {/* ICD-10 Code */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">ICD-10 Diagnosis Code</label>
              <input
                className={`${inputBase} ${fieldClass("icd10")} font-mono`}
                placeholder="e.g., M54.5 or S92.501A"
                value={form.icd10}
                onChange={e => setForm(f => ({ ...f, icd10: e.target.value }))}
              />
              <FieldHint code={form.icd10.toUpperCase()} lookup={ICD10_CODES} />
              {errorFields.has("icd10") && (
                <p className="text-xs text-red-600 mt-1">Invalid or missing ICD-10 code</p>
              )}
            </div>

            {/* Try this example */}
            <div className="rounded-lg bg-muted border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Try a known mismatch:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Fracture mismatch", cpt: "99213", icd10: "S92.501A" },
                  { label: "Arthroscopy mismatch", cpt: "29881", icd10: "J06.9" },
                  { label: "Clean claim", cpt: "99213", icd10: "J06.9" },
                ].map(ex => (
                  <button
                    key={ex.label}
                    onClick={() => {
                      setForm(f => ({ ...f, cpt: ex.cpt, icd10: ex.icd10 }));
                      setScrubResult(null);
                    }}
                    className="text-xs bg-card border border-border hover:bg-secondary rounded-md px-2.5 py-1.5 text-foreground transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleScrub}
                disabled={isScubbing}
                className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background hover:opacity-90 disabled:opacity-50 rounded-xl py-3 text-sm font-semibold transition-all"
              >
                {isScubbing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Scrubbing…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Scrub Claim</>
                )}
              </button>

              {scrubResult !== null && (
                <button
                  onClick={handleSubmit}
                  disabled={hasErrors}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                    hasErrors
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                  {hasErrors ? "Fix Errors First" : "Submit Claim"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrub Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          {scrubResult === null && !isScubbing && (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Scrub Results</p>
              <p className="text-xs text-muted-foreground mt-1">Fill out the claim form and click "Scrub Claim" to check for errors before submission.</p>
            </div>
          )}

          {isScubbing && (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-sm font-medium text-foreground">Analyzing claim…</p>
              <p className="text-xs text-muted-foreground mt-1">Checking CPT/ICD-10 compatibility, modifier requirements, and payer rules.</p>
            </div>
          )}

          {scrubResult !== null && !isScubbing && (
            <>
              {/* Summary badge */}
              <div className={`rounded-xl border p-4 flex items-center gap-3 ${
                isClean
                  ? "bg-emerald-50 border-emerald-200"
                  : hasErrors
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
              }`}>
                {isClean
                  ? <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                  : <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                }
                <div>
                  <p className={`text-sm font-bold ${isClean ? "text-emerald-800" : hasErrors ? "text-red-800" : "text-amber-800"}`}>
                    {isClean ? "Claim is Clean!" : hasErrors ? `${errors.length} Error${errors.length > 1 ? "s" : ""} Found` : `${warnings.length} Warning${warnings.length > 1 ? "s" : ""} Only`}
                  </p>
                  <p className={`text-xs ${isClean ? "text-emerald-700" : hasErrors ? "text-red-700" : "text-amber-700"}`}>
                    {isClean
                      ? "No issues detected. This claim is ready to submit."
                      : hasErrors
                      ? "Fix all errors before submitting to avoid denial."
                      : "No critical errors. Review warnings before submitting."}
                  </p>
                </div>
              </div>

              {/* Error cards */}
              {errors.map((e, i) => <ErrorCard key={i} error={e} />)}
              {warnings.map((e, i) => <ErrorCard key={`w${i}`} error={e} />)}

              {isClean && (
                <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Checks Passed</p>
                  {[
                    "Patient demographics validated",
                    "CPT code recognized and active",
                    "ICD-10 format correct",
                    "Diagnosis supports procedure",
                    "No modifier requirement detected",
                  ].map(c => (
                    <div key={c} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-xs text-foreground">{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
