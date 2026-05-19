import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, ChevronDown, ChevronRight, Bot, Lightbulb, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

// ─── Response library ─────────────────────────────────────────────────────────

interface AIResponse {
  keywords: string[];
  message:  string;
  type:     "info" | "warning" | "success" | "tip";
}

const RESPONSE_LIBRARY: AIResponse[] = [
  {
    keywords: ["modifier", "-25", "25", "same day", "procedure", "e&m"],
    type: "warning",
    message: "Modifier -25 is required when an E/M service (e.g., 99213) is billed on the same day as a minor procedure (e.g., 17110 wart removal). The modifier certifies that a 'significant, separately identifiable' E/M service was performed. Without it, Medicare and most commercial payers bundle the E/M into the procedure payment. Document the distinct clinical decision-making in the encounter note.",
  },
  {
    keywords: ["no-fault", "no fault", "pip", "nf", "mvA", "motor vehicle", "accident"],
    type: "warning",
    message: "New York No-Fault (Insurance Law §5106) requires medical bills to be submitted within 30 calendar days of the date of service. This deadline is absolute — there are no waivers, extensions, or appeal paths for late-filed no-fault bills. Best practice: set an internal billing SLA of 25 days to account for processing delays. The fee schedule is set by the NY DFS Workers' Compensation Medical Fee Schedule.",
  },
  {
    keywords: ["authorization", "auth", "prior auth", "preauth", "units"],
    type: "warning",
    message: "Prior authorization defines the maximum units or visits approved for payment. Rendering services beyond the authorized limit results in a CO-197 denial (precertification/authorization absent). Request a Continuation of Care (COC) authorization when 75% of authorized visits are used. Most payers require 48–72 hours for COC decisions — never wait until the last authorized visit.",
  },
  {
    keywords: ["behavioral health", "therapy", "90837", "90834", "psychotherapy", "mental health"],
    type: "info",
    message: "CPT 90837 (60-min psychotherapy) and 90834 (45-min) require a DSM-5 qualifying mental health diagnosis in the ICD-10 F01–F99 range. Submitting with a physical medicine diagnosis (e.g., J06.9 URI, M54.5 back pain) will trigger a CO-11 denial. Also verify whether the patient's behavioral health benefits are carved out to a separate managed behavioral health organization (MBHO) — a common reason for claim rejections.",
  },
  {
    keywords: ["orthopedic", "surgery", "rotator", "shoulder", "knee", "arthroscopy", "29827"],
    type: "warning",
    message: "Surgical CPT codes must be paired with an anatomically consistent ICD-10 code. CPT 29827 (rotator cuff repair) requires a shoulder diagnosis (M75.xxx, S46.xxx) — not a knee diagnosis (M17.xxx). Payers use automated edits to detect site mismatches and auto-deny. For high-cost surgeries, always verify that the pre-operative diagnosis matches the procedure code before submission.",
  },
  {
    keywords: ["preventive", "wellness", "annual", "99396", "z00", "z code"],
    type: "info",
    message: "ACA-mandated preventive visits (CPT 99381–99397) require a Z00.xx code as the primary ICD-10 to preserve $0 patient cost-sharing under §2713. Using a chronic disease code (e.g., E11.9, I10) as primary converts the visit to a sick visit and triggers a payer downcode to an E/M code. Chronic conditions being managed at the visit should be listed as secondary diagnoses.",
  },
  {
    keywords: ["medicare", "cms", "ncci", "bundling", "bundle"],
    type: "info",
    message: "Medicare's National Correct Coding Initiative (NCCI) contains over 235,000 code pairs that are automatically bundled during adjudication. Unbundling — billing both components of a bundled pair — results in denial. Modifier -59 (distinct procedural service) can override some NCCI edits, but it must be supported by documentation showing a separate service, patient encounter, or anatomical site.",
  },
  {
    keywords: ["icd-10", "icd10", "diagnosis", "dx code", "specificity"],
    type: "tip",
    message: "ICD-10-CM codes should reflect the highest level of specificity supported by the medical record. Unspecified codes (those ending in .9 or .X) increase audit risk and may trigger requests for additional documentation. For injury codes, use the 7th character extension: A (initial encounter), D (subsequent), S (sequela). Specificity also affects MS-DRG grouping and case-mix index for inpatient claims.",
  },
  {
    keywords: ["workers comp", "workers compensation", "wc", "work injury"],
    type: "info",
    message: "Workers' compensation claims require specific accident documentation: date of injury, employer name, employer address, claim number, and adjuster contact. The bill form may differ by state (e.g., CMS-1500 vs. state-specific forms). Fee schedules vary by state — never submit workers' comp claims using standard charge master rates. Most states require submission within 45–90 days of service.",
  },
  {
    keywords: ["denial", "co-11", "co11", "diagnosis inconsistent"],
    type: "warning",
    message: "CO-11 (diagnosis inconsistent with procedure) is one of the most common denial codes. The payer's editing system detected a mismatch between the CPT procedure code and the ICD-10 diagnosis code. Common causes: (1) anatomic site mismatch, (2) procedure requires a different diagnosis category, (3) specialty mismatch. Resolution: review NCCI edits for the CPT code and verify ICD-10 code category requirements.",
  },
  {
    keywords: ["co-29", "co29", "timely filing", "time limit", "deadline"],
    type: "warning",
    message: "CO-29 (time limit for filing expired) indicates the claim was received after the payer's timely filing deadline. Most commercial payers require submission within 90–365 days of service. Medicare requires 12 months (1 calendar year) from the date of service. No-fault payers (NY) require 30 days. Prevention: configure practice management system alerts for claims approaching the timely filing deadline.",
  },
  {
    keywords: ["er", "emergency", "urgent care", "99283", "99281", "99284", "ed visit"],
    type: "info",
    message: "ED visit coding (99281–99285) is based on medical decision-making complexity and resources required. The presenting problem severity must align with the E/M level billed. For No-Fault (NY/FL PIP) patients, document the mechanism of injury, clinical findings, and all tests ordered. Independent Medical Examinations (IMEs) are common for MVA-related ED claims — thorough documentation is critical.",
  },
  {
    keywords: ["physical therapy", "pt", "ot", "97110", "97530", "occupational therapy"],
    type: "tip",
    message: "Physical and occupational therapy claims require: (1) a valid order/referral from the treating physician, (2) an authorization number on file before service, and (3) objective functional outcome measures in the clinical note. Track visit counts against the authorization limit in real time — services rendered beyond the authorized limit will not be paid and cannot be billed to the patient without ABN (Medicare) or equivalent notice.",
  },
  {
    keywords: ["appeal", "dispute", "redetermination", "reconsideration"],
    type: "tip",
    message: "For Medicare: Level 1 appeal (Redetermination) must be filed within 120 days of the MAC denial. For commercial payers: internal appeal typically required within 90–180 days of denial. Strengthen appeals with: (1) medical necessity statement from the treating provider, (2) clinical literature supporting the service, (3) prior auth documentation if applicable. Resubmission with a corrected code is faster than appeal when the error is a coding mistake.",
  },
  {
    keywords: ["documentation", "medical necessity", "note", "record"],
    type: "tip",
    message: "Medical necessity is the payer's primary criterion for payment. For every claim, the medical record must contain: (1) a chief complaint or reason for visit, (2) relevant history and physical examination, (3) assessment/diagnosis, and (4) a treatment plan. For E/M services, documentation must support the billed level under either the 1995, 1997, or (post-2021) Medical Decision-Making guidelines.",
  },
  {
    keywords: ["score", "health score", "risk", "denial risk"],
    type: "info",
    message: "The Claim Health Score (0–100) reflects the overall quality and payability of the claim. Scores above 85 indicate low denial risk. Scores below 65 suggest significant rework is needed before submission. The score accounts for CPT/ICD compatibility, modifier accuracy, payer-specific rules, specialty requirements, and documentation completeness indicators. Submitting claims with scores below 65 significantly increases denial rates.",
  },
];

const PROACTIVE_TIPS = [
  "Modifier -25 is required when E/M and procedure codes are billed on the same date of service.",
  "NY No-Fault bills must reach the insurer within 30 calendar days — no exceptions.",
  "Behavioral health CPT codes require a DSM-5 F-code as the primary diagnosis.",
  "Preventive visit codes (99381–99397) require Z00.xx as primary ICD-10 — not chronic disease codes.",
  "Verify prior authorization before rendering PT/OT services beyond the first authorized episode.",
  "Surgical CPT codes must be anatomically consistent with the ICD-10 diagnosis site.",
  "CO-11 denials (diagnosis inconsistent) are preventable with pre-submission CPT/ICD compatibility checks.",
  "Medicare NCCI edits bundle E/M into same-day minor procedures without Modifier -25.",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id:     string;
  role:   "user" | "ai";
  text:   string;
  type?:  "info" | "warning" | "success" | "tip";
  ts:     string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findResponse(input: string): AIResponse {
  const lower = input.toLowerCase();
  const match = RESPONSE_LIBRARY.find(r => r.keywords.some(k => lower.includes(k)));
  return match ?? {
    type: "info",
    keywords: [],
    message: "That's a great billing question. In general, always ensure your CPT and ICD-10 codes are clinically consistent, your modifiers are applied correctly, and your prior authorizations are in place before submission. If you have a specific denial code or payer rule you'd like me to explain, ask about the denial code (e.g., 'CO-11') or the clinical scenario (e.g., 'behavioral health modifier').",
  };
}

function getTypeIcon(type: AIResponse["type"]) {
  switch (type) {
    case "warning": return AlertTriangle;
    case "success": return CheckCircle2;
    case "tip":     return Lightbulb;
    default:        return Info;
  }
}

function getTypeStyle(type: AIResponse["type"]) {
  switch (type) {
    case "warning": return "text-amber-600";
    case "success": return "text-emerald-600";
    case "tip":     return "text-violet-600";
    default:        return "text-blue-600";
  }
}

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AIAssistant() {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const inputRef  = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  // Rotate proactive tip every 8s when closed
  useEffect(() => {
    if (open) return;
    const t = setInterval(() => setTipIndex(i => (i + 1) % PROACTIVE_TIPS.length), 8000);
    return () => clearInterval(t);
  }, [open]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || thinking) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: trimmed, ts: nowTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const res = findResponse(trimmed);
      const aiMsg: Message = {
        id:   (Date.now() + 1).toString(),
        role: "ai",
        text: res.message,
        type: res.type,
        ts:   nowTime(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setThinking(false);
    }, 1100);
  }

  function handleQuickAsk(q: string) {
    setInput(q);
    setTimeout(() => handleSend(), 50);
  }

  const QUICK_QUESTIONS = [
    "When is Modifier -25 required?",
    "What is the NY No-Fault 30-day rule?",
    "How do I fix a CO-11 denial?",
    "What ICD-10 codes work with psychotherapy?",
  ];

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {/* Tip bubble */}
        {!open && (
          <div className="max-w-[220px] bg-card border border-border shadow-lg rounded-xl px-3 py-2 text-[11px] text-muted-foreground leading-snug animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-violet-600 font-semibold">AI Tip: </span>
            {PROACTIVE_TIPS[tipIndex]}
          </div>
        )}
        <button
          onClick={() => setOpen(o => !o)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
            open
              ? "bg-muted text-muted-foreground hover:bg-muted/80"
              : "bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:scale-105 shadow-violet-200"
          }`}
        >
          {open ? <ChevronDown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </button>
      </div>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">ClaimFlow AI</p>
              <p className="text-[10px] text-white/70">Revenue cycle assistant · All responses simulated</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="space-y-3">
                {/* Welcome */}
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-violet-600" />
                  </div>
                  <div className="flex-1 bg-muted/40 rounded-xl rounded-tl-sm px-3 py-2.5">
                    <p className="text-xs text-foreground leading-relaxed">
                      Hi! I'm the ClaimFlow AI Assistant. Ask me about denial codes, modifier rules, payer-specific policies, CPT/ICD-10 compatibility, or anything about your revenue cycle.
                    </p>
                  </div>
                </div>

                {/* Quick questions */}
                <div className="space-y-1.5 pl-8">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Try asking:</p>
                  {QUICK_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); setTimeout(handleSend, 50); }}
                      className="w-full text-left text-xs text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 transition-colors flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3 shrink-0" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => {
              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[80%] bg-primary text-primary-foreground rounded-xl rounded-tr-sm px-3 py-2">
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                      <p className="text-[9px] text-primary-foreground/60 text-right mt-1">{msg.ts}</p>
                    </div>
                  </div>
                );
              }

              const TypeIcon = msg.type ? getTypeIcon(msg.type) : Info;
              const typeColor = msg.type ? getTypeStyle(msg.type) : "text-blue-600";

              return (
                <div key={msg.id} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                    <TypeIcon className={`w-3 h-3 ${typeColor}`} />
                  </div>
                  <div className="flex-1 bg-muted/40 rounded-xl rounded-tl-sm px-3 py-2.5">
                    <p className="text-xs text-foreground leading-relaxed">{msg.text}</p>
                    <p className="text-[9px] text-muted-foreground mt-1.5">{msg.ts}</p>
                  </div>
                </div>
              );
            })}

            {thinking && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-violet-600" />
                </div>
                <div className="bg-muted/40 rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          {messages.length > 0 && (
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap shrink-0">
              {["CO-11 denial", "timely filing", "prior auth"].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); setTimeout(handleSend, 50); }}
                  className="text-[10px] bg-muted hover:bg-muted/70 text-muted-foreground px-2.5 py-1 rounded-full border border-border transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 shrink-0 border-t border-border pt-2.5">
            <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Ask about modifiers, denials, payer rules..."
                className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || thinking}
                className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-all shrink-0"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
