import { useState, useMemo, useRef, useEffect } from "react";
import { AlertTriangle, CheckCircle, Info, Loader2, Shield, ChevronRight, X, Sparkles, Zap, User, Lightbulb } from "lucide-react";
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

const EXAMPLES = [
  { label: "Fracture + E&M mismatch", cpt: "99213", icd10: "S92.501A", tag: "error" },
  { label: "Arthroscopy + URI mismatch", cpt: "29881", icd10: "J06.9", tag: "error" },
  { label: "Wellness + E&M mismatch", cpt: "99213", icd10: "Z00.00", tag: "error" },
  { label: "Clean claim", cpt: "99213", icd10: "M54.5", tag: "ok" },
] as const;

// Fictional patient name roster
const PATIENT_NAMES = [
  "Vincent Conklin",
  "Diane Westbrook",
  "Harold Pemberton",
  "Carol Fitzpatrick",
  "Samuel Okafor",
  "Evelyn Brinkworth",
  "Terrence Calloway",
  "Gloria Espinoza",
  "Frederick Abernathy",
  "Lorraine Kaczmarek",
  "Timothy Dougherty",
  "Natalie Sherwood",
  "Bernard Kowalski",
  "Vivian Nakashima",
  "Arthur Delacroix",
  "Susan Whitmore",
  "Raymond Castellano",
  "Phyllis Obergfell",
  "Leonard Ashworth",
  "Constance Milligan",
  "Douglas Rafferty",
  "Harriet Bjornstad",
  "Clarence Turvey",
  "Miriam Goldstein",
  "Wallace Pemberton",
  "Beatrice Carmichael",
  "Reginald Fontaine",
  "Edith Przybylski",
  "Norman Driscoll",
  "Agnes Hollingsworth",
];

// Highlight matching substring in a suggestion
function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-primary">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

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

function ScrubCard({ error }: { error: ScrubError }) {
  const s = error.severity;
  const styles = {
    error:   { wrap: "bg-red-50 border-red-200",     icon: "text-red-500",   label: "text-red-800",   body: "text-red-700",   divider: "border-red-200",   tag: "Error" },
    warning: { wrap: "bg-amber-50 border-amber-200", icon: "text-amber-500", label: "text-amber-800", body: "text-amber-700", divider: "border-amber-200", tag: "Warning" },
    info:    { wrap: "bg-blue-50 border-blue-200",   icon: "text-blue-500",  label: "text-blue-800",  body: "text-blue-700",  divider: "border-blue-200",  tag: "Suggestion" },
  }[s];

  const Icon = s === "info" ? Lightbulb : AlertTriangle;
  const fieldLabel = error.field.charAt(0).toUpperCase() + error.field.slice(1).replace(/([A-Z])/g, " $1");
  const actionLabel = s === "info" ? "How to add" : "How to fix";

  return (
    <div className={`rounded-xl border p-4 ${styles.wrap}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${styles.icon}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${styles.label}`}>
            {styles.tag} · {fieldLabel}
          </p>
          <p className={`text-sm mt-1 ${styles.body}`}>{error.message}</p>
          <div className={`mt-2 pt-2 border-t ${styles.divider}`}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{actionLabel}</p>
            <p className={`text-xs ${styles.body}`}>{error.fix}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Live CPT/ICD-10 compatibility check — runs as user types
function useLiveCompat(cpt: string, icd10: string) {
  return useMemo(() => {
    const c = cpt.trim();
    const icd = icd10.trim().toUpperCase();
    if (c.length < 5 || !icd || !/^[A-Z]\d{2}(\.\w+)?$/.test(icd)) return null;
    const cptInfo = CPT_CODES[c];
    const icdInfo = ICD10_CODES[icd];
    if (!cptInfo || !icdInfo) return null;

    const issues: string[] = [];
    if (["99213", "99214", "99203"].includes(c) && icd === "S92.501A")
      issues.push("E&M visit code cannot be the procedure code for a fracture");
    if (c === "29881" && !["M17.11", "M23.61"].includes(icd))
      issues.push("Arthroscopy requires a knee-specific joint diagnosis");
    if (["99213", "99214", "99203"].includes(c) && icd === "Z00.00")
      issues.push("Wellness exam diagnosis needs a preventive medicine CPT (99395–99397)");
    if (c === "93000" && icdInfo.category === "Musculoskeletal")
      issues.push("ECG medical necessity may be questioned with a musculoskeletal diagnosis");
    if (c === "97110" && !["Musculoskeletal", "Injury"].includes(icdInfo.category))
      issues.push("Therapeutic exercise typically needs a musculoskeletal diagnosis");

    return { cptDesc: cptInfo.description, icdDesc: icdInfo.description, issues };
  }, [cpt, icd10]);
}

export default function ClaimsScrubber({ onSubmit }: Props) {
  const [form, setForm] = useState<ClaimsFormData>({
    patient: "", dob: "", insuranceId: "", cpt: "", icd10: "",
  });
  const [payer, setPayer] = useState("BlueCross");
  const [amount, setAmount] = useState("");
  const [scrubResult, setScrubResult] = useState<ScrubError[] | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Type-ahead state
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const nameSuggestions = useMemo(() => {
    const q = form.patient.trim().toLowerCase();
    if (!q) return PATIENT_NAMES.slice(0, 6); // show first 6 when empty but focused
    return PATIENT_NAMES.filter(n => n.toLowerCase().includes(q)).slice(0, 6);
  }, [form.patient]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (
        !nameInputRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setHighlightedIdx(-1);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const liveCompat = useLiveCompat(form.cpt, form.icd10);

  const errorFields = new Set(scrubResult?.filter(e => e.severity === "error").map(e => e.field) ?? []);
  const warnFields = new Set(scrubResult?.filter(e => e.severity === "warning").map(e => e.field) ?? []);
  const infoFields = new Set(scrubResult?.filter(e => e.severity === "info").map(e => e.field) ?? []);

  function updateForm(patch: Partial<ClaimsFormData>) {
    setForm(f => ({ ...f, ...patch }));
    setScrubResult(null);
    setSubmitted(false);
  }

  function selectName(name: string) {
    updateForm({ patient: name });
    setShowDropdown(false);
    setHighlightedIdx(-1);
  }

  function handleNameKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || nameSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx(i => Math.min(i + 1, nameSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      e.preventDefault();
      selectName(nameSuggestions[highlightedIdx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIdx(-1);
    }
  }

  function fieldClass(field: string) {
    if (errorFields.has(field)) return "border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-400";
    if (warnFields.has(field)) return "border-amber-400 bg-amber-50 focus:ring-amber-500 focus:border-amber-400";
    if (infoFields.has(field)) return "border-blue-300 bg-blue-50/40 focus:ring-blue-500 focus:border-blue-400";
    return "border-border bg-background focus:ring-primary focus:border-primary";
  }

  const inputBase = "w-full rounded-lg border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors";

  async function handleScrub() {
    setIsScrubbing(true);
    setScrubResult(null);
    setSubmitted(false);
    await new Promise(r => setTimeout(r, 700));
    const errors = scrubClaim(form);
    setScrubResult(errors);
    setIsScrubbing(false);
  }

  function handleSubmit() {
    if (scrubResult?.some(e => e.severity === "error")) return;
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
  const infos = scrubResult?.filter(e => e.severity === "info") ?? [];
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const isClean = scrubResult !== null && errors.length === 0 && warnings.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Claims Scrubber</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Patient name and date of birth are required. All other fields are optional but improve validation accuracy.
        </p>
      </div>

      {submitted && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Claim Submitted Successfully</p>
            <p className="text-xs text-emerald-700">Your clean claim is queued as Pending and appears in the Analytics tab.</p>
          </div>
          <button onClick={() => setSubmitted(false)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Claim Form ── */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-border flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Claim Information</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="text-red-500 font-medium">*</span> Required &nbsp;·&nbsp; all other fields optional
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* ── Patient name with type-ahead ── */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Patient Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    ref={nameInputRef}
                    className={`${inputBase} pl-10 ${fieldClass("patient")}`}
                    placeholder="Start typing a name…"
                    value={form.patient}
                    autoComplete="off"
                    onFocus={() => setShowDropdown(true)}
                    onChange={e => {
                      updateForm({ patient: e.target.value });
                      setShowDropdown(true);
                      setHighlightedIdx(-1);
                    }}
                    onKeyDown={handleNameKeyDown}
                  />
                  {form.patient && (
                    <button
                      onPointerDown={e => { e.preventDefault(); updateForm({ patient: "" }); setShowDropdown(true); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                {showDropdown && nameSuggestions.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    <p className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border bg-muted/50">
                      {form.patient.trim() ? "Matching patients" : "Suggested patients"} — case-insensitive
                    </p>
                    {nameSuggestions.map((name, i) => (
                      <button
                        key={name}
                        onPointerDown={e => { e.preventDefault(); selectName(name); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                          i === highlightedIdx
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === highlightedIdx ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {name.split(" ").map(p => p[0]).join("").slice(0, 2)}
                        </div>
                        <span>
                          <Highlighted text={name} query={form.patient} />
                        </span>
                      </button>
                    ))}
                    {form.patient.trim() && nameSuggestions.length === 0 && (
                      <p className="px-4 py-3 text-sm text-muted-foreground">No matching patients — you can still type a custom name.</p>
                    )}
                  </div>
                )}
              </div>
              {errorFields.has("patient") && (
                <p className="text-xs text-red-600 mt-1">Patient name is required to proceed.</p>
              )}
            </div>

            {/* DOB — required */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`${inputBase} ${fieldClass("dob")}`}
                value={form.dob}
                onChange={e => updateForm({ dob: e.target.value })}
              />
              {errorFields.has("dob") && (
                <p className="text-xs text-red-600 mt-1">Date of birth is required to proceed.</p>
              )}
            </div>

            {/* Insurance ID + Payer — optional */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Insurance Member ID
                  <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  className={`${inputBase} ${fieldClass("insuranceId")}`}
                  placeholder="e.g., BCB-4821039"
                  value={form.insuranceId}
                  onChange={e => updateForm({ insuranceId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Payer / Insurance
                  <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <select
                  className={`${inputBase} border-border bg-background`}
                  value={payer}
                  onChange={e => setPayer(e.target.value)}
                >
                  {PAYERS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Billed Amount — optional */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Billed Amount ($)
                <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
              </label>
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

            {/* CPT + ICD-10 — optional */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  CPT Code
                  <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  className={`${inputBase} ${fieldClass("cpt")} font-mono`}
                  placeholder="e.g., 99213"
                  value={form.cpt}
                  onChange={e => updateForm({ cpt: e.target.value.replace(/\D/g, "").slice(0, 5) })}
                  maxLength={5}
                />
                <FieldHint code={form.cpt} lookup={CPT_CODES} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ICD-10 Code
                  <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  className={`${inputBase} ${fieldClass("icd10")} font-mono`}
                  placeholder="e.g., M54.5 or Z00.00"
                  value={form.icd10}
                  onChange={e => updateForm({ icd10: e.target.value })}
                />
                <FieldHint code={form.icd10.toUpperCase()} lookup={ICD10_CODES} />
              </div>
            </div>

            {/* Live compatibility indicator */}
            {liveCompat && (
              <div className={`rounded-lg border p-3 text-xs transition-all ${
                liveCompat.issues.length > 0 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
              }`}>
                <div className="flex items-center gap-1.5 font-semibold mb-1.5">
                  <Zap className={`w-3.5 h-3.5 ${liveCompat.issues.length > 0 ? "text-red-500" : "text-emerald-600"}`} />
                  <span className={liveCompat.issues.length > 0 ? "text-red-800" : "text-emerald-800"}>
                    Live check: {liveCompat.issues.length > 0
                      ? `${liveCompat.issues.length} issue${liveCompat.issues.length > 1 ? "s" : ""} detected`
                      : "CPT + ICD-10 look compatible"}
                  </span>
                </div>
                <p className="text-muted-foreground mb-1">
                  <span className="font-mono">{form.cpt}</span> {liveCompat.cptDesc}&nbsp;/&nbsp;
                  <span className="font-mono">{form.icd10.toUpperCase()}</span> {liveCompat.icdDesc}
                </p>
                {liveCompat.issues.map((issue, i) => (
                  <p key={i} className="text-red-700 flex items-start gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />{issue}
                  </p>
                ))}
                {liveCompat.issues.length === 0 && (
                  <p className="text-emerald-700">No known coding conflicts. Click Scrub Claim for full validation.</p>
                )}
              </div>
            )}

            {/* Example scenarios */}
            <div className="rounded-lg bg-muted border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Load a known scenario:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map(ex => (
                  <button
                    key={ex.label}
                    onClick={() => updateForm({ cpt: ex.cpt, icd10: ex.icd10 })}
                    className={`text-xs border rounded-md px-2.5 py-1.5 transition-colors flex items-center gap-1.5 ${
                      ex.tag === "error"
                        ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {ex.tag === "error"
                      ? <AlertTriangle className="w-3 h-3" />
                      : <CheckCircle className="w-3 h-3" />}
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleScrub}
                disabled={isScrubbing}
                className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background hover:opacity-90 disabled:opacity-50 rounded-xl py-3 text-sm font-semibold transition-all"
              >
                {isScrubbing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Scrubbing…</>
                  : <><Sparkles className="w-4 h-4" /> Scrub Claim</>}
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
                  {hasErrors ? "Fix Errors to Submit" : "Submit Claim"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Results panel ── */}
        <div className="lg:col-span-2 space-y-3">
          {scrubResult === null && !isScrubbing && (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Scrub Results</p>
              <p className="text-xs text-muted-foreground mt-1">
                {liveCompat
                  ? 'Live check running. Click "Scrub Claim" for full validation.'
                  : 'Click "Scrub Claim" at any time — even with an empty form — to see step-by-step guidance.'}
              </p>
            </div>
          )}

          {isScrubbing && (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-sm font-medium text-foreground">Analyzing claim…</p>
              <p className="text-xs text-muted-foreground mt-1">
                Checking fields, CPT/ICD-10 compatibility, and payer rules.
              </p>
            </div>
          )}

          {scrubResult !== null && !isScrubbing && (
            <>
              {/* Summary banner */}
              <div className={`rounded-xl border p-4 flex items-start gap-3 ${
                isClean        ? "bg-emerald-50 border-emerald-200"
                : hasErrors    ? "bg-red-50 border-red-200"
                : hasWarnings  ? "bg-amber-50 border-amber-200"
                : "bg-blue-50 border-blue-200"
              }`}>
                {isClean
                  ? <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  : hasErrors
                    ? <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    : hasWarnings
                      ? <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                      : <Lightbulb className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-sm font-bold ${
                    isClean ? "text-emerald-800"
                    : hasErrors ? "text-red-800"
                    : hasWarnings ? "text-amber-800"
                    : "text-blue-800"
                  }`}>
                    {isClean
                      ? "Claim is Clean — ready to submit!"
                      : hasErrors
                        ? `${errors.length} error${errors.length > 1 ? "s" : ""} found${warnings.length > 0 ? `, ${warnings.length} warning${warnings.length > 1 ? "s" : ""}` : ""}${infos.length > 0 ? `, ${infos.length} suggestion${infos.length > 1 ? "s" : ""}` : ""}`
                        : hasWarnings
                          ? `${warnings.length} warning${warnings.length > 1 ? "s" : ""}${infos.length > 0 ? `, ${infos.length} suggestion${infos.length > 1 ? "s" : ""}` : ""} — no critical errors`
                          : `${infos.length} suggestion${infos.length > 1 ? "s" : ""} — add more details for deeper checks`}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    isClean ? "text-emerald-700"
                    : hasErrors ? "text-red-700"
                    : hasWarnings ? "text-amber-700"
                    : "text-blue-700"
                  }`}>
                    {isClean
                      ? "All provided fields validated. No billing conflicts detected."
                      : hasErrors
                        ? "Fix the red errors before submitting. Warnings and suggestions are optional but improve claim quality."
                        : hasWarnings
                          ? "No blocking errors. Review warnings, then submit when ready."
                          : "Fill in more fields and scrub again to unlock additional checks."}
                  </p>
                </div>
              </div>

              {/* Errors first */}
              {errors.map((e, i) => <ScrubCard key={`e${i}`} error={e} />)}

              {/* Warnings second */}
              {warnings.length > 0 && errors.length > 0 && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Warnings</p>
              )}
              {warnings.map((e, i) => <ScrubCard key={`w${i}`} error={e} />)}

              {/* Info / suggestions last */}
              {infos.length > 0 && (errors.length > 0 || warnings.length > 0) && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Suggestions</p>
              )}
              {infos.map((e, i) => <ScrubCard key={`i${i}`} error={e} />)}

              {/* Checks passed list when fully clean */}
              {isClean && infos.length === 0 && (
                <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">All Checks Passed</p>
                  {[
                    "Patient name validated",
                    "Date of birth confirmed",
                    ...(form.cpt ? ["CPT code recognized and active"] : []),
                    ...(form.icd10 ? ["ICD-10 format correct", "No CPT/diagnosis conflict detected"] : []),
                    "No modifier requirement flagged",
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
