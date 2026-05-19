import { useState, useMemo, useRef, useEffect } from "react";
import {
  AlertTriangle, CheckCircle, Loader2, Shield, ChevronRight, X,
  Sparkles, Zap, User, Lightbulb, ChevronDown, BookOpen,
} from "lucide-react";
import {
  scrubClaim, CPT_CODES, ICD10_CODES, COMPAT_RULES, SPECIALTY_CONFIGS,
  type ScrubError, type SpecialtyConfig,
} from "@/data/mockData";
import type { Claim } from "@/data/mockData";

interface ClaimsFormData {
  patient: string; dob: string; insuranceId: string; cpt: string; icd10: string;
}

interface Props { onSubmit: (claim: Claim) => void; }

const PAYERS = ["BlueCross", "Medicare", "Medicaid", "Aetna", "UnitedHealth", "Humana", "Cigna", "Other"];

const EXAMPLES: { label: string; cpt: string; icd10: string; tag: "error" | "ok" }[] = [
  { label: "Fracture + E&M mismatch", cpt: "99213", icd10: "S92.501A", tag: "error" },
  { label: "Arthroscopy + URI mismatch", cpt: "29881", icd10: "J06.9", tag: "error" },
  { label: "Wellness + E&M mismatch", cpt: "99213", icd10: "Z00.00", tag: "error" },
  { label: "Shoulder Scope + Knee Dx", cpt: "29827", icd10: "M17.11", tag: "error" },
  { label: "Clean preventive claim", cpt: "99396", icd10: "Z00.00", tag: "ok" },
];

const PATIENT_NAMES = [
  "Vincent Conklin", "Diane Westbrook", "Harold Pemberton", "Carol Fitzpatrick",
  "Samuel Okafor", "Evelyn Brinkworth", "Terrence Calloway", "Gloria Espinoza",
  "Frederick Abernathy", "Lorraine Kaczmarek", "Timothy Dougherty", "Natalie Sherwood",
  "Bernard Kowalski", "Vivian Nakashima", "Arthur Delacroix", "Susan Whitmore",
  "Raymond Castellano", "Phyllis Obergfell", "Leonard Ashworth", "Constance Milligan",
  "Douglas Rafferty", "Harriet Bjornstad", "Clarence Turvey", "Miriam Goldstein",
  "Wallace Pemberton", "Beatrice Carmichael", "Reginald Fontaine", "Edith Przybylski",
  "Norman Driscoll", "Agnes Hollingsworth",
];

const CATEGORY_BADGE: Record<string, string> = {
  "E&M": "bg-blue-100 text-blue-700",
  "Preventive": "bg-emerald-100 text-emerald-700",
  "Surgery": "bg-red-100 text-red-700",
  "Orthopedics": "bg-orange-100 text-orange-700",
  "Cardiology": "bg-pink-100 text-pink-700",
  "Radiology": "bg-purple-100 text-purple-700",
  "Physical Therapy": "bg-teal-100 text-teal-700",
  "Laboratory": "bg-cyan-100 text-cyan-700",
  "Mental Health": "bg-violet-100 text-violet-700",
  "Musculoskeletal": "bg-orange-100 text-orange-700",
  "Injury": "bg-red-100 text-red-700",
  "Cardiovascular": "bg-pink-100 text-pink-700",
  "Respiratory": "bg-sky-100 text-sky-700",
  "Endocrine": "bg-yellow-100 text-yellow-700",
  "Gastrointestinal": "bg-lime-100 text-lime-700",
  "Genitourinary": "bg-indigo-100 text-indigo-700",
  "Neurological": "bg-purple-100 text-purple-700",
  "Family History": "bg-slate-100 text-slate-600",
};

// Color map for specialty accents
const SPECIALTY_COLORS: Record<string, {
  dot: string; bg: string; border: string; text: string; heading: string;
  badge: string; badgeText: string; pillActive: string;
}> = {
  blue:    { dot: "bg-blue-500",    bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700",   heading: "text-blue-900",   badge: "bg-blue-100",   badgeText: "text-blue-700",   pillActive: "bg-blue-600 text-white"    },
  orange:  { dot: "bg-orange-500",  bg: "bg-orange-50",  border: "border-orange-200", text: "text-orange-700", heading: "text-orange-900", badge: "bg-orange-100", badgeText: "text-orange-700", pillActive: "bg-orange-600 text-white"  },
  pink:    { dot: "bg-pink-500",    bg: "bg-pink-50",    border: "border-pink-200",   text: "text-pink-700",   heading: "text-pink-900",   badge: "bg-pink-100",   badgeText: "text-pink-700",   pillActive: "bg-pink-600 text-white"    },
  violet:  { dot: "bg-violet-500",  bg: "bg-violet-50",  border: "border-violet-200", text: "text-violet-700", heading: "text-violet-900", badge: "bg-violet-100", badgeText: "text-violet-700", pillActive: "bg-violet-600 text-white"  },
  teal:    { dot: "bg-teal-500",    bg: "bg-teal-50",    border: "border-teal-200",   text: "text-teal-700",   heading: "text-teal-900",   badge: "bg-teal-100",   badgeText: "text-teal-700",   pillActive: "bg-teal-600 text-white"    },
  emerald: { dot: "bg-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200",text: "text-emerald-700",heading: "text-emerald-900",badge: "bg-emerald-100",badgeText: "text-emerald-700",pillActive: "bg-emerald-600 text-white" },
  amber:   { dot: "bg-amber-500",   bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",  heading: "text-amber-900",  badge: "bg-amber-100",  badgeText: "text-amber-700",  pillActive: "bg-amber-600 text-white"   },
};

// ── Highlight helper ──────────────────────────────────────────────────────────
function Highlight({ text, query, inverted }: { text: string; query: string; inverted?: boolean }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className={inverted ? "font-bold underline" : "font-semibold text-primary"}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Specialty selector ────────────────────────────────────────────────────────
function SpecialtySelector({
  value, onChange,
}: { value: string; onChange: (id: string) => void }) {
  const specialties = Object.values(SPECIALTY_CONFIGS);
  return (
    <div className="flex flex-wrap gap-2">
      {specialties.map(sp => {
        const c = SPECIALTY_COLORS[sp.color];
        const active = value === sp.id;
        return (
          <button
            key={sp.id}
            onClick={() => onChange(sp.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              active
                ? `${c.pillActive} border-transparent shadow-sm`
                : "bg-card border-border text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted"
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${active ? "bg-white/80" : c.dot}`} />
            {sp.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Specialty info card ───────────────────────────────────────────────────────
function SpecialtyInfoCard({ spec, collapsed, onToggle }: {
  spec: SpecialtyConfig; collapsed: boolean; onToggle: () => void;
}) {
  const c = SPECIALTY_COLORS[spec.color];
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden transition-all`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 ${c.bg}`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${c.dot} shrink-0`} />
          <span className={`text-sm font-semibold ${c.heading}`}>{spec.label} Mode</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge} ${c.badgeText}`}>
            Active
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 ${c.text} transition-transform ${collapsed ? "" : "rotate-180"}`} />
      </button>

      {!collapsed && (
        <div className={`px-4 pb-4 border-t ${c.border}`}>
          <p className={`text-xs ${c.text} mt-3 mb-3 leading-relaxed`}>{spec.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${c.text} mb-1.5 flex items-center gap-1.5`}>
                <BookOpen className="w-3 h-3" /> What we check
              </p>
              <ul className="space-y-1">
                {spec.checks.map(ch => (
                  <li key={ch} className="flex items-start gap-1.5">
                    <CheckCircle className={`w-3 h-3 mt-0.5 shrink-0 ${c.text}`} />
                    <span className={`text-xs ${c.text}`}>{ch}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${c.text} mb-1.5 flex items-center gap-1.5`}>
                <AlertTriangle className="w-3 h-3" /> Common denials
              </p>
              <ul className="space-y-1">
                {spec.commonDenials.map(d => (
                  <li key={d} className="flex items-start gap-1.5">
                    <AlertTriangle className={`w-3 h-3 mt-0.5 shrink-0 ${c.text} opacity-70`} />
                    <span className={`text-xs ${c.text}`}>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Code typeahead ────────────────────────────────────────────────────────────
function CodeTypeahead({
  value, onTextChange, onSelect, placeholder, codeMap, inputClassName, showAllToggle, onToggleAll, showingAll,
}: {
  value: string;
  onTextChange: (v: string) => void;
  onSelect: (code: string) => void;
  placeholder?: string;
  codeMap: Record<string, { description: string; category: string }>;
  inputClassName?: string;
  showAllToggle?: boolean;
  onToggleAll?: () => void;
  showingAll?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hiIdx, setHiIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    const entries = Object.entries(codeMap);
    if (!q) return entries.slice(0, 7);
    const codeFirst = entries.filter(([code]) => code.toLowerCase().startsWith(q));
    const descOnly  = entries.filter(([code, info]) =>
      !code.toLowerCase().startsWith(q) && info.description.toLowerCase().includes(q)
    );
    return [...codeFirst, ...descOnly].slice(0, 7);
  }, [value, codeMap]);

  useEffect(() => {
    function handler(e: PointerEvent) {
      if (!inputRef.current?.contains(e.target as Node) && !listRef.current?.contains(e.target as Node)) {
        setOpen(false); setHiIdx(-1);
      }
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHiIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHiIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && hiIdx >= 0) { e.preventDefault(); onSelect(suggestions[hiIdx][0]); setOpen(false); setHiIdx(-1); }
    else if (e.key === "Escape") { setOpen(false); setHiIdx(-1); }
  }

  const selectedInfo = codeMap[value.trim().toUpperCase()] || codeMap[value.trim()];

  return (
    <div className="relative">
      <input
        ref={inputRef}
        className={`font-mono ${inputClassName ?? ""}`}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={e => { onTextChange(e.target.value); setOpen(true); setHiIdx(-1); }}
        onKeyDown={handleKeyDown}
      />
      {selectedInfo && !open && (
        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1.5 truncate">
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${CATEGORY_BADGE[selectedInfo.category] ?? "bg-muted text-muted-foreground"}`}>
            {selectedInfo.category}
          </span>
          {selectedInfo.description}
        </p>
      )}

      {open && (
        <div ref={listRef} className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border bg-muted/50 flex items-center justify-between">
            <span>
              {value.trim() ? "Matching codes" : "Suggested codes"}
              {!showingAll && showAllToggle && (
                <span className="ml-1 opacity-60">· specialty filtered</span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {showAllToggle && (
                <button
                  onPointerDown={e => { e.preventDefault(); onToggleAll?.(); }}
                  className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
                    showingAll
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30"
                  }`}
                >
                  {showingAll ? "Specialty only" : "Show all codes"}
                </button>
              )}
              <span className="opacity-50">↑↓ · Enter · Esc</span>
            </div>
          </div>
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">
              No matching codes in {showingAll ? "library" : "specialty"}.
              {!showingAll && " Try toggling 'Show all codes'."}
            </p>
          ) : (
            suggestions.map(([code, info], i) => {
              const active = i === hiIdx;
              return (
                <button
                  key={code}
                  onPointerDown={e => { e.preventDefault(); onSelect(code); setOpen(false); setHiIdx(-1); }}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <span className={`font-mono text-xs font-bold shrink-0 w-20 ${active ? "text-primary-foreground" : "text-primary"}`}>
                    <Highlight text={code} query={value} inverted={active} />
                  </span>
                  <span className={`flex-1 text-xs ${active ? "text-primary-foreground" : "text-foreground"}`}>
                    <Highlight text={info.description} query={value} inverted={active} />
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
                    active ? "bg-primary-foreground/20 text-primary-foreground" : (CATEGORY_BADGE[info.category] ?? "bg-muted text-muted-foreground")
                  }`}>
                    {info.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────────
function ScrubCard({ error }: { error: ScrubError }) {
  const s = error.severity;
  const styles = {
    error:   { wrap: "bg-red-50 border-red-200",     icon: "text-red-500",   label: "text-red-800",   body: "text-red-700",   divider: "border-red-200",   tag: "Error" },
    warning: { wrap: "bg-amber-50 border-amber-200", icon: "text-amber-500", label: "text-amber-800", body: "text-amber-700", divider: "border-amber-200", tag: "Warning" },
    info:    { wrap: "bg-blue-50 border-blue-200",   icon: "text-blue-500",  label: "text-blue-800",  body: "text-blue-700",  divider: "border-blue-200",  tag: "Suggestion" },
  }[s];
  const Icon = s === "info" ? Lightbulb : AlertTriangle;
  const fieldLabel = error.field.charAt(0).toUpperCase() + error.field.slice(1).replace(/([A-Z])/g, " $1");
  return (
    <div className={`rounded-xl border p-4 ${styles.wrap}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${styles.icon}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${styles.label}`}>{styles.tag} · {fieldLabel}</p>
          <p className={`text-sm mt-1 ${styles.body}`}>{error.message}</p>
          <div className={`mt-2 pt-2 border-t ${styles.divider}`}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {s === "info" ? "How to add" : "How to fix"}
            </p>
            <p className={`text-xs ${styles.body}`}>{error.fix}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Live compat hook ──────────────────────────────────────────────────────────
function useLiveCompat(cpt: string, icd10: string) {
  return useMemo(() => {
    const c = cpt.trim();
    const icd = icd10.trim().toUpperCase();
    if (c.length < 5 || !icd || !/^[A-Z]\d{2}(\.\w+)?$/.test(icd)) return null;
    const cptInfo = CPT_CODES[c];
    const icdInfo = ICD10_CODES[icd];
    if (!cptInfo || !icdInfo) return null;
    const issues: string[] = [];
    for (const rule of COMPAT_RULES) {
      if (rule.match(c, icd, cptInfo.category, icdInfo.category)) {
        issues.push(rule.liveLabel);
      }
    }
    return { cptDesc: cptInfo.description, icdDesc: icdInfo.description, issues };
  }, [cpt, icd10]);
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ClaimsScrubber({ onSubmit }: Props) {
  const [form, setForm] = useState<ClaimsFormData>({ patient: "", dob: "", insuranceId: "", cpt: "", icd10: "" });
  const [payer, setPayer] = useState("BlueCross");
  const [amount, setAmount] = useState("");
  const [scrubResult, setScrubResult] = useState<ScrubError[] | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Specialty mode
  const [specialtyId, setSpecialtyId] = useState("family-medicine");
  const [infoCollapsed, setInfoCollapsed] = useState(false);
  const [showAllCpt, setShowAllCpt] = useState(false);
  const [showAllIcd, setShowAllIcd] = useState(false);

  const specialty = SPECIALTY_CONFIGS[specialtyId];

  // Build filtered code maps
  const cptMap = useMemo(() => {
    if (showAllCpt) return CPT_CODES;
    return Object.fromEntries(
      specialty.cptCodes.filter(c => CPT_CODES[c]).map(c => [c, CPT_CODES[c]])
    );
  }, [specialtyId, showAllCpt]);

  const icdMap = useMemo(() => {
    if (showAllIcd) return ICD10_CODES;
    return Object.fromEntries(
      specialty.icd10Codes.filter(c => ICD10_CODES[c]).map(c => [c, ICD10_CODES[c]])
    );
  }, [specialtyId, showAllIcd]);

  // Patient name typeahead
  const [showNameDrop, setShowNameDrop] = useState(false);
  const [nameHiIdx, setNameHiIdx] = useState(-1);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameDropRef  = useRef<HTMLDivElement>(null);

  const nameSuggestions = useMemo(() => {
    const q = form.patient.trim().toLowerCase();
    if (!q) return PATIENT_NAMES.slice(0, 6);
    return PATIENT_NAMES.filter(n => n.toLowerCase().includes(q)).slice(0, 6);
  }, [form.patient]);

  useEffect(() => {
    function handler(e: PointerEvent) {
      if (!nameInputRef.current?.contains(e.target as Node) && !nameDropRef.current?.contains(e.target as Node)) {
        setShowNameDrop(false); setNameHiIdx(-1);
      }
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  const liveCompat = useLiveCompat(form.cpt, form.icd10);

  const errorFields = new Set(scrubResult?.filter(e => e.severity === "error").map(e => e.field)   ?? []);
  const warnFields  = new Set(scrubResult?.filter(e => e.severity === "warning").map(e => e.field) ?? []);
  const infoFields  = new Set(scrubResult?.filter(e => e.severity === "info").map(e => e.field)    ?? []);

  function updateForm(patch: Partial<ClaimsFormData>) {
    setForm(f => ({ ...f, ...patch }));
    setScrubResult(null); setSubmitted(false);
  }

  function changeSpecialty(id: string) {
    setSpecialtyId(id);
    setShowAllCpt(false); setShowAllIcd(false);
    setScrubResult(null); setSubmitted(false);
  }

  function fieldClass(field: string) {
    if (errorFields.has(field)) return "border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-400";
    if (warnFields.has(field))  return "border-amber-400 bg-amber-50 focus:ring-amber-500 focus:border-amber-400";
    if (infoFields.has(field))  return "border-blue-300 bg-blue-50/40 focus:ring-blue-500 focus:border-blue-400";
    return "border-border bg-background focus:ring-primary focus:border-primary";
  }

  const inputBase = "w-full rounded-lg border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors";

  async function handleScrub() {
    setIsScrubbing(true); setScrubResult(null); setSubmitted(false);
    await new Promise(r => setTimeout(r, 700));
    setScrubResult(scrubClaim(form));
    setIsScrubbing(false);
  }

  function handleSubmit() {
    if (scrubResult?.some(e => e.severity === "error")) return;
    onSubmit({
      id: `CLM-2024-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`,
      patient: form.patient, dob: form.dob, insuranceId: form.insuranceId,
      cpt: form.cpt.trim(), icd10: form.icd10.trim().toUpperCase(),
      payer, amount: parseFloat(amount) || 145.00,
      status: "Pending", submittedAt: new Date().toISOString(),
    });
    setSubmitted(true);
    setForm({ patient: "", dob: "", insuranceId: "", cpt: "", icd10: "" });
    setAmount(""); setScrubResult(null);
  }

  const errors   = scrubResult?.filter(e => e.severity === "error")   ?? [];
  const warnings = scrubResult?.filter(e => e.severity === "warning") ?? [];
  const infos    = scrubResult?.filter(e => e.severity === "info")    ?? [];
  const hasErrors   = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const isClean = scrubResult !== null && !hasErrors && !hasWarnings;

  const sc = SPECIALTY_COLORS[specialty.color];

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Claims Scrubber</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select a specialty to filter code suggestions and activate focused validation rules.
        </p>
      </div>

      {/* ── Specialty selector ── */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Specialty Mode</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.badge} ${sc.badgeText}`}>
            {specialty.label}
          </span>
        </div>
        <SpecialtySelector value={specialtyId} onChange={changeSpecialty} />
      </div>

      {/* ── Specialty info card ── */}
      <SpecialtyInfoCard
        spec={specialty}
        collapsed={infoCollapsed}
        onToggle={() => setInfoCollapsed(c => !c)}
      />

      {/* ── Success banner ── */}
      {submitted && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Claim Submitted Successfully</p>
            <p className="text-xs text-emerald-700">Queued as Pending — visible in the Analytics tab.</p>
          </div>
          <button onClick={() => setSubmitted(false)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Form ── */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Claim Information</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="text-red-500 font-medium">*</span> Required · all other fields optional
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${sc.bg} ${sc.border} border`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              <span className={`text-xs font-medium ${sc.text}`}>{specialty.label}</span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Patient name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Patient Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <input
                  ref={nameInputRef}
                  className={`${inputBase} pl-10 ${fieldClass("patient")}`}
                  placeholder="Start typing a name…"
                  value={form.patient}
                  autoComplete="off"
                  onFocus={() => setShowNameDrop(true)}
                  onChange={e => { updateForm({ patient: e.target.value }); setShowNameDrop(true); setNameHiIdx(-1); }}
                  onKeyDown={e => {
                    if (!showNameDrop || !nameSuggestions.length) return;
                    if (e.key === "ArrowDown")  { e.preventDefault(); setNameHiIdx(i => Math.min(i + 1, nameSuggestions.length - 1)); }
                    else if (e.key === "ArrowUp")  { e.preventDefault(); setNameHiIdx(i => Math.max(i - 1, 0)); }
                    else if (e.key === "Enter" && nameHiIdx >= 0) { e.preventDefault(); updateForm({ patient: nameSuggestions[nameHiIdx] }); setShowNameDrop(false); setNameHiIdx(-1); }
                    else if (e.key === "Escape") { setShowNameDrop(false); setNameHiIdx(-1); }
                  }}
                />
                {form.patient && (
                  <button onPointerDown={e => { e.preventDefault(); updateForm({ patient: "" }); setShowNameDrop(true); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {showNameDrop && nameSuggestions.length > 0 && (
                  <div ref={nameDropRef} className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                    <p className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border bg-muted/50">
                      {form.patient.trim() ? "Matching patients" : "Suggested patients"}
                    </p>
                    {nameSuggestions.map((name, i) => (
                      <button key={name}
                        onPointerDown={e => { e.preventDefault(); updateForm({ patient: name }); setShowNameDrop(false); setNameHiIdx(-1); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                          i === nameHiIdx ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                        }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === nameHiIdx ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {name.split(" ").map(p => p[0]).join("").slice(0, 2)}
                        </div>
                        <Highlight text={name} query={form.patient} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input type="date" className={`${inputBase} ${fieldClass("dob")}`}
                value={form.dob} onChange={e => updateForm({ dob: e.target.value })} />
            </div>

            {/* Insurance ID + Payer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Insurance Member ID <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <input className={`${inputBase} ${fieldClass("insuranceId")}`}
                  placeholder="e.g., BCB-4821039"
                  value={form.insuranceId}
                  onChange={e => updateForm({ insuranceId: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Payer <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <select className={`${inputBase} border-border bg-background`}
                  value={payer} onChange={e => setPayer(e.target.value)}>
                  {PAYERS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Billed Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Billed Amount ($) <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </label>
              <input type="number" min="0" step="0.01"
                className={`${inputBase} border-border bg-background`}
                placeholder="e.g., 145.00" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>

            {/* CPT + ICD-10 typeahead */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  CPT Code <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <CodeTypeahead
                  value={form.cpt}
                  onTextChange={v => updateForm({ cpt: v })}
                  onSelect={code => updateForm({ cpt: code })}
                  placeholder={`${specialty.label} codes…`}
                  codeMap={cptMap}
                  inputClassName={`${inputBase} ${fieldClass("cpt")}`}
                  showAllToggle
                  showingAll={showAllCpt}
                  onToggleAll={() => setShowAllCpt(v => !v)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ICD-10 Code <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <CodeTypeahead
                  value={form.icd10}
                  onTextChange={v => updateForm({ icd10: v })}
                  onSelect={code => updateForm({ icd10: code })}
                  placeholder={`${specialty.label} diagnoses…`}
                  codeMap={icdMap}
                  inputClassName={`${inputBase} ${fieldClass("icd10")}`}
                  showAllToggle
                  showingAll={showAllIcd}
                  onToggleAll={() => setShowAllIcd(v => !v)}
                />
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
                    Live check:{" "}
                    {liveCompat.issues.length > 0
                      ? `${liveCompat.issues.length} compatibility issue${liveCompat.issues.length > 1 ? "s" : ""} detected`
                      : "CPT + ICD-10 look compatible"}
                  </span>
                </div>
                <p className="text-muted-foreground mb-1.5">
                  <span className="font-mono font-semibold">{form.cpt}</span> {liveCompat.cptDesc}
                  &nbsp;/&nbsp;
                  <span className="font-mono font-semibold">{form.icd10.toUpperCase()}</span> {liveCompat.icdDesc}
                </p>
                {liveCompat.issues.map((issue, i) => (
                  <p key={i} className="text-red-700 flex items-start gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />{issue}
                  </p>
                ))}
                {liveCompat.issues.length === 0 && (
                  <p className="text-emerald-700">No known coding conflicts — click Scrub Claim for full validation.</p>
                )}
              </div>
            )}

            {/* Scenario examples */}
            <div className="rounded-lg bg-muted border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Load a known scenario:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map(ex => (
                  <button key={ex.label}
                    onClick={() => updateForm({ cpt: ex.cpt, icd10: ex.icd10 })}
                    className={`text-xs border rounded-md px-2.5 py-1.5 transition-colors flex items-center gap-1.5 ${
                      ex.tag === "error"
                        ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    }`}>
                    {ex.tag === "error" ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button onClick={handleScrub} disabled={isScrubbing}
                className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background hover:opacity-90 disabled:opacity-50 rounded-xl py-3 text-sm font-semibold transition-all">
                {isScrubbing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Scrubbing…</>
                  : <><Sparkles className="w-4 h-4" /> Scrub Claim</>}
              </button>
              {scrubResult !== null && (
                <button onClick={handleSubmit} disabled={hasErrors}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                    hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}>
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
                  ? "Live check running — click Scrub Claim for full validation."
                  : "Click Scrub Claim at any time to see step-by-step guidance."}
              </p>
              <div className={`mt-4 rounded-lg ${sc.bg} ${sc.border} border px-3 py-2 text-left`}>
                <p className={`text-xs font-semibold ${sc.text} mb-1`}>{specialty.label} rules active</p>
                <p className={`text-xs ${sc.text} opacity-80`}>{specialty.checks[0]}</p>
              </div>
            </div>
          )}

          {isScrubbing && (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-sm font-medium text-foreground">Analyzing claim…</p>
              <p className="text-xs text-muted-foreground mt-1">
                Applying {specialty.label} rules + reference library checks.
              </p>
            </div>
          )}

          {scrubResult !== null && !isScrubbing && (
            <>
              <div className={`rounded-xl border p-4 flex items-start gap-3 ${
                isClean ? "bg-emerald-50 border-emerald-200"
                : hasErrors ? "bg-red-50 border-red-200"
                : hasWarnings ? "bg-amber-50 border-amber-200"
                : "bg-blue-50 border-blue-200"
              }`}>
                {isClean
                  ? <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  : hasErrors ? <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  : hasWarnings ? <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  : <Lightbulb className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-sm font-bold ${
                    isClean ? "text-emerald-800" : hasErrors ? "text-red-800"
                    : hasWarnings ? "text-amber-800" : "text-blue-800"
                  }`}>
                    {isClean
                      ? "Claim is Clean — ready to submit!"
                      : hasErrors
                        ? `${errors.length} error${errors.length !== 1 ? "s" : ""}${warnings.length ? `, ${warnings.length} warning${warnings.length !== 1 ? "s" : ""}` : ""}${infos.length ? `, ${infos.length} suggestion${infos.length !== 1 ? "s" : ""}` : ""}`
                        : hasWarnings
                          ? `${warnings.length} warning${warnings.length !== 1 ? "s" : ""}${infos.length ? `, ${infos.length} suggestion${infos.length !== 1 ? "s" : ""}` : ""} — no critical errors`
                          : `${infos.length} suggestion${infos.length !== 1 ? "s" : ""} — add more details for deeper checks`}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    isClean ? "text-emerald-700" : hasErrors ? "text-red-700"
                    : hasWarnings ? "text-amber-700" : "text-blue-700"
                  }`}>
                    {isClean
                      ? "All provided fields validated. No billing conflicts detected."
                      : hasErrors ? "Fix red errors before submitting."
                      : hasWarnings ? "No blocking errors — review warnings then submit."
                      : "Fill in more fields and scrub again to unlock more checks."}
                  </p>
                </div>
              </div>

              {errors.map((e, i) => <ScrubCard key={`e${i}`} error={e} />)}

              {warnings.length > 0 && errors.length > 0 && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1 px-1">Warnings</p>
              )}
              {warnings.map((e, i) => <ScrubCard key={`w${i}`} error={e} />)}

              {infos.length > 0 && (errors.length > 0 || warnings.length > 0) && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1 px-1">Suggestions</p>
              )}
              {infos.map((e, i) => <ScrubCard key={`i${i}`} error={e} />)}

              {isClean && infos.length === 0 && (
                <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">All Checks Passed</p>
                  {[
                    "Patient name validated",
                    "Date of birth confirmed",
                    ...(form.cpt && CPT_CODES[form.cpt.trim()] ? [`CPT ${form.cpt} — ${CPT_CODES[form.cpt.trim()].description}`] : []),
                    ...(form.icd10 && ICD10_CODES[form.icd10.trim().toUpperCase()] ? [`ICD-10 ${form.icd10.toUpperCase()} — ${ICD10_CODES[form.icd10.trim().toUpperCase()].description}`] : []),
                    ...(form.cpt && form.icd10 && CPT_CODES[form.cpt.trim()] && ICD10_CODES[form.icd10.trim().toUpperCase()] ? ["No CPT/ICD-10 compatibility conflicts"] : []),
                    "No modifier requirement flagged",
                  ].map(c => (
                    <div key={c} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
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
